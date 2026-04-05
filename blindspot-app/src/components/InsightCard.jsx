import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CreditCard, TrendingUp, Calendar, ChevronDown, BellOff, CheckCircle2 } from 'lucide-react'

const TYPE_CONFIG = {
  subscription: {
    icon: CreditCard,
    label: 'Subscription',
    borderColor: 'border-l-gold',
    badgeBg: 'bg-gold-dim',
    badgeText: 'text-gold',
    accentColor: '#f7b731',
  },
  drift: {
    icon: TrendingUp,
    label: 'Lifestyle Drift',
    borderColor: 'border-l-info',
    badgeBg: 'bg-info-dim',
    badgeText: 'text-info',
    accentColor: '#70a1ff',
  },
  danger: {
    icon: Calendar,
    label: 'Danger Pattern',
    borderColor: 'border-l-danger',
    badgeBg: 'bg-danger-dim',
    badgeText: 'text-danger',
    accentColor: '#ff4757',
  },
}

export default function InsightCard({ insight, index }) {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState(insight.status)
  const config = TYPE_CONFIG[insight.type]
  const Icon = config.icon

  if (status === 'resolved') return null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: status === 'snoozed' ? 0.5 : 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative bg-card border border-border rounded-xl overflow-hidden border-l-4 ${config.borderColor} card-hover`}
    >
      {/* Main row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 p-4 text-left cursor-pointer bg-transparent border-none"
      >
        <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${config.badgeBg} flex items-center justify-center mt-0.5`}>
          <Icon size={16} className={config.badgeText} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-mono uppercase tracking-wider ${config.badgeText}`}>
              {config.label}
            </span>
            {insight.severity === 'high' && (
              <span className="text-[10px] font-mono text-danger bg-danger-dim px-1.5 py-0.5 rounded">HIGH</span>
            )}
          </div>
          <h3 className="font-display font-600 text-sm text-text-primary leading-snug">{insight.title}</h3>
          <p className="text-text-muted text-xs mt-1 line-clamp-2">{insight.description}</p>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className="font-mono font-600 text-lg" style={{ color: config.accentColor }}>
            ${insight.amount}
          </div>
          <div className="text-text-muted text-[10px] font-mono">/month</div>
        </div>

        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-1"
        >
          <ChevronDown size={16} className="text-text-muted" />
        </motion.div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-border/50">
              {/* AI Narrative */}
              <div className="mt-3 p-3 rounded-lg bg-surface border border-border/50">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-4 h-4 rounded bg-gold/10 flex items-center justify-center">
                    <span className="text-[8px]">AI</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Insight</span>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">{insight.description}</p>
              </div>

              {/* Suggested action */}
              <div className="mt-3 p-3 rounded-lg bg-gold-dim border border-gold/10">
                <p className="text-xs font-mono text-gold mb-1 uppercase tracking-wider">Suggested Action</p>
                <p className="text-text-primary text-sm leading-relaxed">{insight.action}</p>
              </div>

              {/* Annual impact */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-text-muted">
                  Annual impact: <span className="font-mono text-text-primary">${insight.annualized.toLocaleString()}</span>/yr
                </span>
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setStatus('snoozed') }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-muted bg-card border border-border rounded-lg hover:border-border-glow transition-colors cursor-pointer"
                >
                  <BellOff size={12} /> Snooze
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setStatus('resolved') }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-success bg-success-dim border border-success/10 rounded-lg hover:border-success/30 transition-colors cursor-pointer"
                >
                  <CheckCircle2 size={12} /> Resolved
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
