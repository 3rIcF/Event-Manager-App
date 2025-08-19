# Event Manager App - Projekt-Grundgesetz

## Tech Stack & Architekturprinzipien

### Backend (NestJS)
- **Framework**: NestJS mit TypeScript
- **Datenbank**: Prisma ORM mit PostgreSQL/Supabase
- **Authentifizierung**: JWT-basierte Auth mit Guards
- **API**: RESTful APIs mit OpenAPI/Swagger
- **Testing**: Jest mit E2E-Tests
- **Architektur**: Modular mit Feature-basierten Modulen

### Frontend (React/Expo)
- **Web**: React mit TypeScript, Tailwind CSS
- **Mobile**: Expo/React Native
- **State Management**: React Hooks + Context
- **UI Components**: Eigene Design System Komponenten
- **Testing**: React Testing Library

### DevOps & Infrastruktur
- **Container**: Docker mit docker-compose
- **CI/CD**: GitHub Actions (geplant)
- **Monitoring**: Logging und Error Tracking
- **Security**: Environment Variables, Input Validation

## Kritische Patterns & Architekturregeln

### 1. Datenmodell-Konsistenz
- Alle Entitäten müssen Prisma Schema folgen
- Referentielle Integrität durch Foreign Keys
- Soft Deletes für kritische Daten
- Audit Trails für wichtige Änderungen

### 2. API-Design
- RESTful Endpoints mit konsistenter Namensgebung
- DTOs für Input/Output Validation
- Error Handling mit standardisierten HTTP Codes
- Rate Limiting für öffentliche Endpoints

### 3. Sicherheitsstandards
- JWT Token Rotation
- Input Sanitization
- SQL Injection Prevention durch Prisma
- CORS Konfiguration
- Environment-basierte Secrets

### 4. Testing-Strategie
- Unit Tests für Services
- Integration Tests für Controller
- E2E Tests für kritische User Flows
- Coverage Minimum: 80%

## Projektziele & Prioritäten

### Phase 1: Core Infrastructure ✅
- [x] Grundlegende Projektstruktur
- [x] Datenbank-Schema
- [x] Basis-Authentifizierung
- [x] User Management

### Phase 2: Core Features 🚧
- [ ] Event Management System
- [ ] Task Management
- [ ] Kanban Boards
- [ ] File Management

### Phase 3: Advanced Features 📋
- [ ] Workflow Engine
- [ ] Reporting System
- [ ] Mobile App
- [ ] Real-time Updates

### Phase 4: Enterprise Features 📋
- [ ] Multi-tenancy
- [ ] Advanced Analytics
- [ ] API Rate Limiting
- [ ] Performance Monitoring

## Wichtige Regeln & Constraints

### Code-Qualität
- ESLint + Prettier für Konsistenz
- TypeScript strict mode
- Meaningful Commit Messages
- Feature Branches für neue Features

### Datenbank
- Keine direkten SQL Queries (nur Prisma)
- Migrations für Schema-Änderungen
- Seeds für Test-Daten
- Backup-Strategie implementieren

### Performance
- Lazy Loading für große Datasets
- Pagination für Listen
- Caching-Strategie für statische Daten
- Database Indexing für häufige Queries

### Sicherheit
- Regelmäßige Dependency Updates
- Security Audits vor Deployments
- Penetration Testing für kritische Features
- Compliance mit DSGVO

## Agenten-Rollen & Verantwortlichkeiten

### System Architect
- Technische Entscheidungen
- Architektur-Reviews
- Performance-Optimierung
- Tech Stack Updates

### Feature Developer
- Feature-Implementierung
- Unit Tests
- Code Reviews
- Bug Fixes

### Security Reviewer
- Security Audits
- Vulnerability Assessments
- Compliance Checks
- Security Best Practices

### Docs Writer
- API Dokumentation
- User Guides
- Architecture Docs
- Code Comments

### Context Specialist
- Legacy Code Analysis
- Pattern Recognition
- Technical Debt Assessment
- Migration Planning

## Qualitäts-Gates

### Pre-Development
- [ ] Feature Request validiert
- [ ] Architektur-Review bestanden
- [ ] Security Assessment durchgeführt
- [ ] Dependencies geprüft

### Development
- [ ] Code Standards eingehalten
- [ ] Unit Tests geschrieben
- [ ] Integration Tests bestanden
- [ ] Code Review abgeschlossen

### Pre-Deployment
- [ ] E2E Tests bestanden
- [ ] Security Review bestanden
- [ ] Performance Tests bestanden
- [ ] Documentation aktualisiert

### Post-Deployment
- [ ] Monitoring aktiviert
- [ ] Error Tracking konfiguriert
- [ ] User Feedback gesammelt
- [ ] Lessons Learned dokumentiert

## Notfall-Protokolle

### Critical Bug
1. Sofortige Benachrichtigung des System Architects
2. Hotfix Branch erstellen
3. Emergency Review durch Security Reviewer
4. Deploy nach bestandenem Review
5. Post-Mortem Analyse

### Security Incident
1. System sofort offline nehmen
2. Security Team benachrichtigen
3. Incident Response Plan aktivieren
4. Forensische Analyse
5. Kommunikation an Stakeholder

### Performance Issues
1. Monitoring-Daten analysieren
2. Bottlenecks identifizieren
3. Optimierungsplan erstellen
4. A/B Testing für Lösungen
5. Performance-Metriken tracken

---

*Dieses Dokument dient als "Verfassung" für alle KI-Agenten und Entwickler. Änderungen erfordern eine Überprüfung durch den System Architect.*
