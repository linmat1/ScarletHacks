import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { usePlaidLink } from 'react-plaid-link'
import { Lock, Loader2, Check } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const backdrop = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3, delay: 0.2 } },
}
const modal = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.3 } },
}

export default function PlaidConnect({ onComplete }) {
  const [linkToken, setLinkToken] = useState(null)
  const [status, setStatus] = useState('loading') // loading → ready → linking → done → error
  const [statusText, setStatusText] = useState('Initializing secure connection...')
  const [error, setError] = useState(null)

  // 1. Fetch link token on mount
  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch(`${API}/api/plaid/create-link-token`, { method: 'POST' })
        const data = await res.json()
        if (data.link_token) {
          setLinkToken(data.link_token)
          setStatus('ready')
        } else {
          throw new Error(data.error || 'No link token returned')
        }
      } catch (err) {
        console.error(err)
        setError(err.message)
        setStatus('error')
      }
    }
    fetchToken()
  }, [])

  // 2. Handle Plaid Link success
  const onSuccess = useCallback(
    async (publicToken, metadata) => {
      setStatus('linking')
      setStatusText('Connecting to your bank...')

      try {
        // Exchange token
        const exchangeRes = await fetch(`${API}/api/plaid/exchange-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token: publicToken }),
        })
        const { item_id } = await exchangeRes.json()

        setStatusText('Fetching transactions...')

        // Fetch transactions
        const txRes = await fetch(`${API}/api/plaid/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_id }),
        })
        const txData = await txRes.json()

        setStatus('done')
        setStatusText(`${txData.transaction_count} transactions loaded`)

        // Pass item_id and account info up
        setTimeout(() => {
          onComplete({
            itemId: item_id,
            transactionCount: txData.transaction_count,
            accounts: txData.accounts,
            institution: metadata.institution?.name || 'Bank',
          })
        }, 1200)
      } catch (err) {
        console.error(err)
        setError(err.message)
        setStatus('error')
      }
    },
    [onComplete]
  )

  // 3. Configure Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit: () => {
      // User closed Plaid Link without connecting
    },
  })

  // Auto-open Plaid Link when ready
  useEffect(() => {
    if (status === 'ready' && ready) {
      open()
    }
  }, [status, ready, open])

  return (
    <motion.div
      variants={backdrop}
      initial="hidden"
      animate="show"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/80 backdrop-blur-md p-4"
    >
      <motion.div
        variants={modal}
        className="relative w-full max-w-md bg-surface border border-border rounded-2xl"
        style={{ boxShadow: '0 0 80px rgba(0,0,0,0.5), 0 0 40px rgba(247, 183, 49, 0.05)' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-gold-dim flex items-center justify-center">
              <Lock size={12} className="text-gold" />
            </div>
            <span className="text-text-muted text-xs font-mono">PLAID SECURE CONNECT</span>
          </div>
          <h2 className="font-display font-700 text-xl text-text-primary">
            {status === 'loading' && 'Preparing...'}
            {status === 'ready' && 'Connect your bank'}
            {status === 'linking' && 'Connecting...'}
            {status === 'done' && 'Connected!'}
            {status === 'error' && 'Connection Error'}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {(status === 'loading' || status === 'ready') && (
            <div className="flex flex-col items-center py-8">
              <motion.div
                className="w-16 h-16 rounded-full border-2 border-gold/30 flex items-center justify-center mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 size={28} className="text-gold" />
              </motion.div>
              <p className="text-text-secondary text-sm">
                {status === 'loading' ? 'Initializing secure connection...' : 'Opening Plaid Link...'}
              </p>
              {status === 'ready' && (
                <button
                  onClick={() => open()}
                  className="mt-4 px-6 py-2 bg-gold text-obsidian font-display font-600 rounded-lg cursor-pointer text-sm"
                >
                  Open Bank Connection
                </button>
              )}
            </div>
          )}

          {status === 'linking' && (
            <div className="flex flex-col items-center py-8">
              <motion.div
                className="w-16 h-16 rounded-full border-2 border-gold/30 flex items-center justify-center mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 size={28} className="text-gold" />
              </motion.div>
              <p className="text-text-secondary text-sm">{statusText}</p>
            </div>
          )}

          {status === 'done' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8"
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-success-dim border border-success/20 flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Check size={28} className="text-success" />
              </motion.div>
              <p className="text-text-primary font-display font-600">Bank connected</p>
              <p className="text-text-muted text-sm mt-1">{statusText}</p>
            </motion.div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-full bg-danger-dim border border-danger/20 flex items-center justify-center mb-4">
                <span className="text-danger text-2xl">!</span>
              </div>
              <p className="text-text-primary font-display font-600">Something went wrong</p>
              <p className="text-text-muted text-sm mt-1 text-center max-w-xs">{error}</p>
              <p className="text-text-muted text-xs mt-3">Check that your .env file has valid Plaid credentials.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
