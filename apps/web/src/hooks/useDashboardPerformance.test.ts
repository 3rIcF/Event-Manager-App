import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  useDashboardPerformance, 
  usePerformanceOptimizations, 
  usePerformanceBenchmark 
} from './useDashboardPerformance';

// Mock der Performance API
const mockPerformance = {
  now: vi.fn(() => 1000),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024, // 100MB
    jsHeapSizeLimit: 200 * 1024 * 1024 // 200MB
  }
};

// Mock der Performance API global
Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock der console-Methoden
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {})
};

describe('useDashboardPerformance Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
  });

  afterEach(() => {
    consoleSpy.log.mockClear();
    consoleSpy.warn.mockClear();
    consoleSpy.error.mockClear();
  });

  describe('Basis-Funktionalität', () => {
    it('sollte mit Standard-Konfiguration initialisiert werden', () => {
      const { result } = renderHook(() => 
        useDashboardPerformance('TestComponent')
      );

      expect(result.current.metrics).toBeDefined();
      expect(result.current.warnings).toEqual([]);
      expect(result.current.setMark).toBeDefined();
      expect(result.current.measureMark).toBeDefined();
      expect(result.current.trackInteraction).toBeDefined();
    });

    it('sollte benutzerdefinierte Konfiguration verwenden', () => {
      const customConfig = {
        renderThreshold: 32,
        memoryThreshold: 100 * 1024 * 1024, // 100MB
        enableLogging: false
      };

      const { result } = renderHook(() => 
        useDashboardPerformance('TestComponent', customConfig)
      );

      expect(result.current.metrics).toBeDefined();
    });
  });

  describe('Performance-Marks', () => {
    it('sollte Performance-Marks setzen können', () => {
      const { result } = renderHook(() => 
        useDashboardPerformance('TestComponent')
      );

      act(() => {
        result.current.setMark('test-start');
      });

      expect(result.current.setMark).toBeDefined();
    });

    it('sollte Performance-Marks messen können', () => {
      const { result } = renderHook(() => 
        useDashboardPerformance('TestComponent')
      );

      act(() => {
        result.current.setMark('start');
        result.current.setMark('end');
        const duration = result.current.measureMark('test', 'start', 'end');
        expect(duration).toBe(0); // Da wir die Performance API mocken
      });
    });
  });

  describe('Memory-Tracking', () => {
    it('sollte Memory-Usage abrufen können', () => {
      const { result } = renderHook(() => 
        useDashboardPerformance('TestComponent')
      );

      const memoryInfo = result.current.getMemoryUsage();
      
      expect(memoryInfo).toBeDefined();
      if (memoryInfo) {
        expect(memoryInfo.used).toBe(50 * 1024 * 1024);
        expect(memoryInfo.total).toBe(100 * 1024 * 1024);
        expect(memoryInfo.limit).toBe(200 * 1024 * 1024);
        expect(memoryInfo.percentage).toBe(25);
      }
    });
  });

  describe('Performance-Warnungen', () => {
    it('sollte Performance-Warnungen hinzufügen können', () => {
      const { result } = renderHook(() => 
        useDashboardPerformance('TestComponent')
      );

      act(() => {
        result.current.addWarning({
          type: 'render',
          message: 'Test warning',
          severity: 'medium'
        });
      });

      expect(result.current.warnings).toHaveLength(1);
      expect(result.current.warnings[0].message).toBe('Test warning');
      expect(result.current.warnings[0].type).toBe('render');
      expect(result.current.warnings[0].severity).toBe('medium');
    });

    it('sollte Warnungen mit Timestamp versehen', () => {
      const { result } = renderHook(() => 
        useDashboardPerformance('TestComponent')
      );

      act(() => {
        result.current.addWarning({
          type: 'memory',
          message: 'Memory warning',
          severity: 'high'
        });
      });

      expect(result.current.warnings[0].timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Interaction-Tracking', () => {
    it('sollte Interaktionen tracken können', () => {
      const { result } = renderHook(() => 
        useDashboardPerformance('TestComponent')
      );

      let endTracking: (() => void) | undefined;

      act(() => {
        endTracking = result.current.trackInteraction('button-click');
      });

      expect(endTracking).toBeDefined();

      if (endTracking) {
        act(() => {
          endTracking();
        });
      }
    });
  });

  describe('Performance-Report', () => {
    it('sollte Performance-Report generieren können', () => {
      const { result } = renderHook(() => 
        useDashboardPerformance('TestComponent')
      );

      const report = result.current.generateReport();

      expect(report.component).toBe('TestComponent');
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.metrics).toBeDefined();
      expect(report.warnings).toBe(0);
      expect(report.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Metriken zurücksetzen', () => {
    it('sollte alle Metriken zurücksetzen können', () => {
      const { result } = renderHook(() => 
        useDashboardPerformance('TestComponent')
      );

      // Zuerst eine Warnung hinzufügen
      act(() => {
        result.current.addWarning({
          type: 'render',
          message: 'Test warning',
          severity: 'low'
        });
      });

      expect(result.current.warnings).toHaveLength(1);

      // Dann zurücksetzen
      act(() => {
        result.current.resetMetrics();
      });

      expect(result.current.warnings).toHaveLength(0);
    });
  });

  describe('Performance-Überwachung', () => {
    it('sollte Überwachung aktivieren/deaktivieren können', () => {
      const { result } = renderHook(() => 
        useDashboardPerformance('TestComponent')
      );

      act(() => {
        result.current.toggleMonitoring(false);
      });

      // Da wir die Konfiguration direkt modifizieren, können wir das testen
      expect(result.current.toggleMonitoring).toBeDefined();
    });
  });
});

describe('usePerformanceOptimizations Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sollte mit Standard-Optimierungen initialisiert werden', () => {
    const { result } = renderHook(() => usePerformanceOptimizations());

    expect(result.current.optimizations.enableVirtualScrolling).toBe(false);
    expect(result.current.optimizations.enableLazyLoading).toBe(false);
    expect(result.current.optimizations.enableDebouncing).toBe(true);
    expect(result.current.optimizations.enableThrottling).toBe(true);
    expect(result.current.optimizations.enableCaching).toBe(true);
  });

  it('sollte benutzerdefinierte Optimierungen verwenden', () => {
    const customOptimizations = {
      enableVirtualScrolling: true,
      enableLazyLoading: true,
      cacheSize: 200
    };

    const { result } = renderHook(() => 
      usePerformanceOptimizations(customOptimizations)
    );

    expect(result.current.optimizations.enableVirtualScrolling).toBe(true);
    expect(result.current.optimizations.enableLazyLoading).toBe(true);
    expect(result.current.optimizations.cacheSize).toBe(200);
  });

  it('sollte einzelne Optimierungen aktualisieren können', () => {
    const { result } = renderHook(() => usePerformanceOptimizations());

    act(() => {
      result.current.updateOptimization('cacheSize', 500);
    });

    expect(result.current.optimizations.cacheSize).toBe(500);
  });

  it('sollte Optimierungen umschalten können', () => {
    const { result } = renderHook(() => usePerformanceOptimizations());

    act(() => {
      result.current.toggleOptimization('enableVirtualScrolling');
    });

    expect(result.current.optimizations.enableVirtualScrolling).toBe(true);
  });

  it('sollte alle Optimierungen zurücksetzen können', () => {
    const { result } = renderHook(() => usePerformanceOptimizations());

    // Zuerst einige Optimierungen ändern
    act(() => {
      result.current.updateOptimization('cacheSize', 500);
      result.current.toggleOptimization('enableVirtualScrolling');
    });

    expect(result.current.optimizations.cacheSize).toBe(500);
    expect(result.current.optimizations.enableVirtualScrolling).toBe(true);

    // Dann zurücksetzen
    act(() => {
      result.current.resetOptimizations();
    });

    expect(result.current.optimizations.cacheSize).toBe(100);
    expect(result.current.optimizations.enableVirtualScrolling).toBe(false);
  });
});

describe('usePerformanceBenchmark Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
  });

  it('sollte mit leeren Benchmarks initialisiert werden', () => {
    const { result } = renderHook(() => 
      usePerformanceBenchmark('TestComponent')
    );

    expect(result.current.benchmarks.size).toBe(0);
    expect(result.current.startBenchmark).toBeDefined();
    expect(result.current.getBenchmarkStats).toBeDefined();
    expect(result.current.clearBenchmarks).toBeDefined();
  });

  it('sollte Benchmarks starten und beenden können', () => {
    const { result } = renderHook(() => 
      usePerformanceBenchmark('TestComponent')
    );

    let endBenchmark: (() => number) | undefined;

    act(() => {
      endBenchmark = result.current.startBenchmark('test-operation');
    });

    expect(endBenchmark).toBeDefined();

    if (endBenchmark) {
      let duration: number;
      
      act(() => {
        duration = endBenchmark();
      });

      expect(duration).toBe(0); // Da wir die Performance API mocken
    }
  });

  it('sollte Benchmark-Statistiken berechnen können', () => {
    const { result } = renderHook(() => 
      usePerformanceBenchmark('TestComponent')
    );

    // Mehrere Benchmarks durchführen
    act(() => {
      const end1 = result.current.startBenchmark('test1');
      const end2 = result.current.startBenchmark('test2');
      const end3 = result.current.startBenchmark('test3');
      
      end1();
      end2();
      end3();
    });

    const stats = result.current.getBenchmarkStats('test1');
    
    expect(stats).toBeDefined();
    if (stats) {
      expect(stats.count).toBe(1);
      expect(stats.average).toBe(0);
      expect(stats.min).toBe(0);
      expect(stats.max).toBe(0);
    }
  });

  it('sollte alle Benchmarks löschen können', () => {
    const { result } = renderHook(() => 
      usePerformanceBenchmark('TestComponent')
    );

    // Einige Benchmarks durchführen
    act(() => {
      const end1 = result.current.startBenchmark('test1');
      const end2 = result.current.startBenchmark('test2');
      
      end1();
      end2();
    });

    expect(result.current.benchmarks.size).toBeGreaterThan(0);

    // Alle löschen
    act(() => {
      result.current.clearBenchmarks();
    });

    expect(result.current.benchmarks.size).toBe(0);
  });

  it('sollte mehrere Benchmarks für denselben Namen verwalten', () => {
    const { result } = renderHook(() => 
      usePerformanceBenchmark('TestComponent')
    );

    // Mehrere Benchmarks mit demselben Namen
    act(() => {
      const end1 = result.current.startBenchmark('repeated-test');
      const end2 = result.current.startBenchmark('repeated-test');
      const end3 = result.current.startBenchmark('repeated-test');
      
      end1();
      end2();
      end3();
    });

    const stats = result.current.getBenchmarkStats('repeated-test');
    
    expect(stats).toBeDefined();
    if (stats) {
      expect(stats.count).toBe(3);
    }
  });
});

