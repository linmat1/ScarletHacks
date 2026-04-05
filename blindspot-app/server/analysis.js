// ============================================================
// Three Detection Engines for Financial Blind Spots
// ============================================================

export function analyzeTransactions(transactions) {
  return {
    subscriptions: detectSubscriptions(transactions),
    drifts: detectDrift(transactions),
    dangerPeriods: detectDangerPeriods(transactions),
  };
}

// ============================================================
// Engine 1: Subscription Scanner
// Finds recurring charges that appear monthly with consistent amounts
// ============================================================
function detectSubscriptions(transactions) {
  // Only look at debits (positive amounts in Plaid = money out)
  const debits = transactions.filter((tx) => tx.amount > 0);

  // Group by normalized merchant name
  const groups = {};
  for (const tx of debits) {
    const name = normalizeName(tx.merchant_name || tx.name);
    if (!groups[name]) groups[name] = [];
    groups[name].push(tx);
  }

  const subscriptions = [];

  for (const [name, txs] of Object.entries(groups)) {
    if (txs.length < 2) continue;

    // Check for consistent amounts (within 20% of median)
    const amounts = txs.map((t) => t.amount).sort((a, b) => a - b);
    const median = amounts[Math.floor(amounts.length / 2)];
    const consistent = amounts.filter((a) => Math.abs(a - median) / median < 0.2);

    if (consistent.length < 2) continue;
    if (median < 3) continue; // Skip very small charges

    // Check for regular intervals (~monthly: 25-35 day gaps)
    const dates = txs.map((t) => new Date(t.date)).sort((a, b) => a - b);
    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
      intervals.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
    }

    if (intervals.length === 0) continue;
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Accept monthly (25-35 days), weekly (5-9), or annual (340-400)
    const isRecurring =
      (avgInterval >= 25 && avgInterval <= 35) ||
      (avgInterval >= 5 && avgInterval <= 9) ||
      (avgInterval >= 340 && avgInterval <= 400);

    if (!isRecurring) continue;

    const lastCharge = dates[dates.length - 1];
    const daysSince = Math.round(
      (Date.now() - lastCharge.getTime()) / (1000 * 60 * 60 * 24)
    );

    const amount = Math.round(median * 100) / 100;
    const category =
      txs[0].personal_finance_category?.primary ||
      txs[0].category?.[0] ||
      'Unknown';

    subscriptions.push({
      name: prettifyName(name),
      amount,
      frequency: avgInterval < 10 ? 'weekly' : avgInterval < 40 ? 'monthly' : 'annual',
      lastChargeDate: lastCharge.toISOString().split('T')[0],
      daysSinceLastCharge: daysSince,
      chargeCount: txs.length,
      category,
    });
  }

  // Sort by amount descending
  return subscriptions.sort((a, b) => b.amount - a.amount);
}

// ============================================================
// Engine 2: Drift Detector
// Compares recent spending vs baseline by category
// ============================================================
function detectDrift(transactions) {
  const debits = transactions.filter((tx) => tx.amount > 0);

  // Group by category and month
  const catMonths = {};
  for (const tx of debits) {
    const cat =
      tx.personal_finance_category?.primary || tx.category?.[0] || 'OTHER';
    const month = tx.date.substring(0, 7);

    if (!catMonths[cat]) catMonths[cat] = {};
    if (!catMonths[cat][month]) catMonths[cat][month] = 0;
    catMonths[cat][month] += tx.amount;
  }

  const drifts = [];

  for (const [category, months] of Object.entries(catMonths)) {
    const sortedMonths = Object.keys(months).sort();
    if (sortedMonths.length < 4) continue;

    // Baseline: earliest 3 months
    const baselineMonths = sortedMonths.slice(0, 3);
    const baseline =
      baselineMonths.reduce((sum, m) => sum + months[m], 0) /
      baselineMonths.length;

    // Recent: latest 3 months
    const recentMonths = sortedMonths.slice(-3);
    const recent =
      recentMonths.reduce((sum, m) => sum + months[m], 0) /
      recentMonths.length;

    if (baseline < 20) continue; // Skip tiny categories

    const pctChange = ((recent - baseline) / baseline) * 100;
    const monthlyIncrease = recent - baseline;

    if (pctChange > 15 && monthlyIncrease > 15) {
      drifts.push({
        category: prettifyCategory(category),
        baseline: Math.round(baseline),
        current: Math.round(recent),
        pctChange: Math.round(pctChange),
        monthlyIncrease: Math.round(monthlyIncrease),
        months: sortedMonths.length,
        monthlyData: sortedMonths.map((m) => ({
          month: m,
          amount: Math.round(months[m]),
        })),
      });
    }
  }

  return drifts.sort((a, b) => b.monthlyIncrease - a.monthlyIncrease);
}

