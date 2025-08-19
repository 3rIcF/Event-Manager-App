import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Calendar } from './ui/calendar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Truck, 
  MapPin, 
  Package,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Users,
  Forklift
} from 'lucide-react';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  gate: string;
  supplier: string;
  type: 'delivery' | 'pickup' | 'setup' | 'teardown';
  items: string[];
  status: 'confirmed' | 'pending' | 'conflict' | 'delayed';
  resources: {
    forklift: number;
    parking: number;
    personnel: number;
  };
  notes?: string;
}

const mockSlots: TimeSlot[] = [
  {
    id: '1',
    startTime: '2025-09-14T08:00',
    endTime: '2025-09-14T10:00',
    gate: 'Gate A',
    supplier: 'Bühnentechnik Bayern',
    type: 'delivery',
    items: ['Hauptbühne 12x8m', 'Traversensystem'],
    status: 'confirmed',
    resources: { forklift: 2, parking: 3, personnel: 4 },
    notes: 'Schwertransport - extra Stellfläche benötigt'
  },
  {
    id: '2',
    startTime: '2025-09-14T09:30',
    endTime: '2025-09-14T11:00',
    gate: 'Gate A',
    supplier: 'Zeltverleih München',
    type: 'delivery',
    items: ['Pagodenzelt 3x3m (20x)'],
    status: 'conflict',
    resources: { forklift: 1, parking: 2, personnel: 2 }
  },
  {
    id: '3',
    startTime: '2025-09-14T10:00',
    endTime: '2025-09-14T12:00',
    gate: 'Gate B',
    supplier: 'Absperr-Service GmbH',
    type: 'delivery',
    items: ['Bauzaun Elemente (150x)'],
    status: 'confirmed',
    resources: { forklift: 1, parking: 1, personnel: 3 }
  },
  {
    id: '4',
    startTime: '2025-09-17T14:00',
    endTime: '2025-09-17T16:00',
    gate: 'Gate A',
    supplier: 'Bühnentechnik Bayern',
    type: 'pickup',
    items: ['Hauptbühne 12x8m', 'Traversensystem'],
    status: 'pending',
    resources: { forklift: 2, parking: 3, personnel: 4 }
  }
];

const gates = ['Gate A', 'Gate B', 'Gate C'];
const slotTypes = [
  { value: 'delivery', label: 'Anlieferung', icon: Truck },
  { value: 'pickup', label: 'Abholung', icon: Package },
  { value: 'setup', label: 'Aufbau', icon: Users },
  { value: 'teardown', label: 'Abbau', icon: Users }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'conflict': return 'bg-red-100 text-red-800';
    case 'delayed': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'conflict': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'delayed': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    default: return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

const getTypeIcon = (type: string) => {
  const typeConfig = slotTypes.find(t => t.value === type);
  const Icon = typeConfig?.icon || Truck;
  return <Icon className="w-4 h-4" />;
};

export function LogisticsSlots() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2025-09-14'));
  const [selectedGate, setSelectedGate] = useState<string>('all');
  const [showNewSlotDialog, setShowNewSlotDialog] = useState(false);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const filteredSlots = mockSlots.filter(slot => {
    const slotDate = new Date(slot.startTime).toDateString();
    const filterDate = selectedDate.toDateString();
    const matchesDate = slotDate === filterDate;
    const matchesGate = selectedGate === 'all' || slot.gate === selectedGate;
    return matchesDate && matchesGate;
  });

  const conflictSlots = filteredSlots.filter(slot => slot.status === 'conflict');
  const confirmedSlots = filteredSlots.filter(slot => slot.status === 'confirmed');

  // Group slots by hour for timeline view
  const groupSlotsByHour = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const slotsByHour: { [key: number]: TimeSlot[] } = {};
    
    hours.forEach(hour => {
      slotsByHour[hour] = filteredSlots.filter(slot => {
        const slotHour = new Date(slot.startTime).getHours();
        const slotEndHour = new Date(slot.endTime).getHours();
        return hour >= slotHour && hour < slotEndHour;
      });
    });
    
    return slotsByHour;
  };

  const slotsByHour = groupSlotsByHour();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Logistik & Slots</h2>
          <p className="text-muted-foreground">
            Warenein- und ausgang Terminplanung
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Kalender
          </Button>
          <Dialog open={showNewSlotDialog} onOpenChange={setShowNewSlotDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Neuer Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Neuen Zeitslot erstellen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Startzeit:</label>
                    <Input type="datetime-local" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endzeit:</label>
                    <Input type="datetime-local" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gate:</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Gate auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {gates.map(gate => (
                          <SelectItem key={gate} value={gate}>{gate}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Typ:</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Typ auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {slotTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Anbieter:</label>
                  <Input placeholder="Anbietername" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ressourcen:</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Stapler:</label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Parkplätze:</label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Personal:</label>
                      <Input type="number" placeholder="0" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowNewSlotDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={() => setShowNewSlotDialog(false)}>
                    Slot erstellen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{filteredSlots.length}</div>
                <div className="text-sm text-muted-foreground">Slots heute</div>
              </div>
              <CalendarIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{confirmedSlots.length}</div>
                <div className="text-sm text-muted-foreground">Bestätigt</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{conflictSlots.length}</div>
                <div className="text-sm text-muted-foreground">Konflikte</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">85%</div>
                <div className="text-sm text-muted-foreground">Auslastung</div>
              </div>
              <Truck className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date and Gate Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span className="font-medium">Datum:</span>
              <Input
                type="date"
                value={formatDate(selectedDate)}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">Gate:</span>
              <Select value={selectedGate} onValueChange={setSelectedGate}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Gates</SelectItem>
                  {gates.map(gate => (
                    <SelectItem key={gate} value={gate}>{gate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts Alert */}
      {conflictSlots.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              {conflictSlots.length} Slot-Konflikt{conflictSlots.length > 1 ? 'e' : ''} erkannt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conflictSlots.map(slot => (
                <div key={slot.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <div>
                      <div className="font-medium">{slot.supplier}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(slot.startTime).toLocaleTimeString()} - {new Date(slot.endTime).toLocaleTimeString()} • {slot.gate}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Konflikt lösen
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Zeitplan für {selectedDate.toLocaleDateString('de-DE')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(slotsByHour)
              .filter(([hour, slots]) => slots.length > 0)
              .map(([hour, slots]) => (
                <div key={hour} className="flex items-start gap-4">
                  <div className="w-16 text-sm font-medium text-muted-foreground">
                    {hour.padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 space-y-2">
                    {slots.map(slot => (
                      <div key={slot.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(slot.status)}
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {getTypeIcon(slot.type)}
                                {slot.supplier}
                                <Badge variant="outline">{slot.gate}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(slot.startTime).toLocaleTimeString()} - {new Date(slot.endTime).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(slot.status)}>
                              {slot.status}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {slot.items.join(', ')}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Forklift className="w-3 h-3" />
                              {slot.resources.forklift}
                            </span>
                            <span className="flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              {slot.resources.parking}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {slot.resources.personnel}
                            </span>
                          </div>
                        </div>
                        
                        {slot.notes && (
                          <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                            {slot.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}