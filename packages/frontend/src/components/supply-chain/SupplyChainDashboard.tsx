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
import { Search, Plus, Filter, Download, MoreHorizontal, Edit, Trash2, Eye, Package, Truck, Users, TrendingUp, QrCode, MapPin, Calendar, Fish, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supplyChainApi } from '@/services/supplyChainApi'
import type { SupplyChainRecord, SourceType, RecordStatus } from '@/services/supplyChainApi'

// **COMMENTED OUT MOCK DATA - DO NOT DELETE**
// Mock data structure - this will come from API
// interface SupplyChainRecord {
//   id: string
//   productId: string
//   batchId: string
//   sourceType: 'FARMED' | 'WILD_CAPTURE'
//   currentStage: string
//   status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'REJECTED'
//   product: {
//     species: {
//       scientificName: string
//       commonName: string
//     }
//     quantity: number
//     unit: string
//   }
//   origin: {
//     location: string
//     coordinates?: string
//     facility?: string
//   }
//   stages: Array<{
//     name: string
//     status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
//     completedAt?: string
//     location?: string
//   }>
//   createdAt: string
//   updatedAt: string
//   creator: {
//     name: string
//     organization: string
//     role: string
//   }
//   qrCodeGenerated: boolean
//   blockchainRecorded: boolean
// }

// **COMMENTED OUT MOCK DATA ARRAY**
// const mockRecords: SupplyChainRecord[] = [
//   {
//     id: '1',
//     productId: 'SC-2025-001',
//     batchId: 'BATCH-001',
//     sourceType: 'FARMED',
//     currentStage: 'Processing',
//     status: 'ACTIVE',
//     product: {
//       species: {
//         scientificName: 'Crassostrea gasar',
//         commonName: 'West African Oyster'
//       },
//       quantity: 5000,
//       unit: 'pieces'
//     },
//     origin: {
//       location: 'Lagos Lagoon Oyster Farm',
//       coordinates: '6.4541, 3.3947',
//       facility: 'Aqua-Tech Farms Ltd'
//     },
//     stages: [
//       { name: 'Hatchery', status: 'COMPLETED', completedAt: '2025-06-01', location: 'Lagos Hatchery' },
//       { name: 'Grow-out', status: 'COMPLETED', completedAt: '2025-08-15', location: 'Lagos Lagoon Farm' },
//       { name: 'Harvest', status: 'COMPLETED', completedAt: '2025-08-20', location: 'Lagos Lagoon Farm' },
//       { name: 'Processing', status: 'IN_PROGRESS', location: 'Marina Processing Plant' },
//       { name: 'Distribution', status: 'PENDING' },
//       { name: 'Retail', status: 'PENDING' }
//     ],
//     createdAt: '2025-06-01T08:00:00Z',
//     updatedAt: '2025-08-21T14:30:00Z',
//     creator: {
//       name: 'John Okafor',
//       organization: 'Aqua-Tech Farms Ltd',
//       role: 'Farmer'
//     },
//     qrCodeGenerated: true,
//     blockchainRecorded: false
//   },
//   // ... other mock records
// ]

interface SupplyChainPageState {
  searchTerm: string
  statusFilter: string
  sourceTypeFilter: string
  stageFilter: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  selectedRecords: string[]
  viewMode: 'table' | 'cards'
}

interface SupplyChainPageProps {
  onCreateNew: () => void
  onEditRecord: (recordId: string) => void
  onViewRecord: (recordId: string) => void
}

