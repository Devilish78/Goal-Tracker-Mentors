import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Target, Brain, Link } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const onboardingScreens = [
  {
    id: 'welcome',
    title: 'Welcome to GoalTracker!',
    subtitle: 'Your personal goal achievement companion',
    description: 'Transform your dreams into reality with smart goal setting, progress tracking, and AI-powered insights that adapt to your lifestyle.',
    icon: Target,
    color: 'primary'
  },
  {
    id: 'contextual',
    title: 'Smart Goal Suggestions',
    subtitle: 'AI that understands your context',
    description: 'Get personalized goal recommendations based on your location, time of day, current habits, and progress history. Never run out of meaningful goals to pursue.',
    icon: Brain,
    color: 'purple'
  },
  {
    id: 'habits',
    title: 'Habit Stacking Power',
    subtitle: 'Build on what you already do',
    description: 'Link new goals to existing routines with our habit stacking feature. "After I brush my teeth, I will do 10 push-ups" - making change effortless.',
    icon: Link,
    color: 'success'
  }
]

function OnboardingFlow() {
  const [currentScreen, setCurrentScreen] = useState(0)
  const navigate = useNavigate()
  const { updateUser } = useAuth()

  const handleNext = () => {
    if (currentScreen < onboardingScreens.length - 1) {
      setCurrentScreen(currentScreen + 1)
    } else {
      completeOnboarding()
    }
  }

  const handlePrevious = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1)
    }
  }

  const completeOnboarding = async () => {
    await updateUser({ onboarding_completed: true })
    navigate('/dashboard')
  }

  const skipOnboarding = () => {
    completeOnboarding()
  }

  const screen = onboardingScreens[currentScreen]
  const IconComponent = screen.icon

  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    purple: 'from-purple-500 to-purple-600',
    success: 'from-success-500 to-success-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {onboardingScreens.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index <= currentScreen ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Icon */}
            <div className={`bg-gradient-to-r ${colorClasses[screen.color]} p-6 rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center`}>
              <IconComponent className="w-12 h-12 text-white" />
            </div>

            {/* Content */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {screen.title}
            </h1>
            
            <h2 className="text-lg font-medium text-primary-600 dark:text-primary-400 mb-6">
              {screen.subtitle}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-12">
              {screen.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={currentScreen === 0 ? skipOnboarding : handlePrevious}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium flex items-center"
          >
            {currentScreen === 0 ? (
              'Skip'
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center transition-colors duration-200"
          >
            {currentScreen === onboardingScreens.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingFlow
