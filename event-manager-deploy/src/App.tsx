import React, { useState } from 'react';
import { ServicesManagement } from './components/ServicesManagement';

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

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'projects' | 'services' | 'financial' | 'operations'>('dashboard');
  const [currentProject] = useState<Project | null>(mockProjects[0]);

  const renderDashboard = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Event Manager Dashboard</h1>
        <p className="text-gray-600">✅ Deployment erfolgreich - System läuft produktiv!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Services Module</h3>
          <p className="text-3xl font-bold text-green-600">✅ LIVE</p>
          <p className="text-sm text-gray-500 mt-2">Timeline, Briefings, Verträge</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Module</h3>
          <p className="text-3xl font-bold text-orange-600">🔧 IN ARBEIT</p>
          <p className="text-sm text-gray-500 mt-2">Budget-Tracking kommend</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Operations</h3>
          <p className="text-3xl font-bold text-gray-400">⏳ GEPLANT</p>
          <p className="text-sm text-gray-500 mt-2">Checklisten & Incidents</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Backend API</h3>
          <p className="text-3xl font-bold text-gray-400">⏳ GEPLANT</p>
          <p className="text-sm text-gray-500 mt-2">Data-Persistierung</p>
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
      case 'services':
        return <ServicesManagement />;
      case 'financial':
        return (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Finanzen Module</h2>
            <p className="text-gray-600 mb-4">🔧 In Entwicklung - Budget-Tracking & Controlling</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Nächste Implementierung:</strong> Budget-Dashboard, Cost-Control, Export-Funktionen
              </p>
            </div>
          </div>
        );
      case 'operations':
        return (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Operations Module</h2>
            <p className="text-gray-600 mb-4">⏳ Geplant - Live-Management & Checklisten</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Features:</strong> Incident-Management, Checklisten-System, Live-Dashboard
              </p>
            </div>
          </div>
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
                LIVE 🚀
              </span>
            </div>
            
            <nav className="flex space-x-4">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentView('services')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'services' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Services ✅
              </button>
              <button 
                onClick={() => setCurrentView('financial')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'financial' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Finanzen 🔧
              </button>
              <button 
                onClick={() => setCurrentView('operations')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'operations' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Operations ⏳
              </button>
            </nav>
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

export default App;