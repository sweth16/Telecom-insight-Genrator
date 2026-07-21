import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpDown, TrendingDown, AlertTriangle } from 'lucide-react'
import { useWorstStates, useCarrierPerf } from '../hooks/index'
import { staggerItem } from '../animations/variants'

const MUTED = 'rgba(15,23,42,0.45)'
const DIMMED = 'rgba(15,23,42,0.28)'
const CARD_BG = 'rgba(248,250,252,0.95)'
const CARD_BR = '1px solid rgba(15,23,42,0.07)'

function QualityBar({ value, max = 100, color }) {

  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="flex items-center gap-2 flex-1">

      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{
          background: 'rgba(15,23,42,0.06)'
        }}
      >

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="h-full rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 8px ${color}60`
          }}
        />

      </div>

      <span
        className="text-[10px] font-mono w-12 text-right"
        style={{ color: DIMMED }}
      >
        {value.toFixed(0)}
      </span>

    </div>
  )
}

function getScoreColor(score) {

  if (score >= 85) return '#0d9488'
  if (score >= 75) return '#2563eb'
  if (score >= 65) return '#f59e0b'

  return '#ef4444'
}

function TableSkeleton({ rows = 5 }) {

  return (
    <div className="p-4 space-y-2">

      {Array.from({ length: rows }).map((_, i) => (

        <div
          key={i}
          className="h-10 rounded-lg animate-pulse"
          style={{
            background: 'rgba(15,23,42,0.04)'
          }}
        />

      ))}

    </div>
  )
}

// ─────────────────────────────────────────────────────
// WORST STATES TABLE
// ─────────────────────────────────────────────────────

