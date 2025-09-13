// stores/ui-store.ts
// TracceAqua - Zustand UI State Management Store

import { useEffect } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { persist, createJSONStorage } from "zustand/middleware";

// ===== UI STATE TYPES =====

export interface UIState {
  // Mobile Menu
  mobileMenuOpen: boolean;

  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Modals
  loginModalOpen: boolean;
  profileModalOpen: boolean;
  roleApplicationModalOpen: boolean;
  recordModalOpen: boolean;
  confirmationModalOpen: boolean;

  // Loading States
  globalLoading: boolean;
  pageLoading: boolean;
  buttonLoading: Record<string, boolean>;

  // Theme & Display
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  reducedMotion: boolean;

  // Notifications
  showNotifications: boolean;
  notificationBadgeCount: number;

  // QR Scanner
  qrScannerOpen: boolean;
  cameraPermissionGranted: boolean;

  // Search & Filters
  searchOpen: boolean;
  filtersPanelOpen: boolean;
  activeFilters: Record<string, any>;

  // Data Table
  selectedItems: string[];
  bulkActionsOpen: boolean;

  // Layout
  headerHeight: number;
  footerHeight: number;
  contentPadding: number;

  // Tour & Onboarding
  showOnboarding: boolean;
  currentOnboardingStep: number;
  completedTutorials: string[];

  // Responsive
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}

export interface UIActions {
  // Mobile Menu Actions
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;

  // Sidebar Actions
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;

  // Modal Actions
  setLoginModalOpen: (open: boolean) => void;
  setProfileModalOpen: (open: boolean) => void;
  setRoleApplicationModalOpen: (open: boolean) => void;
  setRecordModalOpen: (open: boolean) => void;
  setConfirmationModalOpen: (open: boolean) => void;
  closeAllModals: () => void;

  // Loading Actions
  setGlobalLoading: (loading: boolean) => void;
  setPageLoading: (loading: boolean) => void;
  setButtonLoading: (id: string, loading: boolean) => void;
  clearButtonLoading: () => void;

  // Theme Actions
  setTheme: (theme: "light" | "dark" | "system") => void;
  setFontSize: (size: "small" | "medium" | "large") => void;
  setReducedMotion: (reduced: boolean) => void;

  // Notification Actions
  setShowNotifications: (show: boolean) => void;
  setNotificationBadgeCount: (count: number) => void;
  incrementNotificationCount: () => void;
  decrementNotificationCount: () => void;
  clearNotificationCount: () => void;

  // QR Scanner Actions
  setQrScannerOpen: (open: boolean) => void;
  setCameraPermissionGranted: (granted: boolean) => void;

  // Search & Filter Actions
  setSearchOpen: (open: boolean) => void;
  setFiltersPanelOpen: (open: boolean) => void;
  setActiveFilters: (filters: Record<string, any>) => void;
  updateFilter: (key: string, value: any) => void;
  clearFilters: () => void;

  // Data Table Actions
  setSelectedItems: (items: string[]) => void;
  addSelectedItem: (id: string) => void;
  removeSelectedItem: (id: string) => void;
  toggleSelectedItem: (id: string) => void;
  clearSelection: () => void;
  setBulkActionsOpen: (open: boolean) => void;

  // Layout Actions
  setHeaderHeight: (height: number) => void;
  setFooterHeight: (height: number) => void;
  setContentPadding: (padding: number) => void;

  // Onboarding Actions
  setShowOnboarding: (show: boolean) => void;
  setCurrentOnboardingStep: (step: number) => void;
  nextOnboardingStep: () => void;
  previousOnboardingStep: () => void;
  completeOnboarding: () => void;
  addCompletedTutorial: (tutorialId: string) => void;

  // Responsive Actions
  setScreenDimensions: (width: number, height: number) => void;
  updateResponsiveState: () => void;

  // Utility Actions
  reset: () => void;
  resetModals: () => void;
  resetLoading: () => void;
}

export type UIStore = UIState & UIActions;

// ===== INITIAL STATE =====

