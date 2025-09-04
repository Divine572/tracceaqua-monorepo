'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
  AlertCircle,
  RefreshCw,
  Camera,
  Upload,
  Smartphone,
  Activity
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

// **COMMENTED OUT MOCK DATA - DO NOT DELETE**
// interface ScanHistory {
//   id: string
//   productId: string
//   productName: string
//   batchNumber: string
//   origin: string
//   scanDate: string
//   status: 'valid' | 'invalid' | 'expired'
//   method: 'camera' | 'upload' | 'manual'
// }

// **MOCK DATA ARRAY - COMMENTED OUT**
// const scanHistory: ScanHistory[] = [
//   {
//     id: '1',
//     productId: 'TRA-2024-001234',
//     productName: 'Fresh Atlantic Salmon',
//     batchNumber: 'LAG-2024-0156',
//     origin: 'Lagos Fish Farm, Nigeria',
//     scanDate: '2024-08-12T10:30:00Z',
//     status: 'valid',
//     method: 'camera'
//   },
//   // ... other mock records
// ]

interface ScanHistory {
  id: string
  productId: string
  productName?: string
  batchNumber?: string
  origin?: string
  scanDate: string
  status: 'valid' | 'invalid' | 'expired' | 'not_found'
  method: 'camera' | 'upload' | 'manual'
  ipAddress?: string
  userAgent?: string
  location?: string
  success: boolean
  errorMessage?: string
}

interface TraceActivity {
  id: string
  productId: string
  action: 'SCAN' | 'VIEW_DETAILS' | 'DOWNLOAD_QR' | 'SHARE'
  timestamp: string
  deviceInfo?: string
  location?: string
}

interface HistoryStats {
  totalScans: number
  successfulScans: number
  uniqueProducts: number
  thisWeek: number
  thisMonth: number
}

// **HISTORY API SERVICE**
class HistoryApiService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken')
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }
    return response.json()
  }

  async getScanHistory(params: {
    page?: number
    limit?: number
    status?: string
    method?: string
    dateFrom?: string
    dateTo?: string
    search?: string
  } = {}): Promise<{
    scans: ScanHistory[]
    total: number
    page: number
    limit: number
  }> {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`${this.baseURL}/history/scans?${searchParams}`, {
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }

  async getTraceActivity(params: {
    page?: number
    limit?: number
    action?: string
    dateFrom?: string
    dateTo?: string
  } = {}): Promise<{
    activities: TraceActivity[]
    total: number
  }> {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`${this.baseURL}/history/activity?${searchParams}`, {
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }

  async getHistoryStats(): Promise<HistoryStats> {
    const response = await fetch(`${this.baseURL}/history/stats`, {
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }

  async recordScan(productId: string, method: 'camera' | 'upload' | 'manual'): Promise<ScanHistory> {
    const response = await fetch(`${this.baseURL}/history/scans`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ productId, method })
    })
    return this.handleResponse(response)
  }
}

