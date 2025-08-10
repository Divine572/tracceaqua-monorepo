import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types for user and auth state
export interface UserProfile {
  id: string
  userId: string
  firstName?: string
  lastName?: string
  bio?: string
  location?: string
  website?: string
  phoneNumber?: string
  organization?: string
  profileImage?: string
}

export interface User {
  id: string
  address: string
  email?: string
  role: 'ADMIN' | 'RESEARCHER' | 'FARMER' | 'FISHERMAN' | 'PROCESSOR' | 'TRADER' | 'RETAILER' | 'CONSUMER' | 'PENDING_UPGRADE'
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED'
  profile?: UserProfile
  isNewUser?: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  // State
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'tracceaqua-auth',
      // Only persist essential data
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Handle hydration
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Auth store hydration error:', error)
        } else if (state?.token) {
          // Validate token on rehydration
          // This will be called by our auth hook
          console.log('Auth store rehydrated successfully')
        }
      },
    }
  )
)

// Selectors for easy access to specific state parts
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthToken = () => useAuthStore((state) => state.token)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)