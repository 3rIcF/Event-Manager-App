# 📚 Event Manager API - Dokumentation

## 🚀 **API-Übersicht**

Die Event Manager API ist eine RESTful API, die alle Funktionalitäten für die Event-Management-Anwendung bereitstellt.

### **Base URL**
```
Development: http://localhost:3001/api/v1
Production: https://api.eventmanager.com/v1
```

### **Authentifizierung**
Die API verwendet JWT (JSON Web Tokens) für die Authentifizierung. Alle geschützten Endpoints erfordern einen gültigen Bearer Token im Authorization Header.

```bash
Authorization: Bearer <your-jwt-token>
```

## 🔐 **Authentication Endpoints**

### **POST /auth/register**
Registriert einen neuen Benutzer.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+49 123 456789",
  "timezone": "Europe/Berlin",
  "language": "de"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clr1234567890",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "isVerified": false,
      "role": {
        "name": "team_member",
        "permissions": {...}
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 86400,
      "tokenType": "Bearer"
    }
  },
  "message": "User registered successfully"
}
```

### **POST /auth/login**
Meldet einen Benutzer an.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "rememberMe": false
}
```

### **POST /auth/refresh**
Erneuert den Access Token mit einem Refresh Token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### **POST /auth/logout**
Meldet den Benutzer ab (invalidiert die aktuelle Session).

**Headers:** `Authorization: Bearer <token>`

### **GET /auth/profile**
Ruft das Profil des aktuellen Benutzers ab.

**Headers:** `Authorization: Bearer <token>`

---

## 📋 **Project Management Endpoints**

### **GET /projects**
Ruft Projekte mit Paginierung und Filtern ab.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Seitennummer (Standard: 1)
- `limit` (optional): Anzahl Einträge pro Seite (Standard: 20, Max: 100)
- `status` (optional): Projektstatus (PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED)
- `priority` (optional): Priorität (LOW, MEDIUM, HIGH, CRITICAL)
- `search` (optional): Suchbegriff für Name und Beschreibung

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "clr1234567890",
        "name": "Sommerfest 2024",
        "description": "Jährliches Sommerfest...",
        "status": "PLANNING",
        "priority": "HIGH",
        "startDate": "2024-06-15T00:00:00.000Z",
        "endDate": "2024-06-15T23:59:59.000Z",
        "budget": 50000.00,
        "actualCost": 0.00,
        "manager": {
          "id": "clr0987654321",
          "firstName": "Max",
          "lastName": "Mustermann",
          "email": "max@example.com"
        },
        "_count": {
          "tasks": 12,
          "bomItems": 25,
          "permits": 3
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### **POST /projects**
Erstellt ein neues Projekt.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Neues Event",
  "description": "Beschreibung des Events",
  "status": "PLANNING",
  "priority": "MEDIUM",
  "startDate": "2024-07-01T00:00:00.000Z",
  "endDate": "2024-07-01T23:59:59.000Z",
  "budget": 25000.00,
  "clientId": "clr1111111111",
  "tags": ["Event", "Sommer"],
  "metadata": {
    "venue": "Stadtpark",
    "expectedGuests": 150
  }
}
```

### **GET /projects/:id**
Ruft ein spezifisches Projekt ab.

### **PUT /projects/:id**
Aktualisiert ein Projekt.

### **DELETE /projects/:id**
Löscht ein Projekt.

### **GET /projects/:id/statistics**
Ruft Projektstatistiken ab.

---

## ✅ **Task Management Endpoints**

### **GET /tasks/my-tasks**
Ruft die dem aktuellen Benutzer zugewiesenen Aufgaben ab.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`, `limit`: Paginierung
- `status`: Aufgabenstatus (TODO, IN_PROGRESS, REVIEW, COMPLETED, CANCELLED)
- `priority`: Priorität
- `projectId`: Projekt-ID
- `overdue`: Nur überfällige Aufgaben (true/false)

### **GET /projects/:projectId/tasks**
Ruft Aufgaben für ein spezifisches Projekt ab.

