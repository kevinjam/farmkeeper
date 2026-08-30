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
  code?: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  farmSlug?: string;
  farmName?: string;
  token?: string;
  requiresOnboarding?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
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

    // Always check localStorage for the latest token
    if (typeof window !== 'undefined') {
      const localToken = localStorage.getItem('auth-token');
      if (localToken) {
        this.token = localToken;
      }
    }

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
        data: data,
        code: typeof data?.code === 'string' ? data.code : undefined,
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
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse & { requiresOnboarding?: boolean }>> {
    return this.request('/auth/register', {
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

  async updateProfile(data: {
    name?: string;
    phone?: string;
    countryCode?: string;
  }): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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

  async deleteEggSale(farmSlug: string, id: string): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/eggs/sales/${id}`, {
      method: 'DELETE',
    });
  }

  // Tasks endpoints
  async getUpcomingTasks(farmSlug: string, limit?: number): Promise<ApiResponse<any[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/farms/${farmSlug}/tasks/upcoming${params}`);
  }

  async getTasks(
    farmSlug: string,
    options?: { status?: string; limit?: number }
  ): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.limit) params.set('limit', String(options.limit));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/farms/${farmSlug}/tasks${qs}`);
  }

  async createTask(farmSlug: string, data: any): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(
    farmSlug: string,
    taskId: string,
    data: Record<string, unknown>
  ): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Activity endpoints
  async getRecentActivities(farmSlug: string, limit?: number): Promise<ApiResponse<any[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/farms/${farmSlug}/recent-activity${params}`);
  }

  // Crops endpoints
  async getCrops(farmSlug: string): Promise<ApiResponse<any[]>> {
    return this.request(`/farms/${farmSlug}/crops`);
  }

  async getCrop(farmSlug: string, cropId: string): Promise<ApiResponse> {
    return this.request(`/farms/${farmSlug}/crops/${cropId}`);
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

  async getFeedstockSummary(farmSlug: string): Promise<ApiResponse<{
    totalStock: number;
    stockPercentage: number;
    stockByType: any;
    lowStockItems: any[];
    lastUpdated: string | null;
    totalItems: number;
  }>> {
    return this.request(`/farms/${farmSlug}/feedstock/summary`);
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

  /** Get a short-lived signed CDN URL to view a stored receipt. */
  async getReceiptViewUrl(
    farmSlug: string,
    storedUrl: string
  ): Promise<ApiResponse<{ url: string }>> {
    const params = new URLSearchParams({ url: storedUrl });
    return this.request(`/farms/${farmSlug}/uploads/receipt/view?${params.toString()}`);
  }

  /** Stream receipt file bytes through the API (authenticated). */
  async fetchReceiptBlob(farmSlug: string, storedUrl: string): Promise<Blob> {
    const params = new URLSearchParams({ url: storedUrl });
    const url = `${this.baseURL}/farms/${farmSlug}/uploads/receipt/stream?${params.toString()}`;
    const authHeaders = (await this.getHeaders()) as Record<string, string>;
    const headers: Record<string, string> = {};
    Object.entries(authHeaders).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'content-type' && value) {
        headers[key] = value;
      }
    });

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const body = await response.json();
        message = body.message || message;
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    return response.blob();
  }

  /** Upload an expense receipt image/PDF to Cloudinary via the backend. */
  async uploadReceipt(
    farmSlug: string,
    file: File
  ): Promise<ApiResponse<{ url: string; publicId: string; format: string }>> {
    try {
      const url = `${this.baseURL}/farms/${farmSlug}/uploads/receipt`;
      const authHeaders = (await this.getHeaders()) as Record<string, string>;
      const headers: Record<string, string> = { Accept: 'application/json' };
      Object.entries(authHeaders).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'content-type' && value) {
          headers[key] = value;
        }
      });

      const formData = new FormData();
      formData.append('receipt', file);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Receipt upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload receipt',
      };
    }
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

  // Farm Settings
  async getFarmSettings(farmSlug: string): Promise<ApiResponse<any>> {
    return this.request(`/farms/${farmSlug}/settings`);
  }

  async updateFarmSettings(farmSlug: string, settings: any): Promise<ApiResponse<any>> {
    return this.request(`/farms/${farmSlug}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Billing endpoints
  async getPlans(countryCode?: string): Promise<ApiResponse<any>> {
    const query = countryCode ? `?country=${encodeURIComponent(countryCode)}` : '';
    return this.request(`/billing/plans${query}`);
  }

  async getPaymentConfig(): Promise<ApiResponse<any>> {
    return this.request('/billing/payment-config');
  }

  async verifyPaddleTransaction(transactionId: string): Promise<ApiResponse<any>> {
    return this.request(`/billing/paddle/transaction/${transactionId}`);
  }

  async getSubscriptionStatus(): Promise<ApiResponse<any>> {
    return this.request('/billing/trial-status');
  }

  async initiateSubscription(data: {
    plan: 'farmer' | 'premium';
    paymentMethod?: string;
    phoneNumber?: string;
    billingCycle?: 'month' | 'year';
  }): Promise<ApiResponse<any>> {
    return this.request('/billing/subscribe', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelSubscription(): Promise<ApiResponse<any>> {
    return this.request('/billing/cancel', {
      method: 'POST',
    });
  }

  async getSubscriptionHistory(): Promise<ApiResponse<any[]>> {
    return this.request('/billing/history');
  }

  /** Download invoice PDF for a completed payment (by reference). */
  async downloadInvoice(reference: string): Promise<{ success: boolean; blob?: Blob; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseURL}/billing/invoice/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          const data = await response.json();
          message = data.message || data.error || message;
        } catch {
          /* ignore */
        }
        return { success: false, error: message };
      }

      const blob = await response.blob();
      return { success: true, blob };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to download invoice',
      };
    }
  }

  async getPaymentStatus(reference: string): Promise<ApiResponse<{ status: string; plan?: string; amount?: number; currency?: string }>> {
    return this.request(`/billing/payment-status/${reference}`);
  }

  // User Language endpoints
  async getUserLanguage(): Promise<ApiResponse<{ language: string }>> {
    return this.request('/auth/language');
  }

  async updateUserLanguage(language: 'en' | 'lg' | 'sw'): Promise<ApiResponse<{ language: string }>> {
    return this.request('/auth/language', {
      method: 'PUT',
      body: JSON.stringify({ language }),
    });
  }

  // Generic request method for custom endpoints
  async get(endpoint: string): Promise<ApiResponse<any>> {
    return this.request(endpoint);
  }

  async post(endpoint: string, data?: any): Promise<ApiResponse<any>> {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export the class for testing or multiple instances
export { ApiClient };
