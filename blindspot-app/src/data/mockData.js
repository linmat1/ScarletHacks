export const INSIGHTS = [
  {
    id: 'sub-1',
    type: 'subscription',
    title: 'Adobe Creative Cloud',
    amount: 54.99,
    annualized: 659.88,
    severity: 'high',
    status: 'active',
    description: "You're paying $54.99/mo for Adobe Creative Cloud, but you haven't opened a single Adobe app in over 90 days.",
    action: 'Cancel or downgrade to the Photography plan ($9.99/mo) — that saves you $540/year.',
    details: { lastUsed: 94, category: 'Software' },
  },
  {
    id: 'sub-2',
    type: 'subscription',
    title: 'ClassPass',
    amount: 49.0,
    annualized: 588.0,
    severity: 'high',
    status: 'active',
    description: "Your ClassPass membership costs $49/mo, but you haven't booked a class in 45 days. You're paying for flexibility you're not using.",
    action: 'Pause your membership (free for up to 3 months) or switch to a pay-per-class model.',
    details: { lastUsed: 45, category: 'Fitness' },
  },
  {
    id: 'sub-3',
    type: 'subscription',
    title: 'Headspace',
    amount: 12.99,
    annualized: 155.88,
    severity: 'medium',
    status: 'active',
    description: "Your Headspace subscription has been running for $12.99/mo, but you last meditated 120 days ago. That's $52 spent since your last session.",
    action: 'Cancel and try the free tier, or set a daily reminder to get your money\'s worth.',
    details: { lastUsed: 120, category: 'Wellness' },
  },
  {
    id: 'drift-1',
    type: 'drift',
    title: 'Dining Out Creep',
    amount: 135,
    annualized: 1620,
    severity: 'high',
    status: 'active',
    description: "Your dining spending has quietly grown 46% over 6 months — from $290/mo to $425/mo. That's an extra $135 every month that wasn't in your budget.",
    action: 'Set a $320/mo dining budget. Try meal-prepping Sundays to cut 2 takeout orders per week.',
    details: { baseline: 290, current: 425, pctChange: 46, months: 6, category: 'Dining' },
  },
  {
    id: 'drift-2',
    type: 'drift',
    title: 'Ride-sharing Surge',
    amount: 65,
    annualized: 780,
    severity: 'medium',
    status: 'active',
    description: "Uber and Lyft spending jumped 81% — from $80/mo to $145/mo. Weekend night rides are the main driver, averaging $23 per trip.",
    action: 'Pre-schedule rides to avoid surge pricing, or set a $100/mo transport budget with alerts.',
    details: { baseline: 80, current: 145, pctChange: 81, months: 6, category: 'Transport' },
  },
  {
    id: 'drift-3',
    type: 'drift',
    title: 'Online Shopping Drift',
    amount: 115,
    annualized: 1380,
    severity: 'high',
    status: 'active',
    description: "Amazon and online retail spending grew 63% over 6 months — from $190/mo to $305/mo. Most orders are under $30, making each one feel harmless.",
    action: 'Enable a 48-hour wishlist rule: add items to your cart but wait 2 days before buying. Studies show 40% of impulse buys get abandoned.',
    details: { baseline: 190, current: 305, pctChange: 63, months: 6, category: 'Shopping' },
  },
  {
    id: 'danger-1',
    type: 'danger',
    title: 'Post-Payday Spending Spike',
    amount: 220,
    annualized: 2640,
    severity: 'high',
    status: 'active',
    description: "You spend 2.3x your daily average in the 3 days after payday. This pattern has repeated for 10 out of the last 12 months — it's deeply habitual.",
    action: 'Auto-transfer 30% of each paycheck to savings before you see it. What you don\'t see, you won\'t spend.',
    details: { multiplier: 2.3, pattern: 'post-payday', frequency: '1st & 15th' },
  },
  {
    id: 'danger-2',
    type: 'danger',
    title: 'Weekend Splurge Pattern',
    amount: 95,
    annualized: 1140,
    severity: 'medium',
    status: 'active',
    description: "Friday-to-Sunday spending is 1.8x your weekday average. Dining, entertainment, and ride-shares account for 73% of the weekend premium.",
    action: 'Give yourself a fixed weekly \"fun budget\" on Friday morning. When it\'s gone, switch to free activities.',
    details: { multiplier: 1.8, pattern: 'weekend', days: 'Fri-Sun' },
  },
];

