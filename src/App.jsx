import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { GoalProvider } from './contexts/GoalContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { initializeAIPrompts } from './utils/aiSuggestions'
import WelcomeScreen from './components/WelcomeScreen'
import OnboardingFlow from './components/OnboardingFlow'
import Dashboard from './components/Dashboard'
import GoalDetails from './components/GoalDetails'
import CreateGoal from './components/CreateGoal'
import AISuggestions from './components/AISuggestions'
import PartnerDashboard from './components/PartnerDashboard'
import InvitePartner from './components/InvitePartner'
import ProgressVisualizations from './components/ProgressVisualizations'
import MicroGoalBreakdown from './components/MicroGoalBreakdown'
import ShareProgress from './components/ShareProgress'
import AuthModal from './components/AuthModal'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'

function AppContent() {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    // Initialize AI prompts on app startup
    initializeAIPrompts().catch(error => {
      console.warn('Failed to initialize AI prompts:', error)
    })
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={
              user ? <Navigate to="/dashboard" replace /> : <WelcomeScreen onGetStarted={() => setShowAuthModal(true)} />
            } />
            <Route path="/onboarding" element={
              user ? <OnboardingFlow /> : <Navigate to="/" replace />
            } />
            <Route path="/dashboard" element={
              user ? <Dashboard /> : <Navigate to="/" replace />
            } />
            <Route path="/goal/:id" element={
              user ? <GoalDetails /> : <Navigate to="/" replace />
            } />
            <Route path="/create-goal" element={
              user ? <CreateGoal /> : <Navigate to="/" replace />
            } />
            <Route path="/ai-suggestions" element={
              user ? <AISuggestions /> : <Navigate to="/" replace />
            } />
            <Route path="/partners" element={
              user ? <PartnerDashboard /> : <Navigate to="/" replace />
            } />
            <Route path="/invite-partner" element={
              user ? <InvitePartner /> : <Navigate to="/" replace />
            } />
            <Route path="/visualizations" element={
              user ? <ProgressVisualizations /> : <Navigate to="/" replace />
            } />
            <Route path="/micro-goals/:goalId" element={
              user ? <MicroGoalBreakdown /> : <Navigate to="/" replace />
            } />
            <Route path="/share/:goalId" element={
              user ? <ShareProgress /> : <Navigate to="/" replace />
            } />
          </Routes>
        </ErrorBoundary>

        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </div>
    </Router>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GoalProvider>
          <AppContent />
        </GoalProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
