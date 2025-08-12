'use client'

import { useAuth } from '@/hooks/use-auth'
import { ConsumerDashboard } from '@/components/dashboard/consumer-dashboard'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { ProfessionalDashboard } from '@/components/dashboard/professional-dashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[500px]" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-gray-600">Please log in to access your dashboard.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />
    
    case 'RESEARCHER':
    case 'FARMER':
    case 'FISHERMAN':
    case 'PROCESSOR':
    case 'TRADER':
    case 'RETAILER':
      return <ProfessionalDashboard />
    
    case 'CONSUMER':
    case 'PENDING_UPGRADE':
    default:
      return <ConsumerDashboard />
  }
}