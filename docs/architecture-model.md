# Architektur-Modell
## Event Manager Application

**Dokumentenversion:** 2.0 (Supabase-ready)  
**Erstellt am:** Dezember 2024  
**Status:** Vollständige Systemarchitektur für Supabase-Deployment  

---

## 🏗️ **High-Level Systemarchitektur**

### **Übersichtsdiagramm**
```
┌─────────────────────────────────────────────────────────────────┐
│                    Event Manager System                        │
├─────────────────────────────────────────────────────────────────┤
│  Frontend Layer                    │  Backend Layer            │
│  • React Native Mobile App        │  • NestJS API Gateway     │
│  • Progressive Web App (PWA)      │  • Prisma ORM             │
│  • Admin Dashboard                │  • Supabase Integration   │
│  • Offline Support                │  • Redis Cache            │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌─────────────────┐
                    │   Supabase      │
                    │   Cloud Layer   │
                    │   • PostgreSQL  │
                    │   • Auth        │
                    │   • Real-time   │
                    │   • Edge Funcs  │
                    └─────────────────┘
```

### **Technologie-Stack**
- **Frontend**: React Native, Expo, TypeScript, NativeWind
- **Backend**: NestJS, Prisma, Supabase, Redis, MinIO
- **Infrastruktur**: Supabase Cloud, Docker, GitHub Actions
- **Monitoring**: Health Checks, Logging, Performance Tracking

---

## 🎯 **Detaillierte Architektur**

### **Frontend-Architektur**

#### **React Native Mobile App**
```
src/
├── components/          # Wiederverwendbare UI-Komponenten
├── screens/            # App-Bildschirme
├── navigation/         # Navigation und Routing
├── services/           # API-Services und Business Logic
├── store/              # Zustand State Management
├── utils/              # Hilfsfunktionen
└── types/              # TypeScript-Definitionen
```

#### **Progressive Web App (PWA)**
- **Service Workers** für Offline-Funktionalität
- **Real-time Updates** über Supabase Subscriptions
- **Responsive Design** für alle Bildschirmgrößen
- **Installation** als Desktop-App möglich

#### **Offline-Architektur**
```
Online Mode:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │───▶│   Backend   │───▶│  Supabase   │
└─────────────┘    └─────────────┘    └─────────────┘

Offline Mode:
┌─────────────┐    ┌─────────────┐
│   Frontend  │───▶│  Local DB   │
└─────────────┘    └─────────────┘

Sync Process:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Local DB   │───▶│  Sync API   │───▶│  Supabase   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### **Backend-Architektur**

#### **NestJS-Modulstruktur**
```
src/
├── auth/               # Supabase Auth Integration
├── users/              # Benutzerverwaltung
├── projects/           # Projektmanagement
├── bom/                # BOM-Management
├── suppliers/          # Lieferantenverwaltung
├── tasks/              # Aufgabenverwaltung
├── slots/              # Logistik-Planung
├── permits/            # Genehmigungsprozesse
├── files/              # Dateiverwaltung
├── health/             # Health Checks
└── common/             # Gemeinsame Services
```

#### **Service-Layer-Architektur**
```typescript
@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private auditService: AuditService,
    private supabaseService: SupabaseService
  ) {}

  async createProject(data: CreateProjectDto, userId: string) {
    // Business Logic
    // Audit Logging
    // Cache Invalidation
    // Supabase Integration
  }
}
```

### **Datenbank-Architektur**

#### **Supabase PostgreSQL**
- **Managed Service** mit automatischen Backups
- **Row Level Security (RLS)** für Datenschutz
- **Real-time Subscriptions** für Live-Updates
- **Edge Functions** für Serverless-Logik
- **Automatische Skalierung** basierend auf Last

#### **Datenbankschema-Struktur**
```
┌─────────────────────────────────────────────────────────────────┐
│                    Event Manager Database                      │
├─────────────────────────────────────────────────────────────────┤
│  Core Entities          │  Business Logic      │  Support      │
│  • Users               │  • Projects          │  • Files      │
│  • Roles               │  • BOM               │  • Logs       │
│  • Permissions         │  • Suppliers         │  • Audits     │
│  • Organizations       │  • Operations        │  • Reports    │
└─────────────────────────────────────────────────────────────────┘
```

#### **Indizierung & Performance**
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

### **RLS-Policies für Supabase**
```sql
-- RLS für Benutzer aktivieren
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

