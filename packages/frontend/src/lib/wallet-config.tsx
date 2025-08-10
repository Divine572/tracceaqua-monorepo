import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia } from 'wagmi/chains'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!
const sepoliaRpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set')
}

// Create Wagmi adapter with Sepolia testnet
const wagmiAdapter = new WagmiAdapter({
  networks: [sepolia],
  projectId,
  ssr: true, // Important for Next.js SSR
})

// Create AppKit instance
const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [sepolia],
  projectId,
  metadata: {
    name: 'TracceAqua',
    description: 'Blockchain Seafood Traceability System',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://tracceaqua.vercel.app',
    icons: ['https://tracceaqua.vercel.app/favicon.ico']
  },
  features: {
    email: true, // Enable email login
    socials: ['google'], // Enable Google social login
    emailShowWallets: true, // Show wallet options in email flow
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#3b82f6', // TracceAqua blue
    '--w3m-color-mix-strength': 20,
    '--w3m-accent': '#3b82f6', // Primary blue
    '--w3m-border-radius-master': '12px',
  },
})

// Export the wagmi config for use in providers
export const wagmiConfig = wagmiAdapter.wagmiConfig

// Create React Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
})

// Provider component for wrapping the app
export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default appKit