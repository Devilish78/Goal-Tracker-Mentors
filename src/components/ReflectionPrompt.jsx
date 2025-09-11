import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Send } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useGoals } from '../contexts/GoalContext'
import { generateReflectionPrompts } from '../utils/aiSuggestions'
import { saveReflection } from '../utils/database'

function ReflectionPrompt({ onClose }) {
  const { user, dbInitialized } = useAuth()
  const { goals } = useGoals()
  const [prompts, setPrompts] = useState([])
  const [currentPrompt, setCurrentPrompt] = useState(0)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReflectionPrompts()
  }, [])

  const loadReflectionPrompts = async () => {
    try {
      const recentGoals = Array.isArray(goals) ? goals.slice(0, 3) : []
      const challenges = ['time management', 'consistency', 'motivation']
      
      const generatedPrompts = await generateReflectionPrompts(
        recentGoals,
        challenges,
        'mixed'
      )

      // Ensure we have at least one prompt
      if (generatedPrompts && Array.isArray(generatedPrompts) && generatedPrompts.length > 0) {
        setPrompts(generatedPrompts)
      } else {
        // Fallback prompts if AI fails
        setPrompts([
          {
            question: "How are you feeling about your progress on your goals?",
            purpose: "General reflection"
          },
          {
            question: "What's one small win you've had recently with your goals?",
            purpose: "Celebrating progress"
          },
          {
            question: "What's the biggest challenge you're facing right now?",
            purpose: "Identifying obstacles"
          }
        ])
      }
    } catch (error) {
      console.error('Error loading reflection prompts:', error)
      // Set fallback prompts on error
      setPrompts([
        {
          question: "How are you feeling about your progress on your goals?",
          purpose: "General reflection"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!response.trim() || !prompts[currentPrompt]) return

    try {
      if (dbInitialized && user?.id) {
        // Save to database
        await saveReflection(user.id, prompts[currentPrompt].question, response)
      } else {
        // Fallback to localStorage
        const reflections = JSON.parse(localStorage.getItem(`reflections_${user.id}`) || '[]')
        reflections.push({
          id: Date.now(),
          prompt: prompts[currentPrompt].question,
          response: response,
          created_at: new Date().toISOString()
        })
        localStorage.setItem(`reflections_${user.id}`, JSON.stringify(reflections))
      }

      if (currentPrompt < prompts.length - 1) {
        setCurrentPrompt(currentPrompt + 1)
        setResponse('')
      } else {
        onClose()
      }
    } catch (error) {
      console.error('Error saving reflection:', error)
    }
  }

  const handleSkip = () => {
    if (currentPrompt < prompts.length - 1) {
      setCurrentPrompt(currentPrompt + 1)
      setResponse('')
    } else {
      onClose()
    }
  }

  if (loading) {
    return null
  }

  // Safety check for prompts
  const currentPromptData = prompts[currentPrompt]
  if (!currentPromptData) {
    return null
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Reflection Time
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentPrompt + 1} of {prompts.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-900 dark:text-white text-lg mb-2">
              {currentPromptData.question}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Purpose: {currentPromptData.purpose}
            </p>
          </div>

          <div className="mb-6">
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
            >
              Skip
            </button>
            <div className="flex space-x-3">
              <button
                onClick={handleSubmit}
                disabled={!response.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                <Send className="w-4 h-4" />
                <span>{currentPrompt < prompts.length - 1 ? 'Next' : 'Finish'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ReflectionPrompt
