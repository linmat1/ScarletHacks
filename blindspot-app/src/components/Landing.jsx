import { motion } from 'motion/react'
import { Eye, Shield, Zap, TrendingUp, Calendar, CreditCard } from 'lucide-react'
import Logo from './Logo'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const FEATURES = [
  {
    icon: CreditCard,
    title: 'Subscription Scanner',
    desc: 'Finds forgotten recurring charges draining your account',
    color: 'text-gold',
    bg: 'bg-gold-dim',
  },
  {
    icon: TrendingUp,
    title: 'Drift Detector',
    desc: 'Spots lifestyle inflation creeping up month over month',
    color: 'text-info',
    bg: 'bg-info-dim',
  },
  {
    icon: Calendar,
    title: 'Danger Predictor',
    desc: 'Warns you before your historically worst spending days',
    color: 'text-danger',
    bg: 'bg-danger-dim',
  },
]

export default function Landing({ onConnect }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(247, 183, 49, 0.07) 0%, transparent 60%)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 110%, rgba(255, 71, 87, 0.04) 0%, transparent 50%)',
      }} />

      {/* Floating orbs */}
      <motion.div
        className="absolute w-72 h-72 rounded-full blur-[120px]"
        style={{ background: 'rgba(247, 183, 49, 0.06)', top: '10%', left: '15%' }}
        animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-[140px]"
        style={{ background: 'rgba(112, 161, 255, 0.04)', bottom: '10%', right: '10%' }}
        animate={{ y: [15, -15, 15], x: [10, -10, 10] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="flex flex-col items-center mb-8">
          <Logo size={72} className="mb-6" />
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border text-text-secondary text-sm font-mono bg-surface/50 backdrop-blur-sm">
            <Eye size={14} className="text-gold" />
            AI-Powered Financial Intelligence
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="font-display font-800 text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight mb-6"
        >
          Your money has
          <br />
          <span className="text-gradient-gold">secrets.</span>
          <br />
          Let's find them.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Most budgeting apps show you the past. Blind Spot finds the patterns
          you can't see — forgotten subscriptions, lifestyle creep, and your most
          dangerous spending days — before they cost you.
        </motion.p>

        {/* Stats */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-8 sm:gap-12 mb-12">
          {[
            { value: '$380', label: 'avg yearly waste found' },
            { value: '3', label: 'detection engines' },
            { value: '60s', label: 'to first insight' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-mono font-600 text-2xl sm:text-3xl text-text-primary">{stat.value}</div>
              <div className="text-text-muted text-xs sm:text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div variants={fadeUp}>
          <motion.button
            onClick={onConnect}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gold text-obsidian font-display font-700 text-lg rounded-xl cursor-pointer overflow-hidden"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            style={{ boxShadow: '0 0 30px rgba(247, 183, 49, 0.2), 0 0 80px rgba(247, 183, 49, 0.08)' }}
          >
            <span className="relative z-10">Connect Your Bank</span>
            <svg className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
            />
          </motion.button>
        </motion.div>

        {/* Trust badges */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-6 mt-6 text-text-muted text-xs">
          <span className="flex items-center gap-1.5">
            <Shield size={12} /> Read-only access
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={12} /> 256-bit encryption
          </span>
          <span className="flex items-center gap-1.5">
            <Eye size={12} /> Powered by Plaid
          </span>
        </motion.div>

        {/* Feature cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-3xl mx-auto">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="relative p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm text-left card-hover"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ borderColor: 'rgba(247, 183, 49, 0.2)' }}
            >
              <div className={`inline-flex p-2 rounded-lg ${f.bg} mb-3`}>
                <f.icon size={18} className={f.color} />
              </div>
              <h3 className="font-display font-600 text-sm text-text-primary mb-1">{f.title}</h3>
              <p className="text-text-muted text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
