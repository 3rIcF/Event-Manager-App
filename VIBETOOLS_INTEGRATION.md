# VibeTools Integration Guide

Dieser Guide erklärt, wie Sie VibeTools in Ihr Elementaro Event Planner Projekt integrieren und verwenden können.

## 🎯 Was ist VibeTools?

VibeTools ist ein mächtiges CLI-Tool, das Ihren Cursor AI Agent mit erweiterten Fähigkeiten ausstattet. Es basiert auf dem [VibeTools-Projekt](https://github.com/eastlondoner/vibe-tools) von eastlondoner und wurde speziell für das Elementaro Event Planner Projekt angepasst.

## 🚀 Schnellstart

### 1. Dependencies installieren

```bash
# Im Root-Verzeichnis des Projekts
pnpm install
```

### 2. VibeTools bauen

```bash
cd packages/vibetools
pnpm install
pnpm run build
```

### 3. VibeTools für Cursor installieren

```bash
# Zurück zum Root-Verzeichnis
cd ../..
pnpm run vibetools:install
```

## 📋 Verfügbare Befehle

### Root-Level Scripts

Das Projekt bietet verschiedene npm-Scripts für VibeTools:

```bash
# VibeTools installieren
pnpm run vibetools:install

# Code analysieren
pnpm run vibetools:analyze

# Projekt-Gesundheit prüfen
pnpm run vibetools:health

# Code generieren
pnpm run vibetools:generate

# Tests ausführen
pnpm run vibetools:test

# Sicherheit scannen
pnpm run vibetools:security

# Performance analysieren
pnpm run vibetools:performance
```

### Direkte CLI-Verwendung

Sie können VibeTools auch direkt verwenden:

```bash
# Im packages/vibetools Verzeichnis
cd packages/vibetools
pnpm run build
node dist/cli.js --help

# Oder über den globalen Befehl (nach Installation)
vibetools --help
```

## 🔧 Konfiguration

### Automatische Konfiguration

Beim Ausführen von `vibetools install` werden automatisch folgende Dateien erstellt:

- `.vibetools/` - VibeTools-Konfigurationsverzeichnis
- `.cursorrules` - Cursor-spezifische Regeln
- `.cursor/rules/vibe-tools.mdc` - Erweiterte Cursor-Regeln
- `.vibetoolsrc` - Projekt-spezifische Konfiguration

### Manuelle Konfiguration

Sie können die Konfiguration manuell anpassen:

```bash
# Log-Level auf Debug setzen
pnpm run vibetools -- config -s logLevel=debug

# Alle Konfigurationen anzeigen
pnpm run vibetools -- config -l

# Konfiguration zurücksetzen
pnpm run vibetools -- config -r
```

## 🎭 Unterstützte Entwicklungsumgebungen

VibeTools unterstützt verschiedene Entwicklungsumgebungen:

### Cursor (Standard)
- Erweiterte AI-Agent-Fähigkeiten
- Automatisierte Code-Review
- Intelligente Refactoring-Vorschläge

### Andere Umgebungen
- Claude
- Codex
- Windsurf
- Cline
- Roo

Installation für andere Umgebungen:

```bash
pnpm run vibetools -- install -e claude
pnpm run vibetools -- install -e codex
pnpm run vibetools -- install -e windsurf
pnpm run vibetools -- install -e cline
pnpm run vibetools -- install -e roo
```

## 📊 Verwendung

### Code-Analyse

```bash
# Grundlegende Code-Analyse
pnpm run vibetools:analyze

# Mit Ausgabe-Datei
pnpm run vibetools:analyze -- -o code-analysis.md

# Mit spezifischem Format
pnpm run vibetools:analyze -- -o report.json -f json
```

### Projekt-Gesundheit

```bash
# Übersicht
pnpm run vibetools:health

# Detailliert
pnpm run vibetools:health -- -d
```

### Code-Generierung

```bash
# React-Komponente
pnpm run vibetools:generate -- -t component -n UserProfile

# Service-Klasse
pnpm run vibetools:generate -- -t service -n UserService

# Test-Datei
pnpm run vibetools:generate -- -t test -n UserService

# Dokumentation
pnpm run vibetools:generate -- -t docs -n UserAPI
```

### Tests

```bash
# Tests ausführen
pnpm run vibetools:test

# Mit Coverage
pnpm run vibetools:test -- -c

# Im Watch-Modus
pnpm run vibetools:test -- -w
```

### Sicherheit

```bash
# Dependencies scannen
pnpm run vibetools:security -- -d

# Code scannen
pnpm run vibetools:security -- -c

# Mit Ausgabe-Datei
pnpm run vibetools:security -- -d -c -o security-report.md
```

### Performance

```bash
# Build-Performance
pnpm run vibetools:performance -- -b

# Runtime-Performance
pnpm run vibetools:performance -- -r

# Mit Ausgabe-Datei
pnpm run vibetools:performance -- -b -r -o performance-report.md
```

## 🔌 CI/CD Integration

### GitHub Actions

```yaml
name: VibeTools Analysis

on: [push, pull_request]

jobs:
  vibetools:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build VibeTools
        run: cd packages/vibetools && pnpm run build
        
      - name: Run Code Analysis
        run: pnpm run vibetools:analyze -- -o analysis-report.md
        
      - name: Run Security Scan
        run: pnpm run vibetools:security -- -d -c -o security-report.md
        
      - name: Check Project Health
        run: pnpm run vibetools:health -- -o health-report.md
        
      - name: Upload Reports
        uses: actions/upload-artifact@v3
        with:
          name: vibetools-reports
          path: |
            analysis-report.md
            security-report.md
            health-report.md
```

### Lokale Automatisierung

Erstellen Sie ein Script für regelmäßige Überprüfungen:

```bash
#!/bin/bash
# scripts/vibetools-daily.sh

DATE=$(date +%Y%m%d)
PROJECT_ROOT=$(pwd)

echo "Running VibeTools daily analysis for $DATE..."

# Code-Analyse
pnpm run vibetools:analyze -- -o "reports/code-analysis-$DATE.md"

# Sicherheits-Scan
pnpm run vibetools:security -- -d -c -o "reports/security-$DATE.md"

# Projekt-Gesundheit
pnpm run vibetools:health -- -o "reports/health-$DATE.md"

# Performance-Analyse
pnpm run vibetools:performance -- -b -r -o "reports/performance-$DATE.md"

echo "Daily analysis completed. Reports saved to reports/ directory."
```

## 🐛 Fehlerbehebung

### Häufige Probleme

1. **Build-Fehler**
   ```bash
   cd packages/vibetools
   pnpm install
   pnpm run build
   ```

2. **Fehlende Dependencies**
   ```bash
   # Im Root-Verzeichnis
   pnpm install
   
   # Im VibeTools-Verzeichnis
   cd packages/vibetools
   pnpm install
   ```

3. **Konfigurationsprobleme**
   ```bash
   # Konfiguration zurücksetzen
   pnpm run vibetools -- config -r
   
   # Neu installieren
   pnpm run vibetools:install
   ```

### Debug-Modus

```bash
# Log-Level auf Debug setzen
pnpm run vibetools -- config -s logLevel=debug

# Detaillierte Ausgabe
pnpm run vibetools:analyze -- -v
```

## 📈 Erweiterte Verwendung

### Benutzerdefinierte Regeln

Sie können die generierten Regeln anpassen:

```bash
# Regeln bearbeiten
nano .cursorrules
nano .cursor/rules/vibe-tools.mdc
```

### Integration mit anderen Tools

VibeTools kann mit anderen Entwicklungstools integriert werden:

- **ESLint**: Für Code-Qualität
- **Prettier**: Für Code-Formatierung
- **Husky**: Für Git-Hooks
- **Jest**: Für Tests

### Automatisierte Workflows

Erstellen Sie Workflows für verschiedene Szenarien:

```bash
# Pre-commit Hook
pnpm run vibetools:analyze -- -o pre-commit-analysis.md

# Pre-deployment Check
pnpm run vibetools:security -- -d -c -o pre-deploy-security.md
pnpm run vibetools:health -- -o pre-deploy-health.md

# Weekly Review
pnpm run vibetools:analyze -- -o weekly-analysis.md
pnpm run vibetools:performance -- -b -r -o weekly-performance.md
```

## 🔮 Zukünftige Entwicklungen

VibeTools wird kontinuierlich weiterentwickelt:

- **Erweiterte AI-Integration**: Bessere KI-gestützte Code-Analyse
- **Mehr Entwicklungsumgebungen**: Unterstützung für weitere IDEs
- **Performance-Optimierung**: Schnellere Analysen und Berichte
- **Erweiterte Berichte**: Mehr Details und Visualisierungen

## 📞 Support

Bei Fragen oder Problemen:

1. Überprüfen Sie die [VibeTools README](packages/vibetools/README.md)
2. Schauen Sie in die Projekt-Issues
3. Erstellen Sie ein neues Issue

---

**VibeTools** - AI-Powered Development Tools für das Elementaro Event Planner Projekt 🚀
