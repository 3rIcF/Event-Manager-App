#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { VibeTools } from './vibetools';
import { ConfigManager } from './config';
import { DisplayUtils, Logger } from './utils';

const program = new Command();
const logger = Logger.getInstance();

// Display VibeTools banner
console.log(chalk.cyan(figlet.textSync('VibeTools', { horizontalLayout: 'full' })));
console.log(chalk.gray('AI-Powered Development Tools for Elementaro Event Planner\n'));

// Initialize VibeTools
const vibetools = new VibeTools();
const configManager = new ConfigManager();

program
  .name('vibetools')
  .description('AI-Powered development utilities and productivity tools')
  .version('1.0.0');

// Install command for setting up development environment
program
  .command('install')
  .description('Install and configure VibeTools for your development environment')
  .option('-e, --environment <env>', 'Development environment (cursor, claude, codex, windsurf, cline, roo)', 'cursor')
  .option('-p, --project <path>', 'Project root path', process.cwd())
  .action(async (options) => {
    try {
      logger.info(`Installing VibeTools for ${options.environment}...`);
      await vibetools.install(options.environment, options.project);
      DisplayUtils.showSuccess('VibeTools installed successfully!');
    } catch (error) {
      logger.error('Installation failed:', error);
      process.exit(1);
    }
  });

// Analyze command for code analysis
program
  .command('analyze')
  .description('Analyze code quality and generate reports')
  .option('-p, --project <path>', 'Project root path', process.cwd())
  .option('-o, --output <file>', 'Output report file')
  .option('-f, --format <format>', 'Output format (markdown, json, html)', 'markdown')
  .action(async (options) => {
    try {
      logger.info('Starting code analysis...');
      const results = await vibetools.analyzeCode(options.project);
      
      if (options.output) {
        await vibetools.generateReport(results, options.output, options.format);
        DisplayUtils.showSuccess(`Report saved to ${options.output}`);
      } else {
        console.log(results);
      }
    } catch (error) {
      logger.error('Code analysis failed:', error);
      process.exit(1);
    }
  });

// Health command for project health check
program
  .command('health')
  .description('Check overall project health and metrics')
  .option('-p, --project <path>', 'Project root path', process.cwd())
  .option('-d, --detailed', 'Show detailed health information')
  .action(async (options) => {
    try {
      logger.info('Checking project health...');
      const health = await vibetools.checkProjectHealth(options.project);
      
      if (options.detailed) {
        console.log(JSON.stringify(health, null, 2));
      } else {
        DisplayUtils.showBanner('Project Health Report');
        console.log(`Overall Health: ${health.overall}/100`);
        console.log(`Code Quality: ${health.categories.codeQuality}/100`);
        console.log(`Test Coverage: ${health.categories.testCoverage}/100`);
        console.log(`Documentation: ${health.categories.documentation}/100`);
        console.log(`Security: ${health.categories.security}/100`);
        console.log(`Performance: ${health.categories.performance}/100`);
      }
    } catch (error) {
      logger.error('Health check failed:', error);
      process.exit(1);
    }
  });

// Generate command for code generation
program
  .command('generate')
  .description('Generate code, tests, or documentation')
  .option('-t, --type <type>', 'Generation type (component, service, test, docs)', 'component')
  .option('-n, --name <name>', 'Name for the generated item')
  .option('-p, --project <path>', 'Project root path', process.cwd())
  .option('-o, --output <path>', 'Output directory')
  .action(async (options) => {
    try {
      if (!options.name) {
        logger.error('Name is required for generation');
        process.exit(1);
      }
      
      logger.info(`Generating ${options.type}: ${options.name}`);
      const result = await vibetools.generateCode(options.type, options.name, options.project, options.output);
      DisplayUtils.showSuccess(`${options.type} generated successfully!`);
      console.log(result);
    } catch (error) {
      logger.error('Code generation failed:', error);
      process.exit(1);
    }
  });

