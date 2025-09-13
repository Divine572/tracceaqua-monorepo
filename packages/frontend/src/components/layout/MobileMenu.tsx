'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { 
  Home, 
  QrCode, 
  User, 
  Settings, 
  LogOut, 
  Shield,
  Crown,
  Microscope,
  Truck,
  Store
} from 'lucide-react'
import { UserRole } from '@/lib/types'

export function MobileMenu() {
  const { user, isAuthenticated, logout } = useAuth()
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore()

  // Close menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [setMobileMenuOpen])

  const closeMenu = () => setMobileMenuOpen(false)

  const navigationItems = [
    { href: '/', label: 'Home', icon: Home, public: true },
    { href: '/scan', label: 'Scan QR Code', icon: QrCode, public: true },
    { href: '/dashboard', label: 'Dashboard', icon: User, requireAuth: true },
  ]

  const professionalItems = user && user.role !== UserRole.CONSUMER && user.role !== UserRole.PENDING_UPGRADE ? [
    { 
      href: '/dashboard/conservation', 
      label: 'Conservation', 
      icon: Microscope,
      roles: [UserRole.RESEARCHER, UserRole.ADMIN]
    },
    { 
      href: '/dashboard/supply-chain', 
      label: 'Supply Chain', 
      icon: Truck,
      roles: [UserRole.FARMER, UserRole.FISHERMAN, UserRole.PROCESSOR, UserRole.TRADER, UserRole.RETAILER, UserRole.ADMIN]
    },
  ] : []

  const adminItems = user?.role === UserRole.ADMIN ? [
    { href: '/dashboard/admin', label: 'Admin Panel', icon: Crown },
  ] : []

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full tracce-gradient flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            TracceAqua
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Main Navigation */}
          <div className="space-y-2">
            {navigationItems.map((item) => {
              if (item.requireAuth && !isAuthenticated) return null
              
              return (
                <Link key={item.href} href={item.href} onClick={closeMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Professional Features */}
          {professionalItems.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground px-2">
                  Professional Tools
                </h4>
                {professionalItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Admin Features */}
          {adminItems.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground px-2">
                  Administration
                </h4>
                {adminItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </>
          )}

          {isAuthenticated && (
            <>
              <Separator />
              <div className="space-y-2">
                <Link href="/profile" onClick={closeMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Button>
                </Link>

                {user?.role === UserRole.CONSUMER && (
                  <Link href="/profile/role-application" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Shield className="mr-2 h-4 w-4" />
                      Apply for Professional Role
                    </Button>
                  </Link>
                )}

                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-600 hover:text-red-600"
                  onClick={() => {
                    logout()
                    closeMenu()
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}