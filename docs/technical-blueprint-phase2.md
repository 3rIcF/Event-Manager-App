# Technischer Blueprint - Phase 2 Event Manager App

## 📋 **Übersicht**
- **Phase**: BLUEPRINT_PHASE
- **Status**: In Bearbeitung
- **Erstellt**: 19.8.2025, 03:00:00
- **System Architect**: AI Assistant
- **Scope**: 7 User Stories für Event Management, Task Management und Kanban Board System

## 🎯 **User Stories & Technische Anforderungen**

### 1. Event Management System

#### User Story 1: Event-Erstellung und -Verwaltung
**Akzeptanzkriterien:**
- Benutzer kann Events mit Titel, Beschreibung, Datum, Ort erstellen
- Events können bearbeitet und gelöscht werden
- Event-Status (Draft, Published, Cancelled, Completed)
- Kategorisierung und Tags
- Datei-Upload für Event-Materialien

**Technische Spezifikation:**
```typescript
// Event Entity
interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  status: EventStatus;
  category: string;
  tags: string[];
  maxParticipants: number;
  currentParticipants: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Event Service
class EventService {
  createEvent(eventData: CreateEventDto): Promise<Event>;
  updateEvent(id: string, eventData: UpdateEventDto): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  getEvent(id: string): Promise<Event>;
  listEvents(filters: EventFilters): Promise<Event[]>;
  changeEventStatus(id: string, status: EventStatus): Promise<Event>;
}
```

#### User Story 2: Event-Teilnehmer-Management
**Akzeptanzkriterien:**
- Benutzer können sich für Events anmelden/abmelden
- Warteliste für vollständige Events
- Teilnehmer-Status (Registered, Confirmed, Cancelled, NoShow)
- Teilnehmer-Profile und Präferenzen

**Technische Spezifikation:**
```typescript
// Event Participant Entity
interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  status: ParticipantStatus;
  registrationDate: Date;
  confirmationDate?: Date;
  cancellationDate?: Date;
  preferences: ParticipantPreferences;
  notes: string;
}

// Participant Service
class EventParticipantService {
  registerForEvent(eventId: string, userId: string): Promise<EventParticipant>;
  cancelRegistration(eventId: string, userId: string): Promise<void>;
  updateParticipantStatus(id: string, status: ParticipantStatus): Promise<EventParticipant>;
  getEventParticipants(eventId: string): Promise<EventParticipant[]>;
  getWaitingList(eventId: string): Promise<EventParticipant[]>;
}
```

#### User Story 3: Event-Kalender und -Zeitplanung
**Akzeptanzkriterien:**
- Kalenderansicht aller Events
- Wiederkehrende Events
- Konfliktprüfung bei Terminplanung
- Benachrichtigungen und Reminder

**Technische Spezifikation:**
```typescript
// Calendar Service
class EventCalendarService {
  getCalendarView(startDate: Date, endDate: Date, userId: string): Promise<CalendarEvent[]>;
  checkConflicts(eventId: string, startDate: Date, endDate: Date): Promise<Conflict[]>;
  createRecurringEvent(eventData: RecurringEventDto): Promise<Event[]>;
  sendReminders(eventId: string): Promise<void>;
  getUpcomingEvents(userId: string, days: number): Promise<Event[]>;
}
```

### 2. Task Management System

#### User Story 4: Task-Erstellung und -Zuweisung
**Akzeptanzkriterien:**
- Tasks können Events zugeordnet werden
- Prioritäten und Deadlines
- Zuweisung an Benutzer oder Teams
- Abhängigkeiten zwischen Tasks

**Technische Spezifikation:**
```typescript
// Task Entity
interface Task {
  id: string;
  title: string;
  description: string;
  eventId?: string;
  assignedTo: string[];
  priority: TaskPriority;
  deadline: Date;
  status: TaskStatus;
  dependencies: string[];
  estimatedHours: number;
  actualHours: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Task Service
class TaskService {
  createTask(taskData: CreateTaskDto): Promise<Task>;
  assignTask(taskId: string, userIds: string[]): Promise<Task>;
  updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task>;
  getTaskDependencies(taskId: string): Promise<Task[]>;
  getTasksByEvent(eventId: string): Promise<Task[]>;
  getTasksByUser(userId: string): Promise<Task[]>;
}
```

