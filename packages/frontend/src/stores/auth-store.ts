// // stores/auth-store.ts
// // TracceAqua - Zustand Authentication Store

// stores/auth-store.ts
// Dynamic-first Zustand Authentication Store

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import {
  User,
  UserRole,
  UserProfile,
  AuthStore,
  AuthState,
  AuthActions,
} from "@/lib/types";

// ===== INITIAL STATE =====

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  walletAddress: "",
  lastActivity: null,
  email: "",
  signature: ""
};

// ===== ZUSTAND STORE =====

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        ...initialState,

        // ===== ACTIONS =====

        setUser: (user: User | null) => {
          set(
            () => ({
              user,
              isAuthenticated: !!user,
              walletAddress: user?.address || undefined,
              lastActivity: user ? new Date() : null,
            }),
            false,
            "setUser"
          );
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading }, false, "setLoading");
        },

        setWalletAddress: (address: string | undefined) => {
          set(
            (state) => ({
              walletAddress: address,
              user: state.user
                ? { ...state.user, address: address || state.user.address }
                : null,
            }),
            false,
            "setWalletAddress"
          );
        },

        setEmail: (email: string | undefined) => {
          set(
            (state) => ({
              email: email,
              user: state.user
                ? { ...state.user, email: email || state.user.email }
                : null,
            }),
            false,
            "setEmail"
          );
        },

        setSignature: (signature: string | undefined) => {
          set(
            (state) => ({
              signature: signature,
            }),
            false,
            "setSignature"
          );
        },

        updateUserRole: (role: UserRole) => {
          set(
            (state) => ({
              user: state.user ? { ...state.user, role } : null,
              lastActivity: new Date(),
            }),
            false,
            "updateUserRole"
          );
        },

        updateUserProfile: (profileData: Partial<UserProfile>) => {
          set(
            (state) => {
              if (!state.user) return state;

              const updatedProfile = state.user.profile
                ? { ...state.user.profile, ...profileData }
                : (profileData as UserProfile);

              return {
                user: {
                  ...state.user,
                  profile: updatedProfile,
                },
                lastActivity: new Date(),
              };
            },
            false,
            "updateUserProfile"
          );
        },

        logout: () => {
          set(
            {
              ...initialState,
              isLoading: false,
            },
            false,
            "logout"
          );

          if (typeof window !== "undefined") {
            // clear Dynamic/WalletConnect remnants
            localStorage.removeItem("walletconnect");
            localStorage.removeItem("WALLETCONNECT_DEEPLINK_CHOICE");
            localStorage.removeItem("wc@2:core:0.3//pairing");
            localStorage.removeItem("wc@2:client:0.3//session");

            window.dispatchEvent(new CustomEvent("auth:logout"));
          }
        },

        reset: () => {
          set(initialState, false, "reset");
        },
      }),
      {
        name: "tracceaqua-auth-storage",
        storage: createJSONStorage(() => localStorage),

        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          walletAddress: state.walletAddress,
          lastActivity: state.lastActivity
            ? state.lastActivity.toISOString()
            : null,
          email: state.email
        }),

        version: 2, // bumped since we dropped sessionId

        migrate: (persistedState: any, version: number) => {
          if (version < 2) {
            const { sessionId, ...rest } = persistedState;
            return { ...rest, lastActivity: null };
          }
          return persistedState;
        },

        merge: (persistedState, currentState) => {
          if (typeof persistedState !== "object" || persistedState === null) {
            return { ...currentState, isLoading: false };
          }
          return { ...currentState, ...persistedState, isLoading: false };
        },
      }
    ),
    {
      name: "tracceaqua-auth-store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

// ===== SELECTORS =====
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useUser = () => useAuthStore((state) => state.user);
export const useWalletAddress = () =>
  useAuthStore((state) => state.walletAddress);

// Role-based checks
export const useUserRole = () => useAuthStore((state) => state.user?.role);
export const useIsAdmin = () =>
  useAuthStore((state) => state.user?.role === UserRole.ADMIN);

// ===== UTILITIES =====
export const resetAuthStore = () => {
  useAuthStore.getState().reset();
};
export const getAuthSnapshot = () => useAuthStore.getState();
export const updateLastActivity = () => {
  useAuthStore.setState({ lastActivity: new Date() });
};

// ===== AUTO-LOGOUT MIDDLEWARE =====
export const autoLogoutMiddleware = () => {
  const checkSessionExpiry = () => {
    const state = useAuthStore.getState();
    if (state.isAuthenticated && state.lastActivity) {
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const now = Date.now();
      const last = new Date(state.lastActivity).getTime();
      if (now - last > twentyFourHours) {
        console.log("Session expired - auto logout");
        state.logout();
      }
    }
  };
  if (typeof window !== "undefined") {
    setInterval(checkSessionExpiry, 5 * 60 * 1000);
  }
};
if (typeof window !== "undefined") autoLogoutMiddleware();

export default useAuthStore;






// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
// import { devtools } from "zustand/middleware";
// import {
//   User,
//   UserRole,
//   UserProfile,
//   AuthStore,
//   AuthState,
//   AuthActions,
// } from "@/lib/types";

// // ===== INITIAL STATE =====

// const initialState: AuthState = {
//   user: null,
//   isLoading: false,
//   isAuthenticated: false,
//   walletAddress: null,
//   sessionId: null,
//   lastActivity: null,
// };

// // ===== ZUSTAND STORE =====

// export const useAuthStore = create<AuthStore>()(
//   devtools(
//     persist(
//       (set, get) => ({
//         // State
//         ...initialState,

//         // Actions
//         setUser: (user: User | null) => {
//           set(
//             (state) => ({
//               user,
//               isAuthenticated: !!user,
//               walletAddress: user?.address || state.walletAddress,
//               lastActivity: user ? new Date() : null,
//             }),
//             false,
//             "setUser"
//           );
//         },

//         setLoading: (loading: boolean) => {
//           set({ isLoading: loading }, false, "setLoading");
//         },

//         setWalletAddress: (address: string | null) => {
//           set(
//             (state) => ({
//               walletAddress: address,
//               // Update user address if user exists
//               user: state.user
//                 ? { ...state.user, address: address || state.user.address }
//                 : null,
//             }),
//             false,
//             "setWalletAddress"
//           );
//         },

//         setSessionId: (sessionId: string | null) => {
//           set({ sessionId }, false, "setSessionId");
//         },

//         updateUserRole: (role: UserRole) => {
//           set(
//             (state) => ({
//               user: state.user ? { ...state.user, role } : null,
//               lastActivity: new Date(),
//             }),
//             false,
//             "updateUserRole"
//           );
//         },

//         updateUserProfile: (profileData: Partial<UserProfile>) => {
//           set(
//             (state) => {
//               if (!state.user) return state;

//               const updatedProfile = state.user.profile
//                 ? { ...state.user.profile, ...profileData }
//                 : (profileData as UserProfile);

//               return {
//                 user: {
//                   ...state.user,
//                   profile: updatedProfile,
//                 },
//                 lastActivity: new Date(),
//               };
//             },
//             false,
//             "updateUserProfile"
//           );
//         },

//         logout: () => {
//           set(
//             {
//               user: null,
//               isAuthenticated: false,
//               walletAddress: null,
//               sessionId: null,
//               lastActivity: null,
//               isLoading: false,
//             },
//             false,
//             "logout"
//           );

//           // Clear localStorage items that shouldn't persist
//           if (typeof window !== "undefined") {
//             localStorage.removeItem("walletconnect");
//             localStorage.removeItem("WALLETCONNECT_DEEPLINK_CHOICE");
//             localStorage.removeItem("wc@2:core:0.3//pairing");
//             localStorage.removeItem("wc@2:client:0.3//session");

//             // Dispatch custom event for other components to listen
//             window.dispatchEvent(new CustomEvent("auth:logout"));
//           }
//         },

//         reset: () => {
//           set(initialState, false, "reset");
//         },
//       }),
//       {
//         name: "tracceaqua-auth-storage",
//         storage: createJSONStorage(() => localStorage),

//         // Persist configuration
//         partialize: (state) => ({
//           user: state.user,
//           isAuthenticated: state.isAuthenticated,
//           walletAddress: state.walletAddress,
//           sessionId: state.sessionId,
//           lastActivity: state.lastActivity
//             ? state.lastActivity.toISOString()
//             : null,
//           // Note: isLoading is not persisted intentionally
//         }),

//         // Version for migration support
//         version: 1,

//         // Migrate function for handling version changes
//         migrate: (persistedState: any, version: number) => {
//           if (version === 0) {
//             // Migration from version 0 to 1
//             // Handle any breaking changes here
//             return {
//               ...persistedState,
//               // Add any new fields with default values
//               sessionId: null,
//               lastActivity: null,
//             };
//           }
//           return persistedState;
//         },

//         // Merge function for handling state restoration
//         merge: (persistedState, currentState) => {
//           if (typeof persistedState !== "object" || persistedState === null) {
//             return {
//               ...currentState,
//               isLoading: false,
//             };
//           }
//           return {
//             ...currentState,
//             ...persistedState,
//             // Always start with loading false when rehydrating
//             isLoading: false,
//           };
//         },
//       }
//     ),
//     {
//       name: "tracceaqua-auth-store",
//       enabled: process.env.NODE_ENV === "development",
//     }
//   )
// );

// // ===== SELECTORS =====

// // Auth status selectors
// export const useIsAuthenticated = () =>
//   useAuthStore((state) => state.isAuthenticated);
// export const useIsLoading = () => useAuthStore((state) => state.isLoading);
// export const useUser = () => useAuthStore((state) => state.user);
// export const useWalletAddress = () =>
//   useAuthStore((state) => state.walletAddress);

// // User role selectors
// export const useUserRole = () => useAuthStore((state) => state.user?.role);
// export const useUserStatus = () => useAuthStore((state) => state.user?.status);
// export const useUserProfile = () =>
//   useAuthStore((state) => state.user?.profile);

// // Permission selectors
// export const useIsAdmin = () =>
//   useAuthStore((state) => state.user?.role === UserRole.ADMIN);
// export const useIsResearcher = () =>
//   useAuthStore((state) => state.user?.role === UserRole.RESEARCHER);
// export const useIsFisherman = () =>
//   useAuthStore((state) => state.user?.role === UserRole.FISHERMAN);
// export const useIsProcessor = () =>
//   useAuthStore((state) => state.user?.role === UserRole.PROCESSOR);
// export const useIsTrader = () =>
//   useAuthStore((state) => state.user?.role === UserRole.TRADER);
// export const useIsRetailer = () =>
//   useAuthStore((state) => state.user?.role === UserRole.RETAILER);
// export const useIsConsumer = () =>
//   useAuthStore((state) => state.user?.role === UserRole.CONSUMER);

// // Combined permission checks
// export const useCanCreateRecords = () =>
//   useAuthStore((state) => {
//     const role = state.user?.role;
//     return (
//       role &&
//       [
//         UserRole.FISHERMAN,
//         UserRole.FARMER,
//         UserRole.PROCESSOR,
//         UserRole.TRADER,
//         UserRole.RETAILER,
//         UserRole.ADMIN,
//       ].includes(role)
//     );
//   });

// export const useCanVerifyRecords = () =>
//   useAuthStore((state) => {
//     const role = state.user?.role;
//     return role && [UserRole.ADMIN, UserRole.RESEARCHER].includes(role);
//   });

// export const useCanManageUsers = () =>
//   useAuthStore((state) => {
//     return state.user?.role === UserRole.ADMIN;
//   });

// export const useCanViewAnalytics = () =>
//   useAuthStore((state) => {
//     const role = state.user?.role;
//     return (
//       role &&
//       [
//         UserRole.ADMIN,
//         UserRole.RESEARCHER,
//         UserRole.PROCESSOR,
//         UserRole.TRADER,
//       ].includes(role)
//     );
//   });

// // ===== HELPER HOOKS =====

// // Get display name for user
// export const useUserDisplayName = () =>
//   useAuthStore((state) => {
//     if (!state.user) return null;

//     const profile = state.user.profile;
//     if (profile?.firstName && profile?.lastName) {
//       return `${profile.firstName} ${profile.lastName}`;
//     }

//     if (profile?.firstName) {
//       return profile.firstName;
//     }

//     if (state.user.email) {
//       return state.user.email.split("@")[0];
//     }

//     if (state.user.address) {
//       return `${state.user.address.slice(0, 6)}...${state.user.address.slice(-4)}`;
//     }

//     return "Unknown User";
//   });

// // Check if session is expired (24 hours)
// export const useIsSessionExpired = () =>
//   useAuthStore((state) => {
//     if (!state.lastActivity) return false;

//     const twentyFourHours = 24 * 60 * 60 * 1000;
//     const now = new Date().getTime();
//     const lastActivity = new Date(state.lastActivity).getTime();

//     return now - lastActivity > twentyFourHours;
//   });

// // Get time since last activity
// export const useTimeSinceLastActivity = () =>
//   useAuthStore((state) => {
//     if (!state.lastActivity) return null;

//     const now = new Date();
//     const lastActivity = new Date(state.lastActivity);
//     const diffInMs = now.getTime() - lastActivity.getTime();

//     const minutes = Math.floor(diffInMs / (1000 * 60));
//     const hours = Math.floor(minutes / 60);
//     const days = Math.floor(hours / 24);

//     if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
//     if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
//     if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

//     return "Just now";
//   });

// // ===== STORE UTILITIES =====

// // Reset store to initial state (useful for testing)
// export const resetAuthStore = () => {
//   useAuthStore.getState().reset();
// };

// // Get current auth state snapshot
// export const getAuthSnapshot = () => {
//   const state = useAuthStore.getState();
//   return {
//     user: state.user,
//     isAuthenticated: state.isAuthenticated,
//     isLoading: state.isLoading,
//     walletAddress: state.walletAddress,
//     sessionId: state.sessionId,
//     lastActivity: state.lastActivity,
//   };
// };

// // Update last activity timestamp
// export const updateLastActivity = () => {
//   useAuthStore.setState((state) => ({
//     lastActivity: new Date(),
//   }));
// };

// // ===== DEVTOOLS ACTIONS =====

// // For debugging in development
// if (process.env.NODE_ENV === "development") {
//   // Add store to window for debugging
//   if (typeof window !== "undefined") {
//     (window as any).authStore = useAuthStore;
//   }
// }

// // ===== TYPE EXPORTS =====

// export type AuthStoreType = typeof useAuthStore;

// // ===== VALIDATION HELPERS =====

// export const validateUser = (user: any): user is User => {
//   return (
//     user &&
//     typeof user.id === "string" &&
//     typeof user.address === "string" &&
//     Object.values(UserRole).includes(user.role) &&
//     typeof user.createdAt !== "undefined"
//   );
// };

// export const validateWalletAddress = (address: string): boolean => {
//   // Basic Ethereum address validation
//   return /^0x[a-fA-F0-9]{40}$/.test(address);
// };

// // ===== MIDDLEWARE ACTIONS =====

// // Custom middleware for auto-logout on session expiry
// export const autoLogoutMiddleware = () => {
//   const checkSessionExpiry = () => {
//     const state = useAuthStore.getState();

//     if (state.isAuthenticated && state.lastActivity) {
//       const twentyFourHours = 24 * 60 * 60 * 1000;
//       const now = new Date().getTime();
//       const lastActivity = new Date(state.lastActivity).getTime();

//       if (now - lastActivity > twentyFourHours) {
//         console.log("Session expired - auto logout");
//         state.logout();
//       }
//     }
//   };

//   // Check every 5 minutes
//   if (typeof window !== "undefined") {
//     setInterval(checkSessionExpiry, 5 * 60 * 1000);
//   }
// };

// // Initialize auto-logout middleware
// if (typeof window !== "undefined") {
//   autoLogoutMiddleware();
// }

// export default useAuthStore;