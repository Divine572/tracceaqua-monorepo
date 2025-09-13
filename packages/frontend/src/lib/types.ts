// lib/types.ts
// TracceAqua - Blockchain Seafood Traceability System Types

import { NextAuthOptions } from "next-auth";

// ===== AUTHENTICATION TYPES =====

export interface User {
  id: string;
  address: string;
  email?: string | null;
  role: UserRole;
  status: UserStatus;
  profile?: UserProfile | null;
  image?: string | null;
  name?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  website: string;
  phoneNumber: string;
  organization: string;
  profileImage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserData {
  address: string | undefined;
  signature: string | undefined;
  message: string;
  email?: string | undefined;
  firstName?: string;
  lastName?: string;
};

// export interface SocialLinks {
//   twitter?: string;
//   linkedin?: string;
//   facebook?: string;
//   instagram?: string;
// }

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    showProfile: boolean;
    showActivity: boolean;
    showLocation: boolean;
  };
  language: string;
  timezone: string;
  theme: "light" | "dark" | "system";
}

// ===== USER ROLES & STATUS =====

export enum UserRole {
  ADMIN = "ADMIN",
  RESEARCHER = "RESEARCHER",
  FARMER = "FARMER",
  FISHERMAN = "FISHERMAN",
  PROCESSOR = "PROCESSOR",
  TRADER = "TRADER",
  RETAILER = "RETAILER",
  CONSUMER = "CONSUMER",
  PENDING_UPGRADE = "PENDING_UPGRADE",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
  //   INACTIVE = 'INACTIVE',
  BANNED = "BANNED",
  REJECTED = "REJECTED",
}

export enum ApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  UNDER_REVIEW = "UNDER_REVIEW",
}

// ===== ROLE APPLICATION TYPES =====

export interface RoleApplication {
  id: string;
  userId: string;
  requestedRole: UserRole;
  status: ApplicationStatus;
  organization?: string | null;
  licenseNumber?: string | null;
  documents: string[]; // IPFS hashes
  adminFeedback?: string | null;
  submittedAt: Date;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

// ===== AUTHENTICATION STORE TYPES =====

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  walletAddress: string | undefined;
  // sessionId: string | null;
  lastActivity: Date | null;
  email: string | undefined
  signature: string | undefined
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setWalletAddress: (address: string | undefined) => void;
  setEmail: (email: string | undefined) => void;
  setSignature: (signature: string | undefined) => void;
  // setSessionId: (sessionId: string | null) => void;
  updateUserRole: (role: UserRole) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  logout: () => void;
  reset: () => void;
}

export type AuthStore = AuthState & AuthActions;

// ===== WALLET CONNECT TYPES =====

export interface WalletConnection {
  address: string;
  chainId: number;
  isConnected: boolean;
  connector?: string;
}

export interface SignMessageParams {
  address: string;
  message: string;
  signature: string;
}

export interface WalletAuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
}

// ===== NEXT-AUTH EXTENSIONS =====

declare module "next-auth" {
  interface Session {
    user: User;
    address?: string;
    chainId?: number;
  }

  interface User {
    id: string;
    address: string;
    role: UserRole;
    status: UserStatus;
    walletAddress?: string;
    profile?: UserProfile;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    address: string;
    role: UserRole;
    status: UserStatus;
    walletAddress?: string;
  }
}

// ===== API RESPONSE TYPES =====

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===== BLOCKCHAIN TYPES =====

export interface BlockchainRecord {
  id: string;
  transactionHash: string;
  blockNumber: number;
  contractAddress: string;
  gasUsed: string;
  gasPrice: string;
  timestamp: Date;
  confirmed: boolean;
}

export interface SeafoodRecord extends BlockchainRecord {
  species: string;
  quantity: number;
  unit: string;
  location: string;
  harvestDate: Date;
  currentOwner: string;
  provenance: ProvenanceRecord[];
  certifications: Certification[];
  qualityMetrics: QualityMetric[];
}

export interface ProvenanceRecord {
  id: string;
  recordId: string;
  stage: SupplyChainStage;
  actor: string;
  actorRole: UserRole;
  location: string;
  timestamp: Date;
  description: string;
  documents: string[]; // IPFS hashes
  signatures: string[];
  verified: boolean;
}

export enum SupplyChainStage {
  HARVEST = "HARVEST",
  PROCESSING = "PROCESSING",
  PACKAGING = "PACKAGING",
  TRANSPORT = "TRANSPORT",
  WHOLESALE = "WHOLESALE",
  RETAIL = "RETAIL",
  CONSUMER = "CONSUMER",
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date | null;
  documentHash: string; // IPFS hash
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface QualityMetric {
  id: string;
  metric: string;
  value: string;
  unit: string;
  timestamp: Date;
  measuredBy: string;
  deviceId?: string;
  verified: boolean;
}

// ===== LOCATION TYPES =====

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  marineZone?: string;
  waterBody?: string;
}

export interface LocationInput {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  marineZone?: string;
  waterBody?: string;
}

// ===== FILE UPLOAD TYPES =====

