#!/usr/bin/env node

/**
 * AI Orchestrator CLI - Multi-Agent Projektmanagement
 * 
 * Dieses Tool orchestriert alle KI-Agenten und verwaltet den Workflow-State
 * autonom über die CLI für CI/CD, Batch-Projekte und Multi-Agent-Bots.
 * 
 * NEU: Kontinuierlicher Daemon-Modus mit automatischer Agenten-Koordination
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Konfiguration
const CONFIG = {
  PROJECT_ROOT: path.resolve(__dirname, '..'),
  WORKFLOW_STATE_FILE: 'workflow_state.md',
  WORKFLOW_STATE_PATH: path.resolve(__dirname, '..', 'workflow_state.md'),
  PROJECT_CONFIG_FILE: 'project_config.md',
  LOG_FILE: path.join(path.resolve(__dirname, '..'), 'ai-orchestrator.log'),
  AGENTS: {
    SYSTEM_ARCHITECT: 'system-architect',
    FEATURE_DEVELOPER: 'feature-developer',
    SECURITY_REVIEWER: 'security-reviewer',
    DOCS_WRITER: 'docs-writer',
    CONTEXT_SPECIALIST: 'context-specialist'
  },
  PHASES: [
    'INITIALIZATION',
    'REQUIREMENTS_GATHERING',
    'ANALYSIS_PHASE',
    'BLUEPRINT_PHASE',
    'IMPLEMENTATION_PHASE',
    'TESTING_PHASE',
    'DEPLOYMENT_PHASE',
    'REVIEW_PHASE'
  ],
  DAEMON: {
    CHECK_INTERVAL: 30000, // 30 Sekunden
    AGENT_HEALTH_CHECK: 60000, // 1 Minute
    PHASE_TIMEOUT: 4 * 60 * 60 * 1000, // 4 Stunden
    MAX_RETRIES: 3,
    PRIORITY_LEVELS: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
  },
  WORKFLOW_SYNC: {
    LOCK_FILE: '.workflow_state.lock',
    BACKUP_INTERVAL: 5 * 60 * 1000, // 5 Minuten
    MAX_BACKUP_FILES: 10,
    CONFLICT_RESOLUTION: 'MERGE'
  }
};

// Utility-Funktionen
class Utils {
  static log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}`;
    
    console.log(logEntry);
    
    // Log-Datei schreiben
    fs.appendFileSync(CONFIG.LOG_FILE, logEntry + '\n');
  }

  static readFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      Utils.log(`Fehler beim Lesen von ${filePath}: ${error.message}`, 'ERROR');
      return null;
    }
  }

  static writeFile(filePath, content) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      Utils.log(`Datei ${filePath} erfolgreich geschrieben`);
      return true;
    } catch (error) {
      Utils.log(`Fehler beim Schreiben von ${filePath}: ${error.message}`, 'ERROR');
      return false;
    }
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static generateBackupName(originalPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dir = path.dirname(originalPath);
    const name = path.basename(originalPath, path.extname(originalPath));
    const ext = path.extname(originalPath);
    return path.join(dir, `${name}_backup_${timestamp}${ext}`);
  }

  static cleanupOldBackups(backupDir, maxFiles) {
    try {
      if (!fs.existsSync(backupDir)) return;
      
      const files = fs.readdirSync(backupDir)
        .filter(f => f.includes('_backup_'))
        .map(f => ({ name: f, path: path.join(backupDir, f), time: fs.statSync(path.join(backupDir, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);
      
      // Behalte nur die neuesten Dateien
      if (files.length > maxFiles) {
        const toDelete = files.slice(maxFiles);
        toDelete.forEach(file => {
          fs.unlinkSync(file.path);
          Utils.log(`Alte Backup-Datei gelöscht: ${file.name}`);
        });
      }
    } catch (error) {
      Utils.log(`Fehler beim Bereinigen alter Backups: ${error.message}`, 'ERROR');
    }
  }

  static getCurrentPhase() {
    const stateFile = path.join(CONFIG.PROJECT_ROOT, CONFIG.WORKFLOW_STATE_FILE);
    const content = Utils.readFile(stateFile);
    
    if (!content) return null;
    
    const match = content.match(/\*\*Aktuelle Phase\*\*:\s*`?(\w+)`?/);
    return match ? match[1] : null;
  }

  static getNextPhase() {
    const currentPhase = Utils.getCurrentPhase();
    if (!currentPhase) return null;
    
    const currentIndex = CONFIG.PHASES.indexOf(currentPhase);
    if (currentIndex === -1 || currentIndex === CONFIG.PHASES.length - 1) {
      return null;
    }
    
    return CONFIG.PHASES[currentIndex + 1];
  }

  static async updateWorkflowState(updates) {
    const stateFile = path.join(CONFIG.PROJECT_ROOT, CONFIG.WORKFLOW_STATE_FILE);
    let content = Utils.readFile(stateFile);
    
    if (!content) return false;
    
    // Updates anwenden
    Object.entries(updates).forEach(([key, value]) => {
      const regex = new RegExp(`(${key}:\\s*).*`, 'g');
      content = content.replace(regex, `$1${value}`);
    });
    
    // Zeitstempel aktualisieren
    const now = new Date().toLocaleString('de-DE');
    content = content.replace(
      /(\*\*Letzte Aktualisierung\*\*:\s*).*/,
      `$1${now}`
    );
    
    return Utils.writeFile(stateFile, content);
  }
}

