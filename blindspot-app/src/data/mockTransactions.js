// Realistic transaction generator for demo/sandbox mode

const SUBS = [
  { name: 'Netflix', amount: 15.99, day: 5, category: 'ENTERTAINMENT' },
  { name: 'Spotify', amount: 10.99, day: 1, category: 'ENTERTAINMENT' },
  { name: 'Adobe Creative Cloud', amount: 54.99, day: 12, category: 'GENERAL_SERVICES' },
  { name: 'ClassPass', amount: 49.0, day: 8, category: 'RECREATION' },
  { name: 'Headspace', amount: 12.99, day: 15, category: 'GENERAL_SERVICES' },
  { name: 'YouTube Premium', amount: 13.99, day: 22, category: 'ENTERTAINMENT' },
  { name: 'Planet Fitness', amount: 24.99, day: 1, category: 'RECREATION' },
  { name: 'Hulu', amount: 17.99, day: 18, category: 'ENTERTAINMENT' },
  { name: 'iCloud Storage', amount: 2.99, day: 10, category: 'GENERAL_SERVICES' },
  { name: 'ChatGPT Plus', amount: 20.0, day: 20, category: 'GENERAL_SERVICES' },
]

const FIXED = [
  { name: 'Rent - Avalon Apartments', amount: 1850, day: 1, category: 'RENT_AND_UTILITIES' },
  { name: 'Verizon Wireless', amount: 85, day: 14, category: 'RENT_AND_UTILITIES' },
  { name: 'Comcast Internet', amount: 65, day: 7, category: 'RENT_AND_UTILITIES' },
]

const VARIABLE = {
  FOOD_AND_DRINK: [
    { name: 'Chipotle', range: [10, 16] },
    { name: 'Starbucks', range: [4, 8] },
    { name: 'DoorDash', range: [18, 42] },
    { name: 'Sweetgreen', range: [13, 18] },
    { name: 'The Cheesecake Factory', range: [28, 55] },
    { name: 'Panera Bread', range: [9, 15] },
    { name: "Domino's Pizza", range: [12, 28] },
    { name: 'Shake Shack', range: [11, 19] },
  ],
  GROCERIES: [
    { name: 'Whole Foods Market', range: [35, 120] },
    { name: "Trader Joe's", range: [25, 75] },
    { name: 'Target', range: [20, 85] },
  ],
  TRANSPORTATION: [
    { name: 'Uber', range: [8, 32] },
    { name: 'Lyft', range: [10, 28] },
    { name: 'Shell Gas Station', range: [35, 58] },
  ],
  GENERAL_MERCHANDISE: [
    { name: 'Amazon', range: [8, 85] },
    { name: 'Apple Store', range: [15, 199] },
    { name: 'Nike', range: [40, 145] },
    { name: 'Uniqlo', range: [25, 80] },
    { name: 'Best Buy', range: [20, 250] },
  ],
  ENTERTAINMENT: [
    { name: 'AMC Theatres', range: [14, 26] },
    { name: 'Steam Games', range: [10, 60] },
    { name: 'Barnes & Noble', range: [12, 35] },
  ],
}

// How many variable transactions per category per month
const MONTHLY_FREQ = {
  FOOD_AND_DRINK: [8, 14],
  GROCERIES: [3, 5],
  TRANSPORTATION: [4, 8],
  GENERAL_MERCHANDISE: [2, 5],
  ENTERTAINMENT: [1, 3],
}

// Spending drift multiplier (increases over months)
function driftMultiplier(monthIndex, category) {
  const base = 1.0
  const drift = {
    FOOD_AND_DRINK: 0.035,
    TRANSPORTATION: 0.05,
    GENERAL_MERCHANDISE: 0.04,
    ENTERTAINMENT: 0.02,
    GROCERIES: 0.01,
  }
  return base + (drift[category] || 0) * monthIndex
}

