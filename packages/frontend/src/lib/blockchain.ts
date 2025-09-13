import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { sepolia } from '@reown/appkit/networks'

// Get projectId from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set')
}

// Set up the Ethers adapter
const ethersAdapter = new EthersAdapter()

// Set up metadata
const metadata = {
  name: 'TracceAqua',
  description: 'Blockchain Seafood Traceability System',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  icons: ['https://tracceaqua.vercel.app/icon-192x192.png']
}

// Create the modal with Sepolia configuration
export const appKit = createAppKit({
  adapters: [ethersAdapter],
  projectId,
  networks: [sepolia],
  defaultNetwork: sepolia,
  metadata,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'github', 'x', 'discord'],
    emailShowWallets: true,
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#3b82f6',
    '--w3m-color-mix-strength': 40,
    '--w3m-accent': '#3b82f6',
    '--w3m-border-radius-master': '8px',
    '--w3m-font-family': 'Inter, system-ui, sans-serif'
  }
})

export const SEPOLIA_CONFIG = {
  chainId: 11155111,
  name: 'Sepolia',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com'
}

// Helper function to format wallet address
export function formatWalletAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Helper function to validate wallet address
export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}