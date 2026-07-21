import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, AlertTriangle, MessageSquare, History,
  BarChart3, Settings, ChevronLeft, ChevronRight, Map
} from 'lucide-react'
import { useKPI } from '../hooks/index'

const navItems = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard',  badge: null },
  { to: '/alerts',   icon: AlertTriangle,   label: 'Alerts',     badge: null },
  // { to: '/ai-bot',   icon: MessageSquare,   label: 'Ask AI Bot', badge: 'AI' },
  { to: '/history',  icon: History,         label: 'History',    badge: null },
  // { to: '/analytics',icon: BarChart3,       label: 'Analytics',  badge: null },
  {
  to: '/map', icon: Map, label: 'Map', badge: null
},
  { to: '/settings', icon: Settings,        label: 'Settings',   badge: null },
]

export default function Sidebar({ mobileOpen, onMobileClose, onCollapsedChange }) {
  const [collapsed, setCollapsed] = useState(false)
  const { data: kpiData } = useKPI()

  const handleCollapsedChange = (newState) => {
    setCollapsed(newState)
    if (onCollapsedChange) {
      onCollapsedChange(newState)
    }
  }



  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Collapse toggle */}
      <div className={`flex ${collapsed ? 'justify-center' : 'justify-end'} px-4 py-3`}>
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => handleCollapsedChange(!collapsed)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'var(--hover-bg)', border: '1px solid var(--bg-card-border)' }}
        >
          {collapsed
            ? <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
            : <ChevronLeft  size={12} style={{ color: 'var(--text-muted)' }} />
          }
        </motion.button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink key={to} to={to} onClick={onMobileClose}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200
                  ${collapsed ? 'justify-center' : ''}
                `}
                style={{
                  background: isActive ? 'rgba(37,99,235,0.10)' : 'transparent',
                  color: isActive ? '#2563eb' : 'var(--text-secondary)',
                }}
              >
                {/* Active bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeBar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: 'linear-gradient(to bottom, #2563eb, #7c3aed)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <div className="flex-shrink-0" style={{ color: isActive ? '#2563eb' : 'var(--text-muted)' }}>
                  <Icon size={16} />
                </div>

                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-body font-medium whitespace-nowrap overflow-hidden"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {!collapsed && badge && (
                  <span className={`ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-full`}
                    style={
                      badge === 'AI'
                        ? { background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.25)', color: '#0d9488' }
                        : { background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }
                    }>
                    {badge}
                  </span>
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="px-6 pb-4">
          <p className="text-[9px] font-mono text-center" style={{ color: 'var(--text-muted)' }}>
            TELECOM INSIGHT · {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '.')}
          </p>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col fixed left-0 top-16 bottom-0 z-40 overflow-hidden"
        style={{
          background: 'var(--sidebar-bg)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 md:hidden flex flex-col"
              style={{
                background: 'var(--sidebar-bg)',
                backdropFilter: 'blur(30px)',
                borderRight: '1px solid var(--sidebar-border)',
              }}
            >
              <div className="h-16 flex items-center px-6"
                style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mr-3"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                  <Wifi size={13} className="text-white" />
                </div>
                <span className="font-display font-bold text-sm tracking-widest"
                  style={{ color: 'var(--text-primary)' }}>Telecom Insight</span>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
