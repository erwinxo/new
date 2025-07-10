const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://studentconnectportalnew.onrender.com';

// Debug: Log the API URL being used
console.log('API_BASE_URL:', API_BASE_URL);

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'An error occurred' }));
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorData
      });
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(response);
  }

  async signup(userData: {
    name: string;
    username: string;
    email: string;
    password: string;
    bio?: string;
  }) {
    console.log('Signup attempt:', {
      url: `${API_BASE_URL}/auth/signup`,
      userData: { ...userData, password: '[HIDDEN]' }
    });
    
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    console.log('Signup response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    return this.handleResponse(response);
  }

  async forgotPassword(email: string) {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return this.handleResponse(response);
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    return this.handleResponse(response);
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateProfile(userData: {
    name?: string;
    username?: string;
    email?: string;
    bio?: string;
    profile_picture?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  // File upload endpoints
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/upload/document`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  // Posts endpoints
  async createPost(postData: {
    type: string;
    title: string;
    content: string;
    tags?: string[];
    company?: string;
    location?: string;
    job_link?: string;
    document_name?: string;
    document_url?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(postData),
    });
    return this.handleResponse(response);
  }

  async getPosts(params: {
    skip?: number;
    limit?: number;
    search?: string;
    category?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    if (params.skip) searchParams.append('skip', params.skip.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.category) searchParams.append('category', params.category);

    const response = await fetch(`${API_BASE_URL}/posts?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async addReply(postId: string, content: string) {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/replies`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    return this.handleResponse(response);
  }

  // User endpoints
  async getUserProfile(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();