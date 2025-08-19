export interface VibeToolsConfig {
  projectRoot: string;
  configPath: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableNotifications: boolean;
  autoUpdate: boolean;
  providers: {
    openai?: {
      apiKey: string;
      model: string;
    };
    anthropic?: {
      apiKey: string;
      model: string;
    };
    groq?: {
      apiKey: string;
      model: string;
    };
    xai?: {
      apiKey: string;
      model: string;
    };
  };
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
  timestamp: Date;
}

export interface CodeAnalysisResult {
  filePath: string;
  issues: CodeIssue[];
  suggestions: CodeSuggestion[];
  metrics: CodeMetrics;
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CodeSuggestion {
  type: 'refactor' | 'optimization' | 'best-practice';
  message: string;
  code?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface CodeMetrics {
  complexity: number;
  maintainability: number;
  testCoverage: number;
  documentationCoverage: number;
  performanceScore: number;
}

export interface ProjectHealth {
  overall: number;
  categories: {
    codeQuality: number;
    testCoverage: number;
    documentation: number;
    security: number;
    performance: number;
    accessibility: number;
  };
  recommendations: string[];
  lastUpdated: Date;
}

export interface DevelopmentTask {
  id: string;
  title: string;
  description: string;
  type: 'bug' | 'feature' | 'refactor' | 'documentation' | 'test';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assignee?: string;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}
