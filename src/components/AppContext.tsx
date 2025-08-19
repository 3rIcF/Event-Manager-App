import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DataProvider } from './DataContext';

interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'idea' | 'planning' | 'approval' | 'setup' | 'live' | 'teardown' | 'closed';
  responsible: string;
  description?: string;
  budget?: number;
}

interface AppContextType {
  // Global state
  currentProject: Project | null;
  projects: Project[];
  
  // Navigation
  globalView: string;
  projectView: string;
  
  // Actions
  setCurrentProject: (project: Project | null) => void;
  setGlobalView: (view: string) => void;
  setProjectView: (view: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Stadtfest München 2025',
    startDate: '2025-09-15',
    endDate: '2025-09-17',
    location: 'München Zentrum',
    status: 'planning',
    responsible: 'Max Müller',
    description: 'Jährliches Stadtfest mit Bühnen, Ständen und Fahrgeschäften',
    budget: 250000
  },
  {
    id: '2',
    name: 'BMW Pressekonferenz',
    startDate: '2025-10-20',
    endDate: '2025-10-20',
    location: 'BMW Welt München',
    status: 'approval',
    responsible: 'Anna Schmidt',
    description: 'Produktpräsentation neuer Fahrzeugmodelle',
    budget: 85000
  },
  {
    id: '3',
    name: 'Weihnachtsmarkt Marienplatz',
    startDate: '2025-11-25',
    endDate: '2025-12-23',
    location: 'Marienplatz München',
    status: 'setup',
    responsible: 'Peter Wagner',
    budget: 180000
  }
];

function AppProviderInner({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [globalView, setGlobalView] = useState('dashboard');
  const [projectView, setProjectView] = useState('dashboard');

  const addProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    if (currentProject?.id === id) {
      setCurrentProject(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  return (
    <AppContext.Provider value={{
      currentProject,
      projects,
      globalView,
      projectView,
      setCurrentProject,
      setGlobalView,
      setProjectView,
      addProject,
      updateProject
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <DataProvider>
      <AppProviderInner>
        {children}
      </AppProviderInner>
    </DataProvider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}