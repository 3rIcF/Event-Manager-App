# Supabase Setup
## Event Manager Application

Diese Anleitung beschreibt, wie Sie die Event-Manager-Anwendung auf Supabase deployen.

## 🚀 Schnellstart

### 1. Supabase-Projekt erstellen
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Erstellen Sie ein neues Projekt
3. Notieren Sie sich die Projekt-Referenz und das Datenbank-Passwort

### 2. Umgebungsvariablen konfigurieren
```bash
# In apps/api/ eine .env-Datei erstellen
cp env.supabase.example .env

# Folgende Werte eintragen:
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

### 3. Datenbank einrichten
```bash
cd apps/api

# Abhängigkeiten installieren
npm install

# Prisma Client generieren
npm run db:generate

# Migration auf Supabase anwenden
npm run db:migrate:deploy

# Demo-Daten einfügen
npm run db:seed
```

## 📊 Supabase-Konfiguration

### Datenbank-URL Format
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Erforderliche Umgebungsvariablen
- `DATABASE_URL` - PostgreSQL-Verbindungsstring
- `SUPABASE_URL` - Supabase-Projekt-URL
- `SUPABASE_ANON_KEY` - Öffentlicher API-Schlüssel
- `SUPABASE_SERVICE_ROLE_KEY` - Service-Role-Schlüssel (für Admin-Operationen)

## 🔧 Datenbank-Migration

### 1. Migration erstellen
```bash
# Neue Migration erstellen (bei Schema-Änderungen)
npm run db:migrate

# Migration auf Supabase anwenden
npm run db:migrate:deploy
```

### 2. Schema direkt pushen (für Entwicklung)
```bash
# Schema direkt auf Supabase anwenden
npm run db:push
```

### 3. Prisma Studio öffnen
```bash
# Datenbank-GUI öffnen
npm run db:studio
```

## 🗄️ Supabase-spezifische Features

### Row Level Security (RLS)
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

### Supabase Auth Integration
```typescript
// auth/supabase-auth.service.ts
import { createClient } from '@supabase/supabase-js';

export class SupabaseAuthService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  async signUp(email: string, password: string, userData: any) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }
}
```

## 🚀 Deployment

### 1. Produktionsumgebung
```bash
# Build der Anwendung
npm run build

# Start der Produktionsanwendung
npm run start:prod
```

### 2. Umgebungsvariablen setzen
```bash
# Alle erforderlichen Umgebungsvariablen müssen gesetzt sein
DATABASE_URL="postgresql://postgres:[PROD-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[PROD-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[PROD-SERVICE-ROLE-KEY]"
JWT_SECRET="[STRONG-JWT-SECRET]"
NODE_ENV="production"
```

### 3. Health Checks
```typescript
// health/supabase-health.indicator.ts
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupabaseHealthIndicator extends HealthIndicator {
  constructor(private prisma: PrismaService) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      
      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, { message: error.message });
    }
  }
}
```

## 🔒 Sicherheit

### 1. RLS-Policies implementieren
```sql
-- Projekte: Nur Projektbesitzer und Mitglieder können zugreifen
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project access" ON projects
  FOR ALL USING (
    owner_id = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM _ProjectMembers 
      WHERE "A" = projects.id AND "B" = auth.uid()::text
    )
  );
```

### 2. API-Schlüssel schützen
- Service-Role-Schlüssel nur auf dem Server verwenden
- Anon-Key nur für öffentliche Endpunkte
- JWT-Secret stark und einzigartig wählen

### 3. CORS konfigurieren
```typescript
// main.ts
app.enableCors({
  origin: [
    'https://yourdomain.com',
    'https://app.yourdomain.com'
  ],
  credentials: true
});
```

## 📊 Monitoring

### 1. Supabase Dashboard
- Datenbank-Performance überwachen
- API-Nutzung verfolgen
- Fehler-Logs einsehen

### 2. Anwendungs-Monitoring
```typescript
// logging/supabase-logger.service.ts
export class SupabaseLoggerService {
  async logError(error: Error, context: string) {
    // Fehler in Supabase-Logs speichern
    await this.prisma.auditLog.create({
      data: {
        action: 'ERROR',
        resource: context,
        userId: 'system',
        newValues: { error: error.message, stack: error.stack }
      }
    });
  }
}
```

## 🐛 Fehlerbehebung

### Häufige Probleme

#### 1. Verbindungsfehler
```bash
# Datenbank-URL überprüfen
echo $DATABASE_URL

# Netzwerk-Konnektivität testen
telnet db.[PROJECT-REF].supabase.co 5432
```

#### 2. RLS-Fehler
```sql
-- RLS für Tabelle deaktivieren (nur für Debugging)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Policies überprüfen
SELECT * FROM pg_policies WHERE tablename = 'users';
```

#### 3. Migration-Fehler
```bash
# Migration zurücksetzen
npm run db:reset

# Schema neu pushen
npm run db:push
```

## 🔄 Lokale Entwicklung

### 1. Lokale Services starten
```bash
# Redis und MinIO lokal starten
docker-compose -f docker-compose.supabase.yml up -d

# Supabase lokal (optional)
npx supabase start
```

### 2. Umgebung umschalten
```bash
# Lokale Entwicklung
cp env.example .env

# Supabase-Produktion
cp env.supabase.example .env
```

## 📚 Weitere Ressourcen

- [Supabase Dokumentation](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

## 🤝 Support

Bei Problemen:
1. Supabase-Logs überprüfen
2. Datenbank-Verbindung testen
3. RLS-Policies überprüfen
4. Supabase-Community konsultieren

---

**Wichtig:** Alle Produktions-Passwörter und API-Schlüssel sicher aufbewahren und niemals in den Code committen!
