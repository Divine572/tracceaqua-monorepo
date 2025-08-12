import type { UserRole } from './index' 

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
  user?: {
    id: string
    address: string
    email?: string
    profile?: {
      firstName?: string
      lastName?: string
      organization?: string
    }
  }
  reviewer?: {
    id: string
    profile?: {
      firstName?: string
      lastName?: string
    }
  }
}

export type ApplicationStatus = 
  | 'PENDING'
  | 'UNDER_REVIEW' 
  | 'APPROVED'
  | 'REJECTED'
  | 'RESUBMITTED'