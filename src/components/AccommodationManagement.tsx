import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Hotel,
  Plus,
  Search,
  Star,
  MapPin,
  Users,
  Utensils,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Bed,
  Car,
  Wifi,
  Coffee,
  UtensilsCrossed
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useApp } from './AppContext';

interface Hotel {
  id: string;
  name: string;
  category: string; // 'luxury', 'business', 'budget'
  location: string;
  distance_from_venue: number; // km
  room_types: RoomType[];
  amenities: string[];
  contact_info: {
    email?: string;
    phone?: string;
    website?: string;
  };
  rating: number;
  price_range: {
    min: number;
    max: number;
  };
  availability_status: 'available' | 'limited' | 'full';
  created_at: string;
}

interface RoomType {
  id: string;
  name: string;
  capacity: number;
  price_per_night: number;
  amenities: string[];
  available_rooms: number;
  description?: string;
}

interface AccommodationBooking {
  id: string;
  hotel: Hotel;
  room_type: RoomType;
  guest_name: string;
  guest_role: string; // 'vip', 'speaker', 'staff', 'crew'
  check_in: string;
  check_out: string;
  nights: number;
  rooms_count: number;
  special_requests?: string;
  status: 'requested' | 'confirmed' | 'checked_in' | 'checked_out';
  total_cost: number;
  booking_reference?: string;
  created_at: string;
}

interface CateringOption {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'beverage';
  cuisine: string;
  dietary_options: string[]; // 'vegetarian', 'vegan', 'gluten-free', etc.
  capacity: number;
  price_per_person: number;
  duration: number; // minutes
  setup_time: number; // minutes
  description: string;
  provider: {
    name: string;
    contact: string;
    rating: number;
  };
  availability: string[];
}

interface CateringBooking {
  id: string;
  catering_option: CateringOption;
  event_name: string;
  date: string;
  start_time: string;
  end_time: string;
  expected_guests: number;
  actual_guests?: number;
  dietary_requirements: Record<string, number>; // dietary_option -> count
  special_instructions?: string;
  status: 'planned' | 'confirmed' | 'prepared' | 'served' | 'completed';
  total_cost: number;
  created_at: string;
}

// Mock Data
const mockHotels: Hotel[] = [
  {
    id: '1',
    name: 'Hotel Bayerischer Hof',
    category: 'luxury',
    location: 'München Zentrum',
    distance_from_venue: 0.8,
    room_types: [
      {
        id: '1-1',
        name: 'Deluxe Einzelzimmer',
        capacity: 1,
        price_per_night: 280,
        amenities: ['Wifi', 'Minibar', 'Safe', 'Klimaanlage'],
        available_rooms: 12,
        description: 'Elegantes Einzelzimmer mit Stadtblick'
      },
      {
        id: '1-2',
        name: 'Suite',
        capacity: 2,
        price_per_night: 450,
        amenities: ['Wifi', 'Minibar', 'Safe', 'Klimaanlage', 'Balkon', 'Wohnbereich'],
        available_rooms: 5,
        description: 'Luxuriöse Suite mit separatem Wohnbereich'
      }
    ],
    amenities: ['Restaurant', 'Bar', 'Spa', 'Fitness', 'Concierge', 'Valet Parking'],
    contact_info: {
      email: 'reservierung@bayerischerhof.de',
      phone: '+49 89 21200',
      website: 'www.bayerischerhof.de'
    },
    rating: 4.8,
    price_range: { min: 280, max: 650 },
    availability_status: 'available',
    created_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'Hilton Munich City',
    category: 'business',
    location: 'München Zentrum',
    distance_from_venue: 1.2,
    room_types: [
      {
        id: '2-1',
        name: 'Standard Zimmer',
        capacity: 2,
        price_per_night: 160,
        amenities: ['Wifi', 'Safe', 'Arbeitsplatz'],
        available_rooms: 25,
        description: 'Komfortables Business-Zimmer'
      },
      {
        id: '2-2',
        name: 'Executive Zimmer',
        capacity: 2,
        price_per_night: 220,
        amenities: ['Wifi', 'Safe', 'Arbeitsplatz', 'Executive Lounge Zugang'],
        available_rooms: 15,
        description: 'Premium Business-Zimmer mit Lounge-Zugang'
      }
    ],
    amenities: ['Restaurant', 'Bar', 'Fitness', 'Business Center', 'Parkplatz'],
    contact_info: {
      email: 'reservations.munich@hilton.com',
      phone: '+49 89 4804040'
    },
    rating: 4.4,
    price_range: { min: 160, max: 280 },
    availability_status: 'limited',
    created_at: '2024-01-01'
  }
];

