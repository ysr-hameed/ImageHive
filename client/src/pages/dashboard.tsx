import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarContentLoader } from '@/components/sidebar-content-loader';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Download,
  Image as ImageIcon,
  Users,
  Globe,
  Activity,
  Upload,
  Key,
  Settings,
  Calendar,
  Clock,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { Link } from 'wouter';
import { getQueryFn } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/v1/analytics'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const { data: images, isLoading: imagesLoading } = useQuery({
    queryKey: ['/api/v1/images'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const { data: apiKeys, isLoading: apiKeysLoading } = useQuery({
    queryKey: ['/api/v1/api-keys'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const isLoading = analyticsLoading || imagesLoading || apiKeysLoading;

  // Calculate stats with fallback values
  const totalImages = images?.length || 0;
  const totalViews = analytics?.totalViews || 0;
  const totalDownloads = analytics?.totalDownloads || 0;
  const activeApiKeys = apiKeys?.filter((key: any) => key.isActive)?.length || 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const stats = [
    {
      title: "Total Images",
      value: formatNumber(totalImages),
      icon: ImageIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      description: "Images uploaded"
    },
    {
      title: "Total Views",
      value: formatNumber(totalViews),
      icon: Eye,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
      description: "Image views"
    },
    {
      title: "Downloads",
      value: formatNumber(totalDownloads),
      icon: Download,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      description: "Total downloads"
    },
    {
      title: "API Keys",
      value: activeApiKeys,
      icon: Key,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      description: "Active keys"
    }
  ];

  const quickActions = [
    {
      title: "Upload Images",
      description: "Upload new images to your collection",
      icon: Upload,
      href: "/upload",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "View Analytics",
      description: "See detailed usage statistics",
      icon: BarChart3,
      href: "/analytics",
      color: "bg-emerald-600 hover:bg-emerald-700"
    },
    {
      title: "Manage API Keys",
      description: "Create and manage API keys",
      icon: Key,
      href: "/api-keys",
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Account Settings",
      description: "Update your account preferences",
      icon: Settings,
      href: "/settings",
      color: "bg-orange-600 hover:bg-orange-700"
    }
  ];

  return (
    <SidebarContentLoader isLoading={isLoading}>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.firstName || user?.email || 'User'}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Here's an overview of your ImageVault account
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-3 py-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Plan: {user?.plan || 'Free'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {stat.description}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg text-white ${action.color} group-hover:scale-110 transition-transform`}>
                          <action.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {action.description}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {images?.slice(0, 5)?.map((image: any, index: number) => (
                    <div key={image.id || index} className="flex items-center space-x-3 py-2">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {image.title || image.filename || 'Untitled'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(image.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {image.views || 0} views
                      </Badge>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No images yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Upload your first image to get started
                      </p>
                      <Link href="/upload">
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
                {images && images.length > 5 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link href="/images">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Images
                        <ArrowUpRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Usage Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Storage Used</span>
                    <span className="text-sm font-medium">
                      {analytics?.storageUsed ? `${(analytics.storageUsed / 1024 / 1024).toFixed(1)} MB` : '0 MB'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">API Calls This Month</span>
                    <span className="text-sm font-medium">{analytics?.apiCallsThisMonth || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Bandwidth Used</span>
                    <span className="text-sm font-medium">
                      {analytics?.bandwidthUsed ? `${(analytics.bandwidthUsed / 1024 / 1024).toFixed(1)} MB` : '0 MB'}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link href="/analytics">
                      <Button variant="outline" size="sm" className="w-full">
                        View Detailed Analytics
                        <ArrowUpRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarContentLoader>
  );
}