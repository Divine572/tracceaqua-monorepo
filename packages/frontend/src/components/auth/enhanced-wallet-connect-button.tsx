// src/components/auth/enhanced-wallet-connect-button.tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wallet, Loader2, CheckCircle2, AlertCircle, Mail, Globe, ArrowRightLeft, RefreshCw } from 'lucide-react'
import { useEnhancedAuth } from '@/hooks/use-enhanced-auth'

interface EnhancedWalletConnectButtonProps {
  onSuccess?: () => void
  className?: string
  showMultipleOptions?: boolean
  showSwitchWallet?: boolean
}

export function EnhancedWalletConnectButton({ 
  onSuccess, 
  className,
  showMultipleOptions = true,
  showSwitchWallet = true
}: EnhancedWalletConnectButtonProps) {
  const { 
    openConnectModal,
    isConnected, 
    address,
    appKitAccount,
    isLoading, 
    error, 
    clearError,
    user,
    isAuthenticated,
    switchWallet
  } = useEnhancedAuth()

  const handleConnect = async () => {
    clearError()
    openConnectModal()
  }

  // Call onSuccess when authentication completes
  React.useEffect(() => {
    if (isAuthenticated && user && onSuccess) {
      onSuccess()
    }
  }, [isAuthenticated, user, onSuccess])

  // Determine connection type for display
  const getConnectionInfo = () => {
    if (isConnected && address) {
      return {
        type: 'wallet',
        address: address,
        icon: <Wallet className="w-3 h-3" />
      }
    } else if (appKitAccount.isConnected) {
      return {
        type: 'social',
        address: appKitAccount.address || appKitAccount.caipAddress,
        icon: <Globe className="w-3 h-3" />
      }
    }
    return null
  }

  const connectionInfo = getConnectionInfo()

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
              {connectionInfo && (
                <div className="flex items-center justify-center gap-1 text-xs text-green-600 mt-1">
                  {connectionInfo.icon}
                  <span>
                    {connectionInfo.type === 'wallet' ? 'Wallet' : 'Social'} Authentication
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        {showSwitchWallet && (
          <CardContent className="pt-2 border-t">
            <Button
              onClick={async () => await switchWallet()}
              variant="outline"
              className="w-full h-8 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Switch Wallet
            </Button>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="text-center pb-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Wallet className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle className="text-lg">Connect to TracceAqua</CardTitle>
        <CardDescription className="text-sm">
          {showMultipleOptions 
            ? "Connect with wallet, Google, or email" 
            : "Connect your wallet to access TracceAqua"
          }
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
            disabled={isLoading || connectionInfo !== null}
            className="w-full h-10 text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {connectionInfo ? 'Authenticating...' : 'Connecting...'}
              </>
            ) : connectionInfo ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect to TracceAqua
              </>
            )}
          </Button>

          {connectionInfo && (
            <div className="p-2 bg-blue-50 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 text-xs font-medium text-blue-900 mb-1">
                {connectionInfo.icon}
                <span>
                  {connectionInfo.type === 'wallet' ? 'Wallet' : 'Social'} Connected
                </span>
              </div>
              {connectionInfo.address && (
                <p className="text-xs text-blue-600 font-mono">
                  {connectionInfo.address.slice(0, 6)}...{connectionInfo.address.slice(-4)}
                </p>
              )}
            </div>
          )}
        </div>

        {showMultipleOptions && (
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Multiple authentication options:</p>
            <div className="flex items-center justify-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <Wallet className="w-3 h-3" />
                Crypto Wallets
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Google
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Email
              </span>
            </div>
            <p className="text-xs mt-1">
              Perfect for all users - crypto native or traditional
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