function rand(min, max) {
  return min + Math.random() * (max - min)
}
function randInt(min, max) {
  return Math.floor(rand(min, max + 1))
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

let idCounter = 1

export function generateMockTransactions() {
  const transactions = []
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const currentDay = now.getDate()

  for (let offset = 11; offset >= 0; offset--) {
    const d = new Date(currentYear, currentMonth - offset, 1)
    const year = d.getFullYear()
    const month = d.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const isCurrentMonth = offset === 0
    const maxDay = isCurrentMonth ? currentDay : daysInMonth

    // --- Income (1st and 15th) ---
    for (const payDay of [1, 15]) {
      if (payDay <= maxDay) {
        transactions.push({
          id: `tx-${idCounter++}`,
          date: fmt(year, month, payDay),
          name: 'ACME Corp Payroll',
          merchant_name: 'ACME Corp',
          amount: -(3200 + randInt(0, 100)),
          category: 'INCOME',
        })
      }
    }

    // --- Fixed charges ---
    for (const f of FIXED) {
      const day = Math.min(f.day, maxDay)
      if (day <= maxDay) {
        const variance = f.name.includes('Edison') ? randInt(-15, 25) : 0
        transactions.push({
          id: `tx-${idCounter++}`,
          date: fmt(year, month, day),
          name: f.name,
          merchant_name: f.name,
          amount: f.amount + variance,
          category: f.category,
        })
      }
    }

    // Electric bill with variance
    const elecDay = Math.min(20, maxDay)
    if (elecDay <= maxDay) {
      transactions.push({
        id: `tx-${idCounter++}`,
        date: fmt(year, month, elecDay),
        name: 'Con Edison Electric',
        merchant_name: 'Con Edison',
        amount: randInt(72, 125),
        category: 'RENT_AND_UTILITIES',
      })
    }

    // --- Subscriptions ---
    for (const sub of SUBS) {
      const day = Math.min(sub.day, maxDay)
      if (day <= maxDay) {
        transactions.push({
          id: `tx-${idCounter++}`,
          date: fmt(year, month, day),
          name: sub.name,
          merchant_name: sub.name,
          amount: sub.amount,
          category: sub.category,
        })
      }
    }

    // --- Variable spending ---
    const monthIndex = 11 - offset
    for (const [category, merchants] of Object.entries(VARIABLE)) {
      const [minFreq, maxFreq] = MONTHLY_FREQ[category]
      const count = randInt(minFreq, maxFreq)
      const drift = driftMultiplier(monthIndex, category)

      for (let i = 0; i < count; i++) {
        const merchant = pick(merchants)
        const day = randInt(1, maxDay)
        const baseAmount = rand(merchant.range[0], merchant.range[1])
        const amount = Math.round(baseAmount * drift * 100) / 100

        // Post-payday boost (spend more on 1-3 and 15-17)
        const paydayBoost = (day >= 1 && day <= 3) || (day >= 15 && day <= 17) ? 1.3 : 1.0
        // Weekend boost
        const dow = new Date(year, month, day).getDay()
        const weekendBoost = dow === 0 || dow === 5 || dow === 6 ? 1.15 : 1.0

        transactions.push({
          id: `tx-${idCounter++}`,
          date: fmt(year, month, day),
          name: merchant.name,
          merchant_name: merchant.name,
          amount: Math.round(amount * paydayBoost * weekendBoost * 100) / 100,
          category,
        })
      }
    }
  }

  // Sort by date descending (newest first)
  transactions.sort((a, b) => (a.date > b.date ? -1 : 1))
  return transactions
}

function fmt(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

// Utility: detect subscriptions from transactions
export function detectSubscriptionsFromTransactions(transactions) {
  const debits = transactions.filter((t) => t.amount > 0)
  const groups = {}
  for (const tx of debits) {
    const key = tx.merchant_name || tx.name
    if (!groups[key]) groups[key] = []
    groups[key].push(tx)
  }

  const subs = []
  for (const [name, txs] of Object.entries(groups)) {
    if (txs.length < 2) continue
    const amounts = txs.map((t) => t.amount).sort((a, b) => a - b)
    const median = amounts[Math.floor(amounts.length / 2)]
    const consistent = amounts.filter((a) => Math.abs(a - median) / median < 0.15)
    if (consistent.length < 2 || median < 3) continue

    const dates = txs.map((t) => new Date(t.date)).sort((a, b) => a - b)
    const intervals = []
    for (let i = 1; i < dates.length; i++) {
      intervals.push((dates[i] - dates[i - 1]) / 86400000)
    }
    if (intervals.length === 0) continue
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    if (avgInterval < 25 || avgInterval > 35) continue

    const lastDate = dates[dates.length - 1]
    const daysSince = Math.round((Date.now() - lastDate.getTime()) / 86400000)

    subs.push({
      name,
      amount: Math.round(median * 100) / 100,
      frequency: 'monthly',
      lastChargeDate: lastDate.toISOString().split('T')[0],
      daysSinceLastCharge: daysSince,
      chargeCount: txs.length,
      category: txs[0].category,
      status: daysSince > 45 ? 'unused' : 'active',
    })
  }

  return subs.sort((a, b) => b.amount - a.amount)
}

// Utility: compute spending analytics
export function computeSpendingAnalytics(transactions) {
  const debits = transactions.filter((t) => t.amount > 0)
  const totalSpend = debits.reduce((s, t) => s + t.amount, 0)
  const dates = [...new Set(debits.map((t) => t.date))]
  const months = [...new Set(debits.map((t) => t.date.substring(0, 7)))]

  const avgDaily = totalSpend / (dates.length || 1)
  const avgMonthly = totalSpend / (months.length || 1)
  const avgWeekly = avgDaily * 7

  // Category breakdown
  const catTotals = {}
  for (const tx of debits) {
    catTotals[tx.category] = (catTotals[tx.category] || 0) + tx.amount
  }
  const categories = Object.entries(catTotals)
    .map(([name, total]) => ({ name: prettifyCat(name), value: Math.round(total) }))
    .sort((a, b) => b.value - a.value)

  // Top merchants
  const merchantTotals = {}
  for (const tx of debits) {
    const name = tx.merchant_name || tx.name
    if (!merchantTotals[name]) merchantTotals[name] = { total: 0, count: 0 }
    merchantTotals[name].total += tx.amount
    merchantTotals[name].count++
  }
  const topMerchants = Object.entries(merchantTotals)
    .map(([name, d]) => ({ name, total: Math.round(d.total), count: d.count, avg: Math.round(d.total / d.count) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // Day of week spending
  const dowTotals = [0, 0, 0, 0, 0, 0, 0]
  const dowCounts = [0, 0, 0, 0, 0, 0, 0]
  for (const tx of debits) {
    const dow = new Date(tx.date + 'T12:00:00').getDay()
    dowTotals[dow] += tx.amount
    dowCounts[dow]++
  }
  const dowLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayOfWeek = dowLabels.map((label, i) => ({
    day: label,
    avg: Math.round(dowCounts[i] ? dowTotals[i] / dowCounts[i] : 0),
    total: Math.round(dowTotals[i]),
  }))

  // Monthly totals for comparison
  const monthlyTotals = {}
  for (const tx of debits) {
    const m = tx.date.substring(0, 7)
    monthlyTotals[m] = (monthlyTotals[m] || 0) + tx.amount
  }
  const monthlyComparison = Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month: fmtMonth(month), total: Math.round(total) }))

  return {
    avgDaily: Math.round(avgDaily),
    avgWeekly: Math.round(avgWeekly),
    avgMonthly: Math.round(avgMonthly),
    totalSpend: Math.round(totalSpend),
    transactionCount: debits.length,
    categories,
    topMerchants,
    dayOfWeek,
    monthlyComparison,
  }
}

// Utility: compute trends
export function computeTrends(transactions) {
  const monthly = {}
  for (const tx of transactions) {
    const m = tx.date.substring(0, 7)
    if (!monthly[m]) monthly[m] = { income: 0, spending: 0 }
    if (tx.amount < 0) {
      monthly[m].income += Math.abs(tx.amount)
    } else {
      monthly[m].spending += tx.amount
    }
  }

  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({
      month: fmtMonth(month),
      income: Math.round(d.income),
      spending: Math.round(d.spending),
      savings: Math.round(d.income - d.spending),
      savingsRate: d.income > 0 ? Math.round(((d.income - d.spending) / d.income) * 100) : 0,
    }))
}

function prettifyCat(cat) {
  return cat.replace(/_/g, ' ').split(' ').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}

function fmtMonth(ym) {
  const [y, m] = ym.split('-')
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${names[parseInt(m) - 1]} '${y.slice(2)}`
}

// CSV export
export function exportToCSV(transactions) {
  const headers = ['Date', 'Merchant', 'Category', 'Amount']
  const rows = transactions.map((t) => [
    t.date,
    t.merchant_name || t.name,
    t.category,
    t.amount.toFixed(2),
  ])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `blindspot-transactions-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
