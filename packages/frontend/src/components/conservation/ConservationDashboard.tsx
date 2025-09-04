'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Plus, Filter, Download, MoreHorizontal, Edit, Trash2, Eye, MapPin, Fish, Calendar, Users, TrendingUp, Activity, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { conservationApi } from '@/services/conservationApi'
import type { ConservationRecord } from '@/services/conservationApi'

// **COMMENTED OUT MOCK DATA - DO NOT DELETE**
// Mock data structure - this will come from API
// interface ConservationRecord {
//   id: string
//   samplingId: string
//   location: {
//     name: string
//     waterBody: string
//     coordinates: string
//   }
//   species: {
//     scientificName: string
//     commonName: string
//     family: string
//   }
//   status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'
//   createdAt: string
//   updatedAt: string
//   creator: {
//     name: string
//     organization: string
//   }
//   tags: string[]
//   testTypes: number
//   photos: number
// }

// **COMMENTED OUT MOCK DATA ARRAY**
// const mockRecords: ConservationRecord[] = [
//   {
//     id: '1',
//     samplingId: 'CON-2025-001',
//     location: {
//       name: 'Lagos Lagoon - Marina District',
//       waterBody: 'Lagos Lagoon',
//       coordinates: '6.4541, 3.3947'
//     },
//     species: {
//       scientificName: 'Crassostrea gasar',
//       commonName: 'West African Oyster',
//       family: 'Ostreidae (Oysters)'
//     },
//     status: 'VERIFIED',
//     createdAt: '2025-08-15T10:30:00Z',
//     updatedAt: '2025-08-16T14:20:00Z',
//     creator: {
//       name: 'Dr. Sarah Johnson',
//       organization: 'Marine Research Institute'
//     },
//     tags: ['Biodiversity Assessment', 'Water Quality', 'Marine Biology'],
//     testTypes: 5,
//     photos: 3
//   },
//   // ... other mock records
// ]

interface ConservationPageState {
  searchTerm: string
  statusFilter: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  selectedRecords: string[]
}

interface ConservationPageProps {
  onCreateNew: () => void
  onEditRecord: (recordId: string) => void
  onViewRecord: (recordId: string) => void
}

