'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Microscope, 
  Plus, 
  FileText, 
  TrendingUp,
  Droplets,
  Thermometer,
  Activity,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

export default function ConservationPage() {
  const { user } = useAuth()

  const canAccess = user?.role && ['RESEARCHER', 'FARMER', 'FISHERMAN', 'ADMIN'].includes(user.role)

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Access denied. Conservation data collection is only available to researchers, farmers, and fishermen.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Microscope className="w-6 h-6 text-blue-600" />
          Conservation Data
        </h1>
        <p className="text-gray-600">
          Record and monitor environmental and conservation data for sustainable seafood practices
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records Created</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Water Quality</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">8.2</div>
            <p className="text-xs text-muted-foreground">
              pH Level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">26°C</div>
            <p className="text-xs text-muted-foreground">
              Average this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <p className="text-xs text-muted-foreground">
              Standards met
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">New Conservation Record</CardTitle>
            <CardDescription>
              Create a new environmental monitoring record with water quality, temperature, and biodiversity data
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button className="w-full" disabled>
              <Plus className="w-4 h-4 mr-2" />
              Create Record (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">View Analytics</CardTitle>
            <CardDescription>
              Analyze trends in your conservation data and track environmental changes over time
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" disabled>
              <TrendingUp className="w-4 h-4 mr-2" />
              View Analytics (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Microscope className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Conservation Module Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We're building comprehensive conservation data collection tools. Stay tuned for the full implementation in the next release.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
