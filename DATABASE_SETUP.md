# Datenbank-Einrichtung
## Event Manager Application

Diese Anleitung beschreibt, wie Sie die Datenbank für die Event-Manager-Anwendung einrichten.

## 🚀 Schnellstart

### 1. Voraussetzungen
- Docker und Docker Compose installiert
- Node.js 18+ und npm installiert
- Git installiert

### 2. Datenbank starten
```bash
# Datenbank-Container starten
docker-compose up -d postgres redis minio

# Status überprüfen
docker-compose ps
```

### 3. Datenbank einrichten
```bash
# In das API-Verzeichnis wechseln
cd apps/api

# Abhängigkeiten installieren
npm install

# Prisma Client generieren
npm run db:generate

# Datenbank-Schema erstellen
npm run db:push

# Demo-Daten einfügen
npm run db:seed
```

## 📊 Datenbank-Zugriff

### PostgreSQL
- **Host:** localhost
- **Port:** 5432
- **Datenbank:** event_manager
- **Benutzer:** event_user
- **Passwort:** event_password

### Redis
- **Host:** localhost
- **Port:** 6379

### MinIO
- **Host:** localhost
- **Port:** 9000
- **Web Console:** http://localhost:9001
- **Benutzer:** minioadmin
- **Passwort:** minioadmin

### pgAdmin (Optional)
- **URL:** http://localhost:5050
- **E-Mail:** admin@elementaro.com
- **Passwort:** admin123

## 🔧 Nützliche Befehle

### Datenbank-Verwaltung
```bash
# Prisma Studio öffnen (Datenbank-GUI)
npm run db:studio

# Migration erstellen
npm run db:migrate

# Migrationen anwenden
npm run db:migrate:deploy

# Datenbank zurücksetzen
npm run db:reset
```

### Container-Verwaltung
```bash
# Alle Container starten
docker-compose up -d

# Container-Logs anzeigen
docker-compose logs -f postgres

# Container stoppen
docker-compose down

# Container und Daten löschen
docker-compose down -v
```

## 🗄️ Datenbank-Schema

Das Datenbank-Schema wird durch Prisma verwaltet und befindet sich in:
```
apps/api/prisma/schema.prisma
```

### Hauptentitäten:
- **Users** - Benutzer und Authentifizierung
- **Projects** - Event-Projekte
- **BOM Items** - Bill of Materials
- **Suppliers** - Lieferanten
- **Tasks** - Aufgaben und Workflows
- **Slots** - Logistik-Planung
- **Permits** - Genehmigungsprozesse

## 🌱 Demo-Daten

Nach dem Seeding sind folgende Demo-Daten verfügbar:

### Benutzer
- **Admin:** admin@elementaro.com / admin123
- **Organizer:** organizer@elementaro.com / organizer123

### Demo-Projekt
- **Name:** Demo Event 2024
- **Status:** PLANNING
- **BOM-Items:** 4 verschiedene Items (Bühne, PA-System, Kabel, Techniker)
- **Tasks:** 3 Beispielaufgaben
- **Slots:** Setup, Event und Teardown

## 🔒 Sicherheit

### Produktionsumgebung
- Ändern Sie alle Standard-Passwörter
- Verwenden Sie starke JWT-Secrets
- Aktivieren Sie SSL/TLS
- Konfigurieren Sie Firewall-Regeln

### Entwicklungsumgebung
- Alle Passwörter sind in der `.env`-Datei konfigurierbar
- Datenbank ist nur lokal verfügbar
- Keine externen Verbindungen

## 🐛 Fehlerbehebung

### Häufige Probleme

#### 1. Port bereits belegt
```bash
# Ports überprüfen
netstat -tulpn | grep :5432

# Container neu starten
docker-compose restart postgres
```

#### 2. Datenbank-Verbindung fehlgeschlagen
```bash
# Container-Status prüfen
docker-compose ps

# Logs anzeigen
docker-compose logs postgres

# Datenbank neu initialisieren
docker-compose down -v
docker-compose up -d postgres
```

#### 3. Prisma-Fehler
```bash
# Prisma Client neu generieren
npm run db:generate

# Datenbank-Schema aktualisieren
npm run db:push
```

## 📚 Weitere Ressourcen

- [Prisma Dokumentation](https://www.prisma.io/docs/)
- [PostgreSQL Dokumentation](https://www.postgresql.org/docs/)
- [Redis Dokumentation](https://redis.io/documentation)
- [MinIO Dokumentation](https://docs.min.io/)

## 🤝 Support

Bei Problemen:
1. Überprüfen Sie die Container-Logs
2. Stellen Sie sicher, dass alle Ports verfügbar sind
3. Überprüfen Sie die Umgebungsvariablen
4. Erstellen Sie ein Issue im Repository
