import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProviders } from '@/providers/app-providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TracceAqua - Seafood Traceability',
  description: 'Blockchain-based seafood traceability system for the Nigerian shellfish supply chain',
  keywords: ['seafood', 'traceability', 'blockchain', 'sustainability', 'Nigeria'],
  authors: [{ name: 'TracceAqua Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#3b82f6',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192x192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