const historyApi = new HistoryApiService()

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [activeTab, setActiveTab] = useState('scans')

  const { user } = useAuth()
  const { toast } = useToast()

  // **REAL API INTEGRATION - NO MOCK DATA**
  const {
    data: scanData,
    isLoading: scansLoading,
    error: scansError,
    refetch: refetchScans
  } = useQuery({
    queryKey: ['scan-history', selectedFilter, methodFilter, dateRange, searchTerm],
    queryFn: async () => {
      const params: any = {}

      if (selectedFilter !== 'all') {
        params.status = selectedFilter
      }

      if (methodFilter !== 'all') {
        params.method = methodFilter
      }

      if (searchTerm) {
        params.search = searchTerm
      }

      // Date range filtering
      if (dateRange !== 'all') {
        const now = new Date()
        if (dateRange === 'today') {
          params.dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        } else if (dateRange === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          params.dateFrom = weekAgo.toISOString()
        } else if (dateRange === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          params.dateFrom = monthAgo.toISOString()
        }
      }

      return await historyApi.getScanHistory(params)
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  const {
    data: activityData,
    isLoading: activityLoading
  } = useQuery({
    queryKey: ['trace-activity'],
    queryFn: () => historyApi.getTraceActivity({ limit: 50 }),
    enabled: !!user && activeTab === 'activity',
    staleTime: 2 * 60 * 1000,
  })

  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['history-stats'],
    queryFn: () => historyApi.getHistoryStats(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  const scanHistory: ScanHistory[] = (scanData as any)?.scans || []
  const totalScans: number = (scanData as any)?.total || 0
  const activities = activityData?.activities || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'text-green-600 bg-green-50'
      case 'invalid':
        return 'text-red-600 bg-red-50'
      case 'expired':
        return 'text-yellow-600 bg-yellow-50'
      case 'not_found':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'invalid':
      case 'expired':
      case 'not_found':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'camera':
        return <Camera className="h-4 w-4 text-blue-500" />
      case 'upload':
        return <Upload className="h-4 w-4 text-green-500" />
      case 'manual':
        return <Smartphone className="h-4 w-4 text-purple-500" />
      default:
        return <QrCode className="h-4 w-4 text-gray-500" />
    }
  }

  // **ERROR HANDLING - NO FALLBACK**
  if (scansError && !scanHistory.length) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Failed to Load History</h3>
              <p className="mt-1 text-sm text-gray-500">
                Unable to load scan history. Please check your connection and try again.
              </p>
              <Button
                className="mt-4"
                onClick={() => refetchScans()}
                disabled={scansLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${scansLoading ? 'animate-spin' : ''}`} />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            Scan History
          </h1>
          <p className="text-gray-600">
            Track your QR code scans and product trace activities
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={() => refetchScans()}
          disabled={scansLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${scansLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? '...' : stats?.totalScans || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statsLoading ? '...' : stats?.successfulScans || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Valid scans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Products</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statsLoading ? '...' : stats?.uniqueProducts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Different products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {statsLoading ? '...' : stats?.thisWeek || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Recent activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products, batch numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="invalid">Invalid</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="not_found">Not Found</SelectItem>
                </SelectContent>
              </Select>

              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="camera">Camera</SelectItem>
                  <SelectItem value="upload">Upload</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="scans">QR Scans ({totalScans})</TabsTrigger>
          <TabsTrigger value="activity">Trace Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="scans">
          <Card>
            <CardContent className="pt-6">
              {scansLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : scanHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <QrCode className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No scan history</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || selectedFilter !== 'all' || methodFilter !== 'all' || dateRange !== 'all'
                        ? 'No scans match your current filters. Try adjusting your search criteria.'
                        : 'Your QR code scans will appear here once you start scanning products.'
                      }
                    </p>
                    <Link href="/dashboard/scan">
                      <Button className="mt-4">
                        <QrCode className="mr-2 h-4 w-4" />
                        Scan QR Code
                      </Button>
                    </Link>
                  </div>
                ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product ID</TableHead>
                            <TableHead>Product Info</TableHead>
                            <TableHead>Scan Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Scan Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scanHistory.map((scan: ScanHistory) => (
                            <TableRow key={scan.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-mono">
                                  {scan.productId}
                                </code>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {scan.productName || 'Unknown Product'}
                                  </div>
                                  {scan.batchNumber && (
                                    <div className="text-sm text-gray-500">
                                      Batch: {scan.batchNumber}
                                    </div>
                                  )}
                                  {scan.origin && (
                                    <div className="text-sm text-gray-500">
                                      Origin: {scan.origin}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {getMethodIcon(scan.method)}
                                  <span className="capitalize">{scan.method}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(scan.status)}
                                  <Badge variant="outline" className={getStatusColor(scan.status)}>
                                    {scan.status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                </div>
                                {scan.errorMessage && (
                                  <div className="text-xs text-red-500 mt-1">
                                    {scan.errorMessage}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDistanceToNow(new Date(scan.scanDate), { addSuffix: true })}</span>
                                </div>
                                <div className="text-xs text-gray-400">
                                  {new Date(scan.scanDate).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {scan.success && (
                                    <Link href={`/trace/${scan.productId}`}>
                                      <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                      </Button>
                                    </Link>
                                  )}
                                  <Button variant="outline" size="sm">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="pt-6">
              {activityLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No trace activity</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your product trace activities will appear here.
                  </p>
                </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <QrCode className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {activity.action.replace('_', ' ').toLowerCase()} - {activity.productId}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </div>
                            {activity.location && (
                              <div className="text-xs text-gray-400">
                                Location: {activity.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <Link href={`/trace/${activity.productId}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary */}
      {scanHistory.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Showing {scanHistory.length} of {totalScans} scan records
          {selectedFilter !== 'all' && ` (status: ${selectedFilter})`}
          {methodFilter !== 'all' && ` (method: ${methodFilter})`}
          {searchTerm && ` (search: "${searchTerm}")`}
        </div>
      )}
    </div>
  )
}