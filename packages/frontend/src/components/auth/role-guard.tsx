'use client'

import { useAuth } from '@/hooks/use-auth'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallback?: React.ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return fallback || <div>Access denied: Please sign in</div>
  }

  if (!allowedRoles.includes(user.role)) {
    return fallback || <div>Access denied: Insufficient permissions</div>
  }

  return <>{children}</>
}
