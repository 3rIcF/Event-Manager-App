import { CodeAnalysisResult, CodeIssue, CodeSuggestion, CodeMetrics } from '../types';
import { FileUtils, Logger } from '../utils';
import * as path from 'path';

export class CodeAnalyzer {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  async analyzeFile(filePath: string): Promise<CodeAnalysisResult> {
    this.logger.debug(`Analyzing file: ${filePath}`);
    
    try {
      const content = await FileUtils.readFile(filePath);
      const extension = FileUtils.getFileExtension(filePath);
      
      const issues = await this.findIssues(content, filePath, extension);
      const suggestions = await this.generateSuggestions(content, filePath, extension);
      const metrics = await this.calculateMetrics(content, filePath, extension);
      
      return {
        filePath,
        issues,
        suggestions,
        metrics
      };
    } catch (error) {
      this.logger.error(`Failed to analyze file ${filePath}:`, error);
      throw error;
    }
  }

  async analyzeProject(projectRoot: string, patterns: string[] = ['**/*.{ts,tsx,js,jsx}']): Promise<CodeAnalysisResult[]> {
    this.logger.info(`Analyzing project: ${projectRoot}`);
    
    const results: CodeAnalysisResult[] = [];
    
    for (const pattern of patterns) {
      const files = await FileUtils.findFiles(pattern, { cwd: projectRoot });
      
      for (const file of files) {
        const fullPath = path.join(projectRoot, file);
        try {
          const result = await this.analyzeFile(fullPath);
          results.push(result);
        } catch (error) {
          this.logger.warn(`Skipping file ${file} due to error:`, error);
        }
      }
    }
    
    return results;
  }

  private async findIssues(content: string, filePath: string, extension: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    
    // Basic code quality checks
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Check for console.log statements
      if (line.includes('console.log') && !line.includes('// TODO: Remove console.log')) {
        issues.push({
          type: 'warning',
          message: 'Console.log statement found - consider removing for production',
          line: lineNumber,
          column: line.indexOf('console.log') + 1,
          severity: 'medium'
        });
      }
      
      // Check for TODO comments
      if (line.includes('TODO') || line.includes('FIXME')) {
        issues.push({
          type: 'info',
          message: 'TODO/FIXME comment found',
          line: lineNumber,
          column: line.indexOf('TODO') + 1,
          severity: 'low'
        });
      }
      
      // Check for long lines
      if (line.length > 120) {
        issues.push({
          type: 'warning',
          message: 'Line is too long (>120 characters)',
          line: lineNumber,
          column: 1,
          severity: 'low'
        });
      }
      
      // Check for unused imports (basic check)
      if (extension === '.ts' || extension === '.tsx') {
        if (line.trim().startsWith('import') && line.includes('{') && line.includes('}')) {
          // This is a basic check - in a real implementation you'd use TypeScript compiler API
          if (line.includes('unused')) {
            issues.push({
              type: 'warning',
              message: 'Potentially unused import detected',
              line: lineNumber,
              column: 1,
              severity: 'medium'
            });
          }
        }
      }
    }
    
