# TracceAqua Frontend Directory Structure

```
packages/frontend/
├── public/
│   ├── icons/                          # PWA icons (72x72 to 512x512)
│   ├── images/                         # Static images and assets
│   ├── manifest.json                   # PWA manifest
│   ├── sw.js                          # Service worker
│   └── favicon.ico
│
├── src/
│   ├── app/                           # Next.js 14 App Router
│   │   ├── (auth)/                    # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/               # Protected dashboard routes
│   │   │   ├── dashboard/
│   │   │   │   ├── admin/
│   │   │   │   │   ├── applications/
│   │   │   │   │   │   ├── [id]/
│   │   │   │   │   │   │   └── page.tsx        # Review specific application
│   │   │   │   │   │   └── page.tsx            # List all role applications
│   │   │   │   │   ├── users/
│   │   │   │   │   │   ├── [id]/
│   │   │   │   │   │   │   └── page.tsx        # User details/edit
│   │   │   │   │   │   └── page.tsx            # User management
│   │   │   │   │   └── analytics/
│   │   │   │   │       └── page.tsx            # System analytics
│   │   │   │   │
│   │   │   │   ├── conservation/
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx            # New conservation record (5-step wizard)
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── edit/
│   │   │   │   │   │   │   └── page.tsx        # Edit conservation record
│   │   │   │   │   │   └── page.tsx            # View conservation record details
│   │   │   │   │   ├── analytics/
│   │   │   │   │   │   └── page.tsx            # Conservation analytics
│   │   │   │   │   └── page.tsx                # Conservation dashboard
│   │   │   │   │
│   │   │   │   ├── supply-chain/
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx            # New supply chain record
│   │   │   │   │   ├── [productId]/
│   │   │   │   │   │   ├── edit/
│   │   │   │   │   │   │   └── page.tsx        # Edit supply chain record
│   │   │   │   │   │   ├── stages/
│   │   │   │   │   │   │   ├── [stage]/
│   │   │   │   │   │   │   │   └── page.tsx    # Stage-specific update
│   │   │   │   │   │   │   └── page.tsx        # All stages view
│   │   │   │   │   │   └── page.tsx            # Product details
│   │   │   │   │   ├── batch/
│   │   │   │   │   │   ├── [batchId]/
│   │   │   │   │   │   │   └── page.tsx        # Batch management
│   │   │   │   │   │   └── page.tsx            # All batches
│   │   │   │   │   └── page.tsx                # Supply chain dashboard
│   │   │   │   │
│   │   │   │   ├── scan/
│   │   │   │   │   └── page.tsx                # QR Code scanner
│   │   │   │   │
│   │   │   │   ├── history/
│   │   │   │   │   ├── conservation/
│   │   │   │   │   │   └── page.tsx            # Conservation history
│   │   │   │   │   ├── supply-chain/
│   │   │   │   │   │   └── page.tsx            # Supply chain history
│   │   │   │   │   └── page.tsx                # All activity history
│   │   │   │   │
│   │   │   │   ├── my-applications/
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx            # Apply for role
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx            # Application details
│   │   │   │   │   └── page.tsx                # My applications list
│   │   │   │   │
│   │   │   │   ├── settings/
│   │   │   │   │   ├── profile/
│   │   │   │   │   │   └── page.tsx            # Profile settings
│   │   │   │   │   ├── security/
│   │   │   │   │   │   └── page.tsx            # Security settings
│   │   │   │   │   ├── notifications/
│   │   │   │   │   │   └── page.tsx            # Notification preferences
│   │   │   │   │   └── page.tsx                # General settings
│   │   │   │   │
│   │   │   │   └── page.tsx                    # Dashboard home
│   │   │   │
│   │   │   └── layout.tsx                      # Dashboard layout with sidebar
│   │   │
│   │   ├── onboarding/                        # Onboarding flow (already exists)
│   │   │   ├── welcome/
│   │   │   │   └── page.tsx
│   │   │   ├── features/
│   │   │   │   └── page.tsx
│   │   │   ├── stakeholders/
│   │   │   │   └── page.tsx
│   │   │   ├── get-started/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── trace/                             # Public tracing routes
│   │   │   ├── [productId]/
│   │   │   │   ├── feedback/
│   │   │   │   │   └── page.tsx               # Consumer feedback form
│   │   │   │   └── page.tsx                   # Public product trace page
│   │   │   └── page.tsx                       # Trace landing page
│   │   │
│   │   ├── api/                               # API routes (if needed)
│   │   │   └── auth/
│   │   │       └── callback/
│   │   │           └── route.ts               # Auth callback
│   │   │
│   │   ├── globals.css                        # Global styles
│   │   ├── layout.tsx                         # Root layout
│   │   ├── loading.tsx                        # Global loading UI
│   │   ├── error.tsx                          # Global error UI
│   │   ├── not-found.tsx                      # 404 page
│   │   └── page.tsx                           # Home page
│   │
│   ├── components/
│   │   ├── ui/                                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── table.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── tooltip.tsx
│   │   │
│   │   ├── layout/                           # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── sidebar-nav.tsx               # Already exists
│   │   │   ├── mobile-nav.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   └── user-nav.tsx
│   │   │
│   │   ├── auth/                             # Authentication components
│   │   │   ├── wallet-connect.tsx
│   │   │   ├── social-login.tsx
│   │   │   ├── login-form.tsx
│   │   │   ├── role-guard.tsx                # Already exists
│   │   │   ├── auth-provider.tsx
│   │   │   └── protected-route.tsx
│   │   │
│   │   ├── onboarding/                       # Onboarding components (already exists)
│   │   │   ├── welcome-screen.tsx
│   │   │   ├── features-screen.tsx
│   │   │   ├── stakeholders-screen.tsx
│   │   │   ├── get-started-screen.tsx
│   │   │   ├── onboarding-flow.tsx
│   │   │   └── step-indicator.tsx
│   │   │
│   │   ├── conservation/                     # Conservation module components
│   │   │   ├── forms/
│   │   │   │   ├── sampling-wizard.tsx       # 5-step conservation form
│   │   │   │   ├── location-environmental-step.tsx
│   │   │   │   ├── species-identification-step.tsx
│   │   │   │   ├── sampling-methods-step.tsx
│   │   │   │   ├── lab-tests-step.tsx
│   │   │   │   ├── results-verification-step.tsx
│   │   │   │   └── conservation-form-provider.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── conservation-stats.tsx
│   │   │   │   ├── recent-samples.tsx
│   │   │   │   ├── conservation-analytics.tsx
│   │   │   │   └── sampling-calendar.tsx
│   │   │   ├── records/
│   │   │   │   ├── conservation-record-card.tsx
│   │   │   │   ├── conservation-record-list.tsx
│   │   │   │   ├── conservation-record-details.tsx
│   │   │   │   ├── conservation-record-edit.tsx
│   │   │   │   └── conservation-record-status.tsx
│   │   │   └── common/
│   │   │       ├── species-selector.tsx
│   │   │       ├── location-picker.tsx
│   │   │       ├── environmental-data-form.tsx
│   │   │       └── lab-test-upload.tsx
│   │   │
│   │   ├── supply-chain/                     # Supply chain module components
│   │   │   ├── forms/
│   │   │   │   ├── supply-chain-wizard.tsx   # Main supply chain form
│   │   │   │   ├── source-type-selector.tsx  # Farmed vs Wild selector
│   │   │   │   ├── farmed/
│   │   │   │   │   ├── hatchery-form.tsx
│   │   │   │   │   ├── grow-out-form.tsx
│   │   │   │   │   └── harvest-form.tsx
│   │   │   │   ├── wild-capture/
│   │   │   │   │   ├── fishing-operations-form.tsx
│   │   │   │   │   └── vessel-info-form.tsx
│   │   │   │   ├── common/
│   │   │   │   │   ├── processing-form.tsx
│   │   │   │   │   ├── distribution-form.tsx
│   │   │   │   │   ├── retail-form.tsx
│   │   │   │   │   └── stage-update-form.tsx
│   │   │   │   └── supply-chain-form-provider.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── supply-chain-stats.tsx
│   │   │   │   ├── active-products.tsx
│   │   │   │   ├── batch-management.tsx
│   │   │   │   └── supply-chain-analytics.tsx
│   │   │   ├── products/
│   │   │   │   ├── product-card.tsx
│   │   │   │   ├── product-list.tsx
│   │   │   │   ├── product-details.tsx
│   │   │   │   ├── product-journey.tsx
│   │   │   │   ├── product-timeline.tsx
│   │   │   │   └── batch-products.tsx
│   │   │   ├── stages/
│   │   │   │   ├── stage-progress.tsx
│   │   │   │   ├── stage-history.tsx
│   │   │   │   ├── stage-update-modal.tsx
│   │   │   │   └── stage-verification.tsx
│   │   │   └── common/
│   │   │       ├── quality-grade-selector.tsx
│   │   │       ├── temperature-monitor.tsx
│   │   │       └── certification-upload.tsx
│   │   │
│   │   ├── qr-code/                          # QR Code components
│   │   │   ├── qr-generator.tsx
│   │   │   ├── qr-scanner.tsx
│   │   │   ├── qr-scanner-modal.tsx
│   │   │   ├── qr-code-display.tsx
│   │   │   ├── batch-qr-generator.tsx
│   │   │   ├── qr-download-button.tsx
│   │   │   └── camera-permission-handler.tsx
│   │   │
│   │   ├── admin/                            # Admin components
│   │   │   ├── dashboard/
│   │   │   │   ├── admin-stats.tsx
│   │   │   │   ├── user-activity-feed.tsx
│   │   │   │   ├── system-health.tsx
│   │   │   │   └── recent-applications.tsx
│   │   │   ├── users/
│   │   │   │   ├── user-management-table.tsx
│   │   │   │   ├── user-details-modal.tsx
│   │   │   │   ├── user-role-editor.tsx
│   │   │   │   ├── user-status-toggle.tsx
│   │   │   │   └── bulk-user-actions.tsx
│   │   │   ├── applications/
│   │   │   │   ├── application-review-card.tsx
│   │   │   │   ├── application-details-modal.tsx
│   │   │   │   ├── application-approval-form.tsx
│   │   │   │   ├── document-viewer.tsx
│   │   │   │   └── bulk-approval-actions.tsx
│   │   │   └── analytics/
│   │   │       ├── user-metrics.tsx
│   │   │       ├── system-analytics.tsx
│   │   │       ├── data-quality-metrics.tsx
│   │   │       └── blockchain-metrics.tsx
│   │   │
│   │   ├── public-trace/                     # Consumer tracing components
│   │   │   ├── product-trace-page.tsx
│   │   │   ├── trace-timeline.tsx
│   │   │   ├── trace-map-visualization.tsx
│   │   │   ├── trace-certificate-display.tsx
│   │   │   ├── consumer-feedback-form.tsx
│   │   │   ├── trace-share-button.tsx
│   │   │   └── trace-qr-scanner.tsx
│   │   │
│   │   ├── file-upload/                      # File upload components
│   │   │   ├── ipfs-file-uploader.tsx
│   │   │   ├── drag-drop-upload.tsx
│   │   │   ├── file-preview.tsx
│   │   │   ├── upload-progress.tsx
│   │   │   ├── file-type-validator.tsx
│   │   │   ├── image-optimizer.tsx
│   │   │   └── bulk-file-upload.tsx
│   │   │
│   │   ├── blockchain/                       # Blockchain components
│   │   │   ├── transaction-status.tsx
│   │   │   ├── blockchain-record-display.tsx
│   │   │   ├── gas-estimator.tsx
│   │   │   ├── transaction-history.tsx
│   │   │   ├── contract-interaction.tsx
│   │   │   └── blockchain-verification.tsx
│   │   │
│   │   ├── forms/                            # Reusable form components
│   │   │   ├── form-wizard.tsx
│   │   │   ├── step-navigation.tsx
│   │   │   ├── form-validation-display.tsx
│   │   │   ├── auto-save-form.tsx
│   │   │   ├── conditional-field.tsx
│   │   │   └── form-progress-tracker.tsx
│   │   │
│   │   ├── data-display/                     # Data display components
│   │   │   ├── data-table.tsx
│   │   │   ├── analytics-chart.tsx
│   │   │   ├── metrics-card.tsx
│   │   │   ├── status-indicator.tsx
│   │   │   ├── data-export-button.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── sort-header.tsx
│   │   │   └── filter-bar.tsx
│   │   │
│   │   ├── notifications/                    # Notification components
│   │   │   ├── toast-provider.tsx
│   │   │   ├── notification-center.tsx
│   │   │   ├── real-time-updates.tsx
│   │   │   └── push-notification-handler.tsx
│   │   │
│   │   └── common/                           # Common/shared components
│   │       ├── loading-spinner.tsx
│   │       ├── empty-state.tsx
│   │       ├── error-boundary.tsx
│   │       ├── confirmation-modal.tsx
│   │       ├── search-input.tsx
│   │       ├── date-range-picker.tsx
│   │       ├── copy-to-clipboard.tsx
│   │       ├── responsive-image.tsx
│   │       └── scroll-to-top.tsx
│   │
│   ├── lib/                                  # Utility libraries
│   │   ├── utils.ts                          # General utilities
│   │   ├── constants.ts                      # App constants
│   │   ├── validations.ts                    # Zod validation schemas
│   │   ├── date-utils.ts                     # Date formatting utilities
│   │   ├── format-utils.ts                   # Data formatting utilities
│   │   ├── crypto-utils.ts                   # Cryptography utilities
│   │   └── storage-utils.ts                  # Local storage utilities
│   │
│   ├── hooks/                                # Custom React hooks
│   │   ├── use-auth.ts                       # Authentication hook (already exists)
│   │   ├── use-api.ts                        # Generic API hook
│   │   ├── use-debounce.ts                   # Debouncing hook
│   │   ├── use-local-storage.ts              # Local storage hook
│   │   ├── use-file-upload.ts                # File upload hook
│   │   ├── use-qr-scanner.ts                 # QR scanner hook
│   │   ├── use-blockchain.ts                 # Blockchain interaction hook
│   │   ├── use-form-wizard.ts                # Form wizard state hook
│   │   ├── use-websocket.ts                  # WebSocket hook
│   │   └── use-permissions.ts                # Role-based permissions hook
│   │
│   ├── stores/                               # Zustand stores
│   │   ├── auth-store.ts                     # Authentication store (already exists)
│   │   ├── conservation-store.ts             # Conservation data store
│   │   ├── supply-chain-store.ts             # Supply chain data store
│   │   ├── upload-store.ts                   # File upload state store
│   │   ├── notification-store.ts             # Notifications store
│   │   ├── ui-store.ts                       # UI state store
│   │   └── settings-store.ts                 # User settings store
│   │
│   ├── services/                             # API service functions
│   │   ├── api.ts                            # Base API client
│   │   ├── auth.service.ts                   # Authentication API calls
│   │   ├── users.service.ts                  # User management API calls
│   │   ├── conservation.service.ts           # Conservation API calls
│   │   ├── supply-chain.service.ts           # Supply chain API calls
│   │   ├── admin.service.ts                  # Admin API calls
│   │   ├── files.service.ts                  # File/IPFS API calls
│   │   ├── blockchain.service.ts             # Blockchain service calls
│   │   ├── notifications.service.ts          # Notifications service
│   │   └── public-trace.service.ts           # Public tracing API calls
│   │
│   ├── types/                                # TypeScript type definitions
│   │   ├── index.ts                          # Main types export (already exists)
│   │   ├── auth.types.ts                     # Authentication types
│   │   ├── user.types.ts                     # User and profile types
│   │   ├── conservation.types.ts             # Conservation record types
│   │   ├── supply-chain.types.ts             # Supply chain types
│   │   ├── admin.types.ts                    # Admin types
│   │   ├── api.types.ts                      # API response types
│   │   ├── blockchain.types.ts               # Blockchain types
│   │   ├── file.types.ts                     # File upload types
│   │   └── ui.types.ts                       # UI component types
│   │
│   ├── config/                               # Configuration files
│   │   ├── app.config.ts                     # App configuration
│   │   ├── walletconnect.config.ts           # WalletConnect configuration
│   │   ├── blockchain.config.ts              # Blockchain network config
│   │   ├── ipfs.config.ts                    # IPFS/Pinata config
│   │   └── api.config.ts                     # API endpoints config
│   │
│   └── providers/                            # React providers
│       ├── app-providers.tsx                 # Combined app providers
│       ├── auth-provider.tsx                 # Authentication provider
│       ├── blockchain-provider.tsx           # Blockchain/Wagmi provider
│       ├── query-provider.tsx                # React Query provider
│       ├── toast-provider.tsx                # Toast notifications provider
│       └── theme-provider.tsx                # Theme provider
│
├── .env.local                               # Environment variables
├── .env.example                             # Environment variables example
├── next.config.js                           # Next.js configuration
├── tailwind.config.js                       # Tailwind CSS configuration
├── components.json                          # shadcn/ui configuration
├── tsconfig.json                            # TypeScript configuration
├── package.json                             # Dependencies and scripts
└── README.md                                # Project documentation
```

