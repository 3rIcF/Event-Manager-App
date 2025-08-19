# Datenbank-Modell
## Event Manager Application

**Dokumentenversion:** 2.0 (Supabase-ready)  
**Erstellt am:** Dezember 2024  
**Status:** Vollständiges Datenbankmodell für Supabase-Deployment  

---

## 🏗️ **Architektur-Übersicht**

### **Supabase PostgreSQL**
- **Managed Service** mit automatischen Backups
- **Row Level Security (RLS)** für Datenschutz
- **Real-time Subscriptions** für Live-Updates
- **Edge Functions** für Serverless-Logik
- **Automatische Skalierung** basierend auf Last

### **Datenbank-Schema**
Das vollständige Schema wird durch Prisma verwaltet und befindet sich in:
```
apps/api/prisma/schema.prisma
```

---

## 🗄️ **Vollständiges Prisma Schema**

### **Generator & Datasource**
```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [pg_trgm, btree_gin, uuid_ossp]
}
```

### **Enums für Typsicherheit**
```prisma
enum UserRole {
  ADMIN
  ORGANIZER
  ONSITE
  EXTERNAL_VENDOR
}

enum ProjectStatus {
  PLANNING
  APPROVAL_PENDING
  APPROVED
  ACTIVE
  COMPLETED
  CANCELLED
  ARCHIVED
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  COMPLETED
  BLOCKED
  CANCELLED
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
  UNDER_REVIEW
  ESCALATED
}

enum BOMItemType {
  MATERIAL
  EQUIPMENT
  SERVICE
  LABOR
  OVERHEAD
}

enum Currency {
  EUR
  USD
  CHF
  GBP
}
```

### **Core Entities (Benutzer & Authentifizierung)**

#### **User Model**
```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  role         UserRole
  isActive     Boolean  @default(true)
  phone        String?
  department   String?
  position     String?
  avatar       String?
  lastLogin    DateTime?
  timezone     String   @default("Europe/Berlin")
  language     String   @default("de")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  ownedProjects     Project[] @relation("ProjectOwner")
  assignedProjects  Project[] @relation("ProjectMembers")
  comments          Comment[]
  auditLogs         AuditLog[]
  uploadedFiles     File[] @relation("FileUploader")
  bomChanges        BOMChange[]
  supplierRatings   SupplierRating[]
  expenseApprovals  ProjectExpense[] @relation("ExpenseApprover")
  assignedTasks     Task[] @relation("TaskAssignee")
  timeLogs          TimeLog[]
  taskComments      TaskComment[]
  slotReservations  SlotReservation[]
  responsiblePermits Permit[] @relation("PermitResponsible")
  permits           Permit[] @relation("PermitRequestor")

  @@map("users")
  @@index([email])
  @@index([role])
  @@index([isActive])
}
```

#### **Role & Permission Models**
```prisma
model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  permissions Permission[]
  users       User[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("roles")
}

model Permission {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  resource    String   // z.B. "project", "bom", "supplier"
  action      String   // z.B. "create", "read", "update", "delete"
  roles       Role[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("permissions")
  @@unique([resource, action])
}
```

### **Business Logic Entities**

#### **Project Model**
```prisma
model Project {
  id             String        @id @default(cuid())
  name           String
  description   String?
  status         ProjectStatus @default(PLANNING)
  dateFrom       DateTime
  dateTo         DateTime
  startDate      DateTime      // Für Kompatibilität
  locationName   String
  address        String?
  lat            Float?
  lng            Float?
  ownerId        String
  budgetEstimate Float?
  budget         Float?
  currency       Currency      @default(EUR)
  priority       String?       // LOW, MEDIUM, HIGH, CRITICAL
  manager        String?
  client         String?
  notes          String?
  tags           String[]      // Für Kategorisierung
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  // Relations
  owner              User                    @relation("ProjectOwner", fields: [ownerId], references: [id])
  members            User[]                  @relation("ProjectMembers")
  bomItems          BomItem[]
  suppliers         ProjectSupplier[]
  tasks             Task[]
  slots             Slot[]
  permits           Permit[]
  expenses          ProjectExpense[]
  comments          Comment[]
  files             File[]

  @@map("projects")
  @@index([ownerId])
  @@index([status])
  @@index([dateFrom])
  @@index([dateTo])
  @@index([locationName])
  @@index([tags])
}
```

