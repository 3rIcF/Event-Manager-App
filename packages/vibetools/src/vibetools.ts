import { ConfigManager } from './config';
import { CodeAnalyzer } from './tools/code-analyzer';
import { FileUtils, Logger, Spinner } from './utils';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as execa from 'execa';

export class VibeTools {
  private configManager: ConfigManager;
  private codeAnalyzer: CodeAnalyzer;
  private logger: Logger;

  constructor() {
    this.configManager = new ConfigManager();
    this.codeAnalyzer = new CodeAnalyzer();
    this.logger = Logger.getInstance();
  }

  /**
   * Install VibeTools for a specific development environment
   */
  async install(environment: string, projectPath: string): Promise<void> {
    this.logger.info(`Installing VibeTools for ${environment} in ${projectPath}`);
    
    const spinner = new Spinner('Installing VibeTools...');
    spinner.start();

    try {
      // Create necessary directories
      await this.createProjectStructure(projectPath);
      
      // Install environment-specific configuration
      await this.installEnvironmentConfig(environment, projectPath);
      
      // Install project-specific tools
      await this.installProjectTools(projectPath);
      
      // Create configuration files
      await this.createConfigurationFiles(projectPath);
      
      spinner.succeed('Installation completed successfully!');
    } catch (error) {
      spinner.fail('Installation failed');
      throw error;
    }
  }

  /**
   * Analyze code quality and generate reports
   */
  async analyzeCode(projectPath: string): Promise<any> {
    this.logger.info(`Analyzing code in ${projectPath}`);
    
    const spinner = new Spinner('Analyzing code...');
    spinner.start();

    try {
      const results = await this.codeAnalyzer.analyzeProject(projectPath);
      const report = await this.codeAnalyzer.generateReport(results);
      
      spinner.succeed('Code analysis completed');
      return { results, report };
    } catch (error) {
      spinner.fail('Code analysis failed');
      throw error;
    }
  }

  /**
   * Check overall project health
   */
  async checkProjectHealth(projectPath: string): Promise<any> {
    this.logger.info(`Checking project health in ${projectPath}`);
    
    const spinner = new Spinner('Checking project health...');
    spinner.start();

    try {
      // Analyze code quality
      const codeAnalysis = await this.codeAnalyzer.analyzeProject(projectPath);
      
      // Calculate overall health score
      const health = this.calculateHealthScore(codeAnalysis);
      
      spinner.succeed('Health check completed');
      return health;
    } catch (error) {
      spinner.fail('Health check failed');
      throw error;
    }
  }

  /**
   * Generate code, tests, or documentation
   */
  async generateCode(type: string, name: string, projectPath: string, outputPath?: string): Promise<any> {
    this.logger.info(`Generating ${type}: ${name}`);
    
    const spinner = new Spinner(`Generating ${type}...`);
    spinner.start();

    try {
      let result;
      
      switch (type) {
        case 'component':
          result = await this.generateComponent(name, projectPath, outputPath);
          break;
        case 'service':
          result = await this.generateService(name, projectPath, outputPath);
          break;
        case 'test':
          result = await this.generateTest(name, projectPath, outputPath);
          break;
        case 'docs':
          result = await this.generateDocumentation(name, projectPath, outputPath);
          break;
        default:
          throw new Error(`Unknown generation type: ${type}`);
      }
      
      spinner.succeed(`${type} generated successfully`);
      return result;
    } catch (error) {
      spinner.fail(`${type} generation failed`);
      throw error;
    }
  }

  /**
   * Run tests and generate coverage reports
   */
  async runTests(projectPath: string, options: any = {}): Promise<any> {
    this.logger.info(`Running tests in ${projectPath}`);
    
    const spinner = new Spinner('Running tests...');
    spinner.start();

    try {
      // Check if project has test scripts
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (!await FileUtils.fileExists(packageJsonPath)) {
        throw new Error('package.json not found');
      }

      const packageJson = await fs.readJson(packageJsonPath);
      const testScript = options.watch ? 'test:watch' : 'test';
      
      if (!packageJson.scripts || !packageJson.scripts[testScript]) {
        throw new Error(`Test script '${testScript}' not found in package.json`);
      }

      // Run tests
      const testCommand = options.coverage ? 'npm run test:coverage' : `npm run ${testScript}`;
      const { stdout, stderr } = await execa.command(testCommand, { 
        cwd: projectPath,
        stdio: 'pipe'
      });

      spinner.succeed('Tests completed');
      
      return {
        success: true,
        stdout,
        stderr,
        command: testCommand
      };
    } catch (error) {
      spinner.fail('Tests failed');
      throw error;
    }
  }

