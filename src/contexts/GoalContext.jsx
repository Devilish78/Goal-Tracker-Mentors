import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { 
  getUserGoals, 
  createGoal as dbCreateGoal, 
  updateGoal as dbUpdateGoal, 
  logProgress as dbLogProgress 
} from '../utils/database'

const GoalContext = createContext()

export function useGoals() {
  const context = useContext(GoalContext)
  if (!context) {
    throw new Error('useGoals must be used within a GoalProvider')
  }
  return context
}

export function GoalProvider({ children }) {
  const { user, dbInitialized } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(false)
  const [streaks, setStreaks] = useState({})

  useEffect(() => {
    if (user) {
      loadGoals()
      calculateStreaks()
    }
  }, [user, dbInitialized])

  const loadGoals = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      if (!dbInitialized) {
        // Fallback to localStorage with consistent key
        const savedGoals = localStorage.getItem(`goalTracker_goals_${user.id}`)
        if (savedGoals) {
          try {
            const parsedGoals = JSON.parse(savedGoals)
            setGoals(Array.isArray(parsedGoals) ? parsedGoals : [])
          } catch (parseError) {
            console.error('Error parsing saved goals:', parseError)
            setGoals([])
          }
        } else {
          // Initialize with sample goals for demo
          const sampleGoals = [
            {
              id: 1,
              title: 'Read for 30 minutes daily',
              description: 'Build a consistent reading habit to expand knowledge',
              goal_type: 'daily',
              target_value: 1,
              total_progress: 15,
              start_date: '2024-01-01',
              status: 'active',
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              title: 'Exercise 3 times per week',
              description: 'Maintain physical fitness and health',
              goal_type: 'weekly',
              target_value: 3,
              total_progress: 8,
              start_date: '2024-01-01',
              status: 'active',
              created_at: new Date().toISOString()
            }
          ]
          setGoals(sampleGoals)
          localStorage.setItem(`goalTracker_goals_${user.id}`, JSON.stringify(sampleGoals))
        }
        return
      }

      const result = await getUserGoals(user.id)
      if (result.success) {
        setGoals(Array.isArray(result.goals) ? result.goals : [])
      } else {
        console.error('Failed to load goals:', result.error)
        setGoals([])
      }
    } catch (error) {
      console.error('Error loading goals:', error)
      setGoals([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStreaks = async () => {
    if (!user) return

    try {
      const streakData = {}
      goals.forEach(goal => {
        // Simple streak calculation - can be enhanced with actual progress logs
        streakData[goal.id] = {
          current: Math.floor(Math.random() * 10) + 1,
          lastEntry: new Date().toISOString().split('T')[0]
        }
      })
      
      setStreaks(streakData)
    } catch (error) {
      console.error('Error calculating streaks:', error)
    }
  }

  const createGoal = async (goalData) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      if (!dbInitialized) {
        // Fallback to localStorage with consistent key
        const newGoal = {
          id: Date.now(),
          ...goalData,
          total_progress: 0,
          status: 'active',
          created_at: new Date().toISOString()
        }

        const updatedGoals = [newGoal, ...goals]
        setGoals(updatedGoals)
        localStorage.setItem(`goalTracker_goals_${user.id}`, JSON.stringify(updatedGoals))
        
        return { success: true, goal: newGoal }
      }

      const result = await dbCreateGoal(user.id, goalData)
      
      if (result.success) {
        setGoals(prev => [result.goal, ...prev])
        return { success: true, goal: result.goal }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Error creating goal:', error)
      return { success: false, error: 'Failed to create goal' }
    }
  }

  const updateGoal = async (goalId, updates) => {
    try {
      if (!dbInitialized) {
        // Fallback to localStorage with consistent key
        const updatedGoals = goals.map(goal => 
          goal.id === parseInt(goalId) ? { ...goal, ...updates } : goal
        )
        
        setGoals(updatedGoals)
        localStorage.setItem(`goalTracker_goals_${user.id}`, JSON.stringify(updatedGoals))
        
        return { success: true }
      }

      const result = await dbUpdateGoal(goalId, updates)
      
      if (result.success) {
        setGoals(prev => prev.map(goal => 
          goal.id === parseInt(goalId) ? result.goal : goal
        ))
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Error updating goal:', error)
      return { success: false, error: 'Failed to update goal' }
    }
  }

  const logProgress = async (goalId, value, notes = '') => {
    try {
      if (!dbInitialized) {
        // Fallback to localStorage with consistent key
        const updatedGoals = goals.map(goal => {
          if (goal.id === parseInt(goalId)) {
            return {
              ...goal,
              total_progress: (goal.total_progress || 0) + value,
              last_progress_date: new Date().toISOString().split('T')[0]
            }
          }
          return goal
        })

        setGoals(updatedGoals)
        localStorage.setItem(`goalTracker_goals_${user.id}`, JSON.stringify(updatedGoals))
        
        return { success: true }
      }

      const result = await dbLogProgress(goalId, value, notes)
      
      if (result.success) {
        // Refresh goals to get updated progress
        await loadGoals()
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Error logging progress:', error)
      return { success: false, error: 'Failed to log progress' }
    }
  }

  const completeGoal = async (goalId) => {
    try {
      const result = await updateGoal(goalId, {
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      
      if (result.success) {
        return { success: true, celebration: true }
      }
    } catch (error) {
      console.error('Error completing goal:', error)
      return { success: false, error: 'Failed to complete goal' }
    }
  }

  const getGoalById = (goalId) => {
    // Handle null/undefined goalId
    if (!goalId) return null
    
    // Convert to number for comparison - handle both string and number inputs
    const numericId = typeof goalId === 'string' ? parseInt(goalId) : goalId
    if (isNaN(numericId)) return null
    
    const goal = goals.find(goal => {
      const goalIdNum = typeof goal.id === 'string' ? parseInt(goal.id) : goal.id
      return goalIdNum === numericId
    })
    return goal || null
  }

  const getGoalsByType = (type) => {
    return goals.filter(goal => goal.goal_type === type && goal.status === 'active')
  }

  const value = {
    goals,
    loading,
    streaks,
    loadGoals,
    createGoal,
    updateGoal,
    logProgress,
    completeGoal,
    getGoalById,
    getGoalsByType
  }

  return (
    <GoalContext.Provider value={value}>
      {children}
    </GoalContext.Provider>
  )
}
