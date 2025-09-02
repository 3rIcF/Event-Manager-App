import React, { useState, useEffect } from 'react';
import { Event, EventStatus, EventType, EventCategory } from '../src/types/event';
import { eventService } from './EventService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, Users, Clock, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function EventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await eventService.getEvents();
      setEvents(eventsData);
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden der Events');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      const newEvent = await eventService.createEvent(eventData);
      setEvents(prev => [...prev, newEvent]);
      setShowCreateDialog(false);
      setError(null);
    } catch (err) {
      setError('Fehler beim Erstellen des Events');
      console.error('Error creating event:', err);
    }
  };

  const handleUpdateEvent = async (id: string, eventData: any) => {
    try {
      const updatedEvent = await eventService.updateEvent(id, eventData);
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ));
      setEditingEvent(null);
      setError(null);
    } catch (err) {
      setError('Fehler beim Aktualisieren des Events');
      console.error('Error updating event:', err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Möchten Sie dieses Event wirklich löschen?')) return;
    
    try {
      await eventService.deleteEvent(id);
      setEvents(prev => prev.filter(event => event.id !== id));
      setError(null);
    } catch (err) {
      setError('Fehler beim Löschen des Events');
      console.error('Error deleting event:', err);
    }
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      case EventStatus.PUBLISHED: return 'bg-blue-100 text-blue-800';
      case EventStatus.REGISTRATION_OPEN: return 'bg-green-100 text-green-800';
      case EventStatus.REGISTRATION_CLOSED: return 'bg-yellow-100 text-yellow-800';
      case EventStatus.IN_PROGRESS: return 'bg-purple-100 text-purple-800';
      case EventStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case EventStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="text-red-800">{error}</div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadEvents}
            className="ml-auto"
          >
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event-Management</h1>
          <p className="text-muted-foreground">
            Verwalten Sie alle Ihre Events, Konferenzen und Veranstaltungen
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neues Event
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Alle Events</TabsTrigger>
          <TabsTrigger value="upcoming">Anstehende</TabsTrigger>
          <TabsTrigger value="ongoing">Laufende</TabsTrigger>
          <TabsTrigger value="completed">Abgeschlossene</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => setEditingEvent(event)}
                onDelete={() => handleDeleteEvent(event.id)}
                onView={() => setSelectedEvent(event)}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events
              .filter(event => new Date(event.startDate) > new Date())
              .map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={() => setEditingEvent(event)}
                  onDelete={() => handleDeleteEvent(event.id)}
                  onView={() => setSelectedEvent(event)}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="ongoing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events
              .filter(event => {
                const now = new Date();
                const start = new Date(event.startDate);
                const end = new Date(event.endDate);
                return now >= start && now <= end;
              })
              .map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={() => setEditingEvent(event)}
                  onDelete={() => handleDeleteEvent(event.id)}
                  onView={() => setSelectedEvent(event)}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events
              .filter(event => new Date(event.endDate) < new Date())
              .map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={() => setEditingEvent(event)}
                  onDelete={() => handleDeleteEvent(event.id)}
                  onView={() => setSelectedEvent(event)}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateEvent}
      />

      {/* Edit Event Dialog */}
      {editingEvent && (
        <EditEventDialog
          event={editingEvent}
          open={!!editingEvent}
          onOpenChange={() => setEditingEvent(null)}
          onSubmit={(data) => handleUpdateEvent(editingEvent.id, data)}
        />
      )}

      {/* View Event Dialog */}
      {selectedEvent && (
        <ViewEventDialog
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

function EventCard({ 
  event, 
  onEdit, 
  onDelete, 
  onView, 
  getStatusColor, 
  formatDate 
}: {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  getStatusColor: (status: EventStatus) => string;
  formatDate: (date: Date) => string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{event.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {event.description}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(event.status)}>
            {event.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          {formatDate(event.startDate)}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4" />
          {event.location}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          {event.maxParticipants ? `${event.maxParticipants} Teilnehmer` : 'Unbegrenzt'}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          {event.type} • {event.category}
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="mr-1 h-3 w-3" />
            Anzeigen
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="mr-1 h-3 w-3" />
            Bearbeiten
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="mr-1 h-3 w-3" />
            Löschen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateEventDialog({ open, onOpenChange, onSubmit }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: '',
    type: EventType.CONFERENCE,
    category: EventCategory.BUSINESS,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Neues Event erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie ein neues Event mit allen notwendigen Details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Event-Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ort *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start-Datum *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End-Datum *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Event-Typ</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as EventType }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EventType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as EventCategory }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EventCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max. Teilnehmer</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
                placeholder="Unbegrenzt"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit">Event erstellen</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditEventDialog({ event, open, onOpenChange, onSubmit }: {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: event.name,
    description: event.description || '',
    startDate: event.startDate.toISOString().slice(0, 16),
    endDate: event.endDate.toISOString().slice(0, 16),
    location: event.location,
    maxParticipants: event.maxParticipants?.toString() || '',
    type: event.type,
    category: event.category,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Event bearbeiten</DialogTitle>
          <DialogDescription>
            Bearbeiten Sie die Details des Events.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Event-Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ort *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start-Datum *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End-Datum *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Event-Typ</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as EventType }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EventType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as EventCategory }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EventCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max. Teilnehmer</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
                placeholder="Unbegrenzt"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit">Änderungen speichern</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ViewEventDialog({ event, open, onOpenChange }: {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{event.name}</DialogTitle>
          <DialogDescription>
            Detaillierte Informationen zum Event
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Beschreibung</Label>
                <p className="mt-1">{event.description || 'Keine Beschreibung verfügbar'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Ort</Label>
                <p className="mt-1 flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  {event.location}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Event-Typ</Label>
                <p className="mt-1">{event.type}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Kategorie</Label>
                <p className="mt-1">{event.category}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Start-Datum</Label>
                <p className="mt-1 flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDate(event.startDate)}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">End-Datum</Label>
                <p className="mt-1 flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {formatDate(event.endDate)}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Max. Teilnehmer</Label>
                <p className="mt-1 flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  {event.maxParticipants ? event.maxParticipants : 'Unbegrenzt'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Badge className="mt-1">{event.status.replace('_', ' ')}</Badge>
              </div>
            </div>
          </div>
          
          {event.participants && event.participants.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Teilnehmer</Label>
              <div className="mt-2 space-y-2">
                {event.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{participant.firstName} {participant.lastName}</p>
                      <p className="text-sm text-muted-foreground">{participant.email}</p>
                    </div>
                    <Badge variant="outline">{participant.role}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Schließen</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
