// Event Manager App - Supabase Client Configuration
// Frontend integration with Supabase Backend
// Created: 2025-08-19

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Auth helper functions
export const auth = {
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign up with email and password
  signUp: async (email: string, password: string, userData: {
    full_name: string
    role: 'admin' | 'manager' | 'user'
    permissions?: Record<string, any>
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get current session
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const db = {
  // Projects
  projects: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          created_by_user:users!projects_created_by_fkey(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          created_by_user:users!projects_created_by_fkey(*),
          project_materials:project_materials(
            *,
            material:materials(
              *,
              supplier:suppliers(*)
            )
          ),
          project_services:project_services(
            *,
            service:services(*)
          ),
          tasks:tasks(
            *,
            assigned_user:users!tasks_assigned_to_fkey(*)
          ),
          checklists:checklists(
            *,
            checklist_items:checklist_items(*)
          ),
          incidents:incidents(*),
          financial_transactions:financial_transactions(*)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single()
      return { data, error }
    },

    create: async (projectData: Omit<Database['public']['Tables']['projects']['Insert'], 'id' | 'created_at' | 'updated_at' | 'is_active'>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single()
      return { data, error }
    },

    update: async (id: string, updates: Partial<Database['public']['Tables']['projects']['Update']>) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .update({ is_active: false })
        .eq('id', id)
      return { error }
    }
  },

  // Materials
  materials: {
    getAll: async (filters?: {
      category?: string
      supplier?: string
      lowStock?: boolean
    }) => {
      let query = supabase
        .from('materials')
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .eq('is_active', true)

      if (filters?.category) {
        query = query.eq('category', filters.category)
      }
      if (filters?.supplier) {
        query = query.eq('supplier_id', filters.supplier)
      }
      if (filters?.lowStock) {
        query = query.lte('current_stock', supabase.raw('min_stock_level'))
      }

      const { data, error } = await query.order('name')
      return { data, error }
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('materials')
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single()
      return { data, error }
    },

    create: async (materialData: Omit<Database['public']['Tables']['materials']['Insert'], 'id' | 'created_at' | 'updated_at' | 'is_active'>) => {
      const { data, error } = await supabase
        .from('materials')
        .insert([materialData])
        .select()
        .single()
      return { data, error }
    },

    update: async (id: string, updates: Partial<Database['public']['Tables']['materials']['Update']>) => {
      const { data, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('materials')
        .update({ is_active: false })
        .eq('id', id)
      return { error }
    }
  },

  // Suppliers
  suppliers: {
    getAll: async (filters?: {
      specialty?: string
      minRating?: number
      minReliability?: number
    }) => {
      let query = supabase
        .from('suppliers')
        .select(`
          *,
          materials:materials(count),
          services:services(count)
        `)
        .eq('is_active', true)

      if (filters?.specialty) {
        query = query.contains('specialties', [filters.specialty])
      }
      if (filters?.minRating) {
        query = query.gte('rating', filters.minRating)
      }
      if (filters?.minReliability) {
        query = query.gte('reliability_score', filters.minReliability)
      }

      const { data, error } = await query.order('name')
      return { data, error }
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('suppliers')
        .select(`
          *,
          materials:materials(*),
          services:services(*)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single()
      return { data, error }
    },

    create: async (supplierData: Omit<Database['public']['Tables']['suppliers']['Insert'], 'id' | 'created_at' | 'updated_at' | 'is_active'>) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplierData])
        .select()
        .single()
      return { data, error }
    },

    update: async (id: string, updates: Partial<Database['public']['Tables']['suppliers']['Update']>) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('suppliers')
        .update({ is_active: false })
        .eq('id', id)
      return { error }
    }
  },

  // Tasks
  tasks: {
    getAll: async (filters?: {
      projectId?: string
      status?: string
      priority?: string
      assignedTo?: string
      dueDate?: string
    }) => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:users!tasks_assigned_to_fkey(*),
          project:projects(id, name, status)
        `)
        .eq('is_active', true)

      if (filters?.projectId) {
        query = query.eq('project_id', filters.projectId)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo)
      }
      if (filters?.dueDate) {
        query = query.eq('due_date', filters.dueDate)
      }

      const { data, error } = await query.order('due_date')
      return { data, error }
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:users!tasks_assigned_to_fkey(*),
          project:projects(*)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single()
      return { data, error }
    },

    create: async (taskData: Omit<Database['public']['Tables']['tasks']['Insert'], 'id' | 'created_at' | 'updated_at' | 'is_active'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single()
      return { data, error }
    },

    update: async (id: string, updates: Partial<Database['public']['Tables']['tasks']['Update']>) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({ is_active: false })
        .eq('id', id)
      return { error }
    }
  },

  // Users
  users: {
    getCurrentProfile: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        return { data: null, error: userError }
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .eq('is_active', true)
        .single()
      return { data, error }
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()
      return { data, error }
    },

    create: async (userData: Omit<Database['public']['Tables']['users']['Insert'], 'id' | 'created_at' | 'updated_at' | 'is_active'>) => {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single()
      return { data, error }
    },

    update: async (id: string, updates: Partial<Database['public']['Tables']['users']['Update']>) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', id)
      return { error }
    }
  }
}

export default supabase