const initialState: UIState = {
  // Mobile Menu
  mobileMenuOpen: false,

  // Sidebar
  sidebarOpen: true,
  sidebarCollapsed: false,

  // Modals
  loginModalOpen: false,
  profileModalOpen: false,
  roleApplicationModalOpen: false,
  recordModalOpen: false,
  confirmationModalOpen: false,

  // Loading States
  globalLoading: false,
  pageLoading: false,
  buttonLoading: {},

  // Theme & Display
  theme: "system",
  fontSize: "medium",
  reducedMotion: false,

  // Notifications
  showNotifications: false,
  notificationBadgeCount: 0,

  // QR Scanner
  qrScannerOpen: false,
  cameraPermissionGranted: false,

  // Search & Filters
  searchOpen: false,
  filtersPanelOpen: false,
  activeFilters: {},

  // Data Table
  selectedItems: [],
  bulkActionsOpen: false,

  // Layout
  headerHeight: 64,
  footerHeight: 80,
  contentPadding: 24,

  // Tour & Onboarding
  showOnboarding: false,
  currentOnboardingStep: 0,
  completedTutorials: [],

  // Responsive
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  screenWidth: 1920,
  screenHeight: 1080,
};

// ===== ZUSTAND STORE =====

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        ...initialState,

        // Mobile Menu Actions
        setMobileMenuOpen: (open: boolean) => {
          set({ mobileMenuOpen: open }, false, "setMobileMenuOpen");
        },

        toggleMobileMenu: () => {
          set(
            (state) => ({ mobileMenuOpen: !state.mobileMenuOpen }),
            false,
            "toggleMobileMenu"
          );
        },

        closeMobileMenu: () => {
          set({ mobileMenuOpen: false }, false, "closeMobileMenu");
        },

        // Sidebar Actions
        setSidebarOpen: (open: boolean) => {
          set({ sidebarOpen: open }, false, "setSidebarOpen");
        },

        setSidebarCollapsed: (collapsed: boolean) => {
          set({ sidebarCollapsed: collapsed }, false, "setSidebarCollapsed");
        },

        toggleSidebar: () => {
          set(
            (state) => ({ sidebarOpen: !state.sidebarOpen }),
            false,
            "toggleSidebar"
          );
        },

        toggleSidebarCollapsed: () => {
          set(
            (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
            false,
            "toggleSidebarCollapsed"
          );
        },

        // Modal Actions
        setLoginModalOpen: (open: boolean) => {
          set({ loginModalOpen: open }, false, "setLoginModalOpen");
        },

        setProfileModalOpen: (open: boolean) => {
          set({ profileModalOpen: open }, false, "setProfileModalOpen");
        },

        setRoleApplicationModalOpen: (open: boolean) => {
          set(
            { roleApplicationModalOpen: open },
            false,
            "setRoleApplicationModalOpen"
          );
        },

        setRecordModalOpen: (open: boolean) => {
          set({ recordModalOpen: open }, false, "setRecordModalOpen");
        },

        setConfirmationModalOpen: (open: boolean) => {
          set(
            { confirmationModalOpen: open },
            false,
            "setConfirmationModalOpen"
          );
        },

        closeAllModals: () => {
          set(
            {
              loginModalOpen: false,
              profileModalOpen: false,
              roleApplicationModalOpen: false,
              recordModalOpen: false,
              confirmationModalOpen: false,
              qrScannerOpen: false,
              searchOpen: false,
              filtersPanelOpen: false,
              bulkActionsOpen: false,
            },
            false,
            "closeAllModals"
          );
        },

        // Loading Actions
        setGlobalLoading: (loading: boolean) => {
          set({ globalLoading: loading }, false, "setGlobalLoading");
        },

        setPageLoading: (loading: boolean) => {
          set({ pageLoading: loading }, false, "setPageLoading");
        },

        setButtonLoading: (id: string, loading: boolean) => {
          set(
            (state) => ({
              buttonLoading: {
                ...state.buttonLoading,
                [id]: loading,
              },
            }),
            false,
            "setButtonLoading"
          );
        },

        clearButtonLoading: () => {
          set({ buttonLoading: {} }, false, "clearButtonLoading");
        },

        // Theme Actions
        setTheme: (theme: "light" | "dark" | "system") => {
          set({ theme }, false, "setTheme");

          // Apply theme to document
          if (typeof window !== "undefined") {
            const root = window.document.documentElement;

            if (theme === "system") {
              const systemTheme = window.matchMedia(
                "(prefers-color-scheme: dark)"
              ).matches
                ? "dark"
                : "light";
              root.classList.toggle("dark", systemTheme === "dark");
            } else {
              root.classList.toggle("dark", theme === "dark");
            }
          }
        },

        setFontSize: (size: "small" | "medium" | "large") => {
          set({ fontSize: size }, false, "setFontSize");

          // Apply font size to document
          if (typeof window !== "undefined") {
            const root = window.document.documentElement;
            root.classList.remove("text-sm", "text-base", "text-lg");

            switch (size) {
              case "small":
                root.classList.add("text-sm");
                break;
              case "large":
                root.classList.add("text-lg");
                break;
              default:
                root.classList.add("text-base");
            }
          }
        },

        setReducedMotion: (reduced: boolean) => {
          set({ reducedMotion: reduced }, false, "setReducedMotion");

          // Apply reduced motion preference
          if (typeof window !== "undefined") {
            const root = window.document.documentElement;
            root.classList.toggle("reduce-motion", reduced);
          }
        },

        // Notification Actions
        setShowNotifications: (show: boolean) => {
          set({ showNotifications: show }, false, "setShowNotifications");
        },

        setNotificationBadgeCount: (count: number) => {
          set(
            { notificationBadgeCount: Math.max(0, count) },
            false,
            "setNotificationBadgeCount"
          );
        },

        incrementNotificationCount: () => {
          set(
            (state) => ({
              notificationBadgeCount: state.notificationBadgeCount + 1,
            }),
            false,
            "incrementNotificationCount"
          );
        },

        decrementNotificationCount: () => {
          set(
            (state) => ({
              notificationBadgeCount: Math.max(
                0,
                state.notificationBadgeCount - 1
              ),
            }),
            false,
            "decrementNotificationCount"
          );
        },

        clearNotificationCount: () => {
          set({ notificationBadgeCount: 0 }, false, "clearNotificationCount");
        },

        // QR Scanner Actions
        setQrScannerOpen: (open: boolean) => {
          set({ qrScannerOpen: open }, false, "setQrScannerOpen");
        },

        setCameraPermissionGranted: (granted: boolean) => {
          set(
            { cameraPermissionGranted: granted },
            false,
            "setCameraPermissionGranted"
          );
        },

        // Search & Filter Actions
        setSearchOpen: (open: boolean) => {
          set({ searchOpen: open }, false, "setSearchOpen");
        },

        setFiltersPanelOpen: (open: boolean) => {
          set({ filtersPanelOpen: open }, false, "setFiltersPanelOpen");
        },

        setActiveFilters: (filters: Record<string, any>) => {
          set({ activeFilters: filters }, false, "setActiveFilters");
        },

        updateFilter: (key: string, value: any) => {
          set(
            (state) => ({
              activeFilters: {
                ...state.activeFilters,
                [key]: value,
              },
            }),
            false,
            "updateFilter"
          );
        },

        clearFilters: () => {
          set({ activeFilters: {} }, false, "clearFilters");
        },

        // Data Table Actions
        setSelectedItems: (items: string[]) => {
          set({ selectedItems: items }, false, "setSelectedItems");
        },

        addSelectedItem: (id: string) => {
          set(
            (state) => ({
              selectedItems: [...new Set([...state.selectedItems, id])],
            }),
            false,
            "addSelectedItem"
          );
        },

        removeSelectedItem: (id: string) => {
          set(
            (state) => ({
              selectedItems: state.selectedItems.filter((item) => item !== id),
            }),
            false,
            "removeSelectedItem"
          );
        },

        toggleSelectedItem: (id: string) => {
          set(
            (state) => {
              const isSelected = state.selectedItems.includes(id);
              return {
                selectedItems: isSelected
                  ? state.selectedItems.filter((item) => item !== id)
                  : [...state.selectedItems, id],
              };
            },
            false,
            "toggleSelectedItem"
          );
        },

        clearSelection: () => {
          set({ selectedItems: [] }, false, "clearSelection");
        },

        setBulkActionsOpen: (open: boolean) => {
          set({ bulkActionsOpen: open }, false, "setBulkActionsOpen");
        },

        // Layout Actions
        setHeaderHeight: (height: number) => {
          set({ headerHeight: height }, false, "setHeaderHeight");
        },

        setFooterHeight: (height: number) => {
          set({ footerHeight: height }, false, "setFooterHeight");
        },

        setContentPadding: (padding: number) => {
          set({ contentPadding: padding }, false, "setContentPadding");
        },

        // Onboarding Actions
        setShowOnboarding: (show: boolean) => {
          set({ showOnboarding: show }, false, "setShowOnboarding");
        },

        setCurrentOnboardingStep: (step: number) => {
          set(
            { currentOnboardingStep: step },
            false,
            "setCurrentOnboardingStep"
          );
        },

        nextOnboardingStep: () => {
          set(
            (state) => ({
              currentOnboardingStep: state.currentOnboardingStep + 1,
            }),
            false,
            "nextOnboardingStep"
          );
        },

        previousOnboardingStep: () => {
          set(
            (state) => ({
              currentOnboardingStep: Math.max(
                0,
                state.currentOnboardingStep - 1
              ),
            }),
            false,
            "previousOnboardingStep"
          );
        },

        completeOnboarding: () => {
          set(
            {
              showOnboarding: false,
              currentOnboardingStep: 0,
            },
            false,
            "completeOnboarding"
          );
        },

        addCompletedTutorial: (tutorialId: string) => {
          set(
            (state) => ({
              completedTutorials: [
                ...new Set([...state.completedTutorials, tutorialId]),
              ],
            }),
            false,
            "addCompletedTutorial"
          );
        },

        // Responsive Actions
        setScreenDimensions: (width: number, height: number) => {
          set(
            {
              screenWidth: width,
              screenHeight: height,
              isMobile: width < 768,
              isTablet: width >= 768 && width < 1024,
              isDesktop: width >= 1024,
            },
            false,
            "setScreenDimensions"
          );
        },

        updateResponsiveState: () => {
          if (typeof window !== "undefined") {
            const width = window.innerWidth;
            const height = window.innerHeight;

            set(
              {
                screenWidth: width,
                screenHeight: height,
                isMobile: width < 768,
                isTablet: width >= 768 && width < 1024,
                isDesktop: width >= 1024,
              },
              false,
              "updateResponsiveState"
            );
          }
        },

        // Utility Actions
        reset: () => {
          set(initialState, false, "reset");
        },

        resetModals: () => {
          set(
            {
              loginModalOpen: false,
              profileModalOpen: false,
              roleApplicationModalOpen: false,
              recordModalOpen: false,
              confirmationModalOpen: false,
              qrScannerOpen: false,
              searchOpen: false,
              filtersPanelOpen: false,
              bulkActionsOpen: false,
            },
            false,
            "resetModals"
          );
        },

        resetLoading: () => {
          set(
            {
              globalLoading: false,
              pageLoading: false,
              buttonLoading: {},
            },
            false,
            "resetLoading"
          );
        },
      }),
      {
        name: "tracceaqua-ui-storage",
        storage: createJSONStorage(() => localStorage),

        // Only persist certain UI preferences
        partialize: (state) => ({
          theme: state.theme,
          fontSize: state.fontSize,
          reducedMotion: state.reducedMotion,
          sidebarCollapsed: state.sidebarCollapsed,
          completedTutorials: state.completedTutorials,
          cameraPermissionGranted: state.cameraPermissionGranted,
        }),

        version: 1,
      }
    ),
    {
      name: "tracceaqua-ui-store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

// ===== SELECTORS =====

// Mobile & Menu Selectors
export const useMobileMenuOpen = () =>
  useUIStore((state) => state.mobileMenuOpen);
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen);
export const useSidebarCollapsed = () =>
  useUIStore((state) => state.sidebarCollapsed);

