import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  address?: string;
  status: 'idea' | 'planning' | 'approval' | 'setup' | 'live' | 'teardown' | 'closed';
  responsible: string;
  budget?: number;
  createdAt: string;
  createdBy: string;
  team?: string[];
  tags?: string[];
  progress?: number;
  milestones?: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  assignedTo: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Stadtfest München 2025',
    description: 'Jährliches Stadtfest mit Bühnen, Ständen und Fahrgeschäften',
    startDate: '2025-09-15',
    endDate: '2025-09-17',
    location: 'München Zentrum',
    address: 'Marienplatz 1, 80331 München',
    status: 'planning',
    responsible: 'Max Müller',
    budget: 250000,
    createdAt: '2024-12-01',
    createdBy: 'admin@eventmanager.com',
    team: ['Max Müller', 'Anna Schmidt', 'Klaus Richter'],
    tags: ['Festival', 'Public Event', 'Music'],
    progress: 65,
    milestones: [
      {
        id: '1',
        title: 'Genehmigungen erhalten',
        description: 'Alle behördlichen Genehmigungen einholen',
        dueDate: '2025-08-15',
        completed: true,
        completedAt: '2025-08-10',
        assignedTo: 'Klaus Richter'
      },
      {
        id: '2',
        title: 'Hauptsponsoring abschließen',
        description: 'Verträge mit Hauptsponsoren finalisieren',
        dueDate: '2025-07-30',
        completed: true,
        completedAt: '2025-07-25',
        assignedTo: 'Anna Schmidt'
      },
      {
        id: '3',
        title: 'Bühnentechnik buchen',
        description: 'Sound- und Lichttechnik reservieren',
        dueDate: '2025-09-01',
        completed: false,
        assignedTo: 'Thomas Weber'
      }
    ]
  },
  {
    id: '2',
    name: 'BMW Pressekonferenz',
    description: 'Produktpräsentation neuer Fahrzeugmodelle',
    startDate: '2025-10-20',
    endDate: '2025-10-20',
    location: 'BMW Welt München',
    address: 'Am Olympiapark 2, 80809 München',
    status: 'approval',
    responsible: 'Anna Schmidt',
    budget: 85000,
    createdAt: '2024-11-15',
    createdBy: 'manager@eventmanager.com',
    team: ['Anna Schmidt', 'Maria Schneider'],
    tags: ['Corporate', 'Press', 'Automotive'],
    progress: 40,
    milestones: [
      {
        id: '4',
        title: 'Konzept genehmigt',
        description: 'Final approval vom BMW Management',
        dueDate: '2025-01-15',
        completed: false,
        assignedTo: 'Anna Schmidt'
      }
    ]
  }
];