#### User Story 5: Task-Tracking und -Reporting
**Akzeptanzkriterien:**
- Fortschrittsverfolgung
- Zeitaufzeichnung
- Performance-Metriken
- Berichte und Dashboards

**Technische Spezifikation:**
```typescript
// Task Tracking Service
class TaskTrackingService {
  updateProgress(taskId: string, progress: number): Promise<Task>;
  logTime(taskId: string, hours: number, description: string): Promise<TimeLog>;
  getTaskMetrics(eventId: string): Promise<TaskMetrics>;
  generateReport(filters: ReportFilters): Promise<TaskReport>;
  getPerformanceAnalytics(userId: string, period: DateRange): Promise<PerformanceData>;
}
```

### 3. Kanban Board System

#### User Story 6: Kanban-Board für Event-Projekte
**Akzeptanzkriterien:**
- Drag & Drop Task-Management
- Spalten für verschiedene Task-Status
- Filterung und Suche
- Real-time Updates

**Technische Spezifikation:**
```typescript
// Kanban Board Entity
interface KanbanBoard {
  id: string;
  name: string;
  eventId?: string;
  columns: KanbanColumn[];
  settings: BoardSettings;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Kanban Column Entity
interface KanbanColumn {
  id: string;
  boardId: string;
  name: string;
  order: number;
  taskLimit?: number;
  color: string;
  tasks: KanbanTask[];
}

// Kanban Task Entity
interface KanbanTask {
  id: string;
  boardId: string;
  columnId: string;
  taskId: string;
  order: number;
  assignedTo: string[];
  priority: TaskPriority;
  tags: string[];
}

// Kanban Service
class KanbanService {
  createBoard(boardData: CreateBoardDto): Promise<KanbanBoard>;
  addColumn(boardId: string, columnData: CreateColumnDto): Promise<KanbanColumn>;
  moveTask(taskId: string, fromColumnId: string, toColumnId: string, order: number): Promise<void>;
  getBoard(boardId: string): Promise<KanbanBoard>;
  updateColumnOrder(boardId: string, columnOrders: ColumnOrder[]): Promise<void>;
}
```

#### User Story 7: Kanban-Board-Kollaboration
**Akzeptanzkriterien:**
- Echtzeit-Updates für alle Benutzer
- Kommentare und Diskussionen
- Benachrichtigungen bei Änderungen
- Versionshistorie

**Technische Spezifikation:**
```typescript
// Collaboration Service
class KanbanCollaborationService {
  subscribeToBoard(boardId: string, userId: string): Promise<void>;
  addComment(taskId: string, comment: CreateCommentDto): Promise<Comment>;
  notifyChanges(boardId: string, changeType: ChangeType, data: any): Promise<void>;
  getActivityLog(boardId: string): Promise<ActivityLog[]>;
  getCollaborators(boardId: string): Promise<User[]>;
}
```

## 🗄️ **Datenmodell-Erweiterungen**

