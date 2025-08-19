import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import terminalLink from 'terminal-link';

export class Logger {
  private static instance: Logger;
  private logLevel: 'debug' | 'info' | 'warn' | 'error';

  constructor(logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info') {
    this.logLevel = logLevel;
  }

  static getInstance(logLevel?: 'debug' | 'info' | 'warn' | 'error'): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(logLevel);
    }
    return Logger.instance;
  }

  debug(message: string, ...args: any[]): void {
    if (this.logLevel === 'debug') {
      console.log(chalk.gray(`[DEBUG] ${message}`), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (['debug', 'info'].includes(this.logLevel)) {
      console.log(chalk.blue(`[INFO] ${message}`), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (['debug', 'info', 'warn'].includes(this.logLevel)) {
      console.log(chalk.yellow(`[WARN] ${message}`), ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    console.error(chalk.red(`[ERROR] ${message}`), ...args);
  }

  success(message: string, ...args: any[]): void {
    console.log(chalk.green(`[SUCCESS] ${message}`), ...args);
  }

  setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.logLevel = level;
  }
}

export class FileUtils {
  static async findFiles(pattern: string, options: glob.IOptions = {}): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(pattern, options, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }

  static async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf-8');
  }

  static async writeFile(filePath: string, content: string): Promise<void> {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');
  }

  static async fileExists(filePath: string): Promise<boolean> {
    return await fs.pathExists(filePath);
  }

  static async directoryExists(dirPath: string): Promise<boolean> {
    return await fs.pathExists(dirPath);
  }

  static async createDirectory(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
  }

  static async copyFile(source: string, destination: string): Promise<void> {
    await fs.copy(source, destination);
  }

  static async moveFile(source: string, destination: string): Promise<void> {
    await fs.move(source, destination);
  }

  static async deleteFile(filePath: string): Promise<void> {
    await fs.remove(filePath);
  }

  static getFileExtension(filePath: string): string {
    return path.extname(filePath);
  }

  static getFileName(filePath: string): string {
    return path.basename(filePath);
  }

  static getDirectoryPath(filePath: string): string {
    return path.dirname(filePath);
  }

  static isAbsolutePath(filePath: string): boolean {
    return path.isAbsolute(filePath);
  }

  static resolvePath(...paths: string[]): string {
    return path.resolve(...paths);
  }

  static joinPath(...paths: string[]): string {
    return path.join(...paths);
  }
}

export class Spinner {
  private spinner: ora.Ora;

  constructor(text: string = 'Loading...') {
    this.spinner = ora(text);
  }

  start(text?: string): void {
    if (text) {
      this.spinner.text = text;
    }
    this.spinner.start();
  }

  stop(): void {
    this.spinner.stop();
  }

  succeed(text?: string): void {
    this.spinner.succeed(text);
  }

  fail(text?: string): void {
    this.spinner.fail(text);
  }

  warn(text?: string): void {
    this.spinner.warn(text);
  }

  info(text?: string): void {
    this.spinner.info(text);
  }

  setText(text: string): void {
    this.spinner.text = text;
  }
}

export class DisplayUtils {
  static showBanner(title: string, subtitle?: string): void {
    const banner = boxen(
      `${chalk.cyan.bold(title)}\n${subtitle ? chalk.gray(subtitle) : ''}`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
      }
    );
    console.log(banner);
  }

  static showTable(headers: string[], rows: string[][]): void {
    const table = boxen(
      `${headers.join(' | ')}\n${'-'.repeat(headers.join(' | ').length)}\n${rows.map(row => row.join(' | ')).join('\n')}`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'single',
        borderColor: 'blue'
      }
    );
    console.log(banner);
  }

  static showProgress(current: number, total: number, label: string = 'Progress'): void {
    const percentage = Math.round((current / total) * 100);
    const bar = '█'.repeat(Math.floor(percentage / 2)) + '░'.repeat(50 - Math.floor(percentage / 2));
    console.log(`${label}: [${bar}] ${percentage}% (${current}/${total})`);
  }

  static createLink(text: string, url: string): string {
    return terminalLink(text, url);
  }

  static showSuccess(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  static showError(message: string): void {
    console.log(chalk.red('✗'), message);
  }

  static showWarning(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  static showInfo(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }
}

export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidFilePath(filePath: string): boolean {
    return filePath.length > 0 && !filePath.includes('\0');
  }

  static sanitizeFileName(fileName: string): string {
    return fileName.replace(/[<>:"/\\|?*]/g, '_');
  }

  static validateRequired(value: any, fieldName: string): boolean {
    if (value === undefined || value === null || value === '') {
      throw new Error(`${fieldName} is required`);
    }
    return true;
  }
}
