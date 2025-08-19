import React, { createContext, useContext, useEffect, useState } from 'react';
import { themes, Theme, cssVariables, designSystem } from './design-system';

// Theme Context
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Provider Component
export const ThemeProvider: React.FC<{ 
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark';
  storageKey?: string;
}> = ({ 
  children, 
  defaultTheme = 'light',
  storageKey = 'event-manager-theme'
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Try to get theme from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored && themes[stored]) {
        return themes[stored];
      }
    }
    
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return themes.dark;
    }
    
    return themes[defaultTheme];
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newTheme.mode);
    }
  };

  const toggleTheme = () => {
    const newMode = theme.mode === 'light' ? 'dark' : 'light';
    setTheme(themes[newMode]);
  };

  // Apply CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme-specific CSS variables
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Apply theme-specific colors
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-background', theme.background);
    root.style.setProperty('--theme-surface', theme.surface);
    root.style.setProperty('--theme-text', theme.text);
    root.style.setProperty('--theme-text-secondary', theme.textSecondary);
    root.style.setProperty('--theme-border', theme.border);
    root.style.setProperty('--theme-shadow', theme.shadow);

    // Apply theme mode class
    root.classList.remove('light', 'dark');
    root.classList.add(theme.mode);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.primary);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(storageKey) === 'system') {
        const newTheme = e.matches ? themes.dark : themes.light;
        setTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [storageKey]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme.mode === 'dark',
    isLight: theme.mode === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook für Theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Toggle Component
export const ThemeToggle: React.FC<{
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}> = ({ className = '', showIcon = true, showText = true }) => {
  const { toggleTheme, isDark, isLight } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center
        px-3 py-2 rounded-lg
        bg-gray-100 dark:bg-gray-800
        text-gray-700 dark:text-gray-300
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}
      `.trim()}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {showIcon && (
        <>
          {isLight ? (
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          )}
        </>
      )}
      
      {showText && (
        <span className="text-sm font-medium">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};

// Theme-aware Component Wrapper
export const Themed: React.FC<{
  children: React.ReactNode;
  light?: React.ReactNode;
  dark?: React.ReactNode;
  className?: string;
}> = ({ children, light, dark, className = '' }) => {
  const { isDark, isLight } = useTheme();

  if (isLight && light !== undefined) {
    return <div className={className}>{light}</div>;
  }

  if (isDark && dark !== undefined) {
    return <div className={className}>{dark}</div>;
  }

  return <div className={className}>{children}</div>;
};

// CSS Variables für Tailwind Integration
export const generateThemeCSS = (theme: Theme): string => {
  return `
    :root {
      --theme-primary: ${theme.primary};
      --theme-secondary: ${theme.secondary};
      --theme-background: ${theme.background};
      --theme-surface: ${theme.surface};
      --theme-text: ${theme.text};
      --theme-text-secondary: ${theme.textSecondary};
      --theme-border: ${theme.border};
      --theme-shadow: ${theme.shadow};
    }

    .theme-${theme.mode} {
      --theme-primary: ${theme.primary};
      --theme-secondary: ${theme.secondary};
      --theme-background: ${theme.background};
      --theme-surface: ${theme.surface};
      --theme-text: ${theme.text};
      --theme-text-secondary: ${theme.textSecondary};
      --theme-border: ${theme.border};
      --theme-shadow: ${theme.shadow};
    }

    /* Tailwind CSS Integration */
    .bg-theme-primary { background-color: var(--theme-primary); }
    .bg-theme-secondary { background-color: var(--theme-secondary); }
    .bg-theme-background { background-color: var(--theme-background); }
    .bg-theme-surface { background-color: var(--theme-surface); }
    
    .text-theme-primary { color: var(--theme-primary); }
    .text-theme-secondary { color: var(--theme-secondary); }
    .text-theme-text { color: var(--theme-text); }
    .text-theme-text-secondary { color: var(--theme-text-secondary); }
    
    .border-theme-border { border-color: var(--theme-border); }
    .shadow-theme { box-shadow: var(--theme-shadow); }
  `;
};

// Theme Stylesheet Component
export const ThemeStylesheet: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: generateThemeCSS(theme)
      }}
    />
  );
};

// Export default
export default ThemeProvider;
