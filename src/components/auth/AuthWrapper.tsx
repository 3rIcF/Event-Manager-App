// Event Manager App - Authentication Wrapper
// Manages authentication state and renders appropriate screens
// Created: 2025-08-19

import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import LoginScreen from './LoginScreen'
import SignUpScreen from './SignUpScreen'
import { Loader2 } from 'lucide-react'

interface AuthWrapperProps {
  children: React.ReactNode
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const [showSignUp, setShowSignUp] = useState(false)

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">
            Event Manager wird geladen...
          </h2>
          <p className="text-gray-500 mt-2">
            Überprüfe Authentifizierung...
          </p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, show auth screens
  if (!user) {
    if (showSignUp) {
      return <SignUpScreen onSwitchToLogin={() => setShowSignUp(false)} />
    }
    return <LoginScreen onSwitchToSignUp={() => setShowSignUp(true)} />
  }

  // If user is authenticated, render the main app
  return <>{children}</>
}

export default AuthWrapper