const mockCateringOptions: CateringOption[] = [
  {
    id: '1',
    name: 'Bayrisches Buffet',
    type: 'lunch',
    cuisine: 'Bayrisch',
    dietary_options: ['vegetarian', 'gluten-free'],
    capacity: 200,
    price_per_person: 35,
    duration: 90,
    setup_time: 45,
    description: 'Traditionelles bayrisches Buffet mit regionalen Spezialitäten',
    provider: {
      name: 'Käfer Catering',
      contact: 'events@kaefer.de',
      rating: 4.7
    },
    availability: ['2025-09-15', '2025-09-16', '2025-09-17']
  },
  {
    id: '2',
    name: 'Business Lunch',
    type: 'lunch',
    cuisine: 'International',
    dietary_options: ['vegetarian', 'vegan', 'gluten-free', 'lactose-free'],
    capacity: 150,
    price_per_person: 28,
    duration: 60,
    setup_time: 30,
    description: 'Modernes Business-Lunch mit internationalen Gerichten',
    provider: {
      name: 'Dallmayr Catering',
      contact: 'catering@dallmayr.de',
      rating: 4.5
    },
    availability: ['2025-09-15', '2025-09-16', '2025-09-17']
  },
  {
    id: '3',
    name: 'Gala Dinner',
    type: 'dinner',
    cuisine: 'Gehobene Küche',
    dietary_options: ['vegetarian', 'vegan', 'gluten-free'],
    capacity: 300,
    price_per_person: 85,
    duration: 180,
    setup_time: 120,
    description: '3-Gang Gala-Dinner mit gehobener Küche',
    provider: {
      name: 'Königshof Catering',
      contact: 'events@koenigshof-muenchen.de',
      rating: 4.9
    },
    availability: ['2025-09-16']
  }
];

const mockAccommodationBookings: AccommodationBooking[] = [
  {
    id: '1',
    hotel: mockHotels[0],
    room_type: mockHotels[0].room_types[1],
    guest_name: 'Dr. Maria Schneider',
    guest_role: 'vip',
    check_in: '2025-09-14',
    check_out: '2025-09-18',
    nights: 4,
    rooms_count: 1,
    special_requests: 'Ruhiges Zimmer, späte Anreise',
    status: 'confirmed',
    total_cost: 1800,
    booking_reference: 'BHM-2025-001',
    created_at: '2025-02-15'
  },
  {
    id: '2',
    hotel: mockHotels[1],
    room_type: mockHotels[1].room_types[0],
    guest_name: 'Produktions-Team',
    guest_role: 'crew',
    check_in: '2025-09-13',
    check_out: '2025-09-18',
    nights: 5,
    rooms_count: 8,
    status: 'confirmed',
    total_cost: 6400,
    booking_reference: 'HMC-2025-045',
    created_at: '2025-02-10'
  }
];

const mockCateringBookings: CateringBooking[] = [
  {
    id: '1',
    catering_option: mockCateringOptions[0],
    event_name: 'VIP Lunch',
    date: '2025-09-16',
    start_time: '12:00',
    end_time: '13:30',
    expected_guests: 150,
    dietary_requirements: {
      'vegetarian': 25,
      'gluten-free': 8,
      'vegan': 5
    },
    special_instructions: 'Separate VIP-Bereich, erweiterte Weinauswahl',
    status: 'confirmed',
    total_cost: 5250,
    created_at: '2025-02-12'
  },
  {
    id: '2',
    catering_option: mockCateringOptions[2],
    event_name: 'Gala Abend',
    date: '2025-09-16',
    start_time: '19:00',
    end_time: '22:00',
    expected_guests: 200,
    dietary_requirements: {
      'vegetarian': 40,
      'vegan': 15,
      'gluten-free': 12
    },
    status: 'confirmed',
    total_cost: 17000,
    created_at: '2025-02-08'
  }
];

