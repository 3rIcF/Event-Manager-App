import { VibeToolsConfig } from '../types';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export class ConfigManager {
  private config: VibeToolsConfig;
  private configPath: string;

  constructor() {
    this.configPath = this.getDefaultConfigPath();
    this.config = this.loadConfig();
  }

  private getDefaultConfigPath(): string {
    const configDir = path.join(os.homedir(), '.vibetools');
    const configFile = path.join(configDir, 'config.json');
    
    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirpSync(configDir);
    }
    
    return configFile;
  }

  private loadConfig(): VibeToolsConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readJsonSync(this.configPath);
        return this.mergeWithDefaults(configData);
      }
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error);
    }

    return this.getDefaultConfig();
  }

  private getDefaultConfig(): VibeToolsConfig {
    return {
      projectRoot: process.cwd(),
      configPath: this.configPath,
      logLevel: 'info',
      enableNotifications: true,
      autoUpdate: true,
      providers: {}
    };
  }

  private mergeWithDefaults(userConfig: Partial<VibeToolsConfig>): VibeToolsConfig {
    const defaults = this.getDefaultConfig();
    return {
      ...defaults,
      ...userConfig,
      providers: {
        ...defaults.providers,
        ...userConfig.providers
      }
    };
  }

  public getConfig(): VibeToolsConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<VibeToolsConfig>): void {
    this.config = this.mergeWithDefaults(updates);
    this.saveConfig();
  }

  public setProvider(provider: keyof VibeToolsConfig['providers'], config: any): void {
    this.config.providers[provider] = config;
    this.saveConfig();
  }

  public getProvider(provider: keyof VibeToolsConfig['providers']): any {
    return this.config.providers[provider];
  }

  public setProjectRoot(root: string): void {
    this.config.projectRoot = root;
    this.saveConfig();
  }

  public getProjectRoot(): string {
    return this.config.projectRoot;
  }

  private saveConfig(): void {
    try {
      fs.writeJsonSync(this.configPath, this.config, { spaces: 2 });
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  public resetConfig(): void {
    this.config = this.getDefaultConfig();
    this.saveConfig();
  }

  public getConfigPath(): string {
    return this.configPath;
  }
}
