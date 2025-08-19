import { designSystem } from './design-system';

// Einheitliche Responsive Breakpoints
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Responsive Media Queries
export const media = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  
  // Mobile-first approach
  mobile: `@media (max-width: ${breakpoints.sm})`,
  tablet: `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg})`,
  desktop: `@media (min-width: ${breakpoints.lg})`,
  
  // Orientation
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
  
  // Device-specific
  touch: '@media (hover: none) and (pointer: coarse)',
  mouse: '@media (hover: hover) and (pointer: fine)',
  
  // High DPI displays
  retina: '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
  
  // Reduced motion
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  
  // Dark mode preference
  darkMode: '@media (prefers-color-scheme: dark)',
  lightMode: '@media (prefers-color-scheme: light)',
};

// Responsive Utility Classes
export const responsiveClasses = {
  // Visibility
  hidden: {
    xs: 'hidden',
    sm: 'sm:hidden',
    md: 'md:hidden',
    lg: 'lg:hidden',
    xl: 'xl:hidden',
    '2xl': '2xl:hidden',
  },
  visible: {
    xs: 'block',
    sm: 'sm:block',
    md: 'md:block',
    lg: 'lg:block',
    xl: 'xl:block',
    '2xl': '2xl:block',
  },
  
  // Flexbox
  flex: {
    xs: 'flex',
    sm: 'sm:flex',
    md: 'md:flex',
    lg: 'lg:flex',
    xl: 'xl:flex',
    '2xl': '2xl:flex',
  },
  
  // Grid
  grid: {
    xs: 'grid',
    sm: 'sm:grid',
    md: 'md:grid',
    lg: 'lg:grid',
    xl: 'xl:grid',
    '2xl': '2xl:grid',
  },
  
  // Text alignment
  textCenter: {
    xs: 'text-center',
    sm: 'sm:text-center',
    md: 'md:text-center',
    lg: 'lg:text-center',
    xl: 'xl:text-center',
    '2xl': '2xl:text-center',
  },
  
  // Spacing
  padding: {
    xs: 'p-4',
    sm: 'sm:p-6',
    md: 'md:p-8',
    lg: 'lg:p-10',
    xl: 'xl:p-12',
    '2xl': '2xl:p-16',
  },
  
  margin: {
    xs: 'm-4',
    sm: 'sm:m-6',
    md: 'md:m-8',
    lg: 'lg:m-10',
    xl: 'xl:m-12',
    '2xl': '2xl:m-16',
  },
};

// Responsive Hook für React
export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof typeof breakpoints>('xs');

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= parseInt(breakpoints['2xl'])) {
        setCurrentBreakpoint('2xl');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      } else if (width >= parseInt(breakpoints.xl)) {
        setCurrentBreakpoint('xl');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      } else if (width >= parseInt(breakpoints.lg)) {
        setCurrentBreakpoint('lg');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      } else if (width >= parseInt(breakpoints.md)) {
        setCurrentBreakpoint('md');
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else if (width >= parseInt(breakpoints.sm)) {
        setCurrentBreakpoint('sm');
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else {
        setCurrentBreakpoint('xs');
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      }
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    currentBreakpoint,
    breakpoints,
    media,
  };
};

// Responsive Component Wrapper
export const Responsive = ({ 
  children, 
  mobile, 
  tablet, 
  desktop, 
  breakpoint 
}: {
  children: React.ReactNode;
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  breakpoint?: keyof typeof breakpoints;
}) => {
  const { isMobile, isTablet, isDesktop, currentBreakpoint } = useResponsive();

  if (breakpoint && currentBreakpoint !== breakpoint) {
    return null;
  }

  if (isMobile && mobile !== undefined) {
    return mobile;
  }

  if (isTablet && tablet !== undefined) {
    return tablet;
  }

  if (isDesktop && desktop !== undefined) {
    return desktop;
  }

  return children;
};

// Responsive Grid System
export const ResponsiveGrid = ({ 
  children, 
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 },
  gap = { xs: 4, sm: 6, md: 8, lg: 10, xl: 12, '2xl': 16 },
  className = ''
}: {
  children: React.ReactNode;
  cols?: Partial<Record<keyof typeof breakpoints, number>>;
  gap?: Partial<Record<keyof typeof breakpoints, number>>;
  className?: string;
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const currentCols = cols[currentBreakpoint] || cols.xs || 1;
  const currentGap = gap[currentBreakpoint] || gap.xs || 4;

  return {
    className: `grid grid-cols-${currentCols} gap-${currentGap} ${className}`.trim(),
    children
  };
};

// Responsive Container
export const ResponsiveContainer = ({ 
  children, 
  maxWidth = { xs: '100%', sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
  padding = { xs: 4, sm: 6, md: 8, lg: 10, xl: 12, '2xl': 16 },
  className = ''
}: {
  children: React.ReactNode;
  maxWidth?: Partial<Record<keyof typeof breakpoints, string>>;
  padding?: Partial<Record<keyof typeof breakpoints, number>>;
  className?: string;
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const currentMaxWidth = maxWidth[currentBreakpoint] || maxWidth.xs || '100%';
  const currentPadding = padding[currentBreakpoint] || padding.xs || 4;

  return {
    className: `mx-auto px-${currentPadding} ${className}`.trim(),
    style: { maxWidth: currentMaxWidth },
    children
  };
};

// Utility-Funktionen
export const getBreakpointValue = (breakpoint: keyof typeof breakpoints) => {
  return parseInt(breakpoints[breakpoint]);
};

export const isBreakpointActive = (breakpoint: keyof typeof breakpoints) => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= getBreakpointValue(breakpoint);
};

export const getResponsiveValue = <T>(
  values: Partial<Record<keyof typeof breakpoints, T>>,
  defaultValue: T
): T => {
  const { currentBreakpoint } = useResponsive();
  return values[currentBreakpoint] || defaultValue;
};

// Import React hooks
import React, { useState, useEffect } from 'react';
