'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, History, UserPlus, Scan, Info, Star } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'


export function ConsumerDashboard() {
  const { user } = useAuth()

  const features = [
    {
      title: 'Scan QR Code',
      description: 'Scan a product QR code to trace its journey from source to plate',
      icon: <QrCode className="h-8 w-8 text-blue-600" />,
      action: 'Scan Now',
      href: '/scan',
      primary: true,
    },
    {
      title: 'Enter Code Manually',
      description: 'Enter a product code manually if QR scanning is not available',
      icon: <Scan className="h-8 w-8 text-gray-600" />,
      action: 'Enter Code',
      href: '/trace/manual',
      primary: false,
    },
    {
      title: 'View History',
      description: 'See your previous scans and traced products',
      icon: <History className="h-8 w-8 text-gray-600" />,
      action: 'View History',
      href: '/history',
      primary: false,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome to TracceAqua, {user?.profile?.firstName || 'Consumer'}! 👋
        </h1>
        <p className="text-blue-100">
          Trace seafood products to ensure quality and sustainability. Start by scanning a QR code on any TracceAqua-enabled product.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className={`transition-shadow hover:shadow-lg ${feature.primary ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                {feature.icon}
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription className="text-sm">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                asChild 
                className={`w-full ${feature.primary ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                variant={feature.primary ? 'default' : 'outline'}
              >
                <a href={feature.href}>{feature.action}</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Information section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              How TracceAqua Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">1</div>
              <p className="text-sm text-gray-600">Scan the QR code on your seafood product</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">2</div>
              <p className="text-sm text-gray-600">View the complete journey from harvest to retail</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">3</div>
              <p className="text-sm text-gray-600">Verify quality, sustainability, and authenticity</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-600" />
              Ready for More?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Join as a professional stakeholder to contribute data to the seafood supply chain and help build transparency.
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href="/apply-role">Apply for Professional Role</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent scans and interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs text-gray-400 mt-1">Start by scanning your first product!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}