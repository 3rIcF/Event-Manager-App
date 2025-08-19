import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, SupabaseAPI } from '../lib/supabase';

interface AuthUser extends User {
  role?: string;
  name?: string;
  department?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: { name: string; role: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { name?: string; role?: string; department?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else if (session?.user) {
          setUser({
            ...session.user,
            role: session.user.user_metadata?.role || 'viewer',
            name: session.user.user_metadata?.name || session.user.email,
            department: session.user.user_metadata?.department
          });
        }
      } catch (error) {
        console.error('Error in getSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser({
            ...session.user,
            role: session.user.user_metadata?.role || 'viewer',
            name: session.user.user_metadata?.name || session.user.email,
            department: session.user.user_metadata?.department
          });
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setUser({
          ...data.user,
          role: data.user.user_metadata?.role || 'viewer',
          name: data.user.user_metadata?.name || data.user.email,
          department: data.user.user_metadata?.department
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    metadata: { name: string; role: string }
  ): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name,
            role: metadata.role
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Note: User will need to confirm email before they can sign in
      console.log('User signed up:', data.user?.email);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }

      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { 
    name?: string; 
    role?: string; 
    department?: string 
  }): Promise<void> => {
    try {
      if (!user) throw new Error('No user logged in');

      setLoading(true);
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          ...updates
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setUser({
          ...data.user,
          role: data.user.user_metadata?.role || user.role,
          name: data.user.user_metadata?.name || user.name,
          department: data.user.user_metadata?.department || user.department
        });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps): ReactNode {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || <div>Please sign in to access this content.</div>;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <div>You don't have permission to access this content.</div>;
  }

  return <>{children}</>;
}

// Role checker hook
export function useRole(): {
  isAdmin: boolean;
  isManager: boolean;
  isCoordinator: boolean;
  hasRole: (role: string) => boolean;
} {
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;
  const isCoordinator = user?.role === 'coordinator' || isManager;

  const hasRole = (role: string): boolean => {
    if (!user?.role) return false;

    const roleHierarchy = {
      'admin': ['admin', 'manager', 'coordinator', 'viewer'],
      'manager': ['manager', 'coordinator', 'viewer'],
      'coordinator': ['coordinator', 'viewer'],
      'viewer': ['viewer']
    };

    return roleHierarchy[user.role as keyof typeof roleHierarchy]?.includes(role) || false;
  };

  return {
    isAdmin,
    isManager,
    isCoordinator,
    hasRole
  };
}