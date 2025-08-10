'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ConsumerDashboard } from '@/components/dashboard/consumer-dashboard'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Users, BarChart3, Settings, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()

  const renderDashboardContent = () => {
    if (!user) return null

    switch (user.role) {
      case 'CONSUMER':
        return <ConsumerDashboard />
      
      case 'PENDING_UPGRADE':
        return <PendingUpgradeDashboard />
      
      case 'ADMIN':
        return <AdminDashboard />
      
      default:
        return <ProfessionalDashboard />
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        {renderDashboardContent()}
      </DashboardLayout>
    </AuthGuard>
  )
}

// Dashboard components for different user types
function PendingUpgradeDashboard() {
  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            Application Under Review
          </CardTitle>
          <CardDescription className="text-orange-700">
            Your role application is being reviewed by our admin team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-orange-700 mb-4">
            You'll receive an email notification once your application has been processed. 
            In the meantime, you can still use all consumer features.
          </p>
          <Button variant="outline" size="sm">
            View Application Status
          </Button>
        </CardContent>
      </Card>

      <ConsumerDashboard />
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Require review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records Today</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">56</div>
            <p className="text-xs text-muted-foreground">+12 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start">
              <a href="/admin/applications">
                <AlertCircle className="mr-2 h-4 w-4" />
                Review Applications
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">New user registration</span>
                <Badge variant="secondary">2m ago</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Role application submitted</span>
                <Badge variant="secondary">5m ago</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Conservation record created</span>
                <Badge variant="secondary">12m ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProfessionalDashboard() {
  const { user } = useAuth()
  
  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">
            Welcome, {user?.role?.replace('_', ' ')}!
          </CardTitle>
          <CardDescription className="text-green-700">
            You have access to professional features for data contribution and management.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Module Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Based on your role, you have access to specific modules:
            </p>
            {user?.role === 'RESEARCHER' && (
              <Button asChild className="w-full">
                <a href="/conservation">Access Conservation Module</a>
              </Button>
            )}
            {['FARMER', 'FISHERMAN', 'PROCESSOR', 'TRADER', 'RETAILER'].includes(user?.role || '') && (
              <Button asChild className="w-full">
                <a href="/supply-chain">Access Supply Chain Module</a>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/profile">
                <Settings className="mr-2 h-4 w-4" />
                Update Profile
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/scan">
                <BarChart3 className="mr-2 h-4 w-4" />
                Scan QR Code
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
