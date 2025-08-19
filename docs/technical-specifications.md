# Technische Spezifikationen
## Event Manager Application

**Dokumentenversion:** 2.0 (Supabase-ready)  
**Erstellt am:** Dezember 2024  
**Status:** Vollständige technische Architektur für Supabase-Deployment  

---

## 🏗️ **Systemarchitektur**

### **High-Level-Architektur**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   PWA/Web App  │    │   Admin Panel   │
│   Mobile App    │    │   (Desktop)     │    │   (Dashboard)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (NestJS)      │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │   Redis Cache   │    │   MinIO Storage │
│   PostgreSQL    │    │   (Sessions)    │    │   (Files)       │
│   + Auth        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Technologie-Stack**

#### **Frontend**
- **React Native** mit Expo für mobile Apps
- **TypeScript** für Typsicherheit
- **NativeWind** für konsistentes Styling
- **Zustand** für State Management
- **React Query** für Server-State

#### **Backend**
- **NestJS** als API-Framework
- **Prisma** als ORM
- **Supabase** als Managed PostgreSQL + Auth
- **Redis** für Caching und Sessions
- **MinIO** für Dateispeicherung

#### **Infrastruktur**
- **Supabase Cloud** für Datenbank, Auth und Real-time
- **Docker** für lokale Entwicklung
- **GitHub Actions** für CI/CD
- **Vercel/Netlify** für Frontend-Deployment

---

## 🗄️ **Datenbankarchitektur**

### **Supabase PostgreSQL**
- **Managed Service** mit automatischen Backups
- **Row Level Security (RLS)** für Datenschutz
- **Real-time Subscriptions** für Live-Updates
- **Edge Functions** für Serverless-Logik
- **Automatische Skalierung** basierend auf Last

### **Datenbankschema**
```sql
-- Core Entities
users (id, email, passwordHash, role, isActive, ...)
roles (id, name, description, permissions)
permissions (id, name, resource, action)

-- Business Entities
projects (id, name, status, ownerId, budget, ...)
bom_items (id, projectId, name, type, quantity, cost, ...)
suppliers (id, name, email, rating, isActive, ...)
tasks (id, projectId, name, status, assigneeId, ...)
slots (id, projectId, name, type, dateFrom, dateTo, ...)
permits (id, projectId, name, status, requestorId, ...)

-- Relationship Tables
_role_to_user (roleId, userId)
_permission_to_role (permissionId, roleId)
_project_members (projectId, userId)
```

### **Indizierung & Performance**
- **Primary Keys** auf allen Tabellen
- **Composite Indices** für häufige Abfragen
- **Full-Text Search** für Projektnamen und Beschreibungen
- **Partitioning** für große Datentabellen (optional)
- **Supabase Query Optimizer** für automatische Performance-Optimierung

---

## 🔐 **Sicherheitsarchitektur**

### **Authentifizierung & Autorisierung**
- **Supabase Auth** mit JWT-Tokens
- **Row Level Security (RLS)** auf Datenbankebene
- **Rollenbasierte Zugriffskontrolle (RBAC)**
- **Multi-Faktor-Authentifizierung** (optional)
- **Session-Management** mit Redis

### **Datenschutz**
- **Verschlüsselte Kommunikation** (HTTPS/TLS)
- **Audit-Logging** für alle Datenbankoperationen
- **GDPR-konforme** Datenverarbeitung
- **Automatische Backups** mit Verschlüsselung

---

## 🚀 **API-Architektur**

### **NestJS-Module**
```
src/
├── auth/           # Supabase Auth Integration
├── users/          # Benutzerverwaltung
├── projects/       # Projektmanagement
├── bom/            # BOM-Management
├── suppliers/      # Lieferantenverwaltung
├── tasks/          # Aufgabenverwaltung
├── slots/          # Logistik-Planung
├── permits/        # Genehmigungsprozesse
├── files/          # Dateiverwaltung
├── health/         # Health Checks
└── common/         # Gemeinsame Services
```

### **API-Endpunkte**
- **RESTful Design** für alle Ressourcen
- **JWT-basierte Authentifizierung**
- **Rate Limiting** und Input-Validierung
- **Comprehensive Error Handling**
- **API-Versionierung** für Backward Compatibility

---

## 📱 **Frontend-Architektur**

### **React Native App**
- **Expo Framework** für Cross-Platform-Entwicklung
- **Offline-Funktionalität** mit lokaler Datenspeicherung
- **Push-Benachrichtigungen** für wichtige Updates
- **Responsive Design** für alle Bildschirmgrößen

### **Progressive Web App (PWA)**
- **Service Workers** für Offline-Support
- **Installation** als Desktop-App möglich
- **Synchronisation** mit mobilen Geräten
- **Real-time Updates** über Supabase Subscriptions

---

