import { Metadata } from 'next'
import SupplyChainMainPage from '@/components/supply-chain/SupplyChainMainPage'

export const metadata: Metadata = {
  title: 'Supply Chain Traceability | TracceAqua Dashboard',
  description: 'Track shellfish products from source to consumer with blockchain-verified supply chain records.',
  keywords: ['supply chain', 'traceability', 'shellfish', 'blockchain', 'farmed', 'wild-capture', 'seafood'],
}

export default function SupplyChainPage() {
  return <SupplyChainMainPage />
}