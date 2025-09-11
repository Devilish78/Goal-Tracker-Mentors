import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Users, Plus, Settings, Heart, TrendingUp, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

function PartnerDashboard() {
  const { user } = useAuth()
  const [partners, setPartners] = useState([])
  const [sharedGoals, setSharedGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPartnerData()
  }, [])

  const loadPartnerData = async () => {
    try {
      // Mock data for demo
      const mockPartners = [
        {
          id: 1,
          partner_name: 'Sarah Johnson',
          partner_email: 'sarah@example.com',
          shared_goals: JSON.stringify([1, 2])
        },
        {
          id: 2,
          partner_name: 'Mike Chen',
          partner_email: 'mike@example.com',
          shared_goals: JSON.stringify([3])
        }
      ]
      
      setPartners(mockPartners)
      setSharedGoals([])
    } catch (error) {
      console.error('Error loading partner data:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendEncouragement = async (partnerId, goalId) => {
    try {
      alert('Encouragement sent! 🎉')
    } catch (error) {
      console.error('Error sending encouragement:', error)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading partner dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            
            <Link
              to="/invite-partner"
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Invite Partner
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
            Accountability Partners
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Share your journey with trusted friends and family for motivation and support.
          </p>
        </motion.div>

        {/* Partners Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {partners.length}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Active Partners
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {sharedGoals.length}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Shared Goals
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              24
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Encouragements Sent
            </p>
          </div>
        </motion.div>

        {/* Partners List */}
        {partners.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Your Partners
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {partner.partner_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {partner.partner_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {partner.partner_email}
                        </p>
                      </div>
                    </div>
                    
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Sharing {JSON.parse(partner.shared_goals || '[]').length} goals
                  </div>

                  <button
                    onClick={() => sendEncouragement(partner.id)}
                    className="w-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Send Encouragement
                  </button>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty State */}
        {partners.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No accountability partners yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Invite friends and family to join you on your goal journey.
            </p>
            <Link to="/invite-partner" className="btn-primary">
              Invite Your First Partner
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default PartnerDashboard
