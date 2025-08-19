#!/usr/bin/env node

/**
 * System Architect Agent
 * 
 * Verantwortlich für:
 * - Technische Entscheidungen
 * - Architektur-Reviews
 * - Performance-Optimierung
 * - Tech Stack Updates
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SystemArchitect {
  constructor() {
    this.name = 'system-architect';
    this.role = 'System Architect';
    this.projectRoot = process.cwd();
    this.analysisResults = {};
  }

  async execute() {
    console.log(`🏗️  ${this.role} startet Architektur-Review...`);
    
    try {
      // 1. Projektstruktur analysieren
      await this.analyzeProjectStructure();
      
      // 2. Architektur-Patterns bewerten
      await this.evaluateArchitecturePatterns();
      
      // 3. Performance-Bottlenecks identifizieren
      await this.identifyPerformanceBottlenecks();
      
      // 4. Tech Stack bewerten
      await this.evaluateTechStack();
      
      // 5. Architektur-Report erstellen
      await this.generateArchitectureReport();
      
      console.log(`✅ ${this.role} hat Architektur-Review erfolgreich abgeschlossen`);
      return true;
      
    } catch (error) {
      console.error(`❌ Fehler bei ${this.role}: ${error.message}`);
      return false;
    }
  }

  async analyzeProjectStructure() {
    console.log('📁 Analysiere Projektstruktur...');
    
    const structure = {
      backend: this.analyzeBackendStructure(),
      frontend: this.analyzeFrontendStructure(),
      shared: this.analyzeSharedPackages(),
      infrastructure: this.analyzeInfrastructure()
    };
    
    this.analysisResults.structure = structure;
    console.log('✅ Projektstruktur analysiert');
  }

  analyzeBackendStructure() {
    const backendPath = path.join(this.projectRoot, 'apps/api');
    const structure = {
      modules: [],
      controllers: [],
      services: [],
      dto: [],
      guards: [],
      strategies: []
    };

    if (fs.existsSync(backendPath)) {
      const srcPath = path.join(backendPath, 'src');
      if (fs.existsSync(srcPath)) {
        const modules = fs.readdirSync(srcPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);

        structure.modules = modules;
        
        // Zähle Controller, Services, etc.
        modules.forEach(module => {
          const modulePath = path.join(srcPath, module);
          if (fs.existsSync(modulePath)) {
            const files = fs.readdirSync(modulePath);
            structure.controllers.push(...files.filter(f => f.includes('.controller.')));
            structure.services.push(...files.filter(f => f.includes('.service.')));
            structure.dto.push(...files.filter(f => f.includes('dto')));
            structure.guards.push(...files.filter(f => f.includes('.guard.')));
            structure.strategies.push(...files.filter(f => f.includes('.strategy.')));
          }
        });
      }
    }

    return structure;
  }

  analyzeFrontendStructure() {
    const webPath = path.join(this.projectRoot, 'apps/web');
    const mobilePath = path.join(this.projectRoot, 'apps/mobile-web');
    
    const structure = {
      web: this.analyzeReactApp(webPath),
      mobile: this.analyzeReactApp(mobilePath)
    };

    return structure;
  }

  analyzeReactApp(appPath) {
    if (!fs.existsSync(appPath)) return null;

    const structure = {
      components: [],
      hooks: [],
      utils: [],
      types: []
    };

    const srcPath = path.join(appPath, 'src');
    if (fs.existsSync(srcPath)) {
      const componentsPath = path.join(srcPath, 'components');
      if (fs.existsSync(componentsPath)) {
        structure.components = fs.readdirSync(componentsPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);
      }

      const hooksPath = path.join(srcPath, 'hooks');
      if (fs.existsSync(hooksPath)) {
        structure.hooks = fs.readdirSync(hooksPath)
          .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
      }

      const utilsPath = path.join(srcPath, 'utils');
      if (fs.existsSync(utilsPath)) {
        structure.utils = fs.readdirSync(utilsPath)
          .filter(f => f.endsWith('.ts'));
      }

      const typesPath = path.join(srcPath, 'types');
      if (fs.existsSync(typesPath)) {
        structure.types = fs.readdirSync(typesPath)
          .filter(f => f.endsWith('.ts'));
      }
    }

    return structure;
  }

  analyzeSharedPackages() {
    const packagesPath = path.join(this.projectRoot, 'packages');
    const packages = [];

    if (fs.existsSync(packagesPath)) {
      const packageDirs = fs.readdirSync(packagesPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      packageDirs.forEach(pkg => {
        const packageJsonPath = path.join(packagesPath, pkg, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            packages.push({
              name: pkg,
              version: packageJson.version,
              dependencies: packageJson.dependencies || {},
              devDependencies: packageJson.devDependencies || {}
            });
          } catch (error) {
            console.warn(`⚠️  Konnte package.json für ${pkg} nicht lesen`);
          }
        }
      });
    }

    return packages;
  }

  analyzeInfrastructure() {
    const infraPath = path.join(this.projectRoot, 'infra');
    const dockerComposePath = path.join(this.projectRoot, 'docker-compose.yml');
    const prismaPath = path.join(this.projectRoot, 'prisma');
    
    const infrastructure = {
      docker: fs.existsSync(dockerComposePath),
      dockerCompose: fs.existsSync(dockerComposePath) ? this.analyzeDockerCompose(dockerComposePath) : null,
      database: fs.existsSync(prismaPath) ? this.analyzeDatabase(prismaPath) : null,
      scripts: fs.existsSync(infraPath) ? fs.readdirSync(infraPath) : []
    };

    return infrastructure;
  }

  analyzeDockerCompose(dockerComposePath) {
    try {
      const content = fs.readFileSync(dockerComposePath, 'utf8');
      const services = [];
      
      // Einfache Analyse der Docker-Compose-Datei
      const serviceMatches = content.match(/^\s*(\w+):/gm);
      if (serviceMatches) {
        services.push(...serviceMatches.map(match => match.trim().replace(':', '')));
      }
      
      return {
        services: services,
        hasVolumes: content.includes('volumes:'),
        hasNetworks: content.includes('networks:'),
        hasEnvironment: content.includes('environment:')
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  analyzeDatabase(prismaPath) {
    const schemaPath = path.join(prismaPath, 'schema.prisma');
    const migrationsPath = path.join(prismaPath, 'migrations');
    
    const database = {
      hasSchema: fs.existsSync(schemaPath),
      migrations: fs.existsSync(migrationsPath) ? fs.readdirSync(migrationsPath) : [],
      hasSeed: fs.existsSync(path.join(prismaPath, 'seed.js')) || fs.existsSync(path.join(prismaPath, 'seed.ts'))
    };

    if (database.hasSchema) {
      try {
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');
        database.models = (schemaContent.match(/model\s+(\w+)/g) || []).map(match => match.replace('model ', ''));
        database.datasource = schemaContent.includes('postgresql') ? 'PostgreSQL' : 'Unknown';
      } catch (error) {
        database.schemaError = error.message;
      }
    }

    return database;
  }

  async evaluateArchitecturePatterns() {
    console.log('🏛️  Bewerte Architektur-Patterns...');
    
    const patterns = {
      modularity: this.evaluateModularity(),
      separationOfConcerns: this.evaluateSeparationOfConcerns(),
      dependencyInjection: this.evaluateDependencyInjection(),
      layeredArchitecture: this.evaluateLayeredArchitecture()
    };
    
    this.analysisResults.patterns = patterns;
    console.log('✅ Architektur-Patterns bewertet');
  }

  evaluateModularity() {
    const backendStructure = this.analysisResults.structure.backend;
    const score = Math.min(100, backendStructure.modules.length * 10);
    
    return {
      score: score,
      modules: backendStructure.modules.length,
      assessment: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor',
      recommendations: score < 60 ? ['Mehr Module für bessere Trennung der Zuständigkeiten'] : []
    };
  }

  evaluateSeparationOfConcerns() {
    const backendStructure = this.analysisResults.structure.backend;
    const hasControllers = backendStructure.controllers.length > 0;
    const hasServices = backendStructure.services.length > 0;
    const hasDTOs = backendStructure.dto.length > 0;
    
    let score = 0;
    if (hasControllers) score += 25;
    if (hasServices) score += 25;
    if (hasDTOs) score += 25;
    if (backendStructure.guards.length > 0) score += 25;
    
    return {
      score: score,
      hasControllers: hasControllers,
      hasServices: hasServices,
      hasDTOs: hasDTOs,
      hasGuards: backendStructure.guards.length > 0,
      assessment: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor',
      recommendations: score < 60 ? ['Controller, Services und DTOs implementieren'] : []
    };
  }

  evaluateDependencyInjection() {
    // Prüfe auf NestJS-spezifische Patterns
    const hasModuleFiles = this.analysisResults.structure.backend.modules.some(module => {
      const modulePath = path.join(this.projectRoot, 'apps/api/src', module);
      return fs.existsSync(path.join(modulePath, `${module}.module.ts`));
    });
    
    const score = hasModuleFiles ? 100 : 0;
    
    return {
      score: score,
      hasModules: hasModuleFiles,
      assessment: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor',
      recommendations: score < 60 ? ['NestJS Module für Dependency Injection implementieren'] : []
    };
  }

  evaluateLayeredArchitecture() {
    const backendStructure = this.analysisResults.structure.backend;
    const layers = {
      presentation: backendStructure.controllers.length > 0,
      business: backendStructure.services.length > 0,
      data: this.analysisResults.structure.infrastructure.database.hasSchema
    };
    
    const score = Object.values(layers).filter(Boolean).length * 33.33;
    
    return {
      score: Math.round(score),
      layers: layers,
      assessment: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor',
      recommendations: score < 60 ? ['Alle drei Schichten implementieren (Controller, Services, Data Access)'] : []
    };
  }

  async identifyPerformanceBottlenecks() {
    console.log('⚡ Identifiziere Performance-Bottlenecks...');
    
    const bottlenecks = {
      database: this.analyzeDatabasePerformance(),
      api: this.analyzeAPIPerformance(),
      frontend: this.analyzeFrontendPerformance()
    };
    
    this.analysisResults.performance = bottlenecks;
    console.log('✅ Performance-Bottlenecks identifiziert');
  }

  analyzeDatabasePerformance() {
    const database = this.analysisResults.structure.infrastructure.database;
    
    if (!database.hasSchema) {
      return { score: 0, issues: ['Kein Datenbankschema gefunden'], recommendations: ['Prisma Schema implementieren'] };
    }
    
    const issues = [];
    const recommendations = [];
    let score = 100;
    
    // Prüfe auf Indexes
    if (database.hasSchema) {
      try {
        const schemaContent = fs.readFileSync(path.join(this.projectRoot, 'prisma/schema.prisma'), 'utf8');
        const hasIndexes = schemaContent.includes('@@index') || schemaContent.includes('@id');
        
        if (!hasIndexes) {
          issues.push('Keine Datenbank-Indexes definiert');
          recommendations.push('Primärschlüssel und Indexes für häufige Abfragen definieren');
          score -= 30;
        }
      } catch (error) {
        issues.push('Konnte Schema nicht analysieren');
        score -= 20;
      }
    }
    
    return { score: Math.max(0, score), issues, recommendations };
  }

  analyzeAPIPerformance() {
    const backendStructure = this.analysisResults.structure.backend;
    const issues = [];
    const recommendations = [];
    let score = 100;
    
    // Prüfe auf Caching
    if (!backendStructure.services.some(s => s.includes('cache'))) {
      issues.push('Kein Caching-Service implementiert');
      recommendations.push('Redis oder In-Memory Caching implementieren');
      score -= 25;
    }
    
    // Prüfe auf Rate Limiting
    if (!backendStructure.guards.some(g => g.includes('throttle') || g.includes('rate'))) {
      issues.push('Kein Rate Limiting implementiert');
      recommendations.push('Rate Limiting für API-Endpoints implementieren');
      score -= 25;
    }
    
    return { score: Math.max(0, score), issues, recommendations };
  }

  analyzeFrontendPerformance() {
    const frontendStructure = this.analysisResults.structure.frontend;
    const issues = [];
    const recommendations = [];
    let score = 100;
    
    // Prüfe auf Lazy Loading
    if (!frontendStructure.web?.components.some(c => c.includes('lazy') || c.includes('async'))) {
      issues.push('Kein Lazy Loading implementiert');
      recommendations.push('React.lazy() für Code-Splitting verwenden');
      score -= 30;
    }
    
    // Prüfe auf Bundle-Analyse
    const hasBundleAnalyzer = fs.existsSync(path.join(this.projectRoot, 'apps/web/package.json')) && 
      JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'apps/web/package.json'), 'utf8')).devDependencies?.['@next/bundle-analyzer'];
    
    if (!hasBundleAnalyzer) {
      issues.push('Kein Bundle Analyzer konfiguriert');
      recommendations.push('Bundle Analyzer für Performance-Optimierung einrichten');
      score -= 20;
    }
    
    return { score: Math.max(0, score), issues, recommendations };
  }

  async evaluateTechStack() {
    console.log('🔧 Bewerte Tech Stack...');
    
    const techStack = {
      backend: this.evaluateBackendTechStack(),
      frontend: this.evaluateFrontendTechStack(),
      infrastructure: this.evaluateInfrastructureTechStack(),
      overall: {}
    };
    
    // Gesamtbewertung
    const scores = [techStack.backend.score, techStack.frontend.score, techStack.infrastructure.score];
    techStack.overall = {
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      assessment: this.getAssessment(techStack.overall.score)
    };
    
    this.analysisResults.techStack = techStack;
    console.log('✅ Tech Stack bewertet');
  }

  evaluateBackendTechStack() {
    const score = 85; // NestJS ist ein sehr gutes Framework
    
    return {
      score: score,
      framework: 'NestJS',
      language: 'TypeScript',
      assessment: this.getAssessment(score),
      strengths: ['Moderne Architektur', 'TypeScript Support', 'Dependency Injection', 'Modular Design'],
      improvements: ['Mehr Unit Tests', 'E2E Tests implementieren']
    };
  }

  evaluateFrontendTechStack() {
    const score = 80; // React + TypeScript ist solide
    
    return {
      score: score,
      framework: 'React',
      language: 'TypeScript',
      styling: 'Tailwind CSS',
      assessment: this.getAssessment(score),
      strengths: ['TypeScript Support', 'Moderne Styling-Lösung', 'Component-basierte Architektur'],
      improvements: ['State Management optimieren', 'Performance-Monitoring einrichten']
    };
  }

  evaluateInfrastructureTechStack() {
    const score = 75; // Docker + Prisma ist gut
    
    return {
      score: score,
      containerization: 'Docker',
      database: 'Prisma + PostgreSQL',
      assessment: this.getAssessment(score),
      strengths: ['Container-basierte Bereitstellung', 'Type-safe Database Access'],
      improvements: ['CI/CD Pipeline einrichten', 'Monitoring und Logging verbessern']
    };
  }

  getAssessment(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Poor';
    return 'Very Poor';
  }

  async generateArchitectureReport() {
    console.log('📊 Erstelle Architektur-Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(),
      details: this.analysisResults,
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps()
    };
    
    // Report in Datei schreiben
    const reportPath = path.join(this.projectRoot, 'ARCHITECTURE_REPORT.md');
    const reportContent = this.formatReport(report);
    
    fs.writeFileSync(reportPath, reportContent);
    console.log(`✅ Architektur-Report erstellt: ${reportPath}`);
    
    this.analysisResults.report = report;
  }

  generateSummary() {
    const patterns = this.analysisResults.patterns;
    const performance = this.analysisResults.performance;
    const techStack = this.analysisResults.techStack;
    
    return {
      overallScore: Math.round((patterns.modularity.score + patterns.separationOfConcerns.score + 
                               patterns.dependencyInjection.score + patterns.layeredArchitecture.score) / 4),
      architectureQuality: this.getAssessment(patterns.modularity.score),
      performanceScore: Math.round((performance.database.score + performance.api.score + performance.frontend.score) / 3),
      techStackScore: techStack.overall.score,
      strengths: [
        'Modulare Backend-Architektur mit NestJS',
        'TypeScript-basierte Entwicklung',
        'Container-basierte Infrastruktur'
      ],
      areasForImprovement: [
        'Performance-Monitoring implementieren',
        'CI/CD Pipeline einrichten',
        'Test-Coverage erhöhen'
      ]
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Architektur-Empfehlungen
    Object.values(this.analysisResults.patterns).forEach(pattern => {
      if (pattern.recommendations) {
        recommendations.push(...pattern.recommendations);
      }
    });
    
    // Performance-Empfehlungen
    Object.values(this.analysisResults.performance).forEach(perf => {
      if (perf.recommendations) {
        recommendations.push(...perf.recommendations);
      }
    });
    
    // Tech Stack-Empfehlungen
    Object.values(this.analysisResults.techStack).forEach(tech => {
      if (tech.improvements) {
        recommendations.push(...tech.improvements);
      }
    });
    
    return [...new Set(recommendations)]; // Duplikate entfernen
  }

  generateNextSteps() {
    return [
      'Security-Review durchführen',
      'Performance-Tests implementieren',
      'Monitoring und Logging einrichten',
      'CI/CD Pipeline konfigurieren',
      'Dokumentation aktualisieren'
    ];
  }

  formatReport(report) {
    return `# Event Manager App - Architektur-Report

**Erstellt am**: ${new Date(report.timestamp).toLocaleString('de-DE')}
**Agent**: ${this.role}

## Zusammenfassung

- **Gesamtbewertung**: ${report.summary.architectureQuality} (${report.summary.overallScore}/100)
- **Architektur-Qualität**: ${report.summary.architectureQuality}
- **Performance-Score**: ${report.summary.performanceScore}/100
- **Tech Stack-Score**: ${report.summary.techStackScore}/100

## Stärken

${report.summary.strengths.map(s => `- ${s}`).join('\n')}

## Verbesserungsbereiche

${report.summary.areasForImprovement.map(a => `- ${a}`).join('\n')}

## Detaillierte Analyse

### Architektur-Patterns

- **Modularität**: ${report.details.patterns.modularity.assessment} (${report.details.patterns.modularity.score}/100)
- **Trennung der Zuständigkeiten**: ${report.details.patterns.separationOfConcerns.assessment} (${report.details.patterns.separationOfConcerns.score}/100)
- **Dependency Injection**: ${report.details.patterns.dependencyInjection.assessment} (${report.details.patterns.dependencyInjection.score}/100)
- **Schichtenarchitektur**: ${report.details.patterns.layeredArchitecture.assessment} (${report.details.patterns.layeredArchitecture.score}/100)

### Performance-Analyse

- **Datenbank**: ${report.details.performance.database.score}/100
- **API**: ${report.details.performance.api.score}/100
- **Frontend**: ${report.details.performance.frontend.score}/100

### Tech Stack

- **Backend**: ${report.details.techStack.backend.assessment} (${report.details.techStack.backend.score}/100)
- **Frontend**: ${report.details.techStack.frontend.assessment} (${report.details.techStack.frontend.score}/100)
- **Infrastruktur**: ${report.details.techStack.infrastructure.assessment} (${report.details.techStack.infrastructure.score}/100)

## Empfehlungen

${report.recommendations.map(r => `- ${r}`).join('\n')}

## Nächste Schritte

${report.nextSteps.map(s => `- ${s}`).join('\n')}

---

*Dieser Report wurde automatisch vom ${this.role} Agenten generiert.*
`;
  }
}

// Export für CLI-Verwendung
if (require.main === module) {
  const architect = new SystemArchitect();
  architect.execute().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = SystemArchitect;
