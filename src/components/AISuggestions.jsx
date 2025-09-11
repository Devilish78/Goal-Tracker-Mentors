import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, Plus, RefreshCw, Clock, MapPin, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useGoals } from '../contexts/GoalContext'
import { getContextualSuggestions, getHistoryBasedSuggestions } from '../utils/aiSuggestions'
import LoadingSpinner from './LoadingSpinner'

function AISuggestions() {
  const { user } = useAuth()
  const { goals, createGoal } = useGoals()
  const [contextualSuggestions, setContextualSuggestions] = useState([])
  const [historySuggestions, setHistorySuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(null)

  useEffect(() => {
    loadSuggestions()
  }, [])

  const loadSuggestions = async () => {
    try {
      // Get contextual suggestions
      const userContext = {
        timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening',
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        season: getSeason(),
        location: 'home' // Could be enhanced with geolocation
      }

      const contextual = await getContextualSuggestions(userContext, Array.isArray(goals) ? goals.slice(0, 5) : [])
      setContextualSuggestions(Array.isArray(contextual) ? contextual : [])

      // Get history-based suggestions
      const goalHistory = {
        completed: Array.isArray(goals) ? goals.filter(g => g.status === 'completed') : [],
        current: Array.isArray(goals) ? goals.filter(g => g.status === 'active') : [],
        failed: Array.isArray(goals) ? goals.filter(g => g.status === 'archived') : []
      }

      const userPreferences = {
        preferredGoalTypes: getMostCommonGoalType(),
        averageTargetValue: getAverageTargetValue(),
        commonCategories: getCommonCategories()
      }

      const history = await getHistoryBasedSuggestions(goalHistory, userPreferences)
      setHistorySuggestions(Array.isArray(history) ? history : [])
    } catch (error) {
      console.error('Error loading suggestions:', error)
      setContextualSuggestions([])
      setHistorySuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const getSeason = () => {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }

  const getMostCommonGoalType = () => {
    if (!Array.isArray(goals) || goals.length === 0) return 'daily'
    const types = goals.map(g => g.goal_type)
    return types.sort((a, b) =>
      types.filter(v => v === a).length - types.filter(v => v === b).length
    ).pop() || 'daily'
  }

  const getAverageTargetValue = () => {
    if (!Array.isArray(goals) || goals.length === 0) return 1
    return Math.round(goals.reduce((sum, g) => sum + (g.target_value || 1), 0) / goals.length)
  }

  const getCommonCategories = () => {
    // This would be enhanced with actual categorization
    return ['health', 'learning', 'productivity']
  }

  const handleCreateGoal = async (suggestion) => {
    setCreating(suggestion.title)
    
    try {
      const goalData = {
        title: suggestion.title,
        description: suggestion.description,
        goal_type: suggestion.goal_type,
        target_value: suggestion.goal_type === 'daily' ? 1 : suggestion.goal_type === 'weekly' ? 1 : 12,
        start_date: new Date().toISOString().split('T')[0],
        end_date: suggestion.goal_type === 'yearly' ? 
          new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0] : '',
        metadata: { source: 'ai_suggestion', reasoning: suggestion.reasoning }
      }

      const result = await createGoal(goalData)
      if (result.success) {
        // Remove the suggestion from the list
        setContextualSuggestions(prev => prev.filter(s => s.title !== suggestion.title))
        setHistorySuggestions(prev => prev.filter(s => s.title !== suggestion.title))
      }
    } catch (error) {
      console.error('Error creating goal:', error)
    } finally {
      setCreating(null)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading AI suggestions..." />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            
            <button
              onClick={loadSuggestions}
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            AI Goal Suggestions
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Personalized goal recommendations based on your context, habits, and progress history.
          </p>
        </motion.div>

        {/* Contextual Suggestions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Contextual Suggestions
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Based on your current time, location, and situation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contextualSuggestions.map((suggestion, index) => (
              <SuggestionCard
                key={index}
                suggestion={suggestion}
                onCreateGoal={handleCreateGoal}
                creating={creating === suggestion.title}
                icon={<Clock className="w-5 h-5" />}
                iconColor="text-blue-600 dark:text-blue-400"
                iconBg="bg-blue-100 dark:bg-blue-900"
              />
            ))}
          </div>
        </motion.section>

        {/* History-Based Suggestions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center mb-6">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg mr-3">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                History-Based Suggestions
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Recommendations based on your past goals and achievements
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {historySuggestions.map((suggestion, index) => (
              <SuggestionCard
                key={index}
                suggestion={suggestion}
                onCreateGoal={handleCreateGoal}
                creating={creating === suggestion.title}
                icon={<TrendingUp className="w-5 h-5" />}
                iconColor="text-green-600 dark:text-green-400"
                iconBg="bg-green-100 dark:bg-green-900"
              />
            ))}
          </div>
        </motion.section>

        {/* Empty State */}
        {contextualSuggestions.length === 0 && historySuggestions.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No suggestions available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create some goals first to get personalized AI suggestions.
            </p>
            <Link to="/create-goal" className="btn-primary">
              Create Your First Goal
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function SuggestionCard({ suggestion, onCreateGoal, creating, icon, iconColor, iconBg }) {
  const getGoalTypeColor = (type) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'weekly':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'yearly':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconBg} p-2 rounded-lg`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGoalTypeColor(suggestion.goal_type)}`}>
          {suggestion.goal_type}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
        {suggestion.title}
      </h3>

      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
        {suggestion.description}
      </p>

      {suggestion.reasoning && (
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Why this goal:</strong> {suggestion.reasoning}
          </p>
        </div>
      )}

      <button
        onClick={() => onCreateGoal(suggestion)}
        disabled={creating}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {creating ? (
          'Creating...'
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Create Goal
          </>
        )}
      </button>
    </motion.div>
  )
}

export default AISuggestions
