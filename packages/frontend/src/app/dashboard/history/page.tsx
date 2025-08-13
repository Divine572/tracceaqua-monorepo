'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  History, 
  Search, 
  Calendar, 
  Filter,
  Eye,
  QrCode,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface ScanHistory {
  id: string
  productId: string
  productName: string
  batchNumber: string
  origin: string
  scanDate: string
  status: 'valid' | 'invalid' | 'expired'
  method: 'camera' | 'upload' | 'manual'
}

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Mock data - replace with actual API call
  const scanHistory: ScanHistory[] = [
    {
      id: '1',
      productId: 'TRA-2024-001234',
      productName: 'Fresh Atlantic Salmon',
      batchNumber: 'LAG-2024-0156',
      origin: 'Lagos Fish Farm, Nigeria',
      scanDate: '2024-08-12T10:30:00Z',
      status: 'valid',
      method: 'camera'
    },
    {
      id: '2',
      productId: 'TRA-2024-005678',
      productName: 'Frozen Shrimp',
      batchNumber: 'PHC-2024-0234',
      origin: 'Port Harcourt Fisheries',
      scanDate: '2024-08-11T15:45:00Z',
      status: 'valid',
      method: 'upload'
    },
    {
      id: '3',
      productId: 'TRA-2024-009012',
      productName: 'Fresh Tilapia',
      batchNumber: 'ABJ-2024-0089',
      origin: 'Abuja Aquaculture Center',
      scanDate: '2024-08-10T09:15:00Z',
      status: 'expired',
      method: 'manual'
    },
    {
      id: '4',
      productId: 'TRA-2024-003456',
      productName: 'Catfish Fillets',
      batchNumber: 'KAN-2024-0145',
      origin: 'Kano Fish Processing',
      scanDate: '2024-08-09T14:20:00Z',
      status: 'valid',
      method: 'camera'
    }
  ]

  const filteredHistory = scanHistory.filter(item => {
    const matchesSearch = !searchTerm || 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || item.status === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'invalid':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'invalid':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'camera':
        return '📸'
      case 'upload':
        return '📁'
      case 'manual':
        return '⌨️'
      default:
        return '🔍'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History className="w-6 h-6 text-blue-600" />
          Scan History
        </h1>
        <p className="text-gray-600">
          View your previous scans and traced products
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name, ID, or batch number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                All
              </Button>
              <Button
                variant={selectedFilter === 'valid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('valid')}
              >
                Valid
              </Button>
              <Button
                variant={selectedFilter === 'expired' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('expired')}
              >
                Expired
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scanHistory.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Products</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {scanHistory.filter(item => item.status === 'valid').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently valid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {scanHistory.filter(item => {
                const scanDate = new Date(item.scanDate)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return scanDate > weekAgo
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Recent scans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No scan history</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedFilter !== 'all' 
                    ? 'No scans match your search criteria' 
                    : 'Start scanning products to build your history'
                  }
                </p>
                <Link href="/dashboard/scan">
                  <Button>
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan Your First Product
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{item.productName}</h3>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(item.status)}
                          {item.status.toUpperCase()}
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="grid gap-2 sm:grid-cols-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Product ID:</span> {item.productId}
                      </div>
                      <div>
                        <span className="font-medium">Batch:</span> {item.batchNumber}
                      </div>
                      <div>
                        <span className="font-medium">Origin:</span> {item.origin}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Scanned:</span> 
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(item.scanDate))} ago
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <span>{getMethodIcon(item.method)}</span>
                      <span>Scanned via {item.method}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Link href={`/dashboard/trace/${item.productId}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Trace
                      </Button>
                    </Link>
                    {/* <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Share
                    </Button> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}