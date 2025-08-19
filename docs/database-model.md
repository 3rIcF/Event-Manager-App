# 🗄️ Event Manager App - Datenbankmodell & Schema-Design

## 📋 **Übersicht**

Das Datenbankmodell der Event Manager App basiert auf PostgreSQL 15+ und implementiert eine relationale Datenbankarchitektur mit erweiterten Features wie JSONB, UUIDs und optimierten Indizes für maximale Performance und Skalierbarkeit.

## 🎯 **Datenbank-Design-Prinzipien**

### **Normalisierung**
- **3NF (Third Normal Form)**: Vermeidung von Transitive Dependencies
- **Denormalisierung**: Strategische Denormalisierung für Performance
- **JSONB**: Flexible Datenstrukturen für dynamische Inhalte

### **Performance-Optimierung**
- **Composite Indexes**: Optimierte Indizes für häufige Query-Patterns
- **Partitioning**: Zeitbasierte Partitionierung für große Tabellen
- **Connection Pooling**: Effiziente Datenbankverbindungen
- **Read Replicas**: Horizontale Skalierung für Leseoperationen

### **Sicherheit & Compliance**
- **Audit Logging**: Vollständige Nachverfolgung aller Änderungen
- **Row Level Security (RLS)**: Granulare Zugriffskontrolle
- **Data Encryption**: Verschlüsselung sensibler Daten
- **GDPR Compliance**: Datenschutz-konforme Implementierung

## 🏗️ **Datenbank-Schema**

### **Core Schema - Benutzer & Authentifizierung**

#### **users** - Benutzerverwaltung
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'de',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indizes für Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### **user_roles** - Rollenverwaltung
```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Standard-Rollen
INSERT INTO user_roles (name, description, permissions, is_system_role) VALUES
('super_admin', 'Super Administrator mit allen Rechten', '{"*": "*"}', true),
('admin', 'Administrator mit erweiterten Rechten', '{"projects": "*", "users": "read", "reports": "*"}', true),
('project_manager', 'Projektmanager mit Projektverwaltungsrechten', '{"projects": "*", "tasks": "*", "reports": "read"}', true),
('team_member', 'Teammitglied mit begrenzten Rechten', '{"projects": "read", "tasks": "read,write", "files": "read,write"}', true),
('viewer', 'Betrachter mit nur Lese-Rechten', '{"projects": "read", "reports": "read"}', true);
```

#### **user_permissions** - Berechtigungsverwaltung
```sql
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    permissions JSONB NOT NULL DEFAULT '{}',
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(user_id, resource_type, resource_id)
);

CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_resource ON user_permissions(resource_type, resource_id);
```

#### **user_sessions** - Session-Management
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
```

### **Business Schema - Projekte & Events**

#### **organizations** - Organisationsverwaltung
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    website VARCHAR(500),
    industry VARCHAR(100),
    size VARCHAR(50),
    founded_year INTEGER,
    address JSONB,
    contact_info JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_organizations_active ON organizations(is_active);
```

#### **clients** - Kundenverwaltung
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address JSONB,
    billing_info JSONB,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_organization_id ON clients(organization_id);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_status ON clients(status);
```

#### **projects** - Projektverwaltung
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNING',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2),
    manager_id UUID REFERENCES users(id),
    client_id UUID REFERENCES clients(id),
    organization_id UUID REFERENCES organizations(id),
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_manager_id ON projects(manager_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX idx_projects_priority ON projects(priority);
```

#### **project_members** - Projektmitglieder
```sql
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_active ON project_members(is_active);
```

#### **project_phases** - Projektphasen
```sql
CREATE TABLE project_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    start_date DATE,
    end_date DATE,
    progress_percentage INTEGER DEFAULT 0,
    dependencies JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_phases_project_id ON project_phases(project_id);
CREATE INDEX idx_project_phases_order ON project_phases(project_id, order_index);
CREATE INDEX idx_project_phases_status ON project_phases(status);
```

### **Business Schema - BOM & Materialverwaltung**

