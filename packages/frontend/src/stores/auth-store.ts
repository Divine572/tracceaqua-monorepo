import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types for user and auth state
export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  phoneNumber?: string;
  organization?: string;
  profileImage?: string;
}

export interface User {
  id: string;
  address: string;
  email?: string;
  role:
    | "ADMIN"
    | "RESEARCHER"
    | "FARMER"
    | "FISHERMAN"
    | "PROCESSOR"
    | "TRADER"
    | "RETAILER"
    | "CONSUMER"
    | "PENDING_UPGRADE";
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "REJECTED";
  profile?: UserProfile;
  isNewUser?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
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
      _hasHydrated: false,

      // Actions
      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },
    }),
    {
      name: "tracceaqua-auth",
      // Only persist essential data
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Handle hydration
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Auth store hydration error:", error);
          // If hydration fails entirely, stop loading
          useAuthStore.getState().setLoading(false);
        } else {
          console.log("Auth store rehydration started.");
        }
        return (state: AuthState, error: string) => {
          if (error) {
            console.error("Auth store rehydration callback error:", error); // If error, stop loading
          }
          // Crucial: Set hasHydrated to true only AFTER the persisted state
          // has been merged into the store.
          useAuthStore.getState().setHasHydrated(true);
          console.log("Auth store has hydrated.");
          // Do NOT set isLoading: false here. That logic belongs in useAuth,
          // which has the full picture (wagmi status, API calls).
        };
        // if (error) {
        //   console.error('Auth store hydration error:', error)
        // } else if (state?.token) {
        //   // Validate token on rehydration
        //   // This will be called by our auth hook
        //   console.log('Auth store rehydrated successfully')
        // }

        // useAuthStore.getState().setHasHydrated(true)

        // if (!state?.token) {
        //   useAuthStore.getState().setLoading(false)
        // }
      },
    }
  )
);

// Selectors for easy access to specific state parts
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthToken = () => useAuthStore((state) => state.token);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAuthHasHydrated = () =>
  useAuthStore((state) => state._hasHydrated);