describe('Integration Tests', () => {
  it('sollte alle Hooks zusammen funktionieren', () => {
    const { result: performanceResult } = renderHook(() => 
      useDashboardPerformance('IntegrationTest')
    );

    const { result: optimizationsResult } = renderHook(() => 
      usePerformanceOptimizations()
    );

    const { result: benchmarkResult } = renderHook(() => 
      usePerformanceBenchmark('IntegrationTest')
    );

    // Alle Hooks sollten funktionieren
    expect(performanceResult.current.metrics).toBeDefined();
    expect(optimizationsResult.current.optimizations).toBeDefined();
    expect(benchmarkResult.current.benchmarks).toBeDefined();

    // Performance-Mark setzen
    act(() => {
      performanceResult.current.setMark('integration-start');
    });

    // Benchmark starten
    let endBenchmark: (() => number) | undefined;
    act(() => {
      endBenchmark = benchmarkResult.current.startBenchmark('integration-test');
    });

    // Optimierung umschalten
    act(() => {
      optimizationsResult.current.toggleOptimization('enableCaching');
    });

    // Benchmark beenden
    if (endBenchmark) {
      act(() => {
        endBenchmark();
      });
    }

    // Alle Hooks sollten weiterhin funktionieren
    expect(performanceResult.current.metrics).toBeDefined();
    expect(optimizationsResult.current.optimizations.enableCaching).toBe(false);
    expect(benchmarkResult.current.benchmarks.size).toBeGreaterThan(0);
  });
});