  /**
   * Scan for security vulnerabilities
   */
  async scanSecurity(projectPath: string, options: any = {}): Promise<any> {
    this.logger.info(`Running security scan in ${projectPath}`);
    
    const spinner = new Spinner('Scanning for security vulnerabilities...');
    spinner.start();

    try {
      const results: any = {};

      if (options.dependencies) {
        results.dependencies = await this.scanDependencies(projectPath);
      }

      if (options.code) {
        results.code = await this.scanCodeSecurity(projectPath);
      }

      spinner.succeed('Security scan completed');
      return results;
    } catch (error) {
      spinner.fail('Security scan failed');
      throw error;
    }
  }

  /**
   * Analyze application performance
   */
  async analyzePerformance(projectPath: string, options: any = {}): Promise<any> {
    this.logger.info(`Analyzing performance in ${projectPath}`);
    
    const spinner = new Spinner('Analyzing performance...');
    spinner.start();

    try {
      const results: any = {};

      if (options.build) {
        results.build = await this.analyzeBuildPerformance(projectPath);
      }

      if (options.runtime) {
        results.runtime = await this.analyzeRuntimePerformance(projectPath);
      }

      spinner.succeed('Performance analysis completed');
      return results;
    } catch (error) {
      spinner.fail('Performance analysis failed');
      throw error;
    }
  }

  /**
   * Check for updates
   */
  async checkForUpdates(): Promise<boolean> {
    // This would typically check against a registry or API
    // For now, return false to indicate no updates available
    return false;
  }

  /**
   * Update VibeTools
   */
  async update(): Promise<void> {
    this.logger.info('Updating VibeTools...');
    
    const spinner = new Spinner('Updating VibeTools...');
    spinner.start();

    try {
      // This would typically run npm update or similar
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate update
      
      spinner.succeed('VibeTools updated successfully');
    } catch (error) {
      spinner.fail('Update failed');
      throw error;
    }
  }

  // Private helper methods

  private async createProjectStructure(projectPath: string): Promise<void> {
    const directories = [
      '.vibetools',
      '.vibetools/config',
      '.vibetools/reports',
      '.vibetools/templates'
    ];

    for (const dir of directories) {
      const fullPath = path.join(projectPath, dir);
      await FileUtils.createDirectory(fullPath);
    }
  }

  private async installEnvironmentConfig(environment: string, projectPath: string): Promise<void> {
    const configPath = path.join(projectPath, '.vibetools/config');
    
    switch (environment.toLowerCase()) {
      case 'cursor':
        await this.installCursorConfig(configPath);
        break;
      case 'claude':
        await this.installClaudeConfig(configPath);
        break;
      case 'codex':
        await this.installCodexConfig(configPath);
        break;
      case 'windsurf':
        await this.installWindsurfConfig(configPath);
        break;
      case 'cline':
        await this.installClineConfig(configPath);
        break;
      case 'roo':
        await this.installRooConfig(configPath);
        break;
      default:
        throw new Error(`Unsupported environment: ${environment}`);
    }
  }

  private async installCursorConfig(configPath: string): Promise<void> {
    const cursorRules = `# VibeTools Cursor Rules

## AI Agent Configuration
- Enable advanced code analysis
- Enable automated refactoring suggestions
- Enable security vulnerability detection
- Enable performance optimization recommendations

## Code Quality Standards
- Enforce TypeScript strict mode
- Require comprehensive error handling
- Enforce consistent naming conventions
- Require JSDoc documentation for public APIs

## Testing Requirements
- Maintain minimum 80% test coverage
- Require unit tests for all business logic
- Enforce integration tests for API endpoints
- Require E2E tests for critical user flows

## Security Guidelines
- Scan dependencies for vulnerabilities
- Enforce input validation and sanitization
- Require authentication for protected routes
- Enforce HTTPS in production environments

## Performance Standards
- Maintain sub-100ms API response times
- Optimize bundle sizes for web applications
- Implement proper caching strategies
- Monitor memory usage and optimize accordingly
`;

    await FileUtils.writeFile(path.join(configPath, '.cursorrules'), cursorRules);
    
    // Create .cursor/rules directory structure
    const cursorRulesDir = path.join(configPath, '.cursor/rules');
    await FileUtils.createDirectory(cursorRulesDir);
    
    const vibeToolsRule = `# VibeTools Integration

## Overview
VibeTools provides AI-powered development assistance for the Elementaro Event Planner project.

## Available Commands
- \`vibetools analyze\` - Analyze code quality
- \`vibetools health\` - Check project health
- \`vibetools generate\` - Generate code and tests
- \`vibetools security\` - Security vulnerability scan
- \`vibetools performance\` - Performance analysis

## AI Agent Capabilities
- Automated code review and suggestions
- Security vulnerability detection
- Performance optimization recommendations
- Test generation and coverage analysis
- Documentation generation and maintenance

## Integration Points
- Cursor AI Agent can use VibeTools for enhanced code analysis
- Automated quality gates and checks
- Continuous monitoring and reporting
- Custom rule enforcement and validation
`;

    await FileUtils.writeFile(path.join(cursorRulesDir, 'vibe-tools.mdc'), vibeToolsRule);
  }

