import React from 'react';
import { useApp } from './AppContext';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings, 
  Plus,
  Users,
  Database,
  Wifi,
  Bell,
  Moon,
  Sun
} from 'lucide-react';

interface NewLayoutProps {
  children: React.ReactNode;
  onNewProject: () => void;
}

export function NewLayout({ children, onNewProject }: NewLayoutProps) {
  const { globalView, setGlobalView, currentProject, setCurrentProject, projectView, setProjectView, theme, setTheme } = useApp();

  const globalNavigationItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Übersicht über alle Projekte und Aktivitäten'
    },
    {
      key: 'projects',
      label: 'Projekte',
      icon: FolderOpen,
      description: 'Alle Projekte verwalten und überwachen'
    },
    {
      key: 'events',
      label: 'Events',
      icon: Calendar,
      description: 'Event-Management und Veranstaltungen'
    },
    {
      key: 'real-time',
      label: 'Live-Updates',
      icon: Wifi,
      description: 'Real-Time Updates und WebSocket-Status'
    },
    {
      key: 'master-data',
      label: 'Stammdaten',
      icon: Database,
      description: 'Zentrale Datenverwaltung und Konfiguration'
    },
    {
      key: 'calendar',
      label: 'Kalender',
      icon: Calendar,
      description: 'Terminplanung und Zeitmanagement'
    },
    {
      key: 'files',
      label: 'Dateien',
      icon: FileText,
      description: 'Dokumentenverwaltung und Datei-Sharing'
    },
    {
      key: 'reports',
      label: 'Berichte',
      icon: BarChart3,
      description: 'Analysen, Reports und Auswertungen'
    },
    {
      key: 'settings',
      label: 'Einstellungen',
      icon: Settings,
      description: 'System-Konfiguration und Benutzereinstellungen'
    }
  ];

  const projectNavigationItems = [
    {
      key: 'dashboard',
      label: 'Projekt-Dashboard',
      icon: LayoutDashboard,
      description: 'Übersicht über das aktuelle Projekt'
    },
    {
      key: 'bom',
      label: 'BOM-Struktur',
      icon: FolderOpen,
      description: 'Bill of Materials und Komponentenverwaltung'
    },
    {
      key: 'procurement',
      label: 'Beschaffung',
      icon: Users,
      description: 'Lieferanten-Management und Bestellungen'
    },
    {
      key: 'permits',
      label: 'Genehmigungen',
      icon: FileText,
      description: 'Genehmigungsverfahren und Dokumentation'
    },
    {
      key: 'logistics',
      label: 'Logistik',
      icon: Calendar,
      description: 'Transport und Lagerung'
    },
    {
      key: 'services',
      label: 'Dienstleister',
      icon: Users,
      description: 'Externe Dienstleister und Verträge'
    },
    {
      key: 'accommodation',
      label: 'Unterkunft',
      icon: Calendar,
      description: 'Hotel-Buchungen und Catering'
    },
    {
      key: 'operations',
      label: 'Betrieb',
      icon: BarChart3,
      description: 'Betriebsabläufe und Qualitätssicherung'
    },
    {
      key: 'finances',
      label: 'Finanzen',
      icon: BarChart3,
      description: 'Budget-Tracking und Kostenkontrolle'
    },
    {
      key: 'files',
      label: 'Projekt-Dateien',
      icon: FileText,
      description: 'Projektspezifische Dokumente'
    },
    {
      key: 'completion',
      label: 'Abschluss',
      icon: BarChart3,
      description: 'Projektabschluss und Dokumentation'
    }
  ];

  const currentNavigationItems = currentProject ? projectNavigationItems : globalNavigationItems;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card text-card-foreground shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Event Manager App
              </h1>
              {currentProject && (
                <div className="ml-4 flex items-center">
                  <span className="text-gray-500">/</span>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {currentProject.name}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              {!currentProject && (
                <Button onClick={onNewProject} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Neues Projekt
                </Button>
              )}
              
              {currentProject && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentProject(null)}
                >
                  Zurück zur Übersicht
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {currentNavigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentProject 
                  ? projectView === item.key 
                  : globalView === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      if (currentProject) {
                        setProjectView(item.key as any);
                      } else {
                        setGlobalView(item.key as any);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors border ${
                      isActive
                        ? 'bg-primary/5 text-primary border-primary/20'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground border-border'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`h-5 w-5 mr-3 ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className={`text-xs mt-1 ${
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}