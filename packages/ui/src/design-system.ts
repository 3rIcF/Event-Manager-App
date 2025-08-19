// Einheitliches Design System für alle Apps
export const designSystem = {
  // Farben - Einheitliches Schema
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    }
  },

  // Einheitliche Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Einheitliches Spacing
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
  },

  // Einheitliche Typography
  typography: {
    fontSizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    }
  },

  // Einheitliche Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },

  // Einheitliche Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },

  // Einheitliche Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },

  // Einheitliche Z-Index Werte
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  }
};

// CSS-Variablen für Theming
export const cssVariables = {
  // Primary Colors
  '--color-primary-50': designSystem.colors.primary[50],
  '--color-primary-100': designSystem.colors.primary[100],
  '--color-primary-200': designSystem.colors.primary[200],
  '--color-primary-300': designSystem.colors.primary[300],
  '--color-primary-400': designSystem.colors.primary[400],
  '--color-primary-500': designSystem.colors.primary[500],
  '--color-primary-600': designSystem.colors.primary[600],
  '--color-primary-700': designSystem.colors.primary[700],
  '--color-primary-800': designSystem.colors.primary[800],
  '--color-primary-900': designSystem.colors.primary[900],

  // Secondary Colors
  '--color-secondary-50': designSystem.colors.secondary[50],
  '--color-secondary-100': designSystem.colors.secondary[100],
  '--color-secondary-200': designSystem.colors.secondary[200],
  '--color-secondary-300': designSystem.colors.secondary[300],
  '--color-secondary-400': designSystem.colors.secondary[400],
  '--color-secondary-500': designSystem.colors.secondary[500],
  '--color-secondary-600': designSystem.colors.secondary[600],
  '--color-secondary-700': designSystem.colors.secondary[700],
  '--color-secondary-800': designSystem.colors.secondary[800],
  '--color-secondary-900': designSystem.colors.secondary[900],

  // Spacing
  '--spacing-xs': designSystem.spacing.xs,
  '--spacing-sm': designSystem.spacing.sm,
  '--spacing-md': designSystem.spacing.md,
  '--spacing-lg': designSystem.spacing.lg,
  '--spacing-xl': designSystem.spacing.xl,
  '--spacing-2xl': designSystem.spacing['2xl'],
  '--spacing-3xl': designSystem.spacing['3xl'],
  '--spacing-4xl': designSystem.spacing['4xl'],

  // Typography
  '--font-size-xs': designSystem.typography.fontSizes.xs,
  '--font-size-sm': designSystem.typography.fontSizes.sm,
  '--font-size-base': designSystem.typography.fontSizes.base,
  '--font-size-lg': designSystem.typography.fontSizes.lg,
  '--font-size-xl': designSystem.typography.fontSizes.xl,
  '--font-size-2xl': designSystem.typography.fontSizes['2xl'],
  '--font-size-3xl': designSystem.typography.fontSizes['3xl'],
  '--font-size-4xl': designSystem.typography.fontSizes['4xl'],
  '--font-size-5xl': designSystem.typography.fontSizes['5xl'],

  // Border Radius
  '--border-radius-none': designSystem.borderRadius.none,
  '--border-radius-sm': designSystem.borderRadius.sm,
  '--border-radius-base': designSystem.borderRadius.base,
  '--border-radius-md': designSystem.borderRadius.md,
  '--border-radius-lg': designSystem.borderRadius.lg,
  '--border-radius-xl': designSystem.borderRadius.xl,
  '--border-radius-2xl': designSystem.borderRadius['2xl'],
  '--border-radius-full': designSystem.borderRadius.full,

  // Shadows
  '--shadow-sm': designSystem.shadows.sm,
  '--shadow-base': designSystem.shadows.base,
  '--shadow-md': designSystem.shadows.md,
  '--shadow-lg': designSystem.shadows.lg,
  '--shadow-xl': designSystem.shadows.xl,
  '--shadow-2xl': designSystem.shadows['2xl'],

  // Transitions
  '--transition-fast': designSystem.transitions.fast,
  '--transition-normal': designSystem.transitions.normal,
  '--transition-slow': designSystem.transitions.slow,
};

// Utility-Funktionen
export const getColor = (color: string, shade: keyof typeof designSystem.colors.primary = '500') => {
  const colorObj = designSystem.colors[color as keyof typeof designSystem.colors];
  return colorObj ? colorObj[shade] : designSystem.colors.primary[500];
};

export const getSpacing = (size: keyof typeof designSystem.spacing) => {
  return designSystem.spacing[size];
};

export const getBreakpoint = (breakpoint: keyof typeof designSystem.breakpoints) => {
  return designSystem.breakpoints[breakpoint];
};

// Responsive Utilities
export const responsive = {
  xs: `@media (min-width: ${designSystem.breakpoints.xs})`,
  sm: `@media (min-width: ${designSystem.breakpoints.sm})`,
  md: `@media (min-width: ${designSystem.breakpoints.md})`,
  lg: `@media (min-width: ${designSystem.breakpoints.lg})`,
  xl: `@media (min-width: ${designSystem.breakpoints.xl})`,
  '2xl': `@media (min-width: ${designSystem.breakpoints['2xl']})`,
};

// Theme-Interface
export interface Theme {
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
}

// Standard-Themes
export const themes: Record<string, Theme> = {
  light: {
    mode: 'light',
    primary: designSystem.colors.primary[600],
    secondary: designSystem.colors.secondary[600],
    background: designSystem.colors.neutral[50],
    surface: designSystem.colors.neutral[100],
    text: designSystem.colors.neutral[900],
    textSecondary: designSystem.colors.neutral[600],
    border: designSystem.colors.neutral[200],
    shadow: designSystem.shadows.md,
  },
  dark: {
    mode: 'dark',
    primary: designSystem.colors.primary[400],
    secondary: designSystem.colors.secondary[400],
    background: designSystem.colors.neutral[900],
    surface: designSystem.colors.neutral[800],
    text: designSystem.colors.neutral[50],
    textSecondary: designSystem.colors.neutral[400],
    border: designSystem.colors.neutral[700],
    shadow: designSystem.shadows['2xl'],
  },
};
