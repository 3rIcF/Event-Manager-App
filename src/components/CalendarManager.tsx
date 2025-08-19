import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Truck, 
  Users, 
  Package,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Download,
  Forklift
} from 'lucide-react';

interface CalendarSlot {
  id: string;
  title: string;
  type: 'delivery' | 'pickup' | 'service' | 'permit' | 'catering';
  projectId?: string;
  projectName?: string;
  startTime: string;
  endTime: string;
  gate?: string;
  supplier?: string;
  contact?: string;
  resources: string[];
  status: 'planned' | 'confirmed' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
  notes?: string;
  conflictsWith?: string[];
}

const mockSlots: CalendarSlot[] = [
  {
    id: 'slot_001',
    title: 'Bühnenaufbau Anlieferung',
    type: 'delivery',
    projectId: '1',
    projectName: 'Stadtfest München',
    startTime: '2025-01-20T08:00:00',
    endTime: '2025-01-20T12:00:00',
    gate: 'Gate A',
    supplier: 'Bühnentechnik Bayern',
    contact: 'Thomas Weber',
    resources: ['stapler', 'crew_4'],
    status: 'confirmed'
  },
  {
    id: 'slot_002',
    title: 'Zelt-Aufbau',
    type: 'delivery',
    projectId: '1',
    projectName: 'Stadtfest München',
    startTime: '2025-01-20T10:00:00',
    endTime: '2025-01-20T14:00:00',
    gate: 'Gate B',
    supplier: 'Zeltverleih München',
    contact: 'Maria Schneider',
    resources: ['stapler', 'crew_6'],
    status: 'planned',
    conflictsWith: ['slot_001']
  },
  {
    id: 'slot_003',
    title: 'Catering Setup',
    type: 'service',
    projectId: '1',
    projectName: 'Stadtfest München',
    startTime: '2025-01-20T14:00:00',
    endTime: '2025-01-20T18:00:00',
    gate: 'Gate C',
    supplier: 'Event Catering Plus',
    contact: 'Andreas König',
    resources: ['crew_2'],
    status: 'confirmed'
  },
  {
    id: 'slot_004',
    title: 'Security Briefing',
    type: 'service',
    projectId: '2',
    projectName: 'BMW Pressekonferenz',
    startTime: '2025-01-20T09:00:00',
    endTime: '2025-01-20T10:00:00',
    supplier: 'Security Solutions',
    contact: 'Robert Fischer',
    resources: [],
    status: 'confirmed'
  },
  {
    id: 'slot_005',
    title: 'Bauantrag Abgabe',
    type: 'permit',
    projectId: '1',
    projectName: 'Stadtfest München',
    startTime: '2025-01-22T14:00:00',
    endTime: '2025-01-22T15:00:00',
    notes: 'Frist: 15:00 Uhr',
    resources: [],
    status: 'planned'
  }
];

