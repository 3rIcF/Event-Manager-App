import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { 
  ClipboardList,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Search,
  Filter,
  Flag,
  PlayCircle,
  PauseCircle,
  XCircle,
  FileText,
  Settings,
  AlertOctagon,
  CheckSquare,
  Users,
  Timer
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useApp } from './AppContext';

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  required: boolean;
  assignee?: string;
  due_date?: string;
  completed_at?: string;
  completed_by?: string;
  notes?: string;
}

interface OperationChecklist {
  id: string;
  project_id: string;
  phase: 'setup' | 'live' | 'teardown';
  category: string;
  title: string;
  items: ChecklistItem[];
  assigned_to?: string;
  due_date?: string;
  completion_status: number; // 0-100%
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface IncidentReport {
  id: string;
  project_id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  reported_by?: string;
  assigned_to?: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution_notes?: string;
  reported_at: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

const mockChecklists: OperationChecklist[] = [
  {
    id: '1',
    project_id: '1',
    phase: 'setup',
    category: 'safety',
    title: 'Sicherheitsüberprüfung Aufbau',
    completion_status: 75,
    assigned_to: 'Max Müller',
    due_date: '2025-09-14T18:00:00',
    items: [
      {
        id: '1-1',
        title: 'Flucht- und Rettungswege markieren',
        completed: true,
        required: true,
        assignee: 'Max Müller',
        completed_at: '2025-02-20T10:30:00',
        completed_by: 'Max Müller'
      },
      {
        id: '1-2', 
        title: 'Feuerlöscher und Erste-Hilfe-Kästen positionieren',
        completed: true,
        required: true,
        assignee: 'Anna Schmidt',
        completed_at: '2025-02-20T11:00:00',
        completed_by: 'Anna Schmidt'
      },
      {
        id: '1-3',
        title: 'Elektrische Anlagen prüfen und abnehmen',
        completed: true,
        required: true,
        assignee: 'Peter Wagner',
        completed_at: '2025-02-20T14:15:00',
        completed_by: 'Peter Wagner'
      },
      {
        id: '1-4',
        title: 'Bühnenaufbau statische Prüfung',
        completed: false,
        required: true,
        assignee: 'Peter Wagner',
        due_date: '2025-09-14T17:00:00'
      }
    ],
    created_at: '2025-02-15T09:00:00',
    updated_at: '2025-02-20T14:15:00'
  },
  {
    id: '2',
    project_id: '1',
    phase: 'live',
    category: 'technical',
    title: 'Live-Event Technik-Monitoring',
    completion_status: 0,
    assigned_to: 'Anna Schmidt',
    items: [
      {
        id: '2-1',
        title: 'PA-Anlage Soundcheck durchführen',
        completed: false,
        required: true,
        assignee: 'Anna Schmidt'
      },
      {
        id: '2-2',
        title: 'Lichtanlage Funktionstest',
        completed: false,
        required: true,
        assignee: 'Anna Schmidt'
      },
      {
        id: '2-3',
        title: 'Streaming-Equipment Setup',
        completed: false,
        required: false,
        assignee: 'Max Müller'
      }
    ],
    created_at: '2025-02-18T10:00:00',
    updated_at: '2025-02-18T10:00:00'
  }
];

const mockIncidents: IncidentReport[] = [
  {
    id: '1',
    project_id: '1',
    title: 'Stromausfall Hauptbühne',
    description: 'Kompletter Stromausfall an der Hauptbühne um 14:30 Uhr. Alle Equipment ausgefallen, Sicherung ist rausgesprungen.',
    severity: 'high',
    category: 'technical',
    reported_by: 'Anna Schmidt',
    assigned_to: 'Peter Wagner',
    status: 'resolved',
    resolution_notes: 'Defekte Sicherung ersetzt, neue Verteilung installiert. Problem behoben um 15:15 Uhr.',
    reported_at: '2025-02-20T14:30:00',
    resolved_at: '2025-02-20T15:15:00',
    created_at: '2025-02-20T14:35:00',
    updated_at: '2025-02-20T15:20:00'
  },
  {
    id: '2',
    project_id: '1',
    title: 'Verletzung Aufbau-Team',
    description: 'Arbeiter hat sich beim Aufbau der Bühne am Finger verletzt. Erste Hilfe geleistet.',
    severity: 'medium',
    category: 'safety',
    reported_by: 'Max Müller',
    assigned_to: 'Max Müller',
    status: 'closed',
    resolution_notes: 'Erste Hilfe geleistet, Unfall dokumentiert. Person zur Kontrolle ins Krankenhaus, keine schwere Verletzung.',
    reported_at: '2025-02-19T11:45:00',
    resolved_at: '2025-02-19T12:30:00',
    created_at: '2025-02-19T11:50:00',
    updated_at: '2025-02-19T16:00:00'
  },
  {
    id: '3',
    project_id: '1',
    title: 'Lieferung verspätet - Audio Equipment',
    description: 'Audio Equipment sollte um 08:00 Uhr geliefert werden, ist noch nicht eingetroffen. Provider wurde kontaktiert.',
    severity: 'medium',
    category: 'logistics',
    reported_by: 'Anna Schmidt',
    assigned_to: 'Max Müller',
    status: 'investigating',
    reported_at: '2025-02-21T09:30:00',
    created_at: '2025-02-21T09:35:00',
    updated_at: '2025-02-21T09:35:00'
  }
];

const phases = ['setup', 'live', 'teardown'];
const categories = ['safety', 'technical', 'logistics', 'security', 'catering', 'general'];
const severities = ['low', 'medium', 'high', 'critical'];

export function OperationsManagement() {
  const { currentProject } = useApp();
  const [activeTab, setActiveTab] = useState<'checklists' | 'incidents' | 'dashboard'>('dashboard');
  const [checklists, setChecklists] = useState<OperationChecklist[]>(mockChecklists);
  const [incidents, setIncidents] = useState<IncidentReport[]>(mockIncidents);
  const [filteredChecklists, setFilteredChecklists] = useState<OperationChecklist[]>(mockChecklists);
  const [filteredIncidents, setFilteredIncidents] = useState<IncidentReport[]>(mockIncidents);
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [showAddIncident, setShowAddIncident] = useState(false);
  const [checklistFilter, setChecklistFilter] = useState({ phase: '', category: '' });
  const [incidentFilter, setIncidentFilter] = useState({ status: '', severity: '', category: '' });

  // Filter effects
  useEffect(() => {
    let filtered = checklists;
    if (checklistFilter.phase) {
      filtered = filtered.filter(cl => cl.phase === checklistFilter.phase);
    }
    if (checklistFilter.category) {
      filtered = filtered.filter(cl => cl.category === checklistFilter.category);
    }
    setFilteredChecklists(filtered);
  }, [checklists, checklistFilter]);

  useEffect(() => {
    let filtered = incidents;
    if (incidentFilter.status) {
      filtered = filtered.filter(inc => inc.status === incidentFilter.status);
    }
    if (incidentFilter.severity) {
      filtered = filtered.filter(inc => inc.severity === incidentFilter.severity);
    }
    if (incidentFilter.category) {
      filtered = filtered.filter(inc => inc.category === incidentFilter.category);
    }
    setFilteredIncidents(filtered);
  }, [incidents, incidentFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-700 border-red-200';
      case 'investigating': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const toggleChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(checklist => {
      if (checklist.id === checklistId) {
        const updatedItems = checklist.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              completed: !item.completed,
              completed_at: !item.completed ? new Date().toISOString() : undefined,
              completed_by: !item.completed ? 'Current User' : undefined
            };
          }
          return item;
        });
        
        const completedCount = updatedItems.filter(item => item.completed).length;
        const completion_status = Math.round((completedCount / updatedItems.length) * 100);
        
        return {
          ...checklist,
          items: updatedItems,
          completion_status,
          updated_at: new Date().toISOString()
        };
      }
      return checklist;
    }));
  };

  const renderDashboard = () => {
    const totalChecklists = checklists.length;
    const completedChecklists = checklists.filter(cl => cl.completion_status === 100).length;
    const overdueTasks = checklists.flatMap(cl => cl.items)
      .filter(item => !item.completed && item.due_date && new Date(item.due_date) < new Date()).length;
    
    const openIncidents = incidents.filter(inc => inc.status === 'open' || inc.status === 'investigating').length;
    const criticalIncidents = incidents.filter(inc => inc.severity === 'critical' && inc.status !== 'closed').length;
    
    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checklisten</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedChecklists}/{totalChecklists}</div>
              <p className="text-xs text-muted-foreground">abgeschlossen</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Überfällige Aufgaben</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${overdueTasks > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {overdueTasks}
              </div>
              <p className="text-xs text-muted-foreground">benötigen Aufmerksamkeit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offene Vorfälle</CardTitle>
              <AlertOctagon className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${openIncidents > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                {openIncidents}
              </div>
              <p className="text-xs text-muted-foreground">in Bearbeitung</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kritische Vorfälle</CardTitle>
              <Flag className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${criticalIncidents > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {criticalIncidents}
              </div>
              <p className="text-xs text-muted-foreground">hohe Priorität</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamtstatus</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                criticalIncidents > 0 ? 'text-red-600' : 
                openIncidents > 0 || overdueTasks > 0 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {criticalIncidents > 0 ? 'KRITISCH' : 
                 openIncidents > 0 || overdueTasks > 0 ? 'ACHTUNG' : 'OK'}
              </div>
              <p className="text-xs text-muted-foreground">Betriebsstatus</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Kritische Aufgaben</CardTitle>
              <CardDescription>Überfällige und dringende Checklisten-Punkte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checklists.flatMap(cl => 
                  cl.items
                    .filter(item => !item.completed && (
                      item.required || 
                      (item.due_date && new Date(item.due_date) < new Date())
                    ))
                    .slice(0, 5)
                    .map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={item.completed}
                            onChange={() => toggleChecklistItem(cl.id, item.id)}
                          />
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-gray-500">
                              {cl.title} • {cl.phase}
                              {item.due_date && (
                                <span className={`ml-2 ${new Date(item.due_date) < new Date() ? 'text-red-500' : ''}`}>
                                  • Fällig: {new Date(item.due_date).toLocaleDateString('de-DE')}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        {item.required && (
                          <Badge variant="outline" className="text-red-600">
                            Pflicht
                          </Badge>
                        )}
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aktuelle Vorfälle</CardTitle>
              <CardDescription>Offene und kürzlich gemeldete Incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents
                  .filter(inc => inc.status === 'open' || inc.status === 'investigating')
                  .slice(0, 5)
                  .map(incident => (
                    <div key={incident.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{incident.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>{incident.category}</span>
                            <span>•</span>
                            <span>Gemeldet: {new Date(incident.reported_at).toLocaleString('de-DE')}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getSeverityColor(incident.severity)} variant="outline">
                            {incident.severity === 'low' && 'Niedrig'}
                            {incident.severity === 'medium' && 'Mittel'}  
                            {incident.severity === 'high' && 'Hoch'}
                            {incident.severity === 'critical' && 'Kritisch'}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)} variant="outline">
                            {incident.status === 'open' && 'Offen'}
                            {incident.status === 'investigating' && 'In Bearbeitung'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderChecklists = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 flex-1">
          <Select 
            value={checklistFilter.phase} 
            onValueChange={(value) => setChecklistFilter(prev => ({ ...prev, phase: value }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle Phasen</SelectItem>
              <SelectItem value="setup">Setup</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="teardown">Abbau</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={checklistFilter.category} 
            onValueChange={(value) => setChecklistFilter(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle Kategorien</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => setShowAddChecklist(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Checkliste
        </Button>
      </div>

      <div className="space-y-6">
        {filteredChecklists.map(checklist => (
          <Card key={checklist.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{checklist.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <Badge variant="secondary" className="capitalize">
                      {checklist.phase}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {checklist.category}
                    </Badge>
                    {checklist.assigned_to && (
                      <span className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3" />
                        {checklist.assigned_to}
                      </span>
                    )}
                    {checklist.due_date && (
                      <span className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(checklist.due_date).toLocaleString('de-DE')}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{checklist.completion_status}%</div>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${checklist.completion_status}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checklist.items.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
                    <Checkbox 
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(checklist.id, item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${item.completed ? 'line-through text-gray-500' : ''}`}>
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2">
                          {item.required && (
                            <Badge variant="outline" className="text-red-600 text-xs">
                              Pflicht
                            </Badge>
                          )}
                          {item.due_date && !item.completed && (
                            <span className={`text-xs ${
                              new Date(item.due_date) < new Date() ? 'text-red-500' : 'text-gray-500'
                            }`}>
                              {new Date(item.due_date).toLocaleDateString('de-DE')}
                            </span>
                          )}
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      {item.completed && item.completed_by && (
                        <p className="text-xs text-green-600 mt-1">
                          Abgeschlossen von {item.completed_by} am{' '}
                          {item.completed_at && new Date(item.completed_at).toLocaleString('de-DE')}
                        </p>
                      )}
                      {item.assignee && !item.completed && (
                        <p className="text-xs text-gray-500 mt-1">
                          Zugewiesen an: {item.assignee}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderIncidents = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 flex-1">
          <Select 
            value={incidentFilter.status} 
            onValueChange={(value) => setIncidentFilter(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle Status</SelectItem>
              <SelectItem value="open">Offen</SelectItem>
              <SelectItem value="investigating">In Bearbeitung</SelectItem>
              <SelectItem value="resolved">Behoben</SelectItem>
              <SelectItem value="closed">Geschlossen</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={incidentFilter.severity} 
            onValueChange={(value) => setIncidentFilter(prev => ({ ...prev, severity: value }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priorität" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle Prioritäten</SelectItem>
              <SelectItem value="critical">Kritisch</SelectItem>
              <SelectItem value="high">Hoch</SelectItem>
              <SelectItem value="medium">Mittel</SelectItem>
              <SelectItem value="low">Niedrig</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={incidentFilter.category} 
            onValueChange={(value) => setIncidentFilter(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle Kategorien</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => setShowAddIncident(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Vorfall melden
        </Button>
      </div>

      <div className="space-y-4">
        {filteredIncidents.map(incident => (
          <Card key={incident.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{incident.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <Badge variant="outline" className="capitalize">
                      {incident.category}
                    </Badge>
                    {incident.reported_by && (
                      <span className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3" />
                        Gemeldet von {incident.reported_by}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(incident.reported_at).toLocaleString('de-DE')}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getSeverityColor(incident.severity)} variant="outline">
                    {incident.severity === 'low' && 'Niedrig'}
                    {incident.severity === 'medium' && 'Mittel'}  
                    {incident.severity === 'high' && 'Hoch'}
                    {incident.severity === 'critical' && 'Kritisch'}
                  </Badge>
                  <Badge className={getStatusColor(incident.status)} variant="outline">
                    {incident.status === 'open' && 'Offen'}
                    {incident.status === 'investigating' && 'In Bearbeitung'}
                    {incident.status === 'resolved' && 'Behoben'}
                    {incident.status === 'closed' && 'Geschlossen'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{incident.description}</p>
              
              {incident.assigned_to && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm">
                    <span className="font-medium">Zugewiesen an:</span> {incident.assigned_to}
                  </p>
                </div>
              )}
              
              {incident.resolution_notes && (
                <div className="bg-green-50 p-3 rounded-lg mb-4">
                  <p className="text-sm">
                    <span className="font-medium">Lösung:</span> {incident.resolution_notes}
                  </p>
                  {incident.resolved_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Behoben am {new Date(incident.resolved_at).toLocaleString('de-DE')}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                {incident.status === 'open' && (
                  <Button size="sm" variant="outline">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Bearbeitung starten
                  </Button>
                )}
                {incident.status === 'investigating' && (
                  <Button size="sm" variant="outline">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Als behoben markieren
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Kein Projekt ausgewählt</h2>
        <p className="text-gray-600">Wählen Sie ein Projekt aus, um Operations zu verwalten.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Operations Management</h1>
          <p className="text-gray-600">Checklisten, Incidents und Betriebsüberwachung</p>
        </div>
      </div>

      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Settings },
            { id: 'checklists', label: 'Checklisten', icon: CheckSquare },
            { id: 'incidents', label: 'Vorfälle', icon: AlertTriangle }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'checklists' && renderChecklists()}
        {activeTab === 'incidents' && renderIncidents()}
      </div>
    </div>
  );
}