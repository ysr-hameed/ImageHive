
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Calendar,
  Clock,
  Key,
  Trash2,
  X
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { getQueryFn } from '@/lib/queryClient';

export default function Analytics() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const { data: user } = useQuery({
    queryKey: ['/api/v1/auth/user'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const { data: apiKeys, isLoading: apiKeysLoading } = useQuery({
    queryKey: ['/api/v1/api-keys'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ['/api/v1/usage'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete image');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/analytics'] });
      toast({
        title: 'Image deleted successfully.',
        description: new Date().toLocaleDateString(),
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting image',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Use real data from API responses
  const totalImages = images?.images?.length || 0;
  const totalViews = analytics?.totalViews || 0;
  const totalDownloads = analytics?.totalDownloads || 0;
  const totalBandwidth = analytics?.totalBandwidth || 0;
  const storageUsed = user?.storageUsed || 0;
  const storageLimit = user?.storageLimit || (100 * 1024 * 1024 * 1024); // 100GB default
  const newImages = analytics?.newImages || 0;
  const apiKeyCount = Array.isArray(apiKeys) ? apiKeys.length : 0;
  const monthlyRequests = usage?.current?.requests || 0;
  const apiCalls = analytics?.apiCalls || 0;
  const uniqueVisitors = analytics?.uniqueVisitors || 0;

  // Get top performing images from real data
  const topImages = images?.images?.sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 5) || [];

  const isLoading = analyticsLoading || imagesLoading || apiKeysLoading || usageLoading;

  return (
    <SidebarContentLoader isLoading={isLoading}>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Content Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track your image performance and usage statistics
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(totalViews)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mt-1">
                      <Eye className="w-3 h-3 mr-1" />
                      All time
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Downloads</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(totalDownloads)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mt-1">
                      <Download className="w-3 h-3 mr-1" />
                      All time
                    </p>
                  </div>
                  <Download className="w-8 h-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Used</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatBytes(storageUsed)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      of {formatBytes(storageLimit)}
                    </p>
                  </div>
                  <ImageIcon className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bandwidth Used</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatBytes(totalBandwidth)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mt-1">
                      <Globe className="w-3 h-3 mr-1" />
                      This month
                    </p>
                  </div>
                  <Globe className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Images</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totalImages)}</div>
                <p className="text-xs text-muted-foreground">
                  +{newImages} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(apiCalls)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(monthlyRequests)} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Keys</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiKeyCount}</div>
                <p className="text-xs text-muted-foreground">
                  Active keys
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Requests</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(monthlyRequests)}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Performing Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Top Performing Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topImages.length > 0 ? topImages.map((image: any, index: number) => (
                    <div key={image.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded overflow-hidden">
                        <img
                          src={`${image.url}?w=50&h=50&fit=cover`}
                          alt={image.title || 'Image'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {image.title || image.filename || 'Untitled'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatNumber(image.views || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {formatNumber(image.downloads || 0)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto h-8 w-8 p-0"
                        onClick={() => deleteImageMutation.mutate(image.id)}
                        disabled={deleteImageMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No images uploaded yet</p>
                      <p className="text-sm">Upload some images to see analytics</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Storage Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Storage Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Used Storage
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatBytes(storageUsed)} / {formatBytes(storageLimit)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((storageUsed / storageLimit) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {((storageUsed / storageLimit) * 100).toFixed(1)}% of storage used
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {images?.images?.slice(0, 5).map((image: any) => (
                  <div key={image.id} className="flex items-center gap-3 p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/10">
                    <div className="flex-shrink-0">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded overflow-hidden">
                      <img
                        src={`${image.url}?w=50&h=50&fit=cover`}
                        alt={image.title || 'Image'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Uploaded: <span className="font-normal">{image.title || image.filename || 'Untitled'}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(image.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto h-8 w-8 p-0"
                      onClick={() => deleteImageMutation.mutate(image.id)}
                      disabled={deleteImageMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarContentLoader>
  );
}
