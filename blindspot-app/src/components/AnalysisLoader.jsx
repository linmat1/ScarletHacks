import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { CreditCard, TrendingUp, Calendar, Sparkles, Check, Loader2 } from 'lucide-react'

const STAGES = [
  { id: 'subscriptions', label: 'Scanning for forgotten subscriptions', sublabel: 'Checking recurring charge patterns...', icon: CreditCard, minTime: 1500 },
  { id: 'drift', label: 'Detecting lifestyle drift', sublabel: 'Comparing monthly category trends...', icon: TrendingUp, minTime: 1500 },
  { id: 'danger', label: 'Predicting danger windows', sublabel: 'Mapping spending to paydays and seasons...', icon: Calendar, minTime: 1500 },
  { id: 'ai', label: 'Generating AI insights', sublabel: 'Writing personalized recommendations...', icon: Sparkles, minTime: 1000 },
]

export default function AnalysisLoader({ itemId, apiUrl, onComplete }) {
  const [currentStage, setCurrentStage] = useState(0)
  const [completedStages, setCompletedStages] = useState([])
  const [error, setError] = useState(null)
  const resultRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function runAnalysis() {
      // Animate through visual stages while the API call runs
      const apiPromise = fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId }),
      }).then((r) => r.json())

      // Animate stages with minimum display time each
      for (let i = 0; i < STAGES.length; i++) {
        if (cancelled) return
        setCurrentStage(i)
        await new Promise((r) => setTimeout(r, STAGES[i].minTime))
        setCompletedStages((prev) => [...prev, STAGES[i].id])
      }

      // Wait for API to finish (it may already be done)
      try {
        const result = await apiPromise
        if (cancelled) return

        if (result.error) {
          setError(result.error)
          return
        }

        resultRef.current = result
        // Brief pause to show completion, then advance
        setTimeout(() => {
          if (!cancelled) onComplete(result)
        }, 600)
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }

    runAnalysis()
    return () => { cancelled = true }
  }, [itemId, apiUrl, onComplete])

  const overallProgress = ((completedStages.length) / STAGES.length) * 100
  const insightsFound = resultRef.current?.insights?.length || 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-obsidian"
    >
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 60% 40% at 50% 50%, rgba(247, 183, 49, 0.03) 0%, transparent 70%)`,
      }} />

      <div className="relative z-10 w-full max-w-lg mx-auto px-6">
        {/* Central ring */}
        <div className="flex justify-center mb-10">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="58" fill="none" stroke="rgba(30,41,59,0.5)" strokeWidth="3" />
              <motion.circle
                cx="64" cy="64" r="58"
                fill="none"
                stroke="#f7b731"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={364.4}
                initial={{ strokeDashoffset: 364.4 }}
                animate={{ strokeDashoffset: 364.4 * (1 - overallProgress / 100) }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {completedStages.length === STAGES.length ? (
                <motion.span
                  className="font-mono font-600 text-3xl text-gold"
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {insightsFound || '...'}
                </motion.span>
              ) : (
                <Loader2 size={28} className="text-gold animate-spin" />
              )}
              <span className="text-text-muted text-xs">
                {completedStages.length === STAGES.length ? 'blind spots' : 'analyzing'}
              </span>
            </div>
          </div>
        </div>

        <motion.h2
          className="text-center font-display font-700 text-2xl text-text-primary mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Analyzing your finances
        </motion.h2>
        <p className="text-center text-text-muted text-sm mb-10">
          Running 3 detection engines on your transactions
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-danger-dim border border-danger/20 text-center">
            <p className="text-danger text-sm font-500">Analysis failed</p>
            <p className="text-text-muted text-xs mt-1">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {STAGES.map((stage, i) => {
            const isActive = i === currentStage && !completedStages.includes(stage.id)
            const isComplete = completedStages.includes(stage.id)
            const Icon = stage.icon

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? 'border-gold/20 bg-gold-dim'
                    : isComplete
                    ? 'border-success/10 bg-success-dim/50'
                    : 'border-border/50 bg-transparent opacity-40'
                }`}
              >
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                  isComplete ? 'bg-success/10' : isActive ? 'bg-gold/10' : 'bg-border/30'
                }`}>
                  {isComplete ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                      <Check size={16} className="text-success" />
                    </motion.div>
                  ) : (
                    <Icon size={16} className={isActive ? 'text-gold' : 'text-text-muted'} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-500 ${isComplete ? 'text-success' : isActive ? 'text-text-primary' : 'text-text-muted'}`}>
                    {stage.label}
                  </p>
                  {(isActive || isComplete) && (
                    <p className="text-xs text-text-muted mt-0.5">{stage.sublabel}</p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