// Zentrale Workflow-State-Verwaltung mit Konfliktvermeidung
class WorkflowStateManager {
  constructor() {
    this.statePath = CONFIG.WORKFLOW_STATE_PATH;
    this.lockPath = path.join(CONFIG.PROJECT_ROOT, CONFIG.WORKFLOW_SYNC.LOCK_FILE);
    this.backupDir = path.join(CONFIG.PROJECT_ROOT, 'backups', 'workflow');
    this.lastBackup = 0;
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async acquireLock() {
    const maxAttempts = 10;
    const lockDelay = 1000; // 1 Sekunde
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Prüfe ob Lock-Datei existiert
        if (fs.existsSync(this.lockPath)) {
          const lockContent = fs.readFileSync(this.lockPath, 'utf8');
          const lockData = JSON.parse(lockContent);
          
          // Prüfe ob Lock abgelaufen ist (älter als 5 Minuten)
          if (Date.now() - lockData.timestamp > 5 * 60 * 1000) {
            Utils.log(`Abgelaufener Lock gefunden, entferne ihn`, 'WARN');
            this.releaseLock();
          } else {
            Utils.log(`Lock von ${lockData.process} aktiv, warte... (Versuch ${attempt}/${maxAttempts})`, 'INFO');
            await Utils.sleep(lockDelay);
            continue;
          }
        }
        
        // Erstelle Lock-Datei
        const lockData = {
          process: process.pid,
          timestamp: Date.now(),
          hostname: require('os').hostname()
        };
        
        fs.writeFileSync(this.lockPath, JSON.stringify(lockData, null, 2));
        Utils.log(`Workflow-State-Lock erworben`);
        return true;
        
      } catch (error) {
        Utils.log(`Fehler beim Erwerben des Locks (Versuch ${attempt}): ${error.message}`, 'ERROR');
        if (attempt === maxAttempts) {
          throw new Error(`Konnte Lock nach ${maxAttempts} Versuchen nicht erwerben`);
        }
        await Utils.sleep(lockDelay);
      }
    }
    
