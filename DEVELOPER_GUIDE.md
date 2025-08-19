# 👨‍💻 Event Manager App - Entwickler-Leitfaden

## 🚀 **Schnellstart für Entwickler**

### **1. Backend-Server starten**
```bash
cd backend
npm install
npm run dev
```

Der Backend-Server läuft jetzt auf: **http://localhost:3001**

### **2. API testen**
```bash
# Health Check
curl http://localhost:3001/health

# API Health Check
curl http://localhost:3001/api/v1/health

# Benutzer registrieren
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "username": "developer",
    "password": "DevPassword123",
    "firstName": "Developer",
    "lastName": "User"
  }'
```

## 📋 **Verfügbare API-Services**

### **✅ Implementierte Services**
1. **Authentication Service** - JWT, RBAC, Session-Management
2. **Project Service** - Projektverwaltung, Mitgliederverwaltung
3. **Task Service** - Aufgabenverwaltung, Kommentare
4. **Supplier Service** - Lieferantenverwaltung, Bewertungen
5. **BOM Service** - Materialverwaltung, Hierarchien
6. **File Service** - Datei-Upload, Versionierung

### **🔧 Service-Architektur**
```
src/
├── controllers/         # API Controllers (Request/Response Handling)
├── services/           # Business Logic Services
├── middleware/         # Custom Middleware (Auth, Validation, Error)
├── routes/             # API Route Definitions
├── utils/              # Utility Functions (JWT, Password, Validation)
├── types/              # TypeScript Type Definitions
├── config/             # Configuration (Database, Logger, Environment)
└── index.ts            # Main Application Entry Point
```

## 🗄️ **Datenbank-Integration**

### **Prisma ORM**
- **Schema**: `backend/prisma/schema.prisma`
- **Client**: Automatisch generiert mit `npx prisma generate`
- **Migrations**: `npx prisma db push` (Development)

### **Verfügbare Modelle**
- `User`, `UserRole`, `UserPermission`, `UserSession`
- `Organization`, `Client`, `Project`, `ProjectMember`, `ProjectPhase`
- `Task`, `TaskComment`, `TaskAttachment`
- `BOMItem`, `Supplier`, `SupplierContract`
- `KanbanBoard`, `KanbanColumn`, `KanbanCard`
- `File`, `FileVersion`
- `AuditLog`, `SystemLog`

## 🔐 **Authentication & Authorization**

### **JWT Token Management**
```typescript
import { JWTService } from '@/utils/jwt';

// Generate tokens
const tokens = JWTService.generateTokens({
  userId: user.id,
  email: user.email,
  roleId: user.roleId,
});

// Verify token
const payload = JWTService.verifyAccessToken(token);
```

### **Middleware Usage**
```typescript
import { authenticate, authorize, requirePermission } from '@/middleware/auth';

// Require authentication
router.use(authenticate);

// Require specific role
router.get('/admin', authorize(['admin', 'super_admin']), handler);

// Require specific permission
router.post('/projects', requirePermission('projects', 'create'), handler);
```

### **Benutzerrollen**
- `super_admin`: Alle Rechte
- `admin`: Erweiterte Rechte
- `project_manager`: Projektverwaltung
- `team_member`: Basis-Rechte
- `viewer`: Nur Lese-Rechte

## 📊 **API-Entwicklung**

### **Controller-Pattern**
```typescript
export class ProjectController {
  static async createProject(req: Request, res: Response) {
    try {
      const data = validateAndTransform(createProjectSchema, req.body);
      const project = await ProjectService.createProject(req.user!.id, data);
      
      const response: ApiResponse = {
        success: true,
        data: { project },
        message: 'Project created successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };
      
      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      // Error handling...
    }
  }
}
```

### **Service-Pattern**
```typescript
export class ProjectService {
  static async createProject(managerId: string, data: CreateProjectData): Promise<ProjectWithDetails> {
    try {
      const project = await prisma.project.create({
        data: { ...data, managerId },
        include: { manager: true, client: true, _count: true },
      });
      
      logger.info('Project created', { projectId: project.id });
      return project;
    } catch (error) {
      logger.error('Failed to create project', { error });
      throw error;
    }
  }
}
```

### **Validation mit Zod**
```typescript
const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  budget: z.number().positive().optional(),
});

// In Controller verwenden
const data = validateAndTransform(createProjectSchema, req.body);
```

## 📁 **Datei-Upload**

### **Multer Configuration**
```typescript
import { FileController } from '@/controllers/file.controller';

// Datei hochladen
router.post('/upload', FileController.uploadMiddleware, FileController.uploadFile);
```

### **Upload-Beispiel**
```bash
curl -X POST http://localhost:3001/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf" \
  -F "category=documents" \
  -F "tags=important,contract" \
  -F "projectId=clr1234567890"
```

