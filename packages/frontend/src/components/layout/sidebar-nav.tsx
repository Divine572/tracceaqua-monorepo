'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  QrCode, 
  History, 
  User, 
  Settings, 
  Shield, 
  FileText, 
  Users,
  Building2,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRoleApplications } from '@/hooks/use-role-applications'
import { NavigationItem, UserRole, RoleApplication } from '@/types'

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['*'],
  },
  {
    name: 'Scan QR Code',
    href: '/scan',
    icon: QrCode,
    roles: ['*'],
  },
  {
    name: 'History',
    href: '/history',
    icon: History,
    roles: ['*'],
  },
  {
    name: 'Apply for Role',
    href: '/apply-role',
    icon: User,
    roles: ['CONSUMER', 'PENDING_UPGRADE'],
  },
  {
    name: 'My Applications',
    href: '/apply-role',
    icon: FileText,
    roles: ['CONSUMER', 'PENDING_UPGRADE'],
  },
  // Professional User Features
  {
    name: 'Conservation',
    href: '/conservation',
    icon: Building2,
    roles: ['RESEARCHER', 'FARMER', 'FISHERMAN'],
  },
  {
    name: 'Supply Chain',
    href: '/supply-chain',
    icon: Building2,
    roles: ['FARMER', 'FISHERMAN', 'PROCESSOR', 'TRADER', 'RETAILER'],
  },
  // Admin Features
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    name: 'Role Applications',
    href: '/admin/applications',
    icon: Shield,
    roles: ['ADMIN'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['*'],
  },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { userApplications } = useRoleApplications()
  const [expandedSections, setExpandedSections] = useState<string[]>(['main'])

  // Count pending applications for admin badge
  const pendingApplicationsCount = user?.role === 'ADMIN' 
    ? userApplications?.filter((app: RoleApplication) => app.status === 'PENDING' || app.status === 'RESUBMITTED').length || 0
    : 0

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const canAccessRoute = (roles: UserRole[] | ['*']) => {
    // Check if it's a wildcard role (accessible to all users)
    if (Array.isArray(roles) && roles.length === 1 && roles[0] === '*') return true
    if (!user?.role) return false
    return (roles as UserRole[]).includes(user.role as UserRole)
  }

  const getItemBadge = (item: NavigationItem) => {
    if (item.href === '/admin/applications' && pendingApplicationsCount > 0) {
      return (
        <Badge variant="destructive" className="ml-auto text-xs">
          {pendingApplicationsCount}
        </Badge>
      )
    }
    
    if (item.href === '/apply-role' && user?.role === 'PENDING_UPGRADE') {
      return (
        <Badge variant="outline" className="ml-auto text-xs bg-yellow-50 text-yellow-700">
          Pending
        </Badge>
      )
    }
    
    return null
  }

  // Group navigation items
  const mainItems = navigationItems.filter(item => 
    ['Dashboard', 'Scan QR Code', 'History'].includes(item.name)
  )
  
  const roleItems = navigationItems.filter(item => 
    ['Apply for Role', 'My Applications'].includes(item.name)
  )
  
  const professionalItems = navigationItems.filter(item => 
    ['Conservation', 'Supply Chain'].includes(item.name)
  )
  
  const adminItems = navigationItems.filter(item => 
    ['User Management', 'Role Applications'].includes(item.name)
  )
  
  const settingsItems = navigationItems.filter(item => 
    ['Settings'].includes(item.name)
  )

  const NavSection = ({ 
    title, 
    items, 
    sectionKey, 
    collapsible = true 
  }: { 
    title: string
    items: NavigationItem[]
    sectionKey: string
    collapsible?: boolean
  }) => {
    const isExpanded = expandedSections.includes(sectionKey)
    const visibleItems = items.filter(item => canAccessRoute(item.roles))
    
    if (visibleItems.length === 0) return null

    return (
      <div className="space-y-1">
        {collapsible ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSection(sectionKey)}
            className="w-full justify-start px-2 text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <ChevronDown className="mr-1 h-3 w-3" />
            ) : (
              <ChevronRight className="mr-1 h-3 w-3" />
            )}
            {title}
          </Button>
        ) : (
          <p className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
        )}
        
        {(!collapsible || isExpanded) && (
          <div className="space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveLink(item.href)
              
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={`w-full justify-start ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span className="flex-1 text-left">{item.name}</span>
                    {getItemBadge(item)}
                  </Button>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <nav className="space-y-4 py-4">
      <NavSection 
        title="Main"
        items={mainItems}
        sectionKey="main"
        collapsible={false}
      />
      
      <NavSection 
        title="Role Management"
        items={roleItems}
        sectionKey="roles"
      />
      
      <NavSection 
        title="Professional Tools"
        items={professionalItems}
        sectionKey="professional"
      />
      
      <NavSection 
        title="Administration"
        items={adminItems}
        sectionKey="admin"
      />
      
      <NavSection 
        title="Account"
        items={settingsItems}
        sectionKey="settings"
        collapsible={false}
      />
    </nav>
  )
}
