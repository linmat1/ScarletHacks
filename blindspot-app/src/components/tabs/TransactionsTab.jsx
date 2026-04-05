import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { CalendarDays, List, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getMonthDays(year, month) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDow(year, month) {
  return new Date(year, month, 1).getDay()
}

function categoryColor(cat) {
  const map = {
    FOOD_AND_DRINK: 'bg-gold/15 text-gold',
    GROCERIES: 'bg-success/15 text-success',
    TRANSPORTATION: 'bg-danger/15 text-danger',
    GENERAL_MERCHANDISE: 'bg-info/15 text-info',
    ENTERTAINMENT: 'bg-purple-500/15 text-purple-400',
    RENT_AND_UTILITIES: 'bg-cyan-500/15 text-cyan-400',
    GENERAL_SERVICES: 'bg-orange-500/15 text-orange-400',
    INCOME: 'bg-success/15 text-success',
    RECREATION: 'bg-pink-500/15 text-pink-400',
  }
  return map[cat] || 'bg-border text-text-muted'
}

function prettyCat(cat) {
  return (cat || 'Other').replace(/_/g, ' ').split(' ').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}

export default function TransactionsTab({ transactions, searchQuery }) {
  const now = new Date()
  const [viewMode, setViewMode] = useState('calendar')
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState(now.getDate())

  const monthLabel = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })

  // Group transactions by date
  const byDate = useMemo(() => {
    const map = {}
    for (const tx of transactions) {
      if (!map[tx.date]) map[tx.date] = []
      map[tx.date].push(tx)
    }
    return map
  }, [transactions])

  // Daily totals for the current month
  const dailyTotals = useMemo(() => {
    const totals = {}
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
    for (const [date, txs] of Object.entries(byDate)) {
      if (date.startsWith(prefix)) {
        totals[parseInt(date.split('-')[2])] = txs.reduce((s, t) => s + (t.amount > 0 ? t.amount : 0), 0)
      }
    }
    return totals
  }, [byDate, currentYear, currentMonth])

  const maxDaily = Math.max(...Object.values(dailyTotals), 1)

  // Transactions for selected day
  const selectedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
  const dayTransactions = byDate[selectedDate] || []

  // For list view: transactions in current month, sorted by date desc
  const monthTransactions = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
    return transactions.filter((t) => t.date.startsWith(prefix))
  }, [transactions, currentYear, currentMonth])

  function prevMonth() {
    if (currentMonth === 0) { setCurrentYear((y) => y - 1); setCurrentMonth(11) }
    else setCurrentMonth((m) => m - 1)
    setSelectedDay(1)
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentYear((y) => y + 1); setCurrentMonth(0) }
    else setCurrentMonth((m) => m + 1)
    setSelectedDay(1)
  }

  const daysInMonth = getMonthDays(currentYear, currentMonth)
  const firstDow = getFirstDow(currentYear, currentMonth)
  const today = now.getDate()
  const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth()

  // Month total spending
  const monthTotal = Object.values(dailyTotals).reduce((a, b) => a + b, 0)
  const monthIncome = monthTransactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center border border-border rounded-lg text-text-muted hover:text-text-primary hover:border-border-glow transition-colors cursor-pointer">
            <ChevronLeft size={16} />
          </button>
          <h2 className="font-display font-600 text-lg text-text-primary w-48 text-center">{monthLabel}</h2>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center border border-border rounded-lg text-text-muted hover:text-text-primary hover:border-border-glow transition-colors cursor-pointer">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
            <span className="text-text-muted">Spent: <span className="text-danger">${Math.round(monthTotal).toLocaleString()}</span></span>
            <span className="text-text-muted">Income: <span className="text-success">${Math.round(monthIncome).toLocaleString()}</span></span>
          </div>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${viewMode === 'calendar' ? 'bg-gold/10 text-gold' : 'text-text-muted hover:text-text-secondary'}`}
            >
              <CalendarDays size={13} /> Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer transition-colors border-l border-border ${viewMode === 'list' ? 'bg-gold/10 text-gold' : 'text-text-muted hover:text-text-secondary'}`}
            >
              <List size={13} /> List
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            {/* DOW headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DOW.map((d) => (
                <div key={d} className="text-center text-[10px] font-mono text-text-muted py-1">{d}</div>
              ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {Array(firstDow).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const total = dailyTotals[day] || 0
                const intensity = total / maxDaily
                const isFuture = isCurrentMonth && day > today
                const isSelected = day === selectedDay
                const isToday = isCurrentMonth && day === today

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`relative aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-gold ring-offset-1 ring-offset-obsidian' : ''
                    }`}
                    style={{
                      background: isFuture
                        ? 'rgba(30, 41, 59, 0.3)'
                        : `rgba(247, 183, 49, ${0.03 + intensity * 0.3})`,
                      border: isToday ? '1.5px solid rgba(247, 183, 49, 0.5)' : '1px solid transparent',
                    }}
                  >
                    <span className={`text-xs font-mono ${isFuture ? 'text-text-muted/40' : isToday ? 'text-gold font-600' : 'text-text-secondary'}`}>
                      {day}
                    </span>
                    {total > 0 && !isFuture && (
                      <span className="text-[8px] font-mono text-text-muted mt-0.5">${Math.round(total)}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Day detail */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-600 text-sm text-text-primary">
                {new Date(currentYear, currentMonth, selectedDay).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </h3>
              <span className="text-xs font-mono text-text-muted">{dayTransactions.length} transactions</span>
            </div>
            {dayTransactions.length === 0 ? (
              <p className="text-text-muted text-sm py-8 text-center">No transactions this day</p>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto">
                {dayTransactions.sort((a, b) => b.amount - a.amount).map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="bg-card border border-border rounded-xl p-5">
          {monthTransactions.length === 0 ? (
            <p className="text-text-muted text-sm py-8 text-center">No transactions found</p>
          ) : (
            <div className="space-y-1">
              {/* Group by date */}
              {Object.entries(
                monthTransactions.reduce((groups, tx) => {
                  if (!groups[tx.date]) groups[tx.date] = []
                  groups[tx.date].push(tx)
                  return groups
                }, {})
              )
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([date, txs]) => (
                  <div key={date}>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-xs font-mono text-text-muted">
                        {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-xs font-mono text-text-muted">
                        ${Math.round(txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0))} spent
                      </span>
                    </div>
                    <div className="space-y-1 py-1">
                      {txs.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)).map((tx) => (
                        <TransactionRow key={tx.id} tx={tx} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TransactionRow({ tx }) {
  const isIncome = tx.amount < 0
  const initial = (tx.merchant_name || tx.name).charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-card-hover transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-600 flex-shrink-0 ${
        isIncome ? 'bg-success/10 text-success' : 'bg-border text-text-secondary'
      }`}>
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary truncate">{tx.merchant_name || tx.name}</p>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${categoryColor(tx.category)}`}>
          {prettyCat(tx.category)}
        </span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {isIncome ? <ArrowDownLeft size={12} className="text-success" /> : <ArrowUpRight size={12} className="text-danger" />}
        <span className={`font-mono text-sm font-500 ${isIncome ? 'text-success' : 'text-text-primary'}`}>
          {isIncome ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
        </span>
      </div>
    </div>
  )
}
