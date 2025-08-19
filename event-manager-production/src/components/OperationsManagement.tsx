import React, { useState, useEffect } from 'react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'setup' | 'operation' | 'teardown' | 'safety' | 'technical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  dueTime?: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  dependencies?: string[];
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'technical' | 'safety' | 'security' | 'weather' | 'supplier' | 'other';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  assignedTo?: string;
  reportedAt: string;
  resolvedAt?: string;
  location?: string;
  actions: IncidentAction[];
}

interface IncidentAction {
  id: string;
  description: string;
  actionBy: string;
  actionAt: string;
  actionType: 'comment' | 'investigation' | 'resolution' | 'escalation';
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  contact: string;
  status: 'available' | 'busy' | 'unavailable';
  location?: string;
}

const mockChecklistItems: ChecklistItem[] = [
  {
    id: '1',
    title: 'Bühnensicherheit prüfen',
    description: 'Kontrolle aller Sicherheitsvorkehrungen der Hauptbühne',
    category: 'safety',
    priority: 'critical',
    assignedTo: 'Klaus Richter',
    status: 'completed',
    dueTime: '2025-09-15 08:00',
    completedAt: '2025-09-15 07:45',
    completedBy: 'Klaus Richter',
    notes: 'Alle Sicherheitsprüfungen bestanden'
  },
  {
    id: '2',
    title: 'Sound-Check Hauptbühne',
    description: 'Vollständiger Audio-Test aller Systeme',
    category: 'technical',
    priority: 'high',
    assignedTo: 'Thomas Weber',
    status: 'in-progress',
    dueTime: '2025-09-15 10:00'
  },
  {
    id: '3',
    title: 'Catering-Aufbau VIP-Bereich',
    description: 'Setup der VIP-Catering-Station',
    category: 'setup',
    priority: 'medium',
    assignedTo: 'Maria Schneider',
    status: 'pending',
    dueTime: '2025-09-15 11:00',
    dependencies: ['1']
  },
  {
    id: '4',
    title: 'Evakuierungsplan aktivieren',
    description: 'Notfallplan mit allen Teams besprechen',
    category: 'safety',
    priority: 'high',
    assignedTo: 'Klaus Richter',
    status: 'pending',
    dueTime: '2025-09-15 09:30'
  },
  {
    id: '5',
    title: 'Müllcontainer positionieren',
    description: 'Abfallbehälter an strategischen Punkten aufstellen',
    category: 'setup',
    priority: 'low',
    assignedTo: 'Peter Wagner',
    status: 'blocked',
    dueTime: '2025-09-15 12:00',
    notes: 'Wartet auf LKW-Lieferung'
  }
];

const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Stromausfall Sektor B',
    description: 'Kompletter Stromausfall im Sektor B, VIP-Bereich betroffen',
    severity: 'high',
    category: 'technical',
    status: 'resolved',
    reportedBy: 'Sarah König',
    assignedTo: 'Thomas Weber',
    reportedAt: '2025-09-15 14:20',
    resolvedAt: '2025-09-15 14:45',
    location: 'Sektor B - VIP Bereich',
    actions: [
      {
        id: '1',
        description: 'Incident gemeldet - Stromausfall in Sektor B',
        actionBy: 'Sarah König',
        actionAt: '2025-09-15 14:20',
        actionType: 'comment'
      },
      {
        id: '2',
        description: 'Techniker vor Ort, überprüft Hauptverteiler',
        actionBy: 'Thomas Weber',
        actionAt: '2025-09-15 14:25',
        actionType: 'investigation'
      },
      {
        id: '3',
        description: 'Defekte Sicherung gefunden und ersetzt',
        actionBy: 'Thomas Weber',
        actionAt: '2025-09-15 14:40',
        actionType: 'resolution'
      },
      {
        id: '4',
        description: 'Strom wiederhergestellt, alle Systeme funktionsfähig',
        actionBy: 'Thomas Weber',
        actionAt: '2025-09-15 14:45',
        actionType: 'resolution'
      }
    ]
  },
  {
    id: '2',
    title: 'Wetterwarnung: Starkregen',
    description: 'Wettervorhersage zeigt starken Regen ab 16:00',
    severity: 'medium',
    category: 'weather',
    status: 'investigating',
    reportedBy: 'Max Müller',
    assignedTo: 'Klaus Richter',
    reportedAt: '2025-09-15 15:30',
    location: 'Gesamtbereich',
    actions: [
      {
        id: '1',
        description: 'Wetterwarnung eingegangen',
        actionBy: 'Max Müller',
        actionAt: '2025-09-15 15:30',
        actionType: 'comment'
      },
      {
        id: '2',
        description: 'Sicherheitsteam informiert, Notfallplan wird geprüft',
        actionBy: 'Klaus Richter',
        actionAt: '2025-09-15 15:35',
        actionType: 'investigation'
      }
    ]
  }
];

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Klaus Richter',
    role: 'Sicherheitsleiter',
    department: 'Security',
    contact: '+49 172 555 0001',
    status: 'available',
    location: 'Haupteingang'
  },
  {
    id: '2',
    name: 'Thomas Weber',
    role: 'Technischer Leiter',
    department: 'Technik',
    contact: '+49 172 555 0002',
    status: 'busy',
    location: 'Hauptbühne'
  },
  {
    id: '3',
    name: 'Maria Schneider',
    role: 'Catering-Managerin',
    department: 'Catering',
    contact: '+49 172 555 0003',
    status: 'available',
    location: 'VIP-Bereich'
  },
  {
    id: '4',
    name: 'Peter Wagner',
    role: 'Logistik-Koordinator',
    department: 'Logistik',
    contact: '+49 172 555 0004',
    status: 'unavailable',
    location: 'Lager'
  }
];

