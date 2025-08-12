'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  RefreshCw, 
  FileText, 
  Calendar,
  User,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import type { RoleApplication, ApplicationStatus } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { useRoleApplications } from '@/hooks/use-role-applications'

interface ApplicationStatusProps {
  applications: RoleApplication[]
  onViewDetails?: (application: RoleApplication) => void
  onResubmit?: (application: RoleApplication) => void
}

export function ApplicationStatus({ applications, onViewDetails, onResubmit }: ApplicationStatusProps) {
  const { withdrawApplication, isWithdrawing } = useRoleApplications()
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'UNDER_REVIEW':
        return <Eye className="w-4 h-4 text-blue-600" />
      case 'APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'RESUBMITTED':
        return <RefreshCw className="w-4 h-4 text-purple-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'RESUBMITTED':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Pending Review'
      case 'UNDER_REVIEW':
        return 'Under Review'
      case 'APPROVED':
        return 'Approved'
      case 'REJECTED':
        return 'Rejected'
      case 'RESUBMITTED':
        return 'Resubmitted'
      default:
        return status
    }
  }

  const handleWithdraw = async (applicationId: string) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      setWithdrawingId(applicationId)
      try {
        await withdrawApplication(applicationId)
      } catch (error) {
        console.error('Failed to withdraw application:', error)
      } finally {
        setWithdrawingId(null)
      }
    }
  }

  // Handle loading state or invalid data
  if (!applications || !Array.isArray(applications)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Applications</h3>
            <p className="text-gray-600">
              Please wait while we fetch your applications...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600">
              You haven't submitted any role applications. Apply for a professional role to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  {application.requestedRole.replace('_', ' ')} Role
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Applied {formatDistanceToNow(new Date(application.createdAt))} ago
                </CardDescription>
              </div>
              <Badge variant="outline" className={getStatusColor(application.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(application.status)}
                  {getStatusLabel(application.status)}
                </div>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Application Details */}
            <div className="grid gap-3 sm:grid-cols-2">
              {application.organization && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Organization</p>
                  <p className="text-sm">{application.organization}</p>
                </div>
              )}
              {application.experience && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Experience</p>
                  <p className="text-sm">{application.experience}</p>
                </div>
              )}
              {application.licenseNumber && (
                <div>
                  <p className="text-sm font-medium text-gray-500">License Number</p>
                  <p className="text-sm">{application.licenseNumber}</p>
                </div>
              )}
              {application.documents && application.documents.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Documents</p>
                  <p className="text-sm">{application.documents.length} file(s) uploaded</p>
                </div>
              )}
            </div>

            {/* Admin Feedback */}
            {application.adminFeedback && (
              <Alert className={application.status === 'APPROVED' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Admin Feedback:</strong> {application.adminFeedback}
                </AlertDescription>
              </Alert>
            )}

            {/* Review Information */}
            {application.reviewedAt && application.reviewer && (
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                Reviewed by {application.reviewer.profile?.firstName || 'Admin'} on{' '}
                {new Date(application.reviewedAt).toLocaleDateString()}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails?.(application)}
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>

              {application.status === 'REJECTED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onResubmit?.(application)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Resubmit
                </Button>
              )}

              {(application.status === 'PENDING' || application.status === 'REJECTED') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWithdraw(application.id)}
                  disabled={withdrawingId === application.id}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  {withdrawingId === application.id ? (
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                  )}
                  Withdraw
                </Button>
              )}

              {application.documents && application.documents.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Open first document as example
                    window.open(`https://gateway.pinata.cloud/ipfs/${application.documents[0]}`, '_blank')
                  }}
                  className="text-gray-600"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Documents
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

