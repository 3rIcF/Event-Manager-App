import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Users, 
  Plus, 
  Search, 
  Star, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useApp } from './AppContext';

interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  contact_info: {
    email?: string;
    phone?: string;
    address?: string;
  };
  capabilities: string[];
  regions: string[];
  rating: number;
  hourly_rate?: number;
  day_rate?: number;
  created_at: string;
}

interface ServiceBooking {
  id: string;
  service_provider: ServiceProvider;
  service_type: string;
  start_time: string;
  end_time: string;
  crew_size: number;
  equipment_needed: string[];
  briefing_notes: string;
  contract_status: 'draft' | 'sent' | 'signed' | 'completed';
  total_cost: number;
}

const mockServiceProviders: ServiceProvider[] = [
  {
    id: '1',
    name: 'ProAudio München',
    category: 'audio',
    contact_info: {
      email: 'info@proaudio-munich.de',
      phone: '+49 89 123456',
      address: 'Maximilianstraße 1, 80539 München'
    },
    capabilities: ['PA-Systeme', 'Mikrofonie', 'Monitoring', 'Live-Mixing'],
    regions: ['München', 'Bayern', 'DACH'],
    rating: 4.8,
    hourly_rate: 85,
    day_rate: 650,
    created_at: '2024-01-15'
  },
  {
    id: '2', 
    name: 'LightTech Solutions',
    category: 'lighting',
    contact_info: {
      email: 'booking@lighttech.de',
      phone: '+49 89 987654',
      address: 'Leopoldstraße 45, 80802 München'
    },
    capabilities: ['LED-Systeme', 'Moving Lights', 'Bühnenlicht', 'Architekturlicht'],
    regions: ['München', 'Stuttgart', 'Frankfurt'],
    rating: 4.6,
    hourly_rate: 95,
    day_rate: 750,
    created_at: '2024-02-20'
  },
  {
    id: '3',
    name: 'SecureEvents GmbH', 
    category: 'security',
    contact_info: {
      email: 'ops@secure-events.de',
      phone: '+49 89 555777',
      address: 'Sendlinger Straße 12, 80331 München'
    },
    capabilities: ['Personenschutz', 'Einlasskontrollen', 'Crowd Management', 'VIP-Service'],
    regions: ['München', 'Bayern', 'Deutschland'],
    rating: 4.9,
    hourly_rate: 45,
    day_rate: 350,
    created_at: '2024-03-10'
  }
];

const mockBookings: ServiceBooking[] = [
  {
    id: '1',
    service_provider: mockServiceProviders[0],
    service_type: 'Live-Sound',
    start_time: '2025-09-15T08:00:00',
    end_time: '2025-09-17T22:00:00',
    crew_size: 3,
    equipment_needed: ['PA-System 10kW', 'Mischpult 32-Kanal', 'Mikrofone 10x'],
    briefing_notes: 'Hauptbühne mit Live-Bands, 3 Tage Setup erforderlich',
    contract_status: 'signed',
    total_cost: 4500
  },
  {
    id: '2',
    service_provider: mockServiceProviders[1],
    service_type: 'Bühnenlicht',
    start_time: '2025-09-15T10:00:00', 
    end_time: '2025-09-17T24:00:00',
    crew_size: 4,
    equipment_needed: ['Moving Lights 20x', 'LED-Strips', 'Truss-System'],
    briefing_notes: 'Komplette Lichtshow für alle 3 Bühnen',
    contract_status: 'sent',
    total_cost: 6200
  }
];

export function ServiceManagement() {
  const { currentProject } = useApp();
  const [activeTab, setActiveTab] = useState<'providers' | 'bookings' | 'timeline'>('providers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [providers, setProviders] = useState<ServiceProvider[]>(mockServiceProviders);
  const [bookings, setBookings] = useState<ServiceBooking[]>(mockBookings);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const categories = ['audio', 'lighting', 'video', 'security', 'catering', 'logistics', 'decoration'];
  
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || provider.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'sent': return 'bg-yellow-100 text-yellow-700'; 
      case 'signed': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderProviders = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Dienstleister suchen..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowAddProvider(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Dienstleister hinzufügen
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProviders.map(provider => (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{provider.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="capitalize">
                      {provider.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{provider.rating}</span>
                    </div>
                  </CardDescription>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setShowBookingForm(true)}
                  className="shrink-0"
                >
                  Buchen
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{provider.contact_info.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{provider.contact_info.phone}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs">{provider.regions.join(', ')}</span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">€{provider.day_rate}/Tag</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Leistungen:</h4>
                <div className="flex flex-wrap gap-1">
                  {provider.capabilities.slice(0, 3).map(capability => (
                    <Badge key={capability} variant="outline" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                  {provider.capabilities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{provider.capabilities.length - 3} weitere
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Service Buchungen</h3>
        <Button onClick={() => setShowBookingForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Buchung
        </Button>
      </div>

      <div className="space-y-4">
        {bookings.map(booking => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{booking.service_provider.name}</CardTitle>
                  <CardDescription>{booking.service_type}</CardDescription>
                </div>
                <Badge className={getStatusColor(booking.contract_status)}>
                  {booking.contract_status === 'draft' && 'Entwurf'}
                  {booking.contract_status === 'sent' && 'Gesendet'}
                  {booking.contract_status === 'signed' && 'Unterschrieben'}
                  {booking.contract_status === 'completed' && 'Abgeschlossen'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Zeitraum
                  </h4>
                  <div className="text-sm text-gray-600">
                    <div>Von: {new Date(booking.start_time).toLocaleString('de-DE')}</div>
                    <div>Bis: {new Date(booking.end_time).toLocaleString('de-DE')}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team & Equipment
                  </h4>
                  <div className="text-sm text-gray-600">
                    <div>Crew: {booking.crew_size} Personen</div>
                    <div>Equipment: {booking.equipment_needed.length} Positionen</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Kosten</h4>
                  <div className="text-lg font-semibold text-green-600">
                    €{booking.total_cost.toLocaleString('de-DE')}
                  </div>
                </div>
              </div>
              
              {booking.briefing_notes && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    Briefing
                  </h4>
                  <p className="text-sm text-gray-700">{booking.briefing_notes}</p>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Vertrag
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />  
                  Kontakt
                </Button>
                {booking.contract_status === 'signed' && (
                  <Button size="sm">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Abschließen
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Service Timeline</h3>
      
      <div className="space-y-4">
        {bookings.map(booking => (
          <div key={booking.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="w-2 h-16 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{booking.service_provider.name}</h4>
                <span className="text-sm text-gray-500">
                  {new Date(booking.start_time).toLocaleDateString('de-DE')}
                </span>
              </div>
              <p className="text-sm text-gray-600">{booking.service_type}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(booking.start_time).toLocaleTimeString('de-DE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {booking.crew_size} Personen
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Kein Projekt ausgewählt</h2>
        <p className="text-gray-600">Wählen Sie ein Projekt aus, um Dienstleister zu verwalten.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dienstleister-Management</h1>
          <p className="text-gray-600">Timeline, Needs, Briefings und Vertragsmanagement</p>
        </div>
      </div>

      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'providers', label: 'Dienstleister', icon: Users },
            { id: 'bookings', label: 'Buchungen', icon: FileText },
            { id: 'timeline', label: 'Timeline', icon: Calendar }
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
        {activeTab === 'providers' && renderProviders()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'timeline' && renderTimeline()}
      </div>
    </div>
  );
}