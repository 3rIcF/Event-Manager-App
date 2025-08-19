export interface Event {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location: string;
  maxParticipants?: number;
  status: EventStatus;
  type: EventType;
  category: EventCategory;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  participants?: EventParticipant[];
  tasks?: EventTask[];
  budget?: EventBudget;
  settings?: EventSettings;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  registeredAt: Date;
  checkedInAt?: Date;
  dietaryRestrictions?: string[];
  specialNeeds?: string;
}

export interface EventTask {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventBudget {
  id: string;
  eventId: string;
  totalBudget: number;
  spentAmount: number;
  currency: string;
  categories: BudgetCategory[];
  lastUpdated: Date;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  description?: string;
}

export interface EventSettings {
  id: string;
  eventId: string;
  allowRegistration: boolean;
  requireApproval: boolean;
  maxRegistrations?: number;
  waitlistEnabled: boolean;
  cancellationPolicy: string;
  refundPolicy: string;
  termsAndConditions: string;
}

export interface CreateEventDto {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location: string;
  maxParticipants?: number;
  type: EventType;
  category: EventCategory;
  settings?: Partial<EventSettings>;
}

export interface UpdateEventDto {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  maxParticipants?: number;
  status?: EventStatus;
  type?: EventType;
  category?: EventCategory;
  settings?: Partial<EventSettings>;
}

export interface CreateParticipantDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: ParticipantRole;
  dietaryRestrictions?: string[];
  specialNeeds?: string;
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  REGISTRATION_OPEN = 'registration_open',
  REGISTRATION_CLOSED = 'registration_closed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum EventType {
  CONFERENCE = 'conference',
  WORKSHOP = 'workshop',
  SEMINAR = 'seminar',
  MEETING = 'meeting',
  TRAINING = 'training',
  NETWORKING = 'networking',
  EXHIBITION = 'exhibition',
  CONCERT = 'concert',
  SPORTS = 'sports',
  OTHER = 'other',
}

export enum EventCategory {
  BUSINESS = 'business',
  TECHNOLOGY = 'technology',
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  ENTERTAINMENT = 'entertainment',
  SPORTS = 'sports',
  CULTURE = 'culture',
  SCIENCE = 'science',
  POLITICS = 'politics',
  OTHER = 'other',
}

export enum ParticipantRole {
  ATTENDEE = 'attendee',
  SPEAKER = 'speaker',
  ORGANIZER = 'organizer',
  VOLUNTEER = 'volunteer',
  SPONSOR = 'sponsor',
  MEDIA = 'media',
  VIP = 'vip',
}

export enum ParticipantStatus {
  REGISTERED = 'registered',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  WAITLISTED = 'waitlisted',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
  CANCELLED = 'cancelled',
}