    return false;
  }

  releaseLock() {
    try {
      if (fs.existsSync(this.lockPath)) {
        fs.unlinkSync(this.lockPath);
        Utils.log(`Workflow-State-Lock freigegeben`);
      }
    } catch (error) {
      Utils.log(`Fehler beim Freigeben des Locks: ${error.message}`, 'ERROR');
    }
  }

  async createBackup() {
    const now = Date.now();
    if (now - this.lastBackup < CONFIG.WORKFLOW_SYNC.BACKUP_INTERVAL) {
      return; // Backup nicht erforderlich
    }

    try {
      if (fs.existsSync(this.statePath)) {
        const backupName = Utils.generateBackupName(this.statePath);
        const backupPath = path.join(this.backupDir, path.basename(backupName));
        
        fs.copyFileSync(this.statePath, backupPath);
        this.lastBackup = now;
        
        Utils.log(`Workflow-State-Backup erstellt: ${backupPath}`);
        
        // Alte Backups bereinigen
        Utils.cleanupOldBackups(this.backupDir, CONFIG.WORKFLOW_SYNC.MAX_BACKUP_FILES);
      }
    } catch (error) {
      Utils.log(`Fehler beim Erstellen des Backups: ${error.message}`, 'ERROR');
    }
  }

  async readState() {
    try {
      await this.acquireLock();
      
      // Backup erstellen vor dem Lesen
      await this.createBackup();
      
      if (!fs.existsSync(this.statePath)) {
        Utils.log(`Workflow-State-Datei existiert nicht, erstelle Standard`, 'WARN');
        return this.createDefaultState();
      }
      
      const content = fs.readFileSync(this.statePath, 'utf8');
      return content;
      
    } finally {
      this.releaseLock();
    }
  }

  async writeState(content) {
    try {
      await this.acquireLock();
      
      // Backup erstellen vor dem Schreiben
      await this.createBackup();
      
      // Schreiben mit atomischer Operation
      const tempPath = this.statePath + '.tmp';
      fs.writeFileSync(tempPath, content, 'utf8');
      fs.renameSync(tempPath, this.statePath);
      
      Utils.log(`Workflow-State erfolgreich aktualisiert`);
      return true;
      
    } catch (error) {
      Utils.log(`Fehler beim Schreiben des Workflow-States: ${error.message}`, 'ERROR');
      return false;
    } finally {
      this.releaseLock();
    }
  }

  async updateState(updates) {
    try {
      const currentContent = await this.readState();
      if (!currentContent) return false;
      
      let updatedContent = currentContent;
      
      // Updates anwenden
      Object.entries(updates).forEach(([key, value]) => {
        const regex = new RegExp(`(${key}:\\s*).*`, 'g');
        updatedContent = updatedContent.replace(regex, `$1${value}`);
      });
      
      // Zeitstempel aktualisieren
      const now = new Date().toLocaleString('de-DE');
      updatedContent = updatedContent.replace(
        /(\*\*Letzte Aktualisierung\*\*:\s*).*/,
        `$1${now}`
      );
      
      // Aktualisiere AI-Aktivitäts-Log
      const logEntry = `### ${new Date().toISOString()}\n- [INFO] Workflow-State aktualisiert: ${Object.keys(updates).join(', ')}\n`;
      
      // Füge Log-Eintrag hinzu, falls der Abschnitt existiert
      if (updatedContent.includes('## 📝 **AI-Aktivitäts-Log**')) {
        const logSection = '## 📝 **AI-Aktivitäts-Log**';
        const insertPos = updatedContent.indexOf(logSection) + logSection.length;
        updatedContent = updatedContent.slice(0, insertPos) + '\n\n' + logEntry + updatedContent.slice(insertPos);
      }
      
      return await this.writeState(updatedContent);
      
    } catch (error) {
      Utils.log(`Fehler beim Aktualisieren des Workflow-States: ${error.message}`, 'ERROR');
      return false;
    }
  }

  createDefaultState() {
    const defaultContent = `# Workflow State - Operatives Gehirn der KI

## 📊 **Aktueller Status**
- **Phase**: \`INITIALIZATION\`
- **Status**: \`ACTIVE\`
- **Letzte Aktualisierung**: ${new Date().toLocaleString('de-DE')}

## 🎯 **Phase-Übersicht**
- 🔄 **INITIALIZATION** - Aktuell aktiv
- ⏳ **REQUIREMENTS_GATHERING** - Geplant
- ⏳ **ANALYSIS_PHASE** - Geplant
- ⏳ **BLUEPRINT_PHASE** - Geplant
- ⏳ **IMPLEMENTATION_PHASE** - Geplant
- ⏳ **TESTING_PHASE** - Geplant
- ⏳ **DEPLOYMENT_PHASE** - Geplant
- ⏳ **REVIEW_PHASE** - Geplant

## 📋 **Aktuelle Aufgaben & Prioritäten**
1. **AI Orchestrator Setup** - In Bearbeitung
2. **Workflow-Status-Initialisierung** - In Bearbeitung

## 📜 **Arbeitsregeln & Protokolle**
- **Zentrale Verwaltung**: Nur eine workflow_state.md wird verwendet
- **Automatische Backups**: Alle 5 Minuten
- **Konfliktvermeidung**: Lock-basierte Synchronisation
- **Protokollierung**: Alle Aktivitäten werden detailliert geloggt

## 🤖 **Agent-Status & Aktivitäten**
- **system-architect**: Bereit
- **feature-developer**: Bereit
- **security-reviewer**: Bereit
- **docs-writer**: Bereit
- **context-specialist**: Bereit

## 📈 **Laufender Plan**
### Aktuelle Phase: INITIALIZATION
1. ✅ AI Orchestrator initialisieren
2. 🔄 Workflow-State zentralisieren
3. ⏳ Agenten koordinieren

## 📝 **AI-Aktivitäts-Log**
### ${new Date().toISOString()}
- [INFO] Zentrale Workflow-State-Verwaltung initialisiert
- [INFO] Konfliktvermeidung und Backup-System aktiviert

## 🚀 **Nächste Aktionen**
1. **Phase-Übergang**: INITIALIZATION → REQUIREMENTS_GATHERING
2. **Agenten-Koordination**: Alle Agenten aktivieren
3. **Workflow-Automatisierung**: Daemon-Modus starten

## ⚠️ **Risiken & Blocker**
- **Keine kritischen Risiken** identifiziert
- **Zentrale Verwaltung** erfolgreich implementiert

## 📊 **Metriken & KPIs**
- **Workflow-State-Synchronisation**: 100% funktional
- **Backup-System**: Aktiv
- **Konfliktvermeidung**: Implementiert

## 🔧 **Technische Details**
- **Workflow-Engine**: AI Orchestrator v2.0.0 (Zentralisiert)
- **State-Management**: Lock-basierte Synchronisation
- **Backup-System**: Automatisch alle 5 Minuten
- **Konfliktlösung**: MERGE-Strategie

---
*Letzte Aktualisierung: ${new Date().toLocaleString('de-DE')}*
*Status: ACTIVE - INITIALIZATION*
*Zentrale Verwaltung: AKTIV*
`;
    
    return defaultContent;
  }

  async getCurrentPhase() {
    try {
      const content = await this.readState();
      if (!content) return null;
      
      const match = content.match(/\*\*Aktuelle Phase\*\*:\s*`?(\w+)`?/);
      return match ? match[1] : null;
    } catch (error) {
      Utils.log(`Fehler beim Lesen der aktuellen Phase: ${error.message}`, 'ERROR');
      return null;
    }
  }

  async getNextPhase() {
    try {
      const currentPhase = await this.getCurrentPhase();
      if (!currentPhase) return null;
      
      const currentIndex = CONFIG.PHASES.indexOf(currentPhase);
      if (currentIndex === -1 || currentIndex === CONFIG.PHASES.length - 1) {
        return null;
      }
      
      return CONFIG.PHASES[currentIndex + 1];
    } catch (error) {
      Utils.log(`Fehler beim Ermitteln der nächsten Phase: ${error.message}`, 'ERROR');
      return null;
    }
  }

  async validateState() {
    try {
      const content = await this.readState();
      if (!content) return false;
      
      // Prüfe ob alle erforderlichen Abschnitte vorhanden sind
      const requiredSections = [
        '## 📊 **Aktueller Status**',
        '## 🎯 **Phase-Übersicht**',
        '## 📋 **Aktuelle Aufgaben & Prioritäten**',
        '## 🤖 **Agent-Status & Aktivitäten**'
      ];
      
      const missingSections = requiredSections.filter(section => !content.includes(section));
      
      if (missingSections.length > 0) {
        Utils.log(`Fehlende Abschnitte in Workflow-State: ${missingSections.join(', ')}`, 'WARN');
        return false;
      }
      
      return true;
    } catch (error) {
      Utils.log(`Fehler bei der Workflow-State-Validierung: ${error.message}`, 'ERROR');
      return false;
    }
  }
}

// Erweiterter Workflow-Manager mit automatischen Übergängen
class WorkflowManager {
  constructor(agentManager) {
    this.agentManager = agentManager;
    this.currentPhase = null;
    this.phaseStartTime = null;
    this.phaseTimeout = null;
    this.autoTransition = true;
  }

