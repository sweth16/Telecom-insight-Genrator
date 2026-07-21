import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9022'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  headers: { 'Content-Type': 'application/json' },
})

// ─────────────────────────────────────────────────────────────
// ADD GOOGLE JWT TOKEN AUTOMATICALLY
// ─────────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {

  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// ─────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An error occurred'

    return Promise.reject(new Error(message))
  }
)

// ─── Dashboard / KPI ─────────────────────────────────────────────────────────
export const fetchKPI             = () => api.get('/dashboard/kpis')
export const fetchHourlyTrend     = () => api.get('/dashboard/hourly-trend')
export const fetchBandPerformance = () => api.get('/dashboard/band-performance')
export const fetchWorstStates     = () => api.get('/dashboard/worst-states')
export const fetchCarrierScores   = () => api.get('/dashboard/carrier-scores')
export const fetchCarrierPerf     = () => api.get('/dashboard/carrier-performance')

// ─── Analytics ───────────────────────────────────────────────────────────────
export const fetchAnalyticsSummary     = () => api.get('/dashboard/analytics/summary')
export const fetchCarrierQualityTrend  = () => api.get('/dashboard/analytics/carrier-trend')
export const fetchRegionalUtilization  = () => api.get('/dashboard/analytics/regional')
export const fetchTopCities            = () => api.get('/dashboard/analytics/top-cities')

// ─── Legacy Alerts (mock fallback) ───────────────────────────────────────────
export const fetchAlerts          = () => api.get('/alerts')

// ─── Anomaly Agent ───────────────────────────────────────────────────────────
export const fetchAnomalyAlerts   = () => api.get('/anomaly/alerts')
export const markAnomalyAlertRead = (id) => api.put(`/anomaly/alerts/${id}/read`)
export const triggerAnomalyCheck  = () => api.get('/anomaly/check')
export const askAnomaly           = () => api.get('/anomaly/check')

// ─── AI Chatbot / NLQ ────────────────────────────────────────────────────────
export const askNLQ = (question)  => api.post('/insights/ask', { question })

// ─── History ─────────────────────────────────────────────────────────────────
export const fetchHistory         = () => api.get('/insights/history')

// ─── Health ──────────────────────────────────────────────────────────────────
export const healthCheck          = () => api.get('/insights/health')
export const fetchSystemStatus    = () => {
  console.log('Fetching system status from:', BASE_URL + '/system/status')
  return api.get('/system/status')
}

// ─── Current User ────────────────────────────────────────────────────────────
export const getCurrentUser       = () => api.get('/insights/me')

// ─── Mock Data (fallback when API is unavailable) ────────────────────────────
export const MOCK_KPI = {
  quality_score: 92.5,
  total_dropped_calls: 145,
  avg_latency: 28,
  avg_download: 45.2,
}

export const MOCK_HOURLY_TREND = [
  { hour_of_day: 0, download_speed_mbps: 42, avg_latency_ms: 25 },
  { hour_of_day: 1, download_speed_mbps: 38, avg_latency_ms: 28 },
  { hour_of_day: 2, download_speed_mbps: 35, avg_latency_ms: 30 },
]

export const MOCK_BAND_PERFORMANCE = [
  { network_band: '5G', dropped_calls: 12 },
  { network_band: 'LTE', dropped_calls: 45 },
  { network_band: '3G', dropped_calls: 88 },
]

export const MOCK_WORST_STATES = [
  { state: 'Dallas', total_dropped_calls: 89, avg_packet_loss: 2.3 },
  { state: 'Houston', total_dropped_calls: 56, avg_packet_loss: 1.8 },
]

export const MOCK_CARRIER_SCORES = [
  { carrier: 'Jio', quality_score: 94 },
  { carrier: 'Airtel', quality_score: 88 },
  { carrier: 'Vodafone', quality_score: 82 },
]

export const MOCK_CARRIER_PERF = [
  { carrier: 'Jio', quality_score: 94, download_speed_mbps: 48, avg_latency_ms: 22 },
  { carrier: 'Airtel', quality_score: 88, download_speed_mbps: 42, avg_latency_ms: 26 },
]

export const MOCK_ALERTS = []

export const MOCK_ANOMALY_ALERTS = [
  {
    id: 1,
    title: 'HIGH_LATENCY_DALLAS',
    severity: 'CRITICAL',
    message: 'Abnormal network latency detected',
    region: 'Dallas',
    value: '125ms',
    created_at: new Date().toISOString(),
  },
]

export const MOCK_HISTORY = []

export const MOCK_ANALYTICS_SUMMARY = {
  total_incidents: 42,
  avg_resolution_time: 2.3,
  quality_score: 91.2,
}

export const MOCK_CARRIER_QUALITY_TREND = [
  { month: 1, carrier: 'Jio', quality_score: 88 },
  { month: 1, carrier: 'Airtel', quality_score: 85 },
  { month: 2, carrier: 'Jio', quality_score: 90 },
  { month: 2, carrier: 'Airtel', quality_score: 87 },
]

export const MOCK_REGIONAL_UTILIZATION = [
  { region: 'North', utilization_pct: 72, avg_latency_ms: 24 },
  { region: 'South', utilization_pct: 68, avg_latency_ms: 26 },
]

export const MOCK_TOP_CITIES = [
  { city: 'Bangalore', quality_score: 95, download_speed_mbps: 52 },
  { city: 'Mumbai', quality_score: 92, download_speed_mbps: 48 },
]

export default api