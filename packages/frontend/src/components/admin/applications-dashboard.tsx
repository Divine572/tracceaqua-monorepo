'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'





import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  MoreHorizontal, 
  Search, 
  Users, 
  Clock, 
  FileText,
  Filter,
  Calendar,
  Building2,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { RoleApplication, ApplicationStatus } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/hooks/use-auth'

interface ApplicationsStatsResponse {
  total: number
  byStatus: {
    pending: number
    approved: number
    rejected: number
    underReview: number
    resubmitted: number
  }
  byRole: Record<string, number>
}

export function ApplicationsDashboard() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'ALL'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<RoleApplication | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'reject' | null>(null)
  const [reviewFeedback, setReviewFeedback] = useState('')

  // Fetch application statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'application-stats'],
    queryFn: async (): Promise<ApplicationsStatsResponse> => {
      const response = await fetch('/api/role-applications/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    },
    enabled: !!token,
  })

  // Fetch applications with filtering
  const { data: applicationsData, isLoading: applicationsLoading, refetch } = useQuery({
    queryKey: ['admin', 'applications', selectedStatus, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedStatus !== 'ALL') {
        params.append('status', selectedStatus)
      }
      params.append('page', '1')
      params.append('limit', '50')

      const response = await fetch(`/api/role-applications/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch applications')
      return response.json()
    },
    enabled: !!token,
  })

  // Review application mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ 
      applicationId, 
      approved, 
      feedback 
    }: { 
      applicationId: string
      approved: boolean
      feedback: string 
    }) => {
      const response = await fetch(`/api/role-applications/${applicationId}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved, feedback }),
      })
      if (!response.ok) throw new Error('Failed to review application')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'application-stats'] })
      setReviewModalOpen(false)
      setSelectedApplication(null)
      setReviewDecision(null)
      setReviewFeedback('')
    },
  })

  const handleReview = (application: RoleApplication, decision: 'approve' | 'reject') => {
    setSelectedApplication(application)
    setReviewDecision(decision)
    setReviewModalOpen(true)
  }

  const confirmReview = async () => {
    if (!selectedApplication || !reviewDecision) return

    await reviewMutation.mutateAsync({
      applicationId: selectedApplication.id,
      approved: reviewDecision === 'approve',
      feedback: reviewFeedback,
    })
  }

  const getStatusColor = (status: ApplicationStatus) => {
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

  const filteredApplications = applicationsData?.applications?.filter((app: RoleApplication) => {
    const matchesSearch = !searchTerm || 
      app.user?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.requestedRole.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  }) || []

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(stats?.byStatus.pending || 0) + (stats?.byStatus.resubmitted || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.byStatus.approved || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.byStatus.underReview || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Role Applications Management</CardTitle>
          <CardDescription>
            Review and manage role applications from users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Tabs */}
      <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ApplicationStatus | 'ALL')}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="UNDER_REVIEW">Under Review</TabsTrigger>
          <TabsTrigger value="RESUBMITTED">Resubmitted</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicationsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading applications...
                      </TableCell>
                    </TableRow>
                  ) : filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((application: RoleApplication) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {application.user?.profile?.firstName} {application.user?.profile?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.user?.email || application.user?.address.slice(0, 8) + '...'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {application.requestedRole.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {application.organization && (
                              <>
                                <Building2 className="h-3 w-3 text-gray-400" />
                                <span className="text-sm">{application.organization}</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(application.status)}>
                            {application.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(application.createdAt))} ago
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedApplication(application)
                                  // Show details modal (implement separately)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              
                              {(application.status === 'PENDING' || application.status === 'RESUBMITTED') && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleReview(application, 'approve')}
                                    className="text-green-600"
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleReview(application, 'reject')}
                                    className="text-red-600"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}

                              {application.documents && application.documents.length > 0 && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    window.open(`https://gateway.pinata.cloud/ipfs/${application.documents[0]}`, '_blank')
                                  }}
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Documents
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewDecision === 'approve' ? 'Approve' : 'Reject'} Application
            </DialogTitle>
            <DialogDescription>
              {reviewDecision === 'approve' 
                ? 'This will approve the role application and grant the user the requested role.'
                : 'This will reject the application and allow the user to resubmit with improvements.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedApplication && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">
                  {selectedApplication.user?.profile?.firstName} {selectedApplication.user?.profile?.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  Applying for: {selectedApplication.requestedRole.replace('_', ' ')}
                </p>
                {selectedApplication.organization && (
                  <p className="text-sm text-gray-600">
                    Organization: {selectedApplication.organization}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Feedback {reviewDecision === 'reject' ? '(Required)' : '(Optional)'}
              </label>
              <Textarea
                placeholder={
                  reviewDecision === 'approve' 
                    ? 'Congratulations! Your application has been approved...'
                    : 'Please provide specific feedback on what needs to be improved...'
                }
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {reviewDecision === 'reject' && !reviewFeedback.trim() && (
              <Alert>
                <AlertDescription>
                  Feedback is required when rejecting applications to help users improve their submissions.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmReview}
              disabled={
                reviewMutation.isPending || 
                (reviewDecision === 'reject' && !reviewFeedback.trim())
              }
              className={
                reviewDecision === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {reviewMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : reviewDecision === 'approve' ? (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              {reviewDecision === 'approve' ? 'Approve Application' : 'Reject Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
