export type UserRole = 
  | 'ADMIN'
  | 'RESEARCHER'
  | 'FARMER'
  | 'FISHERMAN'
  | 'PROCESSOR'
  | 'TRADER'
  | 'RETAILER'
  | 'CONSUMER'
  | 'PENDING_UPGRADE'

export type UserStatus = 
  | 'ACTIVE'
  | 'PENDING'
  | 'SUSPENDED'
  | 'REJECTED'

export type ApplicationStatus = 
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESUBMITTED'

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
  licenseNumber?: string
  documents?: string[]
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  address: string
  email?: string
  role: UserRole
  status: UserStatus
  profile?: UserProfile
  isNewUser?: boolean
  createdAt: string
  updatedAt: string
}

export interface RoleApplication {
  id: string
  userId: string
  requestedRole: UserRole
  status: ApplicationStatus
  organization?: string
  licenseNumber?: string
  businessType?: string
  experience?: string
  motivation?: string
  documents: string[]
  reviewedBy?: string
  adminFeedback?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
  user?: User
  reviewer?: User
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Authentication types
export interface AuthResponse {
  accessToken: string
  user: User
}

export interface LoginRequest {
  address: string
  signature: string
  message: string
  email?: string
}

export interface GenerateMessageResponse {
  message: string
  nonce: string
}

// Component prop types
export interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredRoles?: UserRole[]
  redirectTo?: string
  fallback?: React.ReactNode
}

export interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
}

// Dashboard types
export interface DashboardStats {
  totalUsers: number
  pendingApplications: number
  recordsToday: number
  systemHealth: 'healthy' | 'warning' | 'error'
}

export interface RecentActivity {
  id: string
  type: 'user_registration' | 'role_application' | 'record_created' | 'login'
  description: string
  timestamp: string
  userId?: string
  user?: Partial<User>
}

// Navigation types
export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[] | ['*']
  badge?: string | number
}

// Form types
export interface ProfileUpdateForm {
  firstName?: string
  lastName?: string
  bio?: string
  location?: string
  website?: string
  phoneNumber?: string
  organization?: string
}

export interface RoleApplicationForm {
  requestedRole: UserRole
  organization?: string
  licenseNumber?: string
  businessType?: string
  experience?: string
  motivation?: string
  documents?: FileList
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
}

// Constants
export const USER_ROLES: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  RESEARCHER: 'Researcher',
  FARMER: 'Farmer',
  FISHERMAN: 'Fisherman',
  PROCESSOR: 'Processor',
  TRADER: 'Trader',
  RETAILER: 'Retailer',
  CONSUMER: 'Consumer',
  PENDING_UPGRADE: 'Pending Upgrade',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  ADMIN: 'Full system access and user management',
  RESEARCHER: 'Conservation data collection and analysis',
  FARMER: 'Aquaculture operations and farming records',
  FISHERMAN: 'Wild-capture fishing operations',
  PROCESSOR: 'Seafood processing and transformation',
  TRADER: 'Distribution and logistics management',
  RETAILER: 'Retail sales and consumer interface',
  CONSUMER: 'Product tracing and verification',
  PENDING_UPGRADE: 'Application under review',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'bg-red-100 text-red-800 border-red-200',
  RESEARCHER: 'bg-purple-100 text-purple-800 border-purple-200',
  FARMER: 'bg-green-100 text-green-800 border-green-200',
  FISHERMAN: 'bg-blue-100 text-blue-800 border-blue-200',
  PROCESSOR: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  TRADER: 'bg-orange-100 text-orange-800 border-orange-200',
  RETAILER: 'bg-pink-100 text-pink-800 border-pink-200',
  CONSUMER: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  PENDING_UPGRADE: 'bg-gray-100 text-gray-800 border-gray-200',
}