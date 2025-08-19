import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DataProvider } from './DataContext';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'idea' | 'planning' | 'approval' | 'setup' | 'live' | 'teardown' | 'closed';
  startDate: Date;
  endDate: Date;
  location: string;
  budget?: number;
  manager?: string;
}

interface AppContextType {
  // Global state
  globalView: 'dashboard' | 'projects' | 'events' | 'real-time' | 'master-data' | 'calendar' | 'files' | 'reports' | 'settings';
  setGlobalView: (view: 'dashboard' | 'projects' | 'events' | 'real-time' | 'master-data' | 'calendar' | 'files' | 'reports' | 'settings') => void;
  
  // Project state
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  projectView: 'dashboard' | 'bom' | 'procurement' | 'permits' | 'logistics' | 'services' | 'accommodation' | 'operations' | 'finances' | 'files' | 'completion';
  setProjectView: (view: 'dashboard' | 'bom' | 'procurement' | 'permits' | 'logistics' | 'services' | 'accommodation' | 'operations' | 'finances' | 'files' | 'completion') => void;
  
  // User state
  currentUser: any | null;
  setCurrentUser: (user: any | null) => void;
  
  // Theme state
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Notifications state
  notifications: any[];
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [globalView, setGlobalView] = useState<'dashboard' | 'projects' | 'events' | 'real-time' | 'master-data' | 'calendar' | 'files' | 'reports' | 'settings'>('dashboard');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectView, setProjectView] = useState<'dashboard' | 'bom' | 'procurement' | 'permits' | 'logistics' | 'services' | 'accommodation' | 'operations' | 'finances' | 'files' | 'completion'>('dashboard');
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState<any[]>([]);

  const addNotification = (notification: any) => {
    const newNotification = {
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value: AppContextType = {
    globalView,
    setGlobalView,
    currentProject,
    setCurrentProject,
    projectView,
    setProjectView,
    currentUser,
    setCurrentUser,
    theme,
    setTheme,
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}