  async startPhase(phaseName) {
    Utils.log(`Phase ${phaseName} wird gestartet`);
    
    // Stoppe vorherige Phase-Timeout
    if (this.phaseTimeout) {
      clearTimeout(this.phaseTimeout);
    }
    
    this.currentPhase = phaseName;
    this.phaseStartTime = Date.now();
    
    // Workflow-State aktualisieren
    Utils.updateWorkflowState({
      'Aktuelle Phase': phaseName,
      'Nächste Phase': Utils.getNextPhase() || 'ABGESCHLOSSEN'
    });
    
    // Phase-spezifische Agenten aktivieren
    await this.executePhaseAgents(phaseName);
    
    // Phase-Timeout setzen
    const config = this.getPhaseConfig(phaseName);
    this.phaseTimeout = setTimeout(() => {
      Utils.log(`Phase ${phaseName} Timeout erreicht, automatischer Übergang`, 'WARN');
      this.completePhase();
    }, config.duration);
    
    return true;
  }

  async executePhaseAgents(phaseName) {
    const phaseConfig = this.getPhaseConfig(phaseName);
    
    for (const agentName of phaseConfig.agents) {
      Utils.log(`Aktiviere Agent ${agentName} für Phase ${phaseName}`);
      
      // Füge Agent-Aktivierung zur Aufgabenwarteschlange hinzu
      this.agentManager.taskQueue.addTask(
        `phase_${phaseName}_${agentName}`,
        () => this.agentManager.activateAgent(agentName),
        'HIGH'
      );
    }
  }

  getPhaseConfig(phaseName) {
    const configs = {
      'INITIALIZATION': {
        agents: ['context-specialist'],
        duration: 30 * 60 * 1000, // 30 Minuten
        checkpoints: 5 * 60 * 1000 // 5 Minuten
      },
      'REQUIREMENTS_GATHERING': {
        agents: ['context-specialist', 'system-architect'],
        duration: 45 * 60 * 1000,
        checkpoints: 10 * 60 * 1000
      },
      'ANALYSIS_PHASE': {
        agents: ['context-specialist', 'system-architect', 'security-reviewer'],
        duration: 2 * 60 * 60 * 1000, // 2 Stunden
        checkpoints: 30 * 60 * 1000
      },
      'BLUEPRINT_PHASE': {
        agents: ['system-architect', 'security-reviewer'],
        duration: 3 * 60 * 60 * 1000, // 3 Stunden
        checkpoints: 45 * 60 * 1000
      },
      'IMPLEMENTATION_PHASE': {
        agents: ['feature-developer', 'docs-writer'],
        duration: 8 * 60 * 60 * 1000, // 8 Stunden
        checkpoints: 60 * 60 * 1000
      },
      'TESTING_PHASE': {
        agents: ['security-reviewer', 'feature-developer'],
        duration: 2 * 60 * 60 * 1000,
        checkpoints: 30 * 60 * 1000
      },
      'DEPLOYMENT_PHASE': {
        agents: ['system-architect', 'security-reviewer'],
        duration: 60 * 60 * 1000,
        checkpoints: 15 * 60 * 1000
      },
      'REVIEW_PHASE': {
        agents: ['context-specialist', 'docs-writer'],
        duration: 60 * 60 * 1000,
        checkpoints: 20 * 60 * 1000
      }
    };
    
    return configs[phaseName] || { agents: [], duration: 0, checkpoints: 0 };
  }

  async completePhase() {
    if (!this.currentPhase) {
      Utils.log('Keine aktive Phase', 'WARN');
      return false;
    }
    
    // Stoppe Phase-Timeout
    if (this.phaseTimeout) {
      clearTimeout(this.phaseTimeout);
      this.phaseTimeout = null;
    }
    
    const duration = Date.now() - this.phaseStartTime;
    Utils.log(`Phase ${this.currentPhase} abgeschlossen (Dauer: ${Math.round(duration / 1000)}s)`);
    
    // Nächste Phase starten
    const nextPhase = Utils.getNextPhase();
    if (nextPhase) {
      await this.startPhase(nextPhase);
    } else {
      Utils.log('Alle Phasen abgeschlossen!', 'SUCCESS');
    }
    
    this.currentPhase = null;
    this.phaseStartTime = null;
    
    return true;
  }

  getCurrentPhaseInfo() {
    if (!this.currentPhase) return null;
    
    const config = this.getPhaseConfig(this.currentPhase);
    const elapsed = Date.now() - this.phaseStartTime;
    const progress = Math.min((elapsed / config.duration) * 100, 100);
    
    return {
      phase: this.currentPhase,
      progress: Math.round(progress),
      elapsed: Math.round(elapsed / 1000),
      remaining: Math.round((config.duration - elapsed) / 1000),
      agents: config.agents
    };
  }

  setAutoTransition(enabled) {
    this.autoTransition = enabled;
    Utils.log(`Automatische Phase-Übergänge: ${enabled ? 'AKTIVIERT' : 'DEAKTIVIERT'}`);
  }
}

// Daemon-Modus für kontinuierliche Ausführung
class DaemonMode {
  constructor(agentManager, workflowManager) {
    this.agentManager = agentManager;
    this.workflowManager = workflowManager;
    this.isRunning = false;
    this.intervals = new Set();
  }

