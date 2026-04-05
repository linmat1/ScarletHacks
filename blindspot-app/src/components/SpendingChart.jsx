import { motion } from 'motion/react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
const PALETTE = [
  { color: '#f7b731', gradient: 'gold' },
  { color: '#70a1ff', gradient: 'blue' },
  { color: '#ff4757', gradient: 'red' },
  { color: '#a855f7', gradient: 'purple' },
  { color: '#2ed573', gradient: 'green' },
  { color: '#ff6b81', gradient: 'pink' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null
  return (
    <div className="bg-surface border border-border rounded-lg p-3 shadow-xl">
      <p className="text-xs font-mono text-text-muted mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-text-secondary capitalize">{entry.dataKey}</span>
          </span>
          <span className="font-mono text-text-primary">${entry.value}</span>
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

export default function SpendingChart({ data }) {
  // Derive categories from the data keys (exclude 'month')
  const categories = data.length > 0
    ? Object.keys(data[0]).filter((k) => k !== 'month').map((key, i) => ({
        key,
        label: key,
        color: PALETTE[i % PALETTE.length].color,
        gradient: PALETTE[i % PALETTE.length].gradient,
      }))
    : []
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="bg-card border border-border rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-600 text-sm text-text-primary">Spending Drift</h3>
          <p className="text-text-muted text-xs mt-0.5">12-month trend by category</p>
        </div>
        <span className="text-[10px] font-mono text-danger bg-danger-dim px-2 py-1 rounded whitespace-nowrap">
          ↑ 3 rising
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="grad-gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f7b731" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#f7b731" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="grad-blue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#70a1ff" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#70a1ff" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="grad-red" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff4757" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ff4757" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="grad-purple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="grad-green" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2ed573" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#2ed573" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="grad-pink" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6b81" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ff6b81" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            {categories.map((cat) => (
              <Area
                key={cat.key}
                type="monotone"
                dataKey={cat.key}
                stroke={cat.color}
                strokeWidth={2}
                fill={`url(#grad-${cat.gradient})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: cat.color }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
