'use client'

import { User, Settings, LogOut, UserCircle, Shield, Crown } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { formatAddress, getUserRoleColor } from '@/lib/utils'
import { UserRole, type User as UserType } from '@/lib/types'

interface UserDropdownProps {
  user: UserType
}

export function UserDropdown({ user }: UserDropdownProps) {
  const { logout } = useAuth()

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Crown className="h-4 w-4" />
      case UserRole.RESEARCHER:
      case UserRole.FARMER:
      case UserRole.FISHERMAN:
      case UserRole.PROCESSOR:
      case UserRole.TRADER:
      case UserRole.RETAILER:
        return <Shield className="h-4 w-4" />
      default:
        return <UserCircle className="h-4 w-4" />
    }
  }

  const displayName = user.name || user.email || formatAddress(user.address || '')
  const userInitials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.[0]?.toUpperCase() || '??'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || user.profile?.profileImage!} alt={displayName} />
            <AvatarFallback className="tracce-gradient text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {user.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
            {user.address && (
              <p className="text-xs leading-none text-muted-foreground">
                {formatAddress(user.address)}
              </p>
            )}
            <div className="flex items-center gap-2">
              {getRoleIcon(user.role)}
              <span className={`text-xs px-2 py-1 rounded-full ${getUserRoleColor(user.role)}`}>
                {user.role}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="w-full">
            <User className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/profile" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </Link>
        </DropdownMenuItem>

        {user.role === UserRole.CONSUMER && (
          <DropdownMenuItem asChild>
            <Link href="/profile/role-application" className="w-full">
              <Shield className="mr-2 h-4 w-4" />
              <span>Apply for Professional Role</span>
            </Link>
          </DropdownMenuItem>
        )}

        {user.role === UserRole.ADMIN && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard/admin" className="w-full">
              <Crown className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}