import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { LogOut, Receipt, CreditCard, PieChart, Lightbulb, TrendingUp, Search, Download } from 'lucide-react'
import Logo from './Logo'
import TransactionsTab from './tabs/TransactionsTab'
import SubscriptionsTab from './tabs/SubscriptionsTab'
import SpendingTab from './tabs/SpendingTab'
import BlindSpotsTab from './tabs/BlindSpotsTab'
import TrendsTab from './tabs/TrendsTab'
import AiChat from './AiChat'
import { generateMockTransactions, detectSubscriptionsFromTransactions, computeSpendingAnalytics, computeTrends, exportToCSV } from '../data/mockTransactions'

const TABS = [
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'spending', label: 'Spending', icon: PieChart },
  { id: 'blindspots', label: 'Blind Spots', icon: Lightbulb },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
]

export default function Dashboard({ insights, spendingData, dangerCalendar, connectionInfo, onReset }) {
  const [activeTab, setActiveTab] = useState('transactions')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  // Generate mock transactions (in real mode, these would come from the backend)
  const transactions = useMemo(() => generateMockTransactions(), [])
  const subscriptions = useMemo(() => detectSubscriptionsFromTransactions(transactions), [transactions])
  const analytics = useMemo(() => computeSpendingAnalytics(transactions), [transactions])
  const trends = useMemo(() => computeTrends(transactions), [transactions])

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions
    const q = searchQuery.toLowerCase()
    return transactions.filter(
      (t) =>
        (t.merchant_name || t.name).toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.amount.toString().includes(q)
    )
  }, [transactions, searchQuery])

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Header */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <div>
              <h1 className="font-display font-700 text-base text-text-primary leading-none">Blind Spot</h1>
              <p className="text-[10px] text-text-muted font-mono mt-0.5">Financial Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-secondary border border-border rounded-lg transition-colors cursor-pointer"
            >
              <Search size={14} />
            </button>
            {/* Export */}
            <button
              onClick={() => exportToCSV(transactions)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-muted border border-border rounded-lg hover:border-border-glow transition-colors cursor-pointer"
            >
              <Download size={12} /> Export
            </button>
            <span className="text-xs text-text-muted font-mono hidden md:block">
              {connectionInfo?.institution || 'Bank'} {connectionInfo?.accounts?.[0]?.mask ? `•••${connectionInfo.accounts[0].mask}` : ''}
            </span>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-muted border border-border rounded-lg hover:border-border-glow transition-colors cursor-pointer"
            >
              <LogOut size={12} /> <span className="hidden sm:inline">Disconnect</span>
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="max-w-7xl mx-auto px-6 lg:px-10 py-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search transactions, merchants, categories..."
                    className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/30 transition-colors"
                    autoFocus
                  />
                  {searchQuery && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted">
                      {filteredTransactions.length} results
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tab bar */}
      <div className="border-b border-border sticky top-[52px] z-20 bg-obsidian/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-500 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id ? 'text-gold' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'transactions' && (
              <TransactionsTab transactions={filteredTransactions} searchQuery={searchQuery} />
            )}
            {activeTab === 'subscriptions' && (
              <SubscriptionsTab subscriptions={subscriptions} />
            )}
            {activeTab === 'spending' && (
              <SpendingTab analytics={analytics} />
            )}
            {activeTab === 'blindspots' && (
              <BlindSpotsTab insights={insights} spendingData={spendingData} dangerCalendar={dangerCalendar} />
            )}
            {activeTab === 'trends' && (
              <TrendsTab data={trends} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <AiChat insights={insights} itemId={connectionInfo?.itemId} />
    </div>
  )
}
