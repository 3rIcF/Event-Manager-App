import { Event, CreateEventDto, UpdateEventDto, EventParticipant, CreateParticipantDto } from '../src/types/event';

export class EventService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }

  // Event CRUD Operations
  async createEvent(eventData: CreateEventDto): Promise<Event> {
    const response = await fetch(`${this.baseUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.statusText}`);
    }

    return response.json();
  }

  async getEvents(): Promise<Event[]> {
    const response = await fetch(`${this.baseUrl}/events`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    return response.json();
  }

  async getEventById(id: string): Promise<Event> {
    const response = await fetch(`${this.baseUrl}/events/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event: ${response.statusText}`);
    }

    return response.json();
  }

  async updateEvent(id: string, eventData: UpdateEventDto): Promise<Event> {
    const response = await fetch(`${this.baseUrl}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update event: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteEvent(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete event: ${response.statusText}`);
    }
  }

  // Event Participants
  async addParticipant(eventId: string, participantData: CreateParticipantDto): Promise<EventParticipant> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}/participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(participantData),
    });

    if (!response.ok) {
      throw new Error(`Failed to add participant: ${response.statusText}`);
    }

    return response.json();
  }

  async removeParticipant(eventId: string, participantId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}/participants/${participantId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to remove participant: ${response.statusText}`);
    }
  }

  // Event Calendar
  async getEventCalendar(startDate: Date, endDate: Date): Promise<Event[]> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const response = await fetch(`${this.baseUrl}/events/calendar?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event calendar: ${response.statusText}`);
    }

    return response.json();
  }

  // Event Search
  async searchEvents(query: string, filters?: any): Promise<Event[]> {
    const params = new URLSearchParams({ q: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/events/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to search events: ${response.statusText}`);
    }

    return response.json();
  }

  // Event Statistics
  async getEventStatistics(): Promise<{
    totalEvents: number;
    upcomingEvents: number;
    completedEvents: number;
    totalParticipants: number;
  }> {
    const response = await fetch(`${this.baseUrl}/events/statistics`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event statistics: ${response.statusText}`);
    }

    return response.json();
  }

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }
}

export const eventService = new EventService();
