
import { useState, useEffect, useCallback } from 'react'
import {
  fetchKPI, fetchHourlyTrend, fetchBandPerformance,
  fetchWorstStates, fetchCarrierScores, fetchCarrierPerf,
  fetchAlerts, fetchHistory,
  fetchAnomalyAlerts, markAnomalyAlertRead, triggerAnomalyCheck,
  fetchAnalyticsSummary, fetchCarrierQualityTrend,
  fetchRegionalUtilization, fetchTopCities,
  getCurrentUser, healthCheck, fetchSystemStatus,
} from '../services/api'

// ─── Generic data hook ─────────────────────────────────────────────────────────
function useApiData(fetchFn, deps = []) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      console.error('API error:', err.message)
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => { load() }, [load])
  return { data, loading, error, refetch: load }
}

// ─── KPI hook ─────────────────────────────────────────────────────────────────
export function useKPI() {
  const result = useApiData(fetchKPI)
  const normalised = result.data ? {
    quality_score:       result.data.quality_score,
    dropped_calls:       result.data.total_dropped_calls ?? result.data.dropped_calls,
    avg_latency_ms:      result.data.avg_latency         ?? result.data.avg_latency_ms,
    download_speed_mbps: result.data.avg_download         ?? result.data.download_speed_mbps,
  } : null
  return { ...result, data: normalised }
}

// ─── Hourly trend hook ────────────────────────────────────────────────────────
export function useHourlyTrend() {
  const result = useApiData(fetchHourlyTrend)
  const mapped = result.data?.map(r => ({
    time:  String(r.hour_of_day).padStart(2,'0') + ':00',
    value: r.download_speed_mbps,
    peak:  r.avg_latency_ms,
    hour:  r.hour_of_day,
  }))
  return { ...result, data: mapped }
}

// ─── Band performance hook ────────────────────────────────────────────────────
export function useBandPerformance() {
  const result = useApiData(fetchBandPerformance)
  const COLORS = { '5G': '#2563eb', 'LTE': '#7c3aed', '3G': '#f59e0b', '2G': '#ef4444' }
  const mapped = result.data?.map(r => ({
    name:  r.network_band,
    value: r.dropped_calls,
    color: COLORS[r.network_band] || '#0d9488',
  }))
  return { ...result, data: mapped }
}

// ─── Worst states hook ────────────────────────────────────────────────────────
export function useWorstStates() {
  const result = useApiData(fetchWorstStates)
  const mapped = result.data?.map(r => ({
    state:         r.state,
    dropped_calls: r.total_dropped_calls ?? r.dropped_calls,
    packet_loss:   r.avg_packet_loss     ?? r.packet_loss,
  }))
  return { ...result, data: mapped }
}

// ─── Carrier scores hook ──────────────────────────────────────────────────────
export function useCarrierScores() {
  return useApiData(fetchCarrierScores)
}

// ─── Carrier performance hook ─────────────────────────────────────────────────
export function useCarrierPerf() {
  const result = useApiData(fetchCarrierPerf)
  const mapped = result.data?.map(r => ({
    carrier: r.carrier,
    quality: r.quality_score,
    speed:   r.download_speed_mbps,
    latency: r.avg_latency_ms,
  }))
  return { ...result, data: mapped }
}

// ─── Alerts hook (auto-refresh every 30s) ─────────────────────────────────────
export function useAlerts() {
  const result = useApiData(fetchAlerts)
  useEffect(() => {
    const interval = setInterval(() => result.refetch(), 30000)
    return () => clearInterval(interval)
  }, [result.refetch])
  return result
}

// ─── Anomalies hook (real AI-generated alerts from AnomalyAgent) ──────────────

// Common city names for extraction fallback
const KNOWN_CITIES = new Set([
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad',
  'New York', 'Dallas', 'Los Angeles', 'Chicago', 'Houston', 'Austin',
  'Buffalo', 'Atlanta', 'Miami', 'Boston', 'Seattle', 'Denver', 'Phoenix',
  'San Francisco', 'San Diego', 'Las Vegas', 'Orlando'
])

