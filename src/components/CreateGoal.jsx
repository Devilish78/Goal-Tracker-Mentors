import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Target, Calendar, Clock, Link as LinkIcon, Sparkles } from 'lucide-react'
import { useGoals } from '../contexts/GoalContext'
import { getHabitStackingSuggestions } from '../utils/aiSuggestions'

function CreateGoal() {
  const navigate = useNavigate()
  const { createGoal } = useGoals()
  const [loading, setLoading] = useState(false)
  const [habitSuggestions, setHabitSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_type: 'daily',
    target_value: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    habit_stack_trigger: '',
    reminder_time: '',
    metadata: {}
  })

  useEffect(() => {
    if (formData.title && formData.goal_type) {
      loadHabitSuggestions()
    }
  }, [formData.title, formData.goal_type])

  const loadHabitSuggestions = async () => {
    if (!formData.title.trim()) return
    
    setLoadingSuggestions(true)
    try {
      const existingHabits = [
        'brush teeth',
        'drink morning coffee',
        'check phone',
        'eat breakfast',
        'take shower',
        'get dressed',
        'start work',
        'eat lunch',
        'finish work',
        'eat dinner',
        'watch TV',
        'go to bed'
      ]

      const suggestions = await getHabitStackingSuggestions(
        existingHabits,
        { title: formData.title, type: formData.goal_type },
        { morning: '7-9am', afternoon: '12-2pm', evening: '6-9pm' }
      )

      setHabitSuggestions(suggestions.slice(0, 3))
    } catch (error) {
      console.error('Error loading habit suggestions:', error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createGoal(formData)
      if (result.success) {
        navigate('/dashboard')
      } else {
        alert('Failed to create goal: ' + result.error)
      }
    } catch (error) {
      console.error('Error creating goal:', error)
      alert('Failed to create goal')
    } finally {
      setLoading(false)
    }
  }

  const goalTypeOptions = [
    { value: 'daily', label: 'Daily', description: 'Something you want to do every day' },
    { value: 'weekly', label: 'Weekly', description: 'A goal to achieve each week' },
    { value: 'yearly', label: 'Yearly', description: 'A big goal for the entire year' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              to="/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8"
        >
          <div className="flex items-center mb-8">
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg mr-4">
              <Target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Goal
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Define your next achievement and start making progress
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Goal Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {goalTypeOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.goal_type === option.value
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="goal_type"
                      value={option.value}
                      checked={formData.goal_type === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </span>
                      <span className="block text-sm text-gray-500 dark:text-gray-400">
                        {option.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Goal Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Read for 30 minutes, Exercise 3 times a week, Learn Spanish"
                className="input-field"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your goal and why it's important to you..."
                rows={3}
                className="input-field resize-none"
              />
            </div>

            {/* Target Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target {formData.goal_type === 'daily' ? 'per day' : formData.goal_type === 'weekly' ? 'per week' : 'for the year'}
              </label>
              <input
                type="number"
                name="target_value"
                value={formData.target_value}
                onChange={handleChange}
                min="1"
                className="input-field"
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              
              {formData.goal_type !== 'daily' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              )}
            </div>

            {/* Habit Stacking */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <LinkIcon className="w-4 h-4 inline mr-2" />
                Habit Stacking (Optional)
              </label>
              <input
                type="text"
                name="habit_stack_trigger"
                value={formData.habit_stack_trigger}
                onChange={handleChange}
                placeholder="After I [existing habit], I will [work on this goal]"
                className="input-field"
              />
              
              {habitSuggestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI Suggestions:
                  </p>
                  <div className="space-y-2">
                    {habitSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, habit_stack_trigger: suggestion }))}
                        className="block w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-sm transition-colors duration-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {loadingSuggestions && (
                <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                  Loading AI suggestions...
                </div>
              )}
            </div>

            {/* Reminder Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Daily Reminder (Optional)
              </label>
              <input
                type="time"
                name="reminder_time"
                value={formData.reminder_time}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link
                to="/dashboard"
                className="btn-secondary"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Goal'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default CreateGoal
