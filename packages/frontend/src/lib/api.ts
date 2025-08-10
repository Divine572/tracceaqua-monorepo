import { User } from '@/stores/auth-store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// API Response wrapper
interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  timestamp: string
}

// Request types
interface GenerateMessageRequest {
  address: string
  nonce?: string
}

interface LoginRequest {
  address: string
  signature: string
  message: string
  email?: string
}



interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  bio?: string
  location?: string
  website?: string
  phoneNumber?: string
  organization?: string
}

// Response types
interface GenerateMessageResponse {
  message: string
  nonce: string
}

interface AuthResponse {
  accessToken: string
  user: User
}

class ApiService {
  private getHeaders(includeAuth = false, token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (includeAuth && token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const result: ApiResponse<T> = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || result.message || 'API request failed')
    }

    return result.data as T
  }

  // Generate message for wallet signing
  async generateMessage(address: string, nonce?: string): Promise<GenerateMessageResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/generate-message`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ address, nonce } as GenerateMessageRequest),
    })

    return this.handleResponse<GenerateMessageResponse>(response)
  }

  // Simple wallet connection (no signature required)
  async connectWallet(address: string, email?: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/connect-wallet`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ address, email }),
    })

    return this.handleResponse<AuthResponse>(response)
  }

  // Login with wallet signature (legacy method)
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(loginData),
    })

    return this.handleResponse<AuthResponse>(response)
  }

  // Get user profile
  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: this.getHeaders(true, token),
    })

    return this.handleResponse<User>(response)
  }

  // Update user profile
  async updateProfile(token: string, profileData: UpdateProfileRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(true, token),
      body: JSON.stringify(profileData),
    })

    return this.handleResponse<User>(response)
  }

  // Verify token
  async verifyToken(token: string): Promise<{ valid: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ token }),
      })

      return this.handleResponse<{ valid: boolean; user?: User; error?: string }>(response)
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Token verification failed',
      }
    }
  }

  // Logout (client-side + optional server notification)
  async logout(token?: string): Promise<void> {
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getHeaders(true, token),
        })
      } catch (error) {
        // Logout can still succeed client-side even if server call fails
        console.warn('Server logout failed:', error)
      }
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/health`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    return this.handleResponse<{ status: string; timestamp: string }>(response)
  }

  // Admin endpoints (for later phases)
  async getUsers(token: string, params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const url = `${API_BASE_URL}/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(true, token),
    })

    return this.handleResponse(response)
  }

  async getUserStats(token: string) {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      method: 'GET',
      headers: this.getHeaders(true, token),
    })

    return this.handleResponse(response)
  }
}

// Export singleton instance
export const apiService = new ApiService()
export default apiService