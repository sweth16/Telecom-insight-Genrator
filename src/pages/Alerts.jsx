import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, AlertTriangle, Info, RefreshCw, Filter } from 'lucide-react'
import { useAnomalies } from '../hooks/index'
import { pageTransition, staggerItem } from '../animations/variants'

const SEVERITY_CONFIG = {
  critical: {
    title: 'Critical', color: '#ef4444', accent: 'rgba(255,51,102,0.08)', border: 'rgba(239,68,68,0.16)',
    icon: AlertCircle,
  },
  warning: {
    title: 'Warning', color: '#f59e0b', accent: 'rgba(255,140,0,0.08)', border: 'rgba(255,140,0,0.16)',
    icon: AlertTriangle,
  },
  info: {
    title: 'Info', color: '#2563eb', accent: 'rgba(0,212,255,0.08)', border: 'rgba(37,99,235,0.16)',
    icon: Info,
  },
}

const TYPE_ICONS = {
  HIGH_LATENCY: '⚡', PACKET_LOSS: '⊗', DROPPED_CALLS: '📵', CONGESTION: '⤴', WEAK_SIGNAL: '📶',
}

const TYPE_RECOMMENDATIONS = {
  HIGH_LATENCY: {
    title: 'Investigate abnormal network latency and possible congestion',
    actions: [
      'Investigate abnormal network latency and possible congestion',
      'Analyze backhaul and routing performance for bottlenecks',
      'Check for radio or signal interference',
      'Analyze traffic utilization patterns',
    ],
  },
  LATENCY_SPIKE: {
    title: 'Investigate abnormal network latency and possible congestion',
    actions: [
      'Investigate abnormal network latency and possible congestion',
      'Analyze backhaul and routing performance for bottlenecks',
      'Verify backhaul link stability',
      'Monitor core network performance metrics',
    ],
  },
  PACKET_LOSS: {
    title: 'Inspect packet loss and routing issues',
    actions: [
      'Inspect packet loss and routing issues',
      'Verify core network health',
      'Monitor QoS degradation closely',
      'Analyze subscriber impact severity',
    ],
  },
  DROPPED_CALLS: {
    title: 'Analyze dropped call spikes in the region',
    actions: [
      'Analyze dropped call spikes in the region',
      'Investigate possible hardware failure',
      'Optimize load balancing across nearby cells',
      'Initiate immediate troubleshooting for affected nodes',
    ],
  },
  DEVICE_FAILURE: {
    title: 'Verify device firmware and modem stability issues',
    actions: [
      'Verify device firmware and modem stability issues',
      'Compare failure trends across affected device models',
      'Check for radio or signal interference',
      'Monitor recurring anomalies in the region',
    ],
  },
  CONGESTION: {
    title: 'Re-route traffic to reduce congestion',
    actions: [
      'Check network congestion in the affected area',
      'Re-route traffic to reduce congestion',
      'Optimize load balancing across nearby cells',
      'Restore service quality through traffic optimization',
    ],
  },
  QUALITY_DEGRADATION: {
    title: 'Inspect QoS degradation affecting voice and data services',
    actions: [
      'Inspect QoS degradation affecting voice and data services',
      'Optimize RAN utilization and traffic distribution',
      'Validate core network health',
      'Analyze subscriber impact severity',
    ],
  },
  WEAK_SIGNAL: {
    title: 'Check for radio or signal interference',
    actions: [
      'Inspect affected tower performance',
      'Check for radio or signal interference',
      'Verify device firmware compatibility',
      'Perform preventive maintenance on impacted sites',
    ],
  },
}

function getRecommendations(alertType) {
  // Try exact match first
  if (TYPE_RECOMMENDATIONS[alertType]) {
    return TYPE_RECOMMENDATIONS[alertType]
  }
  
  // Try to match base alert type (e.g., LATENCY_SPIKE from LATENCY_SPIKE_DALLAS)
  const baseTypes = ['LATENCY_SPIKE', 'QUALITY_DEGRADATION', 'DEVICE_FAILURE', 'CONGESTION', 'DROPPED_CALLS', 'PACKET_LOSS', 'HIGH_LATENCY', 'WEAK_SIGNAL']
  for (const baseType of baseTypes) {
    if (alertType?.includes(baseType)) {
      return TYPE_RECOMMENDATIONS[baseType]
    }
  }
  
  // Fallback
  return TYPE_RECOMMENDATIONS[alertType] || null
}

