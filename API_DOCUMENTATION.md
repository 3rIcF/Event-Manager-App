# Event Manager App - API Documentation

## 🚀 API Overview

**Base URL:** `https://your-project.supabase.co/functions/v1`  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`

---

## 🔐 Authentication

All API endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Getting a Token
1. Use Supabase Auth client
2. Sign in with email/password
3. Extract token from session

---

## 📋 API Endpoints

### 1. Projects API

#### Get All Projects
```http
GET /projects
```

**Query Parameters:**
- `status` (optional): Filter by project status
- `start_date` (optional): Filter by start date
- `end_date` (optional): Filter by end date

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Tech Conference 2025",
    "description": "Annual technology conference",
    "status": "planning",
    "start_date": "2025-06-15",
    "end_date": "2025-06-17",
    "budget": 25000.00,
    "actual_cost": 0,
    "client_name": "TechCorp Inc.",
    "location": "Convention Center",
    "created_by": "user-uuid",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z",
    "is_active": true,
    "created_by_user": {
      "id": "user-uuid",
      "full_name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

#### Get Single Project
```http
GET /projects/{project_id}
```

**Response includes:**
- Project details
- Materials list
- Services list
- Tasks list
- Checklists
- Incidents
- Financial transactions

#### Create Project
```http
POST /projects
```

**Request Body:**
```json
{
  "name": "New Event",
  "description": "Event description",
  "status": "planning",
  "start_date": "2025-07-01",
  "end_date": "2025-07-03",
  "budget": 15000.00,
  "client_name": "Client Name",
  "location": "Event Location"
}
```

#### Update Project
```http
PUT /projects/{project_id}
```

#### Delete Project
```http
DELETE /projects/{project_id}
```

---

### 2. Materials API

#### Get All Materials
```http
GET /materials
```

**Query Parameters:**
- `category` (optional): Filter by category
- `supplier` (optional): Filter by supplier ID
- `lowStock` (optional): Filter for low stock items

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Round Table 60\"",
    "category": "furniture",
    "description": "60 inch round table",
    "unit": "piece",
    "unit_cost": 45.00,
    "supplier_id": "supplier-uuid",
    "min_stock_level": 5,
    "current_stock": 20,
    "location": "Warehouse A",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z",
    "is_active": true,
    "supplier": {
      "id": "supplier-uuid",
      "name": "Event Supplies Pro",
      "contact_person": "John Smith",
      "email": "john@eventsupplies.com",
      "phone": "+1-555-0101",
      "rating": 4.5
    }
  }
]
```

#### Get Single Material
```http
GET /materials/{material_id}
```

#### Create Material
```http
POST /materials
```

**Request Body:**
```json
{
  "name": "New Material",
  "category": "decorations",
  "description": "Material description",
  "unit": "piece",
  "unit_cost": 25.00,
  "supplier_id": "supplier-uuid",
  "min_stock_level": 10,
  "current_stock": 50,
  "location": "Warehouse B"
}
```

#### Update Material
```http
PUT /materials/{material_id}
```

#### Delete Material
```http
DELETE /materials/{material_id}
```

---

### 3. Suppliers API

#### Get All Suppliers
```http
GET /suppliers
```

