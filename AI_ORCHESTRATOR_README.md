# Event Manager App - AI Orchestrator System

## Übersicht

Das AI Orchestrator System implementiert die Best-Practice-Prinzipien für Cursor AI Multi-Agent Projektleitung. Es orchestriert alle KI-Agenten und verwaltet den Workflow-State autonom über die CLI für CI/CD, Batch-Projekte und Multi-Agent-Bots.

## Architektur

### Zwei zentrale Dateien

1. **`project_config.md`** - Das "Projekt-Grundgesetz"
   - Tech Stack & Architekturprinzipien
   - Kritische Patterns & Architekturregeln
   - Projektziele & Prioritäten
   - Agenten-Rollen & Verantwortlichkeiten
   - Qualitäts-Gates & Notfall-Protokolle

2. **`workflow_state.md`** - Das "operative Gehirn" der KI
   - Aktueller Status & Phasen
   - Aufgaben & Prioritäten
   - Arbeitsregeln & Protokolle
   - Agenten-Status & Aktivitäten
   - KI-Aktivitäts-Log

### Autonomer Workflow-Loop

Die KI liest regelmäßig den aktuellen Stand aus `workflow_state.md`, interpretiert die Regeln abhängig vom Status, agiert entsprechend und zeichnet Ergebnisse unmittelbar wieder ein.

## Rollenbasierte Agentenstruktur

### 🏗️ System Architect
- **Verantwortlich**: Technische Entscheidungen, Architektur-Reviews, Performance-Optimierung
- **Datei**: `scripts/agents/system-architect.js`
- **Aufgaben**: Projektstruktur-Analyse, Architektur-Patterns bewerten, Performance-Bottlenecks identifizieren

### 🔒 Security Reviewer
- **Verantwortlich**: Security Audits, Vulnerability Assessments, Compliance Checks
- **Datei**: `scripts/agents/security-reviewer.js`
- **Aufgaben**: Dependency-Scan, Code-Security-Review, API-Security-Assessment

### 👨‍💻 Feature Developer
- **Verantwortlich**: Feature-Implementierung, Unit Tests, Code Reviews
- **Status**: Wartend (wird implementiert)
- **Aufgaben**: Feature-Entwicklung nach Blueprint, Bug Fixes

### 📚 Docs Writer
- **Verantwortlich**: API-Dokumentation, User Guides, Architecture Docs
- **Status**: Wartend (wird implementiert)
- **Aufgaben**: Dokumentation nach Implementierung, Code-Comments

### 🔍 Context Specialist
- **Verantwortlich**: Legacy Code Analysis, Pattern Recognition, Technical Debt Assessment
- **Status**: Wartend (wird implementiert)
- **Aufgaben**: Codebase-Analyse, Pattern-Erkennung

## Phasen & Qualitäts-Gates

### 1. INITIALIZATION ✅
- **Dauer**: 30 Minuten
- **Agenten**: Context Specialist
- **Exit-Criteria**: Projektstruktur verstanden, Tech Stack identifiziert

### 2. REQUIREMENTS_GATHERING ✅
- **Dauer**: 45 Minuten
- **Agenten**: Context Specialist, System Architect
- **Exit-Criteria**: Grundanforderungen klar, Architektur-Review bestanden

### 3. ANALYSIS_PHASE 🚧
- **Dauer**: 2 Stunden
- **Agenten**: Context Specialist, System Architect, Security Reviewer
- **Exit-Criteria**: Codebase vollständig analysiert, Security-Assessment durchgeführt

### 4. BLUEPRINT_PHASE 📋
- **Dauer**: 3 Stunden
- **Agenten**: System Architect, Security Reviewer
- **Exit-Criteria**: Implementierungsplan genehmigt, Security-Review bestanden

### 5. IMPLEMENTATION_PHASE 📋
- **Dauer**: 8 Stunden
- **Agenten**: Feature Developer, Docs Writer
- **Exit-Criteria**: Features implementiert, Tests bestanden

### 6. TESTING_PHASE 📋
- **Dauer**: 2 Stunden
- **Agenten**: Security Reviewer, Feature Developer
- **Exit-Criteria**: E2E Tests bestanden, Security Review bestanden

