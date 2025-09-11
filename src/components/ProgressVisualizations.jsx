import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, BarChart3, PieChart, TrendingUp, Sprout, Droplets, Map, AlertTriangle } from 'lucide-react'
import { useGoals } from '../contexts/GoalContext'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from 'recharts'

// Enhanced error boundary component for charts
class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chart error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Chart unavailable</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              {this.state.error?.message || 'Rendering error'}
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Safe chart wrapper component
function SafeChart({ children, fallbackHeight = 300 }) {
  return (
    <ChartErrorBoundary>
      <div style={{ width: '100%', height: fallbackHeight }}>
        {children}
      </div>
    </ChartErrorBoundary>
  )
}

function ProgressVisualizations() {
  const { goals } = useGoals()
  const [activeVisualization, setActiveVisualization] = useState('plant')

  const visualizationTypes = [
    { id: 'plant', name: 'Growing Plant', icon: Sprout, description: 'Watch your goals grow like a plant' },
    { id: 'jar', name: 'Filling Jar', icon: Droplets, description: 'Fill jars with your progress' },
    { id: 'journey', name: 'Journey Map', icon: Map, description: 'Track your path to success' },
    { id: 'charts', name: 'Progress Charts', icon: BarChart3, description: 'Traditional charts and graphs' }
  ]

  const getProgressData = () => {
    if (!Array.isArray(goals)) return []
    
    return goals.map(goal => {
      const progress = goal.target_value > 0 ? Math.round((goal.total_progress / goal.target_value) * 100) : 0
      return {
        name: goal.title || 'Untitled Goal',
        progress: Math.min(progress, 100), // Cap at 100%
        type: goal.goal_type || 'daily',
        target: goal.target_value || 1,
        current: goal.total_progress || 0
      }
    }).filter(goal => goal.name !== 'Untitled Goal') // Filter out invalid goals
  }

  const getGoalTypeData = () => {
    if (!Array.isArray(goals)) return []
    
    const types = goals.reduce((acc, goal) => {
      const type = goal.goal_type || 'daily'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    return Object.entries(types).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: type === 'daily' ? '#3B82F6' : type === 'weekly' ? '#10B981' : '#8B5CF6'
    }))
  }

  const progressData = getProgressData()
  const goalTypeData = getGoalTypeData()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Progress Visualizations
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            See your progress come to life with beautiful, interactive visualizations that make tracking goals engaging and motivating.
          </p>
        </motion.div>

        {/* Visualization Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {visualizationTypes.map((type) => {
            const IconComponent = type.icon
            return (
              <button
                key={type.id}
                onClick={() => setActiveVisualization(type.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  activeVisualization === type.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <IconComponent className={`w-6 h-6 mx-auto mb-2 ${
                  activeVisualization === type.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
                }`} />
                <h3 className={`font-medium text-sm ${
                  activeVisualization === type.id ? 'text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-white'
                }`}>
                  {type.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {type.description}
                </p>
              </button>
            )
          })}
        </motion.div>

        {/* Visualization Content */}
        <motion.div
          key={activeVisualization}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeVisualization === 'plant' && <PlantVisualization goals={progressData} />}
          {activeVisualization === 'jar' && <JarVisualization goals={progressData} />}
          {activeVisualization === 'journey' && <JourneyVisualization goals={progressData} />}
          {activeVisualization === 'charts' && <ChartsVisualization goals={progressData} goalTypes={goalTypeData} />}
        </motion.div>
      </div>
    </div>
  )
}

