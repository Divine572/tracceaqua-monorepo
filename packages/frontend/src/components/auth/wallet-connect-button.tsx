// src/components/auth/wallet-connect-button.tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wallet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useSimpleAuth } from '@/hooks/use-simple-auth'

interface WalletConnectButtonProps {
  onSuccess?: () => void
  className?: string
}

export function WalletConnectButton({ onSuccess, className }: WalletConnectButtonProps) {
  const { 
    connectWallet,
    isConnected, 
    address, 
    isLoading, 
    error, 
    clearError,
    user,
    isAuthenticated
  } = useSimpleAuth()

  const handleConnect = async () => {
    clearError()
    connectWallet()
  }

  // Call onSuccess when authentication completes
  React.useEffect(() => {
    if (isAuthenticated && user && onSuccess) {
      onSuccess()
    }
  }, [isAuthenticated, user, onSuccess])

  if (isAuthenticated && user) {
    return (
      <Card className="w-full border-green-200 bg-green-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-green-900">Welcome to TracceAqua!</h3>
              <p className="text-sm text-green-700 mt-1">
                {user.isNewUser ? 'Your account has been created' : 'Successfully connected'}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Role: {user.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="text-center pb-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Wallet className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle className="text-lg">Connect Your Wallet</CardTitle>
        <CardDescription className="text-sm">
          Connect your wallet, use Google, or sign in with email
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleConnect}
            disabled={isLoading || isConnected}
            className="w-full h-10 text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isConnected ? 'Authenticating...' : 'Connecting...'}
              </>
            ) : isConnected ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>

          {isConnected && address && (
            <div className="p-2 bg-blue-50 rounded-lg text-center">
              <p className="text-xs font-medium text-blue-900">Wallet Connected</p>
              <p className="text-xs text-blue-600 mt-0.5 font-mono">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Multiple authentication options</p>
          <p className="text-xs mt-0.5">
            Perfect for all users - crypto native or traditional
          </p>
        </div>
      </CardContent>
    </Card>
  )
}