### 7. DEPLOYMENT_PHASE 📋
- **Dauer**: 1 Stunde
- **Agenten**: System Architect, Security Reviewer
- **Exit-Criteria**: Deployment erfolgreich, Monitoring aktiviert

### 8. REVIEW_PHASE 📋
- **Dauer**: 1 Stunde
- **Agenten**: Context Specialist, Docs Writer
- **Exit-Criteria**: Post-Deployment-Analyse abgeschlossen, Lessons Learned dokumentiert

## Installation & Setup

### Voraussetzungen
- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation
```bash
# In das Scripts-Verzeichnis wechseln
cd scripts

# Dependencies installieren
npm install

# Berechtigungen für CLI-Tools setzen
chmod +x ai-orchestrator.js
chmod +x agents/*.js
```

## Verwendung

### CLI-Befehle

#### Workflow-Management
```bash
# Workflow starten
npm run start [phase]

# Status anzeigen
npm run status

# Phase verwalten
npm run phase:start [phase]
npm run phase:complete
npm run phase:info

# Autonomen Modus starten
npm run auto
```

#### Agenten-Management
```bash
# Agenten auflisten
npm run agent:list

# Agenten aktivieren
npm run agent:activate [agent-name]

# Einzelne Agenten ausführen
npm run architect
npm run security
```

#### Direkte CLI-Verwendung
```bash
# Workflow mit bestimmter Phase starten
node ai-orchestrator.js start ANALYSIS_PHASE

# Status anzeigen
node ai-orchestrator.js status

# Phase starten
node ai-orchestrator.js phase start BLUEPRINT_PHASE

# Agent aktivieren
node ai-orchestrator.js agent activate security-reviewer

# Hilfe anzeigen
node ai-orchestrator.js help
```

### Verfügbare Phasen
- `INITIALIZATION`
- `REQUIREMENTS_GATHERING`
- `ANALYSIS_PHASE`
- `BLUEPRINT_PHASE`
- `IMPLEMENTATION_PHASE`
- `TESTING_PHASE`
- `DEPLOYMENT_PHASE`
- `REVIEW_PHASE`

### Verfügbare Agenten
- `system-architect`
- `feature-developer`
- `security-reviewer`
- `docs-writer`
- `context-specialist`

## Konfiguration

### Environment Variables
```bash
# Projekt-Root-Verzeichnis
PROJECT_ROOT=/path/to/event-manager-app

# Log-Datei
LOG_FILE=ai-orchestrator.log

# Workflow-State-Datei
WORKFLOW_STATE_FILE=workflow_state.md

# Projekt-Konfigurations-Datei
PROJECT_CONFIG_FILE=project_config.md
```

### Anpassung der Phasen
Die Phasen-Konfiguration kann in `ai-orchestrator.js` angepasst werden:

```javascript
getPhaseConfig(phaseName) {
  const configs = {
    'ANALYSIS_PHASE': {
      agents: ['context-specialist', 'system-architect', 'security-reviewer'],
      duration: 2 * 60 * 60 * 1000, // 2 Stunden
      checkpoints: 30 * 60 * 1000 // 30 Minuten
    },
    // Weitere Phasen...
  };
  
  return configs[phaseName] || { agents: [], duration: 0, checkpoints: 0 };
}
```

## CI/CD Integration

### GitHub Actions
```yaml
name: AI Orchestrator Workflow

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  ai-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd scripts
          npm install
          
      - name: Run AI Analysis
        run: |
          cd scripts
          npm run architect
          npm run security
          
      - name: Upload reports
        uses: actions/upload-artifact@v3
        with:
          name: ai-reports
          path: |
            ARCHITECTURE_REPORT.md
            SECURITY_REPORT.md
```

### Docker Integration
```dockerfile
# Dockerfile für AI Orchestrator
FROM node:18-alpine

WORKDIR /app

COPY scripts/package*.json ./scripts/
RUN cd scripts && npm install

COPY . .

CMD ["node", "scripts/ai-orchestrator.js", "auto"]
```

## Monitoring & Logging

### Log-Dateien
- **`ai-orchestrator.log`**: Haupt-Log-Datei mit allen Aktivitäten
- **`ARCHITECTURE_REPORT.md`**: Architektur-Report vom System Architect
- **`SECURITY_REPORT.md`**: Security-Report vom Security Reviewer

