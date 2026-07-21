import { motion } from 'framer-motion'
import { staggerItem, defaultTransition } from '../animations/variants'
import { useSystemStatus } from '../hooks/index'

function SystemStatus() {
  const { data, loading, error } = useSystemStatus()

  // Map backend data to systems array
  const systems = [
    { name: 'Uptime', status: data?.uptime || '99.3%', type: 'metric' },
    { name: 'Nodes', status: data?.nodes ? data.nodes.toLocaleString() : '68,822', type: 'metric' },
    { name: 'QoS', status: data?.qos || '51.0%', type: 'metric' },
    { name: 'Secure', status: data?.secure || 'AES-256', type: 'metric' },
  ]

  return (
    <motion.div
      variants={staggerItem}
      transition={defaultTransition}
      className="bg-gradient-to-br from-slate-900/40 to-slate-800/20 rounded-2xl p-6 border border-slate-700/30 backdrop-blur-sm"
    >
      {/* Header */}
      <h3 className="text-white font-semibold text-lg mb-4">System Status</h3>

      {/* Overall Status */}
      <div className="flex items-center gap-2 mb-5 pb-5 border-b border-slate-700/30">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        <span className="text-emerald-400 text-sm font-medium">
          {loading ? 'Loading...' : error ? 'Error' : data?.status || 'All Systems Operational'}
        </span>
      </div>

      {/* Systems List */}
      <div className="space-y-4 mb-5">
        {systems.map((system) => (
          <div key={system.name} className="flex items-center justify-between">
            <span className="text-slate-300 text-sm">{system.name}</span>
            <span className="text-emerald-400 text-sm font-medium">{system.status}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700/30 my-4" />

      {/* Last Data Ingested */}
      <div>
        <p className="text-slate-400 text-xs mb-1">Last Data Ingested</p>
        <p className="text-slate-200 text-sm font-medium">
          {loading ? 'Loading...' : data?.lastDataIngested || '10:24:30 AM'}
        </p>
      </div>
    </motion.div>
  )
}

export default SystemStatus
