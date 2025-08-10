'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { TestHelpers } from '@/utils/test-helpers'
import { EnvChecker } from '@/components/debug/env-checker'

export default function TestPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const { user, isAuthenticated, connectWallet, signInWithWallet, logout } = useAuth()

  const runTests = async () => {
    setIsRunning(true)
    const results = await TestHelpers.runAllTests()
    setTestResults(results)
    setIsRunning(false)
  }

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Test page is only available in development mode.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>TracceAqua Development Testing</CardTitle>
            <CardDescription>
              Test various components and integrations in development mode
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Environment Check */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <EnvChecker />
          </CardContent>
        </Card>

        {/* System Tests */}
        <Card>
          <CardHeader>
            <CardTitle>System Tests</CardTitle>
            <CardDescription>Test core functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runTests} disabled={isRunning}>
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>

            {testResults && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>WalletConnect</span>
                  <Badge variant={testResults.walletConnect ? 'default' : 'destructive'}>
                    {testResults.walletConnect ? 'Pass' : 'Fail'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>API Connection</span>
                  <Badge variant={testResults.apiConnection ? 'default' : 'destructive'}>
                    {testResults.apiConnection ? 'Pass' : 'Fail'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Local Storage</span>
                  <Badge variant={testResults.localStorage ? 'default' : 'destructive'}>
                    {testResults.localStorage ? 'Pass' : 'Fail'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Authentication Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Testing</CardTitle>
            <CardDescription>Test wallet connection and authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isAuthenticated ? (
              <div className="space-y-2">
                <Button onClick={connectWallet}>Connect Wallet</Button>
                <Button onClick={signInWithWallet} variant="outline">
                  Sign In with Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">✅ Authenticated</p>
                  <p className="text-green-700 text-sm mt-1">
                    User: {user?.profile?.firstName || 'User'} ({user?.role})
                  </p>
                  <p className="text-green-600 text-xs font-mono mt-1">
                    {user?.address}
                  </p>
                </div>
                <Button onClick={logout} variant="outline">
                  Logout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Information */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle>Current User</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}