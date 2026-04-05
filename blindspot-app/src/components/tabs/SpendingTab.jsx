import { motion } from 'motion/react'
import { DollarSign, Calendar, Clock, Wallet } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const COLORS = ['#f7b731', '#70a1ff', '#ff4757', '#a855f7', '#2ed573', '#ff6b81', '#00cec9', '#fd79a8', '#636e72']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-mono text-text-muted">{label || payload[0]?.name}</p>
      <p className="text-sm font-mono text-text-primary">${payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

export default function SpendingTab({ analytics }) {
  const { avgDaily, avgWeekly, avgMonthly, categories, topMerchants, dayOfWeek, monthlyComparison } = analytics

  const maxDow = Math.max(...dayOfWeek.map((d) => d.avg))

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Daily Average', value: `$${avgDaily}`, icon: Clock, color: 'text-gold', bg: 'bg-gold-dim' },
          { label: 'Weekly Average', value: `$${avgWeekly}`, icon: Calendar, color: 'text-info', bg: 'bg-info-dim' },
          { label: 'Monthly Average', value: `$${avgMonthly.toLocaleString()}`, icon: Wallet, color: 'text-success', bg: 'bg-success-dim' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h3 className="font-display font-600 text-sm text-text-primary mb-4">Spending by Category</h3>
          <div className="flex items-center gap-6">
            <div className="w-40 h-40 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories.slice(0, 7)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {categories.slice(0, 7).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {categories.slice(0, 7).map((cat, i) => {
                const total = categories.reduce((s, c) => s + c.value, 0)
                const pct = Math.round((cat.value / total) * 100)
                return (
                  <div key={cat.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i] }} />
                    <span className="text-xs text-text-secondary flex-1 truncate">{cat.name}</span>
                    <span className="text-xs font-mono text-text-muted">{pct}%</span>
                    <span className="text-xs font-mono text-text-primary">${cat.value.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Top merchants */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h3 className="font-display font-600 text-sm text-text-primary mb-4">Top Merchants</h3>
          <div className="space-y-2.5">
            {topMerchants.slice(0, 8).map((m, i) => {
              const pct = (m.total / topMerchants[0].total) * 100
              return (
                <div key={m.name} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-text-muted w-4 text-right">{i + 1}</span>
                  <div className="w-6 h-6 rounded bg-border flex items-center justify-center text-[10px] font-600 text-text-secondary flex-shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-text-primary truncate">{m.name}</span>
                      <span className="text-xs font-mono text-text-primary ml-2">${m.total.toLocaleString()}</span>
                    </div>
                    <div className="h-1 bg-border/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gold/40" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted flex-shrink-0">{m.count}×</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day of week heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h3 className="font-display font-600 text-sm text-text-primary mb-4">Spending by Day of Week</h3>
          <div className="flex items-end gap-2 h-32">
            {dayOfWeek.map((d) => {
              const height = maxDow > 0 ? (d.avg / maxDow) * 100 : 0
              const isHigh = height > 70
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-text-muted">${d.avg}</span>
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${Math.max(height, 4)}%`,
                      background: isHigh ? 'rgba(255, 71, 87, 0.5)' : 'rgba(247, 183, 49, 0.3)',
                    }}
                  />
                  <span className={`text-[10px] font-mono ${isHigh ? 'text-danger' : 'text-text-muted'}`}>{d.day}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Monthly comparison */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h3 className="font-display font-600 text-sm text-text-primary mb-4">Monthly Spending</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="rgba(247, 183, 49, 0.4)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