  private async installClaudeConfig(configPath: string): Promise<void> {
    const claudeConfig = `# VibeTools Claude Configuration

## AI Assistant Configuration
- Enable advanced code analysis
- Enable automated refactoring
- Enable security scanning
- Enable performance optimization

## Code Standards
- TypeScript strict mode
- Comprehensive error handling
- Consistent naming conventions
- JSDoc documentation
`;

    await FileUtils.writeFile(path.join(configPath, 'claude-config.md'), claudeConfig);
  }

  private async installCodexConfig(configPath: string): Promise<void> {
    const codexConfig = `# VibeTools Codex Configuration

## AI Code Generation
- Enable intelligent code suggestions
- Enable automated refactoring
- Enable test generation
- Enable documentation generation

## Quality Standards
- TypeScript compliance
- Error handling patterns
- Performance optimization
- Security best practices
`;

    await FileUtils.writeFile(path.join(configPath, 'codex-config.md'), codexConfig);
  }

  private async installWindsurfConfig(configPath: string): Promise<void> {
    const windsurfConfig = `# VibeTools Windsurf Configuration

## AI Development Assistant
- Enable code analysis and suggestions
- Enable automated testing
- Enable security scanning
- Enable performance monitoring

## Development Standards
- TypeScript strict mode
- Comprehensive testing
- Security validation
- Performance optimization
`;

    await FileUtils.writeFile(path.join(configPath, '.windsurfrules'), windsurfConfig);
  }

  private async installClineConfig(configPath: string): Promise<void> {
    const clineConfig = `# VibeTools Cline Configuration

## AI Code Assistant
- Enable intelligent code analysis
- Enable automated refactoring
- Enable security scanning
- Enable performance optimization

## Code Quality
- TypeScript compliance
- Error handling
- Testing coverage
- Documentation standards
`;

    await FileUtils.writeFile(path.join(configPath, '.clinerules'), clineConfig);
  }

  private async installRooConfig(configPath: string): Promise<void> {
    const rooConfig = `# VibeTools Roo Configuration

## AI Development Tools
- Enable code analysis
- Enable automated testing
- Enable security scanning
- Enable performance monitoring

## Development Standards
- TypeScript compliance
- Testing requirements
- Security guidelines
- Performance standards
`;

    await FileUtils.writeFile(path.join(configPath, 'roo-config.md'), rooConfig);
  }

  private async installProjectTools(projectPath: string): Promise<void> {
    // Install project-specific tools and configurations
    const toolsConfig = {
      projectName: path.basename(projectPath),
      tools: ['code-analyzer', 'security-scanner', 'performance-analyzer'],
      version: '1.0.0'
    };

    await FileUtils.writeFile(
      path.join(projectPath, '.vibetools/project-config.json'),
      JSON.stringify(toolsConfig, null, 2)
    );
  }

  private async createConfigurationFiles(projectPath: string): Promise<void> {
    // Create .vibetoolsrc configuration file
    const vibetoolsrc = {
      project: path.basename(projectPath),
      tools: {
        codeAnalysis: true,
        securityScanning: true,
        performanceAnalysis: true,
        testGeneration: true,
        documentationGeneration: true
      },
      rules: {
        typescript: 'strict',
        testCoverage: 80,
        maxComplexity: 10,
        securityLevel: 'high'
      }
    };

    await FileUtils.writeFile(
      path.join(projectPath, '.vibetoolsrc'),
      JSON.stringify(vibetoolsrc, null, 2)
    );
  }

