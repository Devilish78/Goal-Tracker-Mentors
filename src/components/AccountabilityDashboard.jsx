import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Plus, UserPlus, Eye, EyeOff, Settings, Heart, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { partnerAPI } from '../utils/api'

function AccountabilityDashboard() {
  const { user } = useAuth()
  const [partners, setPartners] = useState([])
  const [sharedGoals, setSharedGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPartnerData()
  }, [])

  const loadPartnerData = async () => {
    setLoading(true)
    try {
      const [partnersData, goalsData] = await Promise.all([
        partnerAPI.getPartners(user.id),
        partnerAPI.getSharedGoals(user.id)
      ])
      setPartners(partnersData)
      setSharedGoals(goalsData)
    } catch (error) {
      console.error('Failed to load partner data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEncouragement = async (partnerId, goalId) => {
    try {
      await partnerAPI.sendEncouragement(partnerId, goalId, user.id)
      // Refresh data to show updated encouragement
      loadPartnerData()
    } catch (error) {
      console.error('Failed to send encouragement:', error)
    }
  }

  if (loading) {
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/invite-partner"
                className="flex items-center space-x-2 btn-primary"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite Partner</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Accountability Partners
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Share your journey and support each other's goals
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Partners</p>
                <p className="text-3xl font-bold text-green-600">{partners.length}</p>
              </div>
              <Users className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Shared Goals</p>
                <p className="text-3xl font-bold text-blue-600">{sharedGoals.length}</p>
              </div>
              <Eye className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Encouragements</p>
                <p className="text-3xl font-bold text-pink-600">
                  {partners.reduce((sum, p) => sum + (p.encouragements || 0), 0)}
                </p>
              </div>
              <Heart className="w-12 h-12 text-pink-500" />
            </div>
          </div>
        </div>

        {/* Partners Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Partners
          </h2>
          
          {partners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {partner.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {partner.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {partner.sharedGoals} shared goals
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Weekly Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {partner.weeklyProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${partner.weeklyProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Last active: {partner.lastActive}
                    </span>
                    <button
                      onClick={() => handleEncouragement(partner.id)}
                      className="flex items-center space-x-1 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/30 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">Encourage</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-8">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No partners yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Invite friends and family to join your goal journey
              </p>
              <Link to="/invite-partner" className="btn-primary">
                Invite Your First Partner
              </Link>
            </div>
          )}
        </section>

        {/* Shared Goals Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Shared Goals Activity
          </h2>
          
          {sharedGoals.length > 0 ? (
            <div className="space-y-4">
              {sharedGoals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {goal.partnerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {goal.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {goal.partnerName} • {goal.type} goal
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {goal.progress}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {goal.lastUpdate}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEncouragement(goal.partnerId, goal.id)}
                          className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/20 text-pink-600 hover:bg-pink-200 dark:hover:bg-pink-900/30 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {goal.progress > 0 && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-8">
              <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No shared goals yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Share some of your goals with partners to see their activity here
              </p>
              <Link to="/" className="btn-primary">
                Go to Goals
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default AccountabilityDashboard
