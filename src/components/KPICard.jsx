import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useAnimatedCounter } from '../hooks/index'
import { staggerItem, defaultTransition } from '../animations/variants'

function MiniChart({ data, color }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80, h = 28
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

const MOCK_SPARKLINES = {
  quality_score:       [82, 84, 86, 83, 87, 85, 87, 88, 87],
  dropped_calls:       [1400, 1380, 1350, 1290, 1260, 1280, 1243, 1260, 1243],
  avg_latency_ms:      [48, 46, 45, 43, 44, 43, 42, 43, 42],
  download_speed_mbps: [108, 112, 118, 122, 125, 123, 127, 126, 128],
}

const cards = [
  {
    key: 'quality_score',
    label: 'Quality Score',
    suffix: '%', decimals: 1, icon: '◎',
    accent: '#0d9488',        // teal
    accentLight: 'rgba(13,148,136,0.10)',
    accentBorder: 'rgba(13,148,136,0.22)',
    topBar: '#0d9488',
    sparklineKey: 'quality_score',
    trendKey: 'quality_score_trend',
    description: 'Network QoS aggregate',
  },
  {
    key: 'dropped_calls',
    label: 'Dropped Calls',
    suffix: '', decimals: 0, icon: '⊗',
    accent: '#ef4444',
    accentLight: 'rgba(239,68,68,0.10)',
    accentBorder: 'rgba(239,68,68,0.22)',
    topBar: '#ef4444',
    sparklineKey: 'dropped_calls',
    trendKey: 'dropped_calls_trend',
    description: 'Last 24 hours total',
    invertTrend: true,
  },
  {
    key: 'avg_latency_ms',
    label: 'Avg Latency',
    suffix: 'ms', decimals: 1, icon: '⟳',
    accent: '#7c3aed',
    accentLight: 'rgba(124,58,237,0.10)',
    accentBorder: 'rgba(124,58,237,0.22)',
    topBar: '#7c3aed',
    sparklineKey: 'avg_latency_ms',
    trendKey: 'latency_trend',
    description: 'Round-trip time',
    invertTrend: true,
  },
  {
    key: 'download_speed_mbps',
    label: 'Download Speed',
    suffix: ' Mbps', decimals: 1, icon: '↓',
    accent: '#2563eb',
    accentLight: 'rgba(37,99,235,0.10)',
    accentBorder: 'rgba(37,99,235,0.22)',
    topBar: '#2563eb',
    sparklineKey: 'download_speed_mbps',
    trendKey: 'speed_trend',
    description: 'Avg across all nodes',
  },
]

function KPICardInner({ card, kpiData }) {
  const rawValue  = kpiData?.[card.key]      ?? 0
  const trend     = Number(kpiData?.[card.trendKey] ?? 0)
  const animatedValue = useAnimatedCounter(rawValue, 1600, card.decimals)
  const sparkData = MOCK_SPARKLINES[card.sparklineKey] || []

  const trendPositive = card.invertTrend ? trend < 0 : trend > 0
  const trendNeutral  = trend === 0
  const trendLabel    = trendNeutral ? '' : `${Math.abs(trend)}%`

  const displayValue =
    card.suffix === 'ms' || card.suffix === ' Mbps' || card.suffix === '%'
      ? animatedValue.toFixed(card.decimals)
      : Math.round(animatedValue).toLocaleString()

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative rounded-2xl overflow-hidden cursor-default"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--bg-card-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Coloured top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{ background: card.topBar }} />

      {/* Soft tinted background strip */}
      <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${card.accent} 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />

      <div className="p-5 pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-mono tracking-[0.18em] uppercase mb-0.5"
              style={{ color: card.accent }}>
              {card.label}
            </p>
            <p className="text-[10px] font-body" style={{ color: 'var(--text-muted)' }}>{card.description}</p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{
              background: card.accentLight,
              border: `1px solid ${card.accentBorder}`,
              color: card.accent,
            }}>
            {card.icon}
          </div>
        </div>

        {/* Value */}
        <div className="flex items-end gap-3 mb-4">
          <motion.span
            className="text-[2rem] font-display font-bold leading-none"
            style={{ color: card.accent }}
          >
            {displayValue}
            <span className="text-sm font-mono font-normal ml-0.5" style={{ color: 'var(--text-muted)' }}>
              {card.suffix}
            </span>
          </motion.span>

          {/* Trend pill */}
          {!trendNeutral && (
            <div className={`flex items-center gap-0.5 text-[10px] font-mono pb-0.5 ${
              trendPositive ? '' : ''
            }`}
              style={{ color: trendPositive ? '#0d9488' : '#ef4444' }}>
              {trendPositive ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
              {trendLabel}
            </div>
          )}
        </div>

        {/* Sparkline */}
        <div className="flex items-center justify-between">
          <MiniChart data={sparkData} color={card.accent} />
        </div>
      </div>
    </motion.div>
  )
}

export default function KPICards({ kpiData, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((_, i) => (
          <div key={i} className="rounded-2xl h-40 shimmer"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)' }} />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      initial="initial" animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
    >
      {cards.map(card => (
        <KPICardInner key={card.key} card={card} kpiData={kpiData} />
      ))}
    </motion.div>
  )
}
