'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  Database,
  RefreshCw,
  UserCheck,
  UserX,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

interface AdminStats {
  totalUsers: number
  pendingApplications: number
  activeUsers: number
  recordsToday: number
  systemHealth: 'healthy' | 'warning' | 'error'
  recentUsers: number
  conservationRecords: number
  supplyChainRecords: number
  verifiedRecords: number
  qrCodesGenerated: number
  blockchainRecords: number
}

interface RecentActivity {
  id: string
  type: 'USER_REGISTERED' | 'ROLE_APPLIED' | 'RECORD_CREATED' | 'RECORD_VERIFIED'
  description: string
  user: string
  timestamp: string
  status?: 'pending' | 'approved' | 'rejected'
}

interface PendingApplication {
  id: string
  userId: string
  requestedRole: string
  userName: string
  userEmail: string
  organization?: string
  appliedAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

// **ADMIN API SERVICE - NO FALLBACKS**
class AdminApiService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken')
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }
    return response.json()
  }

  async getAdminStats(): Promise<AdminStats> {
    const response = await fetch(`${this.baseURL}/admin/stats`, {
      headers: this.getHeaders()
    })
    return this.handleResponse<AdminStats>(response)
  }

  async getPendingApplications(): Promise<PendingApplication[]> {
    const response = await fetch(`${this.baseURL}/admin/applications?status=PENDING`, {
      headers: this.getHeaders()
    })
    const data = await this.handleResponse<{ applications: PendingApplication[] }>(response)
    return data.applications
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    const response = await fetch(`${this.baseURL}/admin/activity?limit=10`, {
      headers: this.getHeaders()
    })
    const data = await this.handleResponse<{ activities: RecentActivity[] }>(response)
    return data.activities
  }

  async approveApplication(applicationId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/admin/applications/${applicationId}/approve`, {
      method: 'POST',
      headers: this.getHeaders()
    })
    await this.handleResponse(response)
  }

  async rejectApplication(applicationId: string, reason?: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/admin/applications/${applicationId}/reject`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason })
    })
    await this.handleResponse(response)
  }

  async getSystemHealth(): Promise<{ status: string; checks: any[] }> {
    const response = await fetch(`${this.baseURL}/admin/health`, {
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }
}

const adminApi = new AdminApiService()

export function AdminDashboard() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // **PURE API INTEGRATION - NO MOCK FALLBACKS**
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: () => adminApi.getAdminStats(),
    enabled: !!token && user?.role === 'ADMIN',
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  })

  // **PENDING APPLICATIONS - PURE API**
  const {
    data: pendingApplications,
    isLoading: applicationsLoading,
    error: applicationsError,
    refetch: refetchApplications
  } = useQuery({
    queryKey: ['admin', 'pending-applications'],
    queryFn: () => adminApi.getPendingApplications(),
    enabled: !!token && user?.role === 'ADMIN',
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 3
  })

  // **RECENT ACTIVITY - PURE API**
  const {
    data: recentActivity,
    isLoading: activityLoading,
    error: activityError
  } = useQuery({
    queryKey: ['admin', 'recent-activity'],
    queryFn: () => adminApi.getRecentActivity(),
    enabled: !!token && user?.role === 'ADMIN',
    staleTime: 1 * 60 * 1000,
    retry: 3
  })

  // **APPLICATION APPROVAL MUTATION**
  const approveApplicationMutation = useMutation({
    mutationFn: adminApi.approveApplication,
    onSuccess: () => {
      toast({
        title: "Application Approved",
        description: "User role has been upgraded successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve application.",
        variant: "destructive"
      })
    },
  })

  // **APPLICATION REJECTION MUTATION**  
  const rejectApplicationMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminApi.rejectApplication(id, reason),
    onSuccess: () => {
      toast({
        title: "Application Rejected",
        description: "Application has been rejected.",
      })
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject application.",
        variant: "destructive"
      })
    },
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

  const handleApproveApplication = async (applicationId: string) => {
    if (confirm('Are you sure you want to approve this role application?')) {
      approveApplicationMutation.mutate(applicationId)
    }
  }

  const handleRejectApplication = async (applicationId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):')
    if (confirm('Are you sure you want to reject this application?')) {
      rejectApplicationMutation.mutate({ id: applicationId, reason: reason || undefined })
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  // **LOADING STATE**
  if (statsLoading && applicationsLoading && activityLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  // **ERROR STATE - NO FALLBACKS**  
  if (statsError || applicationsError || activityError) {
    const hasAnyError = statsError || applicationsError || activityError
    const errorMessage = (statsError as Error)?.message ||
      (applicationsError as Error)?.message ||
      (activityError as Error)?.message ||
      'Failed to load admin dashboard'

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Admin Dashboard Error</h3>
            <p className="mt-1 text-sm text-gray-500">
              {errorMessage}
            </p>
            <div className="mt-4 space-x-2">
              <Button
                onClick={() => {
                  refetchStats()
                  refetchApplications()
                }}
                disabled={statsLoading || applicationsLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${(statsLoading || applicationsLoading) ? 'animate-spin' : ''}`} />
                Retry
              </Button>
              <Link href="/dashboard/admin/users">
                <Button variant="outline">
                  Go to User Management
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.profile?.firstName || 'Admin'}. Here's what's happening with TracceAqua today.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            refetchStats()
            refetchApplications()
          }}
          disabled={statsLoading || applicationsLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${(statsLoading || applicationsLoading) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards - Only show if data is available */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats as AdminStats).totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{(stats as AdminStats).recentUsers} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{(stats as AdminStats).pendingApplications}</div>
              <p className="text-xs text-muted-foreground">
                Require your review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{(stats as AdminStats).activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Currently online
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              {getHealthIcon((stats as AdminStats).systemHealth)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getHealthColor((stats as AdminStats).systemHealth)}`}>
                {(stats as AdminStats).systemHealth.toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground">
                System status
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common administrative tasks and system management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Link href="/dashboard/admin/users">
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
                  <CardTitle className="text-lg">Role Applications</CardTitle>
                  <CardDescription>
                    Review and approve user role upgrade requests
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href="/dashboard/admin/applications">
                    <Button className="w-full" variant="outline">
                      Review Applications
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* System Stats - Only show if data is available */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-600" />
                  System Statistics
                </CardTitle>
                <CardDescription>
                  Platform usage and data statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{(stats as AdminStats).conservationRecords}</div>
                    <div className="text-sm text-gray-600">Conservation Records</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{(stats as AdminStats).supplyChainRecords}</div>
                    <div className="text-sm text-gray-600">Supply Chain Records</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{(stats as AdminStats).qrCodesGenerated}</div>
                    <div className="text-sm text-gray-600">QR Codes Generated</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{(stats as AdminStats).blockchainRecords}</div>
                    <div className="text-sm text-gray-600">Blockchain Records</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity & Pending Applications */}
        <div className="space-y-6">
          {/* Pending Applications Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  Pending Applications
                </span>
                <Badge variant="secondary">{pendingApplications?.length || 0}</Badge>
              </CardTitle>
              <CardDescription>
                Role upgrade requests awaiting your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : applicationsError ? (
                <div className="text-center py-4 text-red-500">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Failed to load applications</p>
                </div>
              ) : pendingApplications && pendingApplications.length > 0 ? (
                <div className="space-y-4">
                  {pendingApplications.slice(0, 3).map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{application.userName}</div>
                        <div className="text-sm text-gray-500">
                          Applying for <Badge variant="outline">{application.requestedRole}</Badge>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatTimeAgo(application.appliedAt)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproveApplication(application.id)}
                          disabled={approveApplicationMutation.isPending}
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectApplication(application.id)}
                          disabled={rejectApplicationMutation.isPending}
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                      {pendingApplications.length > 3 && (
                        <Link href="/dashboard/admin/applications">
                          <Button variant="outline" className="w-full">
                            View All {pendingApplications.length} Applications
                          </Button>
                        </Link>
                      )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No pending applications</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest user actions and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : activityError ? (
                <div className="text-center py-4 text-red-500">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Failed to load activity</p>
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {activity.type === 'USER_REGISTERED' && <Users className="w-4 h-4 text-blue-600" />}
                            {activity.type === 'ROLE_APPLIED' && <FileText className="w-4 h-4 text-yellow-600" />}
                            {activity.type === 'RECORD_CREATED' && <Database className="w-4 h-4 text-green-600" />}
                            {activity.type === 'RECORD_VERIFIED' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm">
                              <span className="font-medium">{activity.user}</span> {activity.description}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              {formatTimeAgo(activity.timestamp)}
                              {activity.status && (
                                <Badge variant="outline" className="text-xs">
                                  {activity.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
              ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No recent activity</p>
                      </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}