export default function ConservationDashboard({
  onCreateNew,
  onEditRecord,
  onViewRecord
}: ConservationPageProps) {
  const [state, setState] = useState<ConservationPageState>({
    searchTerm: '',
    statusFilter: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    selectedRecords: []
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  // **REAL API INTEGRATION - REPLACE MOCK DATA**
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['conservation-records', state.statusFilter, state.searchTerm],
    queryFn: async () => {
      const params: any = {}

      if (state.statusFilter !== 'all') {
        params.status = state.statusFilter.toUpperCase()
      }

      if (state.searchTerm) {
        params.search = state.searchTerm
      }

      params.sortBy = state.sortBy
      params.sortOrder = state.sortOrder

      return await conservationApi.getRecords(params)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // **REAL STATISTICS API INTEGRATION**
  const {
    data: statistics,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['conservation-statistics'],
    queryFn: () => conservationApi.getStatistics(),
    staleTime: 5 * 60 * 1000,
  })

  // **DELETE MUTATION**
  const deleteMutation = useMutation({
    mutationFn: (recordId: string) => conservationApi.deleteRecord(recordId),
    onSuccess: () => {
      toast({
        title: "Record Deleted",
        description: "Conservation record has been deleted successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ['conservation-records'] })
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed", 
        description: error.message || "Failed to delete record. Please try again.",
        variant: "destructive"
      })
    },
  })

  // **DERIVED DATA FROM API RESPONSE**
  const records: ConservationRecord[] = (apiResponse as any)?.records || []
  const totalRecords: number = (apiResponse as any)?.total || 0

  // **HANDLE REAL API ERRORS**
  useEffect(() => {
    if (error) {
      toast({
        title: "Failed to Load Records",
        description: "Could not fetch conservation records. Please check your connection.",
        variant: "destructive"
      })
    }
  }, [error, toast])

  // **REAL STATISTICS CALCULATIONS**
  const stats = {
    total: (statistics as any)?.totalRecords || totalRecords,
    draft: (statistics as any)?.recordsByStatus?.draft || records.filter((r: ConservationRecord) => r.status === 'DRAFT').length,
    submitted: (statistics as any)?.recordsByStatus?.submitted || records.filter((r: ConservationRecord) => r.status === 'SUBMITTED').length,
    verified: (statistics as any)?.recordsByStatus?.verified || records.filter((r: ConservationRecord) => r.status === 'VERIFIED').length,
    rejected: (statistics as any)?.recordsByStatus?.rejected || records.filter((r: ConservationRecord) => r.status === 'REJECTED').length,
  }

  // Handle search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // Search is handled by react-query key change
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [state.searchTerm])

  // Handle record selection
  const handleRecordSelection = (recordId: string, selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedRecords: selected
        ? [...prev.selectedRecords, recordId]
        : prev.selectedRecords.filter(id => id !== recordId)
    }))
  }

  const handleSelectAll = (selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedRecords: selected ? records.map((r: ConservationRecord) => r.id) : []
    }))
  }

  // Handle delete with confirmation
  const handleDeleteRecord = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this conservation record? This action cannot be undone.')) {
      deleteMutation.mutate(recordId)
    }
  }

  // **LOADING STATE**
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>

        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  // **ERROR STATE**  
  if (error && !records.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Connection Error</h3>
            <p className="mt-1 text-sm text-gray-500">
              Unable to load conservation records. Please check your connection.
            </p>
            <Button
              className="mt-4"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Fish className="w-6 h-6 text-blue-600" />
            Conservation Records
          </h1>
          <p className="text-gray-600">
            Monitor and track conservation sampling data and research findings
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            New Record
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? '...' : stats.total}</div>
            <p className="text-xs text-muted-foreground">All conservation records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statsLoading ? '...' : stats.verified}</div>
            <p className="text-xs text-muted-foreground">Verified by admins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statsLoading ? '...' : (stats.draft + stats.submitted)}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statsLoading ? '...' : records.filter((r: ConservationRecord) => {
                const recordDate = new Date(r.createdAt)
                const now = new Date()
                return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Records created</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search records, species, locations..."
                  value={state.searchTerm}
                  onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>

              <Select
                value={state.statusFilter}
                onValueChange={(value) => setState(prev => ({ ...prev, statusFilter: value }))}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardContent className="pt-6">
          {records.length === 0 ? (
            <div className="text-center py-8">
              <Fish className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {state.searchTerm || state.statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first conservation record.'
                }
              </p>
              <Button className="mt-4" onClick={onCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Record
              </Button>
            </div>
          ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={state.selectedRecords.length === records.length && records.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead>Sampling ID</TableHead>
                    <TableHead>Species</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    <TableHead>Creator</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((record: ConservationRecord) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={state.selectedRecords.includes(record.id)}
                            onChange={(e) => handleRecordSelection(record.id, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                      <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                              {record.samplingId}
                            </code>
                        </div>
                        </TableCell>
                      <TableCell>
                        <div>
                            <div className="font-medium">{record.species.commonName}</div>
                            <div className="text-sm text-gray-500 italic">{record.species.scientificName}</div>
                        </div>
                        </TableCell>
                      <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{record.location.name}</span>
                        </div>
                        </TableCell>
                      <TableCell>
                          <Badge variant={
                            record.status === 'VERIFIED' ? 'default' :
                              record.status === 'SUBMITTED' ? 'secondary' :
                                record.status === 'REJECTED' ? 'destructive' : 'outline'
                          }>
                            {record.status}
                          </Badge>
                      </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </TableCell>
                      <TableCell>
                          <div>
                            <div className="text-sm font-medium">{record.creator.name}</div>
                            <div className="text-xs text-gray-500">{record.creator.organization}</div>
                        </div>
                      </TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => onViewRecord(record.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {(record.status === 'DRAFT' || record.status === 'REJECTED') && (
                                <DropdownMenuItem onClick={() => onEditRecord(record.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Record
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                onClick={() => handleDeleteRecord(record.id)}
                              className="text-red-600"
                                disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="text-sm text-gray-500 text-center">
        Showing {records.length} of {totalRecords} conservation records
        {state.statusFilter !== 'all' && ` (filtered by ${state.statusFilter})`}
        {state.searchTerm && ` (search: "${state.searchTerm}")`}
      </div>
    </div>
  )
}