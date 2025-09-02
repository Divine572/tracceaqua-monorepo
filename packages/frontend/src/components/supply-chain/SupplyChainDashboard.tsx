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
import { Search, Plus, Filter, Download, MoreHorizontal, Edit, Trash2, Eye, Package, Truck, Users, TrendingUp, QrCode, MapPin, Calendar, Fish } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Mock data structure - this will come from API
interface SupplyChainRecord {
  id: string
  productId: string
  batchId: string
  sourceType: 'FARMED' | 'WILD_CAPTURE'
  currentStage: string
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'REJECTED'
  product: {
    species: {
      scientificName: string
      commonName: string
    }
    quantity: number
    unit: string
  }
  origin: {
    location: string
    coordinates?: string
    facility?: string
  }
  stages: Array<{
    name: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    completedAt?: string
    location?: string
  }>
  createdAt: string
  updatedAt: string
  creator: {
    name: string
    organization: string
    role: string
  }
  qrCodeGenerated: boolean
  blockchainRecorded: boolean
}

// Mock data
const mockRecords: SupplyChainRecord[] = [
  {
    id: '1',
    productId: 'SC-2025-001',
    batchId: 'BATCH-001',
    sourceType: 'FARMED',
    currentStage: 'Processing',
    status: 'ACTIVE',
    product: {
      species: {
        scientificName: 'Crassostrea gasar',
        commonName: 'West African Oyster'
      },
      quantity: 5000,
      unit: 'pieces'
    },
    origin: {
      location: 'Lagos Lagoon Oyster Farm',
      coordinates: '6.4541, 3.3947',
      facility: 'Aqua-Tech Farms Ltd'
    },
    stages: [
      { name: 'Hatchery', status: 'COMPLETED', completedAt: '2025-06-01', location: 'Lagos Hatchery' },
      { name: 'Grow-out', status: 'COMPLETED', completedAt: '2025-08-15', location: 'Lagos Lagoon Farm' },
      { name: 'Harvest', status: 'COMPLETED', completedAt: '2025-08-20', location: 'Lagos Lagoon Farm' },
      { name: 'Processing', status: 'IN_PROGRESS', location: 'Marina Processing Plant' },
      { name: 'Distribution', status: 'PENDING' },
      { name: 'Retail', status: 'PENDING' }
    ],
    createdAt: '2025-06-01T08:00:00Z',
    updatedAt: '2025-08-21T14:30:00Z',
    creator: {
      name: 'John Okafor',
      organization: 'Aqua-Tech Farms Ltd',
      role: 'Farm Manager'
    },
    qrCodeGenerated: true,
    blockchainRecorded: false
  },
  {
    id: '2',
    productId: 'SC-2025-002',
    batchId: 'BATCH-002',
    sourceType: 'WILD_CAPTURE',
    currentStage: 'Distribution',
    status: 'ACTIVE',
    product: {
      species: {
        scientificName: 'Penaeus notialis',
        commonName: 'Southern Pink Shrimp'
      },
      quantity: 2500,
      unit: 'kg'
    },
    origin: {
      location: 'Cross River Delta',
      coordinates: '4.8156, 8.3297'
    },
    stages: [
      { name: 'Fishing', status: 'COMPLETED', completedAt: '2025-08-18', location: 'Cross River Delta' },
      { name: 'Processing', status: 'COMPLETED', completedAt: '2025-08-19', location: 'Calabar Processing Center' },
      { name: 'Distribution', status: 'IN_PROGRESS', location: 'Lagos Distribution Hub' },
      { name: 'Retail', status: 'PENDING' }
    ],
    createdAt: '2025-08-18T05:30:00Z',
    updatedAt: '2025-08-22T11:15:00Z',
    creator: {
      name: 'Captain Ibrahim Hassan',
      organization: 'Delta Fisheries Cooperative',
      role: 'Vessel Captain'
    },
    qrCodeGenerated: true,
    blockchainRecorded: true
  },
  {
    id: '3',
    productId: 'SC-2025-003',
    batchId: 'BATCH-003',
    sourceType: 'FARMED',
    currentStage: 'Grow-out',
    status: 'ACTIVE',
    product: {
      species: {
        scientificName: 'Mytilus edulis',
        commonName: 'Blue Mussel'
      },
      quantity: 8000,
      unit: 'pieces'
    },
    origin: {
      location: 'Ogun River Mussel Farm',
      coordinates: '6.5845, 3.5234',
      facility: 'Marine Culture Systems'
    },
    stages: [
      { name: 'Hatchery', status: 'COMPLETED', completedAt: '2025-05-15', location: 'Ogun Hatchery' },
      { name: 'Grow-out', status: 'IN_PROGRESS', location: 'Ogun River Farm' },
      { name: 'Harvest', status: 'PENDING' },
      { name: 'Processing', status: 'PENDING' },
      { name: 'Distribution', status: 'PENDING' },
      { name: 'Retail', status: 'PENDING' }
    ],
    createdAt: '2025-05-15T10:00:00Z',
    updatedAt: '2025-08-25T16:45:00Z',
    creator: {
      name: 'Dr. Funmi Adebayo',
      organization: 'Marine Culture Systems',
      role: 'Aquaculture Specialist'
    },
    qrCodeGenerated: false,
    blockchainRecorded: false
  }
]

