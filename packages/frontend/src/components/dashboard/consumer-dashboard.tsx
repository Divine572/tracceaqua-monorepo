'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  QrCode,
  History,
  ArrowRight,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useRoleApplications } from '@/hooks/use-role-applications'

export function ConsumerDashboard() {
  const { user } = useAuth()
  const { userApplications, isLoadingApplications } = useRoleApplications()

  const hasApplications = userApplications && userApplications.length > 0
  const latestApplication = hasApplications ? userApplications[0] : null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'PENDING':
      case 'UNDER_REVIEW':
      case 'RESUBMITTED':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'REJECTED':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to TracceAqua, {user?.profile?.firstName || 'Consumer'}! 👋
        </h1>
        <p className="text-gray-600">
          Trace seafood products to ensure quality and sustainability. Start by scanning a QR code on any TracceAqua-enabled product.
        </p>
      </div>

      {/* Role Application Status */}
      {user?.role === 'PENDING_UPGRADE' && latestApplication && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-2">
            {getStatusIcon(latestApplication.status)}
            <AlertDescription>
              <strong>Role Application Update:</strong> Your application for{' '}
              <Badge variant="outline" className="mx-1">
                {latestApplication.requestedRole.replace('_', ' ')}
              </Badge>
              role is{' '}
              <span className="font-medium">
                {latestApplication.status.toLowerCase().replace('_', ' ')}
              </span>
              .{' '}
              <Link href="/dashboard/my-applications" className="text-blue-600 hover:underline">
                View details
              </Link>
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Main Action Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Scan QR Code */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Scan QR Code</CardTitle>
            <CardDescription>
              Scan a product QR code to trace its journey from source to plate
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/dashboard/scan">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Scan Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Enter Code Manually */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <CardTitle className="text-lg">Enter Code Manually</CardTitle>
            <CardDescription>
              Enter a product code manually if QR scanning is not available
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/dashboard/trace">
              <Button variant="outline" className="w-full">
                Enter Code
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* View History */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <History className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">View History</CardTitle>
            <CardDescription>
              See your previous scans and traced products
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/dashboard/history">
              <Button variant="outline" className="w-full">
                View History
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* How TracceAqua Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">?</span>
            </div>
            How TracceAqua Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-medium">Scan the QR code on your seafood product</h3>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-medium">View the complete journey from harvest to retail</h3>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-sm font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-medium">Verify quality, sustainability, and authenticity</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ready for More? */}
      <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ready for More?</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Join as a professional stakeholder to contribute data to the seafood supply chain and help build transparency.
              </p>
            </div>
            <Link href="/dashboard/my-applications">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <User className="w-4 h-4 mr-2" />
                Apply for Professional Role
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}