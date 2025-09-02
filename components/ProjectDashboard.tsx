import React from 'react';
import { useApp } from './AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  Calendar, 
  MapPin, 
  User, 
  Euro,
  Package,
  Users,
  ShieldCheck,
  Truck,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileText,
  Plus,
  ArrowRight
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

export function ProjectDashboard() {
  const { currentProject, setProjectView } = useApp();

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Kein Projekt ausgewählt</p>
      </div>
    );
  }

  // Mock data for project status
  const projectStats = {
    bom: { covered: 75, total: 120, status: 'partial' },
    permits: { approved: 5, total: 8, status: 'progress' },
    services: { confirmed: 12, total: 15, status: 'good' },
    logistics: { planned: 18, total: 20, status: 'good' },
    budget: { used: 180000, total: currentProject.budget || 250000, status: 'good' }
  };

  const getModuleStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'partial': return 'text-yellow-600';
      case 'progress': return 'text-blue-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const upcomingTasks = [
    { task: 'RFQ Bühnenaufbau versenden', deadline: '2 Tage', priority: 'high' },
    { task: 'Sicherheitskonzept finalisieren', deadline: '5 Tage', priority: 'medium' },
    { task: 'Catering-Menü bestätigen', deadline: '1 Woche', priority: 'low' },
  ];

  const recentActivity = [
    { action: 'BOM importiert', time: '2 Std.', user: 'Max Müller' },
    { action: 'Genehmigung Bauamt erhalten', time: '4 Std.', user: 'System' },
    { action: 'RFQ an Zeltverleih versendet', time: '1 Tag', user: 'Anna Schmidt' },
  ];

  const upcomingSlots = [
    { date: '15.09. 08:00', supplier: 'Bühnentechnik Bayern', type: 'Anlieferung', gate: 'Gate A' },
    { date: '15.09. 10:00', supplier: 'Zeltverleih München', type: 'Anlieferung', gate: 'Gate B' },
    { date: '15.09. 14:00', supplier: 'Catering Service', type: 'Setup', gate: 'Gate C' },
  ];

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{currentProject.name}</h2>
              <Badge className={getStatusColor(currentProject.status)}>
                {getStatusLabel(currentProject.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(currentProject.startDate).toLocaleDateString('de-DE')} - {new Date(currentProject.endDate).toLocaleDateString('de-DE')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{currentProject.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{currentProject.manager}</span>
              </div>
              {currentProject.budget && (
                <div className="flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  <span>€{currentProject.budget.toLocaleString('de-DE')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {currentProject.description && (
          <p className="text-muted-foreground">{currentProject.description}</p>
        )}
      </div>

      {/* Status Ampeln */}
      <Card>
        <CardHeader>
          <CardTitle>Projekt-Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center space-y-2">
              <Package className={`w-8 h-8 mx-auto ${getModuleStatusColor(projectStats.bom.status)}`} />
              <div className="text-sm font-medium">BOM</div>
              <div className="text-xs text-muted-foreground">
                {projectStats.bom.covered}/{projectStats.bom.total} abgedeckt
              </div>
              <Progress value={(projectStats.bom.covered / projectStats.bom.total) * 100} className="h-2" />
            </div>

            <div className="text-center space-y-2">
              <ShieldCheck className={`w-8 h-8 mx-auto ${getModuleStatusColor(projectStats.permits.status)}`} />
              <div className="text-sm font-medium">Genehmigungen</div>
              <div className="text-xs text-muted-foreground">
                {projectStats.permits.approved}/{projectStats.permits.total} genehmigt
              </div>
              <Progress value={(projectStats.permits.approved / projectStats.permits.total) * 100} className="h-2" />
            </div>

            <div className="text-center space-y-2">
              <Users className={`w-8 h-8 mx-auto ${getModuleStatusColor(projectStats.services.status)}`} />
              <div className="text-sm font-medium">Dienstleister</div>
              <div className="text-xs text-muted-foreground">
                {projectStats.services.confirmed}/{projectStats.services.total} bestätigt
              </div>
              <Progress value={(projectStats.services.confirmed / projectStats.services.total) * 100} className="h-2" />
            </div>

            <div className="text-center space-y-2">
              <Truck className={`w-8 h-8 mx-auto ${getModuleStatusColor(projectStats.logistics.status)}`} />
              <div className="text-sm font-medium">Logistik</div>
              <div className="text-xs text-muted-foreground">
                {projectStats.logistics.planned}/{projectStats.logistics.total} geplant
              </div>
              <Progress value={(projectStats.logistics.planned / projectStats.logistics.total) * 100} className="h-2" />
            </div>

            <div className="text-center space-y-2">
              <Calculator className={`w-8 h-8 mx-auto ${getModuleStatusColor(projectStats.budget.status)}`} />
              <div className="text-sm font-medium">Budget</div>
              <div className="text-xs text-muted-foreground">
                {((projectStats.budget.used / projectStats.budget.total) * 100).toFixed(0)}% genutzt
              </div>
              <Progress value={(projectStats.budget.used / projectStats.budget.total) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projekt Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Projekt-Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <div>
                  <div className="font-medium">Aufbau-Phase</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(currentProject.startDate).toLocaleDateString('de-DE')} - {new Date(currentProject.startDate).toLocaleDateString('de-DE')}
                  </div>
                </div>
              </div>
              <Badge variant="outline">18 Slots geplant</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <div>
                  <div className="font-medium">Show-Phase</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(currentProject.startDate).toLocaleDateString('de-DE')} - {new Date(currentProject.endDate).toLocaleDateString('de-DE')}
                  </div>
                </div>
              </div>
              <Badge variant="outline">Live Event</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <div>
                  <div className="font-medium">Abbau-Phase</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(currentProject.endDate).toLocaleDateString('de-DE')} - {new Date(currentProject.endDate).toLocaleDateString('de-DE')}
                  </div>
                </div>
              </div>
              <Badge variant="outline">15 Rückholungen</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Kacheln */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setProjectView('bom')}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>Material (BOM)</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Abgedeckt:</span>
                <span className="font-medium">{projectStats.bom.covered}/{projectStats.bom.total}</span>
              </div>
              <Progress value={(projectStats.bom.covered / projectStats.bom.total) * 100} />
              <div className="text-xs text-muted-foreground">
                {projectStats.bom.total - projectStats.bom.covered} Positionen offen
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setProjectView('permits')}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span>Genehmigungen</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Status:</span>
                <Badge className="bg-yellow-100 text-yellow-800">3 in Bearbeitung</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Nächste Frist: Bauantrag in 5 Tagen
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setProjectView('logistics')}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                <span>Logistik</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Nächste 72h:</span>
                  <span className="font-medium">{upcomingSlots.length} Slots</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Nächste Anlieferung: {upcomingSlots[0]?.date}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Anstehende Aufgaben
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{task.task}</div>
                    <div className="text-xs text-muted-foreground">Fällig in {task.deadline}</div>
                  </div>
                  <Badge 
                    variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                  >
                    {task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
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
              Letzte Aktivitäten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{activity.action}</div>
                    <div className="text-xs text-muted-foreground">
                      vor {activity.time} • {activity.user}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setProjectView('bom')}>
              <Package className="w-4 h-4 mr-2" />
              BOM importieren
            </Button>
            <Button variant="outline" size="sm" onClick={() => setProjectView('procurement')}>
              <Users className="w-4 h-4 mr-2" />
              RFQ erstellen
            </Button>
            <Button variant="outline" size="sm" onClick={() => setProjectView('logistics')}>
              <Plus className="w-4 h-4 mr-2" />
              Slot hinzufügen
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Briefing generieren
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}