const getSlotColor = (type: string, status: string) => {
  if (status === 'cancelled') return 'bg-gray-200 text-gray-600 border-gray-300';
  if (status === 'delayed') return 'bg-red-100 text-red-800 border-red-200';
  
  switch (type) {
    case 'delivery': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pickup': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'service': return 'bg-green-100 text-green-800 border-green-200';
    case 'permit': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'catering': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'delivery': return <Truck className="w-4 h-4" />;
    case 'pickup': return <Package className="w-4 h-4" />;
    case 'service': return <Users className="w-4 h-4" />;
    case 'permit': return <CheckCircle className="w-4 h-4" />;
    case 'catering': return <Package className="w-4 h-4" />;
    default: return <CalendarIcon className="w-4 h-4" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'planned': return <Clock className="w-4 h-4 text-blue-500" />;
    case 'in-progress': return <Clock className="w-4 h-4 text-orange-500" />;
    case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'delayed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'cancelled': return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    default: return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

export function CalendarManager() {
  const { currentProject, projects } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [filterProject, setFilterProject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterGate, setFilterGate] = useState('all');
  const [filterResource, setFilterResource] = useState('all');
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [showNewSlotDialog, setShowNewSlotDialog] = useState(false);

  const isGlobalView = !currentProject;

  // Filter slots based on current view and filters
  const filteredSlots = mockSlots.filter(slot => {
    if (!isGlobalView && slot.projectId !== currentProject?.id) return false;
    if (filterProject !== 'all' && slot.projectId !== filterProject) return false;
    if (filterType !== 'all' && slot.type !== filterType) return false;
    if (filterGate !== 'all' && slot.gate !== filterGate) return false;
    if (filterResource !== 'all' && !slot.resources.includes(filterResource)) return false;
    
    // Filter by selected date range
    const slotDate = new Date(slot.startTime);
    const currentDate = new Date(selectedDate);
    
    if (viewMode === 'day') {
      return slotDate.toDateString() === currentDate.toDateString();
    } else if (viewMode === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return slotDate >= weekStart && slotDate <= weekEnd;
    } else {
      return slotDate.getMonth() === currentDate.getMonth() && 
             slotDate.getFullYear() === currentDate.getFullYear();
    }
  });

  // Get unique values for filters
  const gates = [...new Set(mockSlots.filter(s => s.gate).map(s => s.gate))];
  const resources = [...new Set(mockSlots.flatMap(s => s.resources))];

  // Detect conflicts
  const conflicts = filteredSlots.filter(slot => 
    slot.conflictsWith && slot.conflictsWith.length > 0
  );

  const renderTimeSlots = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 8 PM
    
    return (
      <div className="space-y-2">
        {hours.map(hour => {
          const hourSlots = filteredSlots.filter(slot => {
            const slotHour = new Date(slot.startTime).getHours();
            return slotHour === hour;
          });

          return (
            <div key={hour} className="grid grid-cols-12 gap-2 min-h-[60px]">
              <div className="col-span-1 text-sm font-medium text-muted-foreground py-2">
                {hour}:00
              </div>
              <div className="col-span-11 space-y-1">
                {hourSlots.map(slot => (
                  <Card 
                    key={slot.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getSlotColor(slot.type, slot.status)}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(slot.type)}
                          <div>
                            <h4 className="font-medium text-sm">{slot.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>
                                {new Date(slot.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - 
                                {new Date(slot.endTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {slot.gate && (
                                <>
                                  <span>•</span>
                                  <span>{slot.gate}</span>
                                </>
                              )}
                              {slot.supplier && (
                                <>
                                  <span>•</span>
                                  <span>{slot.supplier}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {slot.resources.map(resource => (
                            <Badge key={resource} variant="outline" size="sm">
                              {resource === 'stapler' && <Forklift className="w-3 h-3 mr-1" />}
                              {resource}
                            </Badge>
                          ))}
                          {getStatusIcon(slot.status)}
                          {slot.conflictsWith && slot.conflictsWith.length > 0 && (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSlotList = () => (
    <div className="space-y-3">
      {filteredSlots.map(slot => (
        <Card 
          key={slot.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelectedSlot(slot)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTypeIcon(slot.type)}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{slot.title}</h4>
                    <Badge className={getSlotColor(slot.type, slot.status)} size="sm">
                      {slot.type}
                    </Badge>
                    {isGlobalView && slot.projectName && (
                      <Badge variant="outline" size="sm">{slot.projectName}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(slot.startTime).toLocaleDateString('de-DE')} {' '}
                        {new Date(slot.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(slot.endTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {slot.gate && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{slot.gate}</span>
                      </div>
                    )}
                    {slot.supplier && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{slot.supplier}</span>
                      </div>
                    )}
                  </div>
                  {slot.resources.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {slot.resources.map(resource => (
                        <Badge key={resource} variant="secondary" size="sm">
                          {resource === 'stapler' && <Forklift className="w-3 h-3 mr-1" />}
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(slot.status)}
                {slot.conflictsWith && slot.conflictsWith.length > 0 && (
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isGlobalView ? 'Globaler Kalender' : `Projekt-Kalender: ${currentProject?.name}`}
          </h2>
          <p className="text-muted-foreground">
            {isGlobalView 
              ? 'Überblick über alle Projekte und Termine' 
              : 'Slots, Dienstleister-Timeline und Genehmigungsfristen'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            iCal Export
          </Button>
          <Button onClick={() => setShowNewSlotDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Slot hinzufügen
          </Button>
        </div>
      </div>

      {/* Conflicts Banner */}
      {conflicts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-800">Ressourcen-Konflikte erkannt</h4>
                <p className="text-sm text-orange-700">
                  {conflicts.length} Slots haben Überschneidungen bei Ressourcen oder Gates
                </p>
              </div>
              <Button variant="outline" size="sm">
                Konflikte lösen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - (viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30));
              setSelectedDate(newDate);
            }}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium min-w-[200px] text-center">
              {viewMode === 'day' && selectedDate.toLocaleDateString('de-DE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              {viewMode === 'week' && `KW ${Math.ceil(selectedDate.getDate() / 7)} ${selectedDate.getFullYear()}`}
              {viewMode === 'month' && selectedDate.toLocaleDateString('de-DE', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </span>
            <Button variant="outline" size="sm" onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + (viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30));
              setSelectedDate(newDate);
            }}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex border rounded-md">
            {['day', 'week', 'month'].map(mode => (
              <Button 
                key={mode}
                variant={viewMode === mode ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode(mode as 'day' | 'week' | 'month')}
              >
                {mode === 'day' ? 'Tag' : mode === 'week' ? 'Woche' : 'Monat'}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isGlobalView && (
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Projekt" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Projekte</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Typ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Typen</SelectItem>
              <SelectItem value="delivery">Lieferung</SelectItem>
              <SelectItem value="pickup">Abholung</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="permit">Genehmigung</SelectItem>
              <SelectItem value="catering">Catering</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterGate} onValueChange={setFilterGate}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Gate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Gates</SelectItem>
              {gates.map(gate => (
                <SelectItem key={gate} value={gate}>
                  {gate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterResource} onValueChange={setFilterResource}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Ressource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Ressourcen</SelectItem>
              {resources.map(resource => (
                <SelectItem key={resource} value={resource}>
                  {resource}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="list">Liste</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-6">
              {renderTimeSlots()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          {renderSlotList()}
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {filteredSlots.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4" />
              <p>Keine Slots gefunden</p>
              <p className="text-sm">Keine Termine für den ausgewählten Zeitraum</p>
            </div>
            <Button onClick={() => setShowNewSlotDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ersten Slot hinzufügen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Slot Detail Dialog */}
      {selectedSlot && (
        <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getTypeIcon(selectedSlot.type)}
                {selectedSlot.title}
                <Badge className={getSlotColor(selectedSlot.type, selectedSlot.status)}>
                  {selectedSlot.type}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Datum & Zeit:</Label>
                  <div className="text-sm">
                    {new Date(selectedSlot.startTime).toLocaleDateString('de-DE')}
                    <br />
                    {new Date(selectedSlot.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(selectedSlot.endTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div>
                  <Label>Status:</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedSlot.status)}
                    <span className="text-sm">{selectedSlot.status}</span>
                  </div>
                </div>
                {selectedSlot.gate && (
                  <div>
                    <Label>Gate:</Label>
                    <div className="text-sm">{selectedSlot.gate}</div>
                  </div>
                )}
                {selectedSlot.supplier && (
                  <div>
                    <Label>Lieferant:</Label>
                    <div className="text-sm">{selectedSlot.supplier}</div>
                  </div>
                )}
              </div>

              {selectedSlot.contact && (
                <div>
                  <Label>Kontaktperson:</Label>
                  <div className="text-sm">{selectedSlot.contact}</div>
                </div>
              )}

              {selectedSlot.resources.length > 0 && (
                <div>
                  <Label>Benötigte Ressourcen:</Label>
                  <div className="flex gap-2 mt-1">
                    {selectedSlot.resources.map(resource => (
                      <Badge key={resource} variant="outline">
                        {resource === 'stapler' && <Forklift className="w-3 h-3 mr-1" />}
                        {resource}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedSlot.conflictsWith && selectedSlot.conflictsWith.length > 0 && (
                <div className="bg-orange-50 p-3 rounded border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-orange-800">Ressourcen-Konflikt</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Überschneidung mit {selectedSlot.conflictsWith.length} anderen Slots
                  </p>
                </div>
              )}

              {selectedSlot.notes && (
                <div>
                  <Label>Notizen:</Label>
                  <div className="text-sm bg-muted p-2 rounded">{selectedSlot.notes}</div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline">
                  Bearbeiten
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Projekt öffnen
                  </Button>
                  <Button>
                    Bestätigen
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* New Slot Dialog */}
      {showNewSlotDialog && (
        <Dialog open={showNewSlotDialog} onOpenChange={setShowNewSlotDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Slot hinzufügen</DialogTitle>
              <DialogDescription>
                Füllen Sie die Felder aus, um einen neuen Slot hinzuzufügen.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="slot-title">Titel *</Label>
                <Input id="slot-title" placeholder="z.B. Bühnenaufbau Anlieferung" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slot-type">Typ *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Typ auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delivery">Lieferung</SelectItem>
                      <SelectItem value="pickup">Abholung</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="permit">Genehmigung</SelectItem>
                      <SelectItem value="catering">Catering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="slot-gate">Gate</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Gate auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gate-a">Gate A</SelectItem>
                      <SelectItem value="gate-b">Gate B</SelectItem>
                      <SelectItem value="gate-c">Gate C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slot-start">Startzeit *</Label>
                  <Input id="slot-start" type="datetime-local" />
                </div>
                <div>
                  <Label htmlFor="slot-end">Endzeit *</Label>
                  <Input id="slot-end" type="datetime-local" />
                </div>
              </div>

              <div>
                <Label htmlFor="slot-supplier">Lieferant/Dienstleister</Label>
                <Input id="slot-supplier" placeholder="Name des Lieferanten" />
              </div>

              <div>
                <Label htmlFor="slot-notes">Notizen</Label>
                <Textarea id="slot-notes" placeholder="Zusätzliche Informationen..." />
              </div>

              <div className="flex justify-end gap-2">
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
      )}
    </div>
  );
}