  async start() {
    if (this.isRunning) {
      Utils.log('Daemon läuft bereits', 'WARN');
      return;
    }

    Utils.log('Starte AI Orchestrator Daemon...');
    this.isRunning = true;

    // Hauptschleife
    const mainLoop = setInterval(async () => {
      try {
        await this.mainLoop();
      } catch (error) {
        Utils.log(`Fehler in Hauptschleife: ${error.message}`, 'ERROR');
      }
    }, CONFIG.DAEMON.CHECK_INTERVAL);
    this.intervals.add(mainLoop);

    // Agent-Gesundheitscheck
    const healthCheck = setInterval(async () => {
      try {
        await this.agentManager.healthCheck();
      } catch (error) {
        Utils.log(`Fehler beim Gesundheitscheck: ${error.message}`, 'ERROR');
      }
    }, CONFIG.DAEMON.AGENT_HEALTH_CHECK);
    this.intervals.add(healthCheck);

    // Aufgabenverarbeitung
    const taskProcessor = setInterval(async () => {
      try {
        await this.processTaskQueue();
      } catch (error) {
        Utils.log(`Fehler bei Aufgabenverarbeitung: ${error.message}`, 'ERROR');
      }
    }, 10000); // Alle 10 Sekunden
    this.intervals.add(taskProcessor);

    Utils.log('AI Orchestrator Daemon erfolgreich gestartet');
  }

  async stop() {
    if (!this.isRunning) {
      Utils.log('Daemon läuft nicht', 'WARN');
      return;
    }

    Utils.log('Stoppe AI Orchestrator Daemon...');
    this.isRunning = false;

    // Alle Intervals stoppen
    for (const interval of this.intervals) {
      clearInterval(interval);
    }
    this.intervals.clear();

    Utils.log('AI Orchestrator Daemon gestoppt');
  }

  async mainLoop() {
    // Prüfe aktuellen Workflow-Status
    const currentPhase = Utils.getCurrentPhase();
    const phaseInfo = this.workflowManager.getCurrentPhaseInfo();
    
    // Aktualisiere Workflow-State
    if (currentPhase && phaseInfo) {
      Utils.updateWorkflowState({
        'Phase-Status': `AKTIV - ${phaseInfo.progress}% abgeschlossen`,
        'Verbleibende Zeit': `${phaseInfo.remaining}s`
      });
    }

    // Prüfe ob Phase-Übergang erforderlich ist
    if (this.workflowManager.autoTransition && phaseInfo && phaseInfo.progress >= 100) {
      Utils.log(`Phase ${currentPhase} 100% abgeschlossen, automatischer Übergang`, 'INFO');
      await this.workflowManager.completePhase();
    }
  }

  async processTaskQueue() {
    const stats = this.agentManager.taskQueue.getStats();
    
    if (stats.pending > 0) {
      Utils.log(`Verarbeite Aufgabenwarteschlange: ${stats.pending} ausstehend, ${stats.running} laufend`);
      
      // Verarbeite nächste Aufgabe
      const nextTask = this.agentManager.taskQueue.getNextTask();
      if (nextTask && stats.running < 3) { // Maximal 3 gleichzeitige Aufgaben
        try {
          this.agentManager.taskQueue.markRunning(nextTask.id);
          const result = await nextTask.task();
          this.agentManager.taskQueue.markCompleted(nextTask.id);
          Utils.log(`Aufgabe ${nextTask.id} erfolgreich abgeschlossen`);
        } catch (error) {
          this.agentManager.taskQueue.markFailed(nextTask.id, error);
        }
      }
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      intervals: this.intervals.size,
      agentHealth: this.agentManager.getAgentHealth(),
      taskStats: this.agentManager.taskQueue.getStats(),
      currentPhase: this.workflowManager.getCurrentPhaseInfo()
    };
  }
}

// Prioritäts-basierte Aufgabenverwaltung
class TaskQueue {
  constructor() {
    this.tasks = new Map();
    this.running = new Set();
    this.completed = new Set();
    this.failed = new Set();
  }

  addTask(taskId, task, priority = 'MEDIUM') {
    if (!this.tasks.has(priority)) {
      this.tasks.set(priority, []);
    }
    
    this.tasks.get(priority).push({
      id: taskId,
      task: task,
      priority: priority,
      createdAt: Date.now(),
      attempts: 0
    });
    
    Utils.log(`Aufgabe ${taskId} mit Priorität ${priority} zur Warteschlange hinzugefügt`);
  }

  getNextTask() {
    // Prioritäten in Reihenfolge abarbeiten
    for (const priority of CONFIG.DAEMON.PRIORITY_LEVELS) {
      const priorityTasks = this.tasks.get(priority) || [];
      if (priorityTasks.length > 0) {
        return priorityTasks.shift();
      }
    }
    return null;
  }

  markRunning(taskId) {
    this.running.add(taskId);
  }

  markCompleted(taskId) {
    this.running.delete(taskId);
    this.completed.add(taskId);
  }

  markFailed(taskId, error) {
    this.running.delete(taskId);
    this.failed.add(taskId);
    Utils.log(`Aufgabe ${taskId} fehlgeschlagen: ${error.message}`, 'ERROR');
  }

  getStats() {
    return {
      pending: Array.from(this.tasks.values()).flat().length,
      running: this.running.size,
      completed: this.completed.size,
      failed: this.failed.size
    };
  }
}

// Erweiterter Agent-Manager mit Health-Checks
class AgentManager {
  constructor() {
    this.agents = new Map();
    this.activeAgents = new Set();
    this.agentHealth = new Map();
    this.agentRetries = new Map();
    this.taskQueue = new TaskQueue();
  }

  registerAgent(name, agent) {
    this.agents.set(name, agent);
    this.agentHealth.set(name, { status: 'HEALTHY', lastCheck: Date.now(), errors: 0 });
    this.agentRetries.set(name, 0);
    Utils.log(`Agent ${name} registriert`);
  }

