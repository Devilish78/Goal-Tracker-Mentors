import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Share2, Download, Copy, Check, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useGoals } from '../contexts/GoalContext'
import { useAuth } from '../contexts/AuthContext'
import html2canvas from 'html2canvas'

const socialPlatforms = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600 hover:bg-blue-700',
    shareUrl: 'https://www.facebook.com/sharer/sharer.php'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-sky-500 hover:bg-sky-600',
    shareUrl: 'https://twitter.com/intent/tweet'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    shareUrl: null // Instagram doesn't support direct URL sharing
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700 hover:bg-blue-800',
    shareUrl: 'https://www.linkedin.com/sharing/share-offsite/'
  }
]

const shareTemplates = [
  {
    id: 'achievement',
    name: 'Achievement',
    template: "🎉 Just completed my goal: {goalTitle}! {progress}% achieved. #GoalAchieved #PersonalGrowth"
  },
  {
    id: 'progress',
    name: 'Progress Update',
    template: "📈 Making progress on my goal: {goalTitle}. Currently at {progress}%! Every step counts. #ProgressUpdate #Goals"
  },
  {
    id: 'motivation',
    name: 'Motivational',
    template: "💪 Working towards my goal: {goalTitle}. {progress}% complete and feeling motivated! What goals are you working on? #Motivation #GoalSetting"
  },
  {
    id: 'milestone',
    name: 'Milestone',
    template: "🏆 Hit a major milestone on my goal: {goalTitle}! {progress}% complete. The journey continues! #Milestone #Achievement"
  }
]

function ProgressSharing() {
  const { id } = useParams()
  const { goals } = useGoals()
  const { user } = useAuth()
  const [goal, setGoal] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState('achievement')
  const [customText, setCustomText] = useState('')
  const [shareFormat, setShareFormat] = useState('text') // 'text' or 'image'
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const shareCardRef = useRef(null)

  useEffect(() => {
    const foundGoal = goals.find(g => g.id === parseInt(id))
    if (foundGoal) {
      setGoal(foundGoal)
      generateCustomText(foundGoal, selectedTemplate)
    }
  }, [id, goals, selectedTemplate])

  const generateCustomText = (goal, templateId) => {
    const template = shareTemplates.find(t => t.id === templateId)
    if (!template) return

    const progress = goal.targetValue 
      ? Math.round((goal.currentValue / goal.targetValue) * 100)
      : 100

    const text = template.template
      .replace('{goalTitle}', goal.title)
      .replace('{progress}', progress)

    setCustomText(text)
  }

  const getProgressPercentage = () => {
    if (!goal?.targetValue) return 100
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100)
  }

  const generateShareImage = async () => {
    if (!shareCardRef.current) return null

    setGenerating(true)
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        width: 800,
        height: 600
      })
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      return blob
    } catch (error) {
      console.error('Failed to generate image:', error)
      return null
    } finally {
      setGenerating(false)
    }
  }

  const downloadImage = async () => {
    const blob = await generateShareImage()
    if (!blob) return

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `goal-progress-${goal.title.replace(/\s+/g, '-').toLowerCase()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(customText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const shareToSocial = async (platform) => {
    const encodedText = encodeURIComponent(customText)
    const encodedUrl = encodeURIComponent(window.location.origin)

    let shareUrl = ''

    switch (platform.id) {
      case 'facebook':
        shareUrl = `${platform.shareUrl}?u=${encodedUrl}&quote=${encodedText}`
        break
      case 'twitter':
        shareUrl = `${platform.shareUrl}?text=${encodedText}&url=${encodedUrl}`
        break
      case 'linkedin':
        shareUrl = `${platform.shareUrl}?url=${encodedUrl}&summary=${encodedText}`
        break
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so copy text to clipboard
        await copyToClipboard()
        alert('Text copied to clipboard! You can now paste it in your Instagram post.')
        return
      default:
        return
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
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
            <Share2 className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Share Your Progress
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Celebrate your achievements and inspire others
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Share Configuration */}
          <div className="space-y-6">
            {/* Format Selection */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Share Format
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShareFormat('text')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    shareFormat === 'text'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    Text Post
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Share as text with customizable message
                  </p>
                </button>
                <button
                  onClick={() => setShareFormat('image')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    shareFormat === 'image'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    Image Post
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generate a visual progress card
                  </p>
                </button>
              </div>
            </div>

            {/* Template Selection */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Message Template
              </h2>
              <div className="space-y-3">
                {shareTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedTemplate === template.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.template.replace('{goalTitle}', goal.title).replace('{progress}', Math.round(getProgressPercentage()))}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Customize Message
              </h2>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                placeholder="Write your custom message..."
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {customText.length} characters
                </span>
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                    copied
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Social Media Sharing */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Share to Social Media
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {socialPlatforms.map((platform) => {
                  const IconComponent = platform.icon
                  return (
                    <button
                      key={platform.id}
                      onClick={() => shareToSocial(platform)}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-white font-medium transition-colors ${platform.color}`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{platform.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            {shareFormat === 'image' && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Image Preview
                  </h2>
                  <button
                    onClick={downloadImage}
                    disabled={generating}
                    className="flex items-center space-x-2 btn-primary disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{generating ? 'Generating...' : 'Download'}</span>
                  </button>
                </div>

                {/* Share Card */}
                <div
                  ref={shareCardRef}
                  className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-8 text-white"
                  style={{ width: '400px', height: '300px' }}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{goal.title}</h3>
                      <p className="text-primary-100 mb-4">{goal.type} Goal</p>
                    </div>

                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-lg font-bold">{Math.round(getProgressPercentage())}%</span>
                        </div>
                        <div className="w-full bg-primary-400 rounded-full h-3">
                          <div
                            className="bg-white h-3 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage()}%` }}
                          />
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-semibold text-sm">
                              {user?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium">{user?.name}</span>
                        </div>
                        <span className="text-primary-100 text-sm">GoalTracker</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Text Preview */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Text Preview
              </h2>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {user?.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        • Just now
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {customText}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Goal Stats */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Goal Statistics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-primary-600">
                    {Math.round(getProgressPercentage())}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Complete</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
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

export default ProgressSharing