---

## 🚀 **Performance-Architektur**

### **Caching-Strategien**
- **Redis** für Session-Management
- **API-Response Caching** für statische Daten
- **Database Query Caching** für häufige Abfragen
- **CDN** für statische Assets

### **Datenbankoptimierung**
- **Connection Pooling** mit Prisma
- **Query Optimization** mit Indizes
- **Batch Operations** für Bulk-Updates
- **Read Replicas** für Skalierung (optional)

### **Frontend-Performance**
- **Lazy Loading** für große Komponenten
- **Virtual Scrolling** für lange Listen
- **Image Optimization** und Lazy Loading
- **Bundle Splitting** für kleinere Downloads

---

## 🔄 **Offline-Architektur**

### **Offline-First-Ansatz**
- **MMKV** für lokale Datenspeicherung
- **Offline-Queue** für API-Calls
- **Synchronisation** bei Wiederherstellung der Verbindung
- **Konflikt-Erkennung** bei Datenänderungen

### **Offline-Queue-System**
```typescript
interface OfflineAction {
  id: string;
  action: string;
  payload: any;
  timestamp: Date;
  synced: boolean;
  error?: string;
}
```

---

## 🌐 **Deployment-Architektur**

### **Supabase Cloud**
- **Managed PostgreSQL** mit automatischen Backups
- **Real-time Subscriptions** für Live-Updates
- **Edge Functions** für Serverless-Logik
- **Automatische Skalierung** basierend auf Last

### **Lokale Entwicklung**
```yaml
# docker-compose.supabase.yml
services:
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
  
  minio:
    image: minio/minio:latest
    ports: ["9000:9000", "9001:9001"]
```

### **CI/CD-Pipeline**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Deploy to Supabase
        run: npm run db:migrate:deploy
```

---

## 📊 **Monitoring & Observability**

### **Health Checks**
```typescript
@Controller('health')
export class HealthController {
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.supabaseHealthIndicator.isHealthy('supabase'),
      () => this.redisHealthIndicator.isHealthy('redis'),
      () => this.minioHealthIndicator.isHealthy('minio'),
    ]);
  }
}
```

### **Logging & Tracing**
- **Structured Logging** mit Winston
- **Request Tracing** mit Correlation IDs
- **Error Tracking** mit Sentry (optional)
- **Performance Monitoring** mit APM-Tools

### **Metriken & Dashboards**
- **API-Response-Zeiten**
- **Datenbank-Performance**
- **Fehlerraten und -typen**
- **Benutzeraktivität**

---

## 📈 **Skalierungsstrategien**

### **Horizontale Skalierung**
- **API-Instanzen** über Load Balancer
- **Datenbank-Read-Replicas** für Leseoperationen
- **Redis-Cluster** für verteiltes Caching
- **CDN** für globale Asset-Verteilung

### **Vertikale Skalierung**
- **Datenbank-Partitionierung** für große Tabellen
- **Connection Pooling** Optimierung
- **Query Performance** Tuning
- **Index-Optimierung**

---

## 🔒 **Compliance & Governance**

### **GDPR-Compliance**
- **Datenminimierung** und Zweckbindung
- **Recht auf Löschung** implementiert
- **Datenportabilität** mit Export-Funktionen
- **Audit-Logging** für alle Datenzugriffe

### **Sicherheitsstandards**
- **OWASP Top 10** Compliance
- **Regelmäßige Sicherheitsaudits**
- **Penetrationstests** vor Produktionsstart
- **Vulnerability Scanning** in CI/CD

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

## 🎯 **Nächste Schritte**

### **Sofort (Priorität 1)**
1. **Supabase-Projekt einrichten** und konfigurieren
2. **Datenbank-Schema** mit Migration deployen
3. **Basis-API** mit Authentifizierung implementieren
4. **Health Checks** und Monitoring einrichten

### **Kurzfristig (Priorität 2)**
1. **Frontend-Prototyp** mit React Native
2. **Offline-Funktionalität** implementieren
3. **Performance-Optimierung** durchführen
4. **Sicherheitsaudit** durchführen

### **Mittelfristig**
1. **Mobile App** für iOS/Android
2. **Advanced Monitoring** implementieren
3. **Auto-Scaling** konfigurieren
4. **Multi-Region** Deployment

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
**Nächste Review**: Januar 2025
