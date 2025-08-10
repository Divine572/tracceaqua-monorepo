const checkBackend = async () => {
  try {
    const response = await fetch('http://localhost:3001/health')
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Backend is running:', data)
    } else {
      console.log('❌ Backend returned error:', response.status)
    }
  } catch (error) {
    console.log('❌ Backend is not running:', error.message)
    console.log('💡 Start it with: cd packages/backend && pnpm start:dev')
  }
}

if (typeof window === 'undefined') {
  checkBackend()
}