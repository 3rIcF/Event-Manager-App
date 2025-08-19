/**
 * Erweiterter Performance-Monitoring Hook für das Dashboard
 * Dieser Hook überwacht Render-Zeiten, Memory-Usage und Interaktionen
 */

import { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { 
  DetailedPerformanceMetrics, 
  PerformanceConfig, 
  DEFAULT_PERFORMANCE_CONFIG 
} from '../types/dashboard.types';

/**
 * Interface für Performance-Optimierungen
 */
interface PerformanceOptimizations {
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
 * Interface für Memory-Informationen
 */
interface MemoryInfo {
  used: number;
  total: number;
  limit: number;
  percentage: number;
}

/**
 * Interface für Performance-Warnungen
 */
interface PerformanceWarning {
  type: 'render' | 'memory' | 'interaction' | 'optimization';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
}

/**
 * Hook für erweiterte Performance-Überwachung
 * @param componentName Name der Komponente für besseres Logging
 * @param config Performance-Konfiguration
 * @param optimizations Performance-Optimierungen
 */
export const useDashboardPerformance = (
  componentName: string,
  config: Partial<PerformanceConfig> = {},
  optimizations: Partial<PerformanceOptimizations> = {}
) => {
  // Standard-Konfiguration mit benutzerdefinierten Werten überschreiben
  const finalConfig = useMemo(() => ({
    ...DEFAULT_PERFORMANCE_CONFIG,
    ...config
  }), [config]);

  // Performance-Metriken
  const metrics = useRef<DetailedPerformanceMetrics>({
    renderTime: 0,
    dataLoadTime: 0,
    lastOptimization: new Date(),
    memoryUsage: 0,
    interactionTime: 0,
    optimizationCount: 0,
    averageRenderTime: 0,
    peakRenderTime: 0
  });

  // Performance-Warnungen
  const [warnings, setWarnings] = useState<PerformanceWarning[]>([]);
  
  // Render-Zeit-Tracking
  const renderStartTime = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);
  
  // Interaction-Tracking
  const interactionStartTime = useRef<number>(0);
  const interactionTimes = useRef<number[]>([]);
  
  // Memory-Tracking
  const memoryHistory = useRef<MemoryInfo[]>([]);
  
  // Performance-Marks für detaillierte Analyse
  const performanceMarks = useRef<Map<string, number>>(new Map());

  /**
   * Memory-Usage abrufen (nur im Browser verfügbar)
   */
  const getMemoryUsage = useCallback((): MemoryInfo | null => {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize;
      const total = memory.totalJSHeapSize;
      const limit = memory.jsHeapSizeLimit;
      
      return {
        used,
        total,
        limit,
        percentage: (used / limit) * 100
      };
    }
    return null;
  }, []);

  /**
   * Performance-Mark setzen
   */
  const setMark = useCallback((name: string) => {
    const timestamp = performance.now();
    performanceMarks.current.set(name, timestamp);
    
    if (finalConfig.enableLogging) {
      console.log(`[${componentName}] Mark set: ${name} at ${timestamp.toFixed(2)}ms`);
    }
  }, [componentName, finalConfig.enableLogging]);

  /**
   * Performance-Mark messen
   */
  const measureMark = useCallback((name: string, startMark: string, endMark: string) => {
    try {
      const start = performanceMarks.current.get(startMark);
      const end = performanceMarks.current.get(endMark);
      
      if (start && end) {
        const duration = end - start;
        
        if (finalConfig.enableLogging) {
          console.log(`[${componentName}] Measure ${name}: ${duration.toFixed(2)}ms`);
        }
        
        return duration;
      }
    } catch (error) {
      console.warn(`[${componentName}] Could not measure ${name}:`, error);
    }
    
    return 0;
  }, [componentName, finalConfig.enableLogging]);

  /**
   * Performance-Warnung hinzufügen
   */
  const addWarning = useCallback((warning: Omit<PerformanceWarning, 'timestamp'>) => {
    const newWarning: PerformanceWarning = {
      ...warning,
      timestamp: new Date()
    };
    
    setWarnings(prev => [...prev, newWarning]);
    
    if (finalConfig.enableLogging) {
      console.warn(`[${componentName}] ${warning.message}`, warning.data);
    }
  }, [componentName, finalConfig.enableLogging]);

  /**
   * Render-Zeit überwachen
   */
  useEffect(() => {
    renderStartTime.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
    
    return () => {
      const renderTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - renderStartTime.current;
      
      // Metriken aktualisieren
      metrics.current.renderTime = renderTime;
      renderTimes.current.push(renderTime);
      
      // Durchschnittliche Render-Zeit berechnen
      if (renderTimes.current.length > 0) {
        const sum = renderTimes.current.reduce((acc, time) => acc + time, 0);
        metrics.current.averageRenderTime = sum / renderTimes.current.length;
      }
      
      // Peak Render-Zeit aktualisieren
      if (renderTime > metrics.current.peakRenderTime) {
        metrics.current.peakRenderTime = renderTime;
      }
      
      // Performance-Warnungen bei langsamen Renders
      if (renderTime > finalConfig.renderThreshold) {
        addWarning({
          type: 'render',
          message: `Slow render: ${renderTime.toFixed(2)}ms (threshold: ${finalConfig.renderThreshold}ms)`,
          severity: renderTime > finalConfig.renderThreshold * 2 ? 'high' : 'medium',
          data: { renderTime, threshold: finalConfig.renderThreshold }
        });
        
        // Automatische Optimierungen bei wiederholten langsamen Renders
        if (renderTime > finalConfig.renderThreshold * 3) {
          metrics.current.optimizationCount++;
          metrics.current.lastOptimization = new Date();
          
          addWarning({
            type: 'optimization',
            message: `Performance optimization triggered (${metrics.current.optimizationCount}x)`,
            severity: 'critical',
            data: { 
              renderTime, 
              optimizationCount: metrics.current.optimizationCount,
              threshold: finalConfig.renderThreshold * 3
            }
          });
        }
      }
      
      // Render-Zeit-Historie begrenzen (letzte 100 Renders)
      if (renderTimes.current.length > 100) {
        renderTimes.current = renderTimes.current.slice(-100);
      }
    };
  });

  /**
   * Memory-Usage überwachen
   */
  useEffect(() => {
    const memoryInfo = getMemoryUsage();
    
    if (memoryInfo) {
      metrics.current.memoryUsage = memoryInfo.used;
      memoryHistory.current.push(memoryInfo);
      
      // Memory-Historie begrenzen (letzte 50 Einträge)
      if (memoryHistory.current.length > 50) {
        memoryHistory.current = memoryHistory.current.slice(-50);
      }
      
      // Memory-Warnungen bei hohem Verbrauch
      if (memoryInfo.used > finalConfig.memoryThreshold) {
        addWarning({
          type: 'memory',
          message: `High memory usage: ${(memoryInfo.used / 1024 / 1024).toFixed(2)}MB (threshold: ${(finalConfig.memoryThreshold / 1024 / 1024).toFixed(2)}MB)`,
          severity: memoryInfo.used > finalConfig.memoryThreshold * 1.5 ? 'high' : 'medium',
          data: { 
            used: memoryInfo.used, 
            threshold: finalConfig.memoryThreshold,
            percentage: memoryInfo.percentage
          }
        });
      }
    }
  }, [getMemoryUsage, finalConfig.memoryThreshold, addWarning]);

  /**
   * Interaction-Tracking
   */
  const trackInteraction = useCallback((interactionType: string) => {
    interactionStartTime.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
    
    return () => {
      const interactionTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - interactionStartTime.current;
      
      // Metriken aktualisieren
      metrics.current.interactionTime = interactionTime;
      interactionTimes.current.push(interactionTime);
      
      // Interaction-Zeit-Historie begrenzen (letzte 50 Einträge)
      if (interactionTimes.current.length > 50) {
        interactionTimes.current = interactionTimes.current.slice(-50);
      }
      
      // Performance-Warnungen bei langsamen Interaktionen
      if (interactionTime > finalConfig.interactionThreshold) {
        addWarning({
          type: 'interaction',
          message: `Slow interaction (${interactionType}): ${interactionTime.toFixed(2)}ms (threshold: ${finalConfig.interactionThreshold}ms)`,
          severity: interactionTime > finalConfig.interactionThreshold * 2 ? 'high' : 'medium',
          data: { interactionTime, threshold: finalConfig.interactionThreshold, type: interactionType }
        });
      }
    };
  }, [finalConfig.interactionThreshold, addWarning]);

  /**
   * Performance-Report generieren
   */
  const generateReport = useCallback(() => {
    const report = {
      component: componentName,
      timestamp: new Date(),
      metrics: { ...metrics.current },
      warnings: warnings.length,
      memoryHistory: memoryHistory.current.length,
      renderHistory: renderTimes.current.length,
      interactionHistory: interactionTimes.current.length,
      recommendations: [] as string[]
    };
    
    // Empfehlungen basierend auf Metriken
    if (metrics.current.averageRenderTime > finalConfig.renderThreshold) {
      report.recommendations.push('Consider using React.memo for expensive components');
    }
    
    if (metrics.current.memoryUsage > finalConfig.memoryThreshold * 0.8) {
      report.recommendations.push('Monitor memory usage and consider cleanup strategies');
    }
    
    if (warnings.length > 10) {
      report.recommendations.push('High number of performance warnings - review component optimization');
    }
    
    return report;
  }, [componentName, metrics, warnings, finalConfig, memoryHistory, renderTimes, interactionTimes]);

  /**
   * Performance-Metriken zurücksetzen
   */
  const resetMetrics = useCallback(() => {
    metrics.current = {
      renderTime: 0,
      dataLoadTime: 0,
      lastOptimization: new Date(),
      memoryUsage: 0,
      interactionTime: 0,
      optimizationCount: 0,
      averageRenderTime: 0,
      peakRenderTime: 0
    };
    
    renderTimes.current = [];
    interactionTimes.current = [];
    memoryHistory.current = [];
    performanceMarks.current.clear();
    setWarnings([]);
    
    if (finalConfig.enableLogging) {
      console.log(`[${componentName}] Performance metrics reset`);
    }
  }, [componentName, finalConfig.enableLogging]);

  /**
   * Performance-Metriken exportieren
   */
  const exportMetrics = useCallback(() => {
    const data = {
      metrics: { ...metrics.current },
      warnings: [...warnings],
      memoryHistory: [...memoryHistory.current],
      renderHistory: [...renderTimes.current],
      interactionHistory: [...interactionTimes.current],
      performanceMarks: Object.fromEntries(performanceMarks.current)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${componentName}-performance-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [componentName, metrics, warnings, memoryHistory, renderTimes, interactionTimes, performanceMarks]);

  /**
   * Performance-Überwachung aktivieren/deaktivieren
   */
  const toggleMonitoring = useCallback((enabled: boolean) => {
    if (finalConfig.enableMonitoring !== enabled) {
      finalConfig.enableMonitoring = enabled;
      
      if (finalConfig.enableLogging) {
        console.log(`[${componentName}] Performance monitoring ${enabled ? 'enabled' : 'disabled'}`);
      }
    }
  }, [componentName, finalConfig]);

  return {
    // Metriken
    metrics: metrics.current,
    
    // Warnings
    warnings,
    
    // Funktionen
    setMark,
    measureMark,
    trackInteraction,
    generateReport,
    resetMetrics,
    exportMetrics,
    toggleMonitoring,
    
    // Utility-Funktionen
    getMemoryUsage,
    addWarning
  };
};

/**
 * Hook für Performance-Optimierungen
 */
export const usePerformanceOptimizations = (
  config: Partial<PerformanceOptimizations> = {}
) => {
  const [optimizations, setOptimizations] = useState<PerformanceOptimizations>({
    enableVirtualScrolling: false,
    enableLazyLoading: false,
    enableDebouncing: true,
    enableThrottling: true,
    enableCaching: true,
    cacheSize: 100,
    debounceDelay: 300,
    throttleDelay: 100,
    ...config
  });

  const updateOptimization = useCallback((key: keyof PerformanceOptimizations, value: any) => {
    setOptimizations(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const toggleOptimization = useCallback((key: keyof PerformanceOptimizations) => {
    setOptimizations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const resetOptimizations = useCallback(() => {
    setOptimizations({
      enableVirtualScrolling: false,
      enableLazyLoading: false,
      enableDebouncing: true,
      enableThrottling: true,
      enableCaching: true,
      cacheSize: 100,
      debounceDelay: 300,
      throttleDelay: 100
    });
  }, []);

  return {
    optimizations,
    updateOptimization,
    toggleOptimization,
    resetOptimizations
  };
};

/**
 * Hook für Performance-Benchmarks
 */
export const usePerformanceBenchmark = (componentName: string) => {
  const [benchmarks, setBenchmarks] = useState<Map<string, number[]>>(new Map());
  
  const startBenchmark = useCallback((name: string) => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setBenchmarks(prev => {
        const newBenchmarks = new Map(prev);
        const existing = newBenchmarks.get(name) || [];
        newBenchmarks.set(name, [...existing, duration]);
        return newBenchmarks;
      });
      
      return duration;
    };
  }, []);
  
  const getBenchmarkStats = useCallback((name: string) => {
    const times = benchmarks.get(name) || [];
    if (times.length === 0) return null;
    
    const sum = times.reduce((acc, time) => acc + time, 0);
    const avg = sum / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    return { count: times.length, average: avg, min, max, sum };
  }, [benchmarks]);
  
  const clearBenchmarks = useCallback(() => {
    setBenchmarks(new Map());
  }, []);
  
  return {
    startBenchmark,
    getBenchmarkStats,
    clearBenchmarks,
    benchmarks
  };
};

export default {
  useDashboardPerformance,
  usePerformanceOptimizations,
  usePerformanceBenchmark
};