export function OperationsManagement() {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(mockChecklistItems);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [teamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [viewMode, setViewMode] = useState<'dashboard' | 'checklist' | 'incidents' | 'team'>('dashboard');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [checklistFilter, setChecklistFilter] = useState<string>('all');
  const [incidentFilter, setIncidentFilter] = useState<string>('all');

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string, type: 'checklist' | 'incident' = 'checklist') => {
    if (type === 'checklist') {
      const colors: Record<string, string> = {
        'pending': 'bg-gray-100 text-gray-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'blocked': 'bg-red-100 text-red-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    } else {
      const colors: Record<string, string> = {
        'open': 'bg-red-100 text-red-800',
        'investigating': 'bg-yellow-100 text-yellow-800',
        'resolved': 'bg-green-100 text-green-800',
        'closed': 'bg-gray-100 text-gray-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-blue-100 text-blue-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getTeamStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'available': 'bg-green-100 text-green-800',
      'busy': 'bg-yellow-100 text-yellow-800',
      'unavailable': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const updateChecklistStatus = (itemId: string, newStatus: ChecklistItem['status']) => {
    setChecklistItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updates: Partial<ChecklistItem> = { status: newStatus };
        if (newStatus === 'completed') {
          updates.completedAt = new Date().toISOString();
          updates.completedBy = item.assignedTo;
        }
        return { ...item, ...updates };
      }
      return item;
    }));
  };

  const addIncidentAction = (incidentId: string, action: Omit<IncidentAction, 'id'>) => {
    setIncidents(prev => prev.map(incident => {
      if (incident.id === incidentId) {
        const newAction: IncidentAction = {
          ...action,
          id: Date.now().toString()
        };
        return {
          ...incident,
          actions: [...incident.actions, newAction]
        };
      }
      return incident;
    }));
  };

  const updateIncidentStatus = (incidentId: string, newStatus: Incident['status']) => {
    setIncidents(prev => prev.map(incident => {
      if (incident.id === incidentId) {
        const updates: Partial<Incident> = { status: newStatus };
        if (newStatus === 'resolved' || newStatus === 'closed') {
          updates.resolvedAt = new Date().toISOString();
        }
        return { ...incident, ...updates };
      }
      return incident;
    }));
  };

  const renderDashboard = () => {
    const completedTasks = checklistItems.filter(item => item.status === 'completed').length;
    const criticalTasks = checklistItems.filter(item => item.priority === 'critical' && item.status !== 'completed').length;
    const openIncidents = incidents.filter(incident => incident.status === 'open' || incident.status === 'investigating').length;
    const criticalIncidents = incidents.filter(incident => incident.severity === 'critical' && incident.status !== 'closed').length;
    const availableTeam = teamMembers.filter(member => member.status === 'available').length;

    return (
      <div className="space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Aufgaben erledigt</h3>
            <p className="text-2xl font-bold text-green-600">{completedTasks}/{checklistItems.length}</p>
            <p className="text-sm text-gray-600">{((completedTasks / checklistItems.length) * 100).toFixed(0)}% abgeschlossen</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Kritische Aufgaben</h3>
            <p className="text-2xl font-bold text-red-600">{criticalTasks}</p>
            <p className="text-sm text-gray-600">Sofort zu erledigen</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Offene Incidents</h3>
            <p className="text-2xl font-bold text-orange-600">{openIncidents}</p>
            <p className="text-sm text-gray-600">In Bearbeitung</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Kritische Incidents</h3>
            <p className="text-2xl font-bold text-red-600">{criticalIncidents}</p>
            <p className="text-sm text-gray-600">Hohe Priorität</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Team verfügbar</h3>
            <p className="text-2xl font-bold text-blue-600">{availableTeam}/{teamMembers.length}</p>
            <p className="text-sm text-gray-600">Einsatzbereit</p>
          </div>
        </div>

        {/* Critical Items Alert */}
        {criticalTasks > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Kritische Aufgaben</h3>
            <div className="space-y-2">
              {checklistItems
                .filter(item => item.priority === 'critical' && item.status !== 'completed')
                .map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="text-red-700">{item.title} - {item.assignedTo}</span>
                    <span className="text-sm text-red-600">{item.dueTime}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Checklist Updates */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Letzte Checklist-Updates</h3>
            </div>
            <div className="p-4 space-y-3">
              {checklistItems
                .filter(item => item.status === 'completed')
                .slice(0, 5)
                .map(item => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {item.completedBy} • {item.completedAt}
                      </p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Active Incidents */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Aktive Incidents</h3>
            </div>
            <div className="p-4 space-y-3">
              {incidents
                .filter(incident => incident.status !== 'closed')
                .slice(0, 5)
                .map(incident => (
                  <div key={incident.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{incident.title}</p>
                      <p className="text-xs text-gray-500">
                        {incident.assignedTo} • {incident.reportedAt}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Team Status */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Team-Status</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {teamMembers.map(member => (
                <div key={member.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{member.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTeamStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{member.role}</p>
                  <p className="text-xs text-gray-500">{member.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChecklist = () => {
    const filteredItems = checklistFilter === 'all' 
      ? checklistItems 
      : checklistItems.filter(item => item.status === checklistFilter);

    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border flex gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
            <select 
              value={checklistFilter} 
              onChange={(e) => setChecklistFilter(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">Alle</option>
              <option value="pending">Ausstehend</option>
              <option value="in-progress">In Bearbeitung</option>
              <option value="completed">Abgeschlossen</option>
              <option value="blocked">Blockiert</option>
            </select>
          </div>
          
          <div className="ml-auto">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
              + Neue Aufgabe
            </button>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>👤 {item.assignedTo}</span>
                    {item.dueTime && <span>⏰ {item.dueTime}</span>}
                    {item.completedAt && <span>✅ {item.completedAt}</span>}
                  </div>
                  
                  {item.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <strong>Notizen:</strong> {item.notes}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  {item.status !== 'completed' && (
                    <>
                      <button 
                        onClick={() => updateChecklistStatus(item.id, 'in-progress')}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Start
                      </button>
                      <button 
                        onClick={() => updateChecklistStatus(item.id, 'completed')}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Erledigt
                      </button>
                    </>
                  )}
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    Bearbeiten
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderIncidents = () => {
    const filteredIncidents = incidentFilter === 'all' 
      ? incidents 
      : incidents.filter(incident => incident.status === incidentFilter);

    if (selectedIncident) {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSelectedIncident(null)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Zurück
            </button>
            <h2 className="text-xl font-semibold">{selectedIncident.title}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedIncident.severity)}`}>
              {selectedIncident.severity}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedIncident.status, 'incident')}`}>
              {selectedIncident.status}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Incident Details */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Incident Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Beschreibung:</label>
                    <p className="text-gray-900">{selectedIncident.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Gemeldet von:</label>
                      <p className="text-gray-900">{selectedIncident.reportedBy}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Zugewiesen an:</label>
                      <p className="text-gray-900">{selectedIncident.assignedTo || 'Nicht zugewiesen'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Kategorie:</label>
                      <p className="text-gray-900">{selectedIncident.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Standort:</label>
                      <p className="text-gray-900">{selectedIncident.location || 'Nicht angegeben'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action History */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Aktionsverlauf</h3>
                <div className="space-y-4">
                  {selectedIncident.actions.map(action => (
                    <div key={action.id} className="border-l-4 border-blue-200 pl-4">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium text-gray-900">{action.description}</p>
                        <span className="text-xs text-gray-500">{action.actionAt}</span>
                      </div>
                      <p className="text-sm text-gray-600">{action.actionBy} • {action.actionType}</p>
                    </div>
                  ))}
                </div>
                
                {/* Add Action Form */}
                <div className="mt-6 pt-4 border-t">
                  <textarea 
                    placeholder="Neue Aktion hinzufügen..."
                    className="w-full border rounded px-3 py-2 text-sm mb-2"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => addIncidentAction(selectedIncident.id, {
                        description: 'Neue Aktion hinzugefügt',
                        actionBy: 'Aktueller User',
                        actionAt: new Date().toISOString(),
                        actionType: 'comment'
                      })}
                      className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Kommentar
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                      Als gelöst markieren
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {/* Status Management */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Status-Management</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status ändern:</label>
                    <select 
                      value={selectedIncident.status}
                      onChange={(e) => updateIncidentStatus(selectedIncident.id, e.target.value as Incident['status'])}
                      className="w-full border rounded px-3 py-2 text-sm mt-1"
                    >
                      <option value="open">Offen</option>
                      <option value="investigating">In Bearbeitung</option>
                      <option value="resolved">Gelöst</option>
                      <option value="closed">Geschlossen</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Zuweisen an:</label>
                    <select className="w-full border rounded px-3 py-2 text-sm mt-1">
                      <option value="">Auswählen...</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>

                  <button className="w-full px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                    Eskalieren
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Statistiken</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gemeldet:</span>
                    <span>{selectedIncident.reportedAt}</span>
                  </div>
                  {selectedIncident.resolvedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gelöst:</span>
                      <span>{selectedIncident.resolvedAt}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Aktionen:</span>
                    <span>{selectedIncident.actions.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border flex gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
            <select 
              value={incidentFilter} 
              onChange={(e) => setIncidentFilter(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">Alle</option>
              <option value="open">Offen</option>
              <option value="investigating">In Bearbeitung</option>
              <option value="resolved">Gelöst</option>
              <option value="closed">Geschlossen</option>
            </select>
          </div>
          
          <div className="ml-auto">
            <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm">
              + Incident melden
            </button>
          </div>
        </div>

        {/* Incidents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredIncidents.map(incident => (
            <div key={incident.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{incident.title}</h3>
                  <p className="text-sm text-gray-600">{incident.description}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status, 'incident')}`}>
                    {incident.status}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 space-y-1 mb-3">
                <p>📍 {incident.location || 'Standort unbekannt'}</p>
                <p>👤 {incident.reportedBy} → {incident.assignedTo || 'Nicht zugewiesen'}</p>
                <p>🕒 {incident.reportedAt}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {incident.actions.length} Aktionen
                </span>
                <button 
                  onClick={() => setSelectedIncident(incident)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTeam = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Team-Übersicht</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map(member => (
              <div key={member.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{member.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTeamStatusColor(member.status)}`}>
                    {member.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Rolle:</span> {member.role}</p>
                  <p><span className="text-gray-500">Abteilung:</span> {member.department}</p>
                  <p><span className="text-gray-500">Kontakt:</span> {member.contact}</p>
                  <p><span className="text-gray-500">Standort:</span> {member.location}</p>
                </div>
                
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                    Kontakt
                  </button>
                  <button className="flex-1 border border-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-50">
                    Zuweisen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Management</h1>
          <p className="text-gray-600">Live-Betrieb, Checklisten, Incident-Management und Team-Koordination</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode('dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setViewMode('checklist')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'checklist' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Checklisten
          </button>
          <button 
            onClick={() => setViewMode('incidents')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'incidents' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Incidents
          </button>
          <button 
            onClick={() => setViewMode('team')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'team' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Team
          </button>
        </div>
      </div>

      {viewMode === 'dashboard' && renderDashboard()}
      {viewMode === 'checklist' && renderChecklist()}
      {viewMode === 'incidents' && renderIncidents()}
      {viewMode === 'team' && renderTeam()}
    </div>
  );
}