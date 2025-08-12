// src/hooks/use-auth.ts
import { useEffect, useCallback } from 'react'
import { useAccount, useSignMessage, useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { useAuthStore } from '@/stores/auth-store'
import { apiService } from '@/lib/api'

export interface UseAuthReturn {
  // State
  user: any
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Wallet state
  address: string | undefined
  isConnected: boolean
  
  // Actions
  connectWallet: () => void
  disconnectWallet: () => void
  signInWithWallet: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  
  // Profile management
  updateProfile: (data: any) => Promise<void>
  refreshProfile: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { signMessageAsync, isError: isSignError, error: signError } = useSignMessage()
  const { disconnect } = useDisconnect()

  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: logoutStore,
    updateUser,
    setLoading,
    setError,
    clearError,
  } = useAuthStore()

  // Clear error when sign error occurs
  useEffect(() => {
    if (isSignError && signError) {
      setError(signError.message || 'Signature failed')
    }
  }, [isSignError, signError, setError])

  // Validate token on mount and address change
  useEffect(() => {
    if (token && !user) {
      validateToken()
    }
  }, [token])

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
    if (!open) {
      console.error('AppKit not initialized')
      setError('Wallet connection not available. Please refresh the page.')
      return
    }
    open()
  }, [open, setError])

  const disconnectWallet = useCallback(() => {
    disconnect()
  }, [disconnect])

  const signInWithWallet = useCallback(async () => {
    if (!address) {
      setError('No wallet connected')
      return
    }

    try {
      setLoading(true)
      clearError()

      // Step 1: Generate message to sign
      console.log('🔄 Generating message for signing...')
      const { message, nonce } = await apiService.generateMessage(address)

      // Step 2: Sign the message with wallet
      console.log('✍️ Requesting wallet signature...')
      console.log('📱 Wallet type:', typeof signMessageAsync)
      
      if (!signMessageAsync) {
        throw new Error('Wallet signing is not available')
      }

      let signature: string
      
      try {
        // Try to sign the message
        signature = await signMessageAsync({ 
          message,
          // Add account parameter to ensure we're signing with the connected account
          account: address as `0x${string}`
        })
      } catch (signError) {
        console.error('❌ Signature error:', signError)
        
        // Handle specific wallet signing errors
        if (signError instanceof Error) {
          if (signError.message.includes('User rejected') || signError.message.includes('denied')) {
            throw new Error('Wallet signature was rejected by user')
          } else if (signError.message.includes('not supported') || signError.message.includes('smart contract')) {
            throw new Error('This wallet type does not support message signing. Please try a different wallet like MetaMask.')
          } else {
            throw new Error(`Wallet signing failed: ${signError.message}`)
          }
        }
        throw new Error('Wallet signing failed with unknown error')
      }

      if (!signature) {
        throw new Error('Failed to get signature from wallet')
      }
      
      // Debug: Log signature details
      console.log('📋 Signature Debug Info:')
      console.log('- Type:', typeof signature)
      console.log('- Length:', signature.length)
      console.log('- Starts with 0x:', signature.startsWith('0x'))
      console.log('- First 50 chars:', signature.substring(0, 50))
      console.log('- Expected length: 132 (including 0x)')
      
      // Validate signature format
      if (typeof signature !== 'string') {
        throw new Error(`Invalid signature type: expected string, got ${typeof signature}`)
      }
      
      const cleanSig = signature.startsWith('0x') ? signature.slice(2) : signature
      if (cleanSig.length !== 130) {
        console.warn('⚠️ Unusual signature length detected')
        console.warn('This might indicate a smart contract wallet or signing issue')
        console.warn('Expected: 130 hex chars, Got:', cleanSig.length)
        
        // If signature is way too long, it's likely contract data
        if (cleanSig.length > 200) {
          throw new Error('Invalid signature: appears to be contract call data. Please use a wallet that supports standard message signing (like MetaMask).')
        }
      }


      // Step 3: Authenticate with backend
      console.log('🔐 Authenticating with backend...')
      const authResult = await apiService.login({
        address,
        signature,
        message,
        email: undefined,
      })

      // Step 4: Update auth state
      console.log('✅ Authentication successful!')
      login(authResult.user, authResult.accessToken)

      if (authResult.user.isNewUser) {
        console.log('🎉 Welcome to TracceAqua! Your account has been created.')
      }

    } catch (error) {
      console.error('❌ Authentication failed:', error)
      
      // Handle specific signing errors
      if (error instanceof Error) {
        if (error.message.includes('User rejected') || error.message.includes('denied')) {
          setError('Wallet signature was rejected. Please try again.')
        } else if (error.message.includes('No wallet')) {
          setError('No wallet connected. Please connect your wallet first.')
        } else if (error.message.includes('contract call data') || error.message.includes('smart contract')) {
          setError('This wallet type is not compatible. Please try MetaMask or another standard wallet.')
        } else if (error.message.includes('Invalid signature format')) {
          setError('Signature format error. This might be caused by an incompatible wallet type.')
        } else if (error.message.includes('not support')) {
          setError('This wallet does not support message signing. Please try a different wallet.')
        } else {
          setError(error.message)
        }
      } else {
        setError('Authentication failed. Please try again with a different wallet.')
      }
    } finally {
      setLoading(false)
    }
  }, [address, signMessageAsync, login, setLoading, setError, clearError])



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

  const updateProfile = useCallback(async (profileData: any) => {
    if (!token) {
      setError('Not authenticated')
      return
    }

    try {
      setLoading(true)
      const updatedUser = await apiService.updateProfile(token, profileData)
      updateUser(updatedUser)
      console.log('✅ Profile updated successfully')
    } catch (error) {
      console.error('Profile update failed:', error)
      setError(error instanceof Error ? error.message : 'Profile update failed')
    } finally {
      setLoading(false)
    }
  }, [token, updateUser, setLoading, setError])

  const refreshProfile = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      const updatedUser = await apiService.getProfile(token)
      updateUser(updatedUser)
    } catch (error) {
      console.error('Profile refresh failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to refresh profile')
    } finally {
      setLoading(false)
    }
  }, [token, updateUser, setLoading, setError])

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Wallet state
    address,
    isConnected,
    
    // Actions
    connectWallet,
    disconnectWallet,
    signInWithWallet,
    logout: handleLogout,
    clearError,
    
    // Profile management
    updateProfile,
    refreshProfile,
  }
}

