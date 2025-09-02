'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Package,
  Fish,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  QrCode,
  Truck,
  Filter
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'



export type SourceType = 'FARMED' | 'WILD_CAPTURE'
export type RecordStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'REJECTED'

interface SupplyChainRecord {
  id: string
  productId: string
  batchId: string
  sourceType: SourceType
  currentStage: string
  status: RecordStatus
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
  }
  stages: Array<{
    name: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    completedAt?: string
  }>
  createdAt: string
  updatedAt: string
  creator: {
    name: string
    organization: string
  }
  qrCodeGenerated: boolean
  blockchainRecorded: boolean
}

interface BatchInfo {
  batchId: string
  products: SupplyChainRecord[]
  totalQuantity: number
  unit: string
  averageProgress: number
  stages: string[]
  createdAt: string
  status: RecordStatus
  sourceType: SourceType
  species: {
    scientificName: string
    commonName: string
  }
  origin: {
    location: string
    facility?: string
  }
  creator: {
    name: string
    organization: string
  }
}

// Mock data
const mockBatches: BatchInfo[] = [
  {
    batchId: 'BATCH-001',
    sourceType: 'FARMED',
    species: {
      scientificName: 'Crassostrea gasar',
      commonName: 'West African Oyster'
    },
    totalQuantity: 15000,
    unit: 'pieces',
    averageProgress: 67,
    stages: ['Hatchery', 'Grow-out', 'Harvest', 'Processing', 'Distribution', 'Retail'],
    status: 'ACTIVE',
    createdAt: '2025-06-01T08:00:00Z',
    origin: {
      location: 'Lagos Lagoon Oyster Farm',
      facility: 'Aqua-Tech Farms Ltd'
    },
    creator: {
      name: 'John Okafor',
      organization: 'Aqua-Tech Farms Ltd'
    },
    products: [
      {
        id: '1',
        productId: 'SC-2025-001',
        batchId: 'BATCH-001',
        sourceType: 'FARMED',
        currentStage: 'Processing',
        status: 'ACTIVE',
        product: {
          species: { scientificName: 'Crassostrea gasar', commonName: 'West African Oyster' },
          quantity: 5000,
          unit: 'pieces'
        },
        origin: { location: 'Lagos Lagoon Oyster Farm' },
        stages: [
          { name: 'Hatchery', status: 'COMPLETED', completedAt: '2025-06-01' },
          { name: 'Grow-out', status: 'COMPLETED', completedAt: '2025-08-15' },
          { name: 'Harvest', status: 'COMPLETED', completedAt: '2025-08-20' },
          { name: 'Processing', status: 'IN_PROGRESS' },
          { name: 'Distribution', status: 'PENDING' },
          { name: 'Retail', status: 'PENDING' }
        ],
        createdAt: '2025-06-01T08:00:00Z',
        updatedAt: '2025-08-21T14:30:00Z',
        creator: { name: 'John Okafor', organization: 'Aqua-Tech Farms Ltd' },
        qrCodeGenerated: true,
        blockchainRecorded: false
      },
      {
        id: '2',
        productId: 'SC-2025-002',
        batchId: 'BATCH-001',
        sourceType: 'FARMED',
        currentStage: 'Harvest',
        status: 'ACTIVE',
        product: {
          species: { scientificName: 'Crassostrea gasar', commonName: 'West African Oyster' },
          quantity: 10000,
          unit: 'pieces'
        },
        origin: { location: 'Lagos Lagoon Oyster Farm' },
        stages: [
          { name: 'Hatchery', status: 'COMPLETED', completedAt: '2025-06-01' },
          { name: 'Grow-out', status: 'COMPLETED', completedAt: '2025-08-15' },
          { name: 'Harvest', status: 'IN_PROGRESS' },
          { name: 'Processing', status: 'PENDING' },
          { name: 'Distribution', status: 'PENDING' },
          { name: 'Retail', status: 'PENDING' }
        ],
        createdAt: '2025-06-01T08:00:00Z',
        updatedAt: '2025-08-25T10:15:00Z',
        creator: { name: 'John Okafor', organization: 'Aqua-Tech Farms Ltd' },
        qrCodeGenerated: false,
        blockchainRecorded: false
      }
    ]
  },
  {
    batchId: 'BATCH-002',
    sourceType: 'WILD_CAPTURE',
    species: {
      scientificName: 'Penaeus notialis',
      commonName: 'Southern Pink Shrimp'
    },
    totalQuantity: 2500,
    unit: 'kg',
    averageProgress: 100,
    stages: ['Fishing', 'Processing', 'Distribution', 'Retail'],
    status: 'COMPLETED',
    createdAt: '2025-08-18T05:30:00Z',
    origin: {
      location: 'Cross River Delta'
    },
    creator: {
      name: 'Captain Ibrahim Hassan',
      organization: 'Delta Fisheries Cooperative'
    },
    products: [
      {
        id: '3',
        productId: 'SC-2025-003',
        batchId: 'BATCH-002',
        sourceType: 'WILD_CAPTURE',
        currentStage: 'Retail',
        status: 'COMPLETED',
        product: {
          species: { scientificName: 'Penaeus notialis', commonName: 'Southern Pink Shrimp' },
          quantity: 2500,
          unit: 'kg'
        },
        origin: { location: 'Cross River Delta' },
        stages: [
          { name: 'Fishing', status: 'COMPLETED', completedAt: '2025-08-18' },
          { name: 'Processing', status: 'COMPLETED', completedAt: '2025-08-19' },
          { name: 'Distribution', status: 'COMPLETED', completedAt: '2025-08-21' },
          { name: 'Retail', status: 'COMPLETED', completedAt: '2025-08-22' }
        ],
        createdAt: '2025-08-18T05:30:00Z',
        updatedAt: '2025-08-22T16:45:00Z',
        creator: { name: 'Captain Ibrahim Hassan', organization: 'Delta Fisheries Cooperative' },
        qrCodeGenerated: true,
        blockchainRecorded: true
      }
    ]
  }
]

