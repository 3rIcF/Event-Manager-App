import React, { useState } from 'react';

interface Service {
  id: string;
  name: string;
  category: 'catering' | 'technical' | 'security' | 'cleaning' | 'logistics';
  provider: string;
  status: 'planned' | 'briefed' | 'confirmed' | 'in-progress' | 'completed';
  timeline: {
    arrival?: string;
    setup?: string;
    operation?: string;
    teardown?: string;
  };
  personnel: number;
  needs: string[];
  briefingGenerated: boolean;
  contactPerson: string;
  contractStatus: 'draft' | 'sent' | 'signed' | 'rejected';
  budget?: number;
}

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Catering für VIP-Bereich',
    category: 'catering',
    provider: 'Gourmet Events GmbH',
    status: 'briefed',
    timeline: {
      arrival: '2025-09-15 08:00',
      setup: '2025-09-15 09:00',
      operation: '2025-09-15 12:00',
      teardown: '2025-09-17 20:00'
    },
    personnel: 8,
    needs: ['Strom 32A', 'Wasseranschluss', 'Kühlmöglichkeiten'],
    briefingGenerated: true,
    contactPerson: 'Maria Schneider',
    contractStatus: 'signed',
    budget: 15000
  },
  {
    id: '2', 
    name: 'Bühnentechnik & Sound',
    category: 'technical',
    provider: 'TechSound Pro',
    status: 'planned',
    timeline: {
      arrival: '2025-09-14 16:00',
      setup: '2025-09-14 18:00',
      operation: '2025-09-15 20:00'
    },
    personnel: 12,
    needs: ['Stromanschluss 63A', 'Backstage-Zugang', 'Kranplatz'],
    briefingGenerated: false,
    contactPerson: 'Thomas Weber',
    contractStatus: 'sent',
    budget: 45000
  },
  {
    id: '3',
    name: 'Sicherheitsdienst',
    category: 'security', 
    provider: 'SecurEvent',
    status: 'confirmed',
    timeline: {
      arrival: '2025-09-15 06:00',
      operation: '2025-09-15 08:00',
      teardown: '2025-09-17 22:00'
    },
    personnel: 25,
    needs: ['Funkgeräte', 'Zugang zu allen Bereichen'],
    briefingGenerated: true,
    contactPerson: 'Klaus Richter',
    contractStatus: 'signed',
    budget: 28000
  }
];

