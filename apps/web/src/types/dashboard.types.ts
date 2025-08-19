/**
 * Zentrale Types-Definitionen für das Dashboard-System
 * Diese Datei enthält alle Interfaces, Types und Enums für bessere Wartbarkeit
 */

// ============================================================================
// BASIS-INTERFACES
// ============================================================================

/**
 * Interface für Dashboard-Daten mit umfassender Typisierung
 * @interface DashboardData
 */
export interface DashboardData {
  projects: ProjectMetrics;
  budget: BudgetMetrics;
  suppliers: SupplierMetrics;
  tasks: TaskMetrics;
  permits: PermitMetrics;
  logistics: LogisticsMetrics;
}

/**
 * Interface für Performance-Metriken
 * @interface PerformanceMetrics
 */
export interface PerformanceMetrics {
  renderTime: number;
  dataLoadTime: number;
  lastOptimization: Date;
}

/**
 * Interface für erweiterte Performance-Metriken
 * @interface DetailedPerformanceMetrics
 */
export interface DetailedPerformanceMetrics extends PerformanceMetrics {
  memoryUsage: number;
  interactionTime: number;
  optimizationCount: number;
  averageRenderTime: number;
  peakRenderTime: number;
}

// ============================================================================
// METRIK-INTERFACES
// ============================================================================

/**
 * Interface für Projekt-Metriken
 * @interface ProjectMetrics
 */
export interface ProjectMetrics {
  total: number;
  active: number;
  completed: number;
  pending: number;
  cancelled?: number;
  onHold?: number;
}

/**
 * Interface für Budget-Metriken
 * @interface BudgetMetrics
 */
export interface BudgetMetrics {
  planned: number;
  spent: number;
  remaining: number;
  utilization: number;
  currency?: string;
  lastUpdated?: Date;
}

/**
 * Interface für Lieferanten-Metriken
 * @interface SupplierMetrics
 */
export interface SupplierMetrics {
  total: number;
  available: number;
  performance: number;
  rating?: number;
  lastActivity?: Date;
}

/**
 * Interface für Aufgaben-Metriken
 * @interface TaskMetrics
 */
export interface TaskMetrics {
  total: number;
  completed: number;
  overdue: number;
  completion: number;
  inProgress?: number;
  blocked?: number;
}

/**
 * Interface für Genehmigungs-Metriken
 * @interface PermitMetrics
 */
export interface PermitMetrics {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  expired?: number;
  underReview?: number;
}

/**
 * Interface für Logistik-Metriken
 * @interface LogisticsMetrics
 */
export interface LogisticsMetrics {
  slots: number;
  conflicts: number;
  utilization: number;
  capacity?: number;
  efficiency?: number;
}

// ============================================================================
// TREND-INTERFACES
// ============================================================================

/**
 * Interface für Trend-Daten
 * @interface TrendData
 */
export interface TrendData {
  trend: 'up' | 'down' | 'neutral';
  value: string;
  percentage?: number;
  change?: number;
}

/**
 * Interface für Trend-Berechnungen
 * @interface TrendCalculation
 */
export interface TrendCalculation {
  current: number;
  previous: number;
  change: number;
  percentage: number;
  trend: 'up' | 'down' | 'neutral';
}

// ============================================================================
// PERIOD-INTERFACES
// ============================================================================

/**
 * Verfügbare Zeiträume
 * @type PeriodType
 */
export type PeriodType = 'week' | 'month' | 'quarter' | 'year';

/**
 * Interface für Zeitraum-Konfiguration
 * @interface PeriodConfig
 */
export interface PeriodConfig {
  value: PeriodType;
  label: string;
  days: number;
  format: string;
}

/**
 * Interface für Zeitraum-Auswahl
 * @interface PeriodSelection
 */
export interface PeriodSelection {
  selected: PeriodType;
  available: PeriodType[];
  custom?: {
    start: Date;
    end: Date;
  };
}

// ============================================================================
// STATE-INTERFACES
// ============================================================================

/**
 * Interface für Dashboard-State
 * @interface DashboardState
 */
export interface DashboardState {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  selectedPeriod: PeriodType;
  lastUpdated: Date | null;
  isRefreshing: boolean;
  filters: DashboardFilters;
  viewMode: ViewMode;
}

/**
 * Interface für Dashboard-Filter
 * @interface DashboardFilters
 */
export interface DashboardFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  status?: string[];
  priority?: string[];
  assignee?: string[];
}

/**
 * Interface für View-Modi
 * @interface ViewMode
 */
