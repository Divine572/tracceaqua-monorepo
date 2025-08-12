'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Truck, 
  Plus, 
  Package, 
  MapPin,
  Clock,
  CheckCircle2,
  Building2,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function SupplyChainPage() {
  const { user } = useAuth()

  const canAccess = user?.role && ['FARMER', 'FISHERMAN', 'PROCESSOR', 'TRADER', 'RETAILER', 'ADMIN'].includes(user.role)

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Access denied. Supply chain management is only available to professional stakeholders in the seafood supply chain.
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
          <Truck className="w-6 h-6 text-blue-600" />
          Supply Chain Management
        </h1>
        <p className="text-gray-600">
          Track and manage products through the seafood supply chain from source to consumer
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              In transit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8</div>
            <p className="text-xs text-muted-foreground">
              Delivered successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">2.3</div>
            <p className="text-xs text-muted-foreground">
              Hours average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">12</div>
            <p className="text-xs text-muted-foreground">
              Active facilities
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
            <CardTitle className="text-lg">New Supply Chain Record</CardTitle>
            <CardDescription>
              Create a new product batch record and start tracking it through the supply chain
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
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Manage Facilities</CardTitle>
            <CardDescription>
              Configure your processing facilities, storage locations, and distribution centers
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" disabled>
              <Building2 className="w-4 h-4 mr-2" />
              Manage Facilities (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific features */}
      {user?.role === 'FARMER' || user?.role === 'FISHERMAN' ? (
        <Card>
          <CardHeader>
            <CardTitle>Harvest & Source Management</CardTitle>
            <CardDescription>
              Record harvest details, catch information, and source data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="outline" disabled>
                Record Harvest
              </Button>
              <Button variant="outline" disabled>
                Update Catch Data
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : user?.role === 'PROCESSOR' ? (
        <Card>
          <CardHeader>
            <CardTitle>Processing Operations</CardTitle>
            <CardDescription>
              Manage processing activities, quality control, and packaging
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="outline" disabled>
                Start Processing
              </Button>
              <Button variant="outline" disabled>
                Quality Check
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : user?.role === 'TRADER' ? (
        <Card>
          <CardHeader>
            <CardTitle>Trading & Distribution</CardTitle>
            <CardDescription>
              Handle product transfers, logistics, and distribution tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="outline" disabled>
                Create Shipment
              </Button>
              <Button variant="outline" disabled>
                Track Delivery
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : user?.role === 'RETAILER' ? (
        <Card>
          <CardHeader>
            <CardTitle>Retail Management</CardTitle>
            <CardDescription>
              Manage inventory, sales, and consumer-facing product information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="outline" disabled>
                Receive Inventory
              </Button>
              <Button variant="outline" disabled>
                Generate QR Codes
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Coming Soon Notice */}
      <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Supply Chain Module Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                The complete supply chain tracking system is under development. This will include batch management, logistics tracking, and quality control workflows.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}