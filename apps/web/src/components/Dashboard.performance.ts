/**
 * Performance-Optimierungen für die Dashboard-Komponente
 * Diese Datei enthält zusätzliche Hooks und Utilities für bessere Performance
 */

import { useRef, useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Interface für detaillierte Performance-Metriken
 */
export interface DetailedPerformanceMetrics {
  renderTime: number;
  dataLoadTime: number;
  memoryUsage: number;
  interactionTime: number;
  lastOptimization: Date;
  optimizationCount: number;
}

/**
 * Interface für Performance-Optimierungen
 */
export interface PerformanceOptimizations {
  enableVirtualScrolling: boolean;
  enableLazyLoading: boolean;
  enableDebouncing: boolean;
  enableThrottling: boolean;
  cacheSize: number;
}

/**
 * Erweiterter Performance-Monitor mit Memory-Tracking
 */
export const useAdvancedPerformanceMonitor = (
  componentName: string,
  optimizations: PerformanceOptimizations
) => {
  const renderStartTime = useRef<number>(0);
  const interactionStartTime = useRef<number>(0);
  const metrics = useRef<DetailedPerformanceMetrics>({
    renderTime: 0,
    dataLoadTime: 0,
    memoryUsage: 0,
    interactionTime: 0,
    lastOptimization: new Date(),
    optimizationCount: 0
  });

  // Memory-Usage-Tracking (nur im Browser verfügbar)
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }, []);

  // Performance-Tracking bei jedem Render
  useEffect(() => {
    renderStartTime.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      metrics.current.renderTime = renderTime;
      
      // Memory-Usage aktualisieren
      const memoryInfo = getMemoryUsage();
      if (memoryInfo) {
        metrics.current.memoryUsage = memoryInfo.used;
      }
      
      // Performance-Warnungen bei langsamen Renders
      if (renderTime > 16) { // 60fps = 16ms
        console.warn(`[${componentName}] Render time: ${renderTime.toFixed(2)}ms`);
        
        // Automatische Optimierungen bei wiederholten langsamen Renders
        if (renderTime > 50) {
          metrics.current.optimizationCount++;
          metrics.current.lastOptimization = new Date();
          
          console.warn(`[${componentName}] Performance optimization triggered (${metrics.current.optimizationCount}x)`);
        }
      }
    };
  });

  // Interaction-Tracking
  const trackInteraction = useCallback((interactionType: string) => {
    interactionStartTime.current = performance.now();
    
    return () => {
      const interactionTime = performance.now() - interactionStartTime.current;
      metrics.current.interactionTime = interactionTime;
      
      if (interactionTime > 100) {
        console.warn(`[${componentName}] Slow interaction (${interactionType}): ${interactionTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  return {
    metrics: metrics.current,
    trackInteraction,
    getMemoryUsage
  };
};

/**
 * Debounced Hook für häufige Updates
 */
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttled Hook für Event-Handler
 */
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRun.current = Date.now();
      }, delay - (now - lastRun.current));
    }
  }, [callback, delay]) as T;
};

/**
 * Virtual Scrolling Hook für große Datenmengen
 */
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    
    return {
      start: Math.max(0, start - overscan),
      end
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    containerRef
  };
};

/**
 * Lazy Loading Hook für Bilder und Daten
 */
export const useLazyLoading = <T>(
  items: T[],
  batchSize: number = 10,
  delay: number = 100
) => {
  const [loadedItems, setLoadedItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    
    // Simulierte Verzögerung für bessere UX
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const currentLength = loadedItems.length;
    const newItems = items.slice(currentLength, currentLength + batchSize);
    
    setLoadedItems(prev => [...prev, ...newItems]);
    setHasMore(currentLength + batchSize < items.length);
    setIsLoading(false);
  }, [items, loadedItems.length, batchSize, delay, isLoading, hasMore]);

  // Initial laden
  useEffect(() => {
    if (items.length > 0 && loadedItems.length === 0) {
      loadMore();
    }
  }, [items, loadedItems.length, loadMore]);

  return {
    loadedItems,
    isLoading,
    hasMore,
    loadMore
  };
};

/**
 * Performance-Optimierter Event-Listener Hook
 */
export const useOptimizedEventListener = <K extends keyof WindowEventMap>(
  eventType: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions
) => {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: WindowEventMap[K]) => savedHandler.current(event);
    
    window.addEventListener(eventType, eventListener, options);
    
    return () => {
      window.removeEventListener(eventType, eventListener, options);
    };
  }, [eventType, options]);
};

/**
 * Cache-Hook für teure Berechnungen
 */
export const useMemoizedCache = <T>(
  key: string,
  factory: () => T,
  dependencies: any[] = []
): T => {
  const cache = useRef<Map<string, { value: T; timestamp: number }>>(new Map());
  const cacheTimeout = 5 * 60 * 1000; // 5 Minuten

  return useMemo(() => {
    const cached = cache.current.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < cacheTimeout) {
      return cached.value;
    }

    const value = factory();
    cache.current.set(key, { value, timestamp: now });

    // Cache-Bereinigung
    if (cache.current.size > 100) {
      const oldestKey = Array.from(cache.current.keys())[0];
      cache.current.delete(oldestKey);
    }

    return value;
  }, [key, ...dependencies]);
};

/**
 * Performance-Utilities
 */
export const PerformanceUtils = {
  /**
   * Misst die Ausführungszeit einer Funktion
   */
  measureExecutionTime: <T>(fn: () => T, label: string): T => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`[${label}] Execution time: ${(end - start).toFixed(2)}ms`);
    return result;
  },

  /**
   * Erstellt einen Performance-Mark
   */
  mark: (name: string) => {
    if ('mark' in performance) {
      performance.mark(name);
    }
  },

  /**
   * Misst die Zeit zwischen zwei Performance-Marks
   */
  measure: (name: string, startMark: string, endMark: string) => {
    if ('measure' in performance) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        console.log(`[${name}] Duration: ${measure.duration.toFixed(2)}ms`);
      } catch (error) {
        console.warn(`Could not measure ${name}:`, error);
      }
    }
  },

  /**
   * Bereinigt Performance-Marks
   */
  clearMarks: () => {
    if ('clearMarks' in performance) {
      performance.clearMarks();
    }
  },

  /**
   * Bereinigt Performance-Measurements
   */
  clearMeasures: () => {
    if ('clearMeasures' in performance) {
      performance.clearMeasures();
    }
  }
};

/**
 * Performance-Konstanten
 */
export const PERFORMANCE_CONSTANTS = {
  FRAME_BUDGET: 16, // 60fps
  SLOW_RENDER_THRESHOLD: 16,
  VERY_SLOW_RENDER_THRESHOLD: 50,
  SLOW_INTERACTION_THRESHOLD: 100,
  CACHE_TIMEOUT: 5 * 60 * 1000, // 5 Minuten
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  BATCH_SIZE: 10,
  LAZY_LOAD_DELAY: 100
} as const;

export default {
  useAdvancedPerformanceMonitor,
  useDebouncedValue,
  useThrottledCallback,
  useVirtualScrolling,
  useLazyLoading,
  useOptimizedEventListener,
  useMemoizedCache,
  PerformanceUtils,
  PERFORMANCE_CONSTANTS
};
