// src/hooks/use-enhanced-auth.ts
import { useEffect, useCallback } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useAuthStore } from '@/stores/auth-store'
import { apiService } from '@/lib/api'

export interface UseEnhancedAuthReturn {
  // State
  user: any
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Connection state
  address: string | undefined
  isConnected: boolean
  
  // AppKit account info (includes social logins)
  appKitAccount: any
  
  // Actions
  openConnectModal: () => void
  disconnect: (withLogout?: boolean) => Promise<void>
  authenticateUser: () => Promise<void>
  logout: (forceDisconnect?: boolean) => Promise<void>
  switchWallet: () => Promise<void>
  clearError: () => void
}

export function useEnhancedAuth(): UseEnhancedAuthReturn {
  const { open } = useAppKit()
  
  // Wagmi wallet connection
  const { address, isConnected } = useAccount()
  const { disconnect: disconnectWallet } = useDisconnect()
  
  // AppKit account (includes social logins)
  const appKitAccount = useAppKitAccount()

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

  // Auto-authenticate when any connection type is established
  // BUT only if we don't have a different user authenticated
  useEffect(() => {
    const hasWalletConnection = isConnected && address
    const hasSocialConnection = appKitAccount.isConnected && (appKitAccount.address || appKitAccount.caipAddress)
    
    // Get current connected address
    const currentConnectedAddress = address || appKitAccount.address || appKitAccount.caipAddress
    
    // Check if we have a different user authenticated than the connected wallet
    const isDifferentUser = user && currentConnectedAddress && 
                            user.address.toLowerCase() !== currentConnectedAddress.toLowerCase()
    
    if (isDifferentUser) {
      console.log('🔄 Different wallet connected, logging out previous user...')
      logoutStore() // Clear previous user
      return
    }
    
    if ((hasWalletConnection || hasSocialConnection) && !isAuthenticated && !isLoading) {
      console.log('🔗 Auto-authenticating with connected wallet...')
      authenticateUser()
    }
  }, [isConnected, address, appKitAccount.isConnected, appKitAccount.address, appKitAccount.caipAddress, isAuthenticated, isLoading, user, logoutStore])

  // Handle disconnection
  useEffect(() => {
    const hasConnection = isConnected || appKitAccount.isConnected
    if (!hasConnection && isAuthenticated) {
      handleLogout()
    }
  }, [isConnected, appKitAccount.isConnected, isAuthenticated])

  const validateToken = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      const result = await apiService.verifyToken(token)
      
      if (result.valid && result.user) {
        if (!user || user.id !== result.user.id) {
          login(result.user, token)
        }
      } else {
        logoutStore()
      }
    } catch (error) {
      console.error('Token validation failed:', error)
      logoutStore()
    } finally {
      setLoading(false)
    }
  }, [token, user, login, logoutStore, setLoading])

  const openConnectModal = useCallback(() => {
    clearError()
    open()
  }, [open, clearError])

  const authenticateUser = useCallback(async () => {
    try {
      setLoading(true)
      clearError()

      let authAddress: string
      let authEmail: string | undefined

      // Determine authentication method and extract info
      if (isConnected && address) {
        // Wallet-based authentication
        authAddress = address
        console.log('🔗 Authenticating with wallet:', address)
      } else if (appKitAccount.isConnected) {
        // Social/Email authentication via AppKit
        const accountAddress = appKitAccount.address || appKitAccount.caipAddress
        
        if (!accountAddress) {
          throw new Error('No address found in AppKit account')
        }
        
        authAddress = accountAddress
        
        // Try to extract email from AppKit account if available
        // Note: Email extraction depends on AppKit version and connector type
        authEmail = undefined // AppKit may not always expose email
        
        console.log('🔗 Authenticating with AppKit account:', {
          address: authAddress,
          isConnected: appKitAccount.isConnected,
        })
      } else {
        throw new Error('No valid connection found')
      }

      if (!authAddress) {
        throw new Error('No wallet address available for authentication')
      }

      // Simple wallet connection authentication
      const authResult = await apiService.connectWallet(authAddress, authEmail)

      console.log('✅ Authentication successful!')
      login(authResult.user, authResult.accessToken)

      if (authResult.user.isNewUser) {
        console.log('🎉 Welcome to TracceAqua! Your account has been created.')
        
        // For social logins, we might want to update profile with additional info
        if (authEmail) {
          console.log('📧 Email authentication detected, profile may be enhanced')
        }
      } else {
        console.log('👋 Welcome back!')
      }

    } catch (error) {
      console.error('❌ Authentication failed:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid wallet address')) {
          setError('Invalid account. Please check your connection.')
        } else if (error.message.includes('No wallet address')) {
          setError('Unable to get account address. Please reconnect.')
        } else {
          setError(error.message)
        }
      } else {
        setError('Authentication failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, appKitAccount, login, setLoading, setError, clearError])

  const handleLogout = useCallback(async (forceDisconnect = false) => {
    try {
      setLoading(true)
      
      console.log('🔄 Logging out...')
      
      // Notify backend
      if (token) {
        try {
          await apiService.logout(token)
        } catch (error) {
          console.warn('Backend logout failed:', error)
        }
      }
      
      // Clear auth state first
      logoutStore()
      
      // Disconnect wallet connections if requested
      if (forceDisconnect) {
        console.log('🔌 Force disconnecting all connections...')
        
        if (isConnected) {
          try {
            disconnectWallet()
          } catch (error) {
            console.warn('Wallet disconnect failed:', error)
          }
        }
        
        // Try to disconnect AppKit if available
        try {
          // AppKit should disconnect automatically, but we can force it
          if (appKitAccount.isConnected) {
            // The AppKit will handle its own disconnect
            console.log('📱 AppKit will handle disconnect')
          }
        } catch (error) {
          console.warn('AppKit disconnect failed:', error)
        }
      }
      
      console.log('👋 Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      // Always clear local state even if remote logout fails
      logoutStore()
    } finally {
      setLoading(false)
    }
  }, [token, isConnected, disconnectWallet, appKitAccount.isConnected, logoutStore, setLoading])

  const disconnect = useCallback(async (withLogout = true) => {
    if (withLogout) {
      await handleLogout(true) // Force disconnect with logout
    } else {
      // Just disconnect without clearing auth state
      if (isConnected) {
        disconnectWallet()
      }
    }
  }, [isConnected, disconnectWallet, handleLogout])

  const switchWallet = useCallback(async () => {
    console.log('🔄 Switching wallet...')
    
    // First logout and disconnect current wallet
    await handleLogout(true)
    
    // Small delay to ensure disconnection is complete
    setTimeout(() => {
      // Open connect modal for new wallet
      openConnectModal()
    }, 500)
  }, [handleLogout, openConnectModal])

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Connection state
    address,
    isConnected,
    appKitAccount,
    
    // Actions
    openConnectModal,
    disconnect,
    authenticateUser,
    logout: handleLogout,
    switchWallet,
    clearError,
  }
}
