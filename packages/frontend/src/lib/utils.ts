import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { 
  UserRole, 
  UserStatus, 
  SupplyChainStage, 
  ApplicationStatus,
  USER_ROLE_LABELS,
  SUPPLY_CHAIN_STAGE_LABELS,
  APPLICATION_STATUS_LABELS 
} from '@/lib/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format Ethereum address for display
 * @param address - The full Ethereum address
 * @param startLength - Number of characters to show at start (default: 6)
 * @param endLength - Number of characters to show at end (default: 4)
 * @returns Formatted address like "0x1234...5678"
 */
export function formatAddress(
  address: string, 
  startLength: number = 6, 
  endLength: number = 4
): string {
  if (!address) return ''
  
  // Remove 0x prefix for length calculation
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address
  
  // If address is too short, return as is
  if (cleanAddress.length <= startLength + endLength) {
    return address
  }
  
  const prefix = address.startsWith('0x') ? '0x' : ''
  const start = cleanAddress.slice(0, startLength)
  const end = cleanAddress.slice(-endLength)
  
  return `${prefix}${start}...${end}`
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Convert address to checksum format
 */
export function toChecksumAddress(address: string): string {
  // This is a simplified version - in production, use ethers.js utils.getAddress()
  return address.toLowerCase()
}

// ===== ROLE COLOR UTILITIES =====

/**
 * Get Tailwind CSS classes for user role colors
 * @param role - User role
 * @returns CSS classes for background and text color
 */
export function getUserRoleColor(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case UserRole.RESEARCHER:
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case UserRole.FARMER:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case UserRole.FISHERMAN:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case UserRole.PROCESSOR:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case UserRole.TRADER:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case UserRole.RETAILER:
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    case UserRole.CONSUMER:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    case UserRole.PENDING_UPGRADE:
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

/**
 * Get user role display label
 */
export function getUserRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS[role] || role
}

/**
 * Get user status color
 */
export function getUserStatusColor(status: UserStatus): string {
  switch (status) {
    case UserStatus.ACTIVE:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case UserStatus.SUSPENDED:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case UserStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case UserStatus.BANNED:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
    case UserStatus.REJECTED:
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

// ===== SUPPLY CHAIN UTILITIES =====

/**
 * Get supply chain stage color
 */
export function getSupplyChainStageColor(stage: SupplyChainStage): string {
  switch (stage) {
    case SupplyChainStage.HARVEST:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case SupplyChainStage.PROCESSING:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case SupplyChainStage.PACKAGING:
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case SupplyChainStage.TRANSPORT:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case SupplyChainStage.WHOLESALE:
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    case SupplyChainStage.RETAIL:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case SupplyChainStage.CONSUMER:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

/**
 * Get supply chain stage label
 */
export function getSupplyChainStageLabel(stage: SupplyChainStage): string {
  return SUPPLY_CHAIN_STAGE_LABELS[stage] || stage
}

/**
 * Get application status color
 */
export function getApplicationStatusColor(status: ApplicationStatus): string {
  switch (status) {
    case ApplicationStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case ApplicationStatus.APPROVED:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case ApplicationStatus.REJECTED:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case ApplicationStatus.UNDER_REVIEW:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

/**
 * Get application status label
 */
export function getApplicationStatusLabel(status: ApplicationStatus): string {
  return APPLICATION_STATUS_LABELS[status] || status
}

// ===== DATE & TIME UTILITIES =====

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }
  
  return d.toLocaleDateString('en-US', defaultOptions)
}

/**
 * Format date and time for display
 */
export function formatDateTime(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  }
  
  return d.toLocaleDateString('en-US', defaultOptions)
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - d.getTime()
  
  const seconds = Math.floor(diffInMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  if (seconds > 30) return `${seconds} seconds ago`
  
  return 'Just now'
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  return d.toDateString() === today.toDateString()
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  return d.toDateString() === yesterday.toDateString()
}

// ===== NUMBER & CURRENCY UTILITIES =====

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  options: Intl.NumberFormatOptions = {}
): string {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }
  
  return amount.toLocaleString('en-US', defaultOptions)
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

// ===== STRING UTILITIES =====

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim()
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Extract initials from name
 */
export function getInitials(name: string, maxInitials: number = 2): string {
  return name
    .split(' ')
    .slice(0, maxInitials)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

// ===== VALIDATION UTILITIES =====

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ===== ARRAY UTILITIES =====

/**
 * Remove duplicates from array
 */
export function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * Shuffle array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key])
    groups[groupKey] = groups[groupKey] || []
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * Sort array by multiple keys
 */
export function sortBy<T>(
  array: T[],
  ...keys: Array<keyof T | ((item: T) => any)>
): T[] {
  return array.sort((a, b) => {
    for (const key of keys) {
      const aVal = typeof key === 'function' ? key(a) : a[key]
      const bVal = typeof key === 'function' ? key(b) : b[key]
      
      if (aVal < bVal) return -1
      if (aVal > bVal) return 1
    }
    return 0
  })
}

// ===== OBJECT UTILITIES =====

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: any): boolean {
  if (obj == null) return true
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * Pick specific keys from object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * Omit specific keys from object
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

// ===== BLOCKCHAIN UTILITIES =====

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash: string, length: number = 10): string {
  if (!hash) return ''
  
  if (hash.length <= length * 2) return hash
  
  return `${hash.slice(0, length)}...${hash.slice(-length)}`
}

/**
 * Format gas price (in Gwei)
 */
export function formatGasPrice(gasPrice: string | number): string {
  const gwei = typeof gasPrice === 'string' ? parseFloat(gasPrice) : gasPrice
  return `${(gwei / 1e9).toFixed(2)} Gwei`
}

/**
 * Format ETH amount
 */
export function formatEthAmount(wei: string | number, decimals: number = 6): string {
  const eth = typeof wei === 'string' ? parseFloat(wei) : wei
  return `${(eth / 1e18).toFixed(decimals)} ETH`
}

// ===== ERROR HANDLING =====

/**
 * Safe async function execution
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn()
  } catch (error) {
    console.error('Safe async error:', error)
    return fallback
  }
}

/**
 * Retry async function with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (i === maxRetries) {
        throw lastError
      }
      
      const delay = baseDelay * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// ===== ENVIRONMENT UTILITIES =====

/**
 * Check if running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

// ===== EXPORT ALL =====

export default {
  // Core
  cn,
  
  // Address
  formatAddress,
  isValidAddress,
  toChecksumAddress,
  
  // Colors & Labels
  getUserRoleColor,
  getUserRoleLabel,
  getUserStatusColor,
  getSupplyChainStageColor,
  getSupplyChainStageLabel,
  getApplicationStatusColor,
  getApplicationStatusLabel,
  
  // Date & Time
  formatDate,
  formatDateTime,
  formatRelativeTime,
  isToday,
  isYesterday,
  
  // Numbers
  formatNumber,
  formatCurrency,
  formatFileSize,
  formatPercentage,
  
  // Strings
  capitalize,
  camelToTitle,
  generateRandomString,
  truncateText,
  getInitials,
  
  // Validation
  isValidEmail,
  isValidPhone,
  isValidUrl,
  
  // Arrays
  removeDuplicates,
  shuffleArray,
  groupBy,
  sortBy,
  
  // Objects
  deepClone,
  isEmpty,
  pick,
  omit,
  
  // Blockchain
  formatTxHash,
  formatGasPrice,
  formatEthAmount,
  
  // Error Handling
  safeAsync,
  retryAsync,
  
  // Environment
  isBrowser,
  isDevelopment,
  isProduction
}