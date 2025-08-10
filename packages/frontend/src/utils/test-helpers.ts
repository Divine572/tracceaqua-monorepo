export class TestHelpers {
  // Test wallet connection
  static async testWalletConnection() {
    try {
      if (typeof window === 'undefined') return false
      
      // Check if WalletConnect is available
      const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
      if (!projectId) {
        throw new Error('WalletConnect Project ID not configured')
      }

      console.log('✅ WalletConnect Project ID configured')
      return true
    } catch (error) {
      console.error('❌ Wallet connection test failed:', error)
      return false
    }
  }

  // Test API connection
  static async testAPIConnection() {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const response = await fetch(`${apiUrl}/../health`)
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ API connection successful:', data)
      return true
    } catch (error) {
      console.error('❌ API connection test failed:', error)
      return false
    }
  }

  // Test local storage
  static testLocalStorage() {
    try {
      const testKey = 'tracceaqua-test'
      const testValue = 'test-value'
      
      localStorage.setItem(testKey, testValue)
      const retrieved = localStorage.getItem(testKey)
      localStorage.removeItem(testKey)
      
      if (retrieved !== testValue) {
        throw new Error('Local storage read/write mismatch')
      }

      console.log('✅ Local storage working')
      return true
    } catch (error) {
      console.error('❌ Local storage test failed:', error)
      return false
    }
  }

  // Run all tests
  static async runAllTests() {
    console.log('🧪 Running TracceAqua frontend tests...')
    
    const results = {
      walletConnect: await this.testWalletConnection(),
      apiConnection: await this.testAPIConnection(),
      localStorage: this.testLocalStorage(),
    }

    const allPassed = Object.values(results).every(Boolean)
    
    console.log('\n📊 Test Results:')
    console.log('WalletConnect:', results.walletConnect ? '✅' : '❌')
    console.log('API Connection:', results.apiConnection ? '✅' : '❌')
    console.log('Local Storage:', results.localStorage ? '✅' : '❌')
    console.log('\nOverall:', allPassed ? '✅ All tests passed!' : '❌ Some tests failed')
    
    return results
  }
}

// Auto-run tests in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Run tests after a short delay to let the app initialize
  setTimeout(() => {
    TestHelpers.runAllTests()
  }, 2000)
}
