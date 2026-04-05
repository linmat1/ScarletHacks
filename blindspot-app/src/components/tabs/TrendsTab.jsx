import { motion } from 'motion/react'
import { TrendingUp, TrendingDown, Wallet, Percent } from 'lucide-react'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-mono text-text-muted mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-text-secondary capitalize">{entry.dataKey}</span>
          </span>
          <span className="font-mono text-text-primary">
            {entry.dataKey === 'savingsRate' ? `${entry.value}%` : `$${entry.value?.toLocaleString()}`}
          </span>
        </div>
      ))}
    </div>
  )
}

function CustomLegend({ payload }) {
  return (
    <div className="flex items-center justify-center gap-4 mt-2">
      {payload?.map((entry) => (
        <span key={entry.value} className="flex items-center gap-1.5 text-[11px] text-text-muted">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="capitalize">{entry.value}</span>
        </span>
      ))}
    </div>
  )
}

export default function TrendsTab({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-text-muted text-center py-20">Not enough data for trends.</p>
  }

  const latestMonth = data[data.length - 1]
  const avgSavingsRate = Math.round(data.reduce((s, d) => s + d.savingsRate, 0) / data.length)
  const totalSaved = data.reduce((s, d) => s + d.savings, 0)
  const incomeGrowth = data.length >= 2
    ? Math.round(((data[data.length - 1].income - data[0].income) / data[0].income) * 100)
    : 0
  const spendGrowth = data.length >= 2
    ? Math.round(((data[data.length - 1].spending - data[0].spending) / data[0].spending) * 100)
    : 0

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Avg Savings Rate', value: `${avgSavingsRate}%`, icon: Percent, color: avgSavingsRate > 0 ? 'text-success' : 'text-danger', bg: avgSavingsRate > 0 ? 'bg-success-dim' : 'bg-danger-dim' },
          { label: 'Total Saved (12mo)', value: `$${Math.round(totalSaved).toLocaleString()}`, icon: Wallet, color: 'text-gold', bg: 'bg-gold-dim' },
          { label: 'Income Growth', value: `${incomeGrowth > 0 ? '+' : ''}${incomeGrowth}%`, icon: TrendingUp, color: 'text-info', bg: 'bg-info-dim' },
          { label: 'Spending Growth', value: `${spendGrowth > 0 ? '+' : ''}${spendGrowth}%`, icon: spendGrowth > 0 ? TrendingUp : TrendingDown, color: spendGrowth > 15 ? 'text-danger' : 'text-gold', bg: spendGrowth > 15 ? 'bg-danger-dim' : 'bg-gold-dim' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={14} className={stat.color} />
              </div>
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className={`font-mono font-600 text-2xl ${stat.color}`}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Income vs Spending */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-xl p-5 mb-6"
      >
        <h3 className="font-display font-600 text-sm text-text-primary mb-1">Income vs Spending</h3>
        <p className="text-text-muted text-xs mb-4">12-month comparison</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="grad-income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2ed573" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2ed573" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="grad-spending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff4757" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#ff4757" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Area type="monotone" dataKey="income" stroke="#2ed573" strokeWidth={2} fill="url(#grad-income)" dot={false} />
              <Area type="monotone" dataKey="spending" stroke="#ff4757" strokeWidth={2} fill="url(#grad-spending)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings rate */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h3 className="font-display font-600 text-sm text-text-primary mb-1">Savings Rate</h3>
          <p className="text-text-muted text-xs mb-4">Percentage of income saved each month</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={20} stroke="rgba(46, 213, 115, 0.3)" strokeDasharray="4 4" label={{ value: '20% goal', position: 'right', fontSize: 10, fill: '#2ed573' }} />
                <Bar dataKey="savingsRate" radius={[4, 4, 0, 0]}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.savingsRate >= 20 ? 'rgba(46, 213, 115, 0.5)' : entry.savingsRate >= 0 ? 'rgba(247, 183, 49, 0.4)' : 'rgba(255, 71, 87, 0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly net savings */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h3 className="font-display font-600 text-sm text-text-primary mb-1">Net Savings</h3>
          <p className="text-text-muted text-xs mb-4">Income minus spending per month</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Bar dataKey="savings" radius={[4, 4, 0, 0]}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.savings >= 0 ? 'rgba(46, 213, 115, 0.5)' : 'rgba(255, 71, 87, 0.5)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