export const SPENDING_DATA = [
  { month: 'Apr \'25', dining: 280, shopping: 190, subscriptions: 130, transport: 80, groceries: 420, entertainment: 60 },
  { month: 'May \'25', dining: 295, shopping: 200, subscriptions: 130, transport: 85, groceries: 430, entertainment: 75 },
  { month: 'Jun \'25', dining: 310, shopping: 220, subscriptions: 140, transport: 90, groceries: 440, entertainment: 90 },
  { month: 'Jul \'25', dining: 330, shopping: 230, subscriptions: 150, transport: 100, groceries: 435, entertainment: 80 },
  { month: 'Aug \'25', dining: 340, shopping: 210, subscriptions: 155, transport: 95, groceries: 445, entertainment: 85 },
  { month: 'Sep \'25', dining: 365, shopping: 250, subscriptions: 155, transport: 110, groceries: 450, entertainment: 95 },
  { month: 'Oct \'25', dining: 380, shopping: 260, subscriptions: 160, transport: 120, groceries: 455, entertainment: 70 },
  { month: 'Nov \'25', dining: 395, shopping: 275, subscriptions: 165, transport: 115, groceries: 460, entertainment: 100 },
  { month: 'Dec \'25', dining: 400, shopping: 290, subscriptions: 165, transport: 130, groceries: 465, entertainment: 110 },
  { month: 'Jan \'26', dining: 390, shopping: 295, subscriptions: 170, transport: 135, groceries: 470, entertainment: 90 },
  { month: 'Feb \'26', dining: 410, shopping: 310, subscriptions: 172, transport: 140, groceries: 475, entertainment: 105 },
  { month: 'Mar \'26', dining: 425, shopping: 305, subscriptions: 175, transport: 145, groceries: 480, entertainment: 115 },
];

// Generate danger calendar for April 2026
function generateDangerCalendar() {
  const days = [];
  const year = 2026;
  const month = 3; // April (0-indexed)
  const daysInMonth = 30;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dow === 0 || dow === 5 || dow === 6;
    const isPostPayday = (d >= 1 && d <= 3) || (d >= 15 && d <= 17);

    let baseSpend = 35 + Math.random() * 25; // $35-60 base
    let score = 0.2 + Math.random() * 0.15;

    if (isWeekend) {
      baseSpend *= 1.6 + Math.random() * 0.4;
      score += 0.2;
    }
    if (isPostPayday) {
      baseSpend *= 1.8 + Math.random() * 0.5;
      score += 0.35;
    }

    // Add some random spikes
    if (d === 8 || d === 22) {
      baseSpend *= 1.3;
      score += 0.15;
    }

    days.push({
      day: d,
      date: `2026-04-${String(d).padStart(2, '0')}`,
      dow,
      amount: Math.round(baseSpend),
      score: Math.min(1, Math.max(0, score)),
      isToday: d === 4,
      isFuture: d > 4,
    });
  }
  return days;
}

export const DANGER_CALENDAR = generateDangerCalendar();

export const TOTAL_MONTHLY_WASTE = INSIGHTS.reduce((sum, i) => sum + i.amount, 0);
export const TOTAL_ANNUAL_WASTE = INSIGHTS.reduce((sum, i) => sum + i.annualized, 0);
export const BLIND_SPOT_COUNT = INSIGHTS.length;

export const BANKS = [
  { name: 'Chase', logo: '🏦' },
  { name: 'Bank of America', logo: '🏛️' },
  { name: 'Wells Fargo', logo: '🏦' },
  { name: 'Capital One', logo: '💳' },
  { name: 'Citi', logo: '🏦' },
  { name: 'US Bank', logo: '🏛️' },
];

export const ANALYSIS_STAGES = [
  { id: 'subscriptions', label: 'Scanning for forgotten subscriptions', sublabel: 'Checking recurring charges across 847 transactions...', duration: 2200, icon: 'subscription' },
  { id: 'drift', label: 'Detecting lifestyle drift', sublabel: 'Comparing monthly category trends over 12 months...', duration: 2600, icon: 'drift' },
  { id: 'danger', label: 'Predicting danger windows', sublabel: 'Mapping spending patterns to paydays and seasons...', duration: 2000, icon: 'danger' },
  { id: 'ai', label: 'Generating insights with AI', sublabel: 'Writing personalized recommendations...', duration: 1800, icon: 'ai' },
];
