-- Event Manager App - Database Initialization Script
-- This script sets up the initial database structure and seed data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE project_status AS ENUM (
        'PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM (
        'TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE priority_level AS ENUM (
        'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE permit_status AS ENUM (
        'PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE logistics_status AS ENUM (
        'PLANNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Insert default user roles
INSERT INTO user_roles (id, name, description, permissions, is_system_role) VALUES
    (uuid_generate_v4(), 'super_admin', 'Super Administrator mit allen Rechten', '{"*": "*"}', true),
    (uuid_generate_v4(), 'admin', 'Administrator mit erweiterten Rechten', '{"projects": "*", "users": "read", "reports": "*"}', true),
    (uuid_generate_v4(), 'project_manager', 'Projektmanager mit Projektverwaltungsrechten', '{"projects": "*", "tasks": "*", "reports": "read"}', true),
    (uuid_generate_v4(), 'team_member', 'Teammitglied mit begrenzten Rechten', '{"projects": "read", "tasks": "read,write", "files": "read,write"}', true),
    (uuid_generate_v4(), 'viewer', 'Betrachter mit nur Lese-Rechten', '{"projects": "read", "reports": "read"}', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default organization
INSERT INTO organizations (id, name, description, industry, size, is_active) VALUES
    (uuid_generate_v4(), 'Event Manager GmbH', 'Führendes Unternehmen für Event-Management und Projektplanung', 'Event Management', 'Medium', true)
ON CONFLICT DO NOTHING;

-- Insert default admin user (password: admin123)
INSERT INTO users (id, email, username, password_hash, first_name, last_name, is_active, is_verified, role_id) 
SELECT 
    uuid_generate_v4(),
    'admin@eventmanager.local',
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8HqKq6O', -- admin123
    'System',
    'Administrator',
    true,
    true,
    ur.id
FROM user_roles ur 
WHERE ur.name = 'super_admin'
ON CONFLICT (email) DO NOTHING;

-- Insert sample client
INSERT INTO clients (id, name, contact_person, email, phone, status) VALUES
    (uuid_generate_v4(), 'Musterfirma AG', 'Max Mustermann', 'kontakt@musterfirma.de', '+49 123 456789', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample project
INSERT INTO projects (id, name, description, status, priority, start_date, end_date, budget, manager_id, client_id, organization_id)
SELECT 
    uuid_generate_v4(),
    'Sommerfest 2024',
    'Jährliches Sommerfest mit Live-Musik und kulinarischen Highlights',
    'PLANNING',
    'HIGH',
    '2024-06-15',
    '2024-06-15',
    50000.00,
    u.id,
    c.id,
    o.id
FROM users u, clients c, organizations o
WHERE u.username = 'admin' AND c.name = 'Musterfirma AG' AND o.name = 'Event Manager GmbH'
ON CONFLICT DO NOTHING;

-- Insert sample project phases
INSERT INTO project_phases (id, project_id, name, description, order_index, status, start_date, end_date, progress_percentage)
SELECT 
    uuid_generate_v4(),
    p.id,
    'Planungsphase',
    'Konzeptentwicklung und Ressourcenplanung',
    1,
    'PENDING',
    '2024-01-15',
    '2024-03-15',
    0
FROM projects p
WHERE p.name = 'Sommerfest 2024'
ON CONFLICT DO NOTHING;

INSERT INTO project_phases (id, project_id, name, description, order_index, status, start_date, end_date, progress_percentage)
SELECT 
    uuid_generate_v4(),
    p.id,
    'Vorbereitungsphase',
    'Materialbeschaffung und Teamaufbau',
    2,
    'PENDING',
    '2024-03-16',
    '2024-05-15',
    0
FROM projects p
WHERE p.name = 'Sommerfest 2024'
ON CONFLICT DO NOTHING;

INSERT INTO project_phases (id, project_id, name, description, order_index, status, start_date, end_date, progress_percentage)
SELECT 
    uuid_generate_v4(),
    p.id,
    'Durchführungsphase',
    'Event-Durchführung und Monitoring',
    3,
    'PENDING',
    '2024-06-15',
    '2024-06-15',
    0
FROM projects p
WHERE p.name = 'Sommerfest 2024'
ON CONFLICT DO NOTHING;

INSERT INTO project_phases (id, project_id, name, description, order_index, status, start_date, end_date, progress_percentage)
SELECT 
    uuid_generate_v4(),
    p.id,
    'Nachbereitungsphase',
    'Dokumentation und Feedback-Sammlung',
    4,
    'PENDING',
    '2024-06-16',
    '2024-07-15',
    0
FROM projects p
WHERE p.name = 'Sommerfest 2024'
ON CONFLICT DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, assigned_to, created_by, due_date, estimated_hours, progress_percentage)
SELECT 
    uuid_generate_v4(),
    p.id,
    'Event-Konzept entwickeln',
    'Detailliertes Konzept für das Sommerfest erstellen',
    'TODO',
    'HIGH',
    u.id,
    u.id,
    '2024-02-15',
    16.0,
    0
FROM projects p, users u
WHERE p.name = 'Sommerfest 2024' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (id, project_id, title, description, status, priority, assigned_to, created_by, due_date, estimated_hours, progress_percentage)
SELECT 
    uuid_generate_v4(),
    p.id,
    'Budgetplanung',
    'Detaillierte Kostenaufstellung und Budgetplanung',
    'TODO',
    'HIGH',
    u.id,
    u.id,
    '2024-02-28',
    8.0,
    0
FROM projects p, users u
WHERE p.name = 'Sommerfest 2024' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (id, project_id, title, description, status, priority, assigned_to, created_by, due_date, estimated_hours, progress_percentage)
SELECT 
    uuid_generate_v4(),
    p.id,
    'Vendor-Auswahl',
    'Lieferanten und Dienstleister auswählen und kontaktieren',
    'TODO',
    'MEDIUM',
    u.id,
    u.id,
    '2024-03-15',
    12.0,
    0
FROM projects p, users u
WHERE p.name = 'Sommerfest 2024' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

-- Insert sample suppliers
INSERT INTO suppliers (id, name, contact_person, email, phone, category, rating, is_active) VALUES
    (uuid_generate_v4(), 'Catering Plus GmbH', 'Anna Schmidt', 'info@catering-plus.de', '+49 123 456789', 'Catering', 4.5, true),
    (uuid_generate_v4(), 'Event Equipment Rental', 'Tom Weber', 'rental@event-equipment.de', '+49 123 456790', 'Equipment', 4.2, true),
    (uuid_generate_v4(), 'Security Services AG', 'Michael Müller', 'security@security-services.de', '+49 123 456791', 'Security', 4.8, true)
ON CONFLICT DO NOTHING;

-- Insert sample BOM items
INSERT INTO bom_items (id, project_id, name, description, category, quantity, unit, unit_price, total_price, supplier_id, status, priority)
SELECT 
    uuid_generate_v4(),
    p.id,
    'Catering Service',
    'Vollständiger Catering-Service für 200 Personen',
    'Catering',
    1.0,
    'Service',
    15000.00,
    15000.00,
    s.id,
    'PLANNED',
    'HIGH'
FROM projects p, suppliers s
WHERE p.name = 'Sommerfest 2024' AND s.name = 'Catering Plus GmbH'
ON CONFLICT DO NOTHING;

INSERT INTO bom_items (id, project_id, name, description, category, quantity, unit, unit_price, total_price, supplier_id, status, priority)
SELECT 
    uuid_generate_v4(),
    p.id,
    'Bühnenausrüstung',
    'Bühne, Sound- und Lichtanlage',
    'Equipment',
    1.0,
    'Set',
    8000.00,
    8000.00,
    s.id,
    'PLANNED',
    'MEDIUM'
FROM projects p, suppliers s
WHERE p.name = 'Sommerfest 2024' AND s.name = 'Event Equipment Rental'
ON CONFLICT DO NOTHING;

INSERT INTO bom_items (id, project_id, name, description, category, quantity, unit, unit_price, total_price, supplier_id, status, priority)
SELECT 
    uuid_generate_v4(),
    p.id,
    'Sicherheitsdienst',
    'Sicherheitspersonal für Event',
    'Security',
    8.0,
    'Stunden',
    50.00,
    400.00,
    s.id,
    'PLANNED',
    'HIGH'
FROM projects p, suppliers s
WHERE p.name = 'Sommerfest 2024' AND s.name = 'Security Services AG'
ON CONFLICT DO NOTHING;

-- Insert sample permits
INSERT INTO permits (id, project_id, name, description, type, category, status, priority, application_date, cost)
SELECT 
    uuid_generate_v4(),
    p.id,
    'Veranstaltungsgenehmigung',
    'Genehmigung für öffentliche Veranstaltung',
    'Veranstaltungsgenehmigung',
    'Behörde',
    'PENDING',
    'HIGH',
    '2024-01-20',
    500.00
FROM projects p
WHERE p.name = 'Sommerfest 2024'
ON CONFLICT DO NOTHING;

INSERT INTO permits (id, project_id, name, description, type, category, status, priority, application_date, cost)
SELECT 
    uuid_generate_v4(),
    p.id,
    'Lärmschutzgenehmigung',
    'Genehmigung für Musik und Veranstaltungslärm',
    'Lärmschutz',
    'Behörde',
    'PENDING',
    'MEDIUM',
    '2024-01-20',
    200.00
FROM projects p
WHERE p.name = 'Sommerfest 2024'
ON CONFLICT DO NOTHING;

-- Insert sample logistics
INSERT INTO logistics (id, project_id, type, name, description, from_location, to_location, scheduled_date, status, priority, cost)
SELECT 
    uuid_generate_v4(),
    p.id,
    'Transport',
    'Equipment-Transport',
    'Transport von Bühnenausrüstung zum Veranstaltungsort',
    '{"address": "Industriestraße 123, 12345 Musterstadt", "coordinates": {"lat": 52.5200, "lng": 13.4050}}',
    '{"address": "Stadtpark 1, 12345 Musterstadt", "coordinates": {"lat": 52.5201, "lng": 13.4051}}',
    '2024-06-14 08:00:00',
    'PLANNED',
    'MEDIUM',
    500.00
FROM projects p
WHERE p.name = 'Sommerfest 2024'
ON CONFLICT DO NOTHING;

-- Insert sample kanban board
INSERT INTO kanban_boards (id, project_id, name, description, board_type, is_active)
SELECT 
    uuid_generate_v4(),
    p.id,
    'Projektaufgaben',
    'Kanban-Board für alle Projektaufgaben',
    'TASK',
    true
FROM projects p
WHERE p.name = 'Sommerfest 2024'
ON CONFLICT DO NOTHING;

-- Insert sample kanban columns
INSERT INTO kanban_columns (id, board_id, name, description, order_index, color, wip_limit)
SELECT 
    uuid_generate_v4(),
    kb.id,
    'To Do',
    'Neue Aufgaben',
    1,
    '#3B82F6',
    10
FROM kanban_boards kb, projects p
WHERE p.name = 'Sommerfest 2024' AND kb.project_id = p.id
ON CONFLICT DO NOTHING;

INSERT INTO kanban_columns (id, board_id, name, description, order_index, color, wip_limit)
SELECT 
    uuid_generate_v4(),
    kb.id,
    'In Progress',
    'Aufgaben in Bearbeitung',
    2,
    '#F59E0B',
    5
FROM kanban_boards kb, projects p
WHERE p.name = 'Sommerfest 2024' AND kb.project_id = p.id
ON CONFLICT DO NOTHING;

INSERT INTO kanban_columns (id, board_id, name, description, order_index, color, wip_limit)
SELECT 
    uuid_generate_v4(),
    kb.id,
    'Review',
    'Aufgaben zur Überprüfung',
    3,
    '#8B5CF6',
    3
FROM kanban_boards kb, projects p
WHERE p.name = 'Sommerfest 2024' AND kb.project_id = p.id
ON CONFLICT DO NOTHING;

INSERT INTO kanban_columns (id, board_id, name, description, order_index, color, wip_limit)
SELECT 
    uuid_generate_v4(),
    kb.id,
    'Done',
    'Abgeschlossene Aufgaben',
    4,
    '#10B981',
    null
FROM kanban_boards kb, projects p
WHERE p.name = 'Sommerfest 2024' AND kb.project_id = p.id
ON CONFLICT DO NOTHING;

-- Insert sample kanban cards
INSERT INTO kanban_cards (id, column_id, title, description, priority, due_date, order_index, size, tags)
SELECT 
    uuid_generate_v4(),
    kc.id,
    'Event-Konzept entwickeln',
    'Detailliertes Konzept für das Sommerfest erstellen',
    'HIGH',
    '2024-02-15',
    1,
    'L',
    ARRAY['Konzept', 'Planung']
FROM kanban_columns kc, kanban_boards kb, projects p
WHERE p.name = 'Sommerfest 2024' AND kb.project_id = p.id AND kc.board_id = kb.id AND kc.name = 'To Do'
ON CONFLICT DO NOTHING;

INSERT INTO kanban_cards (id, column_id, title, description, priority, due_date, order_index, size, tags)
SELECT 
    uuid_generate_v4(),
    kc.id,
    'Budgetplanung',
    'Detaillierte Kostenaufstellung und Budgetplanung',
    'HIGH',
    '2024-02-28',
    2,
    'M',
    ARRAY['Budget', 'Finanzen']
FROM kanban_columns kc, kanban_boards kb, projects p
WHERE p.name = 'Sommerfest 2024' AND kb.project_id = p.id AND kc.name = 'To Do'
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status_dates ON projects(status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id, status, priority);
CREATE INDEX IF NOT EXISTS idx_bom_items_project_category ON bom_items(project_id, category, status);
CREATE INDEX IF NOT EXISTS idx_projects_metadata ON projects USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_files_tags ON files USING GIN (tags);

-- Create materialized view for project summary
CREATE MATERIALIZED VIEW IF NOT EXISTS project_summary AS
SELECT 
    p.id,
    p.name,
    p.status,
    p.start_date,
    p.end_date,
    p.budget,
    p.actual_cost,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END) as completed_tasks,
    ROUND(
        (COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(t.id), 0)::DECIMAL) * 100, 2
    ) as completion_percentage
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
GROUP BY p.id, p.name, p.status, p.start_date, p.end_date, p.budget, p.actual_cost;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO event_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO event_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO event_user;

-- Create function for automatic maintenance
CREATE OR REPLACE FUNCTION perform_maintenance() RETURNS VOID AS $$
BEGIN
    -- VACUUM für alle Tabellen
    VACUUM ANALYZE;
    
    -- Statistiken aktualisieren
    ANALYZE;
    
    -- Materialized Views aktualisieren
    REFRESH MATERIALIZED VIEW project_summary;
END;
$$ LANGUAGE plpgsql;

-- Log successful initialization
INSERT INTO system_logs (level, message, context, created_at) VALUES
    ('INFO', 'Database initialization completed successfully', '{"script": "01-init-database.sql", "version": "1.0.0"}', NOW());

-- Commit all changes
COMMIT;