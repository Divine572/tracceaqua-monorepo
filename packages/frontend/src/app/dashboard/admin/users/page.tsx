'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  Shield, 
  Ban, 
  CheckCircle2,
  AlertTriangle,
  Eye,
  RefreshCw,
  Filter,
  Calendar
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { User, UserRole, UserStatus } from '@/types'
import { formatDistanceToNow } from 'date-fns'

interface UsersResponse {
  users: User[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function AdminUsersPage() {
  const { user: currentUser, token } = useAuth()
  const queryClient = useQueryClient()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'suspend' | 'activate' | 'promote' | null>(null)

  // Fetch users
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'users', searchTerm],
    queryFn: async (): Promise<UsersResponse> => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      params.append('page', '1')
      params.append('limit', '50')

      // Placeholder data - replace with actual API call
      return {
        users: [
          {
            id: '1',
            address: '0x1234...5678',
            email: 'admin@tracceaqua.com',
            role: 'ADMIN' as UserRole,
            status: 'ACTIVE' as UserStatus,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z',
            profile: {
              id: '1',
              userId: '1',
              firstName: 'Admin',
              lastName: 'User',
              organization: 'TracceAqua',
              createdAt: '2024-01-15T10:00:00Z',
              updatedAt: '2024-01-15T10:00:00Z',
            }
          },
          {
            id: '2',
            address: '0x2234...6789',
            email: 'john.fisher@example.com',
            role: 'FISHERMAN' as UserRole,
            status: 'ACTIVE' as UserStatus,
            createdAt: '2024-02-10T14:30:00Z',
            updatedAt: '2024-02-10T14:30:00Z',
            profile: {
              id: '2',
              userId: '2',
              firstName: 'John',
              lastName: 'Fisher',
              organization: 'Lagos Fishing Cooperative',
              createdAt: '2024-02-10T14:30:00Z',
              updatedAt: '2024-02-10T14:30:00Z',
            }
          },
          {
            id: '3',
            address: '0x3234...7890',
            email: 'maria.santos@example.com',
            role: 'PENDING_UPGRADE' as UserRole,
            status: 'ACTIVE' as UserStatus,
            createdAt: '2024-02-15T09:15:00Z',
            updatedAt: '2024-02-15T09:15:00Z',
            profile: {
              id: '3',
              userId: '3',
              firstName: 'Maria',
              lastName: 'Santos',
              organization: 'Santos Processing',
              createdAt: '2024-02-15T09:15:00Z',
              updatedAt: '2024-02-15T09:15:00Z',
            }
          }
        ],
        pagination: {
          total: 3,
          page: 1,
          limit: 50,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        }
      }
    },
    enabled: !!token && currentUser?.role === 'ADMIN',
  })

  // User action mutation
  const userActionMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: string }) => {
      // Placeholder - replace with actual API call
      console.log('User action:', { userId, action })
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setActionModalOpen(false)
      setSelectedUser(null)
      setActionType(null)
    },
  })

  const handleUserAction = (user: User, action: 'suspend' | 'activate' | 'promote') => {
    setSelectedUser(user)
    setActionType(action)
    setActionModalOpen(true)
  }

  const confirmAction = async () => {
    if (!selectedUser || !actionType) return
    
    await userActionMutation.mutateAsync({
      userId: selectedUser.id,
      action: actionType,
    })
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'RESEARCHER':
        return 'bg-purple-100 text-purple-800'
      case 'FARMER':
        return 'bg-green-100 text-green-800'
      case 'FISHERMAN':
        return 'bg-blue-100 text-blue-800'
      case 'PROCESSOR':
        return 'bg-yellow-100 text-yellow-800'
      case 'TRADER':
        return 'bg-orange-100 text-orange-800'
      case 'RETAILER':
        return 'bg-pink-100 text-pink-800'
      case 'PENDING_UPGRADE':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-cyan-100 text-cyan-800'
    }
  }

  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'SUSPENDED':
        return <Ban className="w-4 h-4 text-red-600" />
      case 'PENDING':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  if (currentUser?.role !== 'ADMIN') {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Access denied. This page is only available to administrators.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-600">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersData?.pagination.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {usersData?.users.filter(u => u.status === 'ACTIVE').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professional Users</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {usersData?.users.filter(u => !['CONSUMER', 'PENDING_UPGRADE', 'ADMIN'].includes(u.role)).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Upgrades</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {usersData?.users.filter(u => u.role === 'PENDING_UPGRADE').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            All registered users on the TracceAqua platform
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : usersData?.users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                usersData?.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.profile?.firstName} {user.profile?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email || user.address.slice(0, 10) + '...'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleColor(user.role)}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(user.status)}
                        <span className="text-sm">{user.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.profile?.organization || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(user.createdAt))} ago
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          
                          {user.status === 'ACTIVE' && (
                            <DropdownMenuItem
                              onClick={() => handleUserAction(user, 'suspend')}
                              className="text-red-600"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend User
                            </DropdownMenuItem>
                          )}
                          
                          {user.status === 'SUSPENDED' && (
                            <DropdownMenuItem
                              onClick={() => handleUserAction(user, 'activate')}
                              className="text-green-600"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Activate User
                            </DropdownMenuItem>
                          )}
                          
                          {user.role === 'CONSUMER' && (
                            <DropdownMenuItem
                              onClick={() => handleUserAction(user, 'promote')}
                              className="text-blue-600"
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Promote Role
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Confirmation Modal */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Confirm {actionType === 'suspend' ? 'Suspend' : actionType === 'activate' ? 'Activate' : 'Promote'} User
            </DialogTitle>
            <DialogDescription>
              {actionType === 'suspend' && 'This will suspend the user account and prevent them from accessing the platform.'}
              {actionType === 'activate' && 'This will activate the user account and restore their access.'}
              {actionType === 'promote' && 'This will promote the user to a professional role.'}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">
                {selectedUser.profile?.firstName} {selectedUser.profile?.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {selectedUser.email || selectedUser.address}
              </p>
              <Badge variant="outline" className={`mt-1 ${getRoleColor(selectedUser.role)}`}>
                {selectedUser.role.replace('_', ' ')}
              </Badge>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={userActionMutation.isPending}
              className={
                actionType === 'suspend' ? 'bg-red-600 hover:bg-red-700' : 
                actionType === 'activate' ? 'bg-green-600 hover:bg-green-700' :
                'bg-blue-600 hover:bg-blue-700'
              }
            >
              {userActionMutation.isPending && (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              )}
              Confirm {actionType === 'suspend' ? 'Suspend' : actionType === 'activate' ? 'Activate' : 'Promote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}