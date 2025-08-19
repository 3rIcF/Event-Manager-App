# VibeTools - AI-Powered Development Tools

VibeTools ist ein mächtiges CLI-Tool, das Ihren Cursor AI Agent mit erweiterten Fähigkeiten ausstattet und verschiedene Entwicklungsumgebungen unterstützt.

## 🚀 Features

- **AI-Powered Code Analysis** - Automatische Code-Qualitätsprüfung und -optimierung
- **Multi-Environment Support** - Unterstützung für Cursor, Claude, Codex, Windsurf, Cline und Roo
- **Security Scanning** - Automatische Sicherheitslücken-Erkennung
- **Performance Analysis** - Build- und Runtime-Performance-Optimierung
- **Code Generation** - Automatische Generierung von Komponenten, Services, Tests und Dokumentation
- **Project Health Monitoring** - Umfassende Projekt-Gesundheitsüberwachung
- **Test Automation** - Automatisierte Test-Ausführung und Coverage-Berichte

## 🛠️ Installation

### Globale Installation

```bash
npm install -g @elementaro/vibetools
```

### Lokale Installation (empfohlen für Projekte)

```bash
cd packages/vibetools
pnpm install
pnpm run build
```

## 🎯 Erste Schritte

### 1. VibeTools für Ihre Entwicklungsumgebung installieren

```bash
# Für Cursor (Standard)
vibetools install

# Für andere Umgebungen
vibetools install -e claude
vibetools install -e codex
vibetools install -e windsurf
vibetools install -e cline
vibetools install -e roo
```

### 2. Projekt-Gesundheit überprüfen

```bash
vibetools health
```

### 3. Code-Analyse durchführen

```bash
vibetools analyze -o report.md
```

## 📋 Verfügbare Befehle

### `vibetools install`
Installiert und konfiguriert VibeTools für Ihre Entwicklungsumgebung.

**Optionen:**
- `-e, --environment <env>` - Entwicklungsumgebung (cursor, claude, codex, windsurf, cline, roo)
- `-p, --project <path>` - Projekt-Root-Pfad

**Beispiel:**
```bash
vibetools install -e cursor -p /path/to/your/project
```

### `vibetools analyze`
Analysiert Code-Qualität und generiert Berichte.

**Optionen:**
- `-p, --project <path>` - Projekt-Root-Pfad
- `-o, --output <file>` - Ausgabe-Berichtsdatei
- `-f, --format <format>` - Ausgabeformat (markdown, json, html)

**Beispiel:**
```bash
vibetools analyze -o code-analysis.md -f markdown
```

### `vibetools health`
Überprüft die Gesamt-Projekt-Gesundheit und Metriken.

**Optionen:**
- `-p, --project <path>` - Projekt-Root-Pfad
- `-d, --detailed` - Detaillierte Gesundheitsinformationen anzeigen

**Beispiel:**
```bash
vibetools health -d
```

### `vibetools generate`
Generiert Code, Tests oder Dokumentation.

**Optionen:**
- `-t, --type <type>` - Generierungstyp (component, service, test, docs)
- `-n, --name <name>` - Name für das generierte Element
- `-p, --project <path>` - Projekt-Root-Pfad
- `-o, --output <path>` - Ausgabe-Verzeichnis

**Beispiel:**
```bash
vibetools generate -t component -n UserProfile
```

### `vibetools test`
Führt Tests aus und generiert Coverage-Berichte.

**Optionen:**
- `-p, --project <path>` - Projekt-Root-Pfad
- `-w, --watch` - Tests im Watch-Modus ausführen
- `-c, --coverage` - Coverage-Bericht generieren
- `-r, --reporter <reporter>` - Test-Reporter (spec, dot, nyan)

**Beispiel:**
```bash
vibetools test -c -r spec
```

### `vibetools security`
Führt Sicherheitslücken-Scans durch.

**Optionen:**
- `-p, --project <path>` - Projekt-Root-Pfad
- `-d, --dependencies` - Dependencies auf Schwachstellen scannen
- `-c, --code` - Code auf Sicherheitsprobleme scannen
- `-o, --output <file>` - Ausgabe-Berichtsdatei

**Beispiel:**
```bash
vibetools security -d -c -o security-report.md
```

### `vibetools performance`
Analysiert Anwendungs-Performance.

**Optionen:**
- `-p, --project <path>` - Projekt-Root-Pfad
- `-b, --build` - Build-Performance analysieren
- `-r, --runtime` - Runtime-Performance analysieren
- `-o, --output <file>` - Ausgabe-Berichtsdatei

**Beispiel:**
```bash
vibetools performance -b -r -o performance-report.md
```

### `vibetools config`
Verwaltet VibeTools-Konfiguration.

**Optionen:**
- `-s, --set <key=value>` - Konfigurationswert setzen
- `-g, --get <key>` - Konfigurationswert abrufen
- `-l, --list` - Alle Konfigurationen auflisten
- `-r, --reset` - Konfiguration auf Standardwerte zurücksetzen

**Beispiel:**
```bash
vibetools config -s logLevel=debug
vibetools config -l
```

### `vibetools update`
Aktualisiert VibeTools auf die neueste Version.

**Beispiel:**
```bash
vibetools update
```

## 🔧 Konfiguration

VibeTools wird automatisch konfiguriert, wenn Sie den `install`-Befehl ausführen. Die Konfiguration wird in folgenden Dateien gespeichert:

