import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, Plus, X, Sparkles, MapPin, Clock, History } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGoals } from '../contexts/GoalContext'
import { useAuth } from '../contexts/AuthContext'
import { aiAPI } from '../utils/api'

function AIGoalSuggestions() {
  const { goals, createGoal } = useGoals()
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingGoal, setCreatingGoal] = useState(null)

  useEffect(() => {
    generateSuggestions()
  }, [goals])

  const generateSuggestions = async () => {
    setLoading(true)
    try {
      // Get contextual data
      const contextData = {
        currentGoals: goals.map(g => ({ type: g.type, title: g.title, category: g.category })),
        completedGoals: goals.filter(g => g.status === 'completed').length,
        currentTime: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        userPreferences: JSON.parse(localStorage.getItem('userPreferences') || '{}')
      }

      const suggestions = await aiAPI.generateGoalSuggestions(contextData)
      setSuggestions(suggestions)
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
      // Fallback suggestions
      setSuggestions([
        {
          id: 1,
          type: 'daily',
          title: 'Morning Meditation',
          description: 'Start your day with 10 minutes of mindfulness',
          reason: 'Based on your morning routine patterns',
          category: 'wellness',
          icon: '🧘'
        },
        {
          id: 2,
          type: 'weekly',
          title: 'Learn Something New',
          description: 'Dedicate 2 hours weekly to learning a new skill',
          reason: 'You seem to enjoy personal development',
          category: 'learning',
          icon: '📚'
        },
        {
          id: 3,
          type: 'daily',
          title: 'Evening Walk',
          description: 'Take a 20-minute walk after dinner',
          reason: 'Perfect for your evening schedule',
          category: 'fitness',
          icon: '🚶'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptSuggestion = async (suggestion) => {
    setCreatingGoal(suggestion.id)
    
    const goalData = {
      type: suggestion.type,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category
    }

    const result = await createGoal(goalData)
    
    if (result.success) {
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
    }
    
    setCreatingGoal(null)
  }

  const handleDismissSuggestion = (suggestionId) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
  }

  const getSuggestionTypeColor = (type) => {
    switch (type) {
      case 'daily':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'weekly':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'yearly':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getReasonIcon = (reason) => {
    if (reason.includes('time') || reason.includes('schedule')) return <Clock className="w-4 h-4" />
    if (reason.includes('location') || reason.includes('place')) return <MapPin className="w-4 h-4" />
    if (reason.includes('history') || reason.includes('past')) return <History className="w-4 h-4" />
    return <Sparkles className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            
            <button
              onClick={generateSuggestions}
              disabled={loading}
              className="flex items-center space-x-2 btn-primary disabled:opacity-50"
            >
              <Brain className="w-4 h-4" />
              <span>{loading ? 'Generating...' : 'Refresh Suggestions'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI Goal Suggestions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Personalized recommendations based on your patterns and context
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Analyzing your patterns to generate personalized suggestions...
              </p>
            </div>
          </div>
        )}

        {/* Suggestions Grid */}
        {!loading && suggestions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card relative"
              >
                {/* Dismiss Button */}
                <button
                  onClick={() => handleDismissSuggestion(suggestion.id)}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>

                {/* Suggestion Content */}
                <div className="pr-8">
                  {/* Type Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSuggestionTypeColor(suggestion.type)}`}>
                      {suggestion.type}
                    </span>
                    <span className="text-2xl">{suggestion.icon}</span>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {suggestion.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {suggestion.description}
                  </p>

                  {/* AI Reasoning */}
                  <div className="flex items-center space-x-2 mb-6 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    {getReasonIcon(suggestion.reason)}
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {suggestion.reason}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAcceptSuggestion(suggestion)}
                      disabled={creatingGoal === suggestion.id}
                      className="flex items-center space-x-2 btn-primary flex-1 justify-center disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {creatingGoal === suggestion.id ? 'Adding...' : 'Add Goal'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDismissSuggestion(suggestion.id)}
                      className="btn-secondary"
                    >
                      Not Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && suggestions.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No suggestions available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Complete a few goals to help our AI understand your preferences better
            </p>
            <Link to="/create-goal" className="btn-primary">
              Create Goal Manually
            </Link>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-12 card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            How AI Suggestions Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Contextual Timing</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Suggests goals based on your current time and schedule patterns
              </p>
            </div>
            <div className="text-center">
              <History className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Learning from History</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analyzes your past goals and achievements to suggest similar ones
              </p>
            </div>
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Smart Recommendations</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Uses AI to suggest goals that complement your existing ones
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AIGoalSuggestions
