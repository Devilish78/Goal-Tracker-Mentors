import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Plus, Target, Calendar, Trophy, Flame, Moon, Sun, Settings, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useGoals } from '../contexts/GoalContext'
import { useTheme } from '../contexts/ThemeContext'
import GoalCard from './GoalCard'
import StreakCounter from './StreakCounter'
import ReflectionPrompt from './ReflectionPrompt'
import LoadingSpinner from './LoadingSpinner'

function Dashboard() {
  const { user } = useAuth()
  const { goals, loading, getGoalsByType, streaks } = useGoals()
  const { isDark, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('daily')
  const [showReflection, setShowReflection] = useState(false)

  useEffect(() => {
    // Show reflection prompt periodically
    const lastReflection = localStorage.getItem('lastReflection')
    const now = Date.now()
    const daysSinceReflection = lastReflection ? (now - parseInt(lastReflection)) / (1000 * 60 * 60 * 24) : 7

    if (daysSinceReflection >= 3) {
      setShowReflection(true)
    }
  }, [])

  const dailyGoals = getGoalsByType('daily')
  const weeklyGoals = getGoalsByType('weekly')
  const yearlyGoals = getGoalsByType('yearly')

  const totalStreak = Object.values(streaks).reduce((sum, streak) => sum + (streak.current || 0), 0)

  const tabs = [
    { id: 'daily', label: 'Daily', icon: Target, goals: dailyGoals },
    { id: 'weekly', label: 'Weekly', icon: Calendar, goals: weeklyGoals },
    { id: 'yearly', label: 'Yearly', icon: Trophy, goals: yearlyGoals }
  ]

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                GoalTracker
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <StreakCounter streak={totalStreak} />
              
              <Link
                to="/partners"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Users className="w-5 h-5" />
              </Link>

              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Ready to make progress on your goals today?
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/create-goal"
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center">
              <Plus className="w-8 h-8 mr-3" />
              <div>
                <h3 className="font-semibold text-lg">Create New Goal</h3>
                <p className="text-primary-100">Start your next achievement</p>
              </div>
            </div>
          </Link>

          <Link
            to="/ai-suggestions"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center">
              <Target className="w-8 h-8 mr-3" />
              <div>
                <h3 className="font-semibold text-lg">AI Suggestions</h3>
                <p className="text-purple-100">Get personalized ideas</p>
              </div>
            </div>
          </Link>

          <Link
            to="/visualizations"
            className="bg-gradient-to-r from-success-500 to-success-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center">
              <Trophy className="w-8 h-8 mr-3" />
              <div>
                <h3 className="font-semibold text-lg">Progress Visuals</h3>
                <p className="text-success-100">See your journey</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Goal tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                      {tab.goals.length}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Goals grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tabs.find(tab => tab.id === activeTab)?.goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GoalCard goal={goal} streak={streaks[goal.id]} />
            </motion.div>
          ))}
          
          {tabs.find(tab => tab.id === activeTab)?.goals.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No {activeTab} goals yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create your first {activeTab} goal to get started on your journey.
              </p>
              <Link
                to="/create-goal"
                className="btn-primary inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Goal
              </Link>
            </div>
          )}
        </div>

        {/* Reflection reminder */}
        {showReflection && (
          <ReflectionPrompt onClose={() => setShowReflection(false)} />
        )}
      </div>
    </div>
  )
}

export default Dashboard