#### **BOM Item Model**
```prisma
model BomItem {
  id          String      @id @default(cuid())
  projectId   String
  parentId    String?     // Für hierarchische Struktur
  name        String
  description String?
  type        BOMItemType
  quantity    Float
  unit        String
  cost        Float?
  supplierId  String?
  categoryId  String?
  sku         String?     // Stock Keeping Unit
  weight      Float?
  dimensions  Json?        // {length, width, height}
  notes       String?
  version     Int          @default(1)
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  // Relations
  project    Project     @relation(fields: [projectId], references: [id])
  parent     BomItem?    @relation("BOMHierarchy", fields: [parentId], references: [id])
  children   BomItem[]   @relation("BOMHierarchy")
  supplier   Supplier?   @relation(fields: [supplierId], references: [id])
  category   Category?   @relation(fields: [categoryId], references: [id])
  changes    BOMChange[]

  @@map("bom_items")
  @@index([projectId])
  @@index([parentId])
  @@index([type])
  @@index([categoryId])
  @@index([supplierId])
  @@index([sku])
}
```

#### **Supplier Model**
```prisma
model Supplier {
  id            String   @id @default(cuid())
  name          String
  description   String?
  contactPerson String?
  email         String
  phone         String?
  website       String?
  address       String?
  city          String?
  country       String?
  postalCode    String?
  taxId         String?
  rating        Float?   // Durchschnittsbewertung 1-5
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  categories       SupplierCategory[]
  projects        ProjectSupplier[]
  bomItems        BomItem[]
  ratings         SupplierRating[]
  availability    SupplierAvailability[]

  @@map("suppliers")
  @@index([name])
  @@index([email])
  @@index([rating])
  @@index([isActive])
}
```

#### **Task Model**
```prisma
model Task {
  id          String     @id @default(cuid())
  projectId   String
  name        String
  description String?
  status      TaskStatus @default(TODO)
  priority    String?    // LOW, MEDIUM, HIGH, CRITICAL
  assigneeId  String?
  dueDate     DateTime?
  startDate   DateTime?
  endDate     DateTime?
  estimatedHours Float?
  actualHours   Float?
  dependencies  String[]  // IDs abhängiger Tasks
  tags         String[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  // Relations
  project       Project        @relation(fields: [projectId], references: [id])
  assignee      User?          @relation("TaskAssignee", fields: [assigneeId], references: [id])
  comments      TaskComment[]
  timeLogs      TimeLog[]
  slotReservations SlotReservation[]

  @@map("tasks")
  @@index([projectId])
  @@index([assigneeId])
  @@index([status])
  @@index([dueDate])
  @@index([priority])
  @@index([tags])
}
```

---

## 🔐 **Row Level Security (RLS)**

### **RLS-Policies für Supabase**

#### **Users Table**
```sql
-- RLS aktivieren
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Benutzer können nur sich selbst sehen
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Policy: Admins können alle Benutzer sehen
CREATE POLICY "Admins can view all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );
```

#### **Projects Table**
```sql
-- RLS aktivieren
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Projektbesitzer und Mitglieder können zugreifen
CREATE POLICY "Project access" ON projects
  FOR ALL USING (
    owner_id = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM _ProjectMembers 
      WHERE "A" = projects.id AND "B" = auth.uid()::text
    )
  );
```

#### **BOM Items Table**
```sql
-- RLS aktivieren
ALTER TABLE bom_items ENABLE ROW LEVEL SECURITY;

-- Policy: Nur Projektmitglieder können BOM-Items sehen
CREATE POLICY "BOM items access" ON bom_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = bom_items.project_id AND (
        p.owner_id = auth.uid()::text OR
        EXISTS (
          SELECT 1 FROM _ProjectMembers pm
          WHERE pm."A" = p.id AND pm."B" = auth.uid()::text
        )
      )
    )
  );
```

---

## 📊 **Indizierung & Performance**

### **Primary Indices**
- Alle Tabellen haben **Primary Keys** mit `@id @default(cuid())`
- **Unique Constraints** für E-Mail-Adressen und Namen

### **Performance Indices**
```sql
-- Benutzer-Indices
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- Projekt-Indices
CREATE INDEX "projects_ownerId_idx" ON "projects"("ownerId");
CREATE INDEX "projects_status_idx" ON "projects"("status");
CREATE INDEX "projects_dateFrom_idx" ON "projects"("dateFrom");
CREATE INDEX "projects_dateTo_idx" ON "projects"("dateTo");

-- BOM-Item-Indices
CREATE INDEX "bom_items_projectId_idx" ON "bom_items"("projectId");
CREATE INDEX "bom_items_type_idx" ON "bom_items"("type");
CREATE INDEX "bom_items_categoryId_idx" ON "bom_items"("categoryId");

-- Task-Indices
CREATE INDEX "tasks_projectId_idx" ON "tasks"("projectId");
CREATE INDEX "tasks_assigneeId_idx" ON "tasks"("assigneeId");
CREATE INDEX "tasks_status_idx" ON "tasks"("status");
CREATE INDEX "tasks_dueDate_idx" ON "tasks"("dueDate");
```

