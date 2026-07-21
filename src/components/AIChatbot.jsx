import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, X, Minimize2, Maximize2, RotateCcw, Zap, Brain } from 'lucide-react'
import { chatSlideUp } from '../animations/variants'
import { askNLQ, askAnomaly } from '../services/api'

const STORAGE_KEY = 'telecom_ai_chat'
const HEIGHT_STORAGE_KEY = 'telecom_ai_chat_height'
const DEFAULT_HEIGHT = '92vh'
const MIN_HEIGHT = '300px'
const MAX_HEIGHT = '95vh'

const SOURCE_COLORS = {
  NLQ_AGENT: { color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.18)' },
  INSIGHT_ENGINE: { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.18)' },
  ANOMALY_AGENT: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.18)' },
  NLQ_CACHE: { color: '#0d9488', bg: 'rgba(13,148,136,0.08)', border: 'rgba(13,148,136,0.18)' },
  NLQ_DB_CACHE: { color: '#0d9488', bg: 'rgba(13,148,136,0.08)', border: 'rgba(13,148,136,0.18)' },
  INSIGHT_CACHE: { color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.18)' },
  INSIGHT_DB_CACHE: { color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.18)' },
  GUARDRAIL: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)' },
}

// Sample questions removed per user request
const SUGGESTIONS = []

// Normalize source names from backend to internal format
function normalizeSource(source) {
  if (!source) return 'INSIGHT_ENGINE'
  const normalized = source.toUpperCase().replace(/\s+/g, '_')
  
  // Map common variations - expanded for all agents and cache types including DB cache
  const mappings = {
    // NLQ Agent variations
    'NLQ_AGENT': 'NLQ_AGENT',
    'NLQAGENT': 'NLQ_AGENT',
    'NLQ': 'NLQ_AGENT',
    // Insight Engine variations
    'INSIGHT_ENGINE': 'INSIGHT_ENGINE',
    'INSIGHTENGINE': 'INSIGHT_ENGINE',
    'INSIGHT': 'INSIGHT_ENGINE',
    // Anomaly Agent variations
    'ANOMALY_AGENT': 'ANOMALY_AGENT',
    'ANOMALYAGENT': 'ANOMALY_AGENT',
    'ANOMALY': 'ANOMALY_AGENT',
    // NLQ Cache variations (including DB cache)
    'NLQ_CACHE': 'NLQ_CACHE',
    'NLQCACHE': 'NLQ_CACHE',
    'NLQ_CACHED': 'NLQ_CACHE',
    'NLQ_DB_CACHE': 'NLQ_DB_CACHE',
    'NLQDBCACHE': 'NLQ_DB_CACHE',
    'NLQ_DB': 'NLQ_DB_CACHE',
    // Insight Cache variations (including DB cache)
    'INSIGHT_CACHE': 'INSIGHT_CACHE',
    'INSIGHTCACHE': 'INSIGHT_CACHE',
    'INSIGHT_CACHED': 'INSIGHT_CACHE',
    'INSIGHT_DB_CACHE': 'INSIGHT_DB_CACHE',
    'INSIGHTDBCACHE': 'INSIGHT_DB_CACHE',
    'INSIGHT_DB': 'INSIGHT_DB_CACHE',
    // Anomaly Cache variations
    'ANOMALY_CACHE': 'ANOMALY_AGENT',
    'ANOMALYDBCACHE': 'ANOMALY_AGENT',
    'ANOMALY_DB_CACHE': 'ANOMALY_AGENT',
    // Generic cache mapping (treat as NLQ cache)
    'CACHE': 'NLQ_CACHE',
    'CACHED': 'NLQ_CACHE',
    'DB_CACHE': 'NLQ_DB_CACHE',
    'DBCACHE': 'NLQ_DB_CACHE',
    // Guardrail
    'GUARDRAIL': 'GUARDRAIL',
  }
  
  return mappings[normalized] || 'INSIGHT_ENGINE'
}

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user'
  const cfg = msg.source ? SOURCE_COLORS[msg.source] : null

  // Format text with better styling for bullet points
  const formatText = (text) => {
    let html = text
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0f172a; font-weight:600">$1</strong>')
      // Bullet points
      .replace(/^\* /gm, '• ')
      // Line breaks
      .replace(/\n/g, '<br/>')
    
    return html
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 rounded-full bg-slate-200 p-2 shadow-[0_8px_22px_rgba(15,23,42,0.08)]">
          <MessageSquare size={16} className="text-slate-700" />
        </div>
      )}

      <div className="max-w-[82%] flex flex-col gap-2">
        <div
          className="rounded-[28px] px-5 py-4 text-sm leading-7 flex items-center"
          style={isUser ? {
            background: 'linear-gradient(135deg, rgba(37,99,235,0.18), rgba(124,58,237,0.18))',
            border: '1px solid rgba(37,99,235,0.24)',
            color: '#0f172a',
            borderBottomRightRadius: '16px',
          } : {
            background: cfg ? cfg.bg : '#f8fafc',
            border: cfg ? `1px solid ${cfg.border}` : '1px solid rgba(15,23,42,0.12)',
            color: '#0f172a',
            borderBottomLeftRadius: '16px',
            boxShadow: 'inset 0 0 0 1px rgba(15,23,42,0.03)',
          }}
        >
          {msg.isLoading ? (
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400 animate-pulse" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400 animate-pulse delay-150" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400 animate-pulse delay-300" />
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{
              __html: formatText(msg.text)
            }} />
          )}
        </div>

        <div className={`flex flex-wrap items-center gap-2 text-[11px] ${isUser ? 'justify-end' : 'justify-start'}`}>
          {cfg && (
            <span className="rounded-full px-2 py-1" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              {msg.source.replace(/_/g, ' ')}
            </span>
          )}
          <span className="text-slate-500">{msg.time}</span>
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 rounded-3xl bg-slate-100 p-3">
          <MessageSquare size={18} className="text-slate-700" />
        </div>
      )}
    </motion.div>
  )
}

