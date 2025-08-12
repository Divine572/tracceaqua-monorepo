'use client'

import { RoleApplicationForm } from '@/components/role-applications/role-application-form'
import { ApplicationStatus } from '@/components/role-applications/application-status'
import { ApplicationDetailsModal } from '@/components/role-applications/application-details-modal'
import { useRoleApplications } from '@/hooks/use-role-applications'
import { useAuth } from '@/hooks/use-auth'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RoleApplication } from '@/types'
import { FileText, Plus, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MyApplicationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { userApplications, isLoadingApplications } = useRoleApplications()
  const [showForm, setShowForm] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<RoleApplication | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const handleViewDetails = (application: RoleApplication) => {
    setSelectedApplication(application)
    setShowDetailsModal(true)
  }

  const handleResubmit = (application: RoleApplication) => {
    // Implementation for resubmitting would open form with pre-filled data
    setShowForm(true)
  }

  const handleApplicationSuccess = () => {
    setShowForm(false)
  }

  if (isLoadingApplications) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading your applications...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            My Role Applications
          </h1>
          <p className="text-gray-600">
            Manage your professional role applications
          </p>
        </div>
        
        {!showForm && user?.role === 'CONSUMER' && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Application
          </Button>
        )}
      </div>

      {/* Show Form or Applications List */}
      {showForm ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Submit New Application</h2>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications
            </Button>
          </div>
          <RoleApplicationForm onSuccess={handleApplicationSuccess} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current User Role Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Current Role</h3>
                  <p className="text-sm text-gray-600">
                    You are currently registered as a <strong>{user?.role?.replace('_', ' ')}</strong>
                  </p>
                </div>
                {user?.role === 'CONSUMER' && (
                  <Alert className="max-w-md">
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Apply for a professional role to access advanced features and contribute data to the supply chain.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Applications Status */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Applications</h2>
            <ApplicationStatus
              applications={userApplications}
              onViewDetails={handleViewDetails}
              onResubmit={handleResubmit}
            />
          </div>
        </div>
      )}

      {/* Details Modal */}
      <ApplicationDetailsModal
        application={selectedApplication}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedApplication(null)
        }}
      />
    </div>
  )
}