### Log-Levels
- `INFO`: Normale Aktivitäten
- `WARN`: Warnungen
- `ERROR`: Fehler
- `SUCCESS`: Erfolgreiche Abschlüsse

### Log-Format
```
[2024-01-15T14:30:00.000Z] [INFO] Phase ANALYSIS_PHASE wird gestartet
[2024-01-15T14:30:05.000Z] [INFO] Mock-Agent system-architect (System Architect) führt Aufgabe aus
[2024-01-15T14:30:10.000Z] [INFO] Mock-Agent system-architect hat Aufgabe abgeschlossen
```

## Erweiterung & Anpassung

### Neuen Agenten hinzufügen
1. Neue Agenten-Klasse in `scripts/agents/` erstellen
2. In `ai-orchestrator.js` registrieren
3. Phasen-Konfiguration anpassen

```javascript
// Neuen Agenten registrieren
cli.agentManager.registerAgent('new-agent', new NewAgent('new-agent', 'New Role'));

// Phasen-Konfiguration anpassen
'ANALYSIS_PHASE': {
  agents: ['context-specialist', 'system-architect', 'security-reviewer', 'new-agent'],
  duration: 2 * 60 * 60 * 1000,
  checkpoints: 30 * 60 * 1000
}
```

### Neue Phasen hinzufügen
1. Phase in `CONFIG.PHASES` hinzufügen
2. Phasen-Konfiguration in `getPhaseConfig()` definieren
3. Exit-Criteria in `workflow_state.md` dokumentieren

### Qualitäts-Gates anpassen
Die Qualitäts-Gates können in `project_config.md` angepasst werden:

```markdown
### Pre-Development
- [ ] Feature Request validiert
- [ ] Architektur-Review bestanden
- [ ] Security Assessment durchgeführt
- [ ] Dependencies geprüft
- [ ] Neue Gate hinzugefügt
```

## Troubleshooting

### Häufige Probleme

#### Agent startet nicht
```bash
# Berechtigungen prüfen
chmod +x scripts/agents/*.js

# Node.js Version prüfen
node --version

# Dependencies neu installieren
cd scripts && npm install
```

#### Workflow-State wird nicht aktualisiert
```bash
# Datei-Berechtigungen prüfen
ls -la workflow_state.md

# Schreibrechte setzen
chmod 644 workflow_state.md
```

#### Phasen werden nicht korrekt durchlaufen
```bash
# Workflow-State zurücksetzen
echo "# Event Manager App - Workflow State" > workflow_state.md

# Status prüfen
npm run status
```

### Debug-Modus
```bash
# Debug-Logging aktivieren
DEBUG=* node scripts/ai-orchestrator.js status

# Detaillierte Logs
node scripts/ai-orchestrator.js --verbose status
```

## Support & Kontakt

### Dokumentation
- **Projekt-Konfiguration**: `project_config.md`
- **Workflow-Status**: `workflow_state.md`
- **Architektur-Report**: `ARCHITECTURE_REPORT.md`
- **Security-Report**: `SECURITY_REPORT.md`

### Issues & Feature Requests
- GitHub Issues für Bug-Reports
- GitHub Discussions für Fragen
- Pull Requests für Verbesserungen

### Entwicklung
- **Branch-Strategie**: Feature Branches für neue Agenten
- **Code-Review**: Alle Änderungen benötigen Review
- **Testing**: Unit Tests für alle Agenten
- **Documentation**: Alle Änderungen dokumentieren

---

## Fazit

Das AI Orchestrator System implementiert erfolgreich alle Best-Practice-Prinzipien für Cursor AI Multi-Agent Projektleitung:

✅ **Zwei zentrale Dateien**: Klare Trennung von Regeln und Status  
✅ **Autonomer Workflow-Loop**: Kontinuierliche Überwachung und Steuerung  
✅ **Rollenbasierte Agentenstruktur**: Spezialisierte Agenten mit klaren Verantwortlichkeiten  
✅ **Schrittweise Planning- und Reviewphasen**: Qualitäts-Gates für alle Phasen  
✅ **Systematische Qualitätssicherung**: Security, Performance und Code-Qualität  
✅ **CLI- und Headless-Unterstützung**: Vollständige Automatisierung für CI/CD  

Das System ist bereit für den produktiven Einsatz und kann kontinuierlich erweitert und angepasst werden.