  async activateAgent(name, priority = 'MEDIUM') {
    const agent = this.agents.get(name);
    if (!agent) {
      Utils.log(`Agent ${name} nicht gefunden`, 'ERROR');
      return false;
    }

    // Prüfe Agent-Gesundheit
    if (!this.isAgentHealthy(name)) {
      Utils.log(`Agent ${name} ist nicht gesund, überspringe Aktivierung`, 'WARN');
      return false;
    }

    try {
      this.activeAgents.add(name);
      this.agentHealth.get(name).status = 'RUNNING';
      Utils.log(`Agent ${name} aktiviert`);
      
      const result = await agent.execute();
      
      this.activeAgents.delete(name);
      this.agentHealth.get(name).status = 'HEALTHY';
      this.agentHealth.get(name).lastCheck = Date.now();
      this.agentRetries.set(name, 0); // Reset Retries bei Erfolg
      
      Utils.log(`Agent ${name} abgeschlossen`);
      return result;
    } catch (error) {
      this.activeAgents.delete(name);
      this.handleAgentError(name, error);
      return false;
    }
  }

  isAgentHealthy(name) {
    const health = this.agentHealth.get(name);
    if (!health) return false;
    
    // Prüfe ob Agent zu viele Fehler hat
    if (health.errors >= CONFIG.DAEMON.MAX_RETRIES) {
      return false;
    }
    
    // Prüfe ob Agent kürzlich aktiv war
    const timeSinceLastCheck = Date.now() - health.lastCheck;
    if (timeSinceLastCheck > CONFIG.DAEMON.AGENT_HEALTH_CHECK) {
      return false;
    }
    
    return health.status === 'HEALTHY' || health.status === 'IDLE';
  }

  handleAgentError(name, error) {
    const health = this.agentHealth.get(name);
    const retries = this.agentRetries.get(name);
    
    health.errors++;
    health.status = 'ERROR';
    health.lastCheck = Date.now();
    
    this.agentRetries.set(name, retries + 1);
    
    Utils.log(`Fehler bei Agent ${name}: ${error.message} (Versuch ${retries + 1}/${CONFIG.DAEMON.MAX_RETRIES})`, 'ERROR');
    
    // Wenn zu viele Fehler, markiere als ungesund
    if (retries + 1 >= CONFIG.DAEMON.MAX_RETRIES) {
      health.status = 'UNHEALTHY';
      Utils.log(`Agent ${name} als ungesund markiert nach ${CONFIG.DAEMON.MAX_RETRIES} Fehlern`, 'ERROR');
    }
  }

  async healthCheck() {
    Utils.log('Führe Agent-Gesundheitscheck durch...');
    
    for (const [name, health] of this.agentHealth) {
      if (health.status === 'UNHEALTHY') {
        Utils.log(`Versuche Agent ${name} zu reparieren...`, 'WARN');
        
        // Versuche Agent neu zu starten
        try {
          const agent = this.agents.get(name);
          if (agent && agent.restart) {
            await agent.restart();
            health.status = 'HEALTHY';
            health.errors = 0;
            this.agentRetries.set(name, 0);
            Utils.log(`Agent ${name} erfolgreich repariert`);
          }
        } catch (error) {
          Utils.log(`Fehler beim Reparieren von Agent ${name}: ${error.message}`, 'ERROR');
        }
      }
    }
  }

  getActiveAgents() {
    return Array.from(this.activeAgents);
  }

  getAllAgents() {
    return Array.from(this.agents.keys());
  }

  getAgentHealth() {
    return Object.fromEntries(this.agentHealth);
  }
}

// CLI-Interface
class CLI {
  constructor() {
    this.agentManager = new AgentManager();
    this.workflowManager = new WorkflowManager(this.agentManager);
    this.daemon = new DaemonMode(this.agentManager, this.workflowManager);
    this.workflowStateManager = new WorkflowStateManager();
    this.setupCommands();
  }

  setupCommands() {
    const command = process.argv[2];
    const args = process.argv.slice(3);
    
    // Agenten registrieren, bevor Befehle ausgeführt werden
    this.registerAgents();
    
    // Async-Wrapper für alle Befehle
    const runCommand = async () => {
      try {
        switch (command) {
          case 'start':
            await this.startWorkflow(args);
            break;
          case 'status':
            await this.showStatus();
            break;
          case 'phase':
            await this.managePhase(args);
            break;
          case 'agent':
            await this.manageAgent(args);
            break;
          case 'auto':
            await this.runAutonomous();
            break;
          case 'daemon':
            await this.manageDaemon(args);
            break;
          case 'validate':
            await this.validateWorkflowState();
            break;
          case 'backup':
            await this.manageBackups(args);
            break;
          case 'help':
            this.showHelp();
            break;
          default:
            this.showHelp();
            break;
        }
      } catch (error) {
        Utils.log(`Fehler bei der Befehlsausführung: ${error.message}`, 'ERROR');
        process.exit(1);
      }
    };
    
    // Befehle ausführen
    runCommand();
  }

  registerAgents() {
    // Mock-Agenten registrieren
    this.agentManager.registerAgent('system-architect', new MockAgent('system-architect', 'System Architect'));
    this.agentManager.registerAgent('feature-developer', new MockAgent('feature-developer', 'Feature Developer'));
    this.agentManager.registerAgent('security-reviewer', new MockAgent('security-reviewer', 'Security Reviewer'));
    this.agentManager.registerAgent('docs-writer', new MockAgent('docs-writer', 'Documentation Writer'));
    this.agentManager.registerAgent('context-specialist', new MockAgent('context-specialist', 'Context Specialist'));
  }

