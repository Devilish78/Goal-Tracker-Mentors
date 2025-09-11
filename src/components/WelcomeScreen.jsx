import React from 'react'
import { motion } from 'framer-motion'
import { Target, TrendingUp, Users, Sparkles } from 'lucide-react'

function WelcomeScreen({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-primary-600 p-4 rounded-full">
              <Target className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Goal<span className="text-primary-600">Tracker</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your dreams into achievable goals with AI-powered insights, 
            accountability partners, and beautiful progress tracking.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <div className="bg-success-100 dark:bg-success-900 p-3 rounded-full w-fit mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Smart Progress Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Visualize your journey with interactive charts, streak counters, and beautiful progress animations.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full w-fit mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI-Powered Suggestions
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get personalized goal recommendations based on your habits, context, and progress history.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-fit mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Accountability Partners
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Share your journey with trusted friends and family for motivation and support.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <button
            onClick={onGetStarted}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Start Your Journey
          </button>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Join thousands of users achieving their goals every day
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default WelcomeScreen
