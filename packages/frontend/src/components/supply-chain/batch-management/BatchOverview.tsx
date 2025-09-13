'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Filter, Eye, Edit, QrCode, MoreHorizontal } from 'lucide-react'
import { SupplyChainBatch, SupplyChainStage } from '@/lib/supply-chain-types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

// Mock data - replace with actual API call
const mockBatches: SupplyChainBatch[] = [
  {
    id: '1',
    batchNumber: 'TAQ-2024-001',
    productType: 'wild-capture' as any,
    category: 'molluscs' as any,
    species: 'Crassostrea gigas',
    commonName: 'Pacific Oyster',
    currentStage: SupplyChainStage.PROCESSING,
    status: 'active',
    stages: [],
    createdBy: 'user1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-18'),
    views: 45,
  },
  {
    id: '2',
    batchNumber: 'TAQ-2024-002',
    productType: 'farmed' as any,
    category: 'finfish' as any,
    species: 'Oreochromis niloticus',
    commonName: 'Nile Tilapia',
    currentStage: SupplyChainStage.RETAIL,
    status: 'active',
    stages: [],
    createdBy: 'user2',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-20'),
    views: 128,
  },
]

export function BatchOverview() {
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['batches', searchTerm, stageFilter, statusFilter],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return mockBatches.filter(batch => {
        const matchesSearch = !searchTerm || 
          batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          batch.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
          batch.commonName?.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesStage = stageFilter === 'all' || batch.currentStage === stageFilter
        const matchesStatus = statusFilter === 'all' || batch.status === statusFilter
        
        return matchesSearch && matchesStage && matchesStatus
      })
    },
  })

  const getStageColor = (stage: SupplyChainStage) => {
    const colors = {
      [SupplyChainStage.HARVEST]: 'bg-blue-100 text-blue-800',
      [SupplyChainStage.PROCESSING]: 'bg-yellow-100 text-yellow-800',
      [SupplyChainStage.TRANSPORT]: 'bg-purple-100 text-purple-800',
      [SupplyChainStage.RETAIL]: 'bg-green-100 text-green-800',
      [SupplyChainStage.SOLD]: 'bg-gray-100 text-gray-800',
    }
    return colors[stage] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800',
      recalled: 'bg-orange-100 text-orange-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Supply Chain Batches</h1>
          <p className="text-muted-foreground">
            Manage and track your supply chain batches
          </p>
        </div>
        <Link href="/dashboard/supply-chain/batches/create-batch">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Batch
          </Button>
        </Link>
      </div>

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
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {Object.values(SupplyChainStage).map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="recalled">Recalled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Batches</CardTitle>
          <CardDescription>
            Overview of all your supply chain batches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading batches...
                    </TableCell>
                  </TableRow>
                ) : batches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No batches found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">
                        <Link 
                          href={`/dashboard/supply-chain/batches/${batch.id}`}
                          className="text-primary hover:underline"
                        >
                          {batch.batchNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{batch.species}</div>
                          <div className="text-sm text-muted-foreground">
                            {batch.commonName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {batch.productType.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStageColor(batch.currentStage)}>
                          {batch.currentStage.charAt(0).toUpperCase() + batch.currentStage.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(batch.status)}>
                          {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{batch.views || 0}</TableCell>
                      <TableCell>{formatDate(batch.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/supply-chain/batches/${batch.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/supply-chain/batches/${batch.id}/qr`}>
                            <Button size="sm" variant="outline">
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/supply-chain/batches/${batch.id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