  async startWorkflow(args) {
    const phase = args[0] || 'INITIALIZATION';
    
    if (!CONFIG.PHASES.includes(phase)) {
      Utils.log(`Ungültige Phase: ${phase}`, 'ERROR');
      Utils.log(`Verfügbare Phasen: ${CONFIG.PHASES.join(', ')}`);
      return;
    }
    
    Utils.log(`Workflow wird mit Phase ${phase} gestartet`);
    await this.workflowManager.startPhase(phase);
  }

  async showStatus() {
    const currentPhase = Utils.getCurrentPhase();
    const phaseInfo = this.workflowManager.getCurrentPhaseInfo();
    const activeAgents = this.agentManager.getActiveAgents();
    const daemonStatus = this.daemon.getStatus();
    const taskStats = this.agentManager.taskQueue.getStats();
    
    console.log('\n=== AI Orchestrator Status ===');
    console.log(`Daemon-Modus: ${daemonStatus.isRunning ? 'AKTIV' : 'INAKTIV'}`);
    console.log(`Aktuelle Phase: ${currentPhase || 'Keine'}`);
    
    if (phaseInfo) {
      console.log(`Fortschritt: ${phaseInfo.progress}%`);
      console.log(`Verstrichene Zeit: ${phaseInfo.elapsed}s`);
      console.log(`Verbleibende Zeit: ${phaseInfo.remaining}s`);
      console.log(`Aktive Agenten: ${phaseInfo.agents.join(', ')}`);
    }
    
    console.log(`\n=== Aufgabenwarteschlange ===`);
    console.log(`Ausstehend: ${taskStats.pending}`);
    console.log(`Laufend: ${taskStats.running}`);
    console.log(`Abgeschlossen: ${taskStats.completed}`);
    console.log(`Fehlgeschlagen: ${taskStats.failed}`);
    
    console.log(`\n=== Agent-Status ===`);
    const agentHealth = this.agentManager.getAgentHealth();
    Object.entries(agentHealth).forEach(([name, health]) => {
      const status = health.status === 'RUNNING' ? '🟢' : 
                    health.status === 'HEALTHY' ? '🟢' : 
                    health.status === 'ERROR' ? '🟡' : '🔴';
      console.log(`${status} ${name}: ${health.status} (Fehler: ${health.errors})`);
    });
    
    console.log(`\nRegistrierte Agenten: ${this.agentManager.getAllAgents().join(', ')}`);
    console.log(`Aktive Agenten: ${activeAgents.length > 0 ? activeAgents.join(', ') : 'Keine'}`);
    console.log('===============================\n');
  }

  async managePhase(args) {
    const action = args[0];
    
    switch (action) {
      case 'start':
        const phase = args[1];
        if (phase) {
          await this.workflowManager.startPhase(phase);
        } else {
          Utils.log('Phase-Name erforderlich', 'ERROR');
        }
        break;
      case 'complete':
        await this.workflowManager.completePhase();
        break;
      case 'info':
        const info = this.workflowManager.getCurrentPhaseInfo();
        if (info) {
          console.log('\n=== Phase Information ===');
          console.log(`Phase: ${info.phase}`);
          console.log(`Fortschritt: ${info.progress}%`);
          console.log(`Verstrichene Zeit: ${info.elapsed}s`);
          console.log(`Verbleibende Zeit: ${info.remaining}s`);
          console.log(`Agenten: ${info.agents.join(', ')}`);
          console.log('========================\n');
        } else {
          Utils.log('Keine aktive Phase', 'WARN');
        }
        break;
      case 'auto':
        const enabled = args[1] === 'on';
        this.workflowManager.setAutoTransition(enabled);
        break;
      default:
        Utils.log('Ungültige Phase-Aktion. Verwende: start, complete, info, auto', 'ERROR');
    }
  }

  async manageAgent(args) {
    const action = args[0];
    const agentName = args[1];
    
    switch (action) {
      case 'activate':
        if (agentName) {
          await this.agentManager.activateAgent(agentName);
        } else {
          Utils.log('Agent-Name erforderlich', 'ERROR');
        }
        break;
      case 'list':
        console.log('\n=== Verfügbare Agenten ===');
        this.agentManager.getAllAgents().forEach(agent => {
          const isActive = this.agentManager.getActiveAgents().includes(agent);
          const health = this.agentManager.getAgentHealth()[agent];
          const status = health ? health.status : 'UNKNOWN';
          console.log(`${agent}: ${isActive ? 'AKTIV' : status}`);
        });
        console.log('==========================\n');
        break;
      case 'health':
        console.log('\n=== Agent-Gesundheit ===');
        const health = this.agentManager.getAgentHealth();
        Object.entries(health).forEach(([name, info]) => {
          console.log(`${name}: ${info.status} (Fehler: ${info.errors}, Letzter Check: ${new Date(info.lastCheck).toLocaleString()})`);
        });
        console.log('==========================\n');
        break;
      default:
        Utils.log('Ungültige Agent-Aktion. Verwende: activate, list, health', 'ERROR');
    }
  }

  async manageDaemon(args) {
    const action = args[0];
    
    switch (action) {
      case 'start':
        await this.daemon.start();
        break;
      case 'stop':
        await this.daemon.stop();
        break;
      case 'status':
        const status = this.daemon.getStatus();
        console.log('\n=== Daemon-Status ===');
        console.log(`Läuft: ${status.isRunning ? 'Ja' : 'Nein'}`);
        console.log(`Aktive Intervals: ${status.intervals}`);
        console.log(`Agent-Gesundheit: ${Object.keys(status.agentHealth).length} Agenten`);
        console.log(`Aufgaben: ${status.taskStats.pending} ausstehend, ${status.taskStats.running} laufend`);
        console.log('=====================\n');
        break;
      default:
        Utils.log('Ungültige Daemon-Aktion. Verwende: start, stop, status', 'ERROR');
    }
  }

