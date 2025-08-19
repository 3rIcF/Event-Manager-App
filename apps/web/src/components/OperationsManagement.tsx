import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Circle, AlertTriangle, Clock, Filter, Search, Calendar, Users, Flag } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'setup' | 'during' | 'teardown' | 'safety' | 'quality';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  category: 'safety' | 'technical' | 'logistical' | 'security' | 'other';
  reportedAt: string;
  reportedBy: string;
  assignedTo?: string;
  resolvedAt?: string;
  resolution?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const OperationsManagement: React.FC = () => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeTab, setActiveTab] = useState<'checklist' | 'incidents' | 'overview'>('overview');
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Mock-Daten
  useEffect(() => {
    const mockChecklistItems: ChecklistItem[] = [
      {
        id: '1',
        title: 'Bühne aufbauen',
        description: 'Hauptbühne und Nebenbühnen gemäß Plan aufbauen',
        category: 'setup',
        priority: 'high',
        status: 'completed',
        assignedTo: 'Team A',
        dueDate: '2025-01-20T08:00:00Z',
        completedAt: '2025-01-20T07:30:00Z',
        completedBy: 'Team A'
      },
      {
        id: '2',
        title: 'Sicherheitscheck durchführen',
        description: 'Alle Sicherheitseinrichtungen und Notausgänge prüfen',
        category: 'safety',
        priority: 'critical',
        status: 'in-progress',
        assignedTo: 'Sicherheitsbeauftragter',
        dueDate: '2025-01-20T09:00:00Z'
      },
      {
        id: '3',
        title: 'Soundcheck',
        description: 'Mikrofone, Lautsprecher und Musiksystem testen',
        category: 'during',
        priority: 'medium',
        status: 'pending',
        assignedTo: 'Technik-Team',
        dueDate: '2025-01-20T10:00:00Z'
      }
    ];

    const mockIncidents: Incident[] = [
      {
        id: '1',
        title: 'Mikrofon funktioniert nicht',
        description: 'Hauptmikrofon auf der Bühne gibt kein Signal',
        severity: 'medium',
        status: 'investigating',
        category: 'technical',
        reportedAt: '2025-01-20T09:15:00Z',
        reportedBy: 'Moderator',
        assignedTo: 'Technik-Team',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Verkehrsstau bei Lieferung',
        description: 'Catering-Lieferung verzögert sich durch Verkehrsstau',
        severity: 'low',
        status: 'open',
        category: 'logistical',
        reportedAt: '2025-01-20T08:30:00Z',
        reportedBy: 'Logistik-Koordinator',
        priority: 'medium'
      }
    ];

    setChecklistItems(mockChecklistItems);
    setIncidents(mockIncidents);
  }, []);

  const handleAddChecklistItem = () => {
    setEditingItem(null);
    setIsChecklistModalOpen(true);
  };

  const handleAddIncident = () => {
    setEditingIncident(null);
    setIsIncidentModalOpen(true);
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = item.status === 'completed' ? 'pending' : 'completed';
        return {
          ...item,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
          completedBy: newStatus === 'completed' ? 'Current User' : undefined
        };
      }
      return item;
    }));
  };

  const handleSaveChecklistItem = (itemData: Omit<ChecklistItem, 'id'>) => {
    if (editingItem) {
      const updatedItem = { ...editingItem, ...itemData };
      setChecklistItems(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
    } else {
      const newItem = { ...itemData, id: Date.now().toString() };
      setChecklistItems(prev => [...prev, newItem]);
    }
    setIsChecklistModalOpen(false);
    setEditingItem(null);
  };

  const handleSaveIncident = (incidentData: Omit<Incident, 'id' | 'reportedAt' | 'reportedBy'>) => {
    if (editingIncident) {
      const updatedIncident = { ...editingIncident, ...incidentData };
      setIncidents(prev => prev.map(incident => incident.id === editingIncident.id ? updatedIncident : incident));
    } else {
      const newIncident = { 
        ...incidentData, 
        id: Date.now().toString(),
        reportedAt: new Date().toISOString(),
        reportedBy: 'Current User'
      };
      setIncidents(prev => [...prev, newIncident]);
    }
    setIsIncidentModalOpen(false);
    setEditingIncident(null);
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'skipped': 'bg-yellow-100 text-yellow-800',
      'open': 'bg-red-100 text-red-800',
      'investigating': 'bg-orange-100 text-orange-800',
      'resolved': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high': return <Flag className="w-5 h-5 text-orange-600" />;
      case 'medium': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <Circle className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredChecklistItems = checklistItems.filter(item => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
    return true;
  });

  const completedItems = checklistItems.filter(item => item.status === 'completed').length;
  const totalItems = checklistItems.length;
  const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operations-Management</h1>
          <p className="text-gray-600 mt-2">Verwalten Sie Checklisten, Vorfälle und Qualitätssicherung</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddChecklistItem}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Checkliste
          </button>
          <button
            onClick={handleAddIncident}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Vorfall
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Übersicht', icon: Circle },
            { id: 'checklist', label: 'Checklisten', icon: CheckCircle },
            { id: 'incidents', label: 'Vorfälle', icon: AlertTriangle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Checklisten-Fortschritt</p>
                  <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{completedItems} von {totalItems} erledigt</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Offene Vorfälle</p>
                  <p className="text-2xl font-bold text-red-600">
                    {incidents.filter(i => i.status === 'open' || i.status === 'investigating').length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Benötigen Aufmerksamkeit</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Kritische Aufgaben</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {checklistItems.filter(item => item.priority === 'critical' && item.status !== 'completed').length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Flag className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Hohe Priorität</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktive Teams</p>
                  <p className="text-2xl font-bold text-green-600">
                    {new Set(checklistItems.map(item => item.assignedTo).filter(Boolean)).size}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Arbeiten an Aufgaben</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Checklist Items */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">Letzte Checklisten-Aktivitäten</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {checklistItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleChecklistItem(item.id)}
                        className="text-gray-400 hover:text-green-600 transition-colors"
                      >
                        {item.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Incidents */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">Aktuelle Vorfälle</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {incidents.slice(0, 5).map((incident) => (
                  <div key={incident.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(incident.severity)}
                        <div>
                          <p className="font-medium text-gray-900">{incident.title}</p>
                          <p className="text-sm text-gray-500">{incident.category}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Alle Kategorien</option>
                <option value="setup">Setup</option>
                <option value="during">Während Event</option>
                <option value="teardown">Abbau</option>
                <option value="safety">Sicherheit</option>
                <option value="quality">Qualität</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Alle Status</option>
                <option value="pending">Ausstehend</option>
                <option value="in-progress">In Bearbeitung</option>
                <option value="completed">Abgeschlossen</option>
                <option value="skipped">Übersprungen</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Alle Prioritäten</option>
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
                <option value="critical">Kritisch</option>
              </select>

              <div className="text-sm text-gray-600 flex items-center justify-center">
                {filteredChecklistItems.length} von {checklistItems.length} Aufgaben
              </div>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-4">
            {filteredChecklistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <button
                      onClick={() => handleToggleChecklistItem(item.id)}
                      className="mt-1 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      {item.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status === 'pending' ? 'Ausstehend' : 
                           item.status === 'in-progress' ? 'In Bearbeitung' : 
                           item.status === 'completed' ? 'Abgeschlossen' : 'Übersprungen'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{item.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Kategorie:</span>
                          <span className="ml-2 font-medium">{item.category}</span>
                        </div>
                        {item.assignedTo && (
                          <div>
                            <span className="text-gray-500">Zugewiesen an:</span>
                            <span className="ml-2 font-medium">{item.assignedTo}</span>
                          </div>
                        )}
                        {item.dueDate && (
                          <div>
                            <span className="text-gray-500">Fällig:</span>
                            <span className="ml-2 font-medium">
                              {new Date(item.dueDate).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                        )}
                      </div>

                      {item.completedAt && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            Abgeschlossen am {new Date(item.completedAt).toLocaleDateString('de-DE')} 
                            {item.completedBy && ` von ${item.completedBy}`}
                          </p>
                        </div>
                      )}

                      {item.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{item.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsChecklistModalOpen(true);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredChecklistItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <CheckCircle className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Aufgaben gefunden</h3>
              <p className="text-gray-600 mb-4">
                {filterCategory !== 'all' || filterStatus !== 'all' || filterPriority !== 'all'
                  ? 'Versuchen Sie andere Filter-Einstellungen.'
                  : 'Fügen Sie Ihre erste Checklisten-Aufgabe hinzu, um zu beginnen.'}
              </p>
              {filterCategory === 'all' && filterStatus === 'all' && filterPriority === 'all' && (
                <button
                  onClick={handleAddChecklistItem}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Erste Aufgabe hinzufügen
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="space-y-6">
          {/* Incidents List */}
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div key={incident.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(incident.severity)}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{incident.title}</h3>
                      <p className="text-sm text-gray-500">Gemeldet von {incident.reportedBy}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(incident.priority)}`}>
                      {incident.priority}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(incident.status)}`}>
                      {incident.status === 'open' ? 'Offen' : 
                       incident.status === 'investigating' ? 'In Bearbeitung' : 
                       incident.status === 'resolved' ? 'Gelöst' : 'Geschlossen'}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{incident.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Kategorie:</span>
                    <span className="ml-2 font-medium">{incident.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gemeldet am:</span>
                    <span className="ml-2 font-medium">
                      {new Date(incident.reportedAt).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                  {incident.assignedTo && (
                    <div>
                      <span className="text-gray-500">Zugewiesen an:</span>
                      <span className="ml-2 font-medium">{incident.assignedTo}</span>
                    </div>
                  )}
                </div>

                {incident.resolution && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Lösung:</h4>
                    <p className="text-sm text-blue-800">{incident.resolution}</p>
                    {incident.resolvedAt && (
                      <p className="text-xs text-blue-600 mt-2">
                        Gelöst am {new Date(incident.resolvedAt).toLocaleDateString('de-DE')}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setEditingIncident(incident);
                      setIsIncidentModalOpen(true);
                    }}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    Bearbeiten
                  </button>
                  <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium">
                    Details anzeigen
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {incidents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <AlertTriangle className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Vorfälle vorhanden</h3>
              <p className="text-gray-600 mb-4">Das ist ein gutes Zeichen! Alle Vorfälle wurden erfolgreich gelöst.</p>
              <button
                onClick={handleAddIncident}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Vorfall melden
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isChecklistModalOpen && (
        <ChecklistModal
          item={editingItem}
          onSave={handleSaveChecklistItem}
          onClose={() => {
            setIsChecklistModalOpen(false);
            setEditingItem(null);
          }}
        />
      )}

      {isIncidentModalOpen && (
        <IncidentModal
          incident={editingIncident}
          onSave={handleSaveIncident}
          onClose={() => {
            setIsIncidentModalOpen(false);
            setEditingIncident(null);
          }}
        />
      )}
    </div>
  );
};

// Checklist Modal Component
interface ChecklistModalProps {
  item: ChecklistItem | null;
  onSave: (data: Omit<ChecklistItem, 'id'>) => void;
  onClose: () => void;
}

const ChecklistModal: React.FC<ChecklistModalProps> = ({ item, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    category: item?.category || 'setup',
    priority: item?.priority || 'medium',
    status: item?.status || 'pending',
    assignedTo: item?.assignedTo || '',
    dueDate: item?.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
    notes: item?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {item ? 'Aufgabe bearbeiten' : 'Neue Checklisten-Aufgabe'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Titel *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="setup">Setup</option>
                <option value="during">Während Event</option>
                <option value="teardown">Abbau</option>
                <option value="safety">Sicherheit</option>
                <option value="quality">Qualität</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priorität *</label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
                <option value="critical">Kritisch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Zugewiesen an</label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Team oder Person"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fälligkeitsdatum</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notizen</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Zusätzliche Informationen..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {item ? 'Aktualisieren' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Incident Modal Component
interface IncidentModalProps {
  incident: Incident | null;
  onSave: (data: Omit<Incident, 'id' | 'reportedAt' | 'reportedBy'>) => void;
  onClose: () => void;
}

const IncidentModal: React.FC<IncidentModalProps> = ({ incident, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: incident?.title || '',
    description: incident?.description || '',
    severity: incident?.severity || 'medium',
    status: incident?.status || 'open',
    category: incident?.category || 'other',
    assignedTo: incident?.assignedTo || '',
    priority: incident?.priority || 'medium',
    resolution: incident?.resolution || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {incident ? 'Vorfall bearbeiten' : 'Neuen Vorfall melden'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Titel *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Schweregrad *</label>
              <select
                required
                value={formData.severity}
                onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
                <option value="critical">Kritisch</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priorität *</label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
                <option value="critical">Kritisch</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="safety">Sicherheit</option>
                <option value="technical">Technisch</option>
                <option value="logistical">Logistisch</option>
                <option value="security">Sicherheit</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="open">Offen</option>
                <option value="investigating">In Bearbeitung</option>
                <option value="resolved">Gelöst</option>
                <option value="closed">Geschlossen</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Zugewiesen an</label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Team oder Person"
            />
          </div>

          {formData.status === 'resolved' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lösung</label>
              <textarea
                value={formData.resolution}
                onChange={(e) => setFormData(prev => ({ ...prev, resolution: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Beschreiben Sie die Lösung..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              {incident ? 'Aktualisieren' : 'Melden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OperationsManagement;