export default function AIChatbot({ open, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello 👋 I\'m Telecom Insight Generator. Ask me some queries like latency, anomalies, carrier performance, and more!',
      source: 'INSIGHT_ENGINE',
      time: 'now',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [logQueries, setLogQueries] = useState(true)
  const [cacheResponses, setCacheResponses] = useState(true)

  const [chatHeight, setChatHeight] = useState(DEFAULT_HEIGHT)
  const [isResizing, setIsResizing] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const resizeHandleRef = useRef(null)
  const chatContainerRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setMessages(JSON.parse(saved))
      } catch (error) {
        console.warn('Failed to restore chat history:', error)
      }
    }
    
    // Load settings
    const loadSettings = () => {
      try {
        const settings = localStorage.getItem('platformSettings')
        if (settings) {
          const parsed = JSON.parse(settings)
          setLogQueries(parsed.logQueries !== false)
          setCacheResponses(parsed.cacheResponses !== false)
          console.log('[AIChatbot] Settings loaded:', { logQueries: parsed.logQueries !== false, cacheResponses: parsed.cacheResponses !== false })
        }
      } catch (err) {
        console.error('[AIChatbot] Failed to load settings:', err)
      }
    }
    
    loadSettings()
    
    // Check for settings changes
    const settingsInterval = setInterval(loadSettings, 5000)
    return () => clearInterval(settingsInterval)
  }, [])

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open, minimized])

  useEffect(() => {
    // Restore saved height
    const savedHeight = localStorage.getItem(HEIGHT_STORAGE_KEY)
    if (savedHeight) {
      setChatHeight(savedHeight)
    }
  }, [])

  useEffect(() => {
    // Only save messages if query logging is enabled
    if (logQueries) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      console.log('[AIChatbot] Messages saved to history (logging enabled)')
    } else {
      // Clear saved messages if logging is disabled
      localStorage.removeItem(STORAGE_KEY)
      console.log('[AIChatbot] Messages not saved (logging disabled)')
    }
  }, [messages, logQueries])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  // Resize functionality
  useEffect(() => {
    const handleMouseDown = () => {
      setIsResizing(true)
    }

    const handleMouseMove = (e) => {
      if (!isResizing || !chatContainerRef.current) return

      const chatRect = chatContainerRef.current.getBoundingClientRect()
      const distanceFromBottom = window.innerHeight - e.clientY
      const newHeight = window.innerHeight - chatRect.top - 24 + distanceFromBottom

      // Parse MAX_HEIGHT (convert '95vh' to pixels)
      const maxHeightPx = window.innerHeight * 0.95
      const minHeightPx = 300
      const clampedHeight = Math.max(minHeightPx, Math.min(newHeight, maxHeightPx))

      setChatHeight(`${clampedHeight}px`)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      // Save height to localStorage
      localStorage.setItem(HEIGHT_STORAGE_KEY, chatHeight)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, chatHeight])

  const extractAnswer = (result) => {
    if (!result) return 'No response received.'
    if (typeof result === 'string') return result
    
    // Handle guardrail rejection
    if (result.source === 'GUARDRAIL' && result.status === 'REJECTED') {
      return `⚠️ ${result.message || 'Request outside supported domain. Please ask about network latency, packet loss, bandwidth, KPI metrics, anomalies, or telecom performance.'}`
    }
    
    // Extract natural answer from various response formats
    if (result.insights) return result.insights
    if (result.answer) return result.answer
    if (result.response) return result.response
    if (result.message) return result.message
    if (result.data) return typeof result.data === 'string' ? result.data : JSON.stringify(result.data)
    if (result.anomalies?.length) {
      return `Detected ${result.anomalies.length} anomaly event(s):\n` + result.anomalies.map(a => `• ${a.region}: ${a.issue} (${a.severity})`).join('\n')
    }
    if (result.reason) return result.reason
    if (result.status === 'FAILED') return result.reason || 'Could not process this request.'
    
    return JSON.stringify(result)
  }

  const runAnomalyScan = async () => {
    if (loading) return
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { role: 'user', text: 'Run anomaly scan', time: now }])
    setLoading(true)

    try {
      const result = await askAnomaly()
      const responseText = result?.message || result?.status || 'Anomaly scan completed.'
      
      // Extract source from response
      let source = result?.source || result?.agent || 'ANOMALY_AGENT'
      const normalizedSource = normalizeSource(source)
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: responseText,
        source: normalizedSource,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Anomaly scan failed. Please try again later.',
        source: 'ANOMALY_AGENT',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }])
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (rawText) => {
    const text = rawText || input.trim()
    if (!text || loading) return
    setInput('')
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { role: 'user', text, time: now }])
    setLoading(true)

    try {
      const result = await askNLQ(text)
      
      // Extract source from various possible locations in the response
      let source = result?.source
      if (!source && result?.metadata?.source) source = result.metadata.source
      if (!source && result?.agent) source = result.agent
      if (!source && result?.type) source = result.type
      
      // Debug logging
      console.log('[AIChatbot] Backend response:', result)
      console.log('[AIChatbot] Extracted source:', source)
      
      const normalizedSource = normalizeSource(source)
      console.log('[AIChatbot] Normalized source:', normalizedSource)
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: extractAnswer(result),
        source: normalizedSource,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch (error) {
      console.error('[AIChatbot] Error:', error.message)
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `❌ Backend Error: ${error.message}. Please check if the backend server is running at http://localhost:9021`,
        source: 'INSIGHT_ENGINE',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {/* Backdrop - Click outside to close */}
      <motion.div
        key="chatbot-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ pointerEvents: 'auto' }}
      />
      
      <motion.div
        key="chatbot"
        variants={chatSlideUp}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="fixed top-4 right-6 z-50 flex flex-col"
        ref={chatContainerRef}
        style={{ width: minimized ? 320 : 520, height: chatHeight, maxHeight: MAX_HEIGHT }}
      >
        <div className="flex flex-col h-full rounded-[32px] overflow-hidden border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
          <div className="flex items-center justify-between px-5 py-4 bg-slate-950 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-violet-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                <MessageSquare size={20} />
              </div>
              <div>
                <p className="font-bold text-base" style={{ color: '#FFFFFF' }}>Telecom Insight Generator</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setMessages([messages[0]])} className="rounded-2xl p-2 text-slate-300 hover:bg-white/10 hover:text-white transition">
                <RotateCcw size={16} />
              </button>
              <button onClick={() => setMinimized(!minimized)} className="rounded-2xl p-2 text-slate-300 hover:bg-white/10 hover:text-white transition">
                {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button onClick={onClose} className="rounded-2xl p-2 text-slate-300 hover:bg-white/10 hover:text-white transition">
                <X size={16} />
              </button>
            </div>
          </div>

          {minimized ? (
            <div className="px-5 py-4 bg-slate-50 text-slate-600 text-sm">Chat minimized. Click the header icons to expand or close.</div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300/70 scrollbar-track-slate-100">
                {messages.map((msg, index) => <ChatBubble key={index} msg={msg} />)}
                {loading && (
                  <ChatBubble msg={{
                    role: 'assistant',
                    text: 'Thinking...',
                    source: 'INSIGHT_ENGINE',
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    isLoading: true,
                  }} />
                )}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-slate-200 bg-white px-5 pb-5 pt-4">
                <div className="flex items-end gap-3">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    rows={1}
                    placeholder="Ask about latency, carriers, predictions, or anomalies..."
                    className="min-h-[52px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                  <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.25)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
