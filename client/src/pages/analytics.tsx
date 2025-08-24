
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/v1/analytics'],
    retry: false,
  });

  const { data: images } = useQuery({
    queryKey: ['/api/v1/images'],
    retry: false,
  });

  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
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

  // Calculate real stats from data
  const totalImages = images?.images?.length || 0;
  const totalViews = images?.images?.reduce((sum: number, img: any) => sum + (img.views || 0), 0) || 0;
  const totalDownloads = images?.images?.reduce((sum: number, img: any) => sum + (img.downloads || 0), 0) || 0;
  const storageUsed = user?.storageUsed || 0;
  const storageLimit = user?.storageLimit || 1024 * 1024 * 1024;

  // Get top performing images
  const topImages = images?.images?.sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 5) || [];

  return (
    <SidebarContentLoader isLoading={isLoading}>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your image performance and usage statistics
              </p>
            </div>
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
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
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
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Images</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(totalImages)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Uploaded
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-amber-500" />
                </div>
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
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {image.title}
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
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Uploaded: <span className="font-normal">{image.title}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(image.createdAt).toLocaleDateString()}
                      </p>
                    </div>
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
