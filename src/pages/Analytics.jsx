import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import { pageTransition, staggerItem } from '../animations/variants'

const qualityTrend = [
  { month: 'Oct', jio: 88, airtel: 84, vi: 71, bsnl: 63 },
  { month: 'Nov', jio: 89, airtel: 85, vi: 72, bsnl: 64 },
  { month: 'Dec', jio: 87, airtel: 83, vi: 70, bsnl: 62 },
  { month: 'Jan', jio: 90, airtel: 86, vi: 73, bsnl: 64 },
  { month: 'Feb', jio: 91, airtel: 87, vi: 74, bsnl: 65 },
  { month: 'Mar', jio: 92, airtel: 88, vi: 74, bsnl: 66 },
]

const regionData = [
  { region: 'North', utilization: 78, latency: 65 },
  { region: 'South', utilization: 82, latency: 44 },
  { region: 'East', utilization: 71, latency: 72 },
  { region: 'West', utilization: 88, latency: 58 },
  { region: 'Central', utilization: 65, latency: 79 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs"
      style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', backdropFilter: 'blur(20px)' }}>
      <p className="text-gray-500 font-mono text-[9px] mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600 text-[10px]">{p.name}:</span>
          <span className="text-gray-900 font-mono font-medium text-[10px]">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="p-5 rounded-2xl"
      style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)' }}
    >
      <p className="text-[9px] font-mono text-gray-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className="text-3xl font-display font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-500 font-body mt-1">{sub}</p>
    </motion.div>
  )
}

export default function Analytics() {
  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Analytics</h1>
        <p className="text-xs text-white/30 font-body mt-1">Advanced telecom performance insights</p>
      </div>

      {/* Summary stats */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial="initial" animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
      >
        <StatCard label="Total Nodes" value="2,841" sub="Active monitoring" color="#2563eb" />
        <StatCard label="5G Coverage" value="68%" sub="Of service area" color="#0d9488" />
        <StatCard label="Avg Jitter" value="4.2ms" sub="Below 10ms threshold" color="#7c3aed" />
        <StatCard label="Packet Loss" value="0.8%" sub="National average" color="#f59e0b" />
      </motion.div>

      {/* Carrier quality trend */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)' }}>
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-sm font-display font-semibold text-gray-900">Carrier Quality Score Trend</h3>
          <p className="text-[10px] text-gray-400 font-mono mt-0.5">6-month comparative analysis</p>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={qualityTrend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                {[
                  { id: 'jio', color: '#2563eb' },
                  { id: 'airtel', color: '#0d9488' },
                  { id: 'vi', color: '#7c3aed' },
                  { id: 'bsnl', color: '#f59e0b' },
                ].map(g => (
                  <linearGradient key={g.id} id={`grad-${g.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={g.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis domain={[55, 100]} tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {[
                { key: 'jio', color: '#2563eb' },
                { key: 'airtel', color: '#0d9488' },
                { key: 'vi', color: '#7c3aed' },
                { key: 'bsnl', color: '#f59e0b' },
              ].map(c => (
                <Area key={c.key} type="monotone" dataKey={c.key} stroke={c.color} strokeWidth={2}
                  fill={`url(#grad-${c.key})`} name={c.key.charAt(0).toUpperCase() + c.key.slice(1)} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Region performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)' }}>
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-sm font-display font-semibold text-gray-900">Regional Utilization</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={regionData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" vertical={false} />
                <XAxis dataKey="region" tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="utilization" fill="url(#regGrad)" radius={[4, 4, 0, 0]} name="Utilization %" />
                <Bar dataKey="latency" fill="url(#latGrad)" radius={[4, 4, 0, 0]} name="Latency ms" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top performers */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)' }}>
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-sm font-display font-semibold text-gray-900">Top Performing Cities</h3>
          </div>
          <div className="p-4 space-y-2.5">
            {[
              { city: 'Bangalore', score: 94.2, speed: 168, color: '#0d9488' },
              { city: 'Pune', score: 92.8, speed: 156, color: '#2563eb' },
              { city: 'Hyderabad', score: 91.5, speed: 149, color: '#2563eb' },
              { city: 'Chennai', score: 89.3, speed: 143, color: '#7c3aed' },
              { city: 'Mumbai', score: 87.1, speed: 138, color: '#7c3aed' },
            ].map((c, i) => (
              <motion.div key={c.city}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-gray-400 w-4">{i + 1}</span>
                  <span className="text-sm text-gray-700 font-body">{c.city}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-gray-500">{c.speed} Mbps</span>
                  <span className="text-sm font-display font-bold" style={{ color: c.color }}>{c.score}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
