import React, { useMemo, useCallback, memo } from 'react';

// Optimierte Button-Komponente mit React.memo
export const OptimizedButton = memo<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}>(({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '' }) => {
  const buttonClasses = useMemo(() => {
    const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };
    
    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  }, [variant, size, className]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick();
    }
  }, [onClick, disabled]);

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
});

OptimizedButton.displayName = 'OptimizedButton';

// Optimierte Card-Komponente
export const OptimizedCard = memo<{
  children: React.ReactNode;
  title?: string;
  className?: string;
  onClick?: () => void;
}>(({ children, title, className = '', onClick }) => {
  const cardClasses = useMemo(() => {
    const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700';
    return onClick ? `${baseClasses} cursor-pointer hover:shadow-md transition-shadow` : baseClasses;
  }, [onClick]);

  return (
    <div className={`${cardClasses} ${className}`} onClick={onClick}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
});

OptimizedCard.displayName = 'OptimizedCard';

// Optimierte List-Komponente
export const OptimizedList = memo<{
  items: Array<{ id: string | number; [key: string]: any }>;
  renderItem: (item: any, index: number) => React.ReactNode;
  keyExtractor?: (item: any, index: number) => string | number;
  className?: string;
  emptyMessage?: string;
}>(({ items, renderItem, keyExtractor = (item) => item.id, className = '', emptyMessage = 'Keine Einträge gefunden' }) => {
  const memoizedItems = useMemo(() => {
    return items.map((item, index) => ({
      key: keyExtractor(item, index),
      content: renderItem(item, index),
    }));
  }, [items, renderItem, keyExtractor]);

  if (items.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 dark:text-gray-400 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {memoizedItems.map(({ key, content }) => (
        <div key={key}>
          {content}
        </div>
      ))}
    </div>
  );
});

OptimizedList.displayName = 'OptimizedList';

// Optimierte Grid-Komponente
export const OptimizedGrid = memo<{
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}>(({ children, columns = 1, gap = 4, className = '' }) => {
  const gridClasses = useMemo(() => {
    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    };
    
    const gapClasses = {
      2: 'gap-2',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8',
    };
    
    return `grid ${columnClasses[columns as keyof typeof columnClasses] || columnClasses[1]} ${gapClasses[gap as keyof typeof gapClasses] || gapClasses[4]}`;
  }, [columns, gap]);

  return (
    <div className={`${gridClasses} ${className}`}>
      {children}
    </div>
  );
});

OptimizedGrid.displayName = 'OptimizedGrid';

// Optimierte Form-Komponente
export const OptimizedForm = memo<{
  children: React.ReactNode;
  onSubmit: (data: any) => void;
  className?: string;
  initialData?: any;
}>(({ children, onSubmit, className = '', initialData = {} }) => {
  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSubmit({ ...initialData, ...data });
  }, [onSubmit, initialData]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
});

OptimizedForm.displayName = 'OptimizedForm';

// Hook für optimierte Berechnungen
export const useOptimizedValue = <T>(value: T, dependencies: React.DependencyList): T => {
  return useMemo(() => value, dependencies);
};

// Hook für optimierte Callbacks
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T => {
  return useCallback(callback, dependencies);
};
