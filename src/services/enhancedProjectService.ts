import { api } from './api';

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'IDEA' | 'PLANNING' | 'APPROVAL' | 'SETUP' | 'LIVE' | 'TEARDOWN' | 'CLOSED';
  budget?: number;
  responsibleId: string;
  responsible?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  members?: ProjectMember[];
  _count?: {
    materials: number;
    suppliers: number;
    comments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  role: 'OWNER' | 'MANAGER' | 'MEMBER';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  status?: Project['status'];
  budget?: number;
  responsibleId?: string;
}

export interface ProjectStats {
  materialsCount: number;
  suppliersCount: number;
  commentsCount: number;
  membersCount: number;
}

class EnhancedProjectService {
  // Projects CRUD
  async getProjects(): Promise<Project[]> {
    try {
      const response = await api.get<Project[]>('/projects');
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getProject(id: string): Promise<Project> {
    try {
      const response = await api.get<Project>(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  }

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    try {
      const response = await api.post<Project>('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: string, updates: Partial<CreateProjectRequest>): Promise<Project> {
    try {
      const response = await api.patch<Project>(`/projects/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }

  // Project Members Management
  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    try {
      const response = await api.get<ProjectMember[]>(`/projects/${projectId}/members`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project members for ${projectId}:`, error);
      throw error;
    }
  }

  async addProjectMember(projectId: string, userId: string, role: 'OWNER' | 'MANAGER' | 'MEMBER'): Promise<ProjectMember> {
    try {
      const response = await api.post<ProjectMember>(`/projects/${projectId}/members`, {
        userId,
        role
      });
      return response.data;
    } catch (error) {
      console.error(`Error adding member to project ${projectId}:`, error);
      throw error;
    }
  }

  async updateProjectMember(projectId: string, userId: string, role: 'OWNER' | 'MANAGER' | 'MEMBER'): Promise<ProjectMember> {
    try {
      const response = await api.patch<ProjectMember>(`/projects/${projectId}/members/${userId}`, {
        role
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating project member ${userId}:`, error);
      throw error;
    }
  }

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
    } catch (error) {
      console.error(`Error removing member ${userId} from project:`, error);
      throw error;
    }
  }

  // Project Statistics
  async getProjectStats(projectId: string): Promise<ProjectStats> {
    try {
      const response = await api.get<ProjectStats>(`/projects/${projectId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project stats for ${projectId}:`, error);
      throw error;
    }
  }

  // Helper methods for project status
  getStatusColor(status: Project['status']): string {
    const statusColors = {
      'IDEA': 'bg-gray-100 text-gray-800',
      'PLANNING': 'bg-blue-100 text-blue-800',
      'APPROVAL': 'bg-yellow-100 text-yellow-800',
      'SETUP': 'bg-orange-100 text-orange-800',
      'LIVE': 'bg-green-100 text-green-800',
      'TEARDOWN': 'bg-purple-100 text-purple-800',
      'CLOSED': 'bg-gray-100 text-gray-800',
    };
    return statusColors[status] || statusColors['IDEA'];
  }

  getStatusLabel(status: Project['status']): string {
    const statusLabels = {
      'IDEA': 'Idee',
      'PLANNING': 'Planung',
      'APPROVAL': 'Genehmigung',
      'SETUP': 'Aufbau',
      'LIVE': 'Live',
      'TEARDOWN': 'Abbau',
      'CLOSED': 'Abgeschlossen',
    };
    return statusLabels[status] || status;
  }

  getStatusIcon(status: Project['status']): string {
    const statusIcons = {
      'IDEA': '💡',
      'PLANNING': '📋',
      'APPROVAL': '✅',
      'SETUP': '🔧',
      'LIVE': '🎉',
      'TEARDOWN': '📦',
      'CLOSED': '🏁',
    };
    return statusIcons[status] || '📋';
  }

  // Calculate project progress based on dates and status
  calculateProgress(project: Project): number {
    const now = new Date();
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    
    if (now < start) return 0;
    if (now > end || project.status === 'CLOSED') return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }

  // Format budget for display
  formatBudget(budget?: number): string {
    if (!budget) return 'Nicht festgelegt';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(budget);
  }

  // Get days until project start/end
  getDaysUntil(date: string): number {
    const target = new Date(date);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Get readable time until date
  getTimeUntil(date: string): string {
    const days = this.getDaysUntil(date);
    
    if (days < 0) {
      return `Vor ${Math.abs(days)} Tag${Math.abs(days) === 1 ? '' : 'en'}`;
    } else if (days === 0) {
      return 'Heute';
    } else if (days === 1) {
      return 'Morgen';
    } else if (days < 7) {
      return `In ${days} Tagen`;
    } else if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `In ${weeks} Woche${weeks === 1 ? '' : 'n'}`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `In ${months} Monat${months === 1 ? '' : 'en'}`;
    } else {
      const years = Math.floor(days / 365);
      return `In ${years} Jahr${years === 1 ? '' : 'en'}`;
    }
  }

  // Format date for display
  formatDate(date: string): string {
    return new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  }

  // Get project duration in days
  getProjectDuration(project: Project): number {
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Check if project is overdue
  isOverdue(project: Project): boolean {
    if (project.status === 'CLOSED') return false;
    const now = new Date();
    const end = new Date(project.endDate);
    return now > end;
  }

  // Get project priority based on status and dates
  getPriority(project: Project): 'low' | 'medium' | 'high' {
    const daysUntilStart = this.getDaysUntil(project.startDate);
    const daysUntilEnd = this.getDaysUntil(project.endDate);
    
    if (project.status === 'LIVE' || project.status === 'SETUP') {
      return 'high';
    } else if (daysUntilStart <= 7 && daysUntilStart >= 0) {
      return 'high';
    } else if (daysUntilEnd <= 14 && daysUntilEnd >= 0) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Get priority color
  getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
    const colors = {
      'low': 'text-green-600',
      'medium': 'text-yellow-600',
      'high': 'text-red-600',
    };
    return colors[priority];
  }
}

export const enhancedProjectService = new EnhancedProjectService();