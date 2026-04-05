import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MessageSquare, Send, X, Sparkles } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const PRESET_QUESTIONS = [
  'Which blind spot should I fix first?',
  'How much can I save this month?',
  'What are my most dangerous spending days?',
]

export default function AiChat({ insights = [], itemId }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "I've analyzed your financial blind spots. Ask me anything about your spending patterns, and I'll give you specific, actionable advice.",
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  function handleSend(text) {
    const question = text || input.trim()
    if (!question) return

    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setInput('')
    setIsTyping(true)

    fetch(`${API}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, question, insights }),
    })
      .then((r) => r.json())
      .then((data) => {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.answer || 'Sorry, I could not generate a response.' }])
        setIsTyping(false)
      })
      .catch(() => {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
        setIsTyping(false)
      })
  }

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gold text-obsidian flex items-center justify-center cursor-pointer shadow-lg"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{ boxShadow: '0 0 30px rgba(247, 183, 49, 0.25)' }}
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-48px)] bg-surface border border-border rounded-2xl overflow-hidden flex flex-col"
            style={{ height: '480px', boxShadow: '0 0 60px rgba(0,0,0,0.4)' }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gold-dim flex items-center justify-center">
                <Sparkles size={14} className="text-gold" />
              </div>
              <div>
                <p className="text-sm font-display font-600 text-text-primary">Ask Blind Spot</p>
                <p className="text-[10px] text-text-muted font-mono">Powered by Claude AI</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gold/15 text-text-primary rounded-br-md'
                        : 'bg-card border border-border text-text-secondary rounded-bl-md'
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary font-500">$1</strong>'),
                    }}
                  />
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1 px-3 py-2"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-text-muted"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Presets */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {PRESET_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="px-2.5 py-1 text-[11px] text-text-secondary bg-card border border-border rounded-lg hover:border-border-glow transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about your finances..."
                  className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/30 transition-colors"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="w-9 h-9 flex items-center justify-center bg-gold text-obsidian rounded-lg disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
