// src/components/auth/enhanced-auth-demo.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  Globe, 
  Mail, 
  User,
  LogOut,
  RefreshCw,
  ArrowRightLeft
} from 'lucide-react'
import { useEnhancedAuth } from '@/hooks/use-enhanced-auth'
import { EnhancedWalletConnectButton } from './enhanced-wallet-connect-button'

export function EnhancedAuthDemo() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    address,
    isConnected,
    appKitAccount,
    openConnectModal,
    disconnect,
    logout,
    switchWallet,
    clearError,
  } = useEnhancedAuth()

  const [activeTab, setActiveTab] = useState("auth")

  const getConnectionType = () => {
    if (isConnected && address) return 'Wallet Connection'
    if (appKitAccount.isConnected) return 'Social/Email Login'
    return 'Not Connected'
  }

  const getConnectionDetails = () => {
    if (isConnected && address) {
      return {
        type: 'wallet',
        address: address,
        method: 'Crypto Wallet',
        icon: <Wallet className="h-4 w-4" />
      }
    }
    if (appKitAccount.isConnected) {
      return {
        type: 'social',
        address: appKitAccount.address || appKitAccount.caipAddress,
        method: 'Social Login',
        icon: <Globe className="h-4 w-4" />
      }
    }
    return null
  }

  const connectionDetails = getConnectionDetails()

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Enhanced TracceAqua Authentication
          </CardTitle>
          <CardDescription>
            Supports wallet connections, Google login, and email authentication
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="status">Connection Status</TabsTrigger>
              <TabsTrigger value="user">User Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="auth" className="space-y-4">
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <EnhancedWalletConnectButton showMultipleOptions={true} />
                  
                  <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium mb-2">🎯 Available Methods:</div>
                    <ul className="space-y-1 text-xs">
                      <li>• <strong>Crypto Wallets:</strong> MetaMask, WalletConnect, etc.</li>
                      <li>• <strong>Google Login:</strong> Sign in with your Google account</li>
                      <li>• <strong>Email:</strong> Sign in with email address</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Successfully authenticated! Welcome to TracceAqua.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => logout(true)} 
                      variant="outline" 
                      size="sm"
                      disabled={isLoading}
                    >
                      <LogOut className="h-3 w-3 mr-1" />
                      Logout
                    </Button>
                    <Button 
                      onClick={() => disconnect(false)} 
                      variant="outline" 
                      size="sm"
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Disconnect
                    </Button>
                    <Button 
                      onClick={switchWallet} 
                      variant="outline" 
                      size="sm"
                      disabled={isLoading}
                    >
                      <ArrowRightLeft className="h-3 w-3 mr-1" />
                      Switch Wallet
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="status" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Connection Type:</span>
                  <Badge variant={connectionDetails ? "default" : "secondary"}>
                    {getConnectionType()}
                  </Badge>
                </div>
                
                {connectionDetails && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Method:</span>
                      <div className="flex items-center gap-1">
                        {connectionDetails.icon}
                        <span className="text-sm">{connectionDetails.method}</span>
                      </div>
                    </div>
                    
                    {connectionDetails.address && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Address:</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {connectionDetails.address.slice(0, 6)}...{connectionDetails.address.slice(-4)}
                        </code>
                      </div>
                    )}
                  </>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Authenticated:</span>
                  <div className="flex items-center gap-1">
                    {isAuthenticated ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-sm text-green-600">Yes</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">No</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
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
                      Clear
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="user" className="space-y-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4" />
                    <span className="font-medium">User Information</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Role:</span>
                      <div className="mt-1">
                        <Badge variant="outline">
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <div className="mt-1">
                        <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {user.email && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-600">Email:</span>
                        <div className="mt-1 text-sm">{user.email}</div>
                      </div>
                    )}
                    
                    {user.profile && (user.profile.firstName || user.profile.lastName) && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-600">Name:</span>
                        <div className="mt-1 text-sm">
                          {user.profile.firstName} {user.profile.lastName}
                        </div>
                      </div>
                    )}
                    
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Address:</span>
                      <div className="mt-1 font-mono text-xs break-all">
                        {user.address}
                      </div>
                    </div>
                    
                    {user.isNewUser && (
                      <div className="col-span-2">
                        <Badge variant="secondary" className="text-green-600">
                          New User
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No user authenticated</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
