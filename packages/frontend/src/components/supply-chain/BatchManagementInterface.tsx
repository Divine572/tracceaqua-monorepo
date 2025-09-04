'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Plus, Filter, Download, MoreHorizontal, Edit, Trash2, Eye, Package, Users, TrendingUp, MapPin, Calendar, Fish, RefreshCw, Layers } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supplyChainApi } from '@/services/supplyChainApi'
import type { SupplyChainRecord, SourceType, RecordStatus } from '@/services/supplyChainApi'

// **COMMENTED OUT MOCK DATA - DO NOT DELETE**
// type SourceType = 'FARMED' | 'WILD_CAPTURE'
// type RecordStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'REJECTED'

// interface BatchInfo {
//   batchId: string
//   products: SupplyChainRecord[]
//   totalQuantity: number
//   unit: string
//   averageProgress: number
//   stages: string[]
//   createdAt: string
//   status: RecordStatus
//   sourceType: SourceType
//   species: {
//     scientificName: string
//     commonName: string
//   }
//   origin: {
//     location: string
//     facility?: string
//   }
//   creator: {
//     name: string
//     organization: string
//   }
// }

// **COMMENTED OUT MOCK DATA ARRAY**
// const mockBatches: BatchInfo[] = [
//   {
//     batchId: 'BATCH-001',
//     sourceType: 'FARMED',
//     species: {
//       scientificName: 'Crassostrea gasar',
//       commonName: 'West African Oyster'
//     },
//     totalQuantity: 15000,
//     unit: 'pieces',
//     averageProgress: 67,
//     stages: ['Hatchery', 'Grow-out', 'Harvest', 'Processing', 'Distribution', 'Retail'],
//     status: 'ACTIVE',
//     createdAt: '2025-06-01T08:00:00Z',
//     origin: {
//       location: 'Lagos Lagoon Oyster Farm',
//       facility: 'Aqua-Tech Farms Ltd'
//     },
//     creator: {
//       name: 'John Okafor',
//       organization: 'Aqua-Tech Farms Ltd'
//     },
//     products: [...]
//   },
//   // ... other mock batches
// ]

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

interface BatchPageState {
  searchTerm: string
  statusFilter: string
  sourceTypeFilter: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  selectedBatches: string[]
}

interface BatchManagementProps {
  onViewBatch?: (batchId: string) => void
  onEditBatch?: (batchId: string) => void
  onDeleteBatch?: (batchId: string) => void
  onCreateBatch?: () => void
}

