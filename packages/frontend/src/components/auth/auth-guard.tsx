'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSimpleAuth } from '@/hooks/use-simple-auth'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredRoles?: string[]
  redirectTo?: string
  fallback?: React.ReactNode
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  requiredRoles, 
  redirectTo = '/login',
  fallback 
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useSimpleAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo)
        return
      }

      if (requiredRoles && user && !requiredRoles.includes(user.role)) {
        router.push('/dashboard') // Redirect to appropriate dashboard
        return
      }
    }
  }, [isAuthenticated, user, isLoading, requireAuth, requiredRoles, router, redirectTo])

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null // Will redirect
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return null // Will redirect
  }

  return <>{children}</>
}

