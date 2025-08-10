// src/components/auth/simple-auth-demo.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Wallet, CheckCircle, AlertCircle } from 'lucide-react'
import { useSimpleAuth } from '@/hooks/use-simple-auth'

export function SimpleAuthDemo() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    address,
    isConnected,
    connectWallet,
    disconnectWallet,
    logout,
    clearError,
  } = useSimpleAuth()

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Simple Wallet Authentication
          </CardTitle>
          <CardDescription>
            Connect your wallet to access TracceAqua - no signatures required!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button
                  variant="link"
                  size="sm"
                  onClick={clearError}
                  className="ml-2 p-0 h-auto"
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Connection Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Wallet Status:</span>
              <span className={`flex items-center gap-1 ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                {isConnected ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </>
                ) : (
                  'Not Connected'
                )}
              </span>
            </div>
            
            {address && (
              <div className="text-xs text-gray-600 break-all">
                {address}
              </div>
            )}
          </div>

          {/* Authentication Status */}
          <div className="flex items-center justify-between text-sm">
            <span>Auth Status:</span>
            <span className={`flex items-center gap-1 ${isAuthenticated ? 'text-green-600' : 'text-gray-500'}`}>
              {isAuthenticated ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Authenticated
                </>
              ) : (
                'Not Authenticated'
              )}
            </span>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-sm font-medium">Welcome!</div>
              <div className="text-xs text-gray-600">
                Role: {user.role}
                {user.isNewUser && <span className="ml-2 text-green-600">(New User)</span>}
              </div>
              {user.profile && (user.profile.firstName || user.profile.lastName) && (
                <div className="text-xs text-gray-600">
                  {user.profile.firstName} {user.profile.lastName}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {!isConnected ? (
              <Button 
                onClick={connectWallet} 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-2">
                {!isAuthenticated ? (
                  <div className="text-center text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                    Authenticating...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={logout} 
                      variant="outline"
                      disabled={isLoading}
                    >
                      Logout
                    </Button>
                    <Button 
                      onClick={disconnectWallet} 
                      variant="outline"
                      disabled={isLoading}
                    >
                      Disconnect
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Benefits List */}
          <div className="pt-4 border-t">
            <div className="text-xs text-gray-600 space-y-1">
              <div className="font-medium">✨ Simple Authentication:</div>
              <div>• No confusing signature requests</div>
              <div>• Works with all wallet types</div>
              <div>• Perfect for industry users</div>
              <div>• Automatic account creation</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