#### **bom_items** - Bill of Materials
```sql
CREATE TABLE bom_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES bom_items(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    category VARCHAR(100),
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(15,2),
    total_price DECIMAL(15,2),
    supplier_id UUID REFERENCES suppliers(id),
    status VARCHAR(50) DEFAULT 'PLANNED',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    delivery_date DATE,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bom_items_project_id ON bom_items(project_id);
CREATE INDEX idx_bom_items_parent_id ON bom_items(parent_id);
CREATE INDEX idx_bom_items_supplier_id ON bom_items(supplier_id);
CREATE INDEX idx_bom_items_status ON bom_items(status);
CREATE INDEX idx_bom_items_category ON bom_items(category);
```

#### **suppliers** - Lieferantenverwaltung
```sql
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(500),
    address JSONB,
    tax_id VARCHAR(100),
    payment_terms VARCHAR(100),
    rating DECIMAL(3,2),
    category VARCHAR(100),
    specialties TEXT[],
    certifications TEXT[],
    performance_metrics JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_category ON suppliers(category);
CREATE INDEX idx_suppliers_active ON suppliers(is_active);
CREATE INDEX idx_suppliers_rating ON suppliers(rating);
```

#### **supplier_contracts** - Lieferantenverträge
```sql
CREATE TABLE supplier_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    contract_number VARCHAR(100) UNIQUE NOT NULL,
    contract_type VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    total_value DECIMAL(15,2),
    payment_terms VARCHAR(100),
    terms_conditions TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    documents JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_supplier_contracts_supplier_id ON supplier_contracts(supplier_id);
CREATE INDEX idx_supplier_contracts_project_id ON supplier_contracts(project_id);
CREATE INDEX idx_supplier_contracts_status ON supplier_contracts(status);
```

### **Business Schema - Genehmigungen & Logistik**

#### **permits** - Genehmigungsverwaltung
```sql
CREATE TABLE permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'PENDING',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    application_date DATE,
    submission_date DATE,
    approval_date DATE,
    expiry_date DATE,
    cost DECIMAL(15,2),
    issuing_authority VARCHAR(255),
    reference_number VARCHAR(100),
    requirements TEXT[],
    documents JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permits_project_id ON permits(project_id);
CREATE INDEX idx_permits_type ON permits(type);
CREATE INDEX idx_permits_status ON permits(status);
CREATE INDEX idx_permits_dates ON permits(application_date, approval_date, expiry_date);
```

#### **logistics** - Logistikverwaltung
```sql
CREATE TABLE logistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    from_location JSONB,
    to_location JSONB,
    scheduled_date TIMESTAMP,
    actual_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'PLANNED',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    cost DECIMAL(15,2),
    carrier VARCHAR(255),
    tracking_number VARCHAR(100),
    special_requirements TEXT[],
    documents JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logistics_project_id ON logistics(project_id);
CREATE INDEX idx_logistics_type ON logistics(type);
CREATE INDEX idx_logistics_status ON logistics(status);
CREATE INDEX idx_logistics_dates ON logistics(scheduled_date, actual_date);
```

### **Business Schema - Aufgaben & Workflows**

