-- Event Manager App Database Schema
-- Run this in your Supabase SQL editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'coordinator', 'viewer')),
    department TEXT,
    contact TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location TEXT NOT NULL,
    address TEXT,
    status TEXT NOT NULL CHECK (status IN ('idea', 'planning', 'approval', 'setup', 'live', 'teardown', 'closed')),
    responsible TEXT NOT NULL,
    budget DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('catering', 'technical', 'security', 'cleaning', 'logistics')),
    provider TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('planned', 'briefed', 'confirmed', 'in-progress', 'completed')),
    timeline JSONB DEFAULT '{}',
    personnel INTEGER DEFAULT 0,
    needs JSONB DEFAULT '[]',
    briefing_generated BOOLEAN DEFAULT FALSE,
    contact_person TEXT NOT NULL,
    contract_status TEXT NOT NULL CHECK (contract_status IN ('draft', 'sent', 'signed', 'rejected')),
    budget DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget Items table
CREATE TABLE IF NOT EXISTS public.budget_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    budgeted_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    actual_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('planned', 'approved', 'ordered', 'paid', 'overdue')),
    vendor TEXT,
    description TEXT NOT NULL,
    due_date DATE,
    invoice_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checklist Items table
CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('setup', 'operation', 'teardown', 'safety', 'technical')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_to TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'blocked')),
    due_time TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by TEXT,
    notes TEXT,
    dependencies JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incidents table
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    category TEXT NOT NULL CHECK (category IN ('technical', 'safety', 'security', 'weather', 'supplier', 'other')),
    status TEXT NOT NULL CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    reported_by TEXT NOT NULL,
    assigned_to TEXT,
    reported_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incident Actions table
CREATE TABLE IF NOT EXISTS public.incident_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    action_by TEXT NOT NULL,
    action_at TIMESTAMP WITH TIME ZONE NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('comment', 'investigation', 'resolution', 'escalation')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table (for document management)
CREATE TABLE IF NOT EXISTS public.files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    category TEXT,
    description TEXT,
    file_path TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table (for general comments on entities)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'service', 'budget_item', 'checklist_item', 'incident')),
    entity_id UUID NOT NULL,
    comment TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Log table (for audit trail)
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    changes JSONB,
    performed_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_services_project_id ON public.services(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_project_id ON public.budget_items(project_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_project_id ON public.checklist_items(project_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_status ON public.checklist_items(status);
CREATE INDEX IF NOT EXISTS idx_incidents_project_id ON public.incidents(project_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incident_actions_incident_id ON public.incident_actions(incident_id);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON public.files(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON public.activity_log(entity_type, entity_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Authenticated users can view projects" ON public.projects
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project creators can update projects" ON public.projects
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete projects" ON public.projects
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Services policies
CREATE POLICY "Users can view services of accessible projects" ON public.services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id
        )
    );

CREATE POLICY "Users can insert services" ON public.services
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id
        )
    );

CREATE POLICY "Users can update services" ON public.services
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id
        )
    );

-- Budget items policies
CREATE POLICY "Users can view budget items" ON public.budget_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id
        )
    );

CREATE POLICY "Users can manage budget items" ON public.budget_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id
        )
    );

-- Checklist items policies
CREATE POLICY "Users can view checklist items" ON public.checklist_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id
        )
    );

CREATE POLICY "Users can manage checklist items" ON public.checklist_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id
        )
    );

-- Incidents policies
CREATE POLICY "Users can view incidents" ON public.incidents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id
        )
    );

CREATE POLICY "Users can manage incidents" ON public.incidents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id
        )
    );

-- Incident actions policies
CREATE POLICY "Users can view incident actions" ON public.incident_actions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.incidents i
            JOIN public.projects p ON i.project_id = p.id
            WHERE i.id = incident_id
        )
    );

CREATE POLICY "Users can create incident actions" ON public.incident_actions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.incidents i
            JOIN public.projects p ON i.project_id = p.id
            WHERE i.id = incident_id
        )
    );

-- Files policies
CREATE POLICY "Users can view files" ON public.files
    FOR SELECT USING (
        project_id IS NULL OR 
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id
        )
    );

CREATE POLICY "Users can upload files" ON public.files
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Comments policies
CREATE POLICY "Users can view comments" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Activity log policies
CREATE POLICY "Users can view activity log" ON public.activity_log
    FOR SELECT USING (true);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON public.budget_items
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON public.checklist_items
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON public.files
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert sample data (optional - remove in production)
INSERT INTO public.projects (id, name, description, start_date, end_date, location, status, responsible, budget, created_by)
VALUES 
    (uuid_generate_v4(), 'Stadtfest München 2025', 'Jährliches Stadtfest mit Bühnen, Ständen und Fahrgeschäften', '2025-09-15', '2025-09-17', 'München Zentrum', 'planning', 'Max Müller', 250000, uuid_generate_v4()),
    (uuid_generate_v4(), 'BMW Pressekonferenz', 'Produktpräsentation neuer Fahrzeugmodelle', '2025-10-20', '2025-10-20', 'BMW Welt München', 'approval', 'Anna Schmidt', 85000, uuid_generate_v4())
ON CONFLICT DO NOTHING;