'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ExternalLink, FileText, Calendar, User, Building2 } from 'lucide-react'
import { RoleApplication } from '@/types'
import { formatDistanceToNow } from 'date-fns'

interface ApplicationDetailsModalProps {
  application: RoleApplication | null
  isOpen: boolean
  onClose: () => void
}

export function ApplicationDetailsModal({ 
  application, 
  isOpen, 
  onClose 
}: ApplicationDetailsModalProps) {
  if (!application) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'RESUBMITTED':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Application Details
          </DialogTitle>
          <DialogDescription>
            Complete information about your role application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {application.requestedRole.replace('_', ' ')} Role
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <Calendar className="w-4 h-4" />
                Applied {formatDistanceToNow(new Date(application.createdAt))} ago
              </p>
            </div>
            <Badge variant="outline" className={getStatusColor(application.status)}>
              {application.status.replace('_', ' ')}
            </Badge>
          </div>

          <Separator />

          {/* Professional Details */}
          <div className="space-y-4">
            <h4 className="font-medium">Professional Information</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {application.organization && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Organization</p>
                  <p className="text-sm">{application.organization}</p>
                </div>
              )}
              {application.licenseNumber && (
                <div>
                  <p className="text-sm font-medium text-gray-500">License Number</p>
                  <p className="text-sm">{application.licenseNumber}</p>
                </div>
              )}
              {application.businessType && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Business Type</p>
                  <p className="text-sm">{application.businessType}</p>
                </div>
              )}
              {application.experience && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Experience</p>
                  <p className="text-sm">{application.experience}</p>
                </div>
              )}
            </div>
          </div>

          {/* Motivation */}
          {application.motivation && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Motivation</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {application.motivation}
                </p>
              </div>
            </>
          )}

          {/* Documents */}
          {application.documents && application.documents.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Supporting Documents</h4>
                <div className="space-y-2">
                  {application.documents.map((hash, index) => (
                    <div key={hash} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Document {index + 1}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${hash}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Admin Review */}
          {application.adminFeedback && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Admin Review</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm">{application.adminFeedback}</p>
                  {application.reviewedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Reviewed on {new Date(application.reviewedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
