'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  Eye, 
  Star,
  Download,
  Calendar,
  Filter
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalBatches: 245,
    activeBatches: 89,
    completedBatches: 156,
    totalViews: 12847,
    averageRating: 4.7,
    growthRate: 23.5
  },
  batchesByStage: [
    { stage: 'Harvest', count: 34, percentage: 38 },
    { stage: 'Processing', count: 23, percentage: 26 },
    { stage: 'Transport', count: 18, percentage: 20 },
    { stage: 'Retail', count: 14, percentage: 16 }
  ],
  batchesByCategory: [
    { category: 'Molluscs', count: 89, value: 45 },
    { category: 'Finfish', count: 76, value: 38 },
    { category: 'Crustaceans', count: 45, value: 23 },
    { category: 'Processed', count: 35, value: 18 }
  ],
  monthlyTrends: [
    { month: 'Jan', batches: 45, views: 2340, ratings: 4.6 },
    { month: 'Feb', batches: 52, views: 2890, ratings: 4.7 },
    { month: 'Mar', batches: 38, views: 2156, ratings: 4.5 },
    { month: 'Apr', batches: 61, views: 3421, ratings: 4.8 },
    { month: 'May', batches: 49, views: 2987, ratings: 4.6 },
    { month: 'Jun', batches: 58, views: 3654, ratings: 4.9 }
  ],
  topPerformers: [
    { name: 'Lagos Lagoon Oysters', batches: 23, views: 1834, rating: 4.9 },
    { name: 'Delta Catfish Farm', batches: 18, views: 1456, rating: 4.8 },
    { name: 'Ogun River Tilapia', batches: 15, views: 1223, rating: 4.7 },
    { name: 'Cross River Shrimp', batches: 12, views: 987, rating: 4.6 }
  ]
}

const COLORS = ['#3b82f6', '#22d3ee', '#14b8a6', '#f59e0b', '#ef4444']

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('6months')
  const [viewType, setViewType] = useState('overview')

  const { data: analytics = mockAnalytics, isLoading } = useQuery({
    queryKey: ['analytics', timeRange, viewType],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return mockAnalytics
    },
  })

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
          )}
          <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
            {change}%
          </span>
          <span className="ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Insights into your supply chain performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Batches"
          value={analytics.overview.totalBatches.toLocaleString()}
          change={analytics.overview.growthRate}
          icon={Package}
          trend="up"
        />
        <StatCard
          title="Active Batches"
          value={analytics.overview.activeBatches.toLocaleString()}
          change={15.2}
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="Total Views"
          value={analytics.overview.totalViews.toLocaleString()}
          change={8.3}
          icon={Eye}
          trend="up"
        />
        <StatCard
          title="Average Rating"
          value={analytics.overview.averageRating.toFixed(1)}
          change={2.1}
          icon={Star}
          trend="up"
        />
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monthly Batch Creation */}
            <Card>
              <CardHeader>
                <CardTitle>Batch Creation Trends</CardTitle>
                <CardDescription>Monthly batch creation over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="batches" 
                      stroke="#3b82f6" 
                      fill="#3b82f6"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Views and Ratings */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Views and ratings over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="views" 
                      stroke="#22d3ee" 
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="ratings" 
                      stroke="#14b8a6" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Batches by Stage */}
            <Card>
              <CardHeader>
                <CardTitle>Batches by Stage</CardTitle>
                <CardDescription>Current distribution across supply chain stages</CardDescription>
              </CardHeader>
              <CardContent>
                {/* <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.batchesByStage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ stage, percentage }) => `${stage} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.batchesByStage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer> */}
              </CardContent>
            </Card>

            {/* Batches by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>Distribution by product type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.batchesByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Best performing products by engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{performer.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {performer.batches} batches • {performer.views} views
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{performer.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Supply chain activity by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">Lagos</div>
                    <div className="text-sm text-muted-foreground">142 batches</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">Delta</div>
                    <div className="text-sm text-muted-foreground">89 batches</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">Rivers</div>
                    <div className="text-sm text-muted-foreground">67 batches</div>
                  </div>
                </div>
                <div className="text-center text-muted-foreground">
                  Interactive map visualization would be implemented here
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}