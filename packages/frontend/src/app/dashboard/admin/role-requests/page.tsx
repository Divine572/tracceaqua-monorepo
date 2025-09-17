'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  Clock, 
  AlertTriangle,
  User,
  Building,
  FileText,
  Calendar,
  Mail,
  Phone,
  Award,
  MessageSquare,
  RefreshCw,
  Download
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { UserRole, ApplicationStatus, USER_ROLE_LABELS } from '@/lib/types'
import { formatDate, formatDateTime } from '@/lib/utils'
// import StatsCard from '@/components/admin/role-applications/StatsCard'

// Types based on your API structure
interface RoleApplication {
  id: string
  userId: string
  requestedRole: UserRole
  status: ApplicationStatus
  organization?: string
  licenseNumber?: string
  businessType?: string
  experience?: string
  motivation?: string
  adminFeedback?: string
  submittedAt: Date
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    email: string
    address: string
    profile?: {
      firstName?: string
      lastName?: string
      phoneNumber?: string
    }
  }
}

interface ReviewApplicationData {
  status: 'APPROVED' | 'REJECTED'
  adminFeedback: string
}

export default function RoleRequestsAdmin() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedApplication, setSelectedApplication] = useState<RoleApplication | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)
  const [adminFeedback, setAdminFeedback] = useState<string>('')
  
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch all role applications
  const { data: applications = [], isLoading, refetch } = useQuery({
    queryKey: ['role-applications', 'admin', searchTerm, statusFilter, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      
      const response = await fetch(`/api/v1/role-applications/admin/all?${params}`)
      if (!response.ok) throw new Error('Failed to fetch applications')
      return response.json()
    },
  })

  // Review application mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ReviewApplicationData }) => {
      const response = await fetch(`/api/v1/role-applications/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to review application')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-applications'] })
      toast({
        title: "Application reviewed",
        description: `Application has been ${reviewAction}d successfully.`,
      })
      handleCloseReviewDialog()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to review application. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleReviewApplication = (application: RoleApplication, action: 'approve' | 'reject') => {
    setSelectedApplication(application)
    setReviewAction(action)
    setAdminFeedback('')
    setReviewDialogOpen(true)
  }

  const handleConfirmReview = () => {
    if (!selectedApplication || !reviewAction) return
    
    reviewMutation.mutate({
      id: selectedApplication.id,
      data: {
        status: reviewAction === 'approve' ? 'APPROVED' : 'REJECTED',
        adminFeedback: adminFeedback.trim()
      }
    })
  }

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false)
    setSelectedApplication(null)
    setReviewAction(null)
    setAdminFeedback('')
  }

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'UNDER_REVIEW': return <Eye className="h-4 w-4" />
      case 'APPROVED': return <Check className="h-4 w-4" />
      case 'REJECTED': return <X className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  // const filteredApplications = applications.filter((app) => {
  //   const matchesSearch = !searchTerm || 
  //     app.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     app.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     app.user?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     app.user?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    
  //   const matchesStatus = statusFilter === 'all' || app.status === statusFilter
  //   const matchesRole = roleFilter === 'all' || app.requestedRole === roleFilter
    
  //   return matchesSearch && matchesStatus && matchesRole
  // })

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Role Applications</h1>
          <p className="text-muted-foreground">
            Review and manage professional role applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {/* <StatsCard applications={applications}/> */}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.entries(USER_ROLE_LABELS)
                  .filter(([role]) => role !== UserRole.CONSUMER && role !== UserRole.ADMIN)
                  .map(([role, label]) => (
                    <SelectItem key={role} value={role}>
                      {label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          <CardDescription>
            Review role applications and make approval decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Requested Role</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading applications...
                    </TableCell>
                  </TableRow>
                ) : filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No applications found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {application.user?.profile?.firstName && application.user?.profile?.lastName
                              ? `${application.user.profile.firstName} ${application.user.profile.lastName}`
                              : 'Unknown User'
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {application.user?.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {application.user?.address?.slice(0, 10)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {USER_ROLE_LABELS[application.requestedRole] || application.requestedRole}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{application.organization || 'Not specified'}</div>
                          {application.licenseNumber && (
                            <div className="text-sm text-muted-foreground">
                              License: {application.licenseNumber}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(application.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(application.status)}
                            <span>{application.status.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(application.submittedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {(application.status === 'PENDING' || application.status === 'UNDER_REVIEW') && (
                            <>
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleReviewApplication(application, 'approve')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleReviewApplication(application, 'reject')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card> */}

      {/* Application Details Dialog */}
      {selectedApplication && !reviewDialogOpen && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Review the complete application information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Applicant Information */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Applicant Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">
                      {selectedApplication.user?.profile?.firstName && selectedApplication.user?.profile?.lastName
                        ? `${selectedApplication.user.profile.firstName} ${selectedApplication.user.profile.lastName}`
                        : 'Not provided'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedApplication.user?.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wallet Address:</span>
                    <p className="font-medium font-mono text-xs">{selectedApplication.user?.address}</p>
                  </div>
                  {selectedApplication.user?.profile?.phoneNumber && (
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-medium">{selectedApplication.user.profile.phoneNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Application Details */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Application Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Requested Role:</span>
                    <p className="font-medium">
                      {USER_ROLE_LABELS[selectedApplication.requestedRole] || selectedApplication.requestedRole}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(selectedApplication.status)}>
                      {selectedApplication.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {selectedApplication.organization && (
                    <div>
                      <span className="text-muted-foreground">Organization:</span>
                      <p className="font-medium">{selectedApplication.organization}</p>
                    </div>
                  )}
                  {selectedApplication.licenseNumber && (
                    <div>
                      <span className="text-muted-foreground">License Number:</span>
                      <p className="font-medium">{selectedApplication.licenseNumber}</p>
                    </div>
                  )}
                  {selectedApplication.businessType && (
                    <div>
                      <span className="text-muted-foreground">Business Type:</span>
                      <p className="font-medium">{selectedApplication.businessType}</p>
                    </div>
                  )}
                  {selectedApplication.experience && (
                    <div>
                      <span className="text-muted-foreground">Experience:</span>
                      <p className="font-medium">{selectedApplication.experience}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedApplication.motivation && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Motivation
                    </h3>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">
                      {selectedApplication.motivation}
                    </p>
                  </div>
                </>
              )}

              {selectedApplication.adminFeedback && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Admin Feedback
                    </h3>
                    <p className="text-sm bg-blue-50 p-3 rounded-lg">
                      {selectedApplication.adminFeedback}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              {/* Timeline */}
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </h3>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">Submitted:</span> {formatDateTime(selectedApplication.submittedAt)}
                  </div>
                  {selectedApplication.reviewedAt && (
                    <div>
                      <span className="text-muted-foreground">Reviewed:</span> {formatDateTime(selectedApplication.reviewedAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              {(selectedApplication.status === 'PENDING' || selectedApplication.status === 'UNDER_REVIEW') && (
                <div className="flex gap-2">
                  <Button 
                    variant="destructive"
                    onClick={() => handleReviewApplication(selectedApplication, 'reject')}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    onClick={() => handleReviewApplication(selectedApplication, 'approve')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
              <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Application Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={handleCloseReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Application
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' 
                ? 'Approve this role application and grant the requested permissions.'
                : 'Reject this application and provide feedback to the applicant.'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You are about to {reviewAction} the application from{' '}
                  <strong>{selectedApplication.user?.email}</strong> for the role of{' '}
                  <strong>{USER_ROLE_LABELS[selectedApplication.requestedRole]}</strong>.
                </AlertDescription>
              </Alert>

              <div>
                <label className="text-sm font-medium">
                  {reviewAction === 'approve' ? 'Approval Message (Optional)' : 'Rejection Reason (Recommended)'}
                </label>
                <Textarea
                  placeholder={
                    reviewAction === 'approve' 
                      ? 'Add a welcome message or additional instructions...'
                      : 'Explain why this application was rejected...'
                  }
                  value={adminFeedback}
                  onChange={(e) => setAdminFeedback(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseReviewDialog}>
              Cancel
            </Button>
            <Button 
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleConfirmReview}
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {reviewAction === 'approve' ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  {reviewAction === 'approve' ? 'Approve' : 'Reject'} Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}