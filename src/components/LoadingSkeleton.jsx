import { motion } from 'framer-motion'

function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`shimmer rounded-xl ${className}`}
      style={{ background: 'rgba(15,23,42,0.04)', border: '1px solid rgba(15,23,42,0.05)', ...style }}
    />
  )
}

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-44" />
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(248,250,252,0.95)', border: '1px solid rgba(15,23,42,0.07)' }}>
      <Skeleton className="h-14 rounded-none border-0 border-b border-slate-200 rounded-t-2xl" />
      <div className="p-4 space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    </div>
  )
}

export function AlertSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16" />
      ))}
    </div>
  )
}

export default Skeleton
