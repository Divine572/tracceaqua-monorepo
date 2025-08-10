'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { PageLoading } from '@/components/ui/page-loading'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Handle PWA install prompt
  useEffect(() => {
    let deferredPrompt: any
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e
      // You can show custom install button here
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/onboarding', '/about', '/contact']
  const isPublicRoute = publicRoutes.includes(pathname)

  if (isLoading) {
    return <PageLoading />
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}
