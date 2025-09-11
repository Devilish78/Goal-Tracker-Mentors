import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Target, TrendingUp, Share2 } from 'lucide-react'
import { format } from 'date-fns'

function GoalCard({ goal, streak }) {
  const progress = goal.target_value > 0 ? Math.round((goal.total_progress / goal.target_value) * 100) : 0
  const isCompleted = progress >= 100

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

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d')
    } catch (error) {
      return 'Invalid date'
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGoalTypeColor(goal.goal_type)}`}>
              {goal.goal_type}
            </span>
            {isCompleted && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200">
                Completed
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
              {goal.description}
            </p>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full progress-fill ${
              isCompleted ? 'bg-success-500' : 'bg-primary-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{goal.total_progress || 0} / {goal.target_value}</span>
          {streak?.current > 0 && (
            <span className="flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {streak.current} day streak
            </span>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          Started {formatDate(goal.start_date)}
        </div>
        {goal.end_date && (
          <div>
            Due {formatDate(goal.end_date)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Link
          to={`/goal/${goal.id}`}
          className="flex-1 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900 dark:hover:bg-primary-800 text-primary-700 dark:text-primary-300 text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          View Details
        </Link>
        <Link
          to={`/share/${goal.id}`}
          className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 p-2 rounded-lg transition-colors duration-200"
        >
          <Share2 className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  )
}

export default GoalCard
