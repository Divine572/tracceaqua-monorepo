"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Package,
  Eye,
  Star,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useBatches } from "@/hooks/use-batches";

// Mock dashboard data
const mockDashboardData = {
  stats: {
    totalBatches: 23,
    activeBatches: 8,
    totalViews: 1247,
    averageRating: 4.6,
  },
  recentBatches: [
    {
      id: "1",
      batchNumber: "TAQ-2024-001",
      species: "Crassostrea gigas",
      currentStage: "processing",
      lastUpdate: new Date(Date.now() - 1000 * 60 * 30),
      views: 45,
      rating: 4.8,
    },
    {
      id: "2",
      batchNumber: "TAQ-2024-002",
      species: "Oreochromis niloticus",
      currentStage: "transport",
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 2),
      views: 32,
      rating: 4.5,
    },
  ],
  recentActivity: [
    {
      id: "1",
      action: "Batch TAQ-2024-001 moved to Processing stage",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      type: "batch_update",
    },
    {
      id: "2",
      action: "New 5-star review received for TAQ-2024-002",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      type: "review",
    },
    {
      id: "3",
      action: "Conservation record CR-2024-005 completed",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      type: "conservation",
    },
  ],
  quickActions: {
    consumer: [
      { label: "Scan QR Code", href: "/scan", icon: Package },
      { label: "View Products", href: "/dashboard/supply-chain", icon: Eye },
    ],
    professional: [
      {
        label: "Create Batch",
        href: "/dashboard/supply-chain/batches/create-batch",
        icon: Package,
      },
      {
        label: "New Sampling",
        href: "/dashboard/conservation/new-record",
        icon: Plus,
      },
      {
        label: "View Analytics",
        href: "/dashboard/analytics",
        icon: TrendingUp,
      },
    ],
    admin: [
      {
        label: "User Management",
        href: "/dashboard/admin",
        icon: Package,
      },
      {
        label: "Role Requests",
        href: "/dashboard/admin/role-requests",
        icon: CheckCircle,
      },
      {
        label: "System Analytics",
        href: "/dashboard/analytics",
        icon: TrendingUp,
      },
    ],
  },
};

export function DashboardHome() {
  const { user } = useAuth();
  const {batches,} = useBatches({searchTerm: "", stageFilter: "", statusFilter: ""})

  console.log(batches)

  const { data: dashboardData = mockDashboardData, isLoading } = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return mockDashboardData;
    },
  });

  const getQuickActions = () => {
    if (user?.role === UserRole.ADMIN) return dashboardData.quickActions.admin;
    if (user?.role === UserRole.CONSUMER)
      return dashboardData.quickActions.consumer;
    return dashboardData.quickActions.professional;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "batch_update":
        return Package;
      case "review":
        return Star;
      case "conservation":
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "batch_update":
        return "text-blue-600";
      case "review":
        return "text-yellow-600";
      case "conservation":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-muted-foreground">
            {user?.role === UserRole.CONSUMER
              ? "Discover and trace seafood products with confidence."
              : "Here's what's happening with your supply chain operations."}
          </p>
        </div>
        <Link href="/dashboard/profile">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.image || user?.profile?.profileImage} />
            <AvatarFallback className="tracce-gradient text-white">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for your role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getQuickActions().map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.href}>
                  <Button
                    variant="outline"
                    className="w-full h-auto p-4 justify-start"
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span>{action.label}</span>
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats and Content */}
      {user?.role !== UserRole.CONSUMER && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Total Batches</span>
                  </div>
                  <span className="font-medium">
                    {dashboardData.stats.totalBatches}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Active Batches</span>
                  </div>
                  <span className="font-medium">
                    {dashboardData.stats.activeBatches}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Total Views</span>
                  </div>
                  <span className="font-medium">
                    {dashboardData.stats.totalViews}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Avg. Rating</span>
                  </div>
                  <span className="font-medium">
                    {dashboardData.stats.averageRating}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity and Batches */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Batches */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Batches</CardTitle>
                  <CardDescription>
                    Your latest supply chain batches
                  </CardDescription>
                </div>
                <Link href="/dashboard/supply-chain">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentBatches.map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{batch.batchNumber}</h4>
                          <p className="text-sm text-muted-foreground">
                            {batch.species}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1 capitalize">
                          {batch.currentStage}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(batch.lastUpdate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates across your operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className={`p-1 rounded-full ${getActivityColor(activity.type)}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Consumer Specific Content */}
      {user?.role === UserRole.CONSUMER && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="tracce-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Scan Products
              </CardTitle>
              <CardDescription>
                Scan QR codes to trace the complete journey of your seafood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/scan">
                <Button className="w-full">
                  Start Scanning
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="tracce-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Rate Products
              </CardTitle>
              <CardDescription>
                Share your experience and help improve quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/profile/role-application">
                <Button variant="outline" className="w-full">
                  Become a Professional User
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
