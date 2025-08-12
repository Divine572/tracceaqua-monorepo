'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FileText, 
  Shield, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Activity,
  Database
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

interface AdminStats {
  totalUsers: number
  pendingApplications: number
  activeUsers: number
  recordsToday: number
  systemHealth: 'healthy' | 'warning' | 'error'
}

export function AdminDashboard() {
  const { user, token } = useAuth()

  // Fetch admin statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: async (): Promise<AdminStats> => {
      // Placeholder data - replace with actual API call
      return {
        totalUsers: 1247,
        pendingApplications: 8,
        activeUsers: 892,
        recordsToday: 34,
        systemHealth: 'healthy'
      }
    },
    enabled: !!token && user?.role === 'ADMIN',
  })

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.profile?.firstName || 'Admin'}. Here's what's happening with TracceAqua today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.pendingApplications || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Require review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Online this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {stats?.systemHealth && getHealthIcon(stats.systemHealth)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(stats?.systemHealth || 'healthy')}`}>
              {stats?.systemHealth?.toUpperCase() || 'HEALTHY'}
            </div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Management */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">User Management</CardTitle>
            <CardDescription>
              Manage user accounts, roles, and permissions across the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/admin/users">
              <Button className="w-full">
                Manage Users
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Role Applications */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <CardTitle className="text-lg flex items-center gap-2">
              Role Applications
              {stats?.pendingApplications && stats.pendingApplications > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.pendingApplications}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Review and approve professional role applications
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/admin/applications">
              <Button variant="outline" className="w-full">
                Review Applications
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* System Analytics */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">System Analytics</CardTitle>
            <CardDescription>
              View platform usage statistics and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest user registrations and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">New user registration</p>
                <p className="text-sm text-muted-foreground">
                  John Fisherman joined as a Consumer
                </p>
              </div>
              <div className="text-sm text-muted-foreground">2m ago</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Role application submitted</p>
                <p className="text-sm text-muted-foreground">
                  Maria Santos applied for Processor role
                </p>
              </div>
              <div className="text-sm text-muted-foreground">15m ago</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Conservation record created</p>
                <p className="text-sm text-muted-foreground">
                  Dr. Johnson uploaded new research data
                </p>
              </div>
              <div className="text-sm text-muted-foreground">1h ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

