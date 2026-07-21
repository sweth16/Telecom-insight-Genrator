import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info, RefreshCw, X } from 'lucide-react'
import { staggerItem } from '../animations/variants'

const SEVERITY_CONFIG = {
  critical: {
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.22)',
    icon: AlertCircle, label: 'CRITICAL',
  },
  warning: {
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.22)',
    icon: AlertTriangle, label: 'WARNING',
  },
  info: {
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.07)',
    border: 'rgba(37,99,235,0.20)',
    icon: Info, label: 'INFO',
  },
}

const TYPE_ICONS = {
  HIGH_LATENCY: '⚡', PACKET_LOSS: '⊗',
  DROPPED_CALLS: '📵', CONGESTION: '⤴', WEAK_SIGNAL: '📶',
}

function AlertCard({ alert, onDismiss }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = SEVERITY_CONFIG[alert.severity]
  const Icon = cfg.icon

  return (
    <motion.div
      variants={staggerItem} layout
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="rounded-xl overflow-hidden cursor-pointer group"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-3">
        <div className="flex items-start gap-2.5">
          <div className="relative flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
            {alert.severity === 'critical' && (
              <motion.div
                animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full"
                style={{ background: cfg.color }}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-[9px] font-mono tracking-[0.12em] font-semibold" style={{ color: cfg.color }}>
                {TYPE_ICONS[alert.type]} {alert.type.replace(/_/g, ' ')}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>{alert.time}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDismiss(alert.id) }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={10} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>📍 {alert.city}</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--bg-card-border)' }}>
                <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Alert ID</p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>ALT-{String(alert.id).padStart(4,'0')}</p>
                  </div>
                  <div>
                    <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Severity</p>
                    <p className="text-[10px] font-mono font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function AlertPanel({ anomalies, loading }) {
  const [dismissed, setDismissed] = useState([])
  const [filter, setFilter] = useState('all')

  const visible = (anomalies || []).filter(a => !dismissed.includes(a.id) && (filter === 'all' || a.severity === filter))
  const criticalCount = visible.filter(a => a.severity === 'critical').length
  const warningCount  = visible.filter(a => a.severity === 'warning').length

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col h-full"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)', boxShadow: 'var(--shadow-card)' }}>

      {/* Header */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--bg-card-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444' }}
            />
            <h3 className="text-xs font-display font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Live Anomalies
            </h3>
          </div>
          <motion.button whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}
            style={{ color: 'var(--text-muted)' }}>
            <RefreshCw size={12} />
          </motion.button>
        </div>

        <div className="flex gap-2 mb-3">
          {criticalCount > 0 && (
            <span className="text-[9px] font-mono px-2 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)', color: '#ef4444' }}>
              {criticalCount} CRITICAL
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-[9px] font-mono px-2 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.22)', color: '#f59e0b' }}>
              {warningCount} WARNING
            </span>
          )}
        </div>

        <div className="flex gap-1.5">
          {['all', 'critical', 'warning', 'info'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="text-[9px] font-mono px-2 py-1 rounded-lg capitalize transition-all"
              style={filter === f
                ? { background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', color: '#2563eb' }
                : { color: 'var(--text-muted)' }
              }>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl shimmer"
              style={{ background: 'var(--bg-secondary)' }} />
          ))
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <div className="text-2xl mb-2">✓</div>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>All systems nominal</p>
          </div>
        ) : (
          <AnimatePresence>
            {visible.map(alert => (
              <AlertCard key={alert.id} alert={alert}
                onDismiss={(id) => setDismissed(prev => [...prev, id])} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