describe('Error Handling', () => {
  it('sollte mit fehlenden Performance-APIs umgehen können', () => {
    // Performance API temporär entfernen
    const originalPerformance = window.performance;
    delete (window as any).performance;

    const { result } = renderHook(() => 
      useDashboardPerformance('ErrorTest')
    );

    // Hook sollte trotzdem funktionieren
    expect(result.current.metrics).toBeDefined();
    expect(result.current.getMemoryUsage()).toBeNull();

    // Performance API wiederherstellen
    (window as any).performance = originalPerformance;
  });

  it('sollte mit ungültigen Performance-Marks umgehen können', () => {
    const { result } = renderHook(() => 
      useDashboardPerformance('ErrorTest')
    );

    // Ungültige Marks messen
    const duration = result.current.measureMark('invalid', 'non-existent-start', 'non-existent-end');
    
    expect(duration).toBe(0);
  });
});

describe('Performance-Konfiguration', () => {
  it('sollte verschiedene Konfigurationen korrekt anwenden', () => {
    const configs = [
      { renderThreshold: 8, enableLogging: false },
      { renderThreshold: 32, enableLogging: true },
      { memoryThreshold: 25 * 1024 * 1024, enableMonitoring: false }
    ];

    configs.forEach(config => {
      const { result } = renderHook(() => 
        useDashboardPerformance('ConfigTest', config)
      );

      expect(result.current.metrics).toBeDefined();
    });
  });
});
