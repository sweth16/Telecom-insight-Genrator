import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Shield, Bell, Globe, Cpu, Database, Sliders, Sun, Moon, LogOut } from 'lucide-react'
import { pageTransition, staggerItem } from '../animations/variants'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

function Toggle({ checked, onChange }) {
  return (
    <motion.button
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ background: checked ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(15,23,42,0.1)' }}
      animate={{ boxShadow: checked ? '0 0 12px rgba(37,99,235,0.25)' : 'none' }}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
      />
    </motion.button>
  )
}

function SettingRow({ label, description, children }) {
  return (
    <motion.div 
      whileHover={{ backgroundColor: 'rgba(248,250,252,0.5)' }}
      className="flex items-center justify-between gap-4 py-4 border-b border-slate-100 px-3 rounded-lg transition-colors cursor-pointer"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900 font-body font-semibold">{label}</p>
        {description && <p className="text-[11px] text-slate-600 font-body mt-1">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </motion.div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <motion.div
      variants={staggerItem}
      className="rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200"
      style={{ background: 'rgba(248,250,252,0.97)', border: '1px solid rgba(15,23,42,0.1)' }}
    >
      <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2.5 bg-gradient-to-r from-slate-50 to-transparent">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)' }}
        >
          <Icon size={14} className="text-neon-blue" style={{ color: 'var(--neon-blue)' }} />
        </motion.div>
        <h3 className="text-sm font-display font-bold text-slate-900">{title}</h3>
      </div>
      <div className="px-5 py-2">{children}</div>
    </motion.div>
  )
}

export default function Settings() {
  const { theme, toggleTheme, isDark } = useTheme()
  const { logout, user } = useAuth()

  const defaultSettings = {
    autoRefresh: true,
    aiEnabled: true,
    
    showPredictions: true,
    
    refreshInterval: '30',
  }

  const [settings, setSettings] = useState(defaultSettings)
  const [saved, setSaved] = useState(false)

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('platformSettings')
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          setSettings(parsed)
          console.log('Loaded settings from localStorage:', parsed)
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }
    
    loadSettings()
  }, [])

  const update = (key, val) => {
    setSettings(s => ({ ...s, [key]: val }))
  }

  const handleSave = () => {
    try {
      localStorage.setItem('platformSettings', JSON.stringify(settings))
      console.log('Settings saved to localStorage:', settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Platform Settings</h1>
          <p className="text-xs text-white/30 font-body mt-1">Configuration, preferences, and account management</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-body transition-all"
          style={{
            background: saved
              ? 'linear-gradient(135deg, rgba(0,255,204,0.2), rgba(0,212,255,0.2))'
              : 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            boxShadow: saved ? '0 0 15px rgba(13,148,136,0.25)' : '0 0 20px rgba(0,212,255,0.3)',
          }}
        >
          <Save size={14} />
          {saved ? 'Saved!' : 'Save Changes'}
        </motion.button>
      </div>

      <motion.div
        className="space-y-4"
        initial="initial" animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
      >
        {/* ── Appearance ── */}
        <Section icon={isDark ? Moon : Sun} title="Appearance & Display">
          <SettingRow
            label="Interface Theme"
            description="Switch between dark and light mode across the entire platform"
          >
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-700">{isDark ? 'Dark' : 'Light'}</span>
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-mono transition-all"
                style={{
                  background: isDark ? 'rgba(255,220,100,0.1)' : 'rgba(0,212,255,0.1)',
                  border: isDark ? '1px solid rgba(255,220,100,0.2)' : '1px solid rgba(0,212,255,0.2)',
                  color: isDark ? '#ffdc64' : '#2563eb',
                }}
              >
                {isDark ? <Sun size={12} /> : <Moon size={12} />}
                {isDark ? 'Switch to Light' : 'Switch to Dark'}
              </motion.button>
            </div>
          </SettingRow>
        </Section>

        {/* ── Data & Refresh ── */}
        <Section icon={Database} title="Data & Refresh">
          <SettingRow label="Auto-Refresh" description="Automatically poll dashboard for new data">
            <Toggle checked={settings.autoRefresh} onChange={v => update('autoRefresh', v)} />
          </SettingRow>
          <SettingRow label="Refresh Interval" description="Frequency of live data polling">
            <motion.select
              whileHover={{ borderColor: 'rgba(0,212,255,0.5)' }}
              value={settings.refreshInterval}
              onChange={e => update('refreshInterval', e.target.value)}
              className="bg-white/10 text-slate-900 text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500/60 hover:border-slate-400 transition-all cursor-pointer"
            >
              <option value="10">10 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
            </motion.select>
          </SettingRow>
         
        </Section>

        {/* ── AI Engine ── */}
        <Section icon={Cpu} title="AI Engine">
          <SettingRow label="AI Assistant" description="Enable the AI chatbot and natural language query engine">
            <Toggle checked={settings.aiEnabled} onChange={v => update('aiEnabled', v)} />
          </SettingRow>
          
        </Section>

        {/* ── Security ── */}
        <Section icon={Shield} title="Security & Session">
          <SettingRow label="Authenticated User" description="Current active operator account">
            <span className="text-xs font-mono text-slate-900 bg-white/5 px-3 py-1 rounded-lg border border-slate-300">{user?.username || 'admin'}</span>
          </SettingRow>
          <SettingRow label="Session Token" description="Your current authenticated session identifier">
            <span className="text-[10px] font-mono text-slate-900 tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-slate-300">••••••••••••4f2a</span>
          </SettingRow>
          <SettingRow label="OAuth 2.0" description="Authentication protocol enabled">
            <span className="text-xs font-mono text-emerald-400 px-2 py-1 rounded-lg"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
              Enabled
            </span>
          </SettingRow>
          <SettingRow label="Last Sign-In" description="">
            <span className="text-[10px] font-mono text-slate-900 bg-white/5 px-3 py-1 rounded-lg border border-slate-300">Today, 09:41 IST</span>
          </SettingRow>
          <SettingRow label="Sign Out" description="Terminate this session and return to the login screen">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,51,102,0.15)' }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="flex items-center gap-2 text-xs font-body px-4 py-2 rounded-xl transition-all font-semibold"
              style={{ background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.4)', color: '#ef4444' }}
            >
              <LogOut size={12} />
              Sign Out
            </motion.button>
          </SettingRow>
        </Section>
      </motion.div>
    </motion.div>
  )
}