export interface ViewMode {
  type: 'grid' | 'list' | 'compact' | 'detailed';
  columns?: number;
  showCharts?: boolean;
  showTrends?: boolean;
  showPerformance?: boolean;
}

// ============================================================================
// EVENT-INTERFACES
// ============================================================================

/**
 * Interface für Dashboard-Events
 * @interface DashboardEvent
 */
export interface DashboardEvent {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description: string;
  timestamp: Date;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable?: boolean;
  actionUrl?: string;
}

/**
 * Interface für Event-Handler
 * @interface EventHandler
 */
export interface EventHandler {
  onRefresh: () => void;
  onPeriodChange: (period: PeriodType) => void;
  onFilterChange: (filters: DashboardFilters) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onEventClick: (event: DashboardEvent) => void;
}

// ============================================================================
// PERFORMANCE-INTERFACES
// ============================================================================

/**
 * Interface für Performance-Optimierungen
 * @interface PerformanceOptimizations
 */
export interface PerformanceOptimizations {
  enableVirtualScrolling: boolean;
  enableLazyLoading: boolean;
  enableDebouncing: boolean;
  enableThrottling: boolean;
  enableCaching: boolean;
  cacheSize: number;
  debounceDelay: number;
  throttleDelay: number;
}

/**
 * Interface für Performance-Config
 * @interface PerformanceConfig
 */
export interface PerformanceConfig {
  renderThreshold: number;
  memoryThreshold: number;
  interactionThreshold: number;
  optimizationTrigger: number;
  enableMonitoring: boolean;
  enableLogging: boolean;
}

// ============================================================================
// ACCESSIBILITY-INTERFACES
// ============================================================================

/**
 * Interface für Accessibility-Config
 * @interface AccessibilityConfig
 */
export interface AccessibilityConfig {
  enableScreenReader: boolean;
  enableKeyboardNavigation: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  language: string;
  currency: string;
  dateFormat: string;
}

/**
 * Interface für ARIA-Labels
 * @interface AriaLabels
 */
export interface AriaLabels {
  main: string;
  navigation: string;
  content: string;
  actions: string;
  status: string;
  errors: string;
}

// ============================================================================
// THEME-INTERFACES
// ============================================================================

/**
 * Interface für Theme-Config
 * @interface ThemeConfig
 */
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}

/**
 * Interface für Color-Palette
 * @interface ColorPalette
 */
export interface ColorPalette {
  success: string;
  warning: string;
  error: string;
  info: string;
  neutral: string;
}

// ============================================================================
// VALIDATION-INTERFACES
// ============================================================================

/**
 * Interface für Validierungs-Regeln
 * @interface ValidationRules
 */
export interface ValidationRules {
  required: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

/**
 * Interface für Validierungs-Fehler
 * @interface ValidationError
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Standard-Perioden-Konfiguration
 */
export const PERIOD_CONFIGS: Record<PeriodType, PeriodConfig> = {
  week: { value: 'week', label: 'Woche', days: 7, format: 'dd.MM.yyyy' },
  month: { value: 'month', label: 'Monat', days: 30, format: 'MMMM yyyy' },
  quarter: { value: 'quarter', label: 'Quartal', days: 90, format: 'QQQ yyyy' },
  year: { value: 'year', label: 'Jahr', days: 365, format: 'yyyy' }
} as const;

/**
 * Standard-Performance-Konfiguration
 */
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  renderThreshold: 16, // 60fps
  memoryThreshold: 50 * 1024 * 1024, // 50MB
  interactionThreshold: 100, // 100ms
  optimizationTrigger: 3, // Nach 3 langsamen Renders
  enableMonitoring: true,
  enableLogging: true
} as const;

/**
 * Standard-Accessibility-Konfiguration
 */
export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  enableScreenReader: true,
  enableKeyboardNavigation: true,
  enableHighContrast: false,
  enableReducedMotion: false,
  language: 'de-DE',
  currency: 'EUR',
  dateFormat: 'dd.MM.yyyy'
} as const;

/**
 * Standard-Theme-Konfiguration
 */
export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: 'light',
  primary: '#3B82F6',
  secondary: '#6B7280',
  accent: '#10B981',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111827',
  border: '#E5E7EB'
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Utility Type für optionale Felder
 * @type Optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility Type für erforderliche Felder
 * @type Required
 */
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Utility Type für schreibgeschützte Felder
 * @type Readonly
 */
export type Readonly<T, K extends keyof T> = T & Readonly<Pick<T, K>>;

/**
 * Utility Type für Deep Partial
 * @type DeepPartial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================================================================
// EXPORT
// ============================================================================

// Alle Interfaces und Types sind bereits als named exports verfügbar
// Kein default export erforderlich
