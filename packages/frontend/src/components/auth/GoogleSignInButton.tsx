"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {toast} from "sonner"
// import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface GoogleSignInButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  callbackUrl?: string
  disabled?: boolean
}

export function GoogleSignInButton({ 
  onSuccess, 
  onError,
  className,
  variant = 'outline',
  size = 'md',
  callbackUrl = '/dashboard',
  disabled = false
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
//   const { toast } = useToast()

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setStatus('loading')

      const result = await signIn('google', {
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (result?.ok) {
        setStatus('success')
        // toast({
        //   title: "Sign In Successful",
        //   description: "Welcome to TracceAqua! Redirecting to dashboard...",
        // })
        toast.success("Sign In Successful")
        
        onSuccess?.()
        
        // Redirect after short delay to show success state
        setTimeout(() => {
          window.location.href = callbackUrl
        }, 1000)
      } else {
        throw new Error('Sign in failed')
      }

    } catch (error) {
      console.error('Google sign in error:', error)
      setStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Google sign in failed'
      onError?.(errorMessage)
    //   toast({
    //     title: "Sign In Failed",
    //     description: errorMessage,
    //     variant: "destructive",
    //   })
    
    toast.error("Sign In Failed")
      
      // Reset status after error display
      setTimeout(() => {
        setStatus('idle')
      }, 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-9 px-3 text-sm'
      case 'lg': return 'h-12 px-8 text-lg'
      default: return 'h-10 px-6'
    }
  }

  const getButtonText = () => {
    switch (status) {
      case 'loading': return 'Signing in...'
      case 'success': return 'Signed in successfully!'
      case 'error': return 'Sign in failed'
      default: return 'Continue with Google'
    }
  }

  const getButtonIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="mr-2 h-4 w-4 text-red-600" />
      default:
        return (
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )
    }
  }

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={isLoading || disabled || status === 'success'}
      variant={variant}
      className={cn(getSizeClasses(), className)}
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  )
}