#### **tasks** - Aufgabenverwaltung
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES tasks(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'TODO',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    type VARCHAR(100),
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    due_date DATE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    progress_percentage INTEGER DEFAULT 0,
    dependencies JSONB DEFAULT '[]',
    tags TEXT[],
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
```

#### **task_comments** - Aufgabenkommentare
```sql
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES task_comments(id),
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX idx_task_comments_parent ON task_comments(parent_comment_id);
```

#### **task_attachments** - Aufgabenanhänge
```sql
CREATE TABLE task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX idx_task_attachments_file_id ON task_attachments(file_id);
```

### **Workflow Schema - Kanban & Workflow-Management**

#### **kanban_boards** - Kanban-Boards
```sql
CREATE TABLE kanban_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    board_type VARCHAR(100) DEFAULT 'TASK',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kanban_boards_project_id ON kanban_boards(project_id);
CREATE INDEX idx_kanban_boards_active ON kanban_boards(is_active);
```

#### **kanban_columns** - Kanban-Spalten
```sql
CREATE TABLE kanban_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    color VARCHAR(7),
    wip_limit INTEGER,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kanban_columns_board_id ON kanban_columns(board_id);
CREATE INDEX idx_kanban_columns_order ON kanban_columns(board_id, order_index);
```

#### **kanban_cards** - Kanban-Karten
```sql
CREATE TABLE kanban_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    column_id UUID NOT NULL REFERENCES kanban_columns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content JSONB DEFAULT '{}',
    assigned_to UUID REFERENCES users(id),
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    due_date DATE,
    order_index INTEGER NOT NULL,
    size VARCHAR(20),
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kanban_cards_column_id ON kanban_cards(column_id);
CREATE INDEX idx_kanban_cards_assigned_to ON kanban_cards(assigned_to);
CREATE INDEX idx_kanban_cards_order ON kanban_cards(column_id, order_index);
CREATE INDEX idx_kanban_cards_priority ON kanban_cards(priority);
```

### **File Management Schema**

#### **files** - Dateiverwaltung
```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    extension VARCHAR(20),
    category VARCHAR(100),
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    uploaded_by UUID NOT NULL REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_files_project_id ON files(project_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_category ON files(category);
CREATE INDEX idx_files_mime_type ON files(mime_type);
CREATE INDEX idx_files_created_at ON files(created_at);
```

#### **file_versions** - Dateiversionen
```sql
CREATE TABLE file_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    change_description TEXT,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(file_id, version_number)
);

CREATE INDEX idx_file_versions_file_id ON file_versions(file_id);
CREATE INDEX idx_file_versions_version ON file_versions(file_id, version_number);
```

### **Audit & Logging Schema**

#### **audit_logs** - Audit-Logs
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

#### **system_logs** - System-Logs
```sql
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
```

## 🔧 **Datenbank-Optimierungen**

### **Indizierungsstrategie**
```sql
-- Composite Indexes für häufige Queries
CREATE INDEX idx_projects_status_dates ON projects(status, start_date, end_date);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status, priority);
CREATE INDEX idx_bom_items_project_category ON bom_items(project_id, category, status);

-- Partial Indexes für aktive Datensätze
CREATE INDEX idx_active_projects ON projects(id) WHERE is_active = true;
CREATE INDEX idx_active_tasks ON tasks(id) WHERE status != 'COMPLETED';

-- GIN Indexes für JSONB-Felder
CREATE INDEX idx_projects_metadata ON projects USING GIN (metadata);
CREATE INDEX idx_tasks_tags ON tasks USING GIN (tags);
CREATE INDEX idx_files_tags ON files USING GIN (tags);
```

### **Partitionierung**
```sql
-- Zeitbasierte Partitionierung für große Tabellen
CREATE TABLE audit_logs_partitioned (
    id UUID NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP NOT NULL
) PARTITION BY RANGE (timestamp);

-- Partitionen für verschiedene Zeiträume
CREATE TABLE audit_logs_2024 PARTITION OF audit_logs_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE audit_logs_2025 PARTITION OF audit_logs_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### **Materialized Views**
```sql
-- Materialized View für Projekt-Übersicht
CREATE MATERIALIZED VIEW project_summary AS
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
         COUNT(t.id)::DECIMAL) * 100, 2
    ) as completion_percentage
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
GROUP BY p.id, p.name, p.status, p.start_date, p.end_date, p.budget, p.actual_cost;

-- Refresh der Materialized View
REFRESH MATERIALIZED VIEW project_summary;
```

## 🔒 **Sicherheit & Berechtigungen**

