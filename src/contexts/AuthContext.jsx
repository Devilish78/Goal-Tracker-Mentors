import React, { createContext, useContext, useState, useEffect } from 'react'
import { initializeDatabase, createUser, getUserByEmail, updateUser as dbUpdateUser } from '../utils/database'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dbInitialized, setDbInitialized] = useState(false)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // Initialize database
      const dbResult = await initializeDatabase()
      setDbInitialized(dbResult.success)
      
      // Check for existing session
      const savedUser = localStorage.getItem('goalTracker_user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        } catch (parseError) {
          console.error('Error parsing saved user data:', parseError)
          localStorage.removeItem('goalTracker_user')
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      setDbInitialized(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      if (dbInitialized) {
        const result = await getUserByEmail(email)
        
        if (result.success) {
          const userData = {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            onboarding_completed: result.user.onboarding_completed
          }
          
          setUser(userData)
          localStorage.setItem('goalTracker_user', JSON.stringify(userData))
          return { success: true, user: userData }
        }
      }
      
      // Fallback to localStorage for demo
      const userData = {
        id: Date.now(),
        email: email,
        name: email.split('@')[0],
        onboarding_completed: false
      }
      
      setUser(userData)
      localStorage.setItem('goalTracker_user', JSON.stringify(userData))
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    }
  }

  const register = async (name, email, password) => {
    try {
      if (dbInitialized) {
        const passwordHash = btoa(password) // Simple encoding for demo
        const result = await createUser(email, name, passwordHash)
        
        if (result.success) {
          const userData = {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            onboarding_completed: result.user.onboarding_completed || false
          }
          
          setUser(userData)
          localStorage.setItem('goalTracker_user', JSON.stringify(userData))
          return { success: true, user: userData }
        }
      }
      
      // Fallback to localStorage for demo
      const userData = {
        id: Date.now(),
        email: email,
        name: name,
        onboarding_completed: false
      }
      
      setUser(userData)
      localStorage.setItem('goalTracker_user', JSON.stringify(userData))
      return { success: true, user: userData }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('goalTracker_user')
  }

  const updateUser = async (updates) => {
    try {
      if (dbInitialized && user?.id) {
        const result = await dbUpdateUser(user.id, updates)
        
        if (result.success) {
          const updatedUser = { ...user, ...updates }
          setUser(updatedUser)
          localStorage.setItem('goalTracker_user', JSON.stringify(updatedUser))
          return { success: true }
        }
      }
      
      // Fallback to localStorage
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('goalTracker_user', JSON.stringify(updatedUser))
      return { success: true }
    } catch (error) {
      console.error('Update user error:', error)
      return { success: false, error: 'Update failed' }
    }
  }

  const value = {
    user,
    loading,
    dbInitialized,
    login,
    register,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
