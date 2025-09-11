import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Copy, Check, Mail, Link as LinkIcon, Shield, Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useGoals } from '../contexts/GoalContext'
import { partnerAPI } from '../utils/api'

function PartnerInvitation() {
  const { user } = useAuth()
  const { goals } = useGoals()
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [selectedGoals, setSelectedGoals] = useState([])
  const [privacySettings, setPrivacySettings] = useState({
    shareProgress: true,
    shareCompletions: true,
    allowEncouragement: true,
    shareReflections: false
  })
  const [loading, setLoading] = useState(false)

  const generateInviteLink = async () => {
    setLoading(true)
    try {
      const linkData = await partnerAPI.generateInviteLink({
        userId: user.id,
        selectedGoals,
        privacySettings
      })
      setInviteLink(linkData.link)
    } catch (error) {
      console.error('Failed to generate invite link:', error)
      alert('Failed to generate invite link')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const handleGoalToggle = (goalId) => {
    setSelectedGoals(prev => 
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    )
  }

  const handlePrivacyChange = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`${user.name} invited you to be their accountability partner`)
    const body = encodeURIComponent(`Hi there!\n\n${user.name} has invited you to be their accountability partner on GoalTracker. Join them on their goal journey and support each other in achieving your dreams!\n\nClick here to accept the invitation:\n${inviteLink}\n\nBest regards,\nThe GoalTracker Team`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              to="/accountability"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Partners</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Invite Accountability Partner
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Share your goals with trusted friends and family
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Goal Selection */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Select Goals to Share
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose which goals you want to share with your accountability partner
              </p>

              {goals.length > 0 ? (
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedGoals.includes(goal.id)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleGoalToggle(goal.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {goal.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {goal.type} goal
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedGoals.includes(goal.id)
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedGoals.includes(goal.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You don't have any goals to share yet
                  </p>
                  <Link to="/create-goal" className="btn-primary">
                    Create Your First Goal
                  </Link>
                </div>
              )}
            </div>

            {/* Privacy Settings */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Privacy Settings
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Control what information your partner can see
              </p>

              <div className="space-y-4">
                {[
                  {
                    key: 'shareProgress',
                    label: 'Share Progress Updates',
                    description: 'Allow partner to see your goal progress and completion status'
                  },
                  {
                    key: 'shareCompletions',
                    label: 'Share Completion History',
                    description: 'Show when you complete goals and your streak information'
                  },
                  {
                    key: 'allowEncouragement',
                    label: 'Allow Encouragement',
                    description: 'Let your partner send you encouragement and support messages'
                  },
                  {
                    key: 'shareReflections',
                    label: 'Share Reflections',
                    description: 'Include your reflection responses in shared information'
                  }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-start space-x-3">
                    <button
                      onClick={() => handlePrivacyChange(setting.key)}
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        privacySettings[setting.key]
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {privacySettings[setting.key] && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {setting.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Invite Link Generation */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Generate Invite Link
              </h2>
              
              {!inviteLink ? (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Create a secure invitation link to share with your accountability partner
                  </p>
                  <button
                    onClick={generateInviteLink}
                    disabled={selectedGoals.length === 0 || loading}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Generating...' : 'Generate Invite Link'}
                  </button>
                  {selectedGoals.length === 0 && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      Please select at least one goal to share
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Your invitation link is ready! Share it with your accountability partner.
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate pr-4">
                        {inviteLink}
                      </p>
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

                  <div className="flex space-x-3">
                    <button
                      onClick={shareViaEmail}
                      className="flex items-center space-x-2 btn-primary flex-1 justify-center"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Share via Email</span>
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center space-x-2 btn-secondary"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>Copy Link</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                    Privacy & Security
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                    <li>• Invite links expire after 7 days for security</li>
                    <li>• Only selected goals will be shared with your partner</li>
                    <li>• You can revoke access at any time</li>
                    <li>• Partners can only see what you explicitly allow</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Preview */}
            {selectedGoals.length > 0 && (
              <div className="card">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                  Sharing Preview
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your partner will see:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• {selectedGoals.length} selected goal{selectedGoals.length > 1 ? 's' : ''}</li>
                    {privacySettings.shareProgress && <li>• Progress updates and completion status</li>}
                    {privacySettings.shareCompletions && <li>• Completion history and streaks</li>}
                    {privacySettings.allowEncouragement && <li>• Ability to send encouragement</li>}
                    {privacySettings.shareReflections && <li>• Your reflection responses</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default PartnerInvitation
