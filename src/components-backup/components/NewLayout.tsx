import React from 'react';
import { useApp } from './AppContext';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger 
} from './ui/sidebar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  BarChart3, 
  FolderOpen, 
  Database, 
  Calendar, 
  FileText, 
  BarChart, 
  Settings, 
  Plus,
  ArrowLeft,
  Package,
  Users,
  ShieldCheck,
  Truck,
  UtensilsCrossed,
  Clipboard,
  Calculator,
  Archive,
  Building,
  MapPin
} from 'lucide-react';

const globalMenuItems = [
  { icon: BarChart3, label: 'Dashboard', path: 'dashboard' },
  { icon: FolderOpen, label: 'Projekte', path: 'projects' },
  { icon: Database, label: 'Stammdaten', path: 'master-data' },
  { icon: Calendar, label: 'Kalender', path: 'calendar' },
  { icon: FileText, label: 'Dateien', path: 'files' },
  { icon: BarChart, label: 'Reports', path: 'reports' },
  { icon: Settings, label: 'Einstellungen', path: 'settings' },
];

const projectMenuItems = [
  { icon: BarChart3, label: 'Projekt-Dashboard', path: 'dashboard' },
  { icon: Package, label: 'BOM', path: 'bom' },
  { icon: Users, label: 'Beschaffung', path: 'procurement' },
  { icon: ShieldCheck, label: 'Genehmigungen', path: 'permits' },
  { icon: Users, label: 'Dienstleister', path: 'services' },
  { icon: Truck, label: 'Logistik', path: 'logistics' },
  { icon: UtensilsCrossed, label: 'Unterkunft & Catering', path: 'accommodation' },
  { icon: Clipboard, label: 'Betrieb', path: 'operations' },
  { icon: Calculator, label: 'Finanzen', path: 'finances' },
  { icon: FileText, label: 'Dateien', path: 'files' },
  { icon: Archive, label: 'Abschluss', path: 'completion' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'idea': return 'bg-gray-100 text-gray-800';
    case 'planning': return 'bg-blue-100 text-blue-800';
    case 'approval': return 'bg-yellow-100 text-yellow-800';
    case 'setup': return 'bg-orange-100 text-orange-800';
    case 'live': return 'bg-green-100 text-green-800';
    case 'teardown': return 'bg-purple-100 text-purple-800';
    case 'closed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'idea': return 'Idee';
    case 'planning': return 'Planung';
    case 'approval': return 'Genehmigung';
    case 'setup': return 'Aufbau';
    case 'live': return 'Live';
    case 'teardown': return 'Abbau';
    case 'closed': return 'Abgeschlossen';
    default: return status;
  }
};

interface NewLayoutProps {
  children: React.ReactNode;
  onNewProject: () => void;
}

export function NewLayout({ children, onNewProject }: NewLayoutProps) {
  const { 
    currentProject, 
    globalView, 
    projectView, 
    setGlobalView, 
    setProjectView,
    setCurrentProject 
  } = useApp();

  const isInProject = !!currentProject;
  const currentView = isInProject ? projectView : globalView;
  const menuItems = isInProject ? projectMenuItems : globalMenuItems;

  const handleNavigation = (path: string) => {
    if (isInProject) {
      setProjectView(path);
    } else {
      setGlobalView(path);
    }
  };

  const handleBackToGlobal = () => {
    setCurrentProject(null);
    setGlobalView('projects');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="space-y-2">
              <h2 className="font-semibold">Event Manager</h2>
              {isInProject && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleBackToGlobal}
                      className="w-full justify-start p-2"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Zurück zu Projekten
                    </Button>
                    <div className="space-y-1">
                      <div className="font-medium text-sm truncate">{currentProject.name}</div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(currentProject.status)} size="sm">
                          {getStatusLabel(currentProject.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{currentProject.location}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(currentProject.startDate).toLocaleDateString('de-DE')} - {new Date(currentProject.endDate).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    isActive={currentView === item.path}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="p-4">
            {!isInProject && (
              <Button onClick={onNewProject} size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Neues Projekt
              </Button>
            )}
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col">
          <header className="border-b bg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="font-semibold">
                  {isInProject ? currentProject.name : 'Event Management'}
                </h1>
                {isInProject && (
                  <p className="text-sm text-muted-foreground">
                    {menuItems.find(item => item.path === currentView)?.label}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isInProject && (
                <Badge className={getStatusColor(currentProject.status)}>
                  {getStatusLabel(currentProject.status)}
                </Badge>
              )}
              
              <Button variant="outline" size="sm">
                <Building className="w-4 h-4 mr-2" />
                Global Search
              </Button>
            </div>
          </header>
          
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}