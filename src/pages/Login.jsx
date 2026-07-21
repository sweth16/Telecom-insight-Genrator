import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wifi,
  Eye,
  EyeOff,
  Shield,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Activity,
  Globe,
  Zap,
} from 'lucide-react'

import { GoogleLogin } from '@react-oauth/google'

import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

// Demo credentials removed - use OAuth only
const DEMO_CREDENTIALS = {
  username: '',
  password: '',
}

const networkNodes = [
  { x: 15, y: 20 },
  { x: 40, y: 10 },
  { x: 70, y: 25 },
  { x: 85, y: 15 },
  { x: 25, y: 50 },
  { x: 55, y: 45 },
  { x: 80, y: 55 },
  { x: 10, y: 75 },
  { x: 45, y: 70 },
  { x: 72, y: 80 },
  { x: 90, y: 72 },
  { x: 30, y: 85 },
]

const connections = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [1, 5],
  [2, 5],
  [3, 6],
  [4, 5],
  [5, 6],
  [4, 7],
  [5, 8],
  [6, 9],
  [7, 8],
  [8, 9],
  [9, 10],
  [8, 11],
]

export default function LoginPage() {
  const { login } = useAuth()
  const { toggleTheme, isDark } = useTheme()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()

    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }

    setLoading(true)

    await new Promise((r) => setTimeout(r, 1200))

    if (
      username === DEMO_CREDENTIALS.username &&
      password === DEMO_CREDENTIALS.password
    ) {
      login(username, `${username.toLowerCase()}@telecom.ai`)
    } else {
      setError('Invalid credentials. Please use Google OAuth to sign in.')
      setLoading(false)
    }
  }

  // GOOGLE LOGIN SUCCESS
  const handleGoogleSuccess = (credentialResponse) => {
    console.log('GOOGLE LOGIN SUCCESS')
    console.log(credentialResponse)

    const token = credentialResponse.credential

    // Save JWT token
    localStorage.setItem('token', token)

    // Save login status
    localStorage.setItem('googleLogin', 'true')

    // Decode JWT to extract email
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = atob(base64)
      const decoded = JSON.parse(jsonPayload)
      
      const email = decoded.email
      if (!email) {
        throw new Error('No email found in token')
      }
      
      const username = email.split('@')[0] // Extract part before @

      console.log('Decoded email:', email)
      console.log('Username:', username)
      
      // Login to app with email
      login(username, email)
    } catch (error) {
      console.error('Error decoding token:', error)
      // Use a default but still pass email parameter
      login('Google User', 'user@gmail.com')
    }
  }

  // GOOGLE LOGIN ERROR
  const handleGoogleError = () => {
    console.log('Google Login Failed')
    setError('Google Login Failed')
  }

  return (
    <div className="login-page min-h-screen flex">

      {/* LEFT PANEL */}
      <div className="login-left hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-12">

        {/* NETWORK SVG */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </radialGradient>
          </defs>

          {connections.map(([a, b], i) => (
            <motion.line
              key={i}
              x1={`${networkNodes[a].x}%`}
              y1={`${networkNodes[a].y}%`}
              x2={`${networkNodes[b].x}%`}
              y2={`${networkNodes[b].y}%`}
              stroke="rgba(0,212,255,0.12)"
              strokeWidth="0.3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: i * 0.08 }}
            />
          ))}

          {networkNodes.map((node, i) => (
            <motion.circle
              key={i}
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r="0.7"
              fill="#2563eb"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.7] }}
              transition={{ duration: 0.6, delay: i * 0.1 + 0.5 }}
            />
          ))}
        </svg>

        <div className="absolute inset-0 login-left-overlay" />

        {/* BRAND */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            }}
          >
            <Wifi size={18} className="text-white" />
          </div>

          <div>
            <div
              className="text-white font-display font-bold text-lg tracking-widest uppercase"
              style={{ letterSpacing: '0.15em' }}
            >
              Telecom Insight
            </div>

            <div
              className="text-[10px] font-mono tracking-[0.25em] uppercase"
              style={{ color: 'rgba(0,212,255,0.7)' }}
            >
              Network Intelligence Platform
            </div>
          </div>
        </motion.div>

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="relative z-10"
        >
          <h2 className="text-4xl font-display font-bold text-white leading-tight mb-4">
            Unified Network
            <br />

            <span
              style={{
                background: 'linear-gradient(135deg, #2563eb, #0d9488)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Operations Centre
            </span>
          </h2>

          <p
            className="text-sm font-body leading-relaxed"
            style={{
              color: 'rgba(15,23,42,0.45)',
              maxWidth: 360,
            }}
          >
            Real-time carrier performance monitoring,
            AI-powered anomaly detection,
            and predictive analytics.
          </p>
        </motion.div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right flex-1 flex flex-col items-center justify-center px-8 relative">

        {/* THEME TOGGLE */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="absolute top-6 right-6 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono login-theme-btn"
        >
          <span>{isDark ? '☀' : '☾'}</span>
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="w-full max-w-[400px]"
        >

          {/* MOBILE BRAND */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              }}
            >
              <Wifi size={15} className="text-white" />
            </div>

            <span className="font-display font-bold tracking-widest text-sm login-brand-text uppercase">
              Telecom Insight
            </span>
          </div>

          {/* HEADING */}
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold login-heading mb-1.5">
              Operator Sign In
            </h1>

            <p className="text-sm font-body login-subtext">
              Authorised personnel only.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* USERNAME */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest mb-2 login-label">
                Username
              </label>

              <div
                className={`relative rounded-xl transition-all duration-200 ${
                  focused === 'user'
                    ? 'login-input-focused'
                    : 'login-input-idle'
                }`}
              >
                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 login-icon"
                />

                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError('')
                  }}
                  onFocus={() => setFocused('user')}
                  onBlur={() => setFocused(null)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-body outline-none login-input"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest mb-2 login-label">
                Password
              </label>

              <div
                className={`relative rounded-xl transition-all duration-200 ${
                  focused === 'pass'
                    ? 'login-input-focused'
                    : 'login-input-idle'
                }`}
              >
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 login-icon"
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  onFocus={() => setFocused('pass')}
                  onBlur={() => setFocused(null)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm font-body outline-none login-input"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 login-icon"
                >
                  {showPassword ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </div>
            </div>

            {/* ERROR */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl"
                  style={{
                    background: 'rgba(255,51,102,0.08)',
                    border: '1px solid rgba(255,51,102,0.25)',
                  }}
                >
                  <AlertCircle
                    size={14}
                    className="text-neon-red flex-shrink-0 mt-0.5"
                  />

                  <span
                    className="text-xs font-body"
                    style={{ color: '#ef4444' }}
                  >
                    {error}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* LOGIN BUTTON */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-display font-semibold text-sm text-white relative overflow-hidden"
              style={{
                background: loading
                  ? 'rgba(0,212,255,0.3)'
                  : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              }}
            >
              {loading ? (
                <span>Authenticating…</span>
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* GOOGLE LOGIN */}
          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>

          {/* DEMO
          <div className="mt-6 p-3.5 rounded-xl login-demo-box">
            <p className="text-[11px] font-mono login-demo-creds">
              Username: <strong>admin</strong> · Password:{' '}
              <strong>telecom2024</strong>
            </p>
          </div> */}

          {/* SECURITY */}
          <div className="mt-6 flex items-center gap-2 justify-center">
            <Shield size={11} className="login-secure-icon" />

            <p className="text-[11px] font-mono login-secure-text text-center">
              256-bit TLS encryption
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}