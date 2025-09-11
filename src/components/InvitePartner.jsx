import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Users, Copy, Check, Mail, Settings, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useGoals } from '../contexts/GoalContext'

function InvitePartner() {
  const { user } = useAuth()
  const { goals } = useGoals()
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [selectedGoals, setSelectedGoals] = useState([])
  const [privacySettings, setPrivacySettings] = useState({
    showProgress: true,
    showDetails: true,
    allowComments: true,
    showStreaks: true
  })

  React.useEffect(() => {
    generateInviteLink()
  }, [selectedGoals, privacySettings])

  const generateInviteLink = () => {
    const linkData = {
      userId: user.id,
      userName: user.name,
      goals: selectedGoals,
      privacy: privacySettings,
      timestamp: Date.now()
    }
    
    const encodedData = btoa(JSON.stringify(linkData))
    const baseUrl = window.location.origin
    setInviteLink(`${baseUrl}/partner-invite/${encodedData}`)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const toggleGoalSelection = (goalId) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    )
  }

  const togglePrivacySetting = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`${user.name} invited you to be their accountability partner`)
    const body = encodeURIComponent(`Hi!

${user.name} has invited you to be their accountability partner on GoalTracker. You'll be able to see their progress on selected goals and provide encouragement along their journey.

Click here to accept the invitation:
${inviteLink}

Let's achieve great things together!`)
    
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              to="/partners"
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Partners
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
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Invite Accountability Partner
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Share your goals with trusted friends and family. Choose what to share and maintain full control over your privacy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Goal Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Select Goals to Share
            </h2>

            <div className="space-y-3">
              {goals.map((goal) => (
                <label
                  key={goal.id}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors duration-200 ${
                    selectedGoals.includes(goal.id)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedGoals.includes(goal.id)}
                    onChange={() => toggleGoalSelection(goal.id)}
                    className="sr-only"
                  />
                  
                  <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                    selectedGoals.includes(goal.id)
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedGoals.includes(goal.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {goal.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {goal.goal_type} • {Math.round((goal.total_progress / goal.target_value) * 100)}% complete
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {goals.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  You don't have any goals to share yet.
                </p>
                <Link to="/create-goal" className="btn-primary">
                  Create Your First Goal
                </Link>
              </div>
            )}
          </motion.div>

          {/* Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Privacy Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-6">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Privacy Settings
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'showProgress', label: 'Show Progress Percentages', description: 'Let partners see your exact progress numbers' },
                  { key: 'showDetails', label: 'Show Goal Details', description: 'Share goal descriptions and notes' },
                  { key: 'allowComments', label: 'Allow Encouragement', description: 'Partners can send you motivational messages' },
                  { key: 'showStreaks', label: 'Show Streak Counters', description: 'Display your daily streak achievements' }
                ].map((setting) => (
                  <label
                    key={setting.key}
                    className="flex items-start cursor-pointer"
                  >
                    <button
                      type="button"
                      onClick={() => togglePrivacySetting(setting.key)}
                      className={`mt-1 mr-3 w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        privacySettings[setting.key] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
                        privacySettings[setting.key] ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                    
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {setting.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {setting.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Invite Link */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Share Invitation
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Invitation Link
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      className="flex-1 input-field rounded-r-none"
                    />
                    <button
                      onClick={copyToClipboard}
                      className={`px-4 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg transition-colors duration-200 ${
                        copied 
                          ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400'
                          : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={shareViaEmail}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Share via Email
                </button>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <p className="mb-2">
                    <strong>Selected goals:</strong> {selectedGoals.length} of {goals.length}
                  </p>
                  <p>
                    This link is unique to you and contains your privacy preferences. 
                    Only share it with people you trust.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default InvitePartner
