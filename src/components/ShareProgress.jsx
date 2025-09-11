import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Share2, Download, Copy, Check, Camera, FileText } from 'lucide-react'
import { useGoals } from '../contexts/GoalContext'
import { generateShareText, shareToSocialMedia, generateShareableImage, socialPlatforms } from '../utils/socialSharing'
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

function ShareProgress() {
  const { goalId } = useParams()
  const { getGoalById } = useGoals()
  const [goal, setGoal] = useState(null)
  const [shareFormat, setShareFormat] = useState('text') // Default to text format
  const [shareText, setShareText] = useState('')
  const [customText, setCustomText] = useState('')
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [canvasError, setCanvasError] = useState(false)
  const canvasRef = useRef(null)

  // Get valid numeric goal ID
  const validGoalId = getValidGoalId(goalId)

  useEffect(() => {
    if (validGoalId) {
      const goalData = getGoalById(validGoalId)
      setGoal(goalData)
      
      if (goalData) {
        const progress = Math.round((goalData.total_progress / goalData.target_value) * 100)
        const generatedText = generateShareText(goalData, progress)
        setShareText(generatedText)
        setCustomText(generatedText)
      }
    }
  }, [validGoalId, getGoalById])

  const handleGenerateImage = async () => {
    if (!goal || !canvasRef.current) return

    setGenerating(true)
    setCanvasError(false)
    
    try {
      const progress = Math.round((goal.total_progress / goal.target_value) * 100)
      
      // Check if canvas context is available
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('Canvas context not available')
        setCanvasError(true)
        return
      }
      
      // Try to generate image, but handle errors gracefully
      try {
        const blob = await generateShareableImage(goal, progress, canvas)
        
        // Create download link
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `goal-progress-${goal.title.replace(/\s+/g, '-').toLowerCase()}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (imageError) {
        console.error('Image generation failed:', imageError)
        setCanvasError(true)
      }
    } catch (error) {
      console.error('Error generating image:', error)
      setCanvasError(true)
    } finally {
      setGenerating(false)
    }
  }

  const handleCopyText = async () => {
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(customText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        // Fallback for older browsers or non-HTTPS environments
        const textArea = document.createElement('textarea')
        textArea.value = customText
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          document.execCommand('copy')
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch (err) {
          console.error('Fallback copy failed:', err)
          alert('Failed to copy text. Please copy manually.')
        }
        
        document.body.removeChild(textArea)
      }
    } catch (error) {
      console.error('Failed to copy text:', error)
      alert('Failed to copy text. Please copy manually.')
    }
  }

  const handleSocialShare = (platform) => {
    const url = window.location.origin
    shareToSocialMedia(platform, url, customText)
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

  const progress = Math.round((goal.total_progress / goal.target_value) * 100)

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Share2 className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Share Your Progress
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Celebrate your achievements and inspire others by sharing your goal progress.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Goal Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Goal Preview
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  {goal.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  goal.goal_type === 'daily' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  goal.goal_type === 'weekly' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}>
                  {goal.goal_type}
                </span>
              </div>

              {goal.description && (
                <p className="text-gray-600 dark:text-gray-300">
                  {goal.description}
                </p>
              )}

              {/* Progress Visualization */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progress
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                  <div
                    className="h-3 bg-primary-500 rounded-full progress-fill"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <span>{goal.total_progress || 0} / {goal.target_value}</span>
                  <span>{progress >= 100 ? 'Completed!' : 'In Progress'}</span>
                </div>
              </div>
            </div>

            {/* Hidden canvas for image generation */}
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
              width={800}
              height={600}
            />
          </motion.div>

          {/* Share Options */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Format Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Share Format
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShareFormat('image')}
                  className={`p-4 rounded-lg border-2 transition-colors duration-200 ${
                    shareFormat === 'image'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Camera className={`w-6 h-6 mx-auto mb-2 ${
                    shareFormat === 'image' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
                  }`} />
                  <span className={`font-medium ${
                    shareFormat === 'image' ? 'text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-white'
                  }`}>
                    Image
                  </span>
                </button>

                <button
                  onClick={() => setShareFormat('text')}
                  className={`p-4 rounded-lg border-2 transition-colors duration-200 ${
                    shareFormat === 'text'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <FileText className={`w-6 h-6 mx-auto mb-2 ${
                    shareFormat === 'text' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
                  }`} />
                  <span className={`font-medium ${
                    shareFormat === 'text' ? 'text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-white'
                  }`}>
                    Text
                  </span>
                </button>
              </div>
            </div>

            {/* Text Customization - Always show since it's the default */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Customize Message
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Share Text
                  </label>
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="input-field resize-none"
                    rows={4}
                    placeholder="Write your custom message..."
                  />
                </div>

                <button
                  onClick={handleCopyText}
                  className={`w-full flex items-center justify-center py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    copied 
                      ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
              </div>
            </div>

            {/* Image Generation - Only show when image format is selected */}
            {shareFormat === 'image' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Generate Image
                </h2>

                {canvasError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-700 dark:text-red-400 text-sm">
                      Image generation is not supported in this browser. Please try the text format instead.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleGenerateImage}
                  disabled={generating || canvasError}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {generating ? 'Generating...' : 'Download Progress Image'}
                </button>
              </div>
            )}

            {/* Social Media Sharing */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Share on Social Media
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(socialPlatforms).map(([key, platform]) => (
                  <button
                    key={key}
                    onClick={() => handleSocialShare(key)}
                    disabled={key === 'instagram' && shareFormat === 'image'}
                    className="flex items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-2xl mr-2">{platform.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {platform.name}
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                * Instagram sharing will copy text to clipboard for manual posting
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ShareProgress