export function WorstStatesTable() {

  const { data, loading } = useWorstStates()

  const [sortKey, setSortKey] =
    useState('dropped_calls')

  const sorted = data
    ? [...data].sort(
        (a, b) =>
          (b[sortKey] ?? 0) -
          (a[sortKey] ?? 0)
      )
    : []

  const headers = [
    {
      key: 'state',
      label: 'State',
      sortable: false
    },
    {
      key: 'dropped_calls',
      label: 'Dropped Calls',
      sortable: true
    },
    {
      key: 'packet_loss',
      label: 'Packet Loss',
      sortable: true
    },
  ]

  return (
    <motion.div
      variants={staggerItem}
      className="rounded-2xl overflow-hidden"
      style={{
        background: CARD_BG,
        border: CARD_BR,
        backdropFilter: 'blur(20px)'
      }}
    >

      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

        <div>

          <h3
            className="text-sm font-display font-semibold flex items-center gap-2"
            style={{ color: MUTED }}
          >

            <TrendingDown
              size={14}
              className="text-neon-red"
            />

            Worst Performing States

          </h3>

          <p
            className="text-[10px] font-mono mt-0.5"
            style={{ color: DIMMED }}
          >
            Ranked by dropped calls
          </p>

        </div>

        <span
          className="text-[9px] font-mono px-2 py-1 rounded-full"
          style={{
            color: '#ef4444',
            background: 'rgba(239,68,68,0.08)',
            border:
              '1px solid rgba(239,68,68,0.2)'
          }}
        >
          {sorted.length} STATES
        </span>

      </div>

      {loading || !data ? (

        <TableSkeleton />

      ) : (

        <table className="w-full">

          <thead>

            <tr className="border-b border-slate-100">

              {headers.map((h) => (

                <th
                  key={h.key}
                  onClick={() =>
                    h.sortable &&
                    setSortKey(h.key)
                  }
                  className={`
                    text-left
                    px-5
                    py-2.5
                    text-[9px]
                    font-mono
                    tracking-[0.15em]
                    uppercase
                    ${
                      h.sortable
                        ? 'cursor-pointer transition-colors'
                        : ''
                    }
                  `}
                  style={{
                    color:
                      sortKey === h.key
                        ? '#2563eb'
                        : DIMMED
                  }}
                >

                  <div className="flex items-center gap-1">

                    {h.label}

                    {h.sortable && (

                      <ArrowUpDown
                        size={9}
                        style={{
                          color:
                            sortKey === h.key
                              ? '#2563eb'
                              : 'rgba(15,23,42,0.2)'
                        }}
                      />

                    )}

                  </div>

                </th>

              ))}

            </tr>

          </thead>

          <tbody>

            {sorted.map((row, i) => (

              <motion.tr
                key={row.state}
                initial={{
                  opacity: 0,
                  x: -10
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                transition={{
                  delay: i * 0.07
                }}
                whileHover={{
                  backgroundColor:
                    'rgba(15,23,42,0.025)'
                }}
                className="border-b border-slate-50 cursor-default"
              >

                <td className="px-5 py-3">

                  <div className="flex items-center gap-2">

                    <span
                      className="text-[9px] font-mono w-4"
                      style={{ color: DIMMED }}
                    >
                      {i + 1}
                    </span>

                    <span
                      className="text-sm font-body"
                      style={{ color: MUTED }}
                    >
                      {row.state}
                    </span>

                    {i === 0 && (

                      <AlertTriangle
                        size={10}
                        className="text-neon-red"
                      />

                    )}

                  </div>

                </td>

                <td className="px-5 py-3">

                  <span
                    className="font-mono text-xs font-medium"
                    style={{ color: '#ef4444' }}
                  >
                    {(row.dropped_calls ?? 0)
                      .toLocaleString()}
                  </span>

                </td>

                <td className="px-5 py-3">

                  <span
                    className="font-mono text-xs"
                    style={{
                      color:
                        (row.packet_loss ?? 0) > 8
                          ? '#ef4444'
                          : '#f59e0b'
                    }}
                  >
                    {row.packet_loss ?? '—'}%
                  </span>

                </td>

              </motion.tr>

            ))}

          </tbody>

        </table>

      )}

    </motion.div>
  )
}

// ─────────────────────────────────────────────────────
// CARRIER TABLE
// ─────────────────────────────────────────────────────

export function CarrierTable() {

  const {
    data: carriers,
    loading
  } = useCarrierPerf()

  const CARRIER_COLORS = [
    '#2563eb',
    '#0d9488',
    '#7c3aed',
    '#f59e0b',
    '#ef4444'
  ]

  return (
    <motion.div
      variants={staggerItem}
      className="rounded-2xl overflow-hidden"
      style={{
        background: CARD_BG,
        border: CARD_BR,
        backdropFilter: 'blur(20px)'
      }}
    >

      <div className="px-5 py-4 border-b border-slate-100">

        <h3
          className="text-sm font-display font-semibold"
          style={{ color: MUTED }}
        >
          Carrier Performance Breakdown
        </h3>

        <p
          className="text-[10px] font-mono mt-0.5"
          style={{ color: DIMMED }}
        >
          Quality score & download speed comparison
        </p>

      </div>

      {loading ? (

        <TableSkeleton rows={4} />

      ) : (

        <div className="p-4 space-y-4">

          {carriers?.map((c, i) => (

            <motion.div
              key={c.carrier}
              initial={{
                opacity: 0,
                y: 12
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: i * 0.1
              }}
              whileHover={{
                scale: 1.01
              }}
              className="p-4 rounded-xl"
              style={{
                background:
                  'rgba(15,23,42,0.03)',
                border:
                  '1px solid rgba(15,23,42,0.06)'
              }}
            >

              <div className="flex items-center justify-between mb-4">

                <div className="flex items-center gap-2.5">

                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold"
                    style={{
                      background:
                        `${CARRIER_COLORS[i % CARRIER_COLORS.length]}15`,
                      border:
                        `1px solid ${CARRIER_COLORS[i % CARRIER_COLORS.length]}30`,
                      color:
                        CARRIER_COLORS[i % CARRIER_COLORS.length]
                    }}
                  >
                    {c.carrier.slice(0, 2)}
                  </div>

                  <div>

                    <p
                      className="text-sm font-display font-medium"
                      style={{ color: MUTED }}
                    >
                      {c.carrier}
                    </p>

                    <p
                      className="text-[9px] font-mono"
                      style={{ color: DIMMED }}
                    >
                      Carrier Analytics
                    </p>

                  </div>

                </div>

                <div className="text-right">

                  <div
                    className="text-lg font-display font-bold"
                    style={{
                      color:
                        CARRIER_COLORS[
                          i % CARRIER_COLORS.length
                        ]
                    }}
                  >
                    {c.speed.toFixed(0)} Mbps
                  </div>

                  <div
                    className="text-[10px] font-mono"
                    style={{
                      color:
                        getScoreColor(
                          c.quality * 100
                        )
                    }}
                  >
                    Quality {(c.quality * 100).toFixed(0)}%
                  </div>

                </div>

              </div>

              <div className="space-y-3">

                {/* QUALITY BAR */}

                <div className="flex items-center gap-3">

                  <span
                    className="text-[9px] font-mono w-14"
                    style={{ color: DIMMED }}
                  >
                    Quality
                  </span>

                  <QualityBar
                    value={c.quality * 100}
                    max={100}
                    color={
                      getScoreColor(
                        c.quality * 100
                      )
                    }
                  />

                </div>

                {/* SPEED BAR */}

                <div className="flex items-center gap-3">

                  <span
                    className="text-[9px] font-mono w-14"
                    style={{ color: DIMMED }}
                  >
                    Speed
                  </span>

                  <QualityBar
                    value={c.speed}
                    max={600}
                    color={
                      CARRIER_COLORS[
                        i % CARRIER_COLORS.length
                      ]
                    }
                  />

                </div>

              </div>

            </motion.div>

          ))}

        </div>

      )}

    </motion.div>
  )
}