// ============================================================
// Engine 3: Danger Period Predictor
// Finds cyclical overspending tied to paydays, weekends, etc.
// ============================================================
function detectDangerPeriods(transactions) {
  const debits = transactions.filter((tx) => tx.amount > 0);
  if (debits.length === 0) return [];

  // Calculate daily spend totals
  const dailySpend = {};
  for (const tx of debits) {
    if (!dailySpend[tx.date]) dailySpend[tx.date] = 0;
    dailySpend[tx.date] += tx.amount;
  }

  const dailyAmounts = Object.values(dailySpend);
  const avgDaily = dailyAmounts.reduce((a, b) => a + b, 0) / dailyAmounts.length;

  const dangers = [];

  // --- Check post-payday spikes ---
  // Detect payday by looking for recurring income (negative amounts in Plaid)
  const incomes = transactions.filter((tx) => tx.amount < 0 && Math.abs(tx.amount) > 500);
  const payDays = new Set();
  for (const tx of incomes) {
    const dom = new Date(tx.date).getDate();
    payDays.add(dom);
  }

  // Common paydays: 1st, 15th, last day of month
  const paydayDoms = payDays.size > 0 ? [...payDays] : [1, 15];

  // Check spending in the 3 days after each payday
  const postPaydaySpend = [];
  const nonPostPaydaySpend = [];

  for (const [date, amount] of Object.entries(dailySpend)) {
    const dom = new Date(date).getDate();
    const isPostPayday = paydayDoms.some(
      (pd) => dom >= pd && dom <= pd + 3
    );

    if (isPostPayday) {
      postPaydaySpend.push(amount);
    } else {
      nonPostPaydaySpend.push(amount);
    }
  }

  if (postPaydaySpend.length > 0 && nonPostPaydaySpend.length > 0) {
    const postAvg = postPaydaySpend.reduce((a, b) => a + b, 0) / postPaydaySpend.length;
    const normalAvg = nonPostPaydaySpend.reduce((a, b) => a + b, 0) / nonPostPaydaySpend.length;
    const multiplier = postAvg / normalAvg;

    if (multiplier > 1.3) {
      const excess = Math.round((postAvg - normalAvg) * paydayDoms.length * 3);
      dangers.push({
        pattern: 'post-payday',
        label: 'Post-Payday Spending Spike',
        multiplier: Math.round(multiplier * 10) / 10,
        excessSpend: Math.round(excess / 12), // monthly
        frequency: `${paydayDoms.join(' & ')} of each month`,
        avgDangerDay: Math.round(postAvg),
        avgNormalDay: Math.round(normalAvg),
      });
    }
  }

  // --- Check weekend vs weekday spending ---
  const weekendSpend = [];
  const weekdaySpend = [];

  for (const [date, amount] of Object.entries(dailySpend)) {
    const dow = new Date(date).getDay();
    if (dow === 0 || dow === 5 || dow === 6) {
      weekendSpend.push(amount);
    } else {
      weekdaySpend.push(amount);
    }
  }

  if (weekendSpend.length > 0 && weekdaySpend.length > 0) {
    const wkndAvg = weekendSpend.reduce((a, b) => a + b, 0) / weekendSpend.length;
    const wkdayAvg = weekdaySpend.reduce((a, b) => a + b, 0) / weekdaySpend.length;
    const multiplier = wkndAvg / wkdayAvg;

    if (multiplier > 1.3) {
      const weeklyExcess = (wkndAvg - wkdayAvg) * 3; // 3 weekend days
      dangers.push({
        pattern: 'weekend',
        label: 'Weekend Splurge Pattern',
        multiplier: Math.round(multiplier * 10) / 10,
        excessSpend: Math.round((weeklyExcess * 52) / 12), // monthly
        frequency: 'Fri-Sun',
        avgDangerDay: Math.round(wkndAvg),
        avgNormalDay: Math.round(wkdayAvg),
      });
    }
  }

  return dangers.sort((a, b) => b.excessSpend - a.excessSpend);
}

// ============================================================
// Utils
// ============================================================

function normalizeName(name) {
  if (!name) return 'unknown';
  return name
    .replace(/\s*(#|x+|\d{4,})\s*/gi, '') // strip card refs
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function prettifyName(name) {
  return name
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function prettifyCategory(cat) {
  return cat
    .replace(/_/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
