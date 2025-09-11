import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Edit, Trash2, Plus, Calendar, Target, TrendingUp, Share2, Zap } from 'lucide-react'
import { useGoals } from '../contexts/GoalContext'
import { format, isValid, parseISO } from 'date-fns'
import LoadingSpinner from './LoadingSpinner'

function GoalDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getGoalById, logProgress, completeGoal, updateGoal } = useGoals()
  const [goal, setGoal] = useState(null)
  const [progressValue, setProgressValue] = useState('')
  const [progressNotes, setProgressNotes] = useState('')
  const [showProgressForm, setShowProgressForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (id) {
      const goalData = getGoalById(id)
      setGoal(goalData)
    }
  }, [id, getGoalById])

  const handleLogProgress = async (e) => {
    e.preventDefault()
    if (!progressValue || !goal) return

    setLoading(true)
    try {
      const result = await logProgress(goal.id, parseInt(progressValue), progressNotes)
      if (result.success) {
        setProgressValue('')
        setProgressNotes('')
        setShowProgressForm(false)
        
        // Refresh goal data
        const updatedGoal = getGoalById(id)
        setGoal(updatedGoal)
        
        // Check if goal is completed
        if (updatedGoal) {
          const newProgress = (updatedGoal.total_progress / updatedGoal.target_value) * 100
          if (newProgress >= 100) {
            triggerCelebration()
          }
        }
      }
    } catch (error) {
      console.error('Error logging progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteGoal = async () => {
    if (!goal) return
    
    const result = await completeGoal(goal.id)
    if (result.success) {
      triggerCelebration()
      const updatedGoal = getGoalById(id)
      setGoal(updatedGoal)
    }
  }

  const triggerCelebration = () => {
    setShowCelebration(true)
    
    // Simple celebration without external confetti library
    const celebrationElement = document.createElement('div')
    celebrationElement.innerHTML = '🎉'
    celebrationElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 4rem;
      z-index: 9999;
      animation: bounce 0.6s ease-out;
    `
    document.body.appendChild(celebrationElement)
    
    setTimeout(() => {
      if (document.body.contains(celebrationElement)) {
        document.body.removeChild(celebrationElement)
      }
    }, 1000)

    setTimeout(() => setShowCelebration(false), 3000)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    
    try {
      const date = parseISO(dateString)
      return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid date'
    } catch (error) {
      console.warn('Date formatting error:', error)
      return 'Invalid date'
    }
  }

  // Safe goalId conversion with validation
  const getValidGoalId = (goalId) => {
    if (!goalId) return null
    const numericId = typeof goalId === 'string' ? parseInt(goalId, 10) : goalId
    return isNaN(numericId) ? null : numericId
  }

  const validGoalId = getValidGoalId(id)

  if (!goal || !validGoalId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Goal not found
          </h2>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const progress = goal.target_value > 0 ? Math.round((goal.total_progress / goal.target_value) * 100) : 0
  const isCompleted = goal.status === 'completed' || progress >= 100

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
            
            <div className="flex items-center space-x-2">
              <Link
                to={`/share/${validGoalId}`}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Share2 className="w-5 h-5" />
              </Link>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Edit className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Goal Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  goal.goal_type === 'daily' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  goal.goal_type === 'weekly' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}>
                  {goal.goal_type}
                </span>
                {isCompleted && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200">
                    ✨ Completed
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {goal.title}
              </h1>
              
              {goal.description && (
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                  {goal.description}
                </p>
              )}

              {goal.habit_stack_trigger && (
                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg mb-6">
                  <div className="flex items-center mb-2">
                    <Zap className="w-4 h-4 text-primary-600 dark:text-primary-400 mr-2" />
                    <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                      Habit Stack
                    </span>
                  </div>
                  <p className="text-primary-700 dark:text-primary-300">
                    {goal.habit_stack_trigger}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Progress
              </h3>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {progress}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
              <motion.div
                className={`h-4 rounded-full ${isCompleted ? 'bg-success-500' : 'bg-primary-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{goal.total_progress || 0} / {goal.target_value}</span>
              <span>
                Started {formatDate(goal.start_date)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {!isCompleted && (
            <div className="flex space-x-4">
              <button
                onClick={() => setShowProgressForm(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Progress
              </button>
              
              {progress >= 100 && (
                <button
                  onClick={handleCompleteGoal}
                  className="bg-success-600 hover:bg-success-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Mark Complete
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Micro Goals Section */}
        {goal.goal_type === 'yearly' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Micro Goals
              </h3>
              <Link
                to={`/micro-goals/${validGoalId}`}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Manage →
              </Link>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300">
              Break down your yearly goal into smaller, manageable steps to make consistent progress.
            </p>
          </motion.div>
        )}

        {/* Progress Form Modal */}
        <AnimatePresence>
          {showProgressForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Log Progress
                </h3>
                
                <form onSubmit={handleLogProgress} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Progress Value
                    </label>
                    <input
                      type="number"
                      value={progressValue}
                      onChange={(e) => setProgressValue(e.target.value)}
                      min="1"
                      className="input-field"
                      placeholder="How much progress did you make?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={progressNotes}
                      onChange={(e) => setProgressNotes(e.target.value)}
                      className="input-field resize-none"
                      rows={3}
                      placeholder="Any notes about today's progress..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowProgressForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Progress'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Celebration Modal */}
        <AnimatePresence>
          {showCelebration && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Congratulations!
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  You've made amazing progress on "{goal.title}"! Keep up the great work!
                </p>
                
                <Link
                  to={`/share/${validGoalId}`}
                  className="btn-primary inline-flex items-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Your Success
                </Link>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default GoalDetails
