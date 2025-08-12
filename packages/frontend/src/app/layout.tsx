import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProviders } from '@/providers/app-providers'
import { AuthProvider } from '@/components/providers/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TracceAqua - Blockchain Seafood Traceability',
  description: 'Your trusted partner for traceability and conservation in the Nigerian shellfish supply chain',
  keywords: ['seafood', 'traceability', 'blockchain', 'sustainability', 'Nigeria', 'aquaculture'],
  authors: [{ name: 'TracceAqua Team' }],
  creator: 'TracceAqua',
  publisher: 'TracceAqua',
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
          <AuthProvider>
            {children}
          </AuthProvider>
        </AppProviders>
      </body>
    </html>
  )
}