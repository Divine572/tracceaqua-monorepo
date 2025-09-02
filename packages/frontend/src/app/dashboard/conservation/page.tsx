import { Metadata } from 'next'
import ConservationMainPage from '@/components/conservation/ConservationMainPage'

export const metadata: Metadata = {
  title: 'Conservation Records | TracceAqua Dashboard',
  description: 'Manage and track shellfish conservation records with blockchain-verified data collection.',
  keywords: ['conservation', 'shellfish', 'marine biology', 'research', 'traceability'],
}

export default function ConservationPage() {
  return <ConservationMainPage />
}