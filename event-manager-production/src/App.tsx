import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { ServicesManagement } from './components/ServicesManagement';
import { FinancialManagement } from './components/FinancialManagement';
import { OperationsManagement } from './components/OperationsManagement';
import { ProjectManagement } from './components/ProjectManagement';
import { BOMManagement } from './components/BOMManagement';
import { FileManagement } from './components/FileManagement';
import { ErrorBoundary, RouteErrorBoundary } from './components/ErrorBoundary';

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
  }
];

function AppContent() {
  const { user, signOut, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'projects' | 'services' | 'financial' | 'operations' | 'bom' | 'files'>('dashboard');
  const [currentProject] = useState<Project | null>(mockProjects[0]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Event Manager...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderDashboard = () => (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Manager Dashboard</h1>
            <p className="text-gray-600">✅ Vollständiges System mit Backend-Integration</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Eingeloggt als:</p>
            <p className="font-medium text-gray-900">{user.name || user.email}</p>
            <p className="text-sm text-blue-600 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('projects')}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 Projekte</h3>
          <p className="text-2xl font-bold text-green-600">✅ LIVE</p>
          <p className="text-sm text-gray-500 mt-2">Management & Tracking</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('services')}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 Services</h3>
          <p className="text-2xl font-bold text-green-600">✅ LIVE</p>
          <p className="text-sm text-gray-500 mt-2">Timeline & Briefings</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('bom')}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📦 BOM</h3>
          <p className="text-2xl font-bold text-green-600">✅ LIVE</p>
          <p className="text-sm text-gray-500 mt-2">Material-Management</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('financial')}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">💰 Finanzen</h3>
          <p className="text-2xl font-bold text-green-600">✅ LIVE</p>
          <p className="text-sm text-gray-500 mt-2">Budget & Rechnungen</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('operations')}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">⚙️ Operations</h3>
          <p className="text-2xl font-bold text-green-600">✅ LIVE</p>
          <p className="text-sm text-gray-500 mt-2">Live-Management</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('files')}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📁 Dateien</h3>
          <p className="text-2xl font-bold text-green-600">✅ LIVE</p>
          <p className="text-sm text-gray-500 mt-2">Dokument-Verwaltung</p>
        </div>
      </div>

      {currentProject && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Aktuelles Projekt</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium text-gray-900">{currentProject.name}</h3>
              <p className="text-sm text-gray-600">{currentProject.description}</p>
              <p className="text-sm text-gray-500 mt-2">📍 {currentProject.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Timeline</p>
              <p className="font-medium">{currentProject.startDate} - {currentProject.endDate}</p>
              <p className="text-sm text-gray-500">Verantwortlich: {currentProject.responsible}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="font-medium">€{currentProject.budget?.toLocaleString()}</p>
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {currentProject.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'projects':
        return (
          <RouteErrorBoundary>
            <ProjectManagement />
          </RouteErrorBoundary>
        );
      case 'services':
        return (
          <RouteErrorBoundary>
            <ServicesManagement />
          </RouteErrorBoundary>
        );
      case 'financial':
        return (
          <RouteErrorBoundary>
            <FinancialManagement />
          </RouteErrorBoundary>
        );
      case 'operations':
        return (
          <RouteErrorBoundary>
            <OperationsManagement />
          </RouteErrorBoundary>
        );
      case 'bom':
        return (
          <RouteErrorBoundary>
            <BOMManagement />
          </RouteErrorBoundary>
        );
      case 'files':
        return (
          <RouteErrorBoundary>
            <FileManagement />
          </RouteErrorBoundary>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Event Manager</h1>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                PRODUCTION 🚀
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-2">
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📊 Dashboard
                </button>
                <button 
                  onClick={() => setCurrentView('projects')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'projects' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📋 Projekte
                </button>
                <button 
                  onClick={() => setCurrentView('services')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'services' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  👥 Services
                </button>
                <button 
                  onClick={() => setCurrentView('bom')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'bom' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📦 BOM
                </button>
                <button 
                  onClick={() => setCurrentView('financial')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'financial' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  💰 Finanzen
                </button>
                <button 
                  onClick={() => setCurrentView('operations')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'operations' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ⚙️ Operations
                </button>
                <button 
                  onClick={() => setCurrentView('files')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'files' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📁 Dateien
                </button>
              </nav>
              
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={signOut}
                  className="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