## 🔍 **Error Handling**

### **Globaler Error Handler**
```typescript
import { errorHandler, createNotFoundError } from '@/middleware/error';

// 404 Error erstellen
throw createNotFoundError('Project');

// Custom Error erstellen
throw createError('Custom message', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
```

### **Async Error Wrapper**
```typescript
import { asyncHandler } from '@/middleware/error';

router.get('/projects', asyncHandler(ProjectController.getProjects));
```

## 📊 **Logging & Monitoring**

### **Winston Logger**
```typescript
import { logger } from '@/config/logger';

logger.info('Operation successful', { userId, projectId });
logger.error('Operation failed', { error, context });
logger.debug('Debug information', { data });
```

### **Request Logging**
- Automatisches Request/Response Logging
- Performance-Metriken
- Error-Tracking mit Stack Traces

## 🧪 **Testing**

### **Test-Setup (Vorbereitet)**
```bash
# Unit Tests
npm test

# Test Coverage
npm run test:coverage

# Test Watch Mode
npm run test:watch
```

### **API-Tests mit curl**
```bash
# Vollständiger Test-Workflow
./scripts/test-api.sh
```

## 🔧 **Entwicklung**

### **TypeScript Konfiguration**
- Strict Mode aktiviert
- Path Mapping für saubere Imports
- Decorator Support für zukünftige Features

### **Code-Qualität**
```bash
# Linting
npm run lint

# Linting mit Auto-Fix
npm run lint:fix
```

### **Hot Reload**
```bash
# Development mit Hot Reload
npm run dev
```

## 📈 **Performance-Optimierung**

### **Database Queries**
- Prisma ORM mit optimierten Includes
- Pagination für große Datensätze
- Index-Optimierung in Schema

### **Caching (Vorbereitet)**
- Redis für Session-Storage
- API-Response Caching
- Database Query Caching

### **File Handling**
- Memory-efficient Streaming
- File Size Validation
- Type Validation

## 🚀 **Deployment**

### **Development**
```bash
cd backend
npm run dev
```

### **Production Build**
```bash
npm run build
npm start
```

### **Docker (Vorbereitet)**
```bash
docker-compose up -d
```

## 📋 **Nächste Entwicklungsschritte**

### **1. Database Connection (Sofort)**
```bash
# PostgreSQL lokal installieren oder Docker verwenden
# Dann: npx prisma db push
```

### **2. Frontend-Integration (Diese Woche)**
- React App mit Backend-APIs verbinden
- State Management mit React Query
- Authentication Flow implementieren

### **3. Erweiterte Features (Nächste Woche)**
- Permits Management
- Logistics Management
- Kanban Boards
- Real-time Updates (WebSockets)

### **4. Testing & QA**
- Unit Tests für alle Services
- Integration Tests
- E2E Tests mit Playwright

## 🤝 **Team-Koordination**

### **Workflow-Status**
- Alle Updates in `workflow.md` dokumentiert
- Status-Tracking über TODO-System
- Regelmäßige Updates im AI-Orchestrator

### **Code-Standards**
- TypeScript Strict Mode
- ESLint Konfiguration
- Konsistente Error Handling
- Umfassende Logging

### **Git-Workflow**
- Feature Branches für neue Features
- Pull Requests für Code Review
- Automatische Tests vor Merge

## 📞 **Support & Hilfe**

### **Logs überprüfen**
```bash
# Application Logs
tail -f backend/logs/combined.log

# Error Logs
tail -f backend/logs/error.log
```

### **Database-Debugging**
```bash
# Prisma Studio (GUI)
npx prisma studio

# Database direkt
psql postgresql://event_user:event_password@localhost:5432/event_manager
```

### **API-Testing**
- Postman Collection (geplant)
- Swagger UI (geplant)
- API-Dokumentation: `backend/API_DOCUMENTATION.md`

---

## 🎯 **Entwickler-Checkliste**

### **Vor dem Entwickeln**
- [ ] Backend-Server läuft (`npm run dev`)
- [ ] Database-Connection funktioniert
- [ ] Environment-Variablen gesetzt
- [ ] API-Dokumentation gelesen

### **Während der Entwicklung**
- [ ] TypeScript-Typen verwenden
- [ ] Error Handling implementieren
- [ ] Logging hinzufügen
- [ ] Input-Validation mit Zod

### **Nach der Entwicklung**
- [ ] API-Tests durchführen
- [ ] Logs überprüfen
- [ ] Performance testen
- [ ] Dokumentation aktualisieren

---

**Status**: ✅ BACKEND 90% ABGESCHLOSSEN
**Nächster Schritt**: Frontend-Integration
**Team**: Bereit für Frontend-Entwicklung
**Timestamp**: ${new Date().toISOString()}