export default function SupplyChainDashboard({
  onCreateNew,
  onEditRecord,
  onViewRecord
}: SupplyChainPageProps) {
  const [state, setState] = useState<SupplyChainPageState>({
    searchTerm: '',
    statusFilter: 'all',
    sourceTypeFilter: 'all',
    stageFilter: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    selectedRecords: [],
    viewMode: 'table'
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
    queryKey: ['supply-chain-records', state.statusFilter, state.sourceTypeFilter, state.stageFilter, state.searchTerm],
    queryFn: async () => {
      const params: any = {}

      if (state.statusFilter !== 'all') {
        params.status = state.statusFilter.toUpperCase()
      }

      if (state.sourceTypeFilter !== 'all') {
        params.sourceType = state.sourceTypeFilter.toUpperCase()
      }

      if (state.stageFilter !== 'all') {
        params.currentStage = state.stageFilter
      }

      if (state.searchTerm) {
        params.search = state.searchTerm
      }

      params.sortBy = state.sortBy
      params.sortOrder = state.sortOrder

      return await supplyChainApi.getRecords(params)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // **REAL STATISTICS API INTEGRATION**
  const {
    data: statistics,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['supply-chain-statistics'],
    queryFn: () => supplyChainApi.getStatistics(),
    staleTime: 5 * 60 * 1000,
  })

  // **DELETE MUTATION**
  const deleteMutation = useMutation({
    mutationFn: (recordId: string) => supplyChainApi.deleteRecord(recordId),
    onSuccess: () => {
      toast({
        title: "Record Deleted",
        description: "Supply chain record has been deleted successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ['supply-chain-records'] })
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete record. Please try again.",
        variant: "destructive"
      })
    },
  })

  // **QR CODE GENERATION MUTATION**
  const generateQRMutation = useMutation({
    mutationFn: (recordId: string) => supplyChainApi.generateQRCode(recordId),
    onSuccess: () => {
      toast({
        title: "QR Code Generated",
        description: "QR code has been generated successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ['supply-chain-records'] })
    },
    onError: (error: any) => {
      toast({
        title: "QR Generation Failed",
        description: error.message || "Failed to generate QR code. Please try again.",
        variant: "destructive"
      })
    },
  })

  // **DERIVED DATA FROM API RESPONSE**
  const records: SupplyChainRecord[] = (apiResponse as any)?.records || []
  const totalRecords: number = (apiResponse as any)?.total || 0

  // **HANDLE REAL API ERRORS**
  useEffect(() => {
    if (error) {
      toast({
        title: "Failed to Load Records",
        description: "Could not fetch supply chain records. Please check your connection.",
        variant: "destructive"
      })
    }
  }, [error, toast])

  // **REAL STATISTICS CALCULATIONS**
  const stats = {
    total: (statistics as any)?.totalRecords || totalRecords,
    active: (statistics as any)?.recordsByStatus?.active || records.filter((r: SupplyChainRecord) => r.status === 'ACTIVE').length,
    completed: (statistics as any)?.recordsByStatus?.completed || records.filter((r: SupplyChainRecord) => r.status === 'COMPLETED').length,
    draft: (statistics as any)?.recordsByStatus?.draft || records.filter((r: SupplyChainRecord) => r.status === 'DRAFT').length,
    farmed: (statistics as any)?.recordsBySourceType?.farmed || records.filter((r: SupplyChainRecord) => r.sourceType === 'FARMED').length,
    wildCapture: (statistics as any)?.recordsBySourceType?.wildCapture || records.filter((r: SupplyChainRecord) => r.sourceType === 'WILD_CAPTURE').length,
    qrGenerated: (statistics as any)?.qrCodeStats?.generated || records.filter((r: SupplyChainRecord) => r.qrCodeGenerated).length,
    blockchainRecorded: (statistics as any)?.blockchainStats?.recorded || records.filter((r: SupplyChainRecord) => r.blockchainTxHash).length,
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
      selectedRecords: selected ? records.map((r: SupplyChainRecord) => r.id) : []
    }))
  }

  // Handle delete with confirmation
  const handleDeleteRecord = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this supply chain record? This action cannot be undone.')) {
      deleteMutation.mutate(recordId)
    }
  }

  // Handle QR code generation
  const handleGenerateQR = async (recordId: string) => {
    generateQRMutation.mutate(recordId)
  }

  // Get stage status badge color
  const getStageStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'default'
      case 'IN_PROGRESS': return 'secondary'
      case 'PENDING': return 'outline'
      default: return 'outline'
    }
  }

  // Get source type icon and color
  const getSourceTypeInfo = (sourceType: SourceType) => {
    return sourceType === 'FARMED'
      ? { icon: Fish, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Farmed' }
      : { icon: MapPin, color: 'text-green-600', bg: 'bg-green-50', label: 'Wild-capture' }
  }

  // Format progress percentage
  const getProgressPercentage = (record: SupplyChainRecord) => {
    const completedStages = record.stages?.filter(s => s.status === 'COMPLETED').length || 0
    const totalStages = record.stages?.length || 1
    return Math.round((completedStages / totalStages) * 100)
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
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Connection Error</h3>
            <p className="mt-1 text-sm text-gray-500">
              Unable to load supply chain records. Please check your connection.
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
            <Package className="w-6 h-6 text-blue-600" />
            Supply Chain Records
          </h1>
          <p className="text-gray-600">
            Track products from source to consumer with complete traceability
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
            New Product
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? '...' : stats.total}</div>
            <p className="text-xs text-muted-foreground">All tracked products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statsLoading ? '...' : stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently in transit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Codes</CardTitle>
            <QrCode className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{statsLoading ? '...' : stats.qrGenerated}</div>
            <p className="text-xs text-muted-foreground">Generated codes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockchain</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statsLoading ? '...' : stats.blockchainRecorded}</div>
            <p className="text-xs text-muted-foreground">Records on-chain</p>
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
                  placeholder="Search products, species, batches..."
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
                  <SelectItem value="rejected">Rejected</SelectItem>
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
                More Filters
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
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {state.searchTerm || state.statusFilter !== 'all' || state.sourceTypeFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first supply chain record.'
                }
              </p>
              <Button className="mt-4" onClick={onCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Product
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
                    <TableHead>Product ID</TableHead>
                      <TableHead>Species & Source</TableHead>
                    <TableHead>Current Stage</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Created</TableHead>
                    <TableHead>Creator</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((record: SupplyChainRecord) => {
                      const sourceInfo = getSourceTypeInfo(record.sourceType)
                      const progress = getProgressPercentage(record)

                      return (
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
                            <div className="flex flex-col space-y-1">
                              <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-mono">
                                {record.productId}
                              </code>
                              {record.batchId && (
                                <span className="text-xs text-gray-500">Batch: {record.batchId}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-2">
                              <div>
                                <div className="font-medium">{record.product?.species?.commonName || 'Unknown Species'}</div>
                                <div className="text-sm text-gray-500 italic">{record.product?.species?.scientificName}</div>
                              </div>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${sourceInfo.bg} ${sourceInfo.color}`}>
                                <sourceInfo.icon className="w-3 h-3 mr-1" />
                                {sourceInfo.label}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              <span className="font-medium">{record.currentStage}</span>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {record.origin?.location || 'Location not set'}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium">{progress}%</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {record.stages?.filter((s: any) => s.status === 'COMPLETED').length || 0} of {record.stages?.length || 0} stages
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              record.status === 'COMPLETED' ? 'default' :
                                record.status === 'ACTIVE' ? 'secondary' :
                                  record.status === 'REJECTED' ? 'destructive' : 'outline'
                            }>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {record.qrCodeGenerated ? (
                                <Badge variant="default" className="text-xs">
                                  <QrCode className="w-3 h-3 mr-1" />
                                  Generated
                                </Badge>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleGenerateQR(record.id)}
                                  disabled={generateQRMutation.isPending}
                                  className="text-xs h-6"
                                >
                                  <QrCode className="w-3 h-3 mr-1" />
                                  Generate
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm font-medium">{record.creator?.name || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">{record.creator?.organization}</div>
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
                                  View Journey
                                </DropdownMenuItem>
                                {(record.status === 'DRAFT' || record.status === 'ACTIVE') && (
                                  <DropdownMenuItem onClick={() => onEditRecord(record.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Record
                                  </DropdownMenuItem>
                                )}
                                {!record.qrCodeGenerated && (
                                  <DropdownMenuItem onClick={() => handleGenerateQR(record.id)}>
                                    <QrCode className="mr-2 h-4 w-4" />
                                    Generate QR
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
                      )
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="text-sm text-gray-500 text-center">
        Showing {records.length} of {totalRecords} supply chain records
        {state.statusFilter !== 'all' && ` (status: ${state.statusFilter})`}
        {state.sourceTypeFilter !== 'all' && ` (source: ${state.sourceTypeFilter})`}
        {state.searchTerm && ` (search: "${state.searchTerm}")`}
      </div>
    </div>
  )
}