export function AccommodationManagement() {
  const { currentProject } = useApp();
  const [activeTab, setActiveTab] = useState<'hotels' | 'bookings' | 'catering' | 'catering-bookings'>('hotels');
  const [searchTerm, setSearchTerm] = useState('');
  const [hotels] = useState<Hotel[]>(mockHotels);
  const [accommodationBookings] = useState<AccommodationBooking[]>(mockAccommodationBookings);
  const [cateringOptions] = useState<CateringOption[]>(mockCateringOptions);
  const [cateringBookings] = useState<CateringBooking[]>(mockCateringBookings);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'requested': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'checked_in': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'checked_out': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCateringStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'planned': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'prepared': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'served': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderHotels = () => {
    const filteredHotels = hotels.filter(hotel => {
      const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || hotel.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Hotels suchen..."
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
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Hotel hinzufügen
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredHotels.map(hotel => (
            <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{hotel.name}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <Badge variant="secondary" className="capitalize">
                        {hotel.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{hotel.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{hotel.distance_from_venue} km</span>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge 
                    className={
                      hotel.availability_status === 'available' ? 'bg-green-100 text-green-700' :
                      hotel.availability_status === 'limited' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }
                    variant="outline"
                  >
                    {hotel.availability_status === 'available' && 'Verfügbar'}
                    {hotel.availability_status === 'limited' && 'Begrenzt'}
                    {hotel.availability_status === 'full' && 'Ausgebucht'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{hotel.location}</span>
                  <span className="text-sm text-gray-600">
                    €{hotel.price_range.min} - €{hotel.price_range.max} / Nacht
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Zimmertypen:</h4>
                  {hotel.room_types.map(room => (
                    <div key={room.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-gray-400" />
                        <span>{room.name} ({room.capacity}P)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">€{room.price_per_night}</span>
                        <Badge variant="outline" className="text-xs">
                          {room.available_rooms} frei
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Ausstattung:</h4>
                  <div className="flex flex-wrap gap-1">
                    {hotel.amenities.slice(0, 4).map(amenity => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {hotel.amenities.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{hotel.amenities.length - 4} weitere
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Buchen
                  </Button>
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Kontakt
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderAccommodationBookings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Unterkunft-Buchungen</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Buchung hinzufügen
        </Button>
      </div>

      <div className="space-y-4">
        {accommodationBookings.map(booking => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{booking.guest_name}</CardTitle>
                  <CardDescription>
                    {booking.hotel.name} • {booking.room_type.name}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {booking.guest_role}
                  </Badge>
                  <Badge className={getStatusColor(booking.status)} variant="outline">
                    {booking.status === 'confirmed' && 'Bestätigt'}
                    {booking.status === 'requested' && 'Angefragt'}
                    {booking.status === 'checked_in' && 'Eingecheckt'}
                    {booking.status === 'checked_out' && 'Ausgecheckt'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Zeitraum
                  </h4>
                  <div className="text-sm text-gray-600">
                    <div>Check-in: {new Date(booking.check_in).toLocaleDateString('de-DE')}</div>
                    <div>Check-out: {new Date(booking.check_out).toLocaleDateString('de-DE')}</div>
                    <div className="font-medium">{booking.nights} Nächte</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    Zimmerdaten
                  </h4>
                  <div className="text-sm text-gray-600">
                    <div>Zimmer: {booking.rooms_count}x {booking.room_type.name}</div>
                    <div>Kapazität: {booking.room_type.capacity} Person(en)</div>
                    <div>€{booking.room_type.price_per_night}/Nacht</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Hotel Details
                  </h4>
                  <div className="text-sm text-gray-600">
                    <div>{booking.hotel.location}</div>
                    <div>{booking.hotel.distance_from_venue} km zur Location</div>
                    {booking.booking_reference && (
                      <div className="font-medium">#{booking.booking_reference}</div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Kosten</h4>
                  <div className="text-lg font-semibold text-green-600">
                    €{booking.total_cost.toLocaleString('de-DE')}
                  </div>
                  <div className="text-xs text-gray-500">
                    Gesamt für {booking.nights} Nächte
                  </div>
                </div>
              </div>
              
              {booking.special_requests && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Besondere Wünsche:</h4>
                  <p className="text-sm text-gray-700">{booking.special_requests}</p>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Bestätigung senden
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Hotel kontaktieren
                </Button>
                {booking.status === 'confirmed' && (
                  <Button size="sm">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Check-in
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCatering = () => {
    const filteredCatering = cateringOptions.filter(option => {
      const matchesSearch = option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           option.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || option.type === selectedType;
      return matchesSearch && matchesType;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Catering suchen..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle</SelectItem>
                <SelectItem value="breakfast">Frühstück</SelectItem>
                <SelectItem value="lunch">Mittagessen</SelectItem>
                <SelectItem value="dinner">Abendessen</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
                <SelectItem value="beverage">Getränke</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Catering hinzufügen
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCatering.map(option => (
            <Card key={option.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{option.name}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <Badge variant="secondary" className="capitalize">
                        {option.type === 'breakfast' && 'Frühstück'}
                        {option.type === 'lunch' && 'Mittagessen'}
                        {option.type === 'dinner' && 'Abendessen'}
                        {option.type === 'snack' && 'Snack'}
                        {option.type === 'beverage' && 'Getränke'}
                      </Badge>
                      <span className="text-sm">{option.cuisine}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{option.provider.rating}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      €{option.price_per_person}
                    </div>
                    <div className="text-xs text-gray-500">pro Person</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">{option.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Bis {option.capacity} Gäste</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{option.duration} Min. Service</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="h-4 w-4 text-gray-400" />
                      <span>{option.setup_time} Min. Aufbau</span>
                    </div>
                    <div className="text-gray-600">
                      {option.provider.name}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Diät-Optionen:</h4>
                  <div className="flex flex-wrap gap-1">
                    {option.dietary_options.map(diet => (
                      <Badge key={diet} variant="outline" className="text-xs">
                        {diet === 'vegetarian' && 'Vegetarisch'}
                        {diet === 'vegan' && 'Vegan'}
                        {diet === 'gluten-free' && 'Glutenfrei'}
                        {diet === 'lactose-free' && 'Laktosefrei'}
                        {!['vegetarian', 'vegan', 'gluten-free', 'lactose-free'].includes(diet) && diet}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Verfügbare Termine:</h4>
                  <div className="flex flex-wrap gap-1">
                    {option.availability.map(date => (
                      <Badge key={date} variant="outline" className="text-xs">
                        {new Date(date).toLocaleDateString('de-DE')}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm">
                    <Utensils className="h-4 w-4 mr-2" />
                    Buchen
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Anfrage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderCateringBookings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Catering-Buchungen</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Catering buchen
        </Button>
      </div>

      <div className="space-y-4">
        {cateringBookings.map(booking => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{booking.event_name}</CardTitle>
                  <CardDescription>
                    {booking.catering_option.name} • {booking.catering_option.provider.name}
                  </CardDescription>
                </div>
                <Badge className={getCateringStatusColor(booking.status)} variant="outline">
                  {booking.status === 'planned' && 'Geplant'}
                  {booking.status === 'confirmed' && 'Bestätigt'}
                  {booking.status === 'prepared' && 'Vorbereitet'}
                  {booking.status === 'served' && 'Serviert'}
                  {booking.status === 'completed' && 'Abgeschlossen'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Termin
                  </h4>
                  <div className="text-sm text-gray-600">
                    <div>{new Date(booking.date).toLocaleDateString('de-DE')}</div>
                    <div>{booking.start_time} - {booking.end_time}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Gäste
                  </h4>
                  <div className="text-sm text-gray-600">
                    <div>Erwartet: {booking.expected_guests}</div>
                    {booking.actual_guests && (
                      <div>Tatsächlich: {booking.actual_guests}</div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    Diät-Anforderungen
                  </h4>
                  <div className="text-sm text-gray-600">
                    {Object.entries(booking.dietary_requirements).map(([diet, count]) => (
                      <div key={diet}>
                        {diet === 'vegetarian' && 'Vegetarisch'}: {count}
                        {diet === 'vegan' && 'Vegan'}: {count}
                        {diet === 'gluten-free' && 'Glutenfrei'}: {count}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Kosten</h4>
                  <div className="text-lg font-semibold text-green-600">
                    €{booking.total_cost.toLocaleString('de-DE')}
                  </div>
                  <div className="text-xs text-gray-500">
                    €{booking.catering_option.price_per_person} x {booking.expected_guests} Gäste
                  </div>
                </div>
              </div>
              
              {booking.special_instructions && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Besondere Anweisungen:</h4>
                  <p className="text-sm text-gray-700">{booking.special_instructions}</p>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Caterer kontaktieren
                </Button>
                {booking.status === 'confirmed' && (
                  <Button size="sm">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Vorbereitung starten
                  </Button>
                )}
                {booking.status === 'prepared' && (
                  <Button size="sm">
                    <Utensils className="h-4 w-4 mr-2" />
                    Service starten
                  </Button>
                )}
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
        <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Kein Projekt ausgewählt</h2>
        <p className="text-gray-600">Wählen Sie ein Projekt aus, um Unterkunft & Catering zu verwalten.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Unterkunft & Catering</h1>
          <p className="text-gray-600">Hotel-Matrix und Catering-Planung</p>
        </div>
      </div>

      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'hotels', label: 'Hotels', icon: Hotel },
            { id: 'bookings', label: 'Unterkunft-Buchungen', icon: Bed },
            { id: 'catering', label: 'Catering-Optionen', icon: Utensils },
            { id: 'catering-bookings', label: 'Catering-Buchungen', icon: UtensilsCrossed }
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
        {activeTab === 'hotels' && renderHotels()}
        {activeTab === 'bookings' && renderAccommodationBookings()}
        {activeTab === 'catering' && renderCatering()}
        {activeTab === 'catering-bookings' && renderCateringBookings()}
      </div>
    </div>
  );
}