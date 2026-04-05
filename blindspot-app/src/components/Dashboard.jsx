import { motion } from 'motion/react'
import { Eye, DollarSign, AlertTriangle, TrendingDown, LogOut } from 'lucide-react'
import InsightCard from './InsightCard'
import SpendingChart from './SpendingChart'
import DangerCalendar from './DangerCalendar'
import AiChat from './AiChat'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

function buildStats(insights) {
  const totalMonthly = insights.reduce((sum, i) => sum + i.amount, 0)
  const totalAnnual = insights.reduce((sum, i) => sum + i.annualized, 0)
  const hasDanger = insights.some((i) => i.type === 'danger' && i.severity === 'high')

  return [
    { label: 'Monthly Waste', value: `$${Math.round(totalMonthly)}`, sub: 'identified', icon: DollarSign, color: 'text-gold', bg: 'bg-gold-dim', border: 'border-gold/10' },
    { label: 'Blind Spots', value: insights.length, sub: 'detected', icon: Eye, color: 'text-info', bg: 'bg-info-dim', border: 'border-info/10' },
    { label: 'Danger Level', value: hasDanger ? 'HIGH' : insights.some((i) => i.type === 'danger') ? 'MED' : 'LOW', sub: 'this week', icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger-dim', border: 'border-danger/10' },
    { label: 'Annual Savings', value: `$${Math.round(totalAnnual).toLocaleString()}`, sub: 'potential', icon: TrendingDown, color: 'text-success', bg: 'bg-success-dim', border: 'border-success/10' },
  ]
}

export default function Dashboard({ insights, spendingData, dangerCalendar, connectionInfo, onReset }) {
  const STATS = buildStats(insights)
  return (
    <div className="min-h-screen bg-obsidian">
      {/* Top bar */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-dim flex items-center justify-center">
              <Eye size={16} className="text-gold" />
            </div>
            <div>
              <h1 className="font-display font-700 text-base text-text-primary leading-none">Blind Spot</h1>
              <p className="text-[10px] text-text-muted font-mono mt-0.5">Financial Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted font-mono hidden sm:block">
              {connectionInfo?.institution || 'Bank'} {connectionInfo?.accounts?.[0]?.mask ? `•••${connectionInfo.accounts[0].mask}` : ''}
            </span>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-muted border border-border rounded-lg hover:border-border-glow transition-colors cursor-pointer"
            >
              <LogOut size={12} /> Disconnect
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-8 pb-10">
        <motion.div variants={container} initial="hidden" animate="show">
          {/* Summary stats */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className={`p-4 rounded-xl bg-card border ${stat.border} relative overflow-hidden`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon size={14} className={stat.color} />
                  </div>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">{stat.label}</span>
                </div>
                <div className={`font-mono font-600 text-2xl ${stat.color}`}>{stat.value}</div>
                <div className="text-text-muted text-xs mt-0.5">{stat.sub}</div>
                <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.03]">
                  <stat.icon size={96} />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Insights column */}
            <div className="lg:col-span-5 space-y-3">
              <motion.div variants={fadeUp} className="flex items-center justify-between mb-1">
                <h2 className="font-display font-600 text-sm text-text-primary">
                  Blind Spots
                  <span className="ml-2 text-xs font-mono text-text-muted">({insights.length})</span>
                </h2>
                <span className="text-[10px] font-mono text-text-muted">sorted by impact</span>
              </motion.div>
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
        </motion.div>
      </div>

      <AiChat insights={insights} itemId={connectionInfo?.itemId} />
    </div>
  )
}
