/**
 * Admin API Service for CELF Website
 * Handles all admin-specific API communication with the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface AdminStats {
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  mining: {
    activeSessions: number;
    totalCelfMined: number;
  };
  transactions: {
    today: number;
  };
  applications: {
    pendingMentorship: number;
    pendingScholarship: number;
    pendingContact: number;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  first_name: string; // Database field name
  lastName: string;
  last_name: string; // Database field name
  role: string;
  isActive: boolean;
  is_active: boolean; // Database field name
  lastLogin: string;
  last_login: string; // Database field name
  createdAt: string;
  created_at: string; // Database field name
  wallets?: {
    sendableBalance: number;
    nonSendableBalance: number;
    totalBalance: number;
  };
}

export interface MiningSession {
  id: string;
  userId: string;
  user_id: string; // Database field name
  status: string;
  miningRate: number;
  mining_rate: number; // Database field name
  tokensEarned: number;
  tokens_earned: number; // Database field name
  runtimeSeconds: number;
  runtime_seconds: number; // Database field name
  startedAt: string;
  started_at: string; // Database field name
  completedAt?: string;
  completed_at?: string; // Database field name
  users?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface MiningSettings {
  miningRatePerSecond: number;
  miningIntervalMs: number;
  maxSessionTime: number;
  maintenanceMode: boolean;
  referralBonus: number;
  autoClaim: boolean;
  notificationEnabled: boolean;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  validationErrors?: string[];
}

export interface WalletStats {
  totalWallets: number;
  totalBalance: number;
  totalSent: number;
  totalReceived: number;
}

export interface AdminWallet {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  };
  totalBalance: number;
  sendableBalance: number;
  nonSendableBalance: number;
  pendingBalance: number;
  currentAddress: string;
  addressCount: number;
  lastActivity: string;
  createdAt: string;
}

export interface AdminTransaction {
  id: string;
  fromUserId?: string;
  toUserId?: string;
  fromUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  toUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  type: string;
  status: string;
  description?: string;
  createdAt: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class AdminApiService {
  private getAuthHeaders(): HeadersInit {
    // For now, allow access without token for demo purposes
    // TODO: Re-enable token requirement when admin accounts are set up
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('Admin API Error:', error);
      throw error; // Let the UI handle errors instead of returning mock data
    }
  }



  // Dashboard & Analytics
  async getDashboardStats(): Promise<ApiResponse<AdminStats>> {
    return this.request<AdminStats>('/dashboard/stats');
  }

  async getRecentActivity(limit = 10): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/dashboard/recent-activity?limit=${limit}`);
  }

  async getUserAnalytics(period = '30d'): Promise<ApiResponse<any>> {
    return this.request<any>(`/analytics/users?period=${period}`);
  }

  async getMiningAnalytics(period = '30d'): Promise<ApiResponse<any>> {
    return this.request<any>(`/analytics/mining?period=${period}`);
  }

  async getTransactionAnalytics(period = '30d'): Promise<ApiResponse<any>> {
    return this.request<any>(`/analytics/transactions?period=${period}`);
  }

  // Wallet Management
  async getWalletStats(): Promise<ApiResponse<WalletStats>> {
    return this.request<WalletStats>('/wallets/stats');
  }

  async getAllWallets(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<ApiResponse<{ data: AdminWallet[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.request<{ data: AdminWallet[]; pagination: any }>(`/wallets?${queryParams}`);
  }

  async getWalletById(id: string): Promise<ApiResponse<AdminWallet>> {
    return this.request<AdminWallet>(`/wallets/${id}`);
  }

  async getRecentTransactions(limit = 10): Promise<ApiResponse<AdminTransaction[]>> {
    return this.request<AdminTransaction[]>(`/wallets/transactions/recent?limit=${limit}`);
  }

  // User Management
  async getAllUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  } = {}): Promise<ApiResponse<{ users: AdminUser[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.request<{ users: AdminUser[]; pagination: any }>(`/users?${queryParams}`);
  }

  async getUserById(id: string): Promise<ApiResponse<AdminUser>> {
    return this.request<AdminUser>(`/users/${id}`);
  }

  async updateUser(id: string, data: Partial<AdminUser>): Promise<ApiResponse<AdminUser>> {
    return this.request<AdminUser>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async suspendUser(id: string, reason?: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async activateUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${id}/activate`, {
      method: 'POST',
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Mining Management
  async getMiningSessions(params: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  } = {}): Promise<ApiResponse<{ sessions: MiningSession[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.request<{ sessions: MiningSession[]; pagination: any }>(`/mining/sessions?${queryParams}`);
  }

  async getMiningSettings(): Promise<ApiResponse<MiningSettings>> {
    return this.request<MiningSettings>('/mining/settings');
  }

  async updateMiningSettings(settings: Partial<MiningSettings>): Promise<ApiResponse<MiningSettings>> {
    return this.request<MiningSettings>('/mining/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async terminateMiningSession(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/mining/sessions/${id}/terminate`, {
      method: 'POST',
    });
  }

  async pauseMiningSession(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/mining/sessions/${id}/pause`, {
      method: 'POST',
    });
  }

  async resumeMiningSession(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/mining/sessions/${id}/resume`, {
      method: 'POST',
    });
  }

  // Content Management
  async getContactSubmissions(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<ApiResponse<{ submissions: ContactSubmission[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.request<{ submissions: ContactSubmission[]; pagination: any }>(`/content/contact-submissions?${queryParams}`);
  }

  async getContactSubmissionById(id: string): Promise<ApiResponse<ContactSubmission>> {
    return this.request<ContactSubmission>(`/content/contact-submissions/${id}`);
  }

  async updateContactSubmissionStatus(id: string, status: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/content/contact-submissions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteContactSubmission(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/content/contact-submissions/${id}`, {
      method: 'DELETE',
    });
  }

  async getNewsletterSubscriptions(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<ApiResponse<{ subscriptions: any[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.request<{ subscriptions: any[]; pagination: any }>(`/content/newsletter-subscriptions?${queryParams}`);
  }

  async getMentorshipApplications(params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  } = {}): Promise<ApiResponse<{ applications: any[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.request<{ applications: any[]; pagination: any }>(`/content/mentorship-applications?${queryParams}`);
  }

  async getScholarshipApplications(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<ApiResponse<{ applications: any[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.request<{ applications: any[]; pagination: any }>(`/content/scholarship-applications?${queryParams}`);
  }

  async updateMentorshipApplicationStatus(id: string, status: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/content/mentorship-applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateScholarshipApplicationStatus(id: string, status: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/content/scholarship-applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Task Management - Use direct API calls since tasks have different route structure
  async getAllTasks(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/admin/all`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('Admin API Error:', error);
      throw error;
    }
  }

  async getTaskById(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/admin/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('Admin API Error:', error);
      throw error;
    }
  }

  async createTask(taskData: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/admin/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('Admin API Error:', error);
      throw error;
    }
  }

  async updateTask(id: string, taskData: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/admin/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('Admin API Error:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/admin/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('Admin API Error:', error);
      throw error;
    }
  }

  // Social Links Management
  async getAllSocialLinks(): Promise<ApiResponse<SocialLink[]>> {
    return this.request<SocialLink[]>('/social-links');
  }

  async getSocialLinkById(id: string): Promise<ApiResponse<SocialLink>> {
    return this.request<SocialLink>(`/social-links/${id}`);
  }

  async createSocialLink(socialLinkData: {
    platform: string;
    url: string;
    icon: string;
    displayName?: string;
    isActive?: boolean;
    sortOrder?: number;
  }): Promise<ApiResponse<SocialLink>> {
    return this.request<SocialLink>('/social-links', {
      method: 'POST',
      body: JSON.stringify(socialLinkData),
    });
  }

  async updateSocialLink(id: string, socialLinkData: {
    platform?: string;
    url?: string;
    icon?: string;
    displayName?: string;
    isActive?: boolean;
    sortOrder?: number;
  }): Promise<ApiResponse<SocialLink>> {
    return this.request<SocialLink>(`/social-links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(socialLinkData),
    });
  }

  async deleteSocialLink(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/social-links/${id}`, {
      method: 'DELETE',
    });
  }
}

export const adminApi = new AdminApiService();
