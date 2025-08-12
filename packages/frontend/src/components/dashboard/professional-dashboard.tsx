'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  FileText, 
  TrendingUp, 
  ArrowRight, 
  Plus,
  QrCode,
  Database,
  Users,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

export function ProfessionalDashboard() {
  const { user } = useAuth()

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'RESEARCHER':
        return '🔬'
      case 'FARMER':
        return '🐟'
      case 'FISHERMAN':
        return '🎣'
      case 'PROCESSOR':
        return '🏭'
      case 'TRADER':
        return '🚛'
      case 'RETAILER':
        return '🏪'
      default:
        return '👤'
    }
  }

  const getRoleFeatures = (role: string) => {
    switch (role) {
      case 'RESEARCHER':
        return {
          primary: 'Conservation',
          primaryDesc: 'Collect and analyze conservation data',
          primaryHref: '/conservation',
          secondary: 'Research Data',
          secondaryDesc: 'Access research database',
          secondaryHref: '/research'
        }
      case 'FARMER':
      case 'FISHERMAN':
        return {
          primary: 'Conservation',
          primaryDesc: 'Record harvest and environmental data',
          primaryHref: '/conservation',
          secondary: 'Supply Chain',
          secondaryDesc: 'Track product from source',
          secondaryHref: '/supply-chain'
        }
      case 'PROCESSOR':
      case 'TRADER':
      case 'RETAILER':
        return {
          primary: 'Supply Chain',
          primaryDesc: 'Manage product processing and distribution',
          primaryHref: '/supply-chain',
          secondary: 'Quality Control',
          secondaryDesc: 'Ensure product quality standards',
          secondaryHref: '/quality'
        }
      default:
        return {
          primary: 'Dashboard',
          primaryDesc: 'Manage your professional activities',
          primaryHref: '/dashboard',
          secondary: 'Settings',
          secondaryDesc: 'Configure your account',
          secondaryHref: '/settings'
        }
    }
  }

  const features = getRoleFeatures(user?.role || '')

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">{getRoleIcon(user?.role || '')}</span>
          Welcome, {user?.profile?.firstName || 'Professional'}!
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-gray-600">
            You're registered as a professional
          </p>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {user?.role?.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records Created</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Traced</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              Total items tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <p className="text-xs text-muted-foreground">
              Completeness score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Primary Feature */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">{features.primary}</CardTitle>
            <CardDescription>
              {features.primaryDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href={features.primaryHref}>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create New Record
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Secondary Feature */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">{features.secondary}</CardTitle>
            <CardDescription>
              {features.secondaryDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href={features.secondaryHref}>
              <Button variant="outline" className="w-full">
                View {features.secondary}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest contributions to the TracceAqua platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Conservation record created</p>
                <p className="text-sm text-muted-foreground">
                  Water quality sample #CQ-2024-001
                </p>
              </div>
              <div className="text-sm text-muted-foreground">2h ago</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Product batch traced</p>
                <p className="text-sm text-muted-foreground">
                  Batch #LAG-2024-0234 - 50kg Fresh Fish
                </p>
              </div>
              <div className="text-sm text-muted-foreground">1d ago</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Quality check completed</p>
                <p className="text-sm text-muted-foreground">
                  All parameters within acceptable range
                </p>
              </div>
              <div className="text-sm text-muted-foreground">2d ago</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button variant="outline" className="h-16" asChild>
          <Link href="/dashboard/scan">
            <div className="text-center">
              <QrCode className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Scan QR</span>
            </div>
          </Link>
        </Button>
        
        <Button variant="outline" className="h-16" asChild>
          <Link href="/dashboard/history">
            <div className="text-center">
              <FileText className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">View History</span>
            </div>
          </Link>
        </Button>
        
        <Button variant="outline" className="h-16" asChild>
          <Link href="/dashboard/settings">
            <div className="text-center">
              <Users className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Settings</span>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  )
}