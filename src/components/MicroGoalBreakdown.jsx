import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Check, Edit, Trash2, Calendar, Target, Sparkles } from 'lucide-react'
import { useGoals } from '../contexts/GoalContext'
import { useAuth } from '../contexts/AuthContext'
import { generateMicroGoals } from '../utils/aiSuggestions'
import { getMicroGoals, createMicroGoal, updateMicroGoal, deleteMicroGoal } from '../utils/database'
import LoadingSpinner from './LoadingSpinner'

// Safe date formatting function
function formatDate(dateString) {
  if (!dateString) return 'Not set'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  } catch (error) {
    console.warn('Date formatting error:', error)
    return 'Invalid date'
  }
}

// Safe goalId conversion with validation
function getValidGoalId(goalId) {
  if (!goalId) return null
  const numericId = typeof goalId === 'string' ? parseInt(goalId, 10) : goalId
  return isNaN(numericId) ? null : numericId
}

function MicroGoalBreakdown() {
  const { goalId } = useParams()
  const { user, dbInitialized } = useAuth()
  const { getGoalById } = useGoals()
  const [goal, setGoal] = useState(null)
  const [microGoals, setMicroGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMicroGoal, setNewMicroGoal] = useState({
    title: '',
    description: '',
    target_date: ''
  })

  // Get valid numeric goal ID
  const validGoalId = getValidGoalId(goalId)

  useEffect(() => {
    if (validGoalId) {
      const goalData = getGoalById(validGoalId)
      setGoal(goalData)
      if (goalData) {
        loadMicroGoals()
      } else {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [validGoalId, getGoalById])

  const loadMicroGoals = async () => {
    if (!validGoalId) {
      setLoading(false)
      return
    }

    try {
      if (!dbInitialized) {
        // Fallback to localStorage with consistent key
        const savedMicroGoals = localStorage.getItem(`goalTracker_microGoals_${validGoalId}`)
        if (savedMicroGoals) {
          try {
            const parsedMicroGoals = JSON.parse(savedMicroGoals)
            setMicroGoals(Array.isArray(parsedMicroGoals) ? parsedMicroGoals : [])
          } catch (parseError) {
            console.error('Error parsing saved micro goals:', parseError)
            setMicroGoals([])
          }
        } else {
          setMicroGoals([])
        }
        setLoading(false)
        return
      }

      const result = await getMicroGoals(validGoalId)
      if (result.success) {
        setMicroGoals(Array.isArray(result.microGoals) ? result.microGoals : [])
      } else {
        setMicroGoals([])
      }
    } catch (error) {
      console.error('Error loading micro goals:', error)
      setMicroGoals([])
    } finally {
      setLoading(false)
    }
  }

  const generateAIMicroGoals = async () => {
    if (!goal) return
    
    setGenerating(true)
    try {
      const constraints = {
        timeAvailable: '1-2 hours per day',
        resources: 'basic',
        experience: 'beginner to intermediate'
      }
      
      const timeline = `${new Date().getFullYear()}-12-31`
      
      const aiMicroGoals = await generateMicroGoals(goal, timeline, constraints)

      if (!dbInitialized) {
        // Fallback to localStorage with consistent key
        const microGoalsWithIds = aiMicroGoals.map((mg, index) => ({
          ...mg,
          id: Date.now() + index,
          completed: false,
          parent_goal_id: validGoalId
        }))
        
        setMicroGoals(microGoalsWithIds)
        localStorage.setItem(`goalTracker_microGoals_${validGoalId}`, JSON.stringify(microGoalsWithIds))
        setGenerating(false)
        return
      }

      // Save each micro goal to database
      const newMicroGoals = []
      for (const mg of aiMicroGoals) {
        const result = await createMicroGoal(validGoalId, mg)
        if (result.success) {
          newMicroGoals.push(result.microGoal)
        }
      }
      setMicroGoals(prev => [...prev, ...newMicroGoals])
    } catch (error) {
      console.error('Error generating micro goals:', error)
    } finally {
      setGenerating(false)
    }
  }

  const addMicroGoal = async (e) => {
    e.preventDefault()
    if (!newMicroGoal.title.trim() || !validGoalId) return

    try {
      const microGoalData = {
        ...newMicroGoal,
        order_index: microGoals.length
      }

      if (!dbInitialized) {
        // Fallback to localStorage with consistent key
        const newGoal = {
          id: Date.now(),
          ...microGoalData,
          completed: false,
          parent_goal_id: validGoalId
        }

        const updatedMicroGoals = [...microGoals, newGoal]
        setMicroGoals(updatedMicroGoals)
        localStorage.setItem(`goalTracker_microGoals_${validGoalId}`, JSON.stringify(updatedMicroGoals))

        setNewMicroGoal({ title: '', description: '', target_date: '' })
        setShowAddForm(false)
        return
      }

      const result = await createMicroGoal(validGoalId, microGoalData)
      if (result.success) {
        setMicroGoals(prev => [...prev, result.microGoal])
        setNewMicroGoal({ title: '', description: '', target_date: '' })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error adding micro goal:', error)
    }
  }

  const toggleMicroGoalComplete = async (microGoalId, completed) => {
    try {
      if (!dbInitialized) {
        // Fallback to localStorage with consistent key
        const updatedMicroGoals = microGoals.map(mg => 
          mg.id === microGoalId ? { ...mg, completed: !completed } : mg
        )
        
        setMicroGoals(updatedMicroGoals)
        localStorage.setItem(`goalTracker_microGoals_${validGoalId}`, JSON.stringify(updatedMicroGoals))
        return
      }

      const updates = { 
        completed: !completed,
        completed_at: !completed ? new Date().toISOString() : null
      }
      
      const result = await updateMicroGoal(microGoalId, updates)
      if (result.success) {
        setMicroGoals(prev => prev.map(mg => 
          mg.id === microGoalId ? result.microGoal : mg
        ))
      }
    } catch (error) {
      console.error('Error updating micro goal:', error)
    }
  }

  const handleDeleteMicroGoal = async (microGoalId) => {
    if (!confirm('Are you sure you want to delete this micro goal?')) return

    try {
      if (!dbInitialized) {
        // Fallback to localStorage with consistent key
        const updatedMicroGoals = microGoals.filter(mg => mg.id !== microGoalId)
        setMicroGoals(updatedMicroGoals)
        localStorage.setItem(`goalTracker_microGoals_${validGoalId}`, JSON.stringify(updatedMicroGoals))
        return
      }

      const result = await deleteMicroGoal(microGoalId)
      if (result.success) {
        setMicroGoals(prev => prev.filter(mg => mg.id !== microGoalId))
      }
    } catch (error) {
      console.error('Error deleting micro goal:', error)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading micro goals..." />
  }

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

  const completedCount = microGoals.filter(mg => mg.completed).length
  const progressPercentage = microGoals.length > 0 ? Math.round((completedCount / microGoals.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              to={`/goal/${validGoalId}`}
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Goal
            </Link>
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
          <div className="flex items-center mb-6">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg mr-4">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Micro Goals for "{goal.title}"
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Break down your yearly goal into manageable steps
              </p>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Micro Goals Progress
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {completedCount} / {microGoals.length} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="h-3 bg-purple-500 rounded-full progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Micro Goal
            </button>
            
            {microGoals.length === 0 && (
              <button
                onClick={generateAIMicroGoals}
                disabled={generating}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generating ? 'Generating...' : 'Generate with AI'}
              </button>
            )}
          </div>
        </motion.div>

        {/* Micro Goals List */}
        <div className="space-y-4">
          <AnimatePresence>
            {microGoals.map((microGoal, index) => (
              <motion.div
                key={microGoal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${
                  microGoal.completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => toggleMicroGoalComplete(microGoal.id, microGoal.completed)}
                    className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                      microGoal.completed
                        ? 'bg-success-500 border-success-500'
                        : 'border-gray-300 dark:border-gray-600 hover:border-success-500'
                    }`}
                  >
                    {microGoal.completed && <Check className="w-4 h-4 text-white" />}
                  </button>

                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg mb-2 ${
                      microGoal.completed 
                        ? 'text-gray-500 dark:text-gray-400 line-through' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {microGoal.title}
                    </h3>
                    
                    {microGoal.description && (
                      <p className={`mb-3 ${
                        microGoal.completed 
                          ? 'text-gray-400 dark:text-gray-500' 
                          : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {microGoal.description}
                      </p>
                    )}

                    {microGoal.target_date && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        Target: {formatDate(microGoal.target_date)}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteMicroGoal(microGoal.id)}
                      className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {microGoals.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No micro goals yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Break down your yearly goal into smaller, manageable steps to make consistent progress.
            </p>
            <button
              onClick={generateAIMicroGoals}
              disabled={generating}
              className="btn-primary flex items-center mx-auto"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generating ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>
        )}

        {/* Add Micro Goal Modal */}
        <AnimatePresence>
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Add Micro Goal
                </h3>
                
                <form onSubmit={addMicroGoal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newMicroGoal.title}
                      onChange={(e) => setNewMicroGoal(prev => ({ ...prev, title: e.target.value }))}
                      className="input-field"
                      placeholder="What specific step will you take?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newMicroGoal.description}
                      onChange={(e) => setNewMicroGoal(prev => ({ ...prev, description: e.target.value }))}
                      className="input-field resize-none"
                      rows={3}
                      placeholder="Describe this micro goal in detail..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={newMicroGoal.target_date}
                      onChange={(e) => setNewMicroGoal(prev => ({ ...prev, target_date: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Add Micro Goal
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MicroGoalBreakdown