interface BatchManagementInterfaceProps {
  onCreateBatch?: () => void
  onEditBatch?: (batchId: string) => void
  onViewBatch?: (batchId: string) => void
  onDeleteBatch?: (batchId: string) => void
}

export default function BatchManagementInterface({
  onCreateBatch,
  onEditBatch,
  onViewBatch,
  onDeleteBatch
}: BatchManagementInterfaceProps) {
  const [batches, setBatches] = useState<BatchInfo[]>(mockBatches)
  const [filteredBatches, setFilteredBatches] = useState<BatchInfo[]>(mockBatches)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>('all')
  const [selectedBatch, setSelectedBatch] = useState<BatchInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Filter batches
  useEffect(() => {
    let filtered = batches

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(batch => 
        batch.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.species.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.species.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.origin.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.creator.organization.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(batch => batch.status === statusFilter)
    }

    // Apply source type filter
    if (sourceTypeFilter !== 'all') {
      filtered = filtered.filter(batch => batch.sourceType === sourceTypeFilter)
    }

    setFilteredBatches(filtered)
  }, [batches, searchQuery, statusFilter, sourceTypeFilter])

  // Get status badge
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
    total: batches.length,
    active: batches.filter(b => b.status === 'ACTIVE').length,
    completed: batches.filter(b => b.status === 'COMPLETED').length,
    totalProducts: batches.reduce((sum, batch) => sum + batch.products.length, 0),
    averageProgress: batches.reduce((sum, batch) => sum + batch.averageProgress, 0) / batches.length
  }

  // Handle actions
  const handleViewBatch = (batchId: string) => {
    const batch = batches.find(b => b.batchId === batchId)
    if (batch) {
      setSelectedBatch(batch)
    }
    onViewBatch?.(batchId)
  }

  const handleEditBatch = (batchId: string) => {
    onEditBatch?.(batchId)
  }

  const handleDeleteBatch = async (batchId: string) => {
    if (confirm(`Are you sure you want to delete batch ${batchId}? This will affect all products in the batch.`)) {
      try {
        setBatches(prev => prev.filter(b => b.batchId !== batchId))
        toast({
          title: "Batch Deleted",
          description: `Batch ${batchId} and all its products have been deleted.`,
        })
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Could not delete batch. Please try again.",
          variant: "destructive"
        })
      }
    }
    onDeleteBatch?.(batchId)
  }

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Preparing batch data for download...",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batch Management</h1>
          <p className="text-gray-600">Manage groups of products in batches for efficient tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={onCreateBatch} className="gap-2">
            <Plus className="h-4 w-4" />
            New Batch
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-lg font-bold">{stats.total}</p>
                <p className="text-xs text-gray-600">Total Batches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-lg font-bold">{stats.completed}</p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-lg font-bold">{stats.totalProducts}</p>
                <p className="text-xs text-gray-600">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-lg font-bold">{Math.round(stats.averageProgress)}%</p>
                <p className="text-xs text-gray-600">Avg Progress</p>
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
              <Label htmlFor="search" className="sr-only">Search batches</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by batch ID, species, location, or creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
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

            <div className="sm:w-48">
              <Select value={sourceTypeFilter} onValueChange={setSourceTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="FARMED">Farmed</SelectItem>
                  <SelectItem value="WILD_CAPTURE">Wild-capture</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Batches ({filteredBatches.length})</CardTitle>
          <CardDescription>
            {searchQuery ? `Showing results for "${searchQuery}"` : 'All batch records'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBatches.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Batches Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'No batches match your search criteria.' : 'Get started by creating your first batch.'}
              </p>
              <Button onClick={onCreateBatch} className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Batch
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Species</TableHead>
                    <TableHead>Source Type</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Total Quantity</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.map((batch) => (
                    <TableRow key={batch.batchId} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          {batch.batchId}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{batch.species.commonName}</p>
                          <p className="text-xs text-gray-500 italic">{batch.species.scientificName}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getSourceTypeBadge(batch.sourceType)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-sm font-medium">{batch.products.length}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-medium">{batch.totalQuantity.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{batch.unit}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${batch.averageProgress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{Math.round(batch.averageProgress)}%</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(batch.status)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{formatDate(batch.createdAt)}</span>
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
                            <DropdownMenuItem onClick={() => handleViewBatch(batch.batchId)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {(batch.status === 'DRAFT' || batch.status === 'ACTIVE') && (
                              <DropdownMenuItem onClick={() => handleEditBatch(batch.batchId)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Batch
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteBatch(batch.batchId)}
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

      {/* Batch Detail Modal */}
      {selectedBatch && (
        <Dialog open={!!selectedBatch} onOpenChange={() => setSelectedBatch(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {selectedBatch.batchId} Details
              </DialogTitle>
              <DialogDescription>
                Detailed information and products in this batch
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Batch Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Batch Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Batch ID:</span> {selectedBatch.batchId}</div>
                    <div><span className="font-medium">Species:</span> {selectedBatch.species.commonName}</div>
                    <div><span className="font-medium">Scientific Name:</span> <em>{selectedBatch.species.scientificName}</em></div>
                    <div><span className="font-medium">Source Type:</span> {selectedBatch.sourceType}</div>
                    <div><span className="font-medium">Total Quantity:</span> {selectedBatch.totalQuantity} {selectedBatch.unit}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Origin & Creator</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Location:</span> {selectedBatch.origin.location}</div>
                    {selectedBatch.origin.facility && (
                      <div><span className="font-medium">Facility:</span> {selectedBatch.origin.facility}</div>
                    )}
                    <div><span className="font-medium">Creator:</span> {selectedBatch.creator.name}</div>
                    <div><span className="font-medium">Organization:</span> {selectedBatch.creator.organization}</div>
                    <div><span className="font-medium">Created:</span> {formatDate(selectedBatch.createdAt)}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Progress & Status</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Status:</span> {getStatusBadge(selectedBatch.status)}</div>
                    <div><span className="font-medium">Products:</span> {selectedBatch.products.length}</div>
                    <div><span className="font-medium">Average Progress:</span> {Math.round(selectedBatch.averageProgress)}%</div>
                    <div className="mt-2">
                      <Progress value={selectedBatch.averageProgress} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Products in Batch */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Products in Batch ({selectedBatch.products.length})</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product ID</TableHead>
                        <TableHead>Current Stage</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>QR/Blockchain</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBatch.products.map((product) => {
                        const completedStages = product.stages.filter(s => s.status === 'COMPLETED').length
                        const progress = (completedStages / product.stages.length) * 100
                        
                        return (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.productId}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{product.currentStage}</Badge>
                            </TableCell>
                            <TableCell>{product.product.quantity} {product.product.unit}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-gray-200 rounded-full">
                                  <div 
                                    className="h-full bg-blue-600 rounded-full"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-xs">{Math.round(progress)}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(product.status)}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                  <QrCode className="h-3 w-3" />
                                  <span className={`text-xs ${product.qrCodeGenerated ? 'text-green-600' : 'text-gray-400'}`}>
                                    {product.qrCodeGenerated ? 'Generated' : 'Pending'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-purple-600"></div>
                                  <span className={`text-xs ${product.blockchainRecorded ? 'text-green-600' : 'text-gray-400'}`}>
                                    {product.blockchainRecorded ? 'Recorded' : 'Pending'}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}