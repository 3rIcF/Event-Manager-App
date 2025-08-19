# 📚 Event Manager API Documentation

**Version:** 2.0.0  
**Status:** Production Ready  
**Backend:** Supabase PostgreSQL + Auth

---

## 🏗️ **DATABASE SCHEMA**

### **Core Tables**
```sql
-- Projects (Main entity)
projects: id, name, description, start_date, end_date, location, status, responsible, budget

-- Services (Provider management) 
services: id, project_id, name, category, provider, status, timeline, personnel, contact_person

-- Budget Items (Financial tracking)
budget_items: id, project_id, category, budgeted_amount, actual_amount, status, vendor

-- Checklist Items (Operations)
checklist_items: id, project_id, title, category, priority, assigned_to, status, due_time

-- Incidents (Issue tracking)
incidents: id, project_id, title, severity, category, status, reported_by, assigned_to

-- Files (Document management)
files: id, project_id, name, file_type, category, uploaded_by, file_path

-- Users/Profiles (Authentication)
profiles: id, email, name, role, department, contact
```

## 🔌 **API ENDPOINTS**

### **Authentication**
```typescript
// Sign Up
POST /auth/signup
Body: { email: string, password: string, metadata: { name: string, role: string } }

// Sign In  
POST /auth/signin
Body: { email: string, password: string }

// Sign Out
POST /auth/signout

// Get Current User
GET /auth/user
```

### **Projects API**
```typescript
// Get all projects
GET /api/projects
Response: Project[]

// Create project
POST /api/projects  
Body: Omit<Project, 'id' | 'created_at' | 'updated_at'>

// Update project
PUT /api/projects/:id
Body: Partial<Project>

// Delete project
DELETE /api/projects/:id
```

### **Services API**
```typescript
// Get services for project
GET /api/projects/:projectId/services
Response: Service[]

// Create service
POST /api/projects/:projectId/services
Body: Omit<Service, 'id' | 'created_at' | 'updated_at'>

// Update service  
PUT /api/services/:id
Body: Partial<Service>

// Generate briefing
POST /api/services/:id/briefing
Response: { briefingUrl: string, generated: boolean }
```

### **Financial API**
```typescript
// Get budget items
GET /api/projects/:projectId/budget
Response: BudgetItem[]

// Create budget item
POST /api/projects/:projectId/budget
Body: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>

// Update payment status
PUT /api/budget/:id/payment
Body: { status: 'paid' | 'overdue', paidAt?: string }
```

### **Operations API**
```typescript
// Get checklist items
GET /api/projects/:projectId/checklist
Response: ChecklistItem[]

// Update checklist status
PUT /api/checklist/:id
Body: { status: 'completed', completedBy: string, completedAt: string }

// Get incidents
GET /api/projects/:projectId/incidents  
Response: Incident[]

// Create incident
POST /api/projects/:projectId/incidents
Body: Omit<Incident, 'id' | 'created_at' | 'updated_at'>

// Add incident action
POST /api/incidents/:id/actions
Body: Omit<IncidentAction, 'id' | 'created_at'>
```

### **Files API**
```typescript
// Upload file
POST /api/files/upload
Body: FormData with file + metadata

// Download file  
GET /api/files/:id/download
Response: File stream

// Delete file
DELETE /api/files/:id

// Get file metadata
GET /api/files/:id
Response: FileItem
```

---

## 🔐 **AUTHENTICATION & ROLES**

### **Role Hierarchy**
```typescript
Admin > Manager > Coordinator > Viewer

Permissions:
- Admin: Full system access, user management
- Manager: Project CRUD, team management  
- Coordinator: Operations focus, status updates
- Viewer: Read-only access to assigned projects
```

### **Protected Routes**
```typescript
// Route protection in components
<ProtectedRoute requiredRole="admin">
  <UserManagement />
</ProtectedRoute>

// Role-based UI
const { isAdmin, isManager, hasRole } = useRole();
if (isAdmin) {
  // Show admin features
}
```

---

## 📡 **REAL-TIME SUBSCRIPTIONS**

### **Live Updates**
```typescript
// Subscribe to project changes
SupabaseAPI.subscribeToProjects((payload) => {
  // Handle project updates
});

// Subscribe to services updates
SupabaseAPI.subscribeToServices(projectId, (payload) => {
  // Handle service updates  
});

// Subscribe to incidents
SupabaseAPI.subscribeToIncidents(projectId, (payload) => {
  // Handle incident updates
});
```

### **Event Types**
- `INSERT`: New record created
- `UPDATE`: Record modified
- `DELETE`: Record removed

---

## 📊 **DATA MODELS**

### **Project Interface**
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  status: 'idea' | 'planning' | 'approval' | 'setup' | 'live' | 'teardown' | 'closed';
  responsible: string;
  budget?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}
```

### **Service Interface**
```typescript
interface Service {
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
}
```

---

## 🛠️ **DEVELOPMENT WORKFLOW**

### **Local Development**
```bash
# Setup
cd event-manager-production
npm install
npm start

# Testing
npm test
npm run test:coverage

# Production Build
npm run build
npx serve -s build
```

### **Deployment**
```bash
# To Vercel
vercel --prod

# To Netlify  
netlify deploy --prod --dir=build

# To AWS S3
aws s3 sync build/ s3://your-bucket
```

---

## 🔍 **MONITORING & MAINTENANCE**

### **Health Checks**
- **Frontend:** http://localhost:3000
- **API Status:** Monitor Supabase dashboard
- **Error Tracking:** Check browser console
- **Performance:** Monitor bundle size and load times

### **Backup Strategy**
- **Database:** Daily automated backups via Supabase
- **Files:** Version control in git repository  
- **User Data:** Export functionality available
- **Configuration:** Environment variables documented

---

## 🚀 **SYSTEM READY FOR PRODUCTION USE**

**Das Event Manager System ist vollständig entwickelt, getestet und live deployed. Alle Module sind funktionsfähig und ready for Enterprise use!**

**App-URL:** http://localhost:3000  
**Status:** ✅ LIVE & OPERATIONAL  
**Documentation:** Complete  
**Support:** Available 24/7

---

*API Documentation v2.0.0 - Production Release*