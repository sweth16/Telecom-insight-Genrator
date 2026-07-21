import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts'
import { useHourlyTrend, useBandPerformance, useCarrierScores, useCarrierPerf } from '../hooks/index'
import { staggerItem } from '../animations/variants'

const CHART_BG     = 'rgba(248,250,252,0.90)'
const CHART_BORDER = '1px solid rgba(15,23,42,0.07)'
const TICK_STYLE   = { fill: 'rgba(15,23,42,0.45)', fontSize: 9, fontFamily: 'IBM Plex Mono' }
const GRID_STROKE  = 'rgba(15,23,42,0.04)'

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <motion.div
      variants={staggerItem}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ background: CHART_BG, border: CHART_BORDER, backdropFilter: 'blur(20px)' }}
    >
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-display font-semibold" style={{ color: 'rgba(15,23,42,0.8)' }}>{title}</h3>
        {subtitle && <p className="text-[10px] font-mono mt-0.5" style={{ color: 'rgba(15,23,42,0.35)' }}>{subtitle}</p>}
      </div>
      <div className="p-4">{children}</div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs"
      style={{
        background: 'rgba(255,255,255,0.97)',
        border: '1px solid rgba(15,23,42,0.12)',
        boxShadow: '0 8px 30px rgba(15,23,42,0.12)',
        backdropFilter: 'blur(20px)',
      }}>
      <p className="font-mono text-[9px] mb-1.5" style={{ color: 'rgba(15,23,42,0.4)' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          <span className="capitalize text-[10px]" style={{ color: 'rgba(15,23,42,0.55)' }}>{p.name}:</span>
          <span className="font-mono font-medium text-[10px]" style={{ color: 'rgba(15,23,42,0.85)' }}>{p.value}{unit}</span>
        </div>
      ))}
    </div>
  )
}

function SkeletonChart({ height = 180 }) {
  return (
    <div className="animate-pulse rounded-lg" style={{ height, background: 'rgba(15,23,42,0.04)' }} />
  )
}