### **POST /projects/:projectId/tasks**
Erstellt eine neue Aufgabe in einem Projekt.

**Request Body:**
```json
{
  "title": "Event-Konzept entwickeln",
  "description": "Detailliertes Konzept erstellen",
  "status": "TODO",
  "priority": "HIGH",
  "assignedTo": "clr0987654321",
  "dueDate": "2024-02-15T00:00:00.000Z",
  "estimatedHours": 16.0,
  "tags": ["Konzept", "Planung"]
}
```

### **GET /tasks/:id**
Ruft eine spezifische Aufgabe ab.

### **PUT /tasks/:id**
Aktualisiert eine Aufgabe.

### **DELETE /tasks/:id**
Löscht eine Aufgabe.

### **POST /tasks/:id/comments**
Fügt einen Kommentar zu einer Aufgabe hinzu.

---

## 🏭 **Supplier Management Endpoints**

### **GET /suppliers**
Ruft Lieferanten mit Paginierung und Filtern ab.

**Query Parameters:**
- `page`, `limit`: Paginierung
- `category`: Lieferantenkategorie
- `isActive`: Aktive Lieferanten (true/false)
- `rating`: Mindestbewertung
- `search`: Suchbegriff
- `specialties`: Spezialisierungen (kommagetrennt)

### **POST /suppliers**
Erstellt einen neuen Lieferanten.

**Request Body:**
```json
{
  "name": "Catering Plus GmbH",
  "contactPerson": "Anna Schmidt",
  "email": "info@catering-plus.de",
  "phone": "+49 123 456789",
  "website": "https://catering-plus.de",
  "category": "Catering",
  "specialties": ["Event-Catering", "Bio-Küche"],
  "certifications": ["ISO 9001", "HACCP"],
  "address": {
    "street": "Musterstraße 123",
    "city": "Musterstadt",
    "zipCode": "12345",
    "country": "Deutschland"
  }
}
```

### **GET /suppliers/search**
Sucht Lieferanten nach Kriterien.

### **GET /suppliers/recommendations**
Ruft Lieferantenempfehlungen ab.

**Query Parameters:**
- `category`: Kategorie (erforderlich)
- `quantity`: Menge (erforderlich)
- `location`: Standort (optional)

### **GET /suppliers/top**
Ruft Top-Lieferanten ab.

### **GET /suppliers/categories**
Ruft verfügbare Lieferantenkategorien ab.

---

## 🗂️ **BOM (Bill of Materials) Endpoints**

### **GET /projects/:projectId/bom**
Ruft BOM-Artikel für ein Projekt ab.

**Query Parameters:**
- `page`, `limit`: Paginierung
- `category`: Kategorie
- `status`: Status (PLANNED, ORDERED, DELIVERED, CANCELLED)
- `priority`: Priorität
- `supplierId`: Lieferanten-ID
- `parentId`: Übergeordneter Artikel (für Hierarchie)
- `search`: Suchbegriff

### **POST /projects/:projectId/bom**
Erstellt einen neuen BOM-Artikel.

**Request Body:**
```json
{
  "name": "Catering Service",
  "description": "Vollständiger Catering-Service für 200 Personen",
  "sku": "CAT-001",
  "category": "Catering",
  "quantity": 1.0,
  "unit": "Service",
  "unitPrice": 15000.00,
  "supplierId": "clr1111111111",
  "status": "PLANNED",
  "priority": "HIGH",
  "deliveryDate": "2024-06-14T00:00:00.000Z",
  "notes": "Vegetarische und vegane Optionen einschließen"
}
```

### **GET /projects/:projectId/bom/hierarchy**
Ruft die BOM-Hierarchie für ein Projekt ab.

### **GET /projects/:projectId/bom/statistics**
Ruft BOM-Statistiken für ein Projekt ab.

### **POST /projects/:projectId/bom/import**
Importiert BOM-Artikel aus CSV/Excel.

---

## 📁 **File Management Endpoints**

### **GET /files**
Ruft Dateien mit Paginierung und Filtern ab.