// Modal Selectors
export const useLoginModalOpen = () =>
  useUIStore((state) => state.loginModalOpen);
export const useProfileModalOpen = () =>
  useUIStore((state) => state.profileModalOpen);
export const useRoleApplicationModalOpen = () =>
  useUIStore((state) => state.roleApplicationModalOpen);
export const useRecordModalOpen = () =>
  useUIStore((state) => state.recordModalOpen);
export const useConfirmationModalOpen = () =>
  useUIStore((state) => state.confirmationModalOpen);

// Loading Selectors
export const useGlobalLoading = () =>
  useUIStore((state) => state.globalLoading);
export const usePageLoading = () => useUIStore((state) => state.pageLoading);
export const useButtonLoading = (id: string) =>
  useUIStore((state) => state.buttonLoading[id] || false);

// Theme Selectors
export const useTheme = () => useUIStore((state) => state.theme);
export const useFontSize = () => useUIStore((state) => state.fontSize);
export const useReducedMotion = () =>
  useUIStore((state) => state.reducedMotion);

// Notification Selectors
export const useShowNotifications = () =>
  useUIStore((state) => state.showNotifications);
export const useNotificationBadgeCount = () =>
  useUIStore((state) => state.notificationBadgeCount);

// QR Scanner Selectors
export const useQrScannerOpen = () =>
  useUIStore((state) => state.qrScannerOpen);