### **Row Level Security (RLS)**
```sql
-- RLS für Projekte aktivieren
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy für Projektzugriff
CREATE POLICY project_access_policy ON projects
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = projects.id
            AND pm.user_id = current_setting('app.current_user_id')::UUID
            AND pm.is_active = true
        )
        OR 
        projects.manager_id = current_setting('app.current_user_id')::UUID
    );

-- RLS für Aufgaben aktivieren
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy für Aufgabenzugriff
CREATE POLICY task_access_policy ON tasks
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = tasks.project_id
            AND pm.user_id = current_setting('app.current_user_id')::UUID
            AND pm.is_active = true
        )
        OR 
        tasks.assigned_to = current_setting('app.current_user_id')::UUID
    );
```

### **Funktionen für Berechtigungsprüfung**
```sql
-- Funktion zur Berechtigungsprüfung
CREATE OR REPLACE FUNCTION check_user_permission(
    p_user_id UUID,
    p_resource_type VARCHAR,
    p_resource_id UUID,
    p_permission VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := false;
BEGIN
    -- Prüfe direkte Benutzerberechtigungen
    SELECT EXISTS (
        SELECT 1 FROM user_permissions up
        WHERE up.user_id = p_user_id
        AND up.resource_type = p_resource_type
        AND (up.resource_id = p_resource_id OR up.resource_id IS NULL)
        AND up.permissions ? p_permission
        AND (up.expires_at IS NULL OR up.expires_at > CURRENT_TIMESTAMP)
    ) INTO has_permission;
    
    -- Prüfe Rollenberechtigungen
    IF NOT has_permission THEN
        SELECT EXISTS (
            SELECT 1 FROM users u
            JOIN user_roles ur ON u.role_id = ur.id
            WHERE u.id = p_user_id
            AND ur.permissions ? p_permission
        ) INTO has_permission;
    END IF;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📊 **Backup & Recovery**

### **Backup-Strategie**
```sql
-- WAL-Archiving aktivieren
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'test ! -f /var/lib/postgresql/archive/%f && cp %p /var/lib/postgresql/archive/%f';

-- Point-in-Time Recovery aktivieren
ALTER SYSTEM SET recovery_target_timeline = 'latest';
ALTER SYSTEM SET restore_command = 'cp /var/lib/postgresql/archive/%f %p';

-- Automatische VACUUM-Optimierung
ALTER SYSTEM SET autovacuum = on;
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.1;
ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.05;
```

### **Maintenance-Funktionen**
```sql
-- Funktion für automatische Wartung
CREATE OR REPLACE FUNCTION perform_maintenance() RETURNS VOID AS $$
BEGIN
    -- VACUUM für alle Tabellen
    VACUUM ANALYZE;
    
    -- Statistiken aktualisieren
    ANALYZE;
    
    -- Alte Logs bereinigen (älter als 1 Jahr)
    DELETE FROM system_logs WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
    DELETE FROM audit_logs WHERE timestamp < CURRENT_DATE - INTERVAL '1 year';
    
    -- Materialized Views aktualisieren
    REFRESH MATERIALIZED VIEW project_summary;
END;
$$ LANGUAGE plpgsql;
```

## 🚀 **Performance-Monitoring**

### **Performance-Views**
```sql
-- View für langsame Queries
CREATE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;

-- View für Tabellen-Performance
CREATE VIEW table_performance AS
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

---

## 📝 **Implementierungsplan**

### **Phase 1: Schema-Erstellung (Woche 1)**
- [ ] Alle Tabellen erstellen
- [ ] Indizes und Constraints definieren
- [ ] Basis-Daten einfügen
- [ ] RLS-Policies implementieren

### **Phase 2: Optimierung (Woche 2)**
- [ ] Performance-Indizes hinzufügen
- [ ] Materialized Views erstellen
- [ ] Partitionierung implementieren
- [ ] Backup-Strategie konfigurieren

### **Phase 3: Testing & Monitoring (Woche 3)**
- [ ] Performance-Tests durchführen
- [ ] Monitoring-Views erstellen
- [ ] Backup & Recovery testen
- [ ] Dokumentation vervollständigen

---

*Dokument erstellt: ${new Date().toLocaleString('de-DE')}*
*Version: 1.0.0*
*Status: ACTIVE - IMPLEMENTATION*
*Nächster Schritt: DATABASE_IMPLEMENTATION*