**Query Parameters:**
- `page`, `limit`: Paginierung
- `projectId`: Projekt-ID
- `category`: Dateikategorie
- `mimeType`: MIME-Typ
- `uploadedBy`: Hochgeladen von Benutzer-ID
- `isPublic`: Öffentliche Dateien (true/false)
- `search`: Suchbegriff
- `tags`: Tags (kommagetrennt)

### **POST /files/upload**
Lädt eine neue Datei hoch.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Datei (erforderlich)
- `projectId`: Projekt-ID (optional)
- `category`: Kategorie (optional)
- `tags`: Tags, kommagetrennt (optional)
- `isPublic`: Öffentlich (true/false, optional)
- `displayName`: Anzeigename (optional)

### **GET /files/:id**
Ruft Dateimetadaten ab.

### **GET /files/:id/download**
Lädt eine Datei herunter.

### **PUT /files/:id**
Aktualisiert Dateimetadaten.

### **DELETE /files/:id**
Löscht eine Datei.

### **POST /files/:id/versions**
Erstellt eine neue Dateiversion.

### **GET /files/statistics**
Ruft Dateistatistiken ab.

---

## 🔧 **Response Format**

Alle API-Antworten folgen einem einheitlichen Format:

### **Erfolgreiche Antwort:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "requestId": "req_1234567890"
}
```

### **Fehlerantwort:**
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Error description",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "requestId": "req_1234567890"
}
```

### **Paginierte Antwort:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## ⚠️ **Error Codes**

| Code | Description |
|------|-------------|
| `INVALID_CREDENTIALS` | Ungültige Anmeldedaten |
| `TOKEN_EXPIRED` | Token ist abgelaufen |
| `TOKEN_INVALID` | Ungültiger Token |
| `INSUFFICIENT_PERMISSIONS` | Unzureichende Berechtigungen |
| `USER_NOT_FOUND` | Benutzer nicht gefunden |
| `USER_ALREADY_EXISTS` | Benutzer existiert bereits |
| `VALIDATION_ERROR` | Validierungsfehler |
| `RESOURCE_NOT_FOUND` | Ressource nicht gefunden |
| `RESOURCE_CONFLICT` | Ressourcenkonflikt |
| `FILE_TOO_LARGE` | Datei zu groß |
| `INVALID_FILE_TYPE` | Ungültiger Dateityp |
| `RATE_LIMIT_EXCEEDED` | Rate Limit überschritten |
| `INTERNAL_ERROR` | Interner Serverfehler |

## 📊 **HTTP Status Codes**

- `200 OK`: Erfolgreiche Anfrage
- `201 Created`: Ressource erfolgreich erstellt
- `400 Bad Request`: Ungültige Anfrage
- `401 Unauthorized`: Authentifizierung erforderlich
- `403 Forbidden`: Zugriff verweigert
- `404 Not Found`: Ressource nicht gefunden
- `409 Conflict`: Ressourcenkonflikt
- `422 Unprocessable Entity`: Validierungsfehler
- `429 Too Many Requests`: Rate Limit überschritten
- `500 Internal Server Error`: Interner Serverfehler

## 🔒 **Sicherheit**

### **Rate Limiting**
- **Limit**: 100 Anfragen pro 15 Minuten pro IP
- **Header**: `X-RateLimit-Remaining` zeigt verbleibende Anfragen

### **CORS**
- **Allowed Origins**: Konfigurierbar über `CORS_ORIGIN`
- **Credentials**: Unterstützt
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS

### **Security Headers**
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

## 📈 **Performance**

### **Caching**
- **Browser Caching**: ETags für statische Ressourcen
- **API Caching**: Redis für häufige Anfragen (geplant)

### **Pagination**
- **Standard**: 20 Einträge pro Seite
- **Maximum**: 100 Einträge pro Seite
- **Cursor-based**: Für große Datensätze (geplant)

## 🧪 **Testing**

### **Health Check**
```bash
curl http://localhost:3001/health
```

### **API Health Check**
```bash
curl http://localhost:3001/api/v1/health
```

