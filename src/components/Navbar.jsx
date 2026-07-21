import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronDown, Wifi, Zap, X, Sun, Moon, LogOut } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useAnomalyContext } from '../context/AnomalyContext'

const SEVERITY_CONFIG = {
  critical: { color: '#ef4444', label: 'Critical' },
  warning:  { color: '#facc15', label: 'Warning' },
  info:     { color: '#3b82f6', label: 'Info' },
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [time, setTime] = useState(new Date())
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const { unreadCount, panelItems, readIds, fadingIds, newAlert, handleMarkAsRead, notificationsData } = useAnomalyContext()

  const notifications = panelItems.map(item => {
    const rawLabel = item.type?.replace(/_/g, ' ') || 'Anomaly'
    const title = /LATENCY/i.test(rawLabel)
      ? 'LATENCY'
      : /QUALITY/i.test(rawLabel)
      ? 'QUALITY'
      : rawLabel.split(' ')[0] || 'ALERT'

    return {
      id: item.id,
      type: item.severity,
      title,
      city: item.city,
      displayId: `ALT-${String(item.id).padStart(4, '0')}`,
      time: item.time || 'Live',
    }
  })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

  const dropdownStyle = {
    background: 'var(--bg-overlay)',
    backdropFilter: 'blur(24px)',
    border: '1px solid var(--bg-card-border)',
    boxShadow: 'var(--shadow-overlay)',
  }

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}
    >
      <div className="glass border-b" style={{ borderColor: 'var(--glass-border)', backdropFilter: 'blur(24px)' }}>
        <div className="flex items-center justify-between h-16 px-6">

          {/* Brand */}
          <div className="flex items-center gap-3 min-w-[260px]">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                <Wifi size={14} className="text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2"
                style={{ background: '#0d9488', borderColor: 'var(--bg-primary)', animation: 'ping 2s infinite' }} />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm tracking-widest uppercase"
                style={{ color: 'var(--text-primary)', letterSpacing: '0.10em' }}>
                Telecom Insight Generator
              </h1>
              <div className="text-[9px] font-mono tracking-[0.18em] uppercase"
                style={{ color: 'var(--accent-blue)', opacity: 0.8 }}>
                Network Intelligence
              </div>
            </div>
          </div>

          {/* Search */}

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Clock */}
            <div className="hidden lg:flex items-center">
              <span className="font-mono text-xs tracking-wider" style={{ color: 'var(--text-muted)' }}>{timeStr} IST</span>
            </div>

            {/* AI status */}
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider"
              style={{ background: 'rgba(13,148,136,0.10)', border: '1px solid rgba(13,148,136,0.22)', color: '#0d9488' }}
            >
              <Zap size={10} />
              AI ONLINE
            </motion.div>

            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: 'var(--hover-bg)', border: '1px solid var(--bg-card-border)' }}
            >
              {isDark
                ? <Sun  size={15} style={{ color: '#f59e0b' }} />
                : <Moon size={15} style={{ color: '#7c3aed' }} />
              }
            </motion.button>

            {/* Notification bell */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                animate={newAlert ? { rotate: [0, -18, 18, -12, 12, 0] } : {}}
                transition={{ duration: 0.5 }}
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false) }}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--hover-bg)', border: '1px solid var(--bg-card-border)' }}
              >
                <Bell size={15} style={{ color: 'var(--text-secondary)' }} />
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50"
                    style={dropdownStyle}
                  >
                    <div className="px-4 py-3 flex items-center justify-between"
                      style={{ borderBottom: '1px solid var(--bg-card-border)' }}>
                      <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Anomaly Alerts</span>
                      <button
                        onClick={() => panelItems.filter(i => !readIds.has(i.id)).forEach(i => handleMarkAsRead(i.id))}
                        className="text-[10px] font-mono"
                        style={{ color: 'var(--accent-blue)' }}
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-5 text-center text-[11px] text-white/40">
                          No active anomaly alerts
                        </div>
                      ) : (
                        notifications.map(n => {
                          const isRead = readIds.has(n.id)
                          return (
                            <div key={n.id} className="px-4 py-3 flex gap-3 transition-colors cursor-pointer"
                              style={{
                                borderBottom: '1px solid var(--bg-card-border)',
                                background: isRead ? 'rgba(255,255,255,0.03)' : 'transparent',
                              }}
                              onClick={() => { navigate(`/alerts?id=${n.id}`); setShowNotifications(false) }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                              onMouseLeave={e => e.currentTarget.style.background = isRead ? 'rgba(255,255,255,0.03)' : 'transparent'}>
                              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                style={{ background: n.type === 'critical' ? '#ef4444' : n.type === 'warning' ? '#f59e0b' : '#2563eb' }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold" style={{ color: isRead ? 'rgba(255,255,255,0.55)' : 'var(--text-secondary)' }}>{n.title}</p>
                                <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>{n.city} · {n.displayId}</p>
                              </div>
                              {!isRead && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id) }}
                                  className="text-[10px] font-mono text-blue-400 hover:text-blue-300 whitespace-nowrap"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.03 }}
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false) }}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', padding: '1px' }}>
                  <div className="w-full h-full rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--bg-secondary)' }}>
                    <span className="text-xs font-display font-bold" style={{ color: 'var(--text-primary)' }}>
                      {user?.email?.charAt(0).toUpperCase() || 'T'}
                    </span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{user?.username || 'Admin'}</div>
                  <div className="text-[10px] font-mono" style={{ color: 'var(--accent-blue)' }}>{user?.email || 'ops@telecom.ai'}</div>
                </div>
                <ChevronDown size={12} className="hidden md:block" style={{ color: 'var(--text-muted)' }} />
              </motion.div>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute right-0 top-12 w-52 rounded-2xl overflow-hidden z-50"
                    style={dropdownStyle}
                  >
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--bg-card-border)' }}>
                      <p className="text-xs font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{user?.username}</p>
                      <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--accent-blue)', fontWeight: '500' }}>{user?.email}</p>
                      <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>{user?.role}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-body transition-colors"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={13} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
