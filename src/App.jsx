import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'

import MainLayout from './layouts/MainLayout'

import Dashboard from './pages/Dashboard'
import AlertsPage from './pages/Alerts'
import MapPage from './pages/Map'
import HistoryPage from './pages/History'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import LoginPage from './pages/Login'

// ─────────────────────────────────────────────────────────────
// Protected Routes
// ─────────────────────────────────────────────────────────────
function ProtectedRoutes() {

  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // Google login token
  const googleToken = localStorage.getItem('token')

  // Check both normal auth + google auth
  const loggedIn = isAuthenticated || googleToken

  if (!loggedIn) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  return (
    <MainLayout>
      <AnimatePresence mode="wait">

        <Routes
          location={location}
          key={location.pathname}
        >

          <Route path="/" element={<Dashboard />} />

          <Route
            path="/alerts"
            element={<AlertsPage />}
          />

          <Route
            path="/map"
            element={<MapPage />}
          />

          <Route
            path="/history"
            element={<HistoryPage />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>

      </AnimatePresence>
    </MainLayout>
  )
}

// ─────────────────────────────────────────────────────────────
// Login Route
// ─────────────────────────────────────────────────────────────
function AuthRoute() {

  const { isAuthenticated } = useAuth()

  // Google login token
  const googleToken = localStorage.getItem('token')

  const loggedIn = isAuthenticated || googleToken

  // Already logged in
  if (loggedIn) {
    return <Navigate to="/" replace />
  }

  return <LoginPage />
}

// ─────────────────────────────────────────────────────────────
// App Routes
// ─────────────────────────────────────────────────────────────
function AppRoutes() {

  return (
    <Routes>

      {/* Login */}
      <Route
        path="/login"
        element={<AuthRoute />}
      />

      {/* Protected */}
      <Route
        path="/*"
        element={<ProtectedRoutes />}
      />

    </Routes>
  )
}

// ─────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────
export default function App() {

  return (
    <ThemeProvider>

      <AuthProvider>

        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>

          <AppRoutes />

        </BrowserRouter>

      </AuthProvider>

    </ThemeProvider>
  )
}