export interface FileUpload {
  file: File;
  preview?: string;
  ipfsHash?: string;
  uploadStatus: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export interface IPFSUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

// ===== QR CODE TYPES =====

export interface QRCodeData {
  recordId: string;
  species: string;
  harvestDate: string;
  location: string;
  currentStage: SupplyChainStage;
  verificationUrl: string;
  timestamp: string;
}

export interface QRScanResult {
  success: boolean;
  data?: QRCodeData;
  error?: string;
  rawData?: string;
}

// ===== NOTIFICATION TYPES =====

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date | null;
}

export enum NotificationType {
  ROLE_APPLICATION_APPROVED = "ROLE_APPLICATION_APPROVED",
  ROLE_APPLICATION_REJECTED = "ROLE_APPLICATION_REJECTED",
  RECORD_VERIFICATION_REQUIRED = "RECORD_VERIFICATION_REQUIRED",
  RECORD_UPDATED = "RECORD_UPDATED",
  CERTIFICATION_EXPIRING = "CERTIFICATION_EXPIRING",
  SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT",
  BLOCKCHAIN_CONFIRMATION = "BLOCKCHAIN_CONFIRMATION",
}

// ===== FORM TYPES =====

export interface LoginFormData {
  walletAddress?: string;
  email?: string;
  rememberMe?: boolean;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email?: string;
  organization?: string;
  licenseNumber?: string;
  phoneNumber?: string;
  bio?: string;
  location?: string;
  website?: string;
  // socialLinks?: SocialLinks;
}

export interface RoleApplicationFormData {
  requestedRole: UserRole;
  organization?: string;
  licenseNumber?: string;
  documents: FileUpload[];
  additionalInfo?: string;
}

export interface SeafoodRecordFormData {
  species: string;
  quantity: number;
  unit: string;
  harvestDate: Date;
  location: LocationInput;
  description?: string;
  certifications: FileUpload[];
  qualityMetrics: QualityMetric[];
  photos: FileUpload[];
}

// ===== DASHBOARD TYPES =====

export interface DashboardStats {
  totalRecords: number;
  recordsThisMonth: number;
  recordsThisWeek: number;
  verificationsPending: number;
  certificationsExpiring: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type:
    | "record_created"
    | "record_verified"
    | "role_approved"
    | "certification_added";
  description: string;
  timestamp: Date;
  userId: string;
  userName: string;
  recordId?: string;
}

// ===== SEARCH & FILTER TYPES =====

export interface SearchFilters {
  species?: string[];
  stage?: SupplyChainStage[];
  location?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  verificationStatus?: boolean;
  certifications?: string[];
  userRole?: UserRole[];
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

export interface SearchParams {
  query?: string;
  filters?: SearchFilters;
  sort?: SortOptions;
  page?: number;
  limit?: number;
}

// ===== ERROR TYPES =====

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ===== UTILITY TYPES =====

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type Timestamp = {
  createdAt: Date;
  updatedAt: Date;
};

// ===== COMPONENT PROPS TYPES =====

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface TableProps<T> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    field: keyof T | string;
    direction: "asc" | "desc";
    onSort: (field: keyof T | string) => void;
  };
  emptyMessage?: string;
}

// ===== CONSTANTS =====

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "System Administrator",
  [UserRole.RESEARCHER]: "Marine Researcher",
  [UserRole.FARMER]: "Aquaculture Farmer",
  [UserRole.FISHERMAN]: "Commercial Fisherman",
  [UserRole.PROCESSOR]: "Seafood Processor",
  [UserRole.TRADER]: "Seafood Trader",
  [UserRole.RETAILER]: "Retail Partner",
  [UserRole.CONSUMER]: "Consumer",
  [UserRole.PENDING_UPGRADE]: "Pending Role Upgrade",
};

export const SUPPLY_CHAIN_STAGE_LABELS: Record<SupplyChainStage, string> = {
  [SupplyChainStage.HARVEST]: "Harvest",
  [SupplyChainStage.PROCESSING]: "Processing",
  [SupplyChainStage.PACKAGING]: "Packaging",
  [SupplyChainStage.TRANSPORT]: "Transport",
  [SupplyChainStage.WHOLESALE]: "Wholesale",
  [SupplyChainStage.RETAIL]: "Retail",
  [SupplyChainStage.CONSUMER]: "Consumer",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: "Pending Review",
  [ApplicationStatus.APPROVED]: "Approved",
  [ApplicationStatus.REJECTED]: "Rejected",
  [ApplicationStatus.UNDER_REVIEW]: "Under Review",
};

// ===== TYPE GUARDS =====

export const isUser = (obj: any): obj is User => {
  return obj && typeof obj.id === "string" && typeof obj.address === "string";
};

export const isUserRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};

export const isSupplyChainStage = (
  stage: string
): stage is SupplyChainStage => {
  return Object.values(SupplyChainStage).includes(stage as SupplyChainStage);
};

export const isApiResponse = <T>(obj: any): obj is ApiResponse<T> => {
  return obj && typeof obj.success === "boolean";
};