// Test command for running tests
program
  .command('test')
  .description('Run tests and generate coverage reports')
  .option('-p, --project <path>', 'Project root path', process.cwd())
  .option('-w, --watch', 'Run tests in watch mode')
  .option('-c, --coverage', 'Generate coverage report')
  .option('-r, --reporter <reporter>', 'Test reporter (spec, dot, nyan)', 'spec')
  .action(async (options) => {
    try {
      logger.info('Running tests...');
      const results = await vibetools.runTests(options.project, {
        watch: options.watch,
        coverage: options.coverage,
        reporter: options.reporter
      });
      
      if (results.success) {
        DisplayUtils.showSuccess('All tests passed!');
      } else {
        DisplayUtils.showError('Some tests failed');
        process.exit(1);
      }
    } catch (error) {
      logger.error('Test execution failed:', error);
      process.exit(1);
    }
  });

// Security command for security scanning
program
  .command('security')
  .description('Run security vulnerability scans')
  .option('-p, --project <path>', 'Project root path', process.cwd())
  .option('-d, --dependencies', 'Scan dependencies for vulnerabilities')
  .option('-c, --code', 'Scan code for security issues')
  .option('-o, --output <file>', 'Output report file')
  .action(async (options) => {
    try {
      logger.info('Running security scan...');
      const results = await vibetools.scanSecurity(options.project, {
        dependencies: options.dependencies,
        code: options.code
      });
      
      if (options.output) {
        await vibetools.saveSecurityReport(results, options.output);
        DisplayUtils.showSuccess(`Security report saved to ${options.output}`);
      } else {
        console.log(results);
      }
    } catch (error) {
      logger.error('Security scan failed:', error);
      process.exit(1);
    }
  });

// Performance command for performance analysis
program
  .command('performance')
  .description('Analyze application performance')
  .option('-p, --project <path>', 'Project root path', process.cwd())
  .option('-b, --build', 'Analyze build performance')
  .option('-r, --runtime', 'Analyze runtime performance')
  .option('-o, --output <file>', 'Output report file')
  .action(async (options) => {
    try {
      logger.info('Analyzing performance...');
      const results = await vibetools.analyzePerformance(options.project, {
        build: options.build,
        runtime: options.runtime
      });
      
      if (options.output) {
        await vibetools.savePerformanceReport(results, options.output);
        DisplayUtils.showSuccess(`Performance report saved to ${options.output}`);
      } else {
        console.log(results);
      }
    } catch (error) {
      logger.error('Performance analysis failed:', error);
      process.exit(1);
    }
  });

// Config command for configuration management
program
  .command('config')
  .description('Manage VibeTools configuration')
  .option('-s, --set <key=value>', 'Set configuration value')
  .option('-g, --get <key>', 'Get configuration value')
  .option('-l, --list', 'List all configuration')
  .option('-r, --reset', 'Reset configuration to defaults')
  .action(async (options) => {
    try {
      if (options.set) {
        const [key, value] = options.set.split('=');
        configManager.updateConfig({ [key]: value });
        DisplayUtils.showSuccess(`Configuration updated: ${key} = ${value}`);
      } else if (options.get) {
        const config = configManager.getConfig();
        console.log(config[options.get]);
      } else if (options.list) {
        const config = configManager.getConfig();
        console.log(JSON.stringify(config, null, 2));
      } else if (options.reset) {
        configManager.resetConfig();
        DisplayUtils.showSuccess('Configuration reset to defaults');
      } else {
        program.help();
      }
    } catch (error) {
      logger.error('Configuration operation failed:', error);
      process.exit(1);
    }
  });

// Update command for updating VibeTools
program
  .command('update')
  .description('Update VibeTools to the latest version')
  .action(async () => {
    try {
      logger.info('Checking for updates...');
      const updateAvailable = await vibetools.checkForUpdates();
      
      if (updateAvailable) {
        logger.info('Updating VibeTools...');
        await vibetools.update();
        DisplayUtils.showSuccess('VibeTools updated successfully!');
      } else {
        DisplayUtils.showInfo('VibeTools is already up to date');
      }
    } catch (error) {
      logger.error('Update failed:', error);
      process.exit(1);
    }
  });

// Help command
program
  .command('help')
  .description('Show detailed help information')
  .action(() => {
    program.help();
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.help();
}