### Neue Datenbank-Tabellen
```sql
-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  location VARCHAR(500),
  status VARCHAR(50) DEFAULT 'draft',
  category VARCHAR(100),
  tags TEXT[],
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Event Participants
CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'registered',
  registration_date TIMESTAMP DEFAULT NOW(),
  confirmation_date TIMESTAMP,
  cancellation_date TIMESTAMP,
  preferences JSONB,
  notes TEXT,
  UNIQUE(event_id, user_id)
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  assigned_to UUID[],
  priority VARCHAR(50) DEFAULT 'medium',
  deadline TIMESTAMP,
  status VARCHAR(50) DEFAULT 'todo',
  dependencies UUID[],
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Kanban Boards
CREATE TABLE kanban_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  columns JSONB,
  settings JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Time Logs
CREATE TABLE time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  hours DECIMAL(5,2) NOT NULL,
  description TEXT,
  logged_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 **API-Endpunkte**

### Event Management
```
POST   /api/events                    - Event erstellen
GET    /api/events                    - Events auflisten
GET    /api/events/:id                - Event abrufen
PUT    /api/events/:id                - Event aktualisieren
DELETE /api/events/:id                - Event löschen
POST   /api/events/:id/participants  - Teilnehmer registrieren
DELETE /api/events/:id/participants/:userId - Teilnehmer abmelden
GET    /api/events/:id/participants  - Teilnehmer auflisten
PUT    /api/events/:id/status        - Event-Status ändern
```

### Task Management
```
POST   /api/tasks                     - Task erstellen
GET    /api/tasks                     - Tasks auflisten
GET    /api/tasks/:id                 - Task abrufen
PUT    /api/tasks/:id                 - Task aktualisieren
DELETE /api/tasks/:id                 - Task löschen
POST   /api/tasks/:id/assign          - Task zuweisen
POST   /api/tasks/:id/time            - Zeit loggen
GET    /api/tasks/:id/metrics         - Task-Metriken
GET    /api/tasks/reports             - Berichte generieren
```

### Kanban Boards
```
POST   /api/kanban/boards             - Board erstellen
GET    /api/kanban/boards             - Boards auflisten
GET    /api/kanban/boards/:id         - Board abrufen
PUT    /api/kanban/boards/:id         - Board aktualisieren
DELETE /api/kanban/boards/:id         - Board löschen
POST   /api/kanban/boards/:id/columns - Spalte hinzufügen
PUT    /api/kanban/boards/:id/columns - Spalten-Reihenfolge ändern
POST   /api/kanban/tasks/:id/move     - Task verschieben
POST   /api/kanban/tasks/:id/comments - Kommentar hinzufügen
```

## 🔒 **Sicherheitsanforderungen**

### Authentifizierung & Autorisierung
- JWT-basierte Authentifizierung für alle API-Endpunkte
- Role-based Access Control (RBAC) für Event- und Task-Management
- Event-Besitzer haben volle Kontrolle über ihre Events
- Task-Zuweisungen erfordern entsprechende Berechtigungen

### Datenvalidierung
- Input-Validierung für alle Benutzer-Eingaben
- SQL-Injection-Schutz durch Parameterized Queries
- XSS-Schutz für alle Text-Eingaben
- Rate-Limiting für API-Endpunkte

### Audit-Logging
- Alle CRUD-Operationen werden protokolliert
- Benutzer-Aktionen werden mit Zeitstempel und Benutzer-ID gespeichert
- Änderungshistorie für kritische Entitäten

## 🧪 **Test-Strategie**

### Unit Tests
- Alle Services haben 100% Test-Coverage
- Mock-Repository-Pattern für Datenbank-Tests
- Edge Cases und Fehlerszenarien abgedeckt
- Performance-Tests für kritische Operationen

### Integration Tests
- API-Endpunkt-Tests mit realen HTTP-Requests
- Datenbank-Integration mit Test-Datenbank
- Event-Sourcing und Real-time Updates getestet

### E2E Tests
- Vollständige User Journey Tests
- Cross-Browser Kompatibilität
- Mobile Responsiveness Tests

## 📊 **Performance-Anforderungen**

### Antwortzeiten
- API-Endpunkte: < 200ms (95. Perzentil)
- Datenbankabfragen: < 100ms
- Real-time Updates: < 50ms

### Skalierbarkeit
- Unterstützung für 1000+ gleichzeitige Benutzer
- Event-Driven Architecture für Real-time Updates
- Caching-Strategien für häufig abgerufene Daten

## 🚀 **Implementierungsplan**

### Phase 1: Core Entities (Woche 1-2)
- Datenbank-Schema implementieren
- Event, Task, Kanban Board Entities erstellen
- Basis-Services implementieren

### Phase 2: Business Logic (Woche 3-4)
- Event Management Services
- Task Management Services
- Kanban Board Services

### Phase 3: API & Frontend (Woche 5-6)
- REST API-Endpunkte
- Frontend-Komponenten
- Real-time Updates

### Phase 4: Testing & Optimierung (Woche 7-8)
- Umfassende Tests
- Performance-Optimierung
- Security-Audit

## 📝 **Nächste Schritte**

1. **Security Review**: Blueprint durch Security Reviewer prüfen lassen
2. **PO-Genehmigung**: Product Owner genehmigt technischen Blueprint
3. **Implementation Phase**: Feature Developer beginnt Implementierung
4. **Code Reviews**: Regelmäßige Code-Reviews während der Entwicklung
5. **Testing**: Kontinuierliche Tests während der Implementierung

---

*Erstellt von: System Architect (AI Assistant)*
*Datum: 2025-08-19T03:00:00Z*
*Status: Zur Review bereit*