    return issues;
  }

  private async generateSuggestions(content: string, filePath: string, extension: string): Promise<CodeSuggestion[]> {
    const suggestions: CodeSuggestion[] = [];
    
    // Generate suggestions based on file content and type
    if (extension === '.ts' || extension === '.tsx') {
      // TypeScript specific suggestions
      if (content.includes('any')) {
        suggestions.push({
          type: 'best-practice',
          message: 'Consider replacing "any" types with specific types for better type safety',
          priority: 'high'
        });
      }
      
      if (content.includes('@ts-ignore')) {
        suggestions.push({
          type: 'best-practice',
          message: 'Consider fixing the underlying type issue instead of using @ts-ignore',
          priority: 'medium'
        });
      }
    }
    
    // Performance suggestions
    if (content.includes('forEach') && content.includes('map')) {
      suggestions.push({
        type: 'optimization',
        message: 'Consider using map instead of forEach when you need to transform data',
        priority: 'medium'
      });
    }
    
    // Security suggestions
    if (content.includes('eval(') || content.includes('innerHTML')) {
      suggestions.push({
        type: 'best-practice',
        message: 'Security risk: Avoid using eval() or innerHTML with user input',
        priority: 'high'
      });
    }
    
    return suggestions;
  }

  private async calculateMetrics(content: string, filePath: string, extension: string): Promise<CodeMetrics> {
    const lines = content.split('\n');
    const codeLines = lines.filter(line => line.trim().length > 0 && !line.trim().startsWith('//'));
    const commentLines = lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('/*'));
    
    // Calculate cyclomatic complexity (simplified)
    let complexity = 1; // Base complexity
    const complexityKeywords = ['if', 'else', 'for', 'while', 'case', 'catch', '&&', '||', '?', ':'];
    
    for (const line of codeLines) {
      for (const keyword of complexityKeywords) {
        if (line.includes(keyword)) {
          complexity++;
        }
      }
    }
    
    // Calculate maintainability index (simplified)
    const maintainability = Math.max(0, 100 - (complexity * 2) - (lines.length * 0.1));
    
    // Calculate documentation coverage
    const documentationCoverage = commentLines.length > 0 ? 
      Math.min(100, (commentLines.length / codeLines.length) * 100) : 0;
    
    // Calculate performance score (simplified)
    let performanceScore = 100;
    if (content.includes('forEach')) performanceScore -= 5;
    if (content.includes('eval(')) performanceScore -= 20;
    if (content.includes('innerHTML')) performanceScore -= 10;
    performanceScore = Math.max(0, performanceScore);
    
    return {
      complexity: Math.min(10, complexity), // Cap at 10 for readability
      maintainability: Math.max(0, Math.min(100, maintainability)),
      testCoverage: 0, // This would be calculated from test results
      documentationCoverage: Math.round(documentationCoverage),
      performanceScore
    };
  }

  async generateReport(results: CodeAnalysisResult[]): Promise<string> {
    const totalFiles = results.length;
    const totalIssues = results.reduce((sum, result) => sum + result.issues.length, 0);
    const totalSuggestions = results.reduce((sum, result) => sum + result.suggestions.length, 0);
    
    let report = `# Code Analysis Report\n\n`;
    report += `## Summary\n`;
    report += `- **Files Analyzed**: ${totalFiles}\n`;
    report += `- **Total Issues**: ${totalIssues}\n`;
    report += `- **Total Suggestions**: ${totalSuggestions}\n\n`;
    
    // Group issues by severity
    const issuesBySeverity = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    for (const result of results) {
      for (const issue of result.issues) {
        issuesBySeverity[issue.severity]++;
      }
    }
    
    report += `## Issues by Severity\n`;
    report += `- **Critical**: ${issuesBySeverity.critical}\n`;
    report += `- **High**: ${issuesBySeverity.high}\n`;
    report += `- **Medium**: ${issuesBySeverity.medium}\n`;
    report += `- **Low**: ${issuesBySeverity.low}\n\n`;
    
    // Detailed results
    report += `## Detailed Results\n\n`;
    
    for (const result of results) {
      report += `### ${path.basename(result.filePath)}\n`;
      report += `**Path**: ${result.filePath}\n\n`;
      
      if (result.issues.length > 0) {
        report += `#### Issues\n`;
        for (const issue of result.issues) {
          report += `- **${issue.severity.toUpperCase()}**: ${issue.message}`;
          if (issue.line) report += ` (Line ${issue.line})`;
          report += `\n`;
        }
        report += `\n`;
      }
      
      if (result.suggestions.length > 0) {
        report += `#### Suggestions\n`;
        for (const suggestion of result.suggestions) {
          report += `- **${suggestion.priority.toUpperCase()}**: ${suggestion.message}\n`;
        }
        report += `\n`;
      }
      
      report += `#### Metrics\n`;
      report += `- **Complexity**: ${result.metrics.complexity}/10\n`;
      report += `- **Maintainability**: ${result.metrics.maintainability}/100\n`;
      report += `- **Documentation Coverage**: ${result.metrics.documentationCoverage}%\n`;
      report += `- **Performance Score**: ${result.metrics.performanceScore}/100\n\n`;
    }
    
    return report;
  }
}