  async validateWorkflowState() {
    const isValid = await this.workflowStateManager.validateState();
    if (isValid) {
      Utils.log('Workflow-State ist gültig.', 'SUCCESS');
    } else {
      Utils.log('Workflow-State ist ungültig. Fehlende Abschnitte oder Konflikte.', 'ERROR');
    }
  }

  async manageBackups(args) {
    const action = args[0];
    switch (action) {
      case 'create':
        await this.workflowStateManager.createBackup();
        Utils.log('Workflow-State-Backup erstellt.');
        break;
      case 'list':
        console.log('\n=== Verfügbare Backups ===');
        const backupDir = this.workflowStateManager.backupDir;
        if (fs.existsSync(backupDir)) {
          fs.readdirSync(backupDir).forEach(file => {
            console.log(`- ${file}`);
          });
        } else {
          console.log('Keine Backups gefunden.');
        }
        console.log('===========================\n');
        break;
      case 'restore':
        const backupName = args[1];
        if (!backupName) {
          Utils.log('Backup-Name erforderlich', 'ERROR');
          return;
        }
        const backupPath = path.join(this.workflowStateManager.backupDir, backupName);
        if (fs.existsSync(backupPath)) {
          const newStatePath = this.workflowStateManager.statePath + '.bak';
          fs.copyFileSync(this.workflowStateManager.statePath, newStatePath);
          fs.copyFileSync(backupPath, this.workflowStateManager.statePath);
          Utils.log(`Workflow-State von Backup ${backupName} wiederhergestellt.`);
        } else {
          Utils.log(`Backup ${backupName} nicht gefunden.`, 'ERROR');
        }
        break;
      default:
        Utils.log('Ungültige Backup-Aktion. Verwende: create, list, restore', 'ERROR');
    }
  }

  async runAutonomous() {
    Utils.log('Autonomer Workflow-Modus wird gestartet');
    
    // Alle Phasen automatisch durchlaufen
    for (const phase of CONFIG.PHASES) {
      Utils.log(`Starte autonome Phase: ${phase}`);
      await this.workflowManager.startPhase(phase);
      
      // Warten bis Phase abgeschlossen ist
      const config = this.workflowManager.getPhaseConfig(phase);
      await Utils.sleep(config.duration);
      
      await this.workflowManager.completePhase();
    }
    
    Utils.log('Autonomer Workflow abgeschlossen!', 'SUCCESS');
  }

  showHelp() {
    console.log(`
AI Orchestrator CLI - Multi-Agent Projektmanagement

Verwendung:
  node ai-orchestrator.js <command> [args...]

Befehle:
  start [phase]     Startet den Workflow mit der angegebenen Phase
  status            Zeigt den aktuellen Workflow-Status
  phase <action>    Verwaltet Phasen (start, complete, info, auto)
  agent <action>    Verwaltet Agenten (activate, list, health)
  daemon <action>   Verwaltet den Daemon-Modus (start, stop, status)
  auto              Führt den kompletten Workflow autonom aus
  validate          Validiert den Workflow-State
  backup <action>   Verwaltet Backups (create, list, restore)
  help              Zeigt diese Hilfe

NEUE DAEMON-BEFEHLE:
  daemon start      Startet den kontinuierlichen Daemon-Modus
  daemon stop       Stoppt den Daemon-Modus
  daemon status     Zeigt Daemon-Status

Beispiele:
  node ai-orchestrator.js start ANALYSIS_PHASE
  node ai-orchestrator.js status
  node ai-orchestrator.js phase start BLUEPRINT_PHASE
  node ai-orchestrator.js agent activate security-reviewer
  node ai-orchestrator.js daemon start
  node ai-orchestrator.js auto
  node ai-orchestrator.js validate
  node ai-orchestrator.js backup create

Verfügbare Phasen:
  ${CONFIG.PHASES.join(', ')}

Verfügbare Agenten:
  ${Object.values(CONFIG.AGENTS).join(', ')}

DAEMON-FEATURES:
  - Kontinuierliche Überwachung aller Agenten
  - Automatische Phase-Übergänge
  - Prioritäts-basierte Aufgabenverwaltung
  - Automatische Fehlerbehandlung und Neustarts
  - Echtzeit-Status-Updates
    `);
  }
}

// Mock-Agenten für Demo-Zwecke
class MockAgent {
  constructor(name, role) {
    this.name = name;
    this.role = role;
  }

  async execute() {
    Utils.log(`Mock-Agent ${this.name} (${this.role}) führt Aufgabe aus`);
    
    // Simuliere Arbeitszeit
    const workTime = Math.random() * 5000 + 2000; // 2-7 Sekunden
    await Utils.sleep(workTime);
    
    Utils.log(`Mock-Agent ${this.name} hat Aufgabe abgeschlossen`);
    return true;
  }

  async restart() {
    Utils.log(`Mock-Agent ${this.name} wird neu gestartet`);
    await Utils.sleep(1000);
    Utils.log(`Mock-Agent ${this.name} erfolgreich neu gestartet`);
    return true;
  }
}

// Hauptausführung
async function main() {
  try {
    Utils.log('AI Orchestrator wird initialisiert...');
    
    const cli = new CLI();
    
    Utils.log('AI Orchestrator erfolgreich initialisiert');
    
  } catch (error) {
    Utils.log(`Fehler bei der Initialisierung: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// Nur ausführen wenn direkt aufgerufen
if (require.main === module) {
  main();
}

module.exports = {
  AgentManager,
  WorkflowManager,
  DaemonMode,
  CLI,
  Utils,
  CONFIG
};
