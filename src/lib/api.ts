// API Client for FarmKeeper Frontend
// Centralized API service with proper authentication and error handling

import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  farmSlug: string;
  farmName?: string;
  token?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Farm {
  id: string;
  name: string;
  slug: string;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.initializeToken();
  }

  private initializeToken() {
    if (typeof window !== 'undefined') {
      // Try to get token from cookies first (set by server-side auth)
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
      if (tokenCookie) {
        this.token = tokenCookie.split('=')[1];
      } else {
        // Fallback to localStorage
        this.token = localStorage.getItem('auth-token') || null;
      }
    }
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      data = { error: 'Failed to parse response' };
    }

    if (!response.ok) {
      // Log the actual response for debugging
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        url: response.url
      });
      
      return {
        success: false,
        error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`,
        data: data
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.getHeaders();
      
      // Log the request for debugging
      console.log('API Request:', {
        url,
        method: options.method || 'GET',
        headers: headers,
        hasToken: !!this.token
      });
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  // Set token (useful after login)
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
  }

  // Clear token (useful after logout)
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
  }

  // Auth endpoints
  async register(data: {
    farmName: string;
    name: string;
    email: string;
    password: string;
    plan?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // If login successful, set the token
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    // Clear token regardless of response
    this.clearToken();

    return response;
  }

  async getAuthStatus(): Promise<ApiResponse<{
    isAuthenticated: boolean;
    isSignedUp: boolean;
    user?: User;
    farm?: Farm;
  }>> {
    return this.request('/auth/status');
  }

  // Livestock endpoints
  async getLivestock(farmSlug: string): Promise<ApiResponse<any[]>> {
    return this.request(`/farms/${farmSlug}/livestock`);
  }

  async getTotalLivestock(): Promise<ApiResponse<{ totalLivestock: number }>> {
    return this.request('/livestock/total');
  }

  async createLivestock(farmSlug: string, data: any): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/livestock`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLivestock(farmSlug: string, id: string, data: any): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/livestock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLivestock(farmSlug: string, id: string): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/livestock/${id}`, {
      method: 'DELETE',
    });
  }

  // Egg collection endpoints
  async getEggCollections(farmSlug: string): Promise<ApiResponse<any[]>> {
    return this.request(`/farms/${farmSlug}/eggs/collections`);
  }

  async getTodayEggCollection(): Promise<ApiResponse<{ eggsCollected: number }>> {
    return this.request('/eggs/today');
  }

  async createEggCollection(farmSlug: string, data: {
    date: string;
    quantity: number;
    chickens: number;
    notes?: string;
  }): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/eggs/collections`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEggCollection(farmSlug: string, id: string, data: any): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/eggs/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEggCollection(farmSlug: string, id: string): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/eggs/collections/${id}`, {
      method: 'DELETE',
    });
  }

  // Egg sales endpoints
  async getEggSales(farmSlug: string): Promise<ApiResponse<any[]>> {
    return this.request(`/farms/${farmSlug}/eggs/sales`);
  }

  async createEggSale(farmSlug: string, data: {
    date: string;
    quantity: number;
    price: number;
    customer: string;
    paymentMethod: string;
    notes?: string;
  }): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/eggs/sales`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Tasks endpoints
  async getUpcomingTasks(limit?: number): Promise<ApiResponse<any[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/tasks/upcoming${params}`);
  }

  async createTask(farmSlug: string, data: any): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Activity endpoints
  async getRecentActivities(limit?: number): Promise<ApiResponse<any[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/activity/recent${params}`);
  }

  // Crops endpoints
  async getCrops(farmSlug: string): Promise<ApiResponse<any[]>> {
    return this.request(`/farms/${farmSlug}/crops`);
  }

  async createCrop(farmSlug: string, data: any): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/crops`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCrop(farmSlug: string, cropId: string, data: any): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/crops/${cropId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCrop(farmSlug: string, cropId: string): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/crops/${cropId}`, {
      method: 'DELETE',
    });
  }

  // Feedstock endpoints
  async getFeedstock(farmSlug: string): Promise<ApiResponse<any[]>> {
    return this.request(`/farms/${farmSlug}/feedstock`);
  }

  async getFeedstockSummary(): Promise<ApiResponse<{
    totalStock: number;
    stockPercentage: number;
    stockByType: any;
    lowStockItems: any[];
    lastUpdated: string | null;
    totalItems: number;
  }>> {
    return this.request('/feedstock/summary');
  }

  async createFeedstock(farmSlug: string, data: any): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/feedstock`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFeedstock(farmSlug: string, feedId: string, data: any): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/feedstock/${feedId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFeedstock(farmSlug: string, feedId: string): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/feedstock/${feedId}`, {
      method: 'DELETE',
    });
  }

  // Finance endpoints
  async getFinancialAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/finances/analytics');
  }

  async getFinancialTransactions(farmSlug: string): Promise<ApiResponse<any[]>> {
    return this.request(`/farms/${farmSlug}/finances`);
  }

  async createFinancialTransaction(farmSlug: string, data: any): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/finances`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFinancialTransaction(farmSlug: string, transactionId: string, data: any): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/finances/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFinancialTransaction(farmSlug: string, transactionId: string): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/finances/${transactionId}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async getAnalytics(farmSlug: string, year?: number, period?: string, sortBy?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (period) params.append('period', period);
    if (sortBy) params.append('sortBy', sortBy);
    
    const queryString = params.toString();
    const endpoint = `/analytics/farms/${farmSlug}${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  // Weather endpoints
  async getWeatherForecast(): Promise<ApiResponse<any>> {
    return this.request('/weather/forecast');
  }

  async getWeather(farmSlug: string): Promise<ApiResponse<any>> {
    return this.request(`/weather/${farmSlug}`);
  }

  async getNearbyFarmsWeather(farmSlug: string): Promise<ApiResponse<any>> {
    return this.request(`/weather/${farmSlug}/nearby`);
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export the class for testing or multiple instances
export { ApiClient };