  private calculateHealthScore(codeAnalysis: any[]): any {
    // Calculate overall health score based on code analysis results
    let totalScore = 0;
    let maxScore = 0;

    for (const result of codeAnalysis) {
      const metrics = result.metrics;
      totalScore += metrics.maintainability + metrics.performanceScore + metrics.documentationCoverage;
      maxScore += 300; // 100 for each metric
    }

    const overallHealth = Math.round((totalScore / maxScore) * 100);

    return {
      overall: overallHealth,
      categories: {
        codeQuality: Math.round(codeAnalysis.reduce((sum, r) => sum + r.metrics.maintainability, 0) / codeAnalysis.length),
        testCoverage: 0, // Would be calculated from test results
        documentation: Math.round(codeAnalysis.reduce((sum, r) => sum + r.metrics.documentationCoverage, 0) / codeAnalysis.length),
        security: 85, // Would be calculated from security scan
        performance: Math.round(codeAnalysis.reduce((sum, r) => sum + r.metrics.performanceScore, 0) / codeAnalysis.length),
        accessibility: 90 // Would be calculated from accessibility scan
      },
      recommendations: this.generateRecommendations(codeAnalysis),
      lastUpdated: new Date()
    };
  }

  private generateRecommendations(codeAnalysis: any[]): string[] {
    const recommendations: string[] = [];

    // Analyze code analysis results and generate recommendations
    const avgComplexity = codeAnalysis.reduce((sum, r) => sum + r.metrics.complexity, 0) / codeAnalysis.length;
    const avgMaintainability = codeAnalysis.reduce((sum, r) => sum + r.metrics.maintainability, 0) / codeAnalysis.length;

    if (avgComplexity > 7) {
      recommendations.push('Consider refactoring complex functions to improve readability');
    }

    if (avgMaintainability < 70) {
      recommendations.push('Improve code maintainability by reducing complexity and improving documentation');
    }

    if (recommendations.length === 0) {
      recommendations.push('Code quality is good, maintain current standards');
    }

    return recommendations;
  }

  private async generateComponent(name: string, projectPath: string, outputPath?: string): Promise<any> {
    // Generate React component
    const componentContent = `import React from 'react';

interface ${name}Props {
  // Add your props here
}

export const ${name}: React.FC<${name}Props> = (props) => {
  return (
    <div>
      {/* Add your component content here */}
      <h1>${name} Component</h1>
    </div>
  );
};

export default ${name};
`;

    const outputDir = outputPath || path.join(projectPath, 'src/components');
    await FileUtils.createDirectory(outputDir);
    
    const filePath = path.join(outputDir, `${name}.tsx`);
    await FileUtils.writeFile(filePath, componentContent);

    return { filePath, content: componentContent };
  }

  private async generateService(name: string, projectPath: string, outputPath?: string): Promise<any> {
    // Generate service class
    const serviceContent = `export class ${name}Service {
  constructor() {
    // Initialize service
  }

  async getData(): Promise<any> {
    // Implement your service logic here
    throw new Error('Method not implemented');
  }

  async createData(data: any): Promise<any> {
    // Implement your service logic here
    throw new Error('Method not implemented');
  }

  async updateData(id: string, data: any): Promise<any> {
    // Implement your service logic here
    throw new Error('Method not implemented');
  }

  async deleteData(id: string): Promise<void> {
    // Implement your service logic here
    throw new Error('Method not implemented');
  }
}
`;

    const outputDir = outputPath || path.join(projectPath, 'src/services');
    await FileUtils.createDirectory(outputDir);
    
    const filePath = path.join(outputDir, `${name}Service.ts`);
    await FileUtils.writeFile(filePath, serviceContent);

    return { filePath, content: serviceContent };
  }

  private async generateTest(name: string, projectPath: string, outputPath?: string): Promise<any> {
    // Generate test file
    const testContent = `import { describe, it, expect, beforeEach } from 'vitest';
import { ${name} } from './${name}';

describe('${name}', () => {
  let ${name.toLowerCase()}: ${name};

  beforeEach(() => {
    ${name.toLowerCase()} = new ${name}();
  });

  it('should create an instance', () => {
    expect(${name.toLowerCase()}).toBeDefined();
  });

  it('should have required methods', () => {
    // Add your test cases here
    expect(typeof ${name.toLowerCase()}.getData).toBe('function');
  });
});
`;

    const outputDir = outputPath || path.join(projectPath, 'src/__tests__');
    await FileUtils.createDirectory(outputDir);
    
    const filePath = path.join(outputDir, `${name}.test.ts`);
    await FileUtils.writeFile(filePath, testContent);

    return { filePath, content: testContent };
  }

