import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAnomalies } from '../hooks/index'

const AnomalyContext = createContext(null)

export function AnomalyProvider({ children }) {
  const { data: anomalies, markAsRead: apiMarkAsRead, refetch } = useAnomalies()
  const [readIds, setReadIds] = useState(new Set())
  const [fadingIds, setFadingIds] = useState(new Set())
  const [newAlert, setNewAlert] = useState(false)
  const prevCountRef = useRef(0)

  const notificationsData = anomalies || []

  useEffect(() => {
    const unread = notificationsData.filter(a => !readIds.has(a.id)).length
    if (unread > prevCountRef.current) {
      setNewAlert(true)
      const t = setTimeout(() => setNewAlert(false), 2500)
      return () => clearTimeout(t)
    }
    prevCountRef.current = unread
  }, [notificationsData, readIds])

  const unreadCount = notificationsData.filter(a => !readIds.has(a.id)).length
  const panelItems = notificationsData.filter(a => !readIds.has(a.id) || fadingIds.has(a.id))

  const handleMarkAsRead = async (id) => {
    setReadIds(prev => new Set([...prev, id]))
    setFadingIds(prev => new Set([...prev, id]))
    setTimeout(() => {
      setFadingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 900)

    try {
      await apiMarkAsRead(id)
      refetch()
    } catch (err) {
      setReadIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  return (
    <AnomalyContext.Provider
      value={{
        notificationsData,
        unreadCount,
        panelItems,
        readIds,
        fadingIds,
        newAlert,
        handleMarkAsRead,
        refetch,
      }}
    >
      {children}
    </AnomalyContext.Provider>
  )
}

export function useAnomalyContext() {
  const context = useContext(AnomalyContext)
  if (!context) {
    throw new Error('useAnomalyContext must be used within AnomalyProvider')
  }
  return context
}
