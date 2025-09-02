'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Plus, Filter, Download, MoreHorizontal, Edit, Trash2, Eye, MapPin, Fish, Calendar, Users, TrendingUp, Activity } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Mock data structure - this will come from API
interface ConservationRecord {
  id: string
  samplingId: string
  location: {
    name: string
    waterBody: string
    coordinates: string
  }
  species: {
    scientificName: string
    commonName: string
    family: string
  }
  status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  creator: {
    name: string
    organization: string
  }
  tags: string[]
  testTypes: number
  photos: number
}

// Mock data
const mockRecords: ConservationRecord[] = [
  {
    id: '1',
    samplingId: 'CON-2025-001',
    location: {
      name: 'Lagos Lagoon - Marina District',
      waterBody: 'Lagos Lagoon',
      coordinates: '6.4541, 3.3947'
    },
    species: {
      scientificName: 'Crassostrea gasar',
      commonName: 'West African Oyster',
      family: 'Ostreidae (Oysters)'
    },
    status: 'VERIFIED',
    createdAt: '2025-08-15T10:30:00Z',
    updatedAt: '2025-08-16T14:20:00Z',
    creator: {
      name: 'Dr. Sarah Johnson',
      organization: 'Marine Research Institute'
    },
    tags: ['Biodiversity Assessment', 'Water Quality', 'Marine Biology'],
    testTypes: 5,
    photos: 3
  },
  {
    id: '2',
    samplingId: 'CON-2025-002',
    location: {
      name: 'Ogun River Estuary',
      waterBody: 'Ogun River',
      coordinates: '6.5845, 3.5234'
    },
    species: {
      scientificName: 'Mytilus edulis',
      commonName: 'Blue Mussel',
      family: 'Mytilidae (Mussels)'
    },
    status: 'SUBMITTED',
    createdAt: '2025-08-20T09:15:00Z',
    updatedAt: '2025-08-20T15:45:00Z',
    creator: {
      name: 'Prof. Michael Adebayo',
      organization: 'University of Lagos'
    },
    tags: ['Conservation Study', 'Pollution Study'],
    testTypes: 3,
    photos: 5
  },
  {
    id: '3',
    samplingId: 'CON-2025-003',
    location: {
      name: 'Cross River Delta',
      waterBody: 'Cross River',
      coordinates: '4.8156, 8.3297'
    },
    species: {
      scientificName: 'Penaeus notialis',
      commonName: 'Southern Pink Shrimp',
      family: 'Penaeidae (Prawns/Shrimps)'
    },
    status: 'DRAFT',
    createdAt: '2025-08-25T16:30:00Z',
    updatedAt: '2025-08-25T16:30:00Z',
    creator: {
      name: 'Dr. Amina Kano',
      organization: 'Federal Institute of Fisheries'
    },
    tags: ['Species Monitoring', 'Ecosystem Health'],
    testTypes: 2,
    photos: 1
  }
]

interface ConservationDashboardProps {
  onCreateNew?: () => void
  onEditRecord?: (recordId: string) => void
  onViewRecord?: (recordId: string) => void
}

export default function ConservationDashboard({ 
  onCreateNew, 
  onEditRecord,
  onViewRecord 
}: ConservationDashboardProps) {
  const [records, setRecords] = useState<ConservationRecord[]>(mockRecords)
  const [filteredRecords, setFilteredRecords] = useState<ConservationRecord[]>(mockRecords)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Filter records based on search and status
  useEffect(() => {
    let filtered = records

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(record => 
        record.samplingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.species.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.species.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.location.waterBody.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter)
    }

    setFilteredRecords(filtered)
  }, [records, searchQuery, statusFilter])

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>
      case 'SUBMITTED':
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>
      case 'DRAFT':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Statistics
  const stats = {
    total: records.length,
    verified: records.filter(r => r.status === 'VERIFIED').length,
    submitted: records.filter(r => r.status === 'SUBMITTED').length,
    drafts: records.filter(r => r.status === 'DRAFT').length
  }

  // Handle record actions
  const handleView = (recordId: string) => {
    if (onViewRecord) {
      onViewRecord(recordId)
    } else {
      toast({
        title: "View Record",
        description: `Opening record ${recordId} in view mode`,
      })
    }
  }

  const handleEdit = (recordId: string) => {
    onEditRecord?.(recordId)
    toast({
      title: "Edit Record",
      description: `Opening record ${recordId} for editing`,
    })
  }

  const handleDelete = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        // TODO: Implement API call to delete record
        setRecords(prev => prev.filter(r => r.id !== recordId))
        toast({
          title: "Record Deleted",
          description: "Conservation record has been deleted successfully.",
        })
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Could not delete record. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Preparing conservation records for download...",
    })
    // TODO: Implement export functionality
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conservation Records</h1>
          <p className="text-gray-600">Monitor and manage shellfish conservation data</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={onCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Record
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-sm text-gray-600">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.submitted}</p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Edit className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.drafts}</p>
                <p className="text-sm text-gray-600">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search records</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by ID, species, location, or creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Label htmlFor="status-filter" className="sr-only">Filter by status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="DRAFT">Drafts</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Conservation Records ({filteredRecords.length})</CardTitle>
          <CardDescription>
            {searchQuery ? `Showing results for "${searchQuery}"` : 'All conservation records'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <Fish className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Records Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'No records match your search criteria.' : 'Get started by creating your first conservation record.'}
              </p>
              <Button onClick={onCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Record
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Species</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Tests</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Fish className="h-4 w-4 text-blue-600" />
                          {record.samplingId}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{record.species.commonName}</p>
                          <p className="text-xs text-gray-500 italic">{record.species.scientificName}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-start gap-1">
                          <MapPin className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm">{record.location.name}</p>
                            <p className="text-xs text-gray-500">{record.location.waterBody}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{record.creator.name}</p>
                          <p className="text-xs text-gray-500">{record.creator.organization}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{formatDate(record.createdAt)}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="text-xs">
                            {record.testTypes} tests
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {record.photos} photos
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleView(record.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {(record.status === 'DRAFT' || record.status === 'REJECTED') && (
                              <DropdownMenuItem onClick={() => handleEdit(record.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Record
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(record.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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

      {/* Tags Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Tags</CardTitle>
          <CardDescription>
            Most commonly used tags across all conservation records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(records.flatMap(r => r.tags))).map((tag) => {
              const count = records.filter(r => r.tags.includes(tag)).length
              return (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => setSearchQuery(tag)}
                >
                  {tag} ({count})
                </Badge>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}