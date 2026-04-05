import { useState, useCallback } from 'react'
import { AnimatePresence } from 'motion/react'
import Landing from './components/Landing'
import PlaidConnect from './components/PlaidConnect'
import AnalysisLoader from './components/AnalysisLoader'
import Dashboard from './components/Dashboard'
import { INSIGHTS, SPENDING_DATA, DANGER_CALENDAR } from './data/mockData'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const isDemo = new URLSearchParams(window.location.search).has('demo')

export default function App() {
  const [view, setView] = useState(isDemo ? 'dashboard' : 'landing')
  const [connectionInfo, setConnectionInfo] = useState(isDemo ? { institution: 'Demo Bank', accounts: [{ mask: '1234' }] } : null)
  const [analysisResults, setAnalysisResults] = useState(isDemo ? { insights: INSIGHTS, spendingData: SPENDING_DATA, dangerCalendar: DANGER_CALENDAR } : null)

  const handleConnectComplete = useCallback((info) => {
    setConnectionInfo(info)
    setView('analyzing')
  }, [])

  const handleAnalysisComplete = useCallback((results) => {
    setAnalysisResults(results)
    setView('dashboard')
  }, [])

  const handleReset = useCallback(() => {
    setView('landing')
    setConnectionInfo(null)
    setAnalysisResults(null)
  }, [])

  return (
    <>
      <div className="noise-overlay" />
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <Landing key="landing" onConnect={() => setView('connecting')} />
        )}
        {view === 'connecting' && (
          <PlaidConnect key="connecting" onComplete={handleConnectComplete} />
        )}
        {view === 'analyzing' && (
          <AnalysisLoader
            key="analyzing"
            itemId={connectionInfo?.itemId}
            apiUrl={API}
            onComplete={handleAnalysisComplete}
          />
        )}
        {view === 'dashboard' && (
          <Dashboard
            key="dashboard"
            insights={analysisResults?.insights || []}
            spendingData={analysisResults?.spendingData || []}
            dangerCalendar={analysisResults?.dangerCalendar || []}
            connectionInfo={connectionInfo}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </>
  )
}
