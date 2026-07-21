import { motion } from 'framer-motion'
import {
  Activity,
  RefreshCw,
  Download,
  Loader2
} from 'lucide-react'

import { useState, useEffect, useCallback } from 'react'

import KPICards from '../components/KPICard'
import AlertPanel from '../components/AlertPanel'
import ChartsSection from '../components/ChartsSection'
import { WorstStatesTable, CarrierTable } from '../components/CarrierTable'

import { useKPI, useAnomalies } from '../hooks/index'

import {
  pageTransition,
  staggerContainer
} from '../animations/variants'

export default function Dashboard() {

  const {
    data: kpiData,
    loading: kpiLoading,
    refetch: refetchKPI
  } = useKPI()

  const {
    data: anomalies,
    loading: anomalyLoading,
    refetch: refetchAnomalies
  } = useAnomalies()

  // =====================================================
  // PDF LOADING STATE
  // =====================================================

  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30)

  // =====================================================
  // REFRESH HANDLER
  // =====================================================

  const handleRefresh = useCallback(() => {
    console.log('Dashboard: Triggering data refresh...')
    refetchKPI()
    refetchAnomalies()
    console.log('Dashboard: Data refresh triggered')
  }, [refetchKPI, refetchAnomalies])

  // =====================================================
  // AUTO-REFRESH FROM SETTINGS
  // =====================================================

  useEffect(() => {
    // Load refresh interval from settings
    const loadRefreshSettings = () => {
      try {
        const settings = localStorage.getItem('platformSettings')
        if (settings) {
          const parsed = JSON.parse(settings)
          const autoRefresh = parsed.autoRefresh !== false // default to true
          const intervalValue = parsed.refreshInterval ? parseInt(parsed.refreshInterval) : 30
          
          if (autoRefresh) {
            setRefreshInterval(intervalValue)
            console.log('Dashboard: Refresh interval set to', intervalValue, 'seconds')
          } else {
            console.log('Dashboard: Auto-refresh is disabled')
            setRefreshInterval(0)
          }
        }
      } catch (err) {
        console.error('Dashboard: Failed to load refresh settings:', err)
      }
    }
    
    loadRefreshSettings()

    // Check for settings changes every 5 seconds
    const settingsCheckInterval = setInterval(loadRefreshSettings, 5000)

    return () => clearInterval(settingsCheckInterval)
  }, [])

  // =====================================================
  // SETUP AUTO-REFRESH INTERVAL
  // =====================================================

  useEffect(() => {
    if (refreshInterval <= 0) {
      console.log('Dashboard: Refresh disabled (interval <= 0)')
      return
    }

    console.log(`Dashboard: Setting up refresh interval (${refreshInterval}s)`)
    
    // Immediately refresh on interval change
    handleRefresh()

    const intervalId = setInterval(() => {
      console.log(`Dashboard: Auto-refreshing (interval: ${refreshInterval}s)`)
      handleRefresh()
    }, refreshInterval * 1000)

    return () => {
      console.log('Dashboard: Clearing refresh interval')
      clearInterval(intervalId)
    }
  }, [refreshInterval, handleRefresh])

  // =====================================================
  // DOWNLOAD PDF FUNCTION
  // =====================================================

  const downloadPDFReport = async () => {

    try {

      setDownloadingPDF(true)

      const token = localStorage.getItem('token')

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/reports/download`,
        {
          method: 'GET',
          headers: {
            Authorization: token
              ? `Bearer ${token}`
              : ''
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to download PDF')
      }

      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')

      link.href = url

      link.download = 'telecom-report.pdf'

      document.body.appendChild(link)

      link.click()

      link.remove()

      window.URL.revokeObjectURL(url)

    } catch (error) {

      console.error('PDF Download Error:', error)

      alert('Failed to download PDF report')

    } finally {

      setDownloadingPDF(false)
    }
  }

  return (

    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >

      {/* ===================================================== */}
      {/* PAGE HEADER */}
      {/* ===================================================== */}

      <div className="flex items-center justify-between mb-6">

        <div>

          <div className="flex items-center gap-2 mb-1">

            <Activity
              size={14}
              className="text-neon-blue"
            />

            <span className="text-[10px] font-mono text-neon-blue/70 tracking-[0.2em] uppercase">
              Live Dashboard
            </span>

          </div>

          <h1 className="text-2xl font-display font-bold text-white">

            Network{' '}

            <span
              style={{
                background:
                  'linear-gradient(135deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Intelligence
            </span>

          </h1>

          <p className="text-xs text-white/30 font-body mt-1">
            Real-time telecom analytics · Updated every {refreshInterval < 60 ? refreshInterval + 's' : (refreshInterval / 60).toFixed(0) + 'm'}
          </p>

        </div>

        {/* ===================================================== */}
        {/* RIGHT SIDE ACTIONS */}
        {/* ===================================================== */}

        <div className="flex items-center gap-3">

          {/* LIVE STATUS */}

          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 3,
              repeat: Infinity
            }}
            className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-neon-cyan/70 px-3 py-2 rounded-xl"
            style={{
              background: 'rgba(0,255,204,0.06)',
              border: '1px solid rgba(0,255,204,0.12)'
            }}
          >

            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />

            LIVE

          </motion.div>

          {/* ===================================================== */}
          {/* PDF DOWNLOAD BUTTON */}
          {/* ===================================================== */}

          <motion.button

            whileHover={{
              scale: 1.03
            }}

            whileTap={{
              scale: 0.97
            }}

            onClick={downloadPDFReport}

            disabled={downloadingPDF}

            className="
              flex items-center gap-2
              px-4 py-2.5
              rounded-xl
              text-sm font-medium
              text-white
              transition-all
              disabled:opacity-50
            "

            style={{
              background:
                'linear-gradient(135deg, #2563eb, #7c3aed)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >

            {
              downloadingPDF
                ? <Loader2 size={16} className="animate-spin" />
                : <Download size={16} />
            }

            {
              downloadingPDF
                ? 'Generating...'
                : 'Download Report'
            }

          </motion.button>

          {/* ===================================================== */}
          {/* REFRESH BUTTON */}
          {/* ===================================================== */}

          <motion.button

            whileHover={{
              rotate: 180
            }}

            transition={{
              duration: 0.4
            }}

            onClick={handleRefresh}

            className="
              p-2.5 rounded-xl
              text-white/40
              hover:text-white/70
              transition-colors
            "

            style={{
              background: 'rgba(15,23,42,0.04)',
              border: '1px solid rgba(15,23,42,0.08)'
            }}
          >

            <RefreshCw size={14} />

          </motion.button>

        </div>

      </div>

      {/* ===================================================== */}
      {/* MAIN GRID */}
      {/* ===================================================== */}

      <div className="flex gap-5">

        {/* LEFT ALERT PANEL */}

        <div
          className="
            hidden lg:flex flex-col
            w-72 flex-shrink-0
          "
          style={{
            height: 'calc(100vh - 160px)',
            position: 'sticky',
            top: 88
          }}
        >

          <AlertPanel
            anomalies={anomalies}
            loading={anomalyLoading}
          />

        </div>

        {/* RIGHT CONTENT */}

        <div className="flex-1 min-w-0 space-y-5">

          {/* KPI CARDS */}

          <section>

            <KPICards
              kpiData={kpiData}
              loading={kpiLoading}
            />

          </section>

          {/* MOBILE ALERTS */}

          <div className="lg:hidden">

            <AlertPanel
              anomalies={anomalies}
              loading={anomalyLoading}
            />

          </div>

          {/* CHARTS */}

          <section>

            <ChartsSection />

          </section>

          {/* TABLES */}

          <motion.section

            className="
              grid grid-cols-1
              xl:grid-cols-2 gap-4
            "

            initial="initial"

            animate="animate"

            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
          >

            <WorstStatesTable />

            <CarrierTable />

          </motion.section>

        </div>

      </div>

    </motion.div>
  )
}