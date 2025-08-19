// Event Manager App - Database Types
// Generated from: supabase/migrations/001_initial_schema.sql
// Created: 2025-08-19

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'user';
  permissions: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled' | 'on-hold';
  start_date?: string;
  end_date?: string;
  budget?: number;
  actual_cost: number;
  client_name?: string;
  client_contact?: string;
  location?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  specialties: string[];
  rating?: number;
  reliability_score?: number;
  payment_terms?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  description?: string;
  unit: string;
  unit_cost: number;
  supplier_id?: string;
  min_stock_level: number;
  current_stock: number;
  location?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ProjectMaterial {
  id: string;
  project_id: string;
  material_id: string;
  quantity_required: number;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost?: number;
  total_cost?: number;
  order_date?: string;
  delivery_date?: string;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description?: string;
  supplier_id?: string;
  hourly_rate?: number;
  fixed_rate?: number;
  availability?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ProjectService {
  id: string;
  project_id: string;
  service_id: string;
  hours_required?: number;
  fixed_cost?: number;
  total_cost?: number;
  start_date?: string;
  end_date?: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  dependencies: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Checklist {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  category?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  item_text: string;
  is_completed: boolean;
  completed_by?: string;
  completed_at?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  project_id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reported_by: string;
  assigned_to?: string;
  reported_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialTransaction {
  id: string;
  project_id: string;
  transaction_type: 'income' | 'expense' | 'transfer';
  amount: number;
  description?: string;
  category?: string;
  transaction_date: string;
  supplier_id?: string;
  invoice_number?: string;
  payment_status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Extended interfaces with relationships
export interface ProjectWithDetails extends Project {
  materials?: ProjectMaterial[];
  services?: ProjectService[];
  tasks?: Task[];
  checklists?: Checklist[];
  incidents?: Incident[];
  transactions?: FinancialTransaction[];
  created_by_user?: User;
}

export interface MaterialWithSupplier extends Material {
  supplier?: Supplier;
}

export interface ProjectMaterialWithDetails extends ProjectMaterial {
  material?: Material;
  project?: Project;
}

export interface TaskWithAssignee extends Task {
  assigned_user?: User;
  project?: Project;
}

export interface ChecklistWithItems extends Checklist {
  items?: ChecklistItem[];
  created_by_user?: User;
}

export interface IncidentWithDetails extends Incident {
  reported_by_user?: User;
  assigned_user?: User;
  project?: Project;
}

// Database enums for type safety
export const ProjectStatus = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on-hold'
} as const;

export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export const IncidentSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export const IncidentStatus = {
  OPEN: 'open',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
} as const;

export const UserRole = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
} as const;

// Utility types
export type ProjectStatusType = typeof ProjectStatus[keyof typeof ProjectStatus];
export type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus];
export type TaskPriorityType = typeof TaskPriority[keyof typeof TaskPriority];
export type IncidentSeverityType = typeof IncidentSeverity[keyof typeof IncidentSeverity];
export type IncidentStatusType = typeof IncidentStatus[keyof typeof IncidentStatus];
export type UserRoleType = typeof UserRole[keyof typeof UserRole];
