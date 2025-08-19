import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Calendar, MapPin, Phone, Mail } from 'lucide-react';

interface ServiceProvider {
  id: string;
  name: string;
  type: 'catering' | 'logistics' | 'entertainment' | 'technical' | 'security' | 'other';
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  services: string[];
  availability: {
    startDate: string;
    endDate: string;
    workingHours: string;
  };
  pricing: {
    hourlyRate: number;
    dailyRate: number;
    currency: string;
  };
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const ServiceProviderManagement: React.FC = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock-Daten für Entwicklung
  useEffect(() => {
    const mockProviders: ServiceProvider[] = [
      {
        id: '1',
        name: 'Premium Catering Services',
        type: 'catering',
        contact: {
          email: 'info@premiumcatering.com',
          phone: '+49 30 12345678',
          address: 'Berliner Str. 123, 10115 Berlin'
        },
        services: ['Buffet Service', 'Fine Dining', 'Cocktail Service', 'Dietary Restrictions'],
        availability: {
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          workingHours: '08:00 - 22:00'
        },
        pricing: {
          hourlyRate: 45,
          dailyRate: 350,
          currency: 'EUR'
        },
        rating: 4.8,
        status: 'active',
        notes: 'Spezialisiert auf Hochzeiten und Firmenevents',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Event Logistics Pro',
        type: 'logistics',
        contact: {
          email: 'contact@eventlogistics.de',
          phone: '+49 40 87654321',
          address: 'Hamburger Weg 456, 20095 Hamburg'
        },
        services: ['Equipment Transport', 'Setup & Teardown', 'Storage Solutions', 'Emergency Support'],
        availability: {
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          workingHours: '06:00 - 24:00'
        },
        pricing: {
          hourlyRate: 35,
          dailyRate: 280,
          currency: 'EUR'
        },
        rating: 4.6,
        status: 'active',
        notes: '24/7 Notfall-Service verfügbar',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ];
    setProviders(mockProviders);
    setFilteredProviders(mockProviders);
  }, []);

  // Filter und Suche
  useEffect(() => {
    let filtered = providers;

    if (searchTerm) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(provider => provider.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(provider => provider.status === filterStatus);
    }

    setFilteredProviders(filtered);
  }, [providers, searchTerm, filterType, filterStatus]);

  const handleAddProvider = () => {
    setEditingProvider(null);
    setIsModalOpen(true);
  };

  const handleEditProvider = (provider: ServiceProvider) => {
    setEditingProvider(provider);
    setIsModalOpen(true);
  };

  const handleDeleteProvider = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Dienstleister löschen möchten?')) {
      setIsLoading(true);
      try {
        // Hier würde der echte API-Call stehen
        setProviders(prev => prev.filter(p => p.id !== id));
        setFilteredProviders(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error('Fehler beim Löschen:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveProvider = async (providerData: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      if (editingProvider) {
        // Update existing provider
        const updatedProvider: ServiceProvider = {
          ...editingProvider,
          ...providerData,
          updatedAt: new Date().toISOString()
        };
        setProviders(prev => prev.map(p => p.id === editingProvider.id ? updatedProvider : p));
        setFilteredProviders(prev => prev.map(p => p.id === editingProvider.id ? updatedProvider : p));
      } else {
        // Add new provider
        const newProvider: ServiceProvider = {
          ...providerData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProviders(prev => [...prev, newProvider]);
        setFilteredProviders(prev => [...prev, newProvider]);
      }
      setIsModalOpen(false);
      setEditingProvider(null);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      catering: 'Catering',
      logistics: 'Logistik',
      entertainment: 'Unterhaltung',
      technical: 'Technik',
      security: 'Sicherheit',
      other: 'Sonstiges'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dienstleister-Management</h1>
          <p className="text-gray-600 mt-2">Verwalten Sie alle Ihre Event-Dienstleister an einem Ort</p>
        </div>
        <button
          onClick={handleAddProvider}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Neuen Dienstleister hinzufügen
        </button>
      </div>

      {/* Filters und Suche */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Dienstleister suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Alle Typen</option>
            <option value="catering">Catering</option>
            <option value="logistics">Logistik</option>
            <option value="entertainment">Unterhaltung</option>
            <option value="technical">Technik</option>
            <option value="security">Sicherheit</option>
            <option value="other">Sonstiges</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Alle Status</option>
            <option value="active">Aktiv</option>
            <option value="inactive">Inaktiv</option>
            <option value="pending">Ausstehend</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center justify-center">
            {filteredProviders.length} von {providers.length} Dienstleistern
          </div>
        </div>
      </div>

      {/* Dienstleister-Liste */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => (
          <div key={provider.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{provider.name}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                    {provider.status === 'active' ? 'Aktiv' : provider.status === 'inactive' ? 'Inaktiv' : 'Ausstehend'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditProvider(provider)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProvider(provider.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Typ und Bewertung */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {getTypeLabel(provider.type)}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">{provider.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(provider.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kontakt-Informationen */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {provider.contact.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {provider.contact.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {provider.contact.address}
                </div>
              </div>

              {/* Verfügbarkeit */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Verfügbarkeit</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {new Date(provider.availability.startDate).toLocaleDateString('de-DE')} - {new Date(provider.availability.endDate).toLocaleDateString('de-DE')}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Arbeitszeiten: {provider.availability.workingHours}
                </div>
              </div>

              {/* Preise */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Preise</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Stundensatz:</span>
                    <div className="font-medium">{provider.pricing.hourlyRate} {provider.pricing.currency}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tagessatz:</span>
                    <div className="font-medium">{provider.pricing.dailyRate} {provider.pricing.currency}</div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Services</h4>
                <div className="flex flex-wrap gap-2">
                  {provider.services.map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notizen */}
              {provider.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Notizen</h4>
                  <p className="text-sm text-gray-600">{provider.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Dienstleister gefunden</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Versuchen Sie andere Suchkriterien oder Filter.'
              : 'Fügen Sie Ihren ersten Dienstleister hinzu, um zu beginnen.'}
          </p>
          {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
            <button
              onClick={handleAddProvider}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Ersten Dienstleister hinzufügen
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Wird verarbeitet...</p>
          </div>
        </div>
      )}

      {/* Modal für Hinzufügen/Bearbeiten */}
      {isModalOpen && (
        <ServiceProviderModal
          provider={editingProvider}
          onSave={handleSaveProvider}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProvider(null);
          }}
        />
      )}
    </div>
  );
};

// Modal-Komponente für Hinzufügen/Bearbeiten
interface ServiceProviderModalProps {
  provider: ServiceProvider | null;
  onSave: (data: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

const ServiceProviderModal: React.FC<ServiceProviderModalProps> = ({ provider, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: provider?.name || '',
    type: provider?.type || 'catering',
    contact: {
      email: provider?.contact.email || '',
      phone: provider?.contact.phone || '',
      address: provider?.contact.address || ''
    },
    services: provider?.services || [''],
    availability: {
      startDate: provider?.availability.startDate || '',
      endDate: provider?.availability.endDate || '',
      workingHours: provider?.availability.workingHours || ''
    },
    pricing: {
      hourlyRate: provider?.pricing.hourlyRate || 0,
      dailyRate: provider?.pricing.dailyRate || 0,
      currency: provider?.pricing.currency || 'EUR'
    },
    rating: provider?.rating || 0,
    status: provider?.status || 'active',
    notes: provider?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, '']
    }));
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const updateService = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => i === index ? value : service)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {provider ? 'Dienstleister bearbeiten' : 'Neuen Dienstleister hinzufügen'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Grundinformationen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typ *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="catering">Catering</option>
                <option value="logistics">Logistik</option>
                <option value="entertainment">Unterhaltung</option>
                <option value="technical">Technik</option>
                <option value="security">Sicherheit</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>
          </div>

          {/* Kontakt-Informationen */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kontakt-Informationen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-Mail *
                </label>
                <input
                  type="email"
                  required
                  value={formData.contact.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.contact.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, phone: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, address: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Services</h3>
            <div className="space-y-3">
              {formData.services.map((service, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => updateService(index, e.target.value)}
                    placeholder="Service beschreiben..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addService}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Service hinzufügen
              </button>
            </div>
          </div>

          {/* Verfügbarkeit */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Verfügbarkeit</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Startdatum *
                </label>
                <input
                  type="date"
                  required
                  value={formData.availability.startDate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    availability: { ...prev.availability, startDate: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enddatum *
                </label>
                <input
                  type="date"
                  required
                  value={formData.availability.endDate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    availability: { ...prev.availability, endDate: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arbeitszeiten *
                </label>
                <input
                  type="text"
                  required
                  value={formData.availability.workingHours}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    availability: { ...prev.availability, workingHours: e.target.value }
                  }))}
                  placeholder="z.B. 08:00 - 18:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Preise */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preise</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stundensatz (EUR) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.pricing.hourlyRate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, hourlyRate: parseFloat(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagessatz (EUR) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.pricing.dailyRate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, dailyRate: parseFloat(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Währung
                </label>
                <select
                  value={formData.pricing.currency}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, currency: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="CHF">CHF</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bewertung und Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bewertung (0-5)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
                <option value="pending">Ausstehend</option>
              </select>
            </div>
          </div>

          {/* Notizen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notizen
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Zusätzliche Informationen, Anmerkungen oder spezielle Anforderungen..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {provider ? 'Aktualisieren' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceProviderManagement;