**Query Parameters:**
- `specialty` (optional): Filter by specialty
- `minRating` (optional): Minimum rating filter
- `minReliability` (optional): Minimum reliability score

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Event Supplies Pro",
    "contact_person": "John Smith",
    "email": "john@eventsupplies.com",
    "phone": "+1-555-0101",
    "address": "123 Main St",
    "specialties": ["tables", "chairs", "decorations"],
    "rating": 4.5,
    "reliability_score": 9,
    "payment_terms": "Net 30",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z",
    "is_active": true,
    "materials": {"count": 3},
    "services": {"count": 0}
  }
]
```

#### Get Single Supplier
```http
GET /suppliers/{supplier_id}
```

#### Create Supplier
```http
POST /suppliers
```

**Request Body:**
```json
{
  "name": "New Supplier",
  "contact_person": "Contact Name",
  "email": "contact@supplier.com",
  "phone": "+1-555-0000",
  "address": "Supplier Address",
  "specialties": ["category1", "category2"],
  "rating": 4.0,
  "reliability_score": 8,
  "payment_terms": "Net 30"
}
```

#### Update Supplier
```http
PUT /suppliers/{supplier_id}
```

#### Delete Supplier
```http
DELETE /suppliers/{supplier_id}
```

---

### 4. Tasks API

#### Get All Tasks
```http
GET /tasks
```

**Query Parameters:**
- `projectId` (optional): Filter by project
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `assignedTo` (optional): Filter by assignee
- `dueDate` (optional): Filter by due date

**Response:**
```json
[
  {
    "id": "uuid",
    "project_id": "project-uuid",
    "title": "Task Title",
    "description": "Task description",
    "status": "pending",
    "priority": "high",
    "assigned_to": "user-uuid",
    "due_date": "2025-06-01",
    "estimated_hours": 8.0,
    "actual_hours": 0,
    "dependencies": [],
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z",
    "is_active": true,
    "assigned_user": {
      "id": "user-uuid",
      "full_name": "John Doe",
      "email": "john@example.com"
    },
    "project": {
      "id": "project-uuid",
      "name": "Project Name",
      "status": "active"
    }
  }
]
```

#### Get Single Task
```http
GET /tasks/{task_id}
```

#### Create Task
```http
POST /tasks
```

**Request Body:**
```json
{
  "project_id": "project-uuid",
  "title": "New Task",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "assigned_to": "user-uuid",
  "due_date": "2025-06-01",
  "estimated_hours": 4.0,
  "dependencies": []
}
```

#### Update Task
```http
PUT /tasks/{task_id}
```

#### Delete Task
```http
DELETE /tasks/{task_id}
```

---

### 5. Authentication API

#### Get Current User Profile
```http
GET /auth
```

#### Get User Profile
```http
GET /auth/{user_id}
```

#### Create User (Admin Only)
```http
POST /auth
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "full_name": "New User",
  "role": "user",
  "permissions": {}
}
```

#### Update User Profile
```http
PUT /auth/{user_id}
```

#### Delete User (Admin Only)
```http
DELETE /auth/{user_id}
```

---

## 📊 Data Models

### Project Status Values
- `planning` - Project in planning phase
- `active` - Project is active
- `completed` - Project completed
- `cancelled` - Project cancelled
- `on-hold` - Project on hold

### Task Status Values
- `pending` - Task pending
- `in-progress` - Task in progress
- `review` - Task under review
- `completed` - Task completed
- `cancelled` - Task cancelled

### Task Priority Values
- `low` - Low priority
- `medium` - Medium priority
- `high` - High priority
- `critical` - Critical priority

### User Role Values
- `admin` - Administrator
- `manager` - Manager
- `user` - Regular user

---

## 🔒 Security & Validation

### Input Validation
- Required fields are validated
- Data types are checked
- Business rules are enforced
- SQL injection protection

### Permission Checks
- User ownership validation
- Role-based access control
- Admin-only operations
- Cross-user access restrictions

### Error Handling
- Consistent error format
- HTTP status codes
- Detailed error messages
- Validation feedback

---

## 📝 Error Responses

### Standard Error Format
```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## 🧪 Testing

### Test Endpoints
Use the provided test data for development:

**Sample Users:**
- Admin: `admin@eventmanager.com`
- Manager: `manager@eventmanager.com`
- User: `user@eventmanager.com`

**Sample Projects:**
- Tech Conference 2025

**Sample Materials:**
- Round Table 60"
- Folding Chair
- Tablecloth White

**Sample Suppliers:**
- Event Supplies Pro
- Catering Plus
- Audio Visual Solutions

---

## 📚 Additional Resources

### Database Schema
- See `supabase/migrations/001_initial_schema.sql`

### TypeScript Interfaces
- See `src/types/database.ts`

### Unit Tests
- See `src/__tests__/`

### Workflow Updates
- See `workflow.md`

---

## 🚨 Rate Limiting

Currently no rate limiting implemented. Consider implementing for production use.

---

## 🔄 Versioning

This is API version 1.0.0. Future versions will maintain backward compatibility where possible.

---

*Generated on: 2025-08-19 01:25 UTC*  
*API Version: 1.0.0*  
*Status: Production Ready*
