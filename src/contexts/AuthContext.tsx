// Event Manager App - Authentication Context
// Frontend authentication state management
// Created: 2025-08-19

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { auth, db } from '../lib/supabase'
import type { User } from '../types/database'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: {
    full_name: string
    role: 'admin' | 'manager' | 'user'
    permissions?: Record<string, any>
  }) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  isAdmin: boolean
  isManager: boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { session } = await auth.getCurrentSession()
        if (session?.user) {
          const { data: userProfile } = await db.users.getCurrentProfile()
          setUser(userProfile)
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const { data: userProfile } = await db.users.getCurrentProfile()
          setUser(userProfile)
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await auth.signIn(email, password)
      if (!error) {
        // User profile will be fetched by the auth state change listener
        const { data: userProfile } = await db.users.getCurrentProfile()
        setUser(userProfile)
      }
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, userData: {
    full_name: string
    role: 'admin' | 'manager' | 'user'
    permissions?: Record<string, any>
  }) => {
    try {
      const { error } = await auth.signUp(email, password, userData)
      if (!error) {
        // User profile will be fetched by the auth state change listener
        const { data: userProfile } = await db.users.getCurrentProfile()
        setUser(userProfile)
      }
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await auth.signOut()
      if (!error) {
        setUser(null)
      }
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager' || user?.role === 'admin'

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    
    // Admin has all permissions
    if (user.role === 'admin') return true
    
    // Check specific permissions
    if (user.permissions && user.permissions[permission]) {
      return user.permissions[permission] === true
    }
    
    // Manager has basic permissions
    if (user.role === 'manager') {
      const managerPermissions = [
        'projects:read',
        'projects:write',
        'materials:read',
        'materials:write',
        'suppliers:read',
        'suppliers:write',
        'tasks:read',
        'tasks:write',
        'users:read'
      ]
      return managerPermissions.includes(permission)
    }
    
    // Regular users have limited permissions
    if (user.role === 'user') {
      const userPermissions = [
        'projects:read',
        'materials:read',
        'suppliers:read',
        'tasks:read',
        'tasks:write' // Users can update their own tasks
      ]
      return userPermissions.includes(permission)
    }
    
    return false
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isManager,
    hasPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
