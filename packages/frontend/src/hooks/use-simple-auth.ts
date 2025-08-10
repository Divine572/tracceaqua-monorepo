// src/hooks/use-simple-auth.ts
import { useEffect, useCallback } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { useAuthStore } from '@/stores/auth-store'
import { apiService } from '@/lib/api'

export interface UseSimpleAuthReturn {
  // State
  user: any
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Wallet state
  address: string | undefined
  isConnected: boolean
  
  // Actions
  connectWallet: () => void
  disconnectWallet: () => void
  authenticateWithWallet: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export function useSimpleAuth(): UseSimpleAuthReturn {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: logoutStore,
    setLoading,
    setError,
    clearError,
  } = useAuthStore()

  // Validate token on mount
  useEffect(() => {
    if (token && !user) {
      validateToken()
    }
  }, [token])

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (isConnected && address && !isAuthenticated && !isLoading) {
      authenticateWithWallet()
    }
  }, [isConnected, address, isAuthenticated, isLoading])

  // Handle wallet disconnection
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      handleLogout()
    }
  }, [isConnected, isAuthenticated])

  const validateToken = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      const result = await apiService.verifyToken(token)
      
      if (result.valid && result.user) {
        // Token is valid, update user if needed
        if (!user || user.id !== result.user.id) {
          login(result.user, token)
        }
      } else {
        // Token is invalid, logout
        logoutStore()
      }
    } catch (error) {
      console.error('Token validation failed:', error)
      logoutStore()
    } finally {
      setLoading(false)
    }
  }, [token, user, login, logoutStore, setLoading])

  const connectWallet = useCallback(() => {
    clearError()
    open()
  }, [open, clearError])

  const disconnectWallet = useCallback(() => {
    disconnect()
  }, [disconnect])

  const authenticateWithWallet = useCallback(async () => {
    if (!address) {
      setError('No wallet connected')
      return
    }

    try {
      setLoading(true)
      clearError()

      console.log('🔗 Authenticating wallet:', address)

      // Simple wallet connection - no signature required!
      const authResult = await apiService.connectWallet(address)

      console.log('✅ Wallet authentication successful!')
      login(authResult.user, authResult.accessToken)

      if (authResult.user.isNewUser) {
        console.log('🎉 Welcome to TracceAqua! Your account has been created.')
      } else {
        console.log('👋 Welcome back!')
      }

    } catch (error) {
      console.error('❌ Wallet authentication failed:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid wallet address')) {
          setError('Invalid wallet address. Please check your wallet connection.')
        } else {
          setError(error.message)
        }
      } else {
        setError('Authentication failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [address, login, setLoading, setError, clearError])

  const handleLogout = useCallback(async () => {
    try {
      setLoading(true)
      
      // Notify backend (optional)
      if (token) {
        await apiService.logout(token)
      }
      
      // Clear auth state
      logoutStore()
      
      // Disconnect wallet
      if (isConnected) {
        disconnect()
      }
      
      console.log('👋 Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state even if server logout fails
      logoutStore()
    } finally {
      setLoading(false)
    }
  }, [token, isConnected, disconnect, logoutStore, setLoading])

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Wallet state
    address,
    isConnected,
    
    // Actions
    connectWallet,
    disconnectWallet,
    authenticateWithWallet,
    logout: handleLogout,
    clearError,
  }
}