export function ProjectManagement() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status' | 'progress'>('date');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'idea': 'bg-gray-100 text-gray-800',
      'planning': 'bg-blue-100 text-blue-800',
      'approval': 'bg-yellow-100 text-yellow-800',
      'setup': 'bg-orange-100 text-orange-800',
      'live': 'bg-green-100 text-green-800',
      'teardown': 'bg-purple-100 text-purple-800',
      'closed': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'idea': 'Idee',
      'planning': 'Planung',
      'approval': 'Genehmigung',
      'setup': 'Aufbau',
      'live': 'Live',
      'teardown': 'Abbau',
      'closed': 'Abgeschlossen',
    };
    return labels[status] || status;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const filteredProjects = projects.filter(project => {
    if (filterStatus === 'all') return true;
    return project.status === filterStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case 'status':
        return a.status.localeCompare(b.status);
      case 'progress':
        return (b.progress || 0) - (a.progress || 0);
      default:
        return 0;
    }
  });

  const updateProjectProgress = (projectId: string, newProgress: number) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, progress: newProgress } : p
    ));
  };

  const updateProjectStatus = (projectId: string, newStatus: Project['status']) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, status: newStatus } : p
    ));
  };

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updatedMilestones = p.milestones?.map(m => {
          if (m.id === milestoneId) {
            return {
              ...m,
              completed: !m.completed,
              completedAt: !m.completed ? new Date().toISOString() : undefined
            };
          }
          return m;
        });
        return { ...p, milestones: updatedMilestones };
      }
      return p;
    }));
  };

  const renderProjectCard = (project: Project) => (
    <div key={project.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {getStatusLabel(project.status)}
          </span>
        </div>

        {project.progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Fortschritt</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${getProgressColor(project.progress)}`}
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <span className="w-4 h-4 text-gray-400 mr-2">📍</span>
            <span>{project.location}</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 text-gray-400 mr-2">📅</span>
            <span>{project.startDate} - {project.endDate}</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 text-gray-400 mr-2">👤</span>
            <span>{project.responsible}</span>
          </div>
          {project.budget && (
            <div className="flex items-center">
              <span className="w-4 h-4 text-gray-400 mr-2">💰</span>
              <span>€{project.budget.toLocaleString()}</span>
            </div>
          )}
        </div>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {project.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {project.team && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Team ({project.team.length})</p>
            <div className="flex -space-x-2">
              {project.team.slice(0, 4).map((member, index) => (
                <div 
                  key={index}
                  className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                  title={member}
                >
                  {member.split(' ').map(n => n[0]).join('')}
                </div>
              ))}
              {project.team.length > 4 && (
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                  +{project.team.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedProject(project)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm transition-colors"
          >
            Details
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm transition-colors">
            Bearbeiten
          </button>
        </div>
      </div>
    </div>
  );

  const renderProjectDetail = () => {
    if (!selectedProject) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSelectedProject(null)}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Zurück zur Übersicht
            </button>
            <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}>
            {getStatusLabel(selectedProject.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Projekt-Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Beschreibung</label>
                  <p className="text-gray-900">{selectedProject.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Verantwortlicher</label>
                  <p className="text-gray-900">{selectedProject.responsible}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Start</label>
                  <p className="text-gray-900">{selectedProject.startDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ende</label>
                  <p className="text-gray-900">{selectedProject.endDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Standort</label>
                  <p className="text-gray-900">{selectedProject.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Adresse</label>
                  <p className="text-gray-900">{selectedProject.address || '—'}</p>
                </div>
                {selectedProject.budget && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Budget</label>
                    <p className="text-gray-900">€{selectedProject.budget.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Milestones */}
            {selectedProject.milestones && selectedProject.milestones.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Meilensteine</h3>
                <div className="space-y-3">
                  {selectedProject.milestones.map(milestone => (
                    <div key={milestone.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={milestone.completed}
                        onChange={() => toggleMilestone(selectedProject.id, milestone.id)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <h4 className={`font-medium ${milestone.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {milestone.title}
                        </h4>
                        {milestone.description && (
                          <p className="text-sm text-gray-600">{milestone.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>📅 {milestone.dueDate}</span>
                          <span>👤 {milestone.assignedTo}</span>
                          {milestone.completedAt && (
                            <span className="text-green-600">✅ {milestone.completedAt}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Management */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Projektfortschritt</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Fortschritt</span>
                    <span className="font-medium">{selectedProject.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${getProgressColor(selectedProject.progress || 0)}`}
                      style={{ width: `${selectedProject.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Fortschritt aktualisieren:</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedProject.progress || 0}
                    onChange={(e) => updateProjectProgress(selectedProject.id, parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status ändern:</label>
                  <select 
                    value={selectedProject.status}
                    onChange={(e) => updateProjectStatus(selectedProject.id, e.target.value as Project['status'])}
                    className="w-full mt-1 border rounded px-3 py-2"
                  >
                    <option value="idea">Idee</option>
                    <option value="planning">Planung</option>
                    <option value="approval">Genehmigung</option>
                    <option value="setup">Aufbau</option>
                    <option value="live">Live</option>
                    <option value="teardown">Abbau</option>
                    <option value="closed">Abgeschlossen</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Team */}
            {selectedProject.team && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Team</h3>
                <div className="space-y-2">
                  {selectedProject.team.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {member.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm">{member}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Aktionen</h3>
              <div className="space-y-2">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                  Services verwalten
                </button>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">
                  Budget anzeigen
                </button>
                <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 text-sm">
                  Operations Dashboard
                </button>
                <button className="w-full border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 text-sm">
                  Projekt exportieren
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (selectedProject) {
    return renderProjectDetail();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projektmanagement</h1>
          <p className="text-gray-600">Alle Events und Projekte verwalten</p>
        </div>
        
        <button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Neues Projekt
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Ansicht:</label>
            <div className="inline-flex rounded-md shadow-sm">
              {(['grid', 'list', 'kanban'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-sm ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border ${mode === 'grid' ? 'rounded-l-md' : mode === 'kanban' ? 'rounded-r-md' : ''}`}
                >
                  {mode === 'grid' ? '⊞' : mode === 'list' ? '☰' : '📋'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">Alle</option>
              <option value="idea">Idee</option>
              <option value="planning">Planung</option>
              <option value="approval">Genehmigung</option>
              <option value="setup">Aufbau</option>
              <option value="live">Live</option>
              <option value="teardown">Abbau</option>
              <option value="closed">Abgeschlossen</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Sortierung:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="date">Datum</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="progress">Fortschritt</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            {filteredProjects.length} von {projects.length} Projekten
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1'
      }`}>
        {filteredProjects.map(project => renderProjectCard(project))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <div className="text-gray-400 text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Projekte gefunden</h3>
          <p className="text-gray-600 mb-4">
            {filterStatus === 'all' 
              ? 'Erstellen Sie Ihr erstes Projekt, um zu beginnen.'
              : `Keine Projekte mit Status "${getStatusLabel(filterStatus)}" gefunden.`
            }
          </p>
          <button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Erstes Projekt erstellen
          </button>
        </div>
      )}
    </div>
  );
}