export const useCameraPermissionGranted = () =>
  useUIStore((state) => state.cameraPermissionGranted);

// Search & Filter Selectors
export const useSearchOpen = () => useUIStore((state) => state.searchOpen);
export const useFiltersPanelOpen = () =>
  useUIStore((state) => state.filtersPanelOpen);
export const useActiveFilters = () =>
  useUIStore((state) => state.activeFilters);

// Selection Selectors
export const useSelectedItems = () =>
  useUIStore((state) => state.selectedItems);
export const useBulkActionsOpen = () =>
  useUIStore((state) => state.bulkActionsOpen);
export const useSelectionCount = () =>
  useUIStore((state) => state.selectedItems.length);

// Responsive Selectors
export const useIsMobile = () => useUIStore((state) => state.isMobile);
export const useIsTablet = () => useUIStore((state) => state.isTablet);
export const useIsDesktop = () => useUIStore((state) => state.isDesktop);
export const useScreenDimensions = () =>
  useUIStore((state) => ({
    width: state.screenWidth,
    height: state.screenHeight,
  }));

// Onboarding Selectors
export const useShowOnboarding = () =>
  useUIStore((state) => state.showOnboarding);
export const useCurrentOnboardingStep = () =>
  useUIStore((state) => state.currentOnboardingStep);
