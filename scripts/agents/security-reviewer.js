#!/usr/bin/env node

/**
 * Security Reviewer Agent
 * 
 * Verantwortlich für:
 * - Security Audits
 * - Vulnerability Assessments
 * - Compliance Checks
 * - Security Best Practices
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SecurityReviewer {
  constructor() {
    this.name = 'security-reviewer';
    this.role = 'Security Reviewer';
    this.projectRoot = process.cwd();
    this.securityResults = {};
  }

  async execute() {
    console.log(`🔒 ${this.role} startet Security-Assessment...`);
    
    try {
      // 1. Dependency-Security-Scan
      await this.scanDependencies();
      
      // 2. Code-Security-Review
      await this.reviewCodeSecurity();
      
      // 3. Configuration-Security-Check
      await this.checkConfigurationSecurity();
      
      // 4. API-Security-Assessment
      await this.assessAPISecurity();
      
      // 5. Database-Security-Review
      await this.reviewDatabaseSecurity();
      
      // 6. Security-Report erstellen
      await this.generateSecurityReport();
      
      console.log(`✅ ${this.role} hat Security-Assessment erfolgreich abgeschlossen`);
      return true;
      
    } catch (error) {
      console.error(`❌ Fehler bei ${this.role}: ${error.message}`);
      return false;
    }
  }

  async scanDependencies() {
    console.log('📦 Scanne Dependencies auf Security-Vulnerabilities...');
    
    const vulnerabilities = {
      npm: await this.scanNPMDependencies(),
      docker: await this.scanDockerDependencies(),
      overall: {}
    };
    
    // Gesamtbewertung
    const scores = [vulnerabilities.npm.score, vulnerabilities.docker.score];
    vulnerabilities.overall = {
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      assessment: this.getSecurityAssessment(vulnerabilities.overall.score)
    };
    
    this.securityResults.dependencies = vulnerabilities;
    console.log('✅ Dependencies gescannt');
  }

  async scanNPMDependencies() {
    const packageFiles = this.findPackageFiles();
    const vulnerabilities = [];
    let totalPackages = 0;
    let vulnerablePackages = 0;
    
    for (const packageFile of packageFiles) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        Object.entries(deps).forEach(([name, version]) => {
          totalPackages++;
          
          // Einfache Security-Checks (in der Praxis würde man npm audit verwenden)
          if (this.isKnownVulnerablePackage(name, version)) {
            vulnerablePackages++;
            vulnerabilities.push({
              package: name,
              version: version,
              severity: 'HIGH',
              description: 'Bekannte Security-Vulnerability'
            });
          }
        });
      } catch (error) {
        console.warn(`⚠️  Konnte ${packageFile} nicht analysieren: ${error.message}`);
      }
    }
    
    const score = totalPackages > 0 ? Math.max(0, 100 - (vulnerablePackages / totalPackages) * 100) : 100;
    
    return {
      score: Math.round(score),
      totalPackages,
      vulnerablePackages,
      vulnerabilities,
      assessment: this.getSecurityAssessment(score)
    };
  }

  async scanDockerDependencies() {
    const dockerFiles = this.findDockerFiles();
    const vulnerabilities = [];
    let totalImages = 0;
    let vulnerableImages = 0;
    
    for (const dockerFile of dockerFiles) {
      try {
        const content = fs.readFileSync(dockerFile, 'utf8');
        const fromMatches = content.match(/FROM\s+([^\s\n]+)/g);
        
        if (fromMatches) {
          fromMatches.forEach(match => {
            const image = match.replace('FROM', '').trim();
            totalImages++;
            
            // Einfache Security-Checks für Docker-Images
            if (this.isKnownVulnerableImage(image)) {
              vulnerableImages++;
              vulnerabilities.push({
                image: image,
                severity: 'MEDIUM',
                description: 'Potentiell veraltetes Base-Image'
              });
            }
          });
        }
      } catch (error) {
        console.warn(`⚠️  Konnte ${dockerFile} nicht analysieren: ${error.message}`);
      }
    }
    
    const score = totalImages > 0 ? Math.max(0, 100 - (vulnerableImages / totalImages) * 100) : 100;
    
    return {
      score: Math.round(score),
      totalImages,
      vulnerableImages,
      vulnerabilities,
      assessment: this.getSecurityAssessment(score)
    };
  }

  findPackageFiles() {
    const packageFiles = [];
    
    // Root package.json
    const rootPackage = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(rootPackage)) {
      packageFiles.push(rootPackage);
    }
    
    // Apps package.json files
    const appsPath = path.join(this.projectRoot, 'apps');
    if (fs.existsSync(appsPath)) {
      const apps = fs.readdirSync(appsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      apps.forEach(app => {
        const appPackage = path.join(appsPath, app, 'package.json');
        if (fs.existsSync(appPackage)) {
          packageFiles.push(appPackage);
        }
      });
    }
    
    // Packages package.json files
    const packagesPath = path.join(this.projectRoot, 'packages');
    if (fs.existsSync(packagesPath)) {
      const packages = fs.readdirSync(packagesPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      packages.forEach(pkg => {
        const pkgPackage = path.join(packagesPath, pkg, 'package.json');
        if (fs.existsSync(pkgPackage)) {
          packageFiles.push(pkgPackage);
        }
      });
    }
    
    return packageFiles;
  }

  findDockerFiles() {
    const dockerFiles = [];
    
    // Root docker-compose.yml
    const rootDockerCompose = path.join(this.projectRoot, 'docker-compose.yml');
    if (fs.existsSync(rootDockerCompose)) {
      dockerFiles.push(rootDockerCompose);
    }
    
    // Infra directory
    const infraPath = path.join(this.projectRoot, 'infra');
    if (fs.existsSync(infraPath)) {
      const infraFiles = fs.readdirSync(infraPath);
      infraFiles.forEach(file => {
        if (file.includes('docker-compose') || file.includes('Dockerfile')) {
          dockerFiles.push(path.join(infraPath, file));
        }
      });
    }
    
    return dockerFiles;
  }

  isKnownVulnerablePackage(name, version) {
    // Einfache Liste bekannter vulnerabler Packages (in der Praxis würde man npm audit verwenden)
    const vulnerablePackages = [
      'lodash', // Beispiel für ein Package mit bekannten Vulnerabilities
      'moment', // Beispiel für ein Package mit bekannten Vulnerabilities
    ];
    
    return vulnerablePackages.includes(name);
  }

  isKnownVulnerableImage(image) {
    // Einfache Checks für Docker-Images
    const vulnerablePatterns = [
      /node:\d+\.\d+$/, // Alte Node.js Versionen ohne Patch-Level
      /alpine:3\.\d+$/, // Alte Alpine Versionen
    ];
    
    return vulnerablePatterns.some(pattern => pattern.test(image));
  }

  async reviewCodeSecurity() {
    console.log('🔍 Überprüfe Code auf Security-Issues...');
    
    const securityIssues = {
      authentication: await this.checkAuthenticationSecurity(),
      authorization: await this.checkAuthorizationSecurity(),
      inputValidation: await this.checkInputValidation(),
      dataProtection: await this.checkDataProtection(),
      overall: {}
    };
    
    // Gesamtbewertung
    const scores = [
      securityIssues.authentication.score,
      securityIssues.authorization.score,
      securityIssues.inputValidation.score,
      securityIssues.dataProtection.score
    ];
    securityIssues.overall = {
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      assessment: this.getSecurityAssessment(securityIssues.overall.score)
    };
    
    this.securityResults.codeSecurity = securityIssues;
    console.log('✅ Code-Security überprüft');
  }

  async checkAuthenticationSecurity() {
    const authPath = path.join(this.projectRoot, 'apps/api/src/auth');
    const issues = [];
    let score = 100;
    
    if (fs.existsSync(authPath)) {
      // Prüfe auf JWT-Implementierung
      const authFiles = fs.readdirSync(authPath);
      const hasJWTStrategy = authFiles.some(f => f.includes('jwt.strategy'));
      const hasAuthGuard = authFiles.some(f => f.includes('.guard'));
      const hasAuthService = authFiles.some(f => f.includes('.service'));
      
      if (!hasJWTStrategy) {
        issues.push('Keine JWT-Strategie implementiert');
        score -= 30;
      }
      
      if (!hasAuthGuard) {
        issues.push('Keine Auth-Guards implementiert');
        score -= 25;
      }
      
      if (!hasAuthService) {
        issues.push('Kein Auth-Service implementiert');
        score -= 25;
      }
      
      // Prüfe auf Password-Hashing
      const authServicePath = path.join(authPath, 'auth.service.ts');
      if (fs.existsSync(authServicePath)) {
        const content = fs.readFileSync(authServicePath, 'utf8');
        if (!content.includes('bcrypt') && !content.includes('argon2')) {
          issues.push('Kein sicheres Password-Hashing implementiert');
          score -= 20;
        }
      }
    } else {
      issues.push('Kein Auth-Modul gefunden');
      score = 0;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      assessment: this.getSecurityAssessment(score)
    };
  }

  async checkAuthorizationSecurity() {
    const issues = [];
    let score = 100;
    
    // Prüfe auf Role-based Access Control
    const backendPath = path.join(this.projectRoot, 'apps/api/src');
    if (fs.existsSync(backendPath)) {
      const modules = fs.readdirSync(backendPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      let hasRoleGuard = false;
      let hasPermissionGuard = false;
      
      modules.forEach(module => {
        const modulePath = path.join(backendPath, module);
        if (fs.existsSync(modulePath)) {
          const files = fs.readdirSync(modulePath);
          if (files.some(f => f.includes('role.guard') || f.includes('permission.guard'))) {
            hasRoleGuard = true;
          }
          if (files.some(f => f.includes('permission.guard'))) {
            hasPermissionGuard = true;
          }
        }
      });
      
      if (!hasRoleGuard) {
        issues.push('Keine Role-based Access Control implementiert');
        score -= 40;
      }
      
      if (!hasPermissionGuard) {
        issues.push('Keine Permission-based Access Control implementiert');
        score -= 30;
      }
    }
    
    return {
      score: Math.max(0, score),
      issues,
      assessment: this.getSecurityAssessment(score)
    };
  }

  async checkInputValidation() {
    const issues = [];
    let score = 100;
    
    // Prüfe auf DTOs und Validation
    const backendPath = path.join(this.projectRoot, 'apps/api/src');
    if (fs.existsSync(backendPath)) {
      const modules = fs.readdirSync(backendPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      let hasDTOs = false;
      let hasValidation = false;
      
      modules.forEach(module => {
        const modulePath = path.join(backendPath, module);
        if (fs.existsSync(modulePath)) {
          const files = fs.readdirSync(modulePath);
          if (files.some(f => f.includes('dto'))) {
            hasDTOs = true;
          }
          if (files.some(f => f.includes('validation') || f.includes('pipe'))) {
            hasValidation = true;
          }
        }
      });
      
      if (!hasDTOs) {
        issues.push('Keine DTOs für Input-Validation implementiert');
        score -= 50;
      }
      
      if (!hasValidation) {
        issues.push('Keine Input-Validation implementiert');
        score -= 50;
      }
    }
    
    return {
      score: Math.max(0, score),
      issues,
      assessment: this.getSecurityAssessment(score)
    };
  }

  async checkDataProtection() {
    const issues = [];
    let score = 100;
    
    // Prüfe auf HTTPS/SSL
    const hasHTTPS = this.checkHTTPSConfiguration();
    if (!hasHTTPS) {
      issues.push('Keine HTTPS-Konfiguration gefunden');
      score -= 30;
    }
    
    // Prüfe auf Environment Variables
    const hasEnvConfig = this.checkEnvironmentConfiguration();
    if (!hasEnvConfig) {
      issues.push('Keine sichere Environment-Variable-Konfiguration');
      score -= 25;
    }
    
    // Prüfe auf CORS-Konfiguration
    const hasCORS = this.checkCORSConfiguration();
    if (!hasCORS) {
      issues.push('Keine CORS-Konfiguration gefunden');
      score -= 25;
    }
    
    // Prüfe auf Rate Limiting
    const hasRateLimiting = this.checkRateLimiting();
    if (!hasRateLimiting) {
      issues.push('Kein Rate Limiting implementiert');
      score -= 20;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      assessment: this.getSecurityAssessment(score)
    };
  }

  checkHTTPSConfiguration() {
    // Prüfe auf SSL-Zertifikate und HTTPS-Konfiguration
    const hasSSL = fs.existsSync(path.join(this.projectRoot, 'ssl')) ||
                   fs.existsSync(path.join(this.projectRoot, 'certs'));
    
    const hasHTTPSConfig = fs.existsSync(path.join(this.projectRoot, 'apps/api/src/main.ts')) &&
                           fs.readFileSync(path.join(this.projectRoot, 'apps/api/src/main.ts'), 'utf8').includes('https');
    
    return hasSSL || hasHTTPSConfig;
  }

  checkEnvironmentConfiguration() {
    const envExample = path.join(this.projectRoot, 'env.example');
    const envSupabase = path.join(this.projectRoot, 'env.supabase.example');
    
    return fs.existsSync(envExample) || fs.existsSync(envSupabase);
  }

  checkCORSConfiguration() {
    const mainPath = path.join(this.projectRoot, 'apps/api/src/main.ts');
    if (fs.existsSync(mainPath)) {
      const content = fs.readFileSync(mainPath, 'utf8');
      return content.includes('enableCors') || content.includes('CORS');
    }
    return false;
  }

  checkRateLimiting() {
    const backendPath = path.join(this.projectRoot, 'apps/api/src');
    if (fs.existsSync(backendPath)) {
      const modules = fs.readdirSync(backendPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      return modules.some(module => {
        const modulePath = path.join(backendPath, module);
        if (fs.existsSync(modulePath)) {
          const files = fs.readdirSync(modulePath);
          return files.some(f => f.includes('throttle') || f.includes('rate') || f.includes('limit'));
        }
        return false;
      });
    }
    return false;
  }

  async checkConfigurationSecurity() {
    console.log('⚙️  Überprüfe Konfiguration auf Security-Issues...');
    
    const configSecurity = {
      environment: await this.checkEnvironmentSecurity(),
      database: await this.checkDatabaseSecurity(),
      api: await this.checkAPIConfigurationSecurity(),
      overall: {}
    };
    
    // Gesamtbewertung
    const scores = [
      configSecurity.environment.score,
      configSecurity.database.score,
      configSecurity.api.score
    ];
    configSecurity.overall = {
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      assessment: this.getSecurityAssessment(configSecurity.overall.score)
    };
    
    this.securityResults.configuration = configSecurity;
    console.log('✅ Konfiguration-Security überprüft');
  }

  async checkEnvironmentSecurity() {
    const issues = [];
    let score = 100;
    
    // Prüfe auf .env.example
    const envExample = path.join(this.projectRoot, 'env.example');
    if (fs.existsSync(envExample)) {
      const content = fs.readFileSync(envExample, 'utf8');
      
      // Prüfe auf sensible Daten
      if (content.includes('SECRET') || content.includes('PASSWORD') || content.includes('KEY')) {
        issues.push('Sensible Daten in .env.example gefunden');
        score -= 40;
      }
      
      // Prüfe auf sichere Defaults
      if (content.includes('admin') || content.includes('123456')) {
        issues.push('Unsichere Default-Werte gefunden');
        score -= 30;
      }
    } else {
      issues.push('Keine .env.example gefunden');
      score -= 20;
    }
    
    // Prüfe auf .env in .gitignore
    const gitignore = path.join(this.projectRoot, '.gitignore');
    if (fs.existsSync(gitignore)) {
      const content = fs.readFileSync(gitignore, 'utf8');
      if (!content.includes('.env')) {
        issues.push('.env nicht in .gitignore aufgenommen');
        score -= 30;
      }
    } else {
      issues.push('Keine .gitignore gefunden');
      score -= 20;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      assessment: this.getSecurityAssessment(score)
    };
  }

  async checkDatabaseSecurity() {
    const issues = [];
    let score = 100;
    
    // Prüfe auf Prisma-Schema
    const prismaPath = path.join(this.projectRoot, 'prisma');
    if (fs.existsSync(prismaPath)) {
      const schemaPath = path.join(prismaPath, 'schema.prisma');
      if (fs.existsSync(schemaPath)) {
        const content = fs.readFileSync(schemaPath, 'utf8');
        
        // Prüfe auf sichere Datenbank-Konfiguration
        if (!content.includes('postgresql://')) {
          issues.push('Keine sichere Datenbank-URL-Konfiguration');
          score -= 25;
        }
        
        // Prüfe auf Audit-Fields
        if (!content.includes('createdAt') && !content.includes('updatedAt')) {
          issues.push('Keine Audit-Fields implementiert');
          score -= 20;
        }
      }
    } else {
      issues.push('Kein Prisma-Schema gefunden');
      score -= 30;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      assessment: this.getSecurityAssessment(score)
    };
  }

  async checkAPIConfigurationSecurity() {
    const issues = [];
    let score = 100;
    
    // Prüfe auf API-Sicherheitskonfiguration
    const mainPath = path.join(this.projectRoot, 'apps/api/src/main.ts');
    if (fs.existsSync(mainPath)) {
      const content = fs.readFileSync(mainPath, 'utf8');
      
      // Prüfe auf Helmet (Security Headers)
      if (!content.includes('helmet')) {
        issues.push('Keine Security Headers (Helmet) konfiguriert');
        score -= 30;
      }
      
      // Prüfe auf Request Size Limits
      if (!content.includes('limit') && !content.includes('bodyParser')) {
        issues.push('Keine Request Size Limits konfiguriert');
        score -= 25;
      }
    } else {
      issues.push('Keine main.ts gefunden');
      score -= 20;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      assessment: this.getSecurityAssessment(score)
    };
  }

  async assessAPISecurity() {
    console.log('🌐 Bewerte API-Security...');
    
    const apiSecurity = {
      endpoints: await this.analyzeAPIEndpoints(),
      authentication: await this.analyzeAPIAuthentication(),
      authorization: await this.analyzeAPIAuthorization(),
      overall: {}
    };
    
    // Gesamtbewertung
    const scores = [
      apiSecurity.endpoints.score,
      apiSecurity.authentication.score,
      apiSecurity.authorization.score
    ];
    apiSecurity.overall = {
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      assessment: this.getSecurityAssessment(apiSecurity.overall.score)
    };
    
    this.securityResults.apiSecurity = apiSecurity;
    console.log('✅ API-Security bewertet');
  }

  async analyzeAPIEndpoints() {
    const issues = [];
    let score = 100;
    
    // Analysiere alle Controller
    const backendPath = path.join(this.projectRoot, 'apps/api/src');
    if (fs.existsSync(backendPath)) {
      const modules = fs.readdirSync(backendPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      let totalEndpoints = 0;
      let securedEndpoints = 0;
      
      modules.forEach(module => {
        const modulePath = path.join(backendPath, module);
        if (fs.existsSync(modulePath)) {
          const files = fs.readdirSync(modulePath);
          const controllers = files.filter(f => f.includes('.controller.'));
          
          controllers.forEach(controller => {
            const controllerPath = path.join(modulePath, controller);
            const content = fs.readFileSync(controllerPath, 'utf8');
            
            // Zähle Endpoints
            const endpointMatches = content.match(/@(Get|Post|Put|Delete|Patch)\(/g);
            if (endpointMatches) {
              totalEndpoints += endpointMatches.length;
            }
            
            // Prüfe auf Security-Decorators
            if (content.includes('@UseGuards') || content.includes('@Public')) {
              securedEndpoints += endpointMatches ? endpointMatches.length : 0;
            }
          });
        }
      });
      
      if (totalEndpoints > 0) {
        const securityPercentage = (securedEndpoints / totalEndpoints) * 100;
        if (securityPercentage < 80) {
          issues.push(`${Math.round(100 - securityPercentage)}% der Endpoints sind nicht gesichert`);
          score -= Math.round((80 - securityPercentage) * 0.5);
        }
      }
    }
    
    return {
      score: Math.max(0, score),
      issues,
      assessment: this.getSecurityAssessment(score)
    };
  }

  async analyzeAPIAuthentication() {
    const issues = [];
    let score = 100;
    
    // Prüfe auf JWT-Implementierung
    const authPath = path.join(this.projectRoot, 'apps/api/src/auth');
    if (fs.existsSync(authPath)) {
      const authFiles = fs.readdirSync(authPath);
      
      if (!authFiles.some(f => f.includes('jwt.strategy'))) {
        issues.push('Keine JWT-Strategie implementiert');
        score -= 40;
      }
      
      if (!authFiles.some(f => f.includes('auth.guard'))) {
        issues.push('Keine Auth-Guards implementiert');
        score -= 30;
      }
      
      if (!authFiles.some(f => f.includes('auth.service'))) {
        issues.push('Kein Auth-Service implementiert');
        score -= 30;
      }
    } else {
      issues.push('Kein Auth-Modul gefunden');
      score = 0;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      assessment: this.getSecurityAssessment(score)
    };
  }

  async analyzeAPIAuthorization() {
    const issues = [];
    let score = 100;
    
    // Prüfe auf Role-based Access Control
    const backendPath = path.join(this.projectRoot, 'apps/api/src');
    if (fs.existsSync(backendPath)) {
      const modules = fs.readdirSync(backendPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      let hasRoleGuard = false;
      let hasPermissionGuard = false;
      
      modules.forEach(module => {
        const modulePath = path.join(backendPath, module);
        if (fs.existsSync(modulePath)) {
          const files = fs.readdirSync(modulePath);
          if (files.some(f => f.includes('role.guard') || f.includes('permission.guard'))) {
            hasRoleGuard = true;
          }
          if (files.some(f => f.includes('permission.guard'))) {
            hasPermissionGuard = true;
          }
        }
      });
      
      if (!hasRoleGuard) {
        issues.push('Keine Role-based Access Control implementiert');
        score -= 50;
      }
      
      if (!hasPermissionGuard) {
        issues.push('Keine Permission-based Access Control implementiert');
        score -= 50;
      }
    }
    
    return {
      score: Math.max(0, score),
      issues,
      assessment: this.getSecurityAssessment(score)
    };
  }

  async reviewDatabaseSecurity() {
    console.log('🗄️  Überprüfe Datenbank-Security...');
    
    const dbSecurity = {
      schema: await this.analyzeDatabaseSchema(),
      access: await this.analyzeDatabaseAccess(),
      encryption: await this.analyzeDatabaseEncryption(),
      overall: {}
    };
    
    // Gesamtbewertung
    const scores = [
      dbSecurity.schema.score,
      dbSecurity.access.score,
      dbSecurity.encryption.score
    ];
    dbSecurity.overall = {
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      assessment: this.getSecurityAssessment(dbSecurity.overall.score)
    };
    
    this.securityResults.databaseSecurity = dbSecurity;
    console.log('✅ Datenbank-Security überprüft');
  }

  async analyzeDatabaseSchema() {
    const issues = [];
    let score = 100;
    
    const prismaPath = path.join(this.projectRoot, 'prisma');
    if (fs.existsSync(prismaPath)) {
      const schemaPath = path.join(prismaPath, 'schema.prisma');
      if (fs.existsSync(schemaPath)) {
        const content = fs.readFileSync(schemaPath, 'utf8');
        
        // Prüfe auf sichere Feld-Definitionen
        if (content.includes('password') && !content.includes('@db.VarChar')) {
          issues.push('Passwort-Felder sollten als VarChar definiert werden');
          score -= 20;
        }
        
        // Prüfe auf Audit-Fields
        if (!content.includes('createdAt') && !content.includes('updatedAt')) {
          issues.push('Keine Audit-Fields implementiert');
          score -= 25;
        }
        
        // Prüfe auf Soft Deletes
        if (!content.includes('deletedAt')) {
          issues.push('Keine Soft Delete-Funktionalität implementiert');
          score -= 20;
        }
      }
    } else {
      issues.push('Kein Prisma-Schema gefunden');
      score -= 30;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      assessment: this.getSecurityAssessment(score)
    };
  }

  async analyzeDatabaseAccess() {
    const issues = [];
    let score = 100;
    
    // Prüfe auf sichere Datenbank-Zugriffe
    const backendPath = path.join(this.projectRoot, 'apps/api/src');
    if (fs.existsSync(backendPath)) {
      const modules = fs.readdirSync(backendPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      let hasPrismaService = false;
      let hasRawQueries = false;
      
      modules.forEach(module => {
        const modulePath = path.join(backendPath, module);
        if (fs.existsSync(modulePath)) {
          const files = fs.readdirSync(modulePath);
          if (files.some(f => f.includes('prisma.service'))) {
            hasPrismaService = true;
          }
          if (files.some(f => f.includes('$queryRaw') || f.includes('$executeRaw'))) {
            hasRawQueries = true;
          }
        }
      });
      
      if (!hasPrismaService) {
        issues.push('Kein Prisma-Service implementiert');
        score -= 30;
      }
      
      if (hasRawQueries) {
        issues.push('Raw SQL Queries gefunden - Sicherheitsrisiko');
        score -= 40;
      }
    }
    
    return {
      score: Math.max(0, score),
      issues,
      assessment: this.getSecurityAssessment(score)
    };
  }

  async analyzeDatabaseEncryption() {
    const issues = [];
    let score = 100;
    
    // Prüfe auf Datenverschlüsselung
    const backendPath = path.join(this.projectRoot, 'apps/api/src');
    if (fs.existsSync(backendPath)) {
      const modules = fs.readdirSync(backendPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      let hasEncryption = false;
      
      modules.forEach(module => {
        const modulePath = path.join(backendPath, module);
        if (fs.existsSync(modulePath)) {
          const files = fs.readdirSync(modulePath);
          if (files.some(f => f.includes('crypto') || f.includes('encrypt') || f.includes('hash'))) {
            hasEncryption = true;
          }
        }
      });
      
      if (!hasEncryption) {
        issues.push('Keine Datenverschlüsselung implementiert');
        score -= 30;
      }
    }
    
    return {
      score: Math.max(0, score),
      issues,
      assessment: this.getSecurityAssessment(score)
    };
  }

  getSecurityAssessment(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Poor';
    return 'Very Poor';
  }

  async generateSecurityReport() {
    console.log('📊 Erstelle Security-Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateSecuritySummary(),
      details: this.securityResults,
      recommendations: this.generateSecurityRecommendations(),
      nextSteps: this.generateSecurityNextSteps()
    };
    
    // Report in Datei schreiben
    const reportPath = path.join(this.projectRoot, 'SECURITY_REPORT.md');
    const reportContent = this.formatSecurityReport(report);
    
    fs.writeFileSync(reportPath, reportContent);
    console.log(`✅ Security-Report erstellt: ${reportPath}`);
    
    this.securityResults.report = report;
  }

  generateSecuritySummary() {
    const dependencies = this.securityResults.dependencies.overall;
    const codeSecurity = this.securityResults.codeSecurity.overall;
    const configuration = this.securityResults.configuration.overall;
    const apiSecurity = this.securityResults.apiSecurity.overall;
    const databaseSecurity = this.securityResults.databaseSecurity.overall;
    
    const overallScore = Math.round((
      dependencies.score + codeSecurity.score + configuration.score + 
      apiSecurity.score + databaseSecurity.score
    ) / 5);
    
    return {
      overallScore,
      securityLevel: this.getSecurityLevel(overallScore),
      dependencies: dependencies.assessment,
      codeSecurity: codeSecurity.assessment,
      configuration: configuration.assessment,
      apiSecurity: apiSecurity.assessment,
      databaseSecurity: databaseSecurity.assessment,
      criticalIssues: this.countCriticalIssues(),
      highIssues: this.countHighIssues(),
      mediumIssues: this.countMediumIssues()
    };
  }

  getSecurityLevel(score) {
    if (score >= 90) return 'VERY HIGH';
    if (score >= 80) return 'HIGH';
    if (score >= 70) return 'MEDIUM';
    if (score >= 60) return 'LOW';
    return 'VERY LOW';
  }

  countCriticalIssues() {
    let count = 0;
    Object.values(this.securityResults).forEach(category => {
      if (category.vulnerabilities) {
        count += category.vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
      }
      if (category.issues) {
        count += category.issues.length;
      }
    });
    return count;
  }

  countHighIssues() {
    let count = 0;
    Object.values(this.securityResults).forEach(category => {
      if (category.vulnerabilities) {
        count += category.vulnerabilities.filter(v => v.severity === 'HIGH').length;
      }
    });
    return count;
  }

  countMediumIssues() {
    let count = 0;
    Object.values(this.securityResults).forEach(category => {
      if (category.vulnerabilities) {
        count += category.vulnerabilities.filter(v => v.severity === 'MEDIUM').length;
      }
    });
    return count;
  }

  generateSecurityRecommendations() {
    const recommendations = [];
    
    // Sammle alle Empfehlungen aus den verschiedenen Kategorien
    Object.values(this.securityResults).forEach(category => {
      if (category.issues) {
        category.issues.forEach(issue => {
          if (issue.includes('implementiert')) {
            recommendations.push(issue.replace('Keine', 'Implementiere').replace('Kein', 'Implementiere'));
          } else if (issue.includes('gefunden')) {
            recommendations.push(issue.replace('gefunden', 'beheben'));
          } else {
            recommendations.push(issue);
          }
        });
      }
    });
    
    return [...new Set(recommendations)]; // Duplikate entfernen
  }

  generateSecurityNextSteps() {
    return [
      'Kritische Security-Issues sofort beheben',
      'Dependency-Updates durchführen',
      'Security-Tests implementieren',
      'Penetration Testing durchführen',
      'Security-Monitoring einrichten',
      'Security-Training für Entwickler durchführen'
    ];
  }

  formatSecurityReport(report) {
    return `# Event Manager App - Security Report

**Erstellt am**: ${new Date(report.timestamp).toLocaleString('de-DE')}
**Agent**: ${this.role}

## Sicherheits-Zusammenfassung

- **Gesamt-Security-Score**: ${report.summary.overallScore}/100
- **Sicherheits-Level**: ${report.summary.securityLevel}
- **Kritische Issues**: ${report.summary.criticalIssues}
- **Hohe Issues**: ${report.summary.highIssues}
- **Mittlere Issues**: ${report.summary.mediumIssues}

## Kategorie-Bewertungen

- **Dependencies**: ${report.summary.dependencies}
- **Code Security**: ${report.summary.codeSecurity}
- **Konfiguration**: ${report.summary.configuration}
- **API Security**: ${report.summary.apiSecurity}
- **Datenbank Security**: ${report.summary.databaseSecurity}

## Detaillierte Analyse

### Dependencies Security
- **Score**: ${report.details.dependencies.overall.score}/100
- **Assessment**: ${report.details.dependencies.overall.assessment}
- **Vulnerable Packages**: ${report.details.dependencies.npm.vulnerablePackages}/${report.details.dependencies.npm.totalPackages}

### Code Security
- **Score**: ${report.details.codeSecurity.overall.score}/100
- **Assessment**: ${report.details.codeSecurity.overall.assessment}
- **Authentication**: ${report.details.codeSecurity.authentication.assessment}
- **Authorization**: ${report.details.codeSecurity.authorization.assessment}
- **Input Validation**: ${report.details.codeSecurity.inputValidation.assessment}
- **Data Protection**: ${report.details.codeSecurity.dataProtection.assessment}

### Konfiguration Security
- **Score**: ${report.details.configuration.overall.score}/100
- **Assessment**: ${report.details.configuration.overall.assessment}
- **Environment**: ${report.details.configuration.environment.assessment}
- **Database**: ${report.details.configuration.database.assessment}
- **API**: ${report.details.configuration.api.assessment}

### API Security
- **Score**: ${report.details.apiSecurity.overall.score}/100
- **Assessment**: ${report.details.apiSecurity.overall.assessment}
- **Endpoints**: ${report.details.apiSecurity.endpoints.assessment}
- **Authentication**: ${report.details.apiSecurity.authentication.assessment}
- **Authorization**: ${report.details.apiSecurity.authorization.assessment}

### Datenbank Security
- **Score**: ${report.details.databaseSecurity.overall.score}/100
- **Assessment**: ${report.details.databaseSecurity.overall.assessment}
- **Schema**: ${report.details.databaseSecurity.schema.assessment}
- **Access**: ${report.details.databaseSecurity.access.assessment}
- **Encryption**: ${report.details.databaseSecurity.encryption.assessment}

## Empfehlungen

${report.recommendations.map(r => `- ${r}`).join('\n')}

## Nächste Schritte

${report.nextSteps.map(s => `- ${s}`).join('\n')}

## Risiko-Bewertung

**Aktuelles Risiko**: ${report.summary.securityLevel === 'VERY HIGH' ? 'Niedrig' : 
                       report.summary.securityLevel === 'HIGH' ? 'Niedrig-Mittel' :
                       report.summary.securityLevel === 'MEDIUM' ? 'Mittel' :
                       report.summary.securityLevel === 'LOW' ? 'Hoch' : 'Sehr Hoch'}

**Empfohlene Maßnahmen**: 
${report.summary.overallScore < 70 ? 'Sofortige Maßnahmen erforderlich' :
  report.summary.overallScore < 80 ? 'Verbesserungen in den nächsten 2 Wochen' :
  report.summary.overallScore < 90 ? 'Verbesserungen in den nächsten 4 Wochen' :
  'Regelmäßige Security-Reviews beibehalten'}

---

*Dieser Report wurde automatisch vom ${this.role} Agenten generiert.*
`;
  }
}

// Export für CLI-Verwendung
if (require.main === module) {
  const reviewer = new SecurityReviewer();
  reviewer.execute().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = SecurityReviewer;