function AlertCard({ alert, focused = false }) {
  const [open, setOpen] = useState(focused)
  const cfg = SEVERITY_CONFIG[alert.severity]
  const Icon = cfg.icon

  useEffect(() => {
    setOpen(focused)
  }, [focused])

  return (
    <motion.div
      id={`alert-${alert.id}`}
      variants={staggerItem}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      whileHover={{ y: -4 }}
      className="rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden"
      style={focused ? { borderColor: '#2563eb', boxShadow: '0 0 0 2px rgba(37,99,235,0.15)' } : undefined}
    >
      <div className="px-6 py-5">
        <div className="flex items-start gap-5">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-3xl"
            style={{ background: cfg.accent, border: `1px solid ${cfg.border}` }}>
            <Icon size={20} style={{ color: cfg.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: cfg.color }}>{cfg.title}</span>
                  <span className="text-[10px] text-slate-400">{TYPE_ICONS[alert.type]} {alert.type.replace(/_/g, ' ')}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-950">
                  {alert.message?.replace(/\*\*/g, '')}
                </h3>
                <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-mono text-slate-500">
                  <span>{alert.type?.includes('DEVICE_FAILURE') ? 'Device Type' : 'Location'}: {alert.city}</span>
                  <span>Alert ID: ALT-{String(alert.id).padStart(4,'0')}</span>
                  <span>Status: <span className="text-slate-700">Investigating</span></span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-semibold" style={{ color: cfg.color }}>{alert.value}</div>
                <div className="mt-2 text-[10px] text-slate-400">{alert.time}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold" style={{ border: `1px solid ${cfg.border}`, color: cfg.color }}>Active</span>
          </div>
          <button onClick={() => setOpen(prev => !prev)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100">
            {open ? 'Hide details' : 'Show details'}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden space-y-4"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Detected', value: alert.time },
                  { label: alert.type?.includes('DEVICE_FAILURE') ? 'Device Type' : 'Region', value: alert.region || 'National' },
                  { label: 'Impact', value: alert.impact || 'High' },
                ].map(item => (
                  <div key={item.label} className="rounded-3xl bg-white p-4 border border-slate-200">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-[12px] font-semibold text-slate-700">{item.value}</p>
                  </div>
                ))}
              </div>

              {(() => {
                const rec = getRecommendations(alert.type)
                if (!rec) return null
                return (
                  <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 p-5 border border-blue-200">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-blue-600 font-semibold mb-4">{rec.title}</p>
                    <ul className="space-y-2">
                      {rec.actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="mt-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">{idx + 1}</span>
                          <span className="text-[12px] text-slate-700">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function AlertsPage() {
  const [filter, setFilter] = useState('all')
  const [searchParams] = useSearchParams()
  const selectedId = Number(searchParams.get('id')) || null
  const { data: alertsRaw, loading: alertsLoading, refetch: refetchAlerts } = useAnomalies()
  const alerts = alertsRaw ?? []

  const filtered = alerts.filter(a =>
    filter === 'all' || a.severity === filter || a.id === selectedId
  )

  useEffect(() => {
    if (!selectedId) return
    const target = document.getElementById(`alert-${selectedId}`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [selectedId, alerts])

  const counts = {
    all: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" className="space-y-6">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex h-3 w-3 rounded-full bg-neon-red shadow-[0_0_16px_rgba(239,68,68,0.3)]" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Live feed</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Anomaly Alerts</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">A premium view of current network anomalies, prioritized by severity and impact. Drill into any alert for recommended action items and status details.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => refetchAlerts()}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { key: 'all', label: 'Total Alerts', value: counts.all, accent: 'from-slate-900 to-slate-700' },
          { key: 'critical', label: 'Critical', value: counts.critical, accent: 'from-red-500 to-rose-500' },
          { key: 'warning', label: 'Warning', value: counts.warning, accent: 'from-amber-500 to-orange-500' },
        ].map(card => (
          <button key={card.key} onClick={() => setFilter(card.key)}
            className={`rounded-[28px] p-5 text-left transition ${filter === card.key ? 'shadow-[0_20px_60px_rgba(15,23,42,0.18)]' : 'hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]'}`}
            style={{ background: filter === card.key ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {alertsLoading ? (
          <div className="rounded-[32px] border border-slate-200 bg-white/5 p-10 text-center text-slate-400">Loading alerts...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[32px] border border-slate-200 bg-white/5 p-10 text-center text-slate-400">No alerts match the selected filter.</div>
        ) : (
          <AnimatePresence>
            {filtered.map(alert => (
              <AlertCard key={alert.id} alert={alert} focused={alert.id === selectedId} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}
