import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('ti-auth') === 'true'
  )
  const [user, setUser] = useState(
    () => JSON.parse(sessionStorage.getItem('ti-user') || 'null')
  )

  const login = (username, email) => {
    const userData = { username, role: 'Network Operations Admin', email: email || `${username.toLowerCase()}@telecom.ai` }
    setUser(userData)
    setIsAuthenticated(true)
    sessionStorage.setItem('ti-auth', 'true')
    sessionStorage.setItem('ti-user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    
    // Clear all auth-related storage
    sessionStorage.removeItem('ti-auth')
    sessionStorage.removeItem('ti-user')
    localStorage.removeItem('token')
    localStorage.removeItem('googleLogin')
    
    // Redirect to login
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
