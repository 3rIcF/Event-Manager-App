-- Event Manager App - Initial Database Schema
-- Created: 2025-08-19
-- Description: Core tables for project management, BOM, suppliers, and users

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users and Authentication
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'planning', 'approval', 'setup', 'live', 'teardown', 'closed')),
    responsible_id UUID REFERENCES profiles(id),
    budget DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Global Materials Master Data
CREATE TABLE IF NOT EXISTS global_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    specifications TEXT,
    portfolio TEXT[], -- Array of portfolio categories
    standard_lead_time INTEGER, -- Days
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project-specific Materials (BOM)
CREATE TABLE IF NOT EXISTS project_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    global_material_id UUID REFERENCES global_materials(id),
    quantity DECIMAL(10,2) NOT NULL,
    phase TEXT NOT NULL CHECK (phase IN ('setup', 'show', 'teardown')),
    location TEXT,
    delivery_time TIMESTAMP WITH TIME ZONE,
    pickup_time TIMESTAMP WITH TIME ZONE,
    needs TEXT[], -- Array of special needs
    special_price DECIMAL(10,2),
    notes TEXT,
    -- Override tracking
    has_override BOOLEAN DEFAULT FALSE,
    overridden_fields TEXT[],
    last_sync_version INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Global Suppliers Master Data
CREATE TABLE IF NOT EXISTS global_suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    portfolio TEXT[], -- Array of material categories they supply
    regions TEXT[], -- Array of regions they serve
    email TEXT,
    phone TEXT,
    address TEXT,
    -- Supplier scores (0-100)
    quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
    punctuality_score INTEGER DEFAULT 0 CHECK (punctuality_score >= 0 AND punctuality_score <= 100),
    price_score INTEGER DEFAULT 0 CHECK (price_score >= 0 AND price_score <= 100),
    overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Supplier Relationships
CREATE TABLE IF NOT EXISTS project_suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    global_supplier_id UUID REFERENCES global_suppliers(id),
    status TEXT DEFAULT 'potential' CHECK (status IN ('potential', 'contacted', 'quoted', 'selected', 'contracted')),
    contact_date TIMESTAMP WITH TIME ZONE,
    quote_received BOOLEAN DEFAULT FALSE,
    quote_amount DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permits and Approvals
CREATE TABLE IF NOT EXISTS permits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'permit', 'license', 'approval', etc.
    authority TEXT, -- Issuing authority
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'approved', 'rejected')),
    application_date DATE,
    required_date DATE,
    approval_date DATE,
    expiry_date DATE,
    cost DECIMAL(10,2),
    documents TEXT[], -- Array of document URLs/paths
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logistics Time Slots
CREATE TABLE IF NOT EXISTS logistics_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('delivery', 'pickup', 'service', 'setup', 'teardown')),
    gate_location TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    supplier_id UUID REFERENCES global_suppliers(id),
    vehicle_type TEXT,
    vehicle_count INTEGER DEFAULT 1,
    crew_size INTEGER DEFAULT 0,
    special_requirements TEXT[],
    notes TEXT,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files and Documents
CREATE TABLE IF NOT EXISTS project_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Storage path (Supabase Storage)
    file_size INTEGER,
    mime_type TEXT,
    category TEXT, -- 'contract', 'permit', 'technical', 'photo', etc.
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Providers (from missing requirements)
CREATE TABLE IF NOT EXISTS service_providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'audio', 'video', 'lighting', 'security', 'catering', etc.
    contact_info JSONB,
    capabilities TEXT[],
    regions TEXT[],
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    hourly_rate DECIMAL(10,2),
    day_rate DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Service Bookings
CREATE TABLE IF NOT EXISTS project_service_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    service_provider_id UUID REFERENCES service_providers(id),
    service_type TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    crew_size INTEGER DEFAULT 1,
    equipment_needed TEXT[],
    briefing_notes TEXT,
    contract_status TEXT DEFAULT 'draft' CHECK (contract_status IN ('draft', 'sent', 'signed', 'completed')),
    total_cost DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Transactions
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('budget', 'expense', 'invoice', 'payment')),
    category TEXT NOT NULL, -- 'materials', 'services', 'permits', 'logistics', etc.
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    transaction_date DATE DEFAULT CURRENT_DATE,
    supplier_id UUID REFERENCES global_suppliers(id),
    service_provider_id UUID REFERENCES service_providers(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
    invoice_number TEXT,
    payment_due_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Operations Checklists
CREATE TABLE IF NOT EXISTS operation_checklists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    phase TEXT NOT NULL CHECK (phase IN ('setup', 'live', 'teardown')),
    category TEXT NOT NULL, -- 'safety', 'technical', 'logistics', etc.
    title TEXT NOT NULL,
    items JSONB NOT NULL, -- Array of checklist items with completion status
    assigned_to UUID REFERENCES profiles(id),
    due_date TIMESTAMP WITH TIME ZONE,
    completion_status DECIMAL(5,2) DEFAULT 0, -- Percentage completed
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incident Reports
CREATE TABLE IF NOT EXISTS incident_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    category TEXT NOT NULL, -- 'safety', 'technical', 'logistics', 'financial', etc.
    reported_by UUID REFERENCES profiles(id),
    assigned_to UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    resolution_notes TEXT,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_responsible ON projects(responsible_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_materials_project ON project_materials(project_id);
CREATE INDEX IF NOT EXISTS idx_project_materials_global ON project_materials(global_material_id);
CREATE INDEX IF NOT EXISTS idx_project_suppliers_project ON project_suppliers(project_id);
CREATE INDEX IF NOT EXISTS idx_permits_project ON permits(project_id);
CREATE INDEX IF NOT EXISTS idx_logistics_slots_project ON logistics_slots(project_id);
CREATE INDEX IF NOT EXISTS idx_logistics_slots_time ON logistics_slots(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_project ON project_service_bookings(project_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_project ON financial_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_operation_checklists_project ON operation_checklists(project_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_project ON incident_reports(project_id);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (expandable based on requirements)
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects accessible to authenticated users
CREATE POLICY "Users can read projects" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can modify projects" ON projects FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- Material access policies
CREATE POLICY "Users can read materials" ON global_materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can modify materials" ON global_materials FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- Project-specific data access
CREATE POLICY "Users can read project data" ON project_materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read suppliers" ON project_suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read permits" ON permits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read logistics" ON logistics_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read files" ON project_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read service providers" ON service_providers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read service bookings" ON project_service_bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read financial data" ON financial_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read checklists" ON operation_checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read incidents" ON incident_reports FOR SELECT TO authenticated USING (true);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all relevant tables
CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_projects BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_global_materials BEFORE UPDATE ON global_materials FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_project_materials BEFORE UPDATE ON project_materials FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_global_suppliers BEFORE UPDATE ON global_suppliers FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_project_suppliers BEFORE UPDATE ON project_suppliers FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_permits BEFORE UPDATE ON permits FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_logistics_slots BEFORE UPDATE ON logistics_slots FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_service_providers BEFORE UPDATE ON service_providers FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_project_service_bookings BEFORE UPDATE ON project_service_bookings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_financial_transactions BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_operation_checklists BEFORE UPDATE ON operation_checklists FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_incident_reports BEFORE UPDATE ON incident_reports FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();