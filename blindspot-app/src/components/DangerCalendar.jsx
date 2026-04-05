import { useState } from 'react'
import { motion } from 'motion/react'
// Data passed as prop from Dashboard

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getColor(score, isFuture) {
  if (isFuture) return 'rgba(30, 41, 59, 0.5)'
  if (score >= 0.7) return 'rgba(255, 71, 87, 0.7)'
  if (score >= 0.5) return 'rgba(255, 71, 87, 0.4)'
  if (score >= 0.35) return 'rgba(247, 183, 49, 0.35)'
  if (score >= 0.2) return 'rgba(247, 183, 49, 0.15)'
  return 'rgba(46, 213, 115, 0.12)'
}

function getDangerLabel(score) {
  if (score >= 0.7) return { text: 'High danger', color: 'text-danger' }
  if (score >= 0.5) return { text: 'Elevated', color: 'text-danger' }
  if (score >= 0.35) return { text: 'Moderate', color: 'text-gold' }
  return { text: 'Low risk', color: 'text-success' }
}

export default function DangerCalendar({ data = [] }) {
  const [hoveredDay, setHoveredDay] = useState(null)

  // Pad start of month with empty cells
  const firstDow = data[0]?.dow || 0
  const padded = [...Array(firstDow).fill(null), ...data]

  const now = new Date()
  const monthLabel = `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.6 }}
      className="bg-card border border-border rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-600 text-sm text-text-primary">Danger Calendar</h3>
          <p className="text-text-muted text-xs mt-0.5">{monthLabel} — spending risk heatmap</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {[
            { bg: 'rgba(46, 213, 115, 0.15)', label: 'Safe' },
            { bg: 'rgba(247, 183, 49, 0.35)', label: 'Warn' },
            { bg: 'rgba(255, 71, 87, 0.7)', label: 'Danger' },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1 text-[10px] text-text-muted whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: l.bg }} /> {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* Day of week headers */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {DOW_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] font-mono text-text-muted py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {padded.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} />
          const isHovered = hoveredDay === day.day
          return (
            <motion.div
              key={day.day}
              className="relative aspect-square rounded-lg flex flex-col items-center justify-center cursor-default"
              style={{
                background: getColor(day.score, day.isFuture),
                border: day.isToday ? '2px solid #f7b731' : '1px solid transparent',
                boxShadow: day.isToday ? '0 0 12px rgba(247, 183, 49, 0.2)' : 'none',
              }}
              onMouseEnter={() => setHoveredDay(day.day)}
              onMouseLeave={() => setHoveredDay(null)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.015, duration: 0.3 }}
              whileHover={{ scale: 1.1 }}
            >
              <span className={`text-xs font-mono leading-none ${
                day.isFuture ? 'text-text-muted/50' : day.isToday ? 'text-gold font-600' : 'text-text-secondary'
              }`}>
                {day.day}
              </span>
              {!day.isFuture && (
                <span className="text-[8px] font-mono text-text-muted/70 mt-0.5">
                  ${day.amount}
                </span>
              )}

              {/* Tooltip */}
              {isHovered && !day.isFuture && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-16 left-1/2 -translate-x-1/2 bg-surface border border-border rounded-lg px-3 py-2 shadow-xl z-20 whitespace-nowrap"
                >
                  <p className="text-xs font-mono text-text-primary">${day.amount} spent</p>
                  <p className={`text-[10px] ${getDangerLabel(day.score).color}`}>
                    {getDangerLabel(day.score).text}
                  </p>
                  {day.isToday && (
                    <p className="text-[10px] text-gold font-500">← Today</p>
                  )}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-surface border-r border-b border-border rotate-45" />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Warning banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-4 p-3 rounded-lg bg-danger-dim border border-danger/10 flex items-start gap-3"
      >
        <div className="w-2 h-2 rounded-full bg-danger mt-1 animate-pulse" />
        <div>
          <p className="text-xs text-text-primary font-500">
            Post-payday danger window active
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">
            April 1–3 historically averages 2.3× your daily spending. Today is April 4 — you're at the tail end. Stay mindful.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