export default function BatchManagementInterface({
  onViewBatch,
  onEditBatch,
  onDeleteBatch,
  onCreateBatch
}: BatchManagementProps) {
  const [state, setState] = useState<BatchPageState>({
    searchTerm: '',
    statusFilter: 'all',
    sourceTypeFilter: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    selectedBatches: []
  })

  const [selectedBatch, setSelectedBatch] = useState<BatchInfo | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // **REAL API INTEGRATION - REPLACE MOCK DATA**
  const {
    data: batchesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['supply-chain-batches', state.statusFilter, state.sourceTypeFilter, state.searchTerm],
    queryFn: async () => {
      // Get all records first
      const params: any = {}

      if (state.statusFilter !== 'all') {
        params.status = state.statusFilter.toUpperCase()
      }

      if (state.sourceTypeFilter !== 'all') {
        params.sourceType = state.sourceTypeFilter.toUpperCase()
      }

      if (state.searchTerm) {
        params.search = state.searchTerm
      }

      params.sortBy = state.sortBy
      params.sortOrder = state.sortOrder

      const response = await supplyChainApi.getRecords(params)
      const records = response.records || []

      // Group records by batch ID
      const batchMap = new Map<string, SupplyChainRecord[]>()

      records.forEach(record => {
        const batchId = record.batchId || `INDIVIDUAL-${record.id}`
        if (!batchMap.has(batchId)) {
          batchMap.set(batchId, [])
        }
        batchMap.get(batchId)!.push(record)
      })

      // Convert to BatchInfo array
      const batches: BatchInfo[] = Array.from(batchMap.entries()).map(([batchId, products]) => {
        const firstProduct = products[0]
        const totalQuantity = products.reduce((sum, p) => sum + (p.product?.quantity || 0), 0)
        const completedStages = products.reduce((sum, p) => {
          const completed = p.stages?.filter(s => s.status === 'COMPLETED').length || 0
          const total = p.stages?.length || 1
          return sum + (completed / total)
        }, 0)
        const averageProgress = Math.round((completedStages / products.length) * 100)

        // Get all unique stages
        const stagesSet = new Set<string>()
        products.forEach(p => {
          p.stages?.forEach(s => stagesSet.add(s.name))
        })

        return {
          batchId,
          products,
          totalQuantity,
          unit: firstProduct.product?.unit || 'units',
          averageProgress,
          stages: Array.from(stagesSet),
          createdAt: firstProduct.createdAt,
          status: firstProduct.status,
          sourceType: firstProduct.sourceType,
          species: {
            scientificName: firstProduct.product?.species?.scientificName || 'Unknown',
            commonName: firstProduct.product?.species?.commonName || 'Unknown Species'
          },
          origin: {
            location: firstProduct.origin?.location || 'Unknown Location',
            facility: firstProduct.origin?.facility
          },
          creator: {
            name: firstProduct.creator?.name || 'Unknown',
            organization: firstProduct.creator?.organization || 'Unknown Organization'
          }
        }
      })

      return {
        batches: batches.sort((a, b) => {
          const aValue = a[state.sortBy as keyof BatchInfo] as any
          const bValue = b[state.sortBy as keyof BatchInfo] as any

          if (state.sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        }),
        total: batches.length
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // **DELETE BATCH MUTATION**
  const deleteBatchMutation = useMutation({
    mutationFn: async (batchId: string) => {
      // Delete all products in the batch
      const batch = batches.find((b: BatchInfo) => b.batchId === batchId)
      if (!batch) throw new Error('Batch not found')

      await Promise.all(
        batch.products.map((product: SupplyChainRecord) => supplyChainApi.deleteRecord(product.id))
      )
    },
    onSuccess: (_, batchId) => {
      toast({
        title: "Batch Deleted",
        description: `Batch ${batchId} and all its products have been deleted successfully.`,
      })
      queryClient.invalidateQueries({ queryKey: ['supply-chain-batches'] })
      onDeleteBatch?.(batchId)
    },
    onError: (error: any, batchId) => {
      toast({
        title: "Delete Failed",
        description: `Failed to delete batch ${batchId}. ${error.message}`,
        variant: "destructive"
      })
    },
  })

  // **DERIVED DATA FROM API RESPONSE**
  const batches: BatchInfo[] = (batchesData as any)?.batches || []
  const totalBatches: number = (batchesData as any)?.total || 0

  // **HANDLE REAL API ERRORS**
  useEffect(() => {
    if (error) {
      toast({
        title: "Failed to Load Batches",
        description: "Could not fetch batch information. Please check your connection.",
        variant: "destructive"
      })
    }
  }, [error, toast])

  // **REAL STATISTICS CALCULATIONS**
  const stats = {
    total: totalBatches,
    active: batches.filter((b: BatchInfo) => b.status === 'ACTIVE').length,
    completed: batches.filter((b: BatchInfo) => b.status === 'COMPLETED').length,
    totalProducts: batches.reduce((sum: number, batch: BatchInfo) => sum + batch.products.length, 0),
    averageProgress: batches.length > 0 ? Math.round(batches.reduce((sum: number, batch: BatchInfo) => sum + batch.averageProgress, 0) / batches.length) : 0
  }

  // Handle search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // Search is handled by react-query key change
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [state.searchTerm])

  // Handle batch selection
  const handleBatchSelection = (batchId: string, selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedBatches: selected
        ? [...prev.selectedBatches, batchId]
        : prev.selectedBatches.filter(id => id !== batchId)
    }))
  }

  const handleSelectAll = (selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedBatches: selected ? batches.map((b: BatchInfo) => b.batchId) : []
    }))
  }

  // Handle actions
  const handleViewBatch = (batchId: string) => {
    const batch = batches.find((b: BatchInfo) => b.batchId === batchId)
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
      deleteBatchMutation.mutate(batchId)
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

  // Get source type badge
  const getSourceTypeBadge = (sourceType: SourceType) => {
    return sourceType === 'FARMED'
      ? <Badge variant="outline" className="gap-1"><Fish className="h-3 w-3" />Farmed</Badge>
      : <Badge variant="outline" className="gap-1"><MapPin className="h-3 w-3" />Wild-capture</Badge>
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
  if (error && !batches.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Layers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Connection Error</h3>
            <p className="mt-1 text-sm text-gray-500">
              Unable to load batch information. Please check your connection.
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
            <Layers className="w-6 h-6 text-blue-600" />
            Batch Management
          </h1>
          <p className="text-gray-600">
            Manage and track product batches throughout the supply chain
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
          {onCreateBatch && (
            <Button onClick={onCreateBatch}>
              <Plus className="mr-2 h-4 w-4" />
              New Batch
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All product batches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Across all batches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">Completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search batches, species, locations..."
                  value={state.searchTerm}
                  onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>

              <Select
                value={state.statusFilter}
                onValueChange={(value) => setState(prev => ({ ...prev, statusFilter: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={state.sourceTypeFilter}
                onValueChange={(value) => setState(prev => ({ ...prev, sourceTypeFilter: value }))}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="farmed">Farmed</SelectItem>
                  <SelectItem value="wild_capture">Wild-capture</SelectItem>
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

      {/* Batches Table */}
      <Card>
        <CardContent className="pt-6">
          {batches.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No batches found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {state.searchTerm || state.statusFilter !== 'all' || state.sourceTypeFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Batches will appear here when products share the same batch ID.'
                }
              </p>
            </div>
          ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={state.selectedBatches.length === batches.length && batches.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                    <TableHead>Batch ID</TableHead>
                      <TableHead>Species & Source</TableHead>
                      <TableHead>Products</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {batches.map((batch: BatchInfo) => (
                    <TableRow key={batch.batchId} className="hover:bg-gray-50">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={state.selectedBatches.includes(batch.batchId)}
                            onChange={(e) => handleBatchSelection(batch.batchId, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                      <TableCell className="font-medium">
                          <code className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-sm font-mono">
                          {batch.batchId}
                          </code>
                        </TableCell>
                      <TableCell>
                          <div className="flex flex-col space-y-2">
                            <div>
                              <div className="font-medium">{batch.species.commonName}</div>
                              <div className="text-sm text-gray-500 italic">{batch.species.scientificName}</div>
                            </div>
                            {getSourceTypeBadge(batch.sourceType)}
                          </div>
                        </TableCell>
                      <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="font-medium">{batch.products.length} products</div>
                            <div className="text-sm text-gray-500">
                              {batch.totalQuantity.toLocaleString()} {batch.unit}
                            </div>
                        </div>
                        </TableCell>
                      <TableCell>
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${batch.averageProgress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium">{batch.averageProgress}%</span>
                            </div>
                        </div>
                        </TableCell>
                      <TableCell>
                          <Badge variant={
                            batch.status === 'COMPLETED' ? 'default' :
                              batch.status === 'ACTIVE' ? 'secondary' :
                                batch.status === 'REJECTED' ? 'destructive' : 'outline'
                          }>
                            {batch.status}
                          </Badge>
                      </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(batch.createdAt)}</span>
                          </div>
                        </TableCell>
                      <TableCell>
                          <div>
                            <div className="text-sm font-medium">{batch.creator.name}</div>
                            <div className="text-xs text-gray-500">{batch.creator.organization}</div>
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
                            <DropdownMenuItem onClick={() => handleViewBatch(batch.batchId)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                              {(batch.status === 'DRAFT' || batch.status === 'ACTIVE') && onEditBatch && (
                              <DropdownMenuItem onClick={() => handleEditBatch(batch.batchId)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Batch
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteBatch(batch.batchId)}
                              className="text-red-600"
                                disabled={deleteBatchMutation.isPending}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                                {deleteBatchMutation.isPending ? 'Deleting...' : 'Delete'}
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
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Batch Details: {selectedBatch.batchId}
              </DialogTitle>
              <DialogDescription>
                Complete information about this product batch
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Batch Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedBatch.products.length}</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedBatch.totalQuantity.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{selectedBatch.unit}</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedBatch.averageProgress}%</div>
                  <div className="text-sm text-gray-600">Progress</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{selectedBatch.stages.length}</div>
                  <div className="text-sm text-gray-600">Stages</div>
                </div>
              </div>

              {/* Products in Batch */}
              <div>
                <h4 className="font-semibold mb-3">Products in this Batch</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product ID</TableHead>
                        <TableHead>Current Stage</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBatch.products.map((product) => {
                        const completedStages = product.stages?.filter(s => s.status === 'COMPLETED').length || 0
                        const totalStages = product.stages?.length || 1
                        const productProgress = Math.round((completedStages / totalStages) * 100)
                        
                        return (
                          <TableRow key={product.id}>
                            <TableCell className="font-mono text-sm">{product.productId}</TableCell>
                            <TableCell>{product.currentStage}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${productProgress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs">{productProgress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                product.status === 'COMPLETED' ? 'default' :
                                  product.status === 'ACTIVE' ? 'secondary' :
                                    product.status === 'REJECTED' ? 'destructive' : 'outline'
                              }>
                                {product.status}
                              </Badge>
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

      {/* Summary */}
      <div className="text-sm text-gray-500 text-center">
        Showing {batches.length} batches with {stats.totalProducts} total products
        {state.statusFilter !== 'all' && ` (status: ${state.statusFilter})`}
        {state.sourceTypeFilter !== 'all' && ` (source: ${state.sourceTypeFilter})`}
        {state.searchTerm && ` (search: "${state.searchTerm}")`}
      </div>
    </div>
  )
}