export function useAnomalies() {
  const result = useApiData(fetchAnomalyAlerts)

  const markAsRead = useCallback(async (id) => {
    try {
      await markAnomalyAlertRead(id)
      result.refetch()
    } catch (err) {
      console.error('Failed to mark alert as read:', err.message)
    }
  }, [result])

  const runManualCheck = useCallback(async () => {
    try {
      await triggerAnomalyCheck()
      result.refetch()
    } catch (err) {
      console.error('Failed to run anomaly check:', err.message)
    }
  }, [result])

  useEffect(() => {
    const interval = setInterval(() => result.refetch(), 30000)
    return () => clearInterval(interval)
  }, [result.refetch])

  const SEVERITY_MAP = {
    HIGH: 'critical', CRITICAL: 'critical',
    MEDIUM: 'warning', WARNING: 'warning',
    LOW: 'info', INFO: 'info',
  }

  const mapped = result.data?.filter(Boolean).map((a, i) => {
    let region = 'Unknown'
    
    // 1. Try to extract city from raw_data (object or string)
    if (a.raw_data) {
      if (typeof a.raw_data === 'object') {
        region = a.raw_data.city || a.raw_data.location || a.raw_data.region || region
      } else if (typeof a.raw_data === 'string') {
        try {
          const parsed = JSON.parse(a.raw_data)
          const arr = Array.isArray(parsed) ? parsed[0] : parsed
          region = arr?.city || arr?.location || arr?.region || region
        } catch (e) {
          // Fallback to regex
          const match = a.raw_data.match(/"city":\s*"([^"]+)"/)
          if (match) region = match[1]
        }
      }
    }
    
    // 2. Additional fallbacks from direct fields
    if (region === 'Unknown') {
      region = a.region || a.location || a.city || region
    }
    
    // 3. Extract from title if still unknown (e.g., "QUALITY DEGRADATION DALLAS")
    if (region === 'Unknown' && a.title) {
      const titleParts = a.title.split(' - ')
      if (titleParts.length > 1) {
        region = titleParts[titleParts.length - 1].trim()
      } else {
        // Look for known city names in the title
        for (const city of KNOWN_CITIES) {
          if (a.title.includes(city)) {
            region = city
            break
          }
        }
        
        // If still unknown, try to extract last word that looks like a city (capitalized word)
        if (region === 'Unknown') {
          const words = a.title.split(/[\s\-]/).filter(w => w)
          const lastWord = words[words.length - 1]
          if (lastWord && /^[A-Z][a-z]+$/.test(lastWord)) {
            region = lastWord
          }
        }
      }
    }

    const type          = a.title || a.anomalyType || a.issue || 'Unknown Anomaly'
    const severity      = a.severity || 'WARNING'
    const description   = a.message || a.description || a.diagnosis || 'No description'
    const severityMapped = SEVERITY_MAP[severity.toUpperCase()] || 'info'

    return {
      id:       a.id ?? i,
      type:     type.replace(/\s+/g, '_').replace(/[^\w]/g, '').toUpperCase(),
      severity: severityMapped,
      city:     region,
      region:   region,
      value:    a.value || a.metric || '—',
      time:     a.created_at ? new Date(a.created_at).toLocaleTimeString() : a.createdAt ? new Date(a.createdAt).toLocaleTimeString() : 'Live',
      message:  description,
      active:   a.active !== false && !a.resolved,
    }
  })

  return { ...result, data: mapped, markAsRead, runManualCheck }
}

// ─── History hook ─────────────────────────────────────────────────────────────
export function useHistory() {
  return useApiData(fetchHistory)
}

// ─── Analytics — Summary KPIs ─────────────────────────────────────────────────
export function useAnalyticsSummary() {
  return useApiData(fetchAnalyticsSummary)
}

// ─── Analytics — Carrier quality trend ───────────────────────────────────────
// Pivots rows [{month, carrier, quality_score}] into recharts-friendly
// [{month: 'Oct', Jio: 92, Airtel: 88, ...}]
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function useCarrierQualityTrend() {
  const result = useApiData(fetchCarrierQualityTrend)

  const pivoted = result.data ? (() => {
    const map = {}
    result.data.forEach(({ month, carrier, quality_score }) => {
      const label = MONTH_LABELS[(Number(month) - 1) % 12]
      if (!map[label]) map[label] = { month: label }
      map[label][carrier] = quality_score
    })
    return Object.values(map)
  })() : null

  return { ...result, data: pivoted }
}

// ─── Analytics — Regional utilization ────────────────────────────────────────
export function useRegionalUtilization() {
  const result = useApiData(fetchRegionalUtilization)
  const mapped = result.data?.map(r => ({
    region:      r.region,
    utilization: r.utilization_pct ?? r.utilization,
    latency:     r.avg_latency_ms  ?? r.latency,
  }))
  return { ...result, data: mapped }
}

// ─── Analytics — Top performing cities ───────────────────────────────────────
export function useTopCities() {
  const result = useApiData(fetchTopCities)
  const mapped = result.data?.map(r => ({
    city:  r.city,
    score: r.quality_score,
    speed: r.download_speed_mbps,
  }))
  return { ...result, data: mapped }
}

// ─── Animated counter hook ────────────────────────────────────────────────────
export function useAnimatedCounter(target, duration = 1500, decimals = 0) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === null || target === undefined) return
    let startTime = null
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed  = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setCount(parseFloat((target * eased).toFixed(decimals)))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [target, duration, decimals])
  return count
}

// ─── Current User hook (from /insights/me) ────────────────────────────────────
export function useCurrentUser() {
  const result = useApiData(getCurrentUser)
  
  const mapped = result.data ? {
    email: result.data.email,
    name: result.data.name,
    picture: result.data.picture,
  } : null
  
  return { ...result, data: mapped }
}

// ─── System Status hook (from /system/status) ────────────────────────────────
export function useSystemStatus() {
  const result = useApiData(fetchSystemStatus)
  
  console.log('useSystemStatus - result:', result)
  console.log('useSystemStatus - data:', result.data)
  console.log('useSystemStatus - error:', result.error)
  
  const mapped = result.data ? {
    uptime: result.data.uptime || '99.3%',
    nodes: result.data.nodes || 68822,
    qos: result.data.qos || '51.0%',
    secure: result.data.secure || 'AES-256',
    status: result.data.status || 'All Systems Operational',
  } : null
  
  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => result.refetch(), 30000)
    return () => clearInterval(interval)
  }, [result.refetch])
  
  return { ...result, data: mapped }
}