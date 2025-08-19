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
  };
  createdAt: string;
  updatedAt: string;
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

class ProjectService {
  async getProjects(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  }

  async getProject(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  }

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    const response = await api.post<Project>('/projects', projectData);
    return response.data;
  }

  async updateProject(id: string, updates: Partial<CreateProjectRequest>): Promise<Project> {
    const response = await api.patch<Project>(`/projects/${id}`, updates);
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  }

  async getProjectMembers(projectId: string) {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data;
  }

  async addProjectMember(projectId: string, userId: string, role: string) {
    const response = await api.post(`/projects/${projectId}/members`, {
      userId,
      role
    });
    return response.data;
  }
}

export const projectService = new ProjectService();