#!/bin/bash

# Event Manager App - AI Orchestrator Setup Script
# Dieses Skript installiert und konfiguriert das AI-Orchestrator-System

set -e

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging-Funktionen
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Prüfe Voraussetzungen
check_prerequisites() {
    log_info "Prüfe Voraussetzungen..."
    
    # Node.js Version prüfen
    if ! command -v node &> /dev/null; then
        log_error "Node.js ist nicht installiert. Bitte installieren Sie Node.js >= 16.0.0"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        log_error "Node.js Version $NODE_VERSION ist zu alt. Bitte installieren Sie Node.js >= 16.0.0"
        exit 1
    fi
    
    log_success "Node.js Version $(node --version) gefunden"
    
    # npm Version prüfen
    if ! command -v npm &> /dev/null; then
        log_error "npm ist nicht installiert"
        exit 1
    fi
    
    NPM_VERSION=$(npm --version | cut -d'.' -f1)
    if [ "$NPM_VERSION" -lt 8 ]; then
        log_error "npm Version $NPM_VERSION ist zu alt. Bitte installieren Sie npm >= 8.0.0"
        exit 1
    fi
    
    log_success "npm Version $(npm --version) gefunden"
    
    # Git prüfen
    if ! command -v git &> /dev/null; then
        log_warning "Git ist nicht installiert. Einige Features könnten nicht funktionieren."
    else
        log_success "Git gefunden"
    fi
}

# Installiere Dependencies
install_dependencies() {
    log_info "Installiere Dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        log_success "Dependencies installiert"
    else
        log_error "package.json nicht gefunden"
        exit 1
    fi
}

