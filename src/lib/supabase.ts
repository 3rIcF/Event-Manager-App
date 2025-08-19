import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for database schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url?: string
          role: 'admin' | 'manager' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      projects: {
        Row: {
          id: string
          name: string
          description?: string
          location: string
          start_date: string
          end_date: string
          status: 'idea' | 'planning' | 'approval' | 'setup' | 'live' | 'teardown' | 'closed'
          responsible_id?: string
          budget?: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      global_materials: {
        Row: {
          id: string
          name: string
          category: string
          unit: string
          specifications?: string
          portfolio?: string[]
          standard_lead_time?: number
          version: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['global_materials']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['global_materials']['Insert']>
      }
      global_suppliers: {
        Row: {
          id: string
          name: string
          portfolio?: string[]
          regions?: string[]
          email?: string
          phone?: string
          address?: string
          quality_score: number
          punctuality_score: number
          price_score: number
          overall_score: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['global_suppliers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['global_suppliers']['Insert']>
      }
      service_providers: {
        Row: {
          id: string
          name: string
          category: string
          contact_info?: any
          capabilities?: string[]
          regions?: string[]
          rating?: number
          hourly_rate?: number
          day_rate?: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['service_providers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['service_providers']['Insert']>
      }
      financial_transactions: {
        Row: {
          id: string
          project_id: string
          type: 'budget' | 'expense' | 'invoice' | 'payment'
          category: string
          description: string
          amount: number
          currency: string
          transaction_date: string
          supplier_id?: string
          service_provider_id?: string
          status: 'pending' | 'approved' | 'paid' | 'rejected'
          invoice_number?: string
          payment_due_date?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['financial_transactions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['financial_transactions']['Insert']>
      }
      operation_checklists: {
        Row: {
          id: string
          project_id: string
          phase: 'setup' | 'live' | 'teardown'
          category: string
          title: string
          items: any
          assigned_to?: string
          due_date?: string
          completion_status: number
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['operation_checklists']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['operation_checklists']['Insert']>
      }
      incident_reports: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          category: string
          reported_by?: string
          assigned_to?: string
          status: 'open' | 'investigating' | 'resolved' | 'closed'
          resolution_notes?: string
          reported_at: string
          resolved_at?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['incident_reports']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['incident_reports']['Insert']>
      }
    }
  }
}

// Typed supabase client
export type SupabaseClient = typeof supabase

// API helper functions
export const api = {
  // Projects
  projects: {
    getAll: () => supabase.from('projects').select('*'),
    getById: (id: string) => supabase.from('projects').select('*').eq('id', id).single(),
    create: (project: Database['public']['Tables']['projects']['Insert']) => 
      supabase.from('projects').insert([project]).select().single(),
    update: (id: string, updates: Database['public']['Tables']['projects']['Update']) => 
      supabase.from('projects').update(updates).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('projects').delete().eq('id', id)
  },

  // Service Providers
  serviceProviders: {
    getAll: () => supabase.from('service_providers').select('*'),
    getByCategory: (category: string) => supabase.from('service_providers').select('*').eq('category', category),
    create: (provider: Database['public']['Tables']['service_providers']['Insert']) =>
      supabase.from('service_providers').insert([provider]).select().single(),
    update: (id: string, updates: Database['public']['Tables']['service_providers']['Update']) =>
      supabase.from('service_providers').update(updates).eq('id', id).select().single()
  },

  // Financial Transactions
  finances: {
    getByProject: (projectId: string) => 
      supabase.from('financial_transactions').select('*').eq('project_id', projectId),
    getBudgetSummary: (projectId: string) => 
      supabase.from('financial_transactions')
        .select('type, category, amount')
        .eq('project_id', projectId),
    create: (transaction: Database['public']['Tables']['financial_transactions']['Insert']) =>
      supabase.from('financial_transactions').insert([transaction]).select().single(),
    update: (id: string, updates: Database['public']['Tables']['financial_transactions']['Update']) =>
      supabase.from('financial_transactions').update(updates).eq('id', id).select().single()
  },

  // Operations
  operations: {
    getChecklists: (projectId: string) => 
      supabase.from('operation_checklists').select('*').eq('project_id', projectId),
    createChecklist: (checklist: Database['public']['Tables']['operation_checklists']['Insert']) =>
      supabase.from('operation_checklists').insert([checklist]).select().single(),
    updateChecklist: (id: string, updates: Database['public']['Tables']['operation_checklists']['Update']) =>
      supabase.from('operation_checklists').update(updates).eq('id', id).select().single(),
    
    getIncidents: (projectId: string) => 
      supabase.from('incident_reports').select('*').eq('project_id', projectId),
    createIncident: (incident: Database['public']['Tables']['incident_reports']['Insert']) =>
      supabase.from('incident_reports').insert([incident]).select().single(),
    updateIncident: (id: string, updates: Database['public']['Tables']['incident_reports']['Update']) =>
      supabase.from('incident_reports').update(updates).eq('id', id).select().single()
  },

  // Materials
  materials: {
    getGlobalMaterials: () => supabase.from('global_materials').select('*'),
    getProjectMaterials: (projectId: string) => 
      supabase.from('project_materials').select('*, global_materials(*)').eq('project_id', projectId)
  },

  // Suppliers  
  suppliers: {
    getGlobalSuppliers: () => supabase.from('global_suppliers').select('*'),
    getProjectSuppliers: (projectId: string) => 
      supabase.from('project_suppliers').select('*, global_suppliers(*)').eq('project_id', projectId)
  }
}