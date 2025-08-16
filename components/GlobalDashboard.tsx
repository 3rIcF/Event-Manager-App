import React from 'react';
import { useApp } from './AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  FolderOpen, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Package,
  Users,
  Euro,
  ArrowRight,
  Plus
} from 'lucide-react';

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

interface GlobalDashboardProps {
  onNewProject: () => void;
}

export function GlobalDashboard({ onNewProject }: GlobalDashboardProps) {
  const { projects, setCurrentProject, setGlobalView } = useApp();

  const activeProjects = projects.filter(p => !['closed'].includes(p.status));
  const upcomingDeadlines = projects.filter(p => {
    const startDate = new Date(p.startDate);
    const today = new Date();
    const diffDays = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  });

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const approvalOnTime = 85; // Mock data
  const returnRate = 92; // Mock data

  const recentChanges = [
    { project: 'Stadtfest München', change: 'BOM importiert', time: '2 Std. ago', user: 'Max Müller' },
    { project: 'BMW Event', change: 'Genehmigung erhalten', time: '4 Std. ago', user: 'Anna Schmidt' },
    { project: 'Weihnachtsmarkt', change: 'RFQ versendet', time: '1 Tag ago', user: 'Peter Wagner' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Willkommen im Event Manager</h2>
          <p className="text-muted-foreground">
            Überblick über alle Projekte und Aktivitäten
          </p>
        </div>
        <Button onClick={onNewProject}>
          <Plus className="w-4 h-4 mr-2" />
          Neues Projekt
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Projekte</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              +{projects.filter(p => p.status === 'idea').length} in Planung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bevorstehende Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingDeadlines.length}</div>
            <p className="text-xs text-muted-foreground">
              Nächste 30 Tage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genehmigungen On-Time</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalOnTime}%</div>
            <p className="text-xs text-muted-foreground">
              +5% zum Vormonat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtbudget</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(totalBudget / 1000).toFixed(0)}k</div>
            <p className="text-xs text-muted-foreground">
              Aktive Projekte
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Aktive Projekte</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setGlobalView('projects')}
              >
                Alle anzeigen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.slice(0, 5).map((project) => {
                const daysUntilStart = Math.ceil(
                  (new Date(project.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <div 
                    key={project.id} 
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-sm transition-shadow"
                    onClick={() => setCurrentProject(project)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium">{project.name}</h4>
                        <Badge className={getStatusColor(project.status)} size="sm">
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {project.location} • {daysUntilStart > 0 ? `in ${daysUntilStart} Tagen` : 'Heute'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        €{project.budget ? (project.budget / 1000).toFixed(0) + 'k' : 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {project.responsible}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Letzte Aktivitäten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentChanges.map((change, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{change.project}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{change.time}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{change.change}</div>
                    <div className="text-xs text-muted-foreground">von {change.user}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Bevorstehende Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.slice(0, 3).map((project) => (
                <div key={project.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{project.name}</span>
                  <Badge variant="outline">
                    {Math.ceil((new Date(project.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Tage
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Genehmigungen On-Time</span>
                <div className="flex items-center gap-2">
                  <Progress value={approvalOnTime} className="w-16 h-2" />
                  <span className="text-sm font-medium">{approvalOnTime}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rücklauf-Quote</span>
                <div className="flex items-center gap-2">
                  <Progress value={returnRate} className="w-16 h-2" />
                  <span className="text-sm font-medium">{returnRate}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Budget-Treue</span>
                <div className="flex items-center gap-2">
                  <Progress value={78} className="w-16 h-2" />
                  <span className="text-sm font-medium">78%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Aktionen erforderlich
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">3 RFQs ausstehend</div>
                  <div className="text-xs text-muted-foreground">Antworten bis morgen fällig</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Slot-Konflikte</div>
                  <div className="text-xs text-muted-foreground">2 Überschneidungen bei BMW Event</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-orange-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Lager knapp</div>
                  <div className="text-xs text-muted-foreground">Bauzäune unter 20% Bestand</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}