### **Composite Indices**
```sql
-- Für häufige Abfragen
CREATE INDEX "projects_owner_status_idx" ON "projects"("ownerId", "status");
CREATE INDEX "tasks_project_status_idx" ON "tasks"("projectId", "status");
CREATE INDEX "bom_items_project_type_idx" ON "bom_items"("projectId", "type");
```

### **Full-Text Search Indices**
```sql
-- Für Projektnamen und Beschreibungen
CREATE INDEX "projects_search_idx" ON "projects" USING gin(to_tsvector('german', name || ' ' || COALESCE(description, '')));

-- Für BOM-Item-Namen
CREATE INDEX "bom_items_search_idx" ON "bom_items" USING gin(to_tsvector('german', name || ' ' || COALESCE(description, '')));
```

---

## 🔄 **Migration & Deployment**

### **Supabase Migration**
```bash
# 1. Supabase-Projekt einrichten
# 2. Umgebungsvariablen konfigurieren
cp apps/api/env.supabase.example apps/api/.env

# 3. Migration durchführen
cd apps/api
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
```

### **Migration-Datei**
Die initiale Migration befindet sich in:
```
apps/api/prisma/migrations/20241201000000_init/migration.sql
```

### **Schema-Push (Entwicklung)**
```bash
# Für schnelle Entwicklung
npm run db:push
```

---

## 🌱 **Seed-Daten**

### **Standard-Rollen**
- **ADMIN**: System-Administrator mit vollen Rechten
- **ORGANIZER**: Event-Organisator mit Projektverwaltungsrechten
- **ONSITE**: Onsite-Team mit Ausführungsrechten
- **EXTERNAL_VENDOR**: Externer Lieferant mit eingeschränkten Rechten

### **Standard-Berechtigungen**
- Projekt-Berechtigungen (create, read, update, delete)
- BOM-Berechtigungen (create, read, update, delete)
- Lieferanten-Berechtigungen (create, read, update, delete)
- Task-Berechtigungen (create, read, update, delete)
- Genehmigungs-Berechtigungen (create, read, update, approve)

### **Demo-Daten**
- **Admin-User**: admin@elementaro.com / admin123
- **Demo-Organizer**: organizer@elementaro.com / organizer123
- **Demo-Projekt**: "Demo Event 2024" mit BOM-Items, Tasks und Slots

---

## 🔒 **Sicherheit & Compliance**

### **Audit-Logging**
Alle kritischen Datenbankoperationen werden protokolliert:
- Benutzer-Aktionen (CREATE, UPDATE, DELETE)
- Ressourcen-Änderungen
- IP-Adressen und User-Agents
- Zeitstempel für Compliance

### **Datenverschlüsselung**
- **Passwort-Hashing** mit bcrypt (Salt Rounds: 12)
- **HTTPS/TLS** für alle Verbindungen
- **Supabase Standard-Verschlüsselung** für Datenbank

### **Backup-Strategie**
- **Automatische Backups** durch Supabase
- **Point-in-Time Recovery** verfügbar
- **Geografische Redundanz** für Disaster Recovery

---

## 📈 **Skalierung & Performance**

### **Supabase Auto-Scaling**
- **Automatische Skalierung** basierend auf Last
- **Connection Pooling** für optimale Performance
- **Query Optimization** durch Supabase Query Optimizer

### **Partitioning (Optional)**
```sql
-- Für große Projekttabellen
CREATE TABLE projects_2024 PARTITION OF projects
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE projects_2025 PARTITION OF projects
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### **Read-Replicas (Optional)**
- **Lese-intensive Operationen** auf Replicas
- **Schreiboperationen** auf Primary
- **Automatische Synchronisation**

---

## 🔧 **Entwicklung & Wartung**

### **Prisma Studio**
```bash
# Datenbank-GUI öffnen
npm run db:studio
```

### **Nützliche Befehle**
```bash
# Prisma Client generieren
npm run db:generate

# Schema direkt pushen
npm run db:push

# Migration erstellen
npm run db:migrate

# Migration deployen
npm run db:migrate:deploy

# Demo-Daten einfügen
npm run db:seed

# Datenbank zurücksetzen
npm run db:reset
```

### **Monitoring & Health Checks**
- **Supabase Dashboard** für Datenbank-Performance
- **Health Checks** für alle Services
- **Performance-Metriken** und -Alerts

---

## 🔗 **Verwandte Dokumente**

- **Supabase Setup**: [SUPABASE_SETUP.md](../SUPABASE_SETUP.md)
- **Technische Spezifikationen**: [technical-specifications.md](technical-specifications.md)
- **Anforderungen**: [requirements.md](requirements.md)
- **Anforderungen-Zusammenfassung**: [requirements-summary.md](requirements-summary.md)

---

**Status**: ✅ Vollständig aktualisiert für Supabase-Migration  
**Letzte Aktualisierung**: Dezember 2024  
**Version**: 2.0 (Supabase-ready)