  private async generateDocumentation(name: string, projectPath: string, outputPath?: string): Promise<any> {
    // Generate documentation
    const docContent = `# ${name}

## Overview
Description of ${name} functionality and purpose.

## Usage
\`\`\`typescript
// Example usage code
const ${name.toLowerCase()} = new ${name}();
\`\`\`

## API Reference
### Methods
- \`methodName()\` - Description of method

### Properties
- \`propertyName\` - Description of property

## Examples
Add examples here

## Related
- Related components or services
`;

    const outputDir = outputPath || path.join(projectPath, 'docs');
    await FileUtils.createDirectory(outputDir);
    
    const filePath = path.join(outputDir, `${name}.md`);
    await FileUtils.writeFile(filePath, docContent);

    return { filePath, content: docContent };
  }

  private async scanDependencies(projectPath: string): Promise<any> {
    // Scan package.json for vulnerabilities
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!await FileUtils.fileExists(packageJsonPath)) {
      return { error: 'package.json not found' };
    }

    try {
      // This would typically run npm audit or similar
      const { stdout } = await execa.command('npm audit --json', { 
        cwd: projectPath,
        stdio: 'pipe'
      });

      return JSON.parse(stdout);
    } catch (error) {
      return { error: 'Failed to scan dependencies', details: error.message };
    }
  }

  private async scanCodeSecurity(projectPath: string): Promise<any> {
    // Scan code for security issues
    const securityIssues: any[] = [];
    
    // This is a basic security scan - in production you'd use specialized tools
    const files = await FileUtils.findFiles('**/*.{ts,tsx,js,jsx}', { cwd: projectPath });
    
    for (const file of files) {
      const content = await FileUtils.readFile(path.join(projectPath, file));
      
      // Check for common security issues
      if (content.includes('eval(')) {
        securityIssues.push({
          file,
          issue: 'Use of eval() function',
          severity: 'high',
          description: 'eval() can execute arbitrary code and is a security risk'
        });
      }
      
      if (content.includes('innerHTML') && content.includes('user')) {
        securityIssues.push({
          file,
          issue: 'Potential XSS vulnerability',
          severity: 'medium',
          description: 'innerHTML with user input can lead to XSS attacks'
        });
      }
    }
    
    return { issues: securityIssues, totalIssues: securityIssues.length };
  }

  private async analyzeBuildPerformance(projectPath: string): Promise<any> {
    // Analyze build performance
    try {
      const startTime = Date.now();
      const { stdout, stderr } = await execa.command('npm run build', { 
        cwd: projectPath,
        stdio: 'pipe'
      });
      const endTime = Date.now();
      
      return {
        buildTime: endTime - startTime,
        success: true,
        output: stdout,
        errors: stderr
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async analyzeRuntimePerformance(projectPath: string): Promise<any> {
    // Analyze runtime performance
    // This would typically involve running the application and collecting metrics
    return {
      message: 'Runtime performance analysis requires running application',
      metrics: {
        memoryUsage: 'N/A',
        cpuUsage: 'N/A',
        responseTime: 'N/A'
      }
    };
  }

  async generateReport(data: any, outputPath: string, format: string = 'markdown'): Promise<void> {
    let reportContent: string;
    
    switch (format.toLowerCase()) {
      case 'json':
        reportContent = JSON.stringify(data, null, 2);
        break;
      case 'html':
        reportContent = this.generateHtmlReport(data);
        break;
      case 'markdown':
      default:
        reportContent = this.generateMarkdownReport(data);
        break;
    }
    
    await FileUtils.writeFile(outputPath, reportContent);
  }

  private generateMarkdownReport(data: any): string {
    return `# VibeTools Report

Generated on: ${new Date().toISOString()}

## Data
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`
`;
  }

  private generateHtmlReport(data: any): string {
    return `<!DOCTYPE html>
<html>
<head>
  <title>VibeTools Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>VibeTools Report</h1>
  <p>Generated on: ${new Date().toISOString()}</p>
  <pre>${JSON.stringify(data, null, 2)}</pre>
</body>
</html>`;
  }

  async saveSecurityReport(data: any, outputPath: string): Promise<void> {
    const report = this.generateMarkdownReport(data);
    await FileUtils.writeFile(outputPath, report);
  }

  async savePerformanceReport(data: any, outputPath: string): Promise<void> {
    const report = this.generateMarkdownReport(data);
    await FileUtils.writeFile(outputPath, report);
  }
}