### **Authentication Test**
```bash
# Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPassword123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'

# Use token for protected endpoints
curl -X GET http://localhost:3001/api/v1/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📋 **Verfügbare Endpoints (Vollständige Liste)**

### **Authentication**
- `POST /auth/register` - Benutzer registrieren
- `POST /auth/login` - Benutzer anmelden
- `POST /auth/refresh` - Token erneuern
- `POST /auth/logout` - Abmelden
- `POST /auth/logout-all` - Von allen Geräten abmelden
- `PUT /auth/change-password` - Passwort ändern
- `GET /auth/profile` - Profil abrufen
- `GET /auth/sessions` - Sessions abrufen
- `DELETE /auth/sessions/:sessionId` - Session widerrufen

### **Projects**
- `GET /projects` - Projekte abrufen
- `POST /projects` - Projekt erstellen
- `GET /projects/:id` - Projekt abrufen
- `PUT /projects/:id` - Projekt aktualisieren
- `DELETE /projects/:id` - Projekt löschen
- `GET /projects/:id/statistics` - Projektstatistiken
- `POST /projects/:id/members` - Mitglied hinzufügen
- `DELETE /projects/:id/members/:memberId` - Mitglied entfernen

### **Tasks**
- `GET /tasks/my-tasks` - Meine Aufgaben
- `GET /projects/:projectId/tasks` - Projektaufgaben
- `POST /projects/:projectId/tasks` - Aufgabe erstellen
- `GET /tasks/:id` - Aufgabe abrufen
- `PUT /tasks/:id` - Aufgabe aktualisieren
- `DELETE /tasks/:id` - Aufgabe löschen
- `POST /tasks/:id/comments` - Kommentar hinzufügen

### **Suppliers**
- `GET /suppliers` - Lieferanten abrufen
- `POST /suppliers` - Lieferant erstellen
- `GET /suppliers/search` - Lieferanten suchen
- `GET /suppliers/recommendations` - Empfehlungen
- `GET /suppliers/top` - Top-Lieferanten
- `GET /suppliers/categories` - Kategorien
- `GET /suppliers/:id` - Lieferant abrufen
- `PUT /suppliers/:id` - Lieferant aktualisieren
- `DELETE /suppliers/:id` - Lieferant löschen
- `GET /suppliers/:id/statistics` - Lieferantenstatistiken

### **BOM (Bill of Materials)**
- `GET /projects/:projectId/bom` - BOM-Artikel abrufen
- `POST /projects/:projectId/bom` - BOM-Artikel erstellen
- `GET /projects/:projectId/bom/hierarchy` - BOM-Hierarchie
- `GET /projects/:projectId/bom/statistics` - BOM-Statistiken
- `POST /projects/:projectId/bom/import` - BOM importieren
- `GET /bom/:id` - BOM-Artikel abrufen
- `PUT /bom/:id` - BOM-Artikel aktualisieren
- `DELETE /bom/:id` - BOM-Artikel löschen

### **Files**
- `GET /files` - Dateien abrufen
- `POST /files/upload` - Datei hochladen
- `GET /files/statistics` - Dateistatistiken
- `GET /files/:id` - Datei-Metadaten abrufen
- `GET /files/:id/download` - Datei herunterladen
- `PUT /files/:id` - Datei-Metadaten aktualisieren
- `DELETE /files/:id` - Datei löschen
- `POST /files/:id/versions` - Neue Dateiversion

---

## 🚀 **Nächste Features (Geplant)**

### **Permits Management**
- Genehmigungsverwaltung
- Status-Tracking
- Dokumenten-Upload

### **Logistics Management**
- Logistikplanung
- Transport-Tracking
- Kostenmanagement

### **Reporting & Analytics**
- Projektberichte
- Performance-Analysen
- Export-Funktionen

### **Kanban Boards**
- Kanban-Board-Management
- Drag & Drop API
- Workflow-Automatisierung

---

*Dokumentation erstellt: ${new Date().toLocaleString('de-DE')}*
*API Version: 1.0.0*
*Status: ACTIVE - BACKEND_DEVELOPMENT*