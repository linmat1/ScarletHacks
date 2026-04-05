import { motion } from 'motion/react'
import { Eye, DollarSign, AlertTriangle, TrendingDown } from 'lucide-react'
import InsightCard from '../InsightCard'
import SpendingChart from '../SpendingChart'
import DangerCalendar from '../DangerCalendar'

export default function BlindSpotsTab({ insights, spendingData, dangerCalendar }) {
  const totalMonthly = insights.reduce((sum, i) => sum + i.amount, 0)
  const totalAnnual = insights.reduce((sum, i) => sum + i.annualized, 0)
  const hasDanger = insights.some((i) => i.type === 'danger' && i.severity === 'high')

  const STATS = [
    { label: 'Monthly Waste', value: `$${Math.round(totalMonthly)}`, sub: 'identified', icon: DollarSign, color: 'text-gold', bg: 'bg-gold-dim', border: 'border-gold/10' },
    { label: 'Blind Spots', value: insights.length, sub: 'detected', icon: Eye, color: 'text-info', bg: 'bg-info-dim', border: 'border-info/10' },
    { label: 'Danger Level', value: hasDanger ? 'HIGH' : 'MED', sub: 'this week', icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger-dim', border: 'border-danger/10' },
    { label: 'Annual Savings', value: `$${Math.round(totalAnnual).toLocaleString()}`, sub: 'potential', icon: TrendingDown, color: 'text-success', bg: 'bg-success-dim', border: 'border-success/10' },
  ]

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            className={`p-4 rounded-xl bg-card border ${stat.border} relative overflow-hidden`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={14} className={stat.color} />
              </div>
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className={`font-mono font-600 text-2xl ${stat.color}`}>{stat.value}</div>
            <div className="text-text-muted text-xs mt-0.5">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Insights column */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display font-600 text-sm text-text-primary">
              Blind Spots
              <span className="ml-2 text-xs font-mono text-text-muted">({insights.length})</span>
            </h2>
            <span className="text-[10px] font-mono text-text-muted">sorted by impact</span>
          </div>
          {insights
            .sort((a, b) => b.amount - a.amount)
            .map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} index={i} />
            ))}
        </div>

        {/* Charts column */}
        <div className="lg:col-span-7 space-y-6">
          <SpendingChart data={spendingData} />
          <DangerCalendar data={dangerCalendar} />
        </div>
      </div>
    </div>
  )
}
