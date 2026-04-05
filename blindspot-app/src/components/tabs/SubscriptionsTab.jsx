import { motion } from 'motion/react'
import { CreditCard, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react'

export default function SubscriptionsTab({ subscriptions }) {
  const totalMonthly = subscriptions.reduce((s, sub) => s + sub.amount, 0)
  const totalAnnual = totalMonthly * 12
  const unusedCount = subscriptions.filter((s) => s.status === 'unused').length
  const unusedCost = subscriptions.filter((s) => s.status === 'unused').reduce((s, sub) => s + sub.amount, 0)

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Monthly Total', value: `$${Math.round(totalMonthly)}`, sub: `${subscriptions.length} subscriptions`, icon: CreditCard, color: 'text-gold', bg: 'bg-gold-dim' },
          { label: 'Annual Cost', value: `$${Math.round(totalAnnual).toLocaleString()}`, sub: 'projected', icon: DollarSign, color: 'text-info', bg: 'bg-info-dim' },
          { label: 'Potentially Unused', value: unusedCount, sub: `$${Math.round(unusedCost)}/mo wasted`, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger-dim' },
          { label: 'Active & Used', value: subscriptions.length - unusedCount, sub: 'good standing', icon: CheckCircle2, color: 'text-success', bg: 'bg-success-dim' },
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
            <div className="text-text-muted text-xs mt-0.5">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Subscriptions table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border text-[10px] font-mono text-text-muted uppercase tracking-wider">
          <div className="col-span-4">Service</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">Frequency</div>
          <div className="col-span-2">Last Charged</div>
          <div className="col-span-2">Status</div>
        </div>

        {/* Rows */}
        {subscriptions.map((sub, i) => (
          <motion.div
            key={sub.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-border/50 hover:bg-card-hover transition-colors items-center"
          >
            {/* Service */}
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-border flex items-center justify-center text-xs font-600 text-text-secondary flex-shrink-0">
                {sub.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-text-primary font-500">{sub.name}</p>
                <p className="text-[10px] text-text-muted">{prettyCat(sub.category)}</p>
              </div>
            </div>

            {/* Amount */}
            <div className="col-span-2">
              <span className="font-mono text-sm text-text-primary">${sub.amount.toFixed(2)}</span>
              <span className="text-[10px] text-text-muted block">${Math.round(sub.amount * 12)}/yr</span>
            </div>

            {/* Frequency */}
            <div className="col-span-2">
              <span className="text-xs text-text-secondary capitalize">{sub.frequency}</span>
            </div>

            {/* Last Charged */}
            <div className="col-span-2">
              <span className="text-xs text-text-secondary">{sub.lastChargeDate}</span>
              <span className="text-[10px] text-text-muted block">{sub.daysSinceLastCharge}d ago</span>
            </div>

            {/* Status */}
            <div className="col-span-2">
              {sub.status === 'unused' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-danger-dim text-danger">
                  <AlertTriangle size={10} /> Unused
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-success-dim text-success">
                  <CheckCircle2 size={10} /> Active
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function prettyCat(cat) {
  return (cat || 'Other').replace(/_/g, ' ').split(' ').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}
