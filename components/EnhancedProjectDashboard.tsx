import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/hooks/useAuth';
import { enhancedProjectService, Project } from '../src/services/enhancedProjectService';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  upcomingProjects: number;
}

export function EnhancedProjectDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    upcomingProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const projectsData = await enhancedProjectService.getProjects();
      setProjects(projectsData);
      
      // Calculate stats
      const now = new Date();
      const stats = {
        totalProjects: projectsData.length,
        activeProjects: projectsData.filter(p => 
          ['PLANNING', 'APPROVAL', 'SETUP', 'LIVE'].includes(p.status)
        ).length,
        completedProjects: projectsData.filter(p => p.status === 'CLOSED').length,
        upcomingProjects: projectsData.filter(p => 
          new Date(p.startDate) > now && p.status !== 'CLOSED'
        ).length,
      };
      setStats(stats);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Projekte');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Projekt-Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <h2 className="font-bold mb-2">Fehler</h2>
          <p>{error}</p>
          <button
            onClick={loadProjects}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Willkommen zurück, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">
          Hier ist Ihre Projekt-Übersicht und aktuelle Statistiken.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alle Projekte</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktive Projekte</p>
              <p className="text-2xl font-bold text-green-900">{stats.activeProjects}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">⚡</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Abgeschlossen</p>
              <p className="text-2xl font-bold text-purple-900">{stats.completedProjects}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-sm font-bold">🏁</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kommende</p>
              <p className="text-2xl font-bold text-orange-900">{stats.upcomingProjects}</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-sm font-bold">🚀</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Aktuelle Projekte</h2>
          <button
            onClick={loadProjects}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Aktualisieren
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Projekte</h3>
            <p className="text-gray-600">Erstellen Sie Ihr erstes Projekt, um zu beginnen.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => {
              const priority = enhancedProjectService.getPriority(project);
              const progress = enhancedProjectService.calculateProgress(project);
              
              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {enhancedProjectService.getStatusIcon(project.status)}
                      </span>
                      <div>
                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${enhancedProjectService.getStatusColor(project.status)}`}>
                            {enhancedProjectService.getStatusLabel(project.status)}
                          </span>
                          <span>📍 {project.location}</span>
                          <span>📅 {enhancedProjectService.formatDate(project.startDate)}</span>
                          {project.budget && (
                            <span>💰 {enhancedProjectService.formatBudget(project.budget)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Priority */}
                    <div className={`text-sm font-medium ${enhancedProjectService.getPriorityColor(priority)}`}>
                      {priority === 'high' && '🔴 Hoch'}
                      {priority === 'medium' && '🟡 Mittel'}
                      {priority === 'low' && '🟢 Niedrig'}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-24">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Fortschritt</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Team Size */}
                    {project._count && (
                      <div className="text-sm text-gray-600 flex items-center">
                        <span className="mr-1">👥</span>
                        <span>{project._count.materials || 0}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}