## 🔄 **Offline-Architektur**

### **Offline-Strategie**
- **Lokale Datenspeicherung** mit MMKV
- **Offline-Queue** für Änderungen
- **Automatische Synchronisation** bei Online-Verbindung
- **Konfliktlösung** bei Dateninkonsistenzen

### **Daten-Synchronisation**
- **Incremental Sync** für effiziente Updates
- **Conflict Resolution** mit Timestamp-basierter Logik
- **Batch-Processing** für große Datenmengen

---

## 🌐 **Deployment-Architektur**

### **Supabase Cloud**
- **Managed PostgreSQL** mit automatischen Backups
- **Real-time Subscriptions** für Live-Updates
- **Edge Functions** für Serverless-Logik
- **Automatische Skalierung** basierend auf Last

### **Lokale Entwicklung**
- **Docker Compose** für lokale Services
- **Redis & MinIO** für lokale Entwicklung
- **Einfacher Umgebungsumschalt** zwischen lokal und Supabase

### **CI/CD Pipeline**
- **GitHub Actions** für automatisierte Tests
- **Docker-Images** für konsistente Deployments
- **Environment-specific** Konfigurationen

---

## 📊 **Monitoring & Observability**

### **Health Checks**
- **Supabase Health Indicator** für Datenbankverbindung
- **Redis Health Check** für Cache-Status
- **MinIO Health Check** für Storage-Status
- **API Endpoint Health** für Service-Status

### **Logging & Tracing**
- **Structured Logging** mit Winston
- **Request Tracing** mit Correlation IDs
- **Error Tracking** mit Sentry (optional)
- **Performance Monitoring** mit APM-Tools

---

## 🔧 **Entwicklungsumgebung**

### **Lokale Setup**
```bash
# Supabase-Projekt einrichten
cp apps/api/env.supabase.example apps/api/.env

# Lokale Services starten
docker-compose -f docker-compose.supabase.yml up -d

# Datenbank einrichten
cd apps/api
npm run db:generate
npm run db:push
npm run db:seed
```

### **Umgebungsumschalt**
```bash
# Lokale Entwicklung
cp env.example .env

# Supabase-Produktion
cp env.supabase.example .env
```

---

## 📈 **Skalierbarkeit**

### **Horizontale Skalierung**
- **API-Instanzen** können horizontal skaliert werden
- **Load Balancer** für Traffic-Verteilung
- **Stateless Design** für einfache Skalierung

### **Datenbank-Skalierung**
- **Supabase Auto-Scaling** basierend auf Last
- **Read-Replicas** für Lese-intensive Operationen
- **Connection Pooling** für optimale Performance

---

## 🔒 **Compliance & Governance**

### **Datenverwaltung**
- **Audit-Logging** für alle Änderungen
- **Data Retention Policies** für Compliance
- **Backup-Strategien** mit Verschlüsselung
- **Disaster Recovery** Plan

### **Sicherheitsrichtlinien**
- **Regelmäßige Security Audits**
- **Vulnerability Scanning** in CI/CD
- **Dependency Updates** für Security-Patches
- **Penetration Testing** (optional)

---

## 📚 **Entwicklungsrichtlinien**

### **Code-Qualität**
- **TypeScript** für alle neuen Dateien
- **ESLint** und **Prettier** für Code-Formatierung
- **Unit Tests** mit Jest
- **Integration Tests** für API-Endpunkte

### **Dokumentation**
- **API-Dokumentation** mit OpenAPI/Swagger
- **Code-Kommentare** für komplexe Logik
- **Architecture Decision Records (ADRs)**
- **Setup-Anleitungen** für Entwickler

---

## 🎯 **Nächste Schritte**

### **Sofort (Priorität 1)**
1. **Supabase-Projekt einrichten** und konfigurieren
2. **Datenbank-Schema** mit Migration deployen
3. **Basis-API** mit Authentifizierung implementieren
4. **Core-Entitäten** (Users, Projects, BOM) entwickeln

### **Kurzfristig (Priorität 2)**
1. **Frontend-Prototyp** mit React Native
2. **Lieferantenmanagement** implementieren
3. **Aufgabenverwaltung** mit Workflows
4. **Genehmigungsprozesse** entwickeln

---

## 🔗 **Verwandte Dokumente**

- **Supabase Setup**: [SUPABASE_SETUP.md](../SUPABASE_SETUP.md)
- **Datenbank-Modell**: [database-model.md](database-model.md)
- **Anforderungen**: [requirements.md](requirements.md)
- **Anforderungen-Zusammenfassung**: [requirements-summary.md](requirements-summary.md)

---

**Status**: ✅ Vollständig aktualisiert für Supabase-Migration  
**Letzte Aktualisierung**: Dezember 2024  
**Version**: 2.0 (Supabase-ready)
