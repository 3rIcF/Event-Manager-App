/**
 * Test-Setup für Vitest und React Testing Library
 * Diese Datei wird vor allen Tests ausgeführt
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock der Performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => 1000),
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024,
      totalJSHeapSize: 100 * 1024 * 1024,
      jsHeapSizeLimit: 200 * 1024 * 1024
    }
  },
  writable: true,
});

// Mock der ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock der IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock der matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock der getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: vi.fn(),
  }),
});

// Mock der console-Methoden in Tests
const originalConsole = { ...console };

beforeEach(() => {
  // Console-Methoden für Tests mocken
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  // Console-Mocks zurücksetzen
  vi.restoreAllMocks();
});

// Globale Test-Utilities
global.testUtils = {
  // Mock-Daten für Tests
  mockDashboardData: {
    projects: { total: 24, active: 8, completed: 14, pending: 2 },
    budget: { planned: 125000, spent: 89000, remaining: 36000, utilization: 71.2 },
    suppliers: { total: 156, available: 142, performance: 4.2 },
    tasks: { total: 342, completed: 298, overdue: 12, completion: 87.1 },
    permits: { total: 45, approved: 38, pending: 5, rejected: 2 },
    logistics: { slots: 89, conflicts: 3, utilization: 92.3 }
  },
  
  // Mock-Funktionen
  mockFunctions: {
    onRefresh: vi.fn(),
    onPeriodChange: vi.fn(),
    onFilterChange: vi.fn(),
    onViewModeChange: vi.fn(),
    onEventClick: vi.fn()
  },
  
  // Test-Helper
  helpers: {
    // Warten auf Element
    waitForElement: async (selector: string, timeout = 5000) => {
      const startTime = Date.now();
      while (Date.now() - startTime < timeout) {
        const element = document.querySelector(selector);
        if (element) return element;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      throw new Error(`Element ${selector} nicht gefunden nach ${timeout}ms`);
    },
    
    // Mock-Fetch
    mockFetch: (response: any, status = 200) => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: status < 400,
          status,
          json: () => Promise.resolve(response),
          text: () => Promise.resolve(JSON.stringify(response)),
        } as Response)
      );
    },
    
    // Mock-Fetch-Error
    mockFetchError: (error: string) => {
      global.fetch = vi.fn(() =>
        Promise.reject(new Error(error))
      );
    },
    
    // Performance-API mocken
    mockPerformance: (renderTime = 12, memoryUsage = 45 * 1024 * 1024) => {
      Object.defineProperty(window, 'performance', {
        value: {
          now: vi.fn(() => renderTime),
          memory: {
            usedJSHeapSize: memoryUsage,
            totalJSHeapSize: 100 * 1024 * 1024,
            jsHeapSizeLimit: 200 * 1024 * 1024
          }
        },
        writable: true,
      });
    }
  }
};

// TypeScript-Deklarationen für globale Test-Utilities
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        mockDashboardData: any;
        mockFunctions: {
          onRefresh: ReturnType<typeof vi.fn>;
          onPeriodChange: ReturnType<typeof vi.fn>;
          onFilterChange: ReturnType<typeof vi.fn>;
          onViewModeChange: ReturnType<typeof vi.fn>;
          onEventClick: ReturnType<typeof vi.fn>;
        };
        helpers: {
          waitForElement: (selector: string, timeout?: number) => Promise<Element>;
          mockFetch: (response: any, status?: number) => void;
          mockFetchError: (error: string) => void;
          mockPerformance: (renderTime?: number, memoryUsage?: number) => void;
        };
      };
    }
  }
  
  var testUtils: {
    mockDashboardData: any;
    mockFunctions: {
      onRefresh: ReturnType<typeof vi.fn>;
      onPeriodChange: ReturnType<typeof vi.fn>;
      onFilterChange: ReturnType<typeof vi.fn>;
      onViewModeChange: ReturnType<typeof vi.fn>;
      onEventClick: ReturnType<typeof vi.fn>;
    };
    helpers: {
      waitForElement: (selector: string, timeout?: number) => Promise<Element>;
      mockFetch: (response: any, status?: number) => void;
      mockFetchError: (error: string) => void;
      mockPerformance: (renderTime?: number, memoryUsage?: number) => void;
    };
  };
}

export {};
