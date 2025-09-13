'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Shield, AlertTriangle, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'

import useAuthStore from '@/stores/auth-store'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

export function AuthGuard({ 
  children, 
  fallback,
  redirectTo = '/',
  requireAuth = true 
}: AuthGuardProps) {
  // const { user, isAuthenticated, isLoading } = useAuth()
  const {user} = useAuthStore()
  const {user: authenticatedUser} = useDynamicContext()

  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle authentication redirect
  // useEffect(() => {
  //   if (mounted && !isLoading && requireAuth && !isAuthenticated) {
  //     // Store the intended destination
  //     const returnUrl = encodeURIComponent(pathname)
  //     router.push(`${redirectTo}?returnUrl=${returnUrl}`)
  //   }
  // }, [mounted, isLoading, isAuthenticated, requireAuth, router, redirectTo, pathname])

  // Don't render anything during hydration
  if (!mounted) {
    return null
  }

  // Show loading state
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <Card className="w-full max-w-md">
  //         <CardContent className="flex flex-col items-center justify-center py-8">
  //           <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
  //           <h3 className="text-lg font-medium mb-2">Authenticating...</h3>
  //           <p className="text-sm text-muted-foreground text-center">
  //             Please wait while we verify your credentials
  //           </p>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }

  // Show fallback or redirect for unauthenticated users
  if (requireAuth && !authenticatedUser) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be signed in to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Please sign in to continue to TracceAqua
              </p>
            </div>
            <div className="space-y-2">
              <Link href={`${redirectTo}?returnUrl=${encodeURIComponent(pathname)}`} className="w-full">
                <Button className="w-full">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  Go to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show suspended account message
  if (user && user.status === 'SUSPENDED') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle>Account Suspended</CardTitle>
            <CardDescription>
              Your account has been temporarily suspended
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Please contact support for assistance with your account
              </p>
            </div>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => router.push('/support')}
              >
                Contact Support
              </Button>
              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={() => {
                  // Add logout functionality here
                  router.push('/')
                }}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render protected content
  return <>{children}</>
}

// Higher-order component wrapper
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthGuardProps, 'children'>
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}

// Hook to check if user is authenticated
export function useAuthGuard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  return {
    isAuthenticated,
    isLoading,
    user,
    canAccess: isAuthenticated && user?.status === 'ACTIVE',
    isActive: user?.status === 'ACTIVE',
    isSuspended: user?.status === 'SUSPENDED',
    isPending: user?.status === 'PENDING'
  }
}