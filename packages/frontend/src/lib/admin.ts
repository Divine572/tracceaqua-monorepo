import { UserRole, UserStatus, ApplicationStatus } from "./types";

export interface UserProfile {
  firstName: string;
  lastName: string;
  organization: string | null;
}

export interface UserStats {
  conservationRecords: number;
  supplyChainRecords: number;
  roleApplications: number;
}

export interface User {
  id: string;
  address: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string; // ISO date string
  lastActive: string; // ISO date string
  profile: UserProfile;
  stats: UserStats;
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface RoleApplication {
  id: string
  userId: string
  requestedRole: UserRole
  status: ApplicationStatus
  organization?: string
  licenseNumber?: string
  businessType?: string
  experience?: string
  motivation?: string
  adminFeedback?: string
  submittedAt: Date
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    email: string
    address: string
    profile?: {
      firstName?: string
      lastName?: string
      phoneNumber?: string
    }
  }
}

interface ReviewApplicationData {
  status: 'APPROVED' | 'REJECTED'
  adminFeedback: string
}