# Setze Berechtigungen
set_permissions() {
    log_info "Setze Berechtigungen..."
    
    # CLI-Tools ausführbar machen
    chmod +x ai-orchestrator.js
    chmod +x agents/*.js
    
    # Setup-Skript ausführbar machen
    chmod +x setup-ai-orchestrator.sh
    
    log_success "Berechtigungen gesetzt"
}

# Erstelle Log-Datei
create_log_file() {
    log_info "Erstelle Log-Datei..."
    
    touch ai-orchestrator.log
    chmod 644 ai-orchestrator.log
    
    log_success "Log-Datei erstellt: ai-orchestrator.log"
}

# Teste Installation
test_installation() {
    log_info "Teste Installation..."
    
    # Teste CLI-Help
    if node ai-orchestrator.js help &> /dev/null; then
        log_success "CLI-Help funktioniert"
    else
        log_error "CLI-Help funktioniert nicht"
        exit 1
    fi
    
    # Teste Status-Befehl
    if node ai-orchestrator.js status &> /dev/null; then
        log_success "Status-Befehl funktioniert"
    else
        log_error "Status-Befehl funktioniert nicht"
        exit 1
    fi
    
    # Teste Agent-Liste
    if node ai-orchestrator.js agent list &> /dev/null; then
        log_success "Agent-Liste funktioniert"
    else
        log_error "Agent-Liste funktioniert nicht"
        exit 1
    fi
}

# Erstelle Beispiel-Konfiguration
create_example_config() {
    log_info "Erstelle Beispiel-Konfiguration..."
    
    # .env.example für AI Orchestrator
    cat > .env.ai-orchestrator.example << EOF
# AI Orchestrator Konfiguration
PROJECT_ROOT=$(pwd)/..
LOG_FILE=ai-orchestrator.log
WORKFLOW_STATE_FILE=workflow_state.md
PROJECT_CONFIG_FILE=project_config.md

# Log-Level (DEBUG, INFO, WARN, ERROR)
LOG_LEVEL=INFO

# Checkpoint-Intervall in Sekunden
CHECKPOINT_INTERVAL=300

# Max. Anzahl paralleler Agenten
MAX_PARALLEL_AGENTS=3

# Timeout für Agenten-Ausführung in Sekunden
AGENT_TIMEOUT=3600
EOF
    
    log_success "Beispiel-Konfiguration erstellt: .env.ai-orchestrator.example"
}

# Erstelle Systemd-Service (Linux)
create_systemd_service() {
    if command -v systemctl &> /dev/null; then
        log_info "Erstelle Systemd-Service..."
        
        sudo tee /etc/systemd/system/ai-orchestrator.service > /dev/null << EOF
[Unit]
Description=Event Manager AI Orchestrator
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/node $(pwd)/ai-orchestrator.js auto
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
        
        log_success "Systemd-Service erstellt: /etc/systemd/system/ai-orchestrator.service"
        log_info "Service aktivieren mit: sudo systemctl enable ai-orchestrator"
        log_info "Service starten mit: sudo systemctl start ai-orchestrator"
    else
        log_warning "Systemd nicht verfügbar - Service wird nicht erstellt"
    fi
}

# Erstelle Cron-Job
create_cron_job() {
    log_info "Erstelle Cron-Job für regelmäßige Ausführung..."
    
    CRON_JOB="*/15 * * * * cd $(pwd) && node ai-orchestrator.js status > /dev/null 2>&1"
    
    if command -v crontab &> /dev/null; then
        # Prüfe ob Cron-Job bereits existiert
        if crontab -l 2>/dev/null | grep -q "ai-orchestrator"; then
            log_warning "Cron-Job für AI Orchestrator existiert bereits"
        else
            # Füge Cron-Job hinzu
            (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
            log_success "Cron-Job erstellt (alle 15 Minuten)"
        fi
    else
        log_warning "Crontab nicht verfügbar - Cron-Job wird nicht erstellt"
    fi
}

# Erstelle Docker-Compose-Konfiguration
create_docker_compose() {
    log_info "Erstelle Docker-Compose-Konfiguration..."
    
    cat > docker-compose.ai-orchestrator.yml << EOF
version: '3.8'

services:
  ai-orchestrator:
    build:
      context: .
      dockerfile: Dockerfile.ai-orchestrator
    container_name: ai-orchestrator
    restart: unless-stopped
    volumes:
      - ./workflow_state.md:/app/workflow_state.md
      - ./project_config.md:/app/project_config.md
      - ./ai-orchestrator.log:/app/ai-orchestrator.log
    environment:
      - NODE_ENV=production
      - PROJECT_ROOT=/app
    networks:
      - ai-orchestrator-network

  ai-orchestrator-redis:
    image: redis:7-alpine
    container_name: ai-orchestrator-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - ai-orchestrator-redis-data:/data
    networks:
      - ai-orchestrator-network

volumes:
  ai-orchestrator-redis-data:

networks:
  ai-orchestrator-network:
    driver: bridge
EOF
    
    log_success "Docker-Compose-Konfiguration erstellt: docker-compose.ai-orchestrator.yml"
}

# Erstelle Dockerfile
create_dockerfile() {
    log_info "Erstelle Dockerfile..."
    
    cat > Dockerfile.ai-orchestrator << EOF
FROM node:18-alpine

# Arbeitsverzeichnis setzen
WORKDIR /app

# Package-Dateien kopieren und Dependencies installieren
COPY scripts/package*.json ./scripts/
RUN cd scripts && npm install

# Anwendungscode kopieren
COPY . .

# Berechtigungen setzen
RUN chmod +x scripts/ai-orchestrator.js
RUN chmod +x scripts/agents/*.js

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD node scripts/ai-orchestrator.js status || exit 1

# Standardbefehl
CMD ["node", "scripts/ai-orchestrator.js", "auto"]
EOF
    
    log_success "Dockerfile erstellt: Dockerfile.ai-orchestrator"
}

# Erstelle GitHub Actions Workflow
create_github_actions() {
    log_info "Erstelle GitHub Actions Workflow..."
    
    mkdir -p ../.github/workflows
    
    cat > ../.github/workflows/ai-orchestrator.yml << EOF
name: AI Orchestrator Workflow

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 */6 * * *'  # Alle 6 Stunden

jobs:
  ai-analysis:
    runs-on: ubuntu-latest
    name: AI Analysis & Security Review
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'scripts/package-lock.json'
          
      - name: Install dependencies
        run: |
          cd scripts
          npm ci
          
      - name: Run System Architect Analysis
        run: |
          cd scripts
          node agents/system-architect.js
          
      - name: Run Security Review
        run: |
          cd scripts
          node agents/security-reviewer.js
          
      - name: Upload AI Reports
        uses: actions/upload-artifact@v4
        with:
          name: ai-reports
          path: |
            ARCHITECTURE_REPORT.md
            SECURITY_REPORT.md
            ai-orchestrator.log
          
      - name: Comment PR with AI Analysis
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            let comment = '## 🤖 AI Orchestrator Analysis\n\n';
            
            if (fs.existsSync('ARCHITECTURE_REPORT.md')) {
              const archReport = fs.readFileSync('ARCHITECTURE_REPORT.md', 'utf8');
              const archSummary = archReport.match(/## Zusammenfassung\n\n([\s\S]*?)(?=\n##)/);
              if (archSummary) {
                comment += '### 🏗️ Architecture Report\n\n' + archSummary[1] + '\n\n';
              }
            }
            
            if (fs.existsSync('SECURITY_REPORT.md')) {
              const secReport = fs.readFileSync('SECURITY_REPORT.md', 'utf8');
              const secSummary = secReport.match(/## Sicherheits-Zusammenfassung\n\n([\s\S]*?)(?=\n##)/);
              if (secSummary) {
                comment += '### 🔒 Security Report\n\n' + secSummary[1] + '\n\n';
              }
            }
            
            comment += '---\n*Automatisch generiert vom AI Orchestrator*';
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
EOF
    
    log_success "GitHub Actions Workflow erstellt: .github/workflows/ai-orchestrator.yml"
}

# Erstelle VS Code Konfiguration
create_vscode_config() {
    log_info "Erstelle VS Code Konfiguration..."
    
    mkdir -p ../.vscode
    
    cat > ../.vscode/launch.json << EOF
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "AI Orchestrator - Status",
            "type": "node",
            "request": "launch",
            "program": "\${workspaceFolder}/scripts/ai-orchestrator.js",
            "args": ["status"],
            "cwd": "\${workspaceFolder}/scripts",
            "console": "integratedTerminal"
        },
        {
            "name": "AI Orchestrator - Auto Mode",
            "type": "node",
            "request": "launch",
            "program": "\${workspaceFolder}/scripts/ai-orchestrator.js",
            "args": ["auto"],
            "cwd": "\${workspaceFolder}/scripts",
            "console": "integratedTerminal"
        },
        {
            "name": "System Architect Agent",
            "type": "node",
            "request": "launch",
            "program": "\${workspaceFolder}/scripts/agents/system-architect.js",
            "cwd": "\${workspaceFolder}/scripts",
            "console": "integratedTerminal"
        },
        {
            "name": "Security Reviewer Agent",
            "type": "node",
            "request": "launch",
            "program": "\${workspaceFolder}/scripts/agents/security-reviewer.js",
            "cwd": "\${workspaceFolder}/scripts",
            "console": "integratedTerminal"
        }
    ]
}
EOF
    
    cat > ../.vscode/tasks.json << EOF
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "AI Orchestrator: Status",
            "type": "shell",
            "command": "npm",
            "args": ["run", "status"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            },
            "options": {
                "cwd": "\${workspaceFolder}/scripts"
            }
        },
        {
            "label": "AI Orchestrator: Start Phase",
            "type": "shell",
            "command": "npm",
            "args": ["run", "phase:start"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            },
            "options": {
                "cwd": "\${workspaceFolder}/scripts"
            }
        },
        {
            "label": "AI Orchestrator: Auto Mode",
            "type": "shell",
            "command": "npm",
            "run": "auto",
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            },
            "options": {
                "cwd": "\${workspaceFolder}/scripts"
            }
        }
    ]
}
EOF
    
    log_success "VS Code Konfiguration erstellt: .vscode/launch.json und .vscode/tasks.json"
}

