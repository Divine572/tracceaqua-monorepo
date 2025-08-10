'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { UserMenu } from '@/components/auth/user-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Menu, 
  X, 
  Home, 
  QrCode, 
  History, 
  User, 
  Settings,
  Shield,
  Fish,
  Truck,
  Store
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['*'] },
  { name: 'Scan QR', href: '/scan', icon: QrCode, roles: ['*'] },
  { name: 'History', href: '/history', icon: History, roles: ['*'] },
  { name: 'Conservation', href: '/conservation', icon: Fish, roles: ['RESEARCHER', 'ADMIN'] },
  { name: 'Supply Chain', href: '/supply-chain', icon: Truck, roles: ['FARMER', 'FISHERMAN', 'PROCESSOR', 'TRADER', 'RETAILER', 'ADMIN'] },
  { name: 'Admin', href: '/admin', icon: Shield, roles: ['ADMIN'] },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  const canAccessRoute = (routeRoles: string[]) => {
    if (!user) return false
    return routeRoles.includes('*') || routeRoles.includes(user.role)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200'
      case 'RESEARCHER': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'FARMER': return 'bg-green-100 text-green-800 border-green-200'
      case 'FISHERMAN': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PROCESSOR': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'TRADER': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'RETAILER': return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'PENDING_UPGRADE': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-cyan-100 text-cyan-800 border-cyan-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
          <SidebarContent 
            navigation={navigation}
            user={user}
            canAccessRoute={canAccessRoute}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
        <SidebarContent 
          navigation={navigation}
          user={user}
          canAccessRoute={canAccessRoute}
        />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">TracceAqua</h1>
                {user && (
                  <Badge variant="outline" className={`mt-1 ${getRoleColor(user.role)}`}>
                    {user.role.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
            
            <UserMenu />
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

// Sidebar content component
function SidebarContent({ 
  navigation, 
  user, 
  canAccessRoute, 
  onClose 
}: {
  navigation: any[]
  user: any
  canAccessRoute: (roles: string[]) => boolean
  onClose?: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Fish className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">TracceAqua</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* User info */}
      {user && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.profile?.firstName} {user.profile?.lastName} 
                {!user.profile?.firstName && 'User'}
              </p>
              <p className="text-xs text-gray-500 font-mono truncate">
                {user.address.slice(0, 6)}...{user.address.slice(-4)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            if (!canAccessRoute(item.roles)) return null
            
            return (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  onClick={onClose}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          © 2024 TracceAqua. All rights reserved.
        </p>
      </div>
    </div>
  )
}
