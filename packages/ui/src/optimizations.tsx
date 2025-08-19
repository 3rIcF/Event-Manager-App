import React, { 
  memo, 
  useMemo, 
  useCallback, 
  useRef, 
  useEffect, 
  useState,
  Suspense,
  lazy,
  Component,
  ErrorBoundary
} from 'react';

// 1. Memoized Components
export const MemoizedComponent = memo<{
  children: React.ReactNode;
  className?: string;
}>(({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
});

// 2. Performance Hook
export const usePerformance = () => {
  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState(0);
  const renderStartTime = useRef(performance.now());

  useEffect(() => {
    const now = performance.now();
    setLastRenderTime(now - renderStartTime.current);
    setRenderCount(prev => prev + 1);
    renderStartTime.current = now;
  });

  const measurePerformance = useCallback((fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    return end - start;
  }, []);

  return {
    renderCount,
    lastRenderTime,
    measurePerformance,
  };
};

// 3. Debounced Hook
export const useDebounce = <T>(value: T, delay: number): T => {
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

// 4. Throttled Hook
export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// 5. Intersection Observer Hook
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options]);

  return { elementRef, isIntersecting, entry };
};

// 6. Virtual Scrolling Hook
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
    return { start: Math.max(0, start - overscan), end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange.start, visibleRange.end]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange,
  };
};

// 7. Lazy Loading Component
export const LazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const Component = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <Component {...props} />
    </Suspense>
  );
};

// 8. Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<
  { 
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; errorInfo?: React.ErrorInfo }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            errorInfo={this.state.errorInfo} 
          />
        );
      }

      return (
        <div className="error-boundary p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Something went wrong
          </h2>
          <details className="text-sm text-red-700">
            <summary className="cursor-pointer mb-2">Error details</summary>
            <pre className="whitespace-pre-wrap bg-red-100 p-2 rounded">
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 9. Performance Monitoring Component
export const PerformanceMonitor: React.FC<{
  children: React.ReactNode;
  threshold?: number;
  onSlowRender?: (renderTime: number) => void;
}> = ({ children, threshold = 16, onSlowRender }) => {
  const { lastRenderTime } = usePerformance();

  useEffect(() => {
    if (lastRenderTime > threshold && onSlowRender) {
      onSlowRender(lastRenderTime);
    }
  }, [lastRenderTime, threshold, onSlowRender]);

  return <>{children}</>;
};

// 10. Optimized List Component
export const OptimizedList = memo<{
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  keyExtractor: (item: any, index: number) => string;
  className?: string;
}>(({ items, renderItem, keyExtractor, className = '' }) => {
  const memoizedItems = useMemo(() => {
    return items.map((item, index) => ({
      key: keyExtractor(item, index),
      element: renderItem(item, index),
    }));
  }, [items, renderItem, keyExtractor]);

  return (
    <div className={className}>
      {memoizedItems.map(({ key, element }) => (
        <div key={key}>{element}</div>
      ))}
    </div>
  );
});

// 11. Image Optimization Component
export const OptimizedImage = memo<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  lazy?: boolean;
}>(({ src, alt, width, height, className = '', lazy = true }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      loading={lazy ? 'lazy' : 'eager'}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
});

// 12. Form Optimization Hook
export const useFormOptimization = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: any
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((key: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [key]: value }));
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  }, [errors]);

  const setValuesOptimized = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  const validate = useCallback(async () => {
    if (!validationSchema) return true;
    
    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationErrors: any) {
      const newErrors: Partial<Record<keyof T, string>> = {};
      validationErrors.inner.forEach((error: any) => {
        newErrors[error.path as keyof T] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  }, [values, validationSchema]);

  const handleSubmit = useCallback(async (onSubmit: (values: T) => Promise<void>) => {
    setIsSubmitting(true);
    
    try {
      const isValid = await validate();
      if (isValid) {
        await onSubmit(values);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate]);

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    setValues: setValuesOptimized,
    validate,
    handleSubmit,
  };
};

// 13. Export all optimizations
export {
  memo,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
  Suspense,
  lazy,
  Component,
};
