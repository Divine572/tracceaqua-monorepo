export class ApiDebugger {
  static async checkBackendConnection() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
    
    console.log('🔍 Checking backend connection...')
    console.log('API URL:', apiUrl)
    
    try {
      // First, check if backend is running at all
      const healthUrl = apiUrl.replace('/api', '/health')
      console.log('Testing health endpoint:', healthUrl)
      
      const healthResponse = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status} ${healthResponse.statusText}`)
      }
      
      const healthData = await healthResponse.json()
      console.log('✅ Backend health check passed:', healthData)
      
      // Now test the specific auth endpoint
      const authHealthUrl = `${apiUrl}/auth/health`
      console.log('Testing auth health endpoint:', authHealthUrl)
      
      const authHealthResponse = await fetch(authHealthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!authHealthResponse.ok) {
        throw new Error(`Auth health check failed: ${authHealthResponse.status} ${authHealthResponse.statusText}`)
      }
      
      const authHealthData = await authHealthResponse.json()
      console.log('✅ Auth endpoint health check passed:', authHealthData)
      
      return { success: true, healthy: true }
      
    } catch (error) {
      console.error('❌ Backend connection failed:', error)
      
        if (error instanceof Error) {
            // Provide specific guidance based on error
        if (error.message.includes('fetch')) {
            console.log('💡 Suggestion: Make sure your backend is running with `pnpm start:dev`')
        }
        
        return { success: false, error: error.message }
      }
      
    }
  }
  
  static async testGenerateMessage(address: string = '0x1234567890123456789012345678901234567890') {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
    const endpoint = `${apiUrl}/auth/generate-message`
    
    console.log('🧪 Testing generate-message endpoint...')
    console.log('Endpoint:', endpoint)
    console.log('Request body:', { address })
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error text:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ Generate message test passed:', data)
      
      return { success: true, data }
      
    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Generate message test failed:', error.message)
        } else {
            console.error('❌ Generate message test failed with unknown error:', error)
        }
    }
  }
}

// Auto-run debug in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(async () => {
    console.log('🔧 Running API debug checks...')
    await ApiDebugger.checkBackendConnection()
    await ApiDebugger.testGenerateMessage()
  }, 1000)
}