function PlantVisualization({ goals }) {
  if (!goals || goals.length === 0) {
    return (
      <div className="text-center py-12">
        <Sprout className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No goals to visualize yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((goal, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">
            {goal.name}
          </h3>
          
          <div className="relative h-48 flex items-end justify-center mb-4">
            {/* Pot */}
            <div className="w-20 h-16 bg-gradient-to-b from-amber-600 to-amber-700 rounded-b-lg relative">
              {/* Soil */}
              <div className="absolute top-0 left-1 right-1 h-3 bg-amber-900 rounded-t-sm"></div>
              
              {/* Plant stem */}
              <div 
                className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-1 bg-green-600 plant-grow"
                style={{ height: `${Math.max(goal.progress * 0.8, 10)}px` }}
              >
                {/* Leaves */}
                {goal.progress > 20 && (
                  <div className="absolute top-2 -left-2 w-4 h-3 bg-green-500 rounded-full transform -rotate-45"></div>
                )}
                {goal.progress > 40 && (
                  <div className="absolute top-4 -right-2 w-4 h-3 bg-green-500 rounded-full transform rotate-45"></div>
                )}
                {goal.progress > 60 && (
                  <div className="absolute top-6 -left-3 w-5 h-4 bg-green-400 rounded-full transform -rotate-30"></div>
                )}
                {goal.progress > 80 && (
                  <div className="absolute top-8 -right-3 w-5 h-4 bg-green-400 rounded-full transform rotate-30"></div>
                )}
                
                {/* Flower */}
                {goal.progress >= 100 && (
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-pink-500 rounded-full">
                    <div className="absolute inset-1 bg-yellow-300 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {goal.progress}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {goal.current} / {goal.target}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function JarVisualization({ goals }) {
  if (!goals || goals.length === 0) {
    return (
      <div className="text-center py-12">
        <Droplets className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No goals to visualize yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((goal, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">
            {goal.name}
          </h3>
          
          <div className="relative h-48 flex items-end justify-center mb-4">
            {/* Jar outline */}
            <div className="relative w-24 h-40 border-4 border-gray-400 dark:border-gray-500 rounded-b-2xl rounded-t-lg">
              {/* Jar lid */}
              <div className="absolute -top-2 -left-1 -right-1 h-4 bg-gray-500 dark:bg-gray-400 rounded-lg"></div>
              
              {/* Fill */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-500 to-primary-400 rounded-b-xl jar-fill"
                style={{ 
                  height: `${goal.progress}%`,
                  '--fill-height': `${goal.progress}%`
                }}
              >
                {/* Bubbles */}
                {goal.progress > 10 && (
                  <>
                    <div className="absolute top-4 left-2 w-2 h-2 bg-white bg-opacity-30 rounded-full"></div>
                    <div className="absolute top-8 right-3 w-1 h-1 bg-white bg-opacity-40 rounded-full"></div>
                    <div className="absolute top-12 left-4 w-1.5 h-1.5 bg-white bg-opacity-35 rounded-full"></div>
                  </>
                )}
              </div>
              
              {/* Progress markers */}
              <div className="absolute left-0 right-0 top-0 bottom-0">
                {[25, 50, 75].map((mark) => (
                  <div
                    key={mark}
                    className="absolute left-0 right-0 border-t border-gray-300 dark:border-gray-600 border-dashed"
                    style={{ bottom: `${mark}%` }}
                  >
                    <span className="absolute -right-8 -top-2 text-xs text-gray-500 dark:text-gray-400">
                      {mark}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {goal.progress}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {goal.current} / {goal.target}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function JourneyVisualization({ goals }) {
  if (!goals || goals.length === 0) {
    return (
      <div className="text-center py-12">
        <Map className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No goals to visualize yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {goals.map((goal, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-6">
            {goal.name}
          </h3>
          
          <div className="relative">
            {/* Path */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-1000"
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
            
            {/* Milestones */}
            <div className="flex justify-between items-center relative z-10">
              {[0, 25, 50, 75, 100].map((milestone) => (
                <div
                  key={milestone}
                  className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-sm ${
                    goal.progress >= milestone
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {milestone === 0 ? '🚀' : 
                   milestone === 25 ? '🎯' :
                   milestone === 50 ? '⭐' :
                   milestone === 75 ? '🔥' : '🏆'}
                </div>
              ))}
            </div>
            
            {/* Labels */}
            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Start</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>Goal!</span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {goal.progress}% Complete
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {goal.current} of {goal.target} achieved
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function ChartsVisualization({ goals, goalTypes }) {
  if (!goals || goals.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No goals to visualize yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Progress Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Goal Progress
        </h3>
        <SafeChart fallbackHeight={300}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={goals} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Bar dataKey="progress" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SafeChart>
      </div>

      {/* Goal Types Pie Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Goal Types Distribution
        </h3>
        <SafeChart fallbackHeight={300}>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={goalTypes}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {goalTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </SafeChart>
      </div>

      {/* Progress Over Time (Mock Data) */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Progress Trend
        </h3>
        <SafeChart fallbackHeight={300}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { date: 'Week 1', progress: 10 },
              { date: 'Week 2', progress: 25 },
              { date: 'Week 3', progress: 45 },
              { date: 'Week 4', progress: 60 },
              { date: 'Week 5', progress: 75 },
              { date: 'Week 6', progress: 85 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="progress" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </SafeChart>
      </div>
    </div>
  )
}

export default ProgressVisualizations
