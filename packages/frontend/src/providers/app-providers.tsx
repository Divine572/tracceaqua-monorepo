'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { WagmiProvider } from 'wagmi'
import { Toaster } from '@/components/ui/sonner'
import { Web3Provider } from '@/lib/wallet-config'
import { OnboardingProvider } from '@/components/onboarding/onboarding-provider'
import { useState } from 'react'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <OnboardingProvider>
          {children}
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </OnboardingProvider>
      </Web3Provider>
    </QueryClientProvider>
  )
}