import { api } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'MANAGER' | 'ADMIN';
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
  expires_in: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    // Store auth data
    localStorage.setItem('auth_token', response.data.access_token);
    localStorage.setItem('user_data', JSON.stringify(response.data.user));
    
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    
    // Store auth data
    localStorage.setItem('auth_token', response.data.access_token);
    localStorage.setItem('user_data', JSON.stringify(response.data.user));
    
    return response.data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  async getCurrentUser(): Promise<{ user: AuthUser }> {
    const response = await api.get<{ user: AuthUser }>('/auth/profile');
    return response.data;
  }

  async verifyToken(): Promise<{ valid: boolean; user: AuthUser }> {
    try {
      const response = await api.post<{ valid: boolean; user: AuthUser }>('/auth/verify');
      return response.data;
    } catch (error) {
      return { valid: false, user: null as any };
    }
  }

  getStoredUser(): AuthUser | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export const authService = new AuthService();