export const useCompletedTutorials = () =>
  useUIStore((state) => state.completedTutorials);

// ===== HOOKS =====

// Initialize responsive state on mount
export const useInitializeUI = () => {
  const { updateResponsiveState, setTheme } = useUIStore();

  useEffect(() => {
    // Initialize responsive state
    updateResponsiveState();

    // Listen for window resize
    const handleResize = () => updateResponsiveState();
    window.addEventListener("resize", handleResize);

    // Listen for theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = () => {
      const currentTheme = useUIStore.getState().theme;
      if (currentTheme === "system") {
        setTheme("system"); // This will trigger theme application
      }
    };

    mediaQuery.addEventListener("change", handleThemeChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, [updateResponsiveState, setTheme]);
};

// Check if any modal is open
export const useAnyModalOpen = () =>
  useUIStore(
    (state) =>
      state.loginModalOpen ||
      state.profileModalOpen ||
      state.roleApplicationModalOpen ||
      state.recordModalOpen ||
      state.confirmationModalOpen ||
      state.qrScannerOpen ||
      state.searchOpen ||
      state.filtersPanelOpen ||
      state.bulkActionsOpen
  );

// Get layout dimensions
export const useLayoutDimensions = () =>
  useUIStore((state) => ({
    headerHeight: state.headerHeight,
    footerHeight: state.footerHeight,
    contentPadding: state.contentPadding,
    availableHeight:
      state.screenHeight - state.headerHeight - state.footerHeight,
  }));

// ===== UTILITIES =====

// Reset all UI state (useful for logout)
export const resetUIStore = () => {
  useUIStore.getState().reset();
};

// Close all overlays and modals
export const closeAllOverlays = () => {
  useUIStore.getState().closeAllModals();
};

// Get current UI state snapshot
export const getUISnapshot = () => {
  const state = useUIStore.getState();
  return {
    mobileMenuOpen: state.mobileMenuOpen,
    sidebarOpen: state.sidebarOpen,
    theme: state.theme,
    isMobile: state.isMobile,
    isTablet: state.isTablet,
    isDesktop: state.isDesktop,
  };
};

// ===== DEVTOOLS =====

if (process.env.NODE_ENV === "development") {
  if (typeof window !== "undefined") {
    (window as any).uiStore = useUIStore;
  }
}

export default useUIStore;
