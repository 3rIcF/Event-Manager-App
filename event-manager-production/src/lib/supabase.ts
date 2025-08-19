import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  address?: string;
  status: 'idea' | 'planning' | 'approval' | 'setup' | 'live' | 'teardown' | 'closed';
  responsible: string;
  budget?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Service {
  id: string;
  project_id: string;
  name: string;
  category: 'catering' | 'technical' | 'security' | 'cleaning' | 'logistics';
  provider: string;
  status: 'planned' | 'briefed' | 'confirmed' | 'in-progress' | 'completed';
  timeline: {
    arrival?: string;
    setup?: string;
    operation?: string;
    teardown?: string;
  };
  personnel: number;
  needs: string[];
  briefing_generated: boolean;
  contact_person: string;
  contract_status: 'draft' | 'sent' | 'signed' | 'rejected';
  budget?: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: string;
  project_id: string;
  category: string;
  subcategory: string;
  budgeted_amount: number;
  actual_amount: number;
  status: 'planned' | 'approved' | 'ordered' | 'paid' | 'overdue';
  vendor?: string;
  description: string;
  due_date?: string;
  invoice_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  project_id: string;
  title: string;
  description: string;
  category: 'setup' | 'operation' | 'teardown' | 'safety' | 'technical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  due_time?: string;
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  dependencies?: string[];
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  project_id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'technical' | 'safety' | 'security' | 'weather' | 'supplier' | 'other';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reported_by: string;
  assigned_to?: string;
  reported_at: string;
  resolved_at?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentAction {
  id: string;
  incident_id: string;
  description: string;
  action_by: string;
  action_at: string;
  action_type: 'comment' | 'investigation' | 'resolution' | 'escalation';
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'coordinator' | 'viewer';
  department?: string;
  contact?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// API Functions
export class SupabaseAPI {
  // Projects
  static async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Services
  static async getServices(projectId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert([service])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateService(id: string, updates: Partial<Service>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Budget Items
  static async getBudgetItems(projectId: string): Promise<BudgetItem[]> {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createBudgetItem(budgetItem: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetItem> {
    const { data, error } = await supabase
      .from('budget_items')
      .insert([budgetItem])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateBudgetItem(id: string, updates: Partial<BudgetItem>): Promise<BudgetItem> {
    const { data, error } = await supabase
      .from('budget_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Checklist Items
  static async getChecklistItems(projectId: string): Promise<ChecklistItem[]> {
    const { data, error } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('project_id', projectId)
      .order('due_time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async createChecklistItem(checklistItem: Omit<ChecklistItem, 'id' | 'created_at' | 'updated_at'>): Promise<ChecklistItem> {
    const { data, error } = await supabase
      .from('checklist_items')
      .insert([checklistItem])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateChecklistItem(id: string, updates: Partial<ChecklistItem>): Promise<ChecklistItem> {
    const { data, error } = await supabase
      .from('checklist_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Incidents
  static async getIncidents(projectId: string): Promise<Incident[]> {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createIncident(incident: Omit<Incident, 'id' | 'created_at' | 'updated_at'>): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .insert([incident])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Incident Actions
  static async getIncidentActions(incidentId: string): Promise<IncidentAction[]> {
    const { data, error } = await supabase
      .from('incident_actions')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async createIncidentAction(action: Omit<IncidentAction, 'id' | 'created_at'>): Promise<IncidentAction> {
    const { data, error } = await supabase
      .from('incident_actions')
      .insert([action])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Authentication
  static async signUp(email: string, password: string, metadata: { name: string; role: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) throw error;
    return data;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // Real-time subscriptions
  static subscribeToProjects(callback: (payload: any) => void) {
    return supabase
      .channel('projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, callback)
      .subscribe();
  }

  static subscribeToServices(projectId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`services_${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'services',
        filter: `project_id=eq.${projectId}`
      }, callback)
      .subscribe();
  }

  static subscribeToIncidents(projectId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`incidents_${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'incidents',
        filter: `project_id=eq.${projectId}`
      }, callback)
      .subscribe();
  }
}

export default SupabaseAPI;