import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Sprout, Droplets, Map, BarChart3 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useGoals } from '../contexts/GoalContext'

const visualizationTypes = [
  {
    id: 'plant',
    name: 'Growing Plant',
    description: 'Watch your progress grow like a plant',
    icon: Sprout,
    color: 'text-green-600'
  },
  {
    id: 'jar',
    name: 'Filling Jar',
    description: 'Fill up a jar with your achievements',
    icon: Droplets,
    color: 'text-blue-600'
  },
  {
    id: 'journey',
    name: 'Journey Map',
    description: 'Travel along a path to your destination',
    icon: Map,
    color: 'text-purple-600'
  }
]

function ProgressVisualization() {
  const { id } = useParams()
  const { goals } = useGoals()
  const [goal, setGoal] = useState(null)
  const [selectedVisualization, setSelectedVisualization] = useState('plant')

  useEffect(() => {
    const foundGoal = goals.find(g => g.id === parseInt(id))
    if (foundGoal) {
      setGoal(foundGoal)
    }
  }, [id, goals])

  const getProgressPercentage = () => {
    if (!goal?.targetValue) return 0
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100)
  }

  const renderPlantVisualization = () => {
    const progress = getProgressPercentage()
    const stages = [
      { threshold: 0, emoji: '🌱', name: 'Seed' },
      { threshold: 20, emoji: '🌿', name: 'Sprout' },
      { threshold: 40, emoji: '🌱', name: 'Seedling' },
      { threshold: 60, emoji: '🌳', name: 'Young Tree' },
      { threshold: 80, emoji: '🌲', name: 'Growing Tree' },
      { threshold: 100, emoji: '🌳', name: 'Mature Tree' }
    ]

    const currentStage = stages.reverse().find(stage => progress >= stage.threshold) || stages[0]

    return (
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-8xl mb-4"
        >
          {currentStage.emoji}
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {currentStage.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your goal is {Math.round(progress)}% complete
        </p>
      </div>
    )
  }

  const renderJarVisualization = () => {
    const progress = getProgressPercentage()
    const fillHeight = Math.max(10, progress)

    return (
      <div className="text-center">
        <div className="relative mx-auto w-32 h-48 mb-4">
          {/* Jar outline */}
          <div className="absolute inset-0 border-4 border-gray-400 rounded-b-3xl rounded-t-lg">
            {/* Jar lid */}
            <div className="absolute -top-2 left-2 right-2 h-4 bg-gray-400 rounded-lg"></div>
            
            {/* Fill */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${fillHeight}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-300 rounded-b-3xl"
            />
            
            {/* Bubbles */}
            {progress > 20 && (
              <div className="absolute inset-0 overflow-hidden rounded-b-3xl">
                {[...Array(Math.floor(progress / 20))].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 200, opacity: 0 }}
                    animate={{ y: -20, opacity: [0, 1, 0] }}
                    transition={{
                      duration: 2,
                      delay: i * 0.5,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    style={{
                      left: `${20 + (i * 15) % 60}%`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {Math.round(progress)}% Full
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Keep going to fill up your achievement jar!
        </p>
      </div>
    )
  }

  const renderJourneyVisualization = () => {
    const progress = getProgressPercentage()
    const milestones = [
      { position: 0, emoji: '🏠', name: 'Start' },
      { position: 25, emoji: '🌉', name: 'First Bridge' },
      { position: 50, emoji: '⛰️', name: 'Mountain' },
      { position: 75, emoji: '🏰', name: 'Castle' },
      { position: 100, emoji: '🏆', name: 'Victory!' }
    ]

    return (
      <div className="text-center">
        <div className="relative w-full h-32 mb-6">
          {/* Path */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-300 dark:bg-gray-600 rounded-full transform -translate-y-1/2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
            />
          </div>

          {/* Milestones */}
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${milestone.position}%` }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0.5 }}
                animate={{
                  scale: progress >= milestone.position ? 1.2 : 0.8,
                  opacity: progress >= milestone.position ? 1 : 0.5
                }}
                transition={{ duration: 0.3 }}
                className="text-2xl mb-2"
              >
                {milestone.emoji}
              </motion.div>
              <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {milestone.name}
              </p>
            </div>
          ))}

          {/* Current position indicator */}
          <motion.div
            initial={{ left: 0 }}
            animate={{ left: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
          >
            <div className="w-4 h-4 bg-purple-600 rounded-full border-2 border-white shadow-lg"></div>
          </motion.div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {Math.round(progress)}% of the Journey
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          You're making great progress on your adventure!
        </p>
      </div>
    )
  }

  const renderVisualization = () => {
    switch (selectedVisualization) {
      case 'plant':
        return renderPlantVisualization()
      case 'jar':
        return renderJarVisualization()
      case 'journey':
        return renderJourneyVisualization()
      default:
        return renderPlantVisualization()
    }
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              to={`/goal/${goal.id}`}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Goal</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Progress Visualization
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {goal.title}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visualization Types */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Visualization Style
            </h2>
            <div className="space-y-3">
              {visualizationTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedVisualization(type.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedVisualization === type.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className={`w-6 h-6 ${type.color}`} />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {type.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Visualization Display */}
          <div className="lg:col-span-2">
            <div className="card min-h-[400px] flex items-center justify-center">
              {renderVisualization()}
            </div>

            {/* Progress Stats */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Progress Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">
                    {Math.round(getProgressPercentage())}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Complete</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {goal.currentValue || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {goal.targetValue || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Target</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {goal.completions?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProgressVisualization
