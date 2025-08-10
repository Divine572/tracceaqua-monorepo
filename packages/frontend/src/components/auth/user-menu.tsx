'use client'

import { useState } from 'react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Settings, LogOut, Shield } from 'lucide-react'
import { useSimpleAuth } from '@/hooks/use-simple-auth'
import { useRouter } from 'next/navigation'

export function UserMenu() {
  const { user, logout, isLoading } = useSimpleAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
    router.push('/')
  }

  const getInitials = (user: any) => {
    if (user.profile?.firstName && user.profile?.lastName) {
      return `${user.profile.firstName[0]}${user.profile.lastName[0]}`
    }
    return user.address.slice(2, 4).toUpperCase()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'RESEARCHER': return 'bg-purple-100 text-purple-800'
      case 'FARMER': return 'bg-green-100 text-green-800'
      case 'FISHERMAN': return 'bg-blue-100 text-blue-800'
      case 'PROCESSOR': return 'bg-yellow-100 text-yellow-800'
      case 'TRADER': return 'bg-orange-100 text-orange-800'
      case 'RETAILER': return 'bg-pink-100 text-pink-800'
      case 'PENDING_UPGRADE': return 'bg-gray-100 text-gray-800'
      default: return 'bg-cyan-100 text-cyan-800'
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profile?.profileImage} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {user.profile?.firstName} {user.profile?.lastName} 
                {!user.profile?.firstName && 'User'}
              </p>
              <Badge variant="secondary" className={getRoleColor(user.role)}>
                {user.role.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {user.address.slice(0, 6)}...{user.address.slice(-4)}
            </p>
            {user.email && (
              <p className="text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        {user.role === 'ADMIN' && (
          <DropdownMenuItem onClick={() => router.push('/admin')}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Admin Panel</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}