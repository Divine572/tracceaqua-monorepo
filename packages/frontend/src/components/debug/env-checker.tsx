'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

// Only show in development
export function EnvChecker() {
  const [showDetails, setShowDetails] = useState(false)

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const envVars = [
    {
      name: 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
      value: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      required: true,
      description: 'WalletConnect Project ID from cloud.walletconnect.com',
    },
    {
      name: 'NEXT_PUBLIC_API_URL',
      value: process.env.NEXT_PUBLIC_API_URL,
      required: true,
      description: 'Backend API base URL',
    },
    {
      name: 'NEXT_PUBLIC_SEPOLIA_RPC_URL',
      value: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
      required: true,
      description: 'Sepolia testnet RPC URL',
    },
    {
      name: 'NEXT_PUBLIC_APP_URL',
      value: process.env.NEXT_PUBLIC_APP_URL,
      required: false,
      description: 'Frontend app URL',
    },
    {
      name: 'NEXT_PUBLIC_PINATA_GATEWAY',
      value: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
      required: false,
      description: 'Pinata IPFS gateway URL',
    },
  ]

  const getStatus = (envVar: any) => {
    if (envVar.required && !envVar.value) {
      return { status: 'error', icon: XCircle, color: 'text-red-600' }
    }
    if (!envVar.required && !envVar.value) {
      return { status: 'warning', icon: AlertCircle, color: 'text-yellow-600' }
    }
    return { status: 'success', icon: CheckCircle2, color: 'text-green-600' }
  }

  const allRequired = envVars.filter(v => v.required).every(v => v.value)

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Environment Check</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={allRequired ? 'default' : 'destructive'}>
              {allRequired ? 'Ready' : 'Issues Found'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <CardDescription className="text-xs">
          Development environment validation
        </CardDescription>
      </CardHeader>
      
      {showDetails && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {envVars.map((envVar) => {
              const { status, icon: Icon, color } = getStatus(envVar)
              return (
                <div key={envVar.name} className="flex items-start gap-2 text-xs">
                  <Icon className={`h-4 w-4 mt-0.5 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-medium truncate">{envVar.name}</p>
                    <p className="text-gray-600">{envVar.description}</p>
                    {envVar.value && (
                      <p className="font-mono text-gray-500 truncate">
                        {envVar.value.length > 30 
                          ? `${envVar.value.substring(0, 30)}...` 
                          : envVar.value
                        }
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          {!allRequired && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Some required environment variables are missing. 
                Check your <code>.env.local</code> file.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