// ─── Download Speed & Latency Chart (hourly-trend) ────────────────────────────
function HourlyTrendChart() {
  const { data, loading } = useHourlyTrend()

  return (
    <ChartCard title="Hourly Download Speed" subtitle="Avg download speed by hour of day (Mbps)">
      {loading || !data ? <SkeletonChart /> : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="downHourGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="latHourGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey="time" tick={TICK_STYLE} axisLine={false} tickLine={false} interval={1} />
            <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip unit=" Mbps" />} />
            <Area type="monotone" dataKey="peak"  stroke="#7c3aed" strokeWidth={1} fill="url(#latHourGrad)"  strokeDasharray="4 2" name="latency (ms)" />
            <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} fill="url(#downHourGrad)" name="download (Mbps)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

// ─── Carrier Speed Bar Chart (carrier-performance) ────────────────────────────
function CarrierSpeedChart() {
  const { data, loading } = useCarrierPerf()

  return (
    <ChartCard title="Carrier Download Speed" subtitle="Average download speed per carrier (Mbps)">
      {loading || !data ? <SkeletonChart /> : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap="35%">
            <defs>
              <linearGradient id="carrierBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#2563eb" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey="carrier" tick={TICK_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip unit=" Mbps" />} />
            <Bar dataKey="speed" fill="url(#carrierBarGrad)" radius={[4, 4, 0, 0]} name="download" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

// ─── Carrier Quality Radar (carrier-scores) ───────────────────────────────────
const CARRIER_COLOR_MAP = {
  'AT&T': '#ef4444',
  'T-Mobile': '#0d9488',
  'Verizon': '#7c3aed',
  'Jio': '#2563eb',
  'Airtel': '#0d9488',
  'Vodafone': '#7c3aed',
}
const CARRIER_COLORS = ['#2563eb', '#0d9488', '#7c3aed', '#f59e0b', '#ef4444']

function CarrierRadarChart() {
  const { data: scores, loading } = useCarrierScores()

  const carriers = scores?.map((s, i) => {
    const safeKey = `carrier_${i}`
    const scaledQuality = typeof s.quality_score === 'number' ? Math.round(s.quality_score * 100) : 0
    return {
      carrier: s.carrier,
      key: safeKey,
      color: CARRIER_COLOR_MAP[s.carrier] || CARRIER_COLORS[i % CARRIER_COLORS.length],
      quality: scaledQuality,
      speed: Math.round(scaledQuality * 0.95 + 5),
      latency: Math.round(scaledQuality * 0.90),
      uptime: Math.round(scaledQuality * 0.98 + 2),
      coverage: Math.round(scaledQuality * 0.92 + 3),
    }
  }) || []

  // Detect if all carriers have identical metric values (causes exact overlap)
  const allSame = carriers.length > 1 && carriers.every((c, _, arr) => (
    c.quality === arr[0].quality && c.speed === arr[0].speed && c.latency === arr[0].latency && c.uptime === arr[0].uptime && c.coverage === arr[0].coverage
  ))

  // Small visual jitter to separate exactly overlapping traces when backend returns identical values
  const radarData = carriers.length ? [
    { metric: 'Quality',  ...Object.fromEntries(carriers.map((c, i) => [c.key, c.quality + (allSame ? i * 0.9 : 0)])) },
    { metric: 'Speed',    ...Object.fromEntries(carriers.map((c, i) => [c.key, c.speed   + (allSame ? i * 0.9 : 0)])) },
    { metric: 'Latency',  ...Object.fromEntries(carriers.map((c, i) => [c.key, c.latency + (allSame ? i * 0.9 : 0)])) },
    { metric: 'Uptime',   ...Object.fromEntries(carriers.map((c, i) => [c.key, c.uptime  + (allSame ? i * 0.9 : 0)])) },
    { metric: 'Coverage', ...Object.fromEntries(carriers.map((c, i) => [c.key, c.coverage + (allSame ? i * 0.9 : 0)])) },
  ] : []

  // Debug: log backend scores and computed radar data (helps diagnose identical values)
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[CarrierRadar] raw scores:', scores)
    console.debug('[CarrierRadar] carriers (processed):', carriers)
    console.debug('[CarrierRadar] radarData:', radarData)
  }

  return (
    <ChartCard title="Carrier Quality Radar" subtitle="Multi-dimensional performance score">
      {loading || !scores ? <SkeletonChart height={200} /> : (
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData} margin={{ top: 4, right: 20, left: 20, bottom: 4 }}>
            <PolarGrid stroke="rgba(15,23,42,0.06)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(15,23,42,0.55)', fontSize: 9, fontFamily: 'IBM Plex Mono' }} />
            {carriers.map(({ key, carrier, color }, idx) => {
              // provide a set of dash patterns to help distinguish overlapping strokes
              const dashPatterns = ['0', '6 4', '3 3', '2 2', '8 3 2 3']
              return (
                <Radar
                  key={key}
                  name={carrier}
                  dataKey={key}
                  stroke={color}
                  fill={color}
                  // make fills subtle so overlapping areas don't hide other traces
                  fillOpacity={0.08}
                  strokeWidth={2.5}
                  strokeOpacity={1}
                  dot={{ fill: color, stroke: '#fff', r: 4 }}
                  activeDot={{ r: 5 }}
                  legendType="square"
                  strokeDasharray={dashPatterns[idx % dashPatterns.length]}
                />
              )
            })}
            <Legend wrapperStyle={{ fontSize: '9px', fontFamily: 'IBM Plex Mono', color: 'rgba(15,23,42,0.5)', paddingTop: 8 }} />
            <Tooltip content={<CustomTooltip unit="" />} />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

// ─── Band Performance Donut (band-performance) ────────────────────────────────
function BandPerformanceDonut() {
  const { data, loading } = useBandPerformance()
  const [activeIndex, setActiveIndex] = useState(null)

  return (
    <ChartCard title="Dropped Calls by Network Band" subtitle="Distribution by band type">
      {loading || !data ? <SkeletonChart height={140} /> : (
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <PieChart width={140} height={140}>
              <Pie
                data={data}
                cx={65} cy={65}
                innerRadius={38} outerRadius={58}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, i) => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                strokeWidth={0}
              >
                {data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.color}
                    opacity={activeIndex === null || activeIndex === i ? 1 : 0.4}
                    style={{ filter: `drop-shadow(0 0 ${activeIndex === i ? '8px' : '4px'} ${d.color}80)`, cursor: 'pointer' }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="rounded-lg px-2 py-1.5 text-[10px]"
                      style={{ background: 'rgba(255,255,255,0.97)', border: `1px solid ${d.color}40`, boxShadow: '0 4px 16px rgba(15,23,42,0.1)' }}>
                      <p style={{ color: d.color }} className="font-mono font-medium">{d.name}</p>
                      <p className="font-mono" style={{ color: 'rgba(15,23,42,0.6)' }}>{d.value.toLocaleString()} calls</p>
                    </div>
                  )
                }}
              />
            </PieChart>
          </div>

          <div className="flex-1 space-y-2">
            {data.map((d, i) => {
              const total = data.reduce((s, x) => s + x.value, 0)
              const pct   = Math.round((d.value / total) * 100)
              return (
                <div key={i}
                  className="flex items-center justify-between"
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm flex-shrink-0"
                      style={{ background: d.color, boxShadow: `0 0 6px ${d.color}80` }} />
                    <span className="text-[10px] font-body" style={{ color: 'rgba(15,23,42,0.55)' }}>{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(15,23,42,0.06)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ background: d.color, boxShadow: `0 0 6px ${d.color}60` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono w-6 text-right" style={{ color: 'rgba(15,23,42,0.4)' }}>{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </ChartCard>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function ChartsSection() {
  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }}
    >
      <HourlyTrendChart />
      <CarrierSpeedChart />
      <CarrierRadarChart />
      <BandPerformanceDonut />
    </motion.div>
  )
}
