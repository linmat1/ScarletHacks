import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import Anthropic from '@anthropic-ai/sdk';
import { analyzeTransactions } from './analysis.js';

const app = express();
app.use(cors());
app.use(express.json());

// --- Plaid client ---
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});
const plaid = new PlaidApi(plaidConfig);

// --- Anthropic client ---
const anthropic = new Anthropic();

// In-memory store (hackathon scope — no DB)
const store = {};

// ============================================================
// POST /api/plaid/create-link-token
// ============================================================
app.post('/api/plaid/create-link-token', async (req, res) => {
  try {
    const response = await plaid.linkTokenCreate({
      user: { client_user_id: 'blindspot-user-1' },
      client_name: 'Blind Spot',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });
    res.json({ link_token: response.data.link_token });
  } catch (err) {
    console.error('Link token error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to create link token' });
  }
});

// ============================================================
// POST /api/plaid/exchange-token
// ============================================================
app.post('/api/plaid/exchange-token', async (req, res) => {
  try {
    const { public_token } = req.body;
    const response = await plaid.itemPublicTokenExchange({ public_token });
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    store[itemId] = { accessToken };
    res.json({ item_id: itemId });
  } catch (err) {
    console.error('Token exchange error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

// ============================================================
// POST /api/plaid/transactions
// Fetches up to 12 months of transactions
// ============================================================
app.post('/api/plaid/transactions', async (req, res) => {
  try {
    const { item_id } = req.body;
    const item = store[item_id];
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const now = new Date();
    const startDate = new Date(now);
    startDate.setFullYear(startDate.getFullYear() - 1);

    const format = (d) => d.toISOString().split('T')[0];

    let allTransactions = [];
    let totalTransactions = 0;
    let offset = 0;

    // Paginate through all transactions
    do {
      const response = await plaid.transactionsGet({
        access_token: item.accessToken,
        start_date: format(startDate),
        end_date: format(now),
        options: { count: 500, offset },
      });

      allTransactions = allTransactions.concat(response.data.transactions);
      totalTransactions = response.data.total_transactions;
      offset = allTransactions.length;
    } while (allTransactions.length < totalTransactions);

    // Also get account info for institution name
    const acctResponse = await plaid.accountsGet({ access_token: item.accessToken });
    const accounts = acctResponse.data.accounts;

    // Store transactions for later analysis
    item.transactions = allTransactions;
    item.accounts = accounts;

    res.json({
      transaction_count: allTransactions.length,
      accounts: accounts.map((a) => ({
        name: a.name,
        mask: a.mask,
        type: a.type,
        subtype: a.subtype,
      })),
    });
  } catch (err) {
    console.error('Transactions error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ============================================================
// POST /api/analyze
// Runs 3 detection engines + Claude narrative generation
// ============================================================
app.post('/api/analyze', async (req, res) => {
  try {
    const { item_id } = req.body;
    const item = store[item_id];
    if (!item?.transactions) return res.status(404).json({ error: 'No transactions found' });

    // Run the 3 analysis engines
    const analysis = analyzeTransactions(item.transactions);

    // Generate AI narratives for each insight
    const insights = await generateInsightNarratives(anthropic, analysis);

    // Build spending chart data
    const spendingData = buildSpendingData(item.transactions);

    // Build danger calendar for current month
    const dangerCalendar = buildDangerCalendar(item.transactions);

    res.json({ insights, spendingData, dangerCalendar });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// ============================================================
// POST /api/chat
// Follow-up questions powered by Claude
// ============================================================
app.post('/api/chat', async (req, res) => {
  try {
    const { item_id, question, insights } = req.body;
    const item = store[item_id];

    const insightSummary = insights
      ?.map((i) => `- ${i.title}: $${i.amount}/mo — ${i.description}`)
      .join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system:
        'You are a personal finance coach inside the Blind Spot app. Be direct, warm, and non-judgmental. Use **bold** for key numbers. Keep answers under 80 words. Base answers on the user\'s actual financial data provided.',
      messages: [
        {
          role: 'user',
          content: `Here are the user's financial blind spots:\n${insightSummary}\n\nUser question: ${question}`,
        },
      ],
    });

    res.json({ answer: response.content[0].text });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Chat failed' });
  }
});

// ============================================================
// Helpers
// ============================================================

async function generateInsightNarratives(client, analysis) {
  const rawInsights = [
    ...analysis.subscriptions.map((s) => ({
      id: `sub-${s.name.replace(/\s/g, '-').toLowerCase()}`,
      type: 'subscription',
      title: s.name,
      amount: s.amount,
      annualized: Math.round(s.amount * 12),
      severity: s.amount >= 30 ? 'high' : 'medium',
      rawData: s,
    })),
    ...analysis.drifts.map((d) => ({
      id: `drift-${d.category.replace(/\s/g, '-').toLowerCase()}`,
      type: 'drift',
      title: `${d.category} Drift`,
      amount: d.monthlyIncrease,
      annualized: d.monthlyIncrease * 12,
      severity: d.pctChange >= 30 ? 'high' : 'medium',
      rawData: d,
    })),
    ...analysis.dangerPeriods.map((dp) => ({
      id: `danger-${dp.pattern.replace(/\s/g, '-').toLowerCase()}`,
      type: 'danger',
      title: dp.label,
      amount: dp.excessSpend,
      annualized: dp.excessSpend * 12,
      severity: dp.multiplier >= 1.8 ? 'high' : 'medium',
      rawData: dp,
    })),
  ];

  // Sort by amount descending, take top 10
  rawInsights.sort((a, b) => b.amount - a.amount);
  const topInsights = rawInsights.slice(0, 10);

  // Batch generate narratives with Claude
  const prompt = topInsights
    .map(
      (ins, i) =>
        `Insight ${i + 1} (${ins.type}): ${JSON.stringify(ins.rawData)}`
    )
    .join('\n\n');

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system:
        'You are a personal finance coach. For each insight below, write exactly TWO fields:\n1. "description": A 2-sentence plain-English explanation of the issue and dollar impact.\n2. "action": A specific, actionable next step.\n\nBe direct but non-judgmental. No jargon. Max 60 words per field.\n\nReturn valid JSON array: [{"index": 0, "description": "...", "action": "..."}, ...]',
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const narratives = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return topInsights.map((ins, i) => {
      const narrative = narratives.find((n) => n.index === i) || {};
      return {
        id: ins.id,
        type: ins.type,
        title: ins.title,
        amount: Math.round(ins.amount),
        annualized: Math.round(ins.annualized),
        severity: ins.severity,
        status: 'active',
        description: narrative.description || `${ins.title}: $${Math.round(ins.amount)}/mo detected.`,
        action: narrative.action || 'Review this spending pattern and consider adjustments.',
      };
    });
  } catch (err) {
    console.error('Narrative generation error:', err);
    // Fall back to basic descriptions
    return topInsights.map((ins) => ({
      id: ins.id,
      type: ins.type,
      title: ins.title,
      amount: Math.round(ins.amount),
      annualized: Math.round(ins.annualized),
      severity: ins.severity,
      status: 'active',
      description: `${ins.title}: $${Math.round(ins.amount)}/mo detected in your spending.`,
      action: 'Review this spending pattern and consider adjustments.',
    }));
  }
}

function buildSpendingData(transactions) {
  const monthlyCategories = {};

  for (const tx of transactions) {
    if (tx.amount <= 0) continue;
    const month = tx.date.substring(0, 7);
    const cat = tx.personal_finance_category?.primary || tx.category?.[0] || 'OTHER';

    if (!monthlyCategories[month]) monthlyCategories[month] = {};
    if (!monthlyCategories[month][cat]) monthlyCategories[month][cat] = 0;
    monthlyCategories[month][cat] += tx.amount;
  }

  const months = Object.keys(monthlyCategories).sort();

  // Find top 4 categories by total spend
  const categoryTotals = {};
  for (const month of months) {
    for (const [cat, amount] of Object.entries(monthlyCategories[month])) {
      if (!categoryTotals[cat]) categoryTotals[cat] = 0;
      categoryTotals[cat] += amount;
    }
  }
  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([cat]) => cat);

  return months.map((month) => {
    const data = { month: formatMonth(month) };
    for (const cat of topCategories) {
      data[cat] = Math.round(monthlyCategories[month][cat] || 0);
    }
    return data;
  });
}

function buildDangerCalendar(transactions) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  // Calculate historical daily averages by day-of-month
  const domSpend = {};
  for (const tx of transactions) {
    if (tx.amount <= 0) continue;
    const d = new Date(tx.date);
    const dom = d.getDate();
    if (!domSpend[dom]) domSpend[dom] = [];
    domSpend[dom].push(tx.amount);
  }

  const overallAvg =
    Object.values(domSpend)
      .flat()
      .reduce((a, b) => a + b, 0) /
    Object.values(domSpend).flat().length;

  // Get current month actual spending
  const currentMonthSpend = {};
  for (const tx of transactions) {
    if (tx.amount <= 0) continue;
    const d = new Date(tx.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dom = d.getDate();
      if (!currentMonthSpend[dom]) currentMonthSpend[dom] = 0;
      currentMonthSpend[dom] += tx.amount;
    }
  }

  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    const isFuture = d > today;

    const historicalAvg = domSpend[d]
      ? domSpend[d].reduce((a, b) => a + b, 0) / domSpend[d].length
      : overallAvg;

    const amount = isFuture ? 0 : Math.round(currentMonthSpend[d] || 0);
    const score = Math.min(1, historicalAvg / (overallAvg * 2));

    days.push({
      day: d,
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      dow,
      amount,
      score: Math.round(score * 100) / 100,
      isToday: d === today,
      isFuture,
    });
  }

  return days;
}

function formatMonth(ym) {
  const [y, m] = ym.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m) - 1]} '${y.slice(2)}`;
}

// ============================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Blind Spot API running on http://localhost:${PORT}`);
});