- **Cursor**: `.cursorrules` und `.cursor/rules/vibe-tools.mdc`
- **Claude**: `claude-config.md`
- **Codex**: `codex-config.md`
- **Windsurf**: `.windsurfrules`
- **Cline**: `.clinerules`
- **Roo**: `roo-config.md`

### Benutzerdefinierte Konfiguration

Sie können die VibeTools-Konfiguration anpassen:

```bash
# Log-Level auf Debug setzen
vibetools config -s logLevel=debug

# Projekt-Root-Pfad setzen
vibetools config -s projectRoot=/path/to/project

# Alle Konfigurationen anzeigen
vibetools config -l
```

## 🏗️ Unterstützte Entwicklungsumgebungen

### Cursor
- Erweiterte AI-Agent-Fähigkeiten
- Automatisierte Code-Review
- Intelligente Refactoring-Vorschläge
- Sicherheits- und Performance-Optimierung

### Claude
- AI-Assistenten-Konfiguration
- Erweiterte Code-Analyse
- Automatisierte Refactoring
- Sicherheits-Scanning

### Codex
- Intelligente Code-Generierung
- Automatisierte Refactoring
- Test-Generierung
- Dokumentations-Generierung

### Windsurf
- AI-Entwicklungsassistent
- Code-Analyse und -Vorschläge
- Automatisierte Tests
- Sicherheits-Scanning

### Cline
- AI-Code-Assistent
- Intelligente Code-Analyse
- Automatisierte Refactoring
- Sicherheits-Scanning

### Roo
- AI-Entwicklungstools
- Code-Analyse
- Automatisierte Tests
- Sicherheits-Scanning

## 📊 Berichte und Ausgaben

VibeTools generiert verschiedene Berichte:

### Code-Analyse-Bericht
- Datei-spezifische Probleme und Vorschläge
- Metriken (Komplexität, Wartbarkeit, Dokumentation, Performance)
- Gruppierung nach Schweregrad

### Projekt-Gesundheitsbericht
- Gesamt-Gesundheitsbewertung
- Kategorie-spezifische Scores
- Empfehlungen zur Verbesserung

### Sicherheitsbericht
- Abhängigkeits-Schwachstellen
- Code-Sicherheitsprobleme
- Schweregrad-Klassifizierung

### Performance-Bericht
- Build-Performance-Metriken
- Runtime-Performance-Analyse
- Optimierungsvorschläge

## 🔌 Integration mit CI/CD

VibeTools kann in Ihre CI/CD-Pipeline integriert werden:

```yaml
# GitHub Actions Beispiel
- name: Run VibeTools Analysis
  run: |
    npm install -g @elementaro/vibetools
    vibetools analyze -o analysis-report.md
    vibetools security -d -c -o security-report.md
    vibetools health -o health-report.md

- name: Upload Reports
  uses: actions/upload-artifact@v2
  with:
    name: vibetools-reports
    path: |
      analysis-report.md
      security-report.md
      health-report.md
```

## 🚀 Erweiterte Verwendung

### Automatisierte Code-Generierung

```bash
# React-Komponente generieren
vibetools generate -t component -n UserCard

# Service-Klasse generieren
vibetools generate -t service -n UserService

# Test-Datei generieren
vibetools generate -t test -n UserService

# Dokumentation generieren
vibetools generate -t docs -n UserAPI
```

### Kontinuierliche Überwachung

```bash
# Regelmäßige Gesundheitsprüfung
vibetools health -d > health-$(date +%Y%m%d).md

# Automatisierte Sicherheitsprüfung
vibetools security -d -c > security-$(date +%Y%m%d).md

# Performance-Monitoring
vibetools performance -b -r > performance-$(date +%Y%m%d).md
```

## 🐛 Fehlerbehebung

### Häufige Probleme

1. **Installation schlägt fehl**
   ```bash
   # Berechtigungen überprüfen
   sudo npm install -g @elementaro/vibetools
   
   # Cache leeren
   npm cache clean --force
   ```

2. **Konfigurationsdateien werden nicht erstellt**
   ```bash
   # Manuell installieren
   vibetools install -e cursor -p $(pwd)
   
   # Berechtigungen überprüfen
   ls -la .vibetools/
   ```

3. **Code-Analyse funktioniert nicht**
   ```bash
   # TypeScript-Compiler überprüfen
   npx tsc --version
   
   # Dependencies installieren
   pnpm install
   ```

### Debug-Modus aktivieren

```bash
# Log-Level auf Debug setzen
vibetools config -s logLevel=debug

# Detaillierte Ausgabe
vibetools analyze -v
```

## 🤝 Beitragen

Beiträge sind willkommen! Bitte lesen Sie unsere [Contributing Guidelines](CONTRIBUTING.md).

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe [LICENSE](LICENSE) für Details.

## 🙏 Danksagungen

VibeTools basiert auf dem [VibeTools-Projekt](https://github.com/eastlondoner/vibe-tools) von eastlondoner und wurde für das Elementaro Event Planner Projekt angepasst.

## 📞 Support

Bei Fragen oder Problemen:

1. Überprüfen Sie die [Dokumentation](docs/)
2. Schauen Sie in die [Issues](https://github.com/your-repo/issues)
3. Erstellen Sie ein neues [Issue](https://github.com/your-repo/issues/new)

---

**VibeTools** - AI-Powered Development Tools für das Elementaro Event Planner Projekt 🚀