# Hauptfunktion
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                Event Manager AI Orchestrator                ║"
    echo "║                     Setup Script                            ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log_info "Starte AI Orchestrator Setup..."
    
    # Prüfe ob wir im richtigen Verzeichnis sind
    if [ ! -f "ai-orchestrator.js" ]; then
        log_error "Bitte führen Sie dieses Skript im scripts/ Verzeichnis aus"
        exit 1
    fi
    
    # Führe Setup-Schritte aus
    check_prerequisites
    install_dependencies
    set_permissions
    create_log_file
    create_example_config
    create_systemd_service
    create_cron_job
    create_docker_compose
    create_dockerfile
    create_github_actions
    create_vscode_config
    test_installation
    
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    Setup abgeschlossen!                     ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log_success "AI Orchestrator Setup erfolgreich abgeschlossen!"
    echo
    log_info "Nächste Schritte:"
    echo "  1. Konfiguration anpassen: .env.ai-orchestrator.example"
    echo "  2. Workflow starten: npm run start"
    echo "  3. Status prüfen: npm run status"
    echo "  4. Autonomen Modus starten: npm run auto"
    echo
    log_info "Verfügbare Befehle:"
    echo "  npm run start [phase]     - Workflow starten"
    echo "  npm run status            - Status anzeigen"
    echo "  npm run phase:start       - Phase starten"
    echo "  npm run agent:list        - Agenten auflisten"
    echo "  npm run auto              - Autonomen Modus starten"
    echo
    log_info "Dokumentation: ../AI_ORCHESTRATOR_README.md"
}

# Skript ausführen
main "$@"
