import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, ChevronUp, Clock, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { useHistory } from '../hooks/index'
import { pageTransition, staggerItem } from '../animations/variants'

const MUTED  = 'rgba(15,23,42,0.55)'
const DIMMED = 'rgba(15,23,42,0.35)'

const SOURCE_COLORS = {
  NLQ_AGENT:      { color: '#2563eb', bg: 'rgba(37,99,235,0.08)',   border: 'rgba(37,99,235,0.20)'  },
  CACHE:          { color: '#0d9488', bg: 'rgba(13,148,136,0.08)',  border: 'rgba(13,148,136,0.20)' },
  ANOMALY_AGENT:  { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.20)'  },
  INSIGHT_AGENT:  { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',  border: 'rgba(124,58,237,0.20)' },
  INSIGHT_ENGINE: { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',  border: 'rgba(124,58,237,0.20)' },
  ORCHESTRATOR:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.20)' },
}
const PAGE_SIZE = 10

// Parse responseJson to extract text + source
function parseHistoryRow(raw) {
  let answer = ''
  let source = 'NLQ_AGENT'
  try {
    const parsed = typeof raw.responseJson === 'string' ? JSON.parse(raw.responseJson) : raw.responseJson
    answer = parsed?.answer || parsed?.response || parsed?.reason || JSON.stringify(parsed)
    source = parsed?.source || source
    // ANOMALY_AGENT shape
    if (!answer && parsed?.anomalies?.length) {
      answer = `${parsed.anomalyCount ?? parsed.anomalies.length} anomaly(ies) detected: ` +
        parsed.anomalies.map(a => `${a.region} – ${a.issue}`).join(', ')
    }
  } catch {
    answer = raw.responseJson || ''
  }
  return {
    id:       raw.id,
    time:     raw.createdAt ? new Date(raw.createdAt).toLocaleString() : '—',
    question: raw.question,
    response: answer,
    source,
  }
}

function SourceBadge({ source }) {
  const cfg = SOURCE_COLORS[source] || { color: '#0f172a', bg: 'rgba(15,23,42,0.08)', border: 'rgba(15,23,42,0.15)' }
  return (
    <span className="text-[9px] font-mono px-2 py-1 rounded-full whitespace-nowrap"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      {source}
    </span>
  )
}

function HistoryRow({ row }) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <>
      <motion.tr
        variants={staggerItem}
        whileHover={{ backgroundColor: 'rgba(15,23,42,0.025)' }}
        className="border-b border-slate-100 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3.5">
          <span className="text-[10px] font-mono font-bold" style={{ color: '#000000' }}>#{row.id}</span>
        </td>
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-1.5">
            <Clock size={10} className="flex-shrink-0" style={{ color: DIMMED }} />
            <span className="text-[10px] font-mono whitespace-nowrap" style={{ color: DIMMED }}>{row.time}</span>
          </div>
        </td>
        <td className="px-4 py-3.5">
          <p className={`text-sm font-semibold ${expanded ? 'break-words' : 'truncate max-w-xs'}`} style={{ color: '#0f172a' }}>{row.question}</p>
        </td>
        <td className="px-4 py-3.5 max-w-sm hidden md:table-cell">
          <p className="text-sm truncate" style={{ color: '#334155' }}>
            {row.response ? row.response.slice(0, 80) + (row.response.length > 80 ? '…' : '') : '—'}
          </p>
        </td>
        <td className="px-4 py-3.5"><SourceBadge source={row.source} /></td>
        <td className="px-4 py-3.5">
          <span style={{ color: DIMMED }}>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        </td>
      </motion.tr>

      <AnimatePresence>
        {expanded && (
          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <td colSpan={6} className="px-4 pb-4 pt-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-xl mt-1"
                  style={{ background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(15,23,42,0.06)' }}>
                  <p className="text-[10px] font-mono mb-2 uppercase tracking-wider" style={{ color: DIMMED }}>Full Response</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: MUTED }}>{row.response}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <SourceBadge source={row.source} />
                  </div>
                </div>
              </motion.div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  )
}

export default function HistoryPage() {
  const [search, setSearch]           = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [page, setPage]               = useState(1)

  const { data: raw, loading } = useHistory()

  // Normalise raw backend rows
  const data = useMemo(() => (raw ?? []).map(parseHistoryRow), [raw])

  const filtered = useMemo(() => data.filter(row => {
    const matchSearch = !search ||
      row.question.toLowerCase().includes(search.toLowerCase()) ||
      row.response.toLowerCase().includes(search.toLowerCase())
    const matchSource = sourceFilter === 'all' || row.source === sourceFilter
    return matchSearch && matchSource
  }), [data, search, sourceFilter])

  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const TH_COLOR   = { color: DIMMED }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: '#0f172a' }}>Query History</h1>
          <p className="text-sm font-body mt-1" style={{ color: '#475569' }}>All NLQ interactions and AI responses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: DIMMED }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search questions or responses..."
            className="w-full text-sm py-2.5 pl-10 pr-4 outline-none rounded-xl transition-colors font-body"
            style={{ background: 'rgba(15,23,42,0.04)', color: MUTED, border: '1px solid rgba(15,23,42,0.1)' }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'NLQ_AGENT', 'INSIGHT_AGENT'].map(f => (
            <button key={f} onClick={() => { setSourceFilter(f); setPage(1) }}
              className="text-[9px] font-mono px-3 py-2 rounded-xl transition-all whitespace-nowrap"
              style={{
                color:      sourceFilter === f ? '#2563eb' : DIMMED,
                background: sourceFilter === f ? 'rgba(37,99,235,0.08)' : 'rgba(15,23,42,0.03)',
                border:     sourceFilter === f ? '1px solid rgba(37,99,235,0.2)' : '1px solid rgba(15,23,42,0.08)',
              }}>
              {f === 'all' ? 'ALL SOURCES' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(248,250,252,0.95)', border: '1px solid rgba(15,23,42,0.07)', backdropFilter: 'blur(20px)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 sticky top-0 z-10"
              style={{ background: '#000000', backdropFilter: 'blur(20px)' }}>
              <tr>
                {['ID', 'Time', 'Question', 'Response Preview', 'Source', ''].map((h, i) => (
                  <th key={i} style={{ color: '#ffffff' }}
                    className={`text-left px-4 py-3 text-[9px] font-mono tracking-[0.15em] uppercase ${h === 'Response Preview' ? 'hidden md:table-cell' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <motion.tbody
              initial="initial" animate="animate"
              variants={{ animate: { transition: { staggerChildren: 0.06 } } }}
            >
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-2">
                    <div className="h-8 rounded-lg animate-pulse" style={{ background: 'rgba(15,23,42,0.04)' }} />
                  </td></tr>
                ))
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center">
                  <p className="text-sm font-body" style={{ color: DIMMED }}>
                    {data.length === 0 ? 'No history yet — ask the AI bot a question to get started.' : 'No results found'}
                  </p>
                </td></tr>
              ) : paginated.map((row) => (
                <HistoryRow key={row.id} row={row} />
              ))}
            </motion.tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <span className="text-[10px] font-mono" style={{ color: DIMMED }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} · Page {page} of {totalPages}
          </span>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{
                color:      page === 1 ? DIMMED : '#2563eb',
                background: page === 1 ? 'transparent' : 'rgba(37,99,235,0.08)',
                border:     page === 1 ? '1px solid transparent' : '1px solid rgba(37,99,235,0.2)',
                opacity:    page === 1 ? 0.5 : 1,
                cursor:     page === 1 ? 'not-allowed' : 'pointer',
              }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{
                color:      page === totalPages ? DIMMED : '#2563eb',
                background: page === totalPages ? 'transparent' : 'rgba(37,99,235,0.08)',
                border:     page === totalPages ? '1px solid transparent' : '1px solid rgba(37,99,235,0.2)',
                opacity:    page === totalPages ? 0.5 : 1,
                cursor:     page === totalPages ? 'not-allowed' : 'pointer',
              }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