export function ServicesManagement() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'timeline' | 'contracts'>('overview');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'catering': 'bg-orange-100 text-orange-800',
      'technical': 'bg-blue-100 text-blue-800', 
      'security': 'bg-red-100 text-red-800',
      'cleaning': 'bg-green-100 text-green-800',
      'logistics': 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'planned': 'bg-gray-100 text-gray-800',
      'briefed': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-green-100 text-green-800', 
      'completed': 'bg-green-200 text-green-900'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getContractStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'sent': 'bg-yellow-100 text-yellow-800',
      'signed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const generateBriefing = (service: Service) => {
    // Simulation der Briefing-Generierung
    const updatedService = { ...service, briefingGenerated: true };
    setServices(prev => prev.map(s => s.id === service.id ? updatedService : s));
    
    // In einer echten App würde hier ein PDF generiert oder eine Email versendet
    alert(`Briefing für ${service.name} wurde generiert und an ${service.contactPerson} gesendet!`);
  };

  const updateServiceStatus = (serviceId: string, newStatus: Service['status']) => {
    setServices(prev => prev.map(s => 
      s.id === serviceId ? { ...s, status: newStatus } : s
    ));
  };

  const filteredServices = services.filter(service => {
    const categoryMatch = filterCategory === 'all' || service.category === filterCategory;
    const statusMatch = filterStatus === 'all' || service.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex gap-4 items-center">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Kategorie:</label>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">Alle</option>
            <option value="catering">Catering</option>
            <option value="technical">Technik</option>
            <option value="security">Sicherheit</option>
            <option value="cleaning">Reinigung</option>
            <option value="logistics">Logistik</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">Alle</option>
            <option value="planned">Geplant</option>
            <option value="briefed">Gebrieft</option>
            <option value="confirmed">Bestätigt</option>
            <option value="in-progress">In Arbeit</option>
            <option value="completed">Abgeschlossen</option>
          </select>
        </div>

        <div className="ml-auto">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
            + Neuer Service
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredServices.map(service => (
          <div key={service.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.provider}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                {service.category}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Vertrag:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContractStatusColor(service.contractStatus)}`}>
                  {service.contractStatus}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Personal:</span>
                <span className="text-sm font-medium">{service.personnel} Personen</span>
              </div>
              
              {service.budget && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Budget:</span>
                  <span className="text-sm font-medium">€{service.budget.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedService(service)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                Details
              </button>
              
              {!service.briefingGenerated && (
                <button 
                  onClick={() => generateBriefing(service)}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  title="Briefing generieren"
                >
                  📝
                </button>
              )}
              
              {service.briefingGenerated && (
                <button 
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md text-sm"
                  title="Briefing bereits erstellt"
                >
                  ✅
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-6">Service Timeline</h2>
      
      <div className="space-y-6">
        {services.map(service => (
          <div key={service.id} className="border-l-4 border-blue-200 pl-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">{service.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                {service.status}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              {service.timeline.arrival && (
                <p>🚛 Ankunft: {service.timeline.arrival}</p>
              )}
              {service.timeline.setup && (
                <p>🔧 Aufbau: {service.timeline.setup}</p>
              )}
              {service.timeline.operation && (
                <p>▶️ Betrieb: {service.timeline.operation}</p>
              )}
              {service.timeline.teardown && (
                <p>📦 Abbau: {service.timeline.teardown}</p>
              )}
            </div>
            
            <div className="mt-2 text-sm text-gray-500">
              👤 {service.contactPerson} • {service.personnel} Personen
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContracts = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-6">Vertragsmanagement</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium text-gray-900">Service</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Anbieter</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Budget</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-500">{service.contactPerson}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-900">{service.provider}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContractStatusColor(service.contractStatus)}`}>
                    {service.contractStatus}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-900">
                  {service.budget ? `€${service.budget.toLocaleString()}` : '—'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Vertrag
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm">
                      Rechnung
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderServiceDetail = () => {
    if (!selectedService) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedService(null)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Zurück
            </button>
            <h2 className="text-xl font-semibold">{selectedService.name}</h2>
          </div>
          
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedService.category)}`}>
              {selectedService.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedService.status)}`}>
              {selectedService.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Anbieter-Informationen</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Unternehmen:</span> {selectedService.provider}</p>
                <p><span className="font-medium">Kontakt:</span> {selectedService.contactPerson}</p>
                <p><span className="font-medium">Personal:</span> {selectedService.personnel} Personen</p>
                {selectedService.budget && (
                  <p><span className="font-medium">Budget:</span> €{selectedService.budget.toLocaleString()}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Anforderungen</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-1">
                  {selectedService.needs.map((need, index) => (
                    <li key={index} className="text-sm">• {need}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Timeline</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {selectedService.timeline.arrival && (
                  <p><span className="font-medium">Ankunft:</span> {selectedService.timeline.arrival}</p>
                )}
                {selectedService.timeline.setup && (
                  <p><span className="font-medium">Aufbau:</span> {selectedService.timeline.setup}</p>
                )}
                {selectedService.timeline.operation && (
                  <p><span className="font-medium">Betrieb:</span> {selectedService.timeline.operation}</p>
                )}
                {selectedService.timeline.teardown && (
                  <p><span className="font-medium">Abbau:</span> {selectedService.timeline.teardown}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Status-Management</h3>
              <div className="space-y-2">
                <select 
                  value={selectedService.status} 
                  onChange={(e) => updateServiceStatus(selectedService.id, e.target.value as Service['status'])}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="planned">Geplant</option>
                  <option value="briefed">Gebrieft</option>
                  <option value="confirmed">Bestätigt</option>
                  <option value="in-progress">In Arbeit</option>
                  <option value="completed">Abgeschlossen</option>
                </select>
                
                <div className="flex gap-2 pt-2">
                  {!selectedService.briefingGenerated && (
                    <button 
                      onClick={() => generateBriefing(selectedService)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Briefing generieren
                    </button>
                  )}
                  
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Vertrag bearbeiten
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (selectedService) {
    return renderServiceDetail();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dienstleister-Management</h1>
          <p className="text-gray-600">Services, Timeline, Briefings und Vertragsmanagement</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Übersicht
          </button>
          <button 
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Timeline
          </button>
          <button 
            onClick={() => setViewMode('contracts')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'contracts' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Verträge
          </button>
        </div>
      </div>

      {viewMode === 'overview' && renderOverview()}
      {viewMode === 'timeline' && renderTimeline()}
      {viewMode === 'contracts' && renderContracts()}
    </div>
  );
}