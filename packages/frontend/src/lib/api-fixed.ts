import { User } from '@/stores/auth-store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

console.log('🔗 API Base URL:', API_BASE_URL)

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

class ApiServiceFixed {
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
    console.log('📡 API Response:', response.status, response.statusText)
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
        console.error('❌ API Error Data:', errorData)
      } catch {
        const errorText = await response.text()
        errorMessage = errorText || errorMessage
        console.error('❌ API Error Text:', errorText)
      }
      
      throw new Error(errorMessage)
    }

    const result: ApiResponse<T> = await response.json()
    console.log('✅ API Success:', result)
    
    if (!result.success) {
      throw new Error(result.error || result.message || 'API request failed')
    }

    return result.data as T
  }

  // Generate message for wallet signing
  async generateMessage(address: string, nonce?: string): Promise<{ message: string; nonce: string }> {
    const endpoint = `${API_BASE_URL}/auth/generate-message`
    const requestBody = { address, nonce }
    
    console.log('📤 Generating message:', { endpoint, requestBody })
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
      })

      return this.handleResponse<{ message: string; nonce: string }>(response)
    } catch (error) {
        console.error('❌ Generate message failed:', error);

        // Narrow the type to Error
        if (error instanceof Error) {
            if (error.message.includes('fetch')) {
            throw new Error('Backend server is not running. Please start it with `pnpm start:dev`');
            }
            if (error.message.includes('CORS')) {
            throw new Error('CORS error. Check your backend CORS configuration.');
            }
        }

        // Handle non-Error cases (optional fallback)
        throw new Error('An unexpected error occurred');
    }
  }

  // Test backend connection
  async testConnection(): Promise<boolean> {
    try {
      const healthUrl = API_BASE_URL.replace('/api', '/health')
      const response = await fetch(healthUrl)
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }
      
      console.log('✅ Backend connection test passed')
      return true
    } catch (error) {
      console.error('❌ Backend connection test failed:', error)
      return false
    }
  }

  // Login with wallet signature
  async login(loginData: LoginRequest): Promise<{ accessToken: string; user: User }> {
    const endpoint = `${API_BASE_URL}/auth/login`
    
    console.log('📤 Logging in:', { endpoint, address: loginData.address })
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(loginData),
    })

    return this.handleResponse<{ accessToken: string; user: User }>(response)
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
  async updateProfile(token: string, profileData: any): Promise<User> {
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
}

// Export singleton instance
export const apiServiceFixed = new ApiServiceFixed()
export default apiServiceFixed