## Key Features of This Structure:

### 🎯 **Route Organization**
- **Route Groups**: `(auth)` and `(dashboard)` for logical separation
- **Nested Routes**: Proper hierarchy for complex features
- **Public Routes**: `/trace/[productId]` for consumer access
- **Admin Routes**: Dedicated admin section with role-based access

### 🧩 **Component Architecture**
- **Feature-Based Components**: Organized by domain (conservation, supply-chain, etc.)
- **Reusable UI Components**: shadcn/ui base + custom extensions
- **Smart/Dumb Components**: Clear separation of concerns
- **Form Components**: Specialized form handling components

### 🛠 **Service Layer**
- **API Services**: Dedicated service files for each domain
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Consistent error handling patterns
- **Caching**: React Query integration for data management

### 🔧 **State Management**
- **Zustand Stores**: Feature-specific state stores
- **React Query**: Server state management
- **Local Storage**: Persistent client state
- **Form State**: React Hook Form integration

### 📱 **PWA Features**
- **Service Worker**: Offline functionality
- **Manifest**: App installation support
- **Icons**: Complete icon set for all devices
- **Caching**: Strategic caching for performance

This structure supports:
- ✅ WalletConnect with Google social signin
- ✅ Complete Conservation Module (5-step forms)
- ✅ Complete Supply Chain Module (farmed/wild workflows)
- ✅ QR Code generation and scanning
- ✅ Admin dashboard and user management
- ✅ IPFS file uploads via Pinata
- ✅ Blockchain integration (Sepolia testnet)
- ✅ Public consumer tracing
- ✅ Mobile-first PWA design
- ✅ Beautiful blue design system
- ✅ Real API calls (no mock data)
- ✅ End-to-end functionality