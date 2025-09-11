import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { useGoals } from '../contexts/GoalContext'
import { callDatabase } from '../utils/database'
import { useAuth } from '../contexts/AuthContext'

export default function StreakTracker() {
  const { goals } = useGoals()
  const { user } = useAuth()
  const [currentStreak, setCurrentStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculateStreak()
  }, [goals, user])

  const calculateStreak = async () => {
    if (!user) return

    try {
      // Get daily goals progress for the last 30 days
      const result = await callDatabase(`
        SELECT DATE(pe.recorded_at) as date, COUNT(*) as completed_goals
        FROM progress_entries pe
        JOIN goals g ON pe.goal_id = g.id
        WHERE g.user_id = $1 
          AND g.goal_type = 'daily'
          AND pe.recorded_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(pe.recorded_at)
        ORDER BY date DESC
      `, [user.id])

      const progressByDate = result.data
      let streak = 0
      const today = new Date()
      
      // Check consecutive days from today backwards
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - i)
        const dateString = checkDate.toISOString().split('T')[0]
        
        const dayProgress = progressByDate.find(p => 
          p.date.split('T')[0] === dateString
        )
        
        if (dayProgress && dayProgress.completed_goals > 0) {
          streak++
        } else if (i === 0) {
          // If today has no progress, check yesterday
          continue
        } else {
          break
        }
      }

      setCurrentStreak(streak)
    } catch (error) {
      console.error('Error calculating streak:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card"
    >
      <div className="flex items-center">
        <motion.div
          animate={{ 
            scale: currentStreak > 0 ? [1, 1.1, 1] : 1,
            rotate: currentStreak > 0 ? [0, 5, -5, 0] : 0
          }}
          transition={{ 
            duration: 2, 
            repeat: currentStreak > 0 ? Infinity : 0,
            repeatDelay: 3
          }}
        >
          <Flame className={`w-8 h-8 mr-3 ${
            currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'
          }`} />
        </motion.div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentStreak}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Day Streak
          </p>
        </div>
      </div>
      
      {currentStreak > 0 && (
        <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
          🔥 Keep it up! You're on fire!
        </div>
      )}
      
      {currentStreak === 0 && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Complete a daily goal to start your streak
        </div>
      )}
    </motion.div>
  )
}