interface SupplyChainDashboardProps {
  onCreateNew?: () => void
  onEditRecord?: (recordId: string) => void
  onViewRecord?: (recordId: string) => void
}

export default function SupplyChainDashboard({ 
  onCreateNew, 
  onEditRecord,
  onViewRecord 
}: SupplyChainDashboardProps) {
  const [records, setRecords] = useState<SupplyChainRecord[]>(mockRecords)
  const [filteredRecords, setFilteredRecords] = useState<SupplyChainRecord[]>(mockRecords)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>('all')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Filter records
  useEffect(() => {
    let filtered = records

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(record => 
        record.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.product.species.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.product.species.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.origin.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.creator.organization.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply filters
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter)
    }

    if (sourceTypeFilter !== 'all') {
      filtered = filtered.filter(record => record.sourceType === sourceTypeFilter)
    }

    if (stageFilter !== 'all') {
      filtered = filtered.filter(record => record.currentStage === stageFilter)
    }

    setFilteredRecords(filtered)
  }, [records, searchQuery, statusFilter, sourceTypeFilter, stageFilter])

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'ACTIVE':
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>
      case 'DRAFT':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Get source type badge
  const getSourceTypeBadge = (sourceType: string) => {
    return sourceType === 'FARMED' 
      ? <Badge variant="outline" className="gap-1"><Fish className="h-3 w-3" />Farmed</Badge>
      : <Badge variant="outline" className="gap-1"><MapPin className="h-3 w-3" />Wild-capture</Badge>
  }

  // Get stage progress
  const getStageProgress = (stages: any[]) => {
    const completed = stages.filter(s => s.status === 'COMPLETED').length
    return `${completed}/${stages.length}`
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
    active: records.filter(r => r.status === 'ACTIVE').length,
    completed: records.filter(r => r.status === 'COMPLETED').length,
    farmed: records.filter(r => r.sourceType === 'FARMED').length,
    wildCapture: records.filter(r => r.sourceType === 'WILD_CAPTURE').length,
    withQR: records.filter(r => r.qrCodeGenerated).length,
    onBlockchain: records.filter(r => r.blockchainRecorded).length
  }

  // Handle record actions
  const handleView = (recordId: string) => {
    onViewRecord?.(recordId)
  }

  const handleEdit = (recordId: string) => {
    onEditRecord?.(recordId)
  }

  const handleDelete = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this supply chain record? This action cannot be undone.')) {
      try {
        setRecords(prev => prev.filter(r => r.id !== recordId))
        toast({
          title: "Record Deleted",
          description: "Supply chain record has been deleted successfully.",
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

  const handleGenerateQR = (recordId: string) => {
    toast({
      title: "QR Code Generated",
      description: "QR code has been generated for this product batch.",
    })
    // TODO: Implement QR code generation
  }

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Preparing supply chain records for download...",
    })
    // TODO: Implement export functionality
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supply Chain Records</h1>
          <p className="text-gray-600">Track shellfish from origin to consumer</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={onCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Product
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-lg font-bold">{stats.total}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-lg font-bold">{stats.active}</p>
                <p className="text-xs text-gray-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Fish className="h-5 w-5 text-cyan-600" />
              <div>
                <p className="text-lg font-bold">{stats.farmed}</p>
                <p className="text-xs text-gray-600">Farmed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-lg font-bold">{stats.wildCapture}</p>
                <p className="text-xs text-gray-600">Wild</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-lg font-bold">{stats.withQR}</p>
                <p className="text-xs text-gray-600">QR Codes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-r from-blue-500 to-purple-600"></div>
              <div>
                <p className="text-lg font-bold">{stats.onBlockchain}</p>
                <p className="text-xs text-gray-600">Blockchain</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-lg font-bold">{stats.completed}</p>
                <p className="text-xs text-gray-600">Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-lg font-bold">{Math.round((stats.active / stats.total) * 100)}%</p>
                <p className="text-xs text-gray-600">In Transit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
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
            
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={sourceTypeFilter} onValueChange={setSourceTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Source Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="FARMED">Farmed</SelectItem>
                  <SelectItem value="WILD_CAPTURE">Wild-capture</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Current Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="Hatchery">Hatchery</SelectItem>
                  <SelectItem value="Grow-out">Grow-out</SelectItem>
                  <SelectItem value="Harvest">Harvest</SelectItem>
                  <SelectItem value="Fishing">Fishing</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Distribution">Distribution</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Supply Chain Records ({filteredRecords.length})</CardTitle>
          <CardDescription>
            {searchQuery ? `Showing results for "${searchQuery}"` : 'All supply chain records'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Records Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'No records match your search criteria.' : 'Get started by creating your first supply chain record.'}
              </p>
              <Button onClick={onCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Product
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Species</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Current Stage</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>QR/Blockchain</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-semibold">{record.productId}</p>
                            <p className="text-xs text-gray-500">{record.batchId}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{record.product.species.commonName}</p>
                          <p className="text-xs text-gray-500 italic">{record.product.species.scientificName}</p>
                          <p className="text-xs text-gray-500">{record.product.quantity} {record.product.unit}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          {getSourceTypeBadge(record.sourceType)}
                          <p className="text-xs text-gray-500">{record.origin.location}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">{record.currentStage}</Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{getStageProgress(record.stages)}</div>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{ 
                                width: `${(record.stages.filter(s => s.status === 'COMPLETED').length / record.stages.length) * 100}%` 
                              }}
                            />
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
                          <div className="flex items-center gap-1">
                            <QrCode className="h-3 w-3" />
                            <span className={`text-xs ${record.qrCodeGenerated ? 'text-green-600' : 'text-gray-400'}`}>
                              {record.qrCodeGenerated ? 'Generated' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-purple-600"></div>
                            <span className={`text-xs ${record.blockchainRecorded ? 'text-green-600' : 'text-gray-400'}`}>
                              {record.blockchainRecorded ? 'Recorded' : 'Pending'}
                            </span>
                          </div>
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
                              View Journey
                            </DropdownMenuItem>
                            {(record.status === 'DRAFT' || record.status === 'ACTIVE') && (
                              <DropdownMenuItem onClick={() => handleEdit(record.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Update Stage
                              </DropdownMenuItem>
                            )}
                            {!record.qrCodeGenerated && (
                              <DropdownMenuItem onClick={() => handleGenerateQR(record.id)}>
                                <QrCode className="mr-2 h-4 w-4" />
                                Generate QR Code
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
    </div>
  )
}