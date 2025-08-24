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
  const { data: analytics = {}, isLoading } = useQuery({
    queryKey: ['/api/v1/analytics/detailed'],
    retry: false,
  });

  const { data: topImages = [] } = useQuery({
    queryKey: ['/api/v1/analytics/top-images'],
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

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarContentLoader>
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
                    {formatNumber((analytics as any)?.totalViews || 0)}
                  </p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12% from last month
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
                    {formatNumber((analytics as any)?.totalDownloads || 0)}
                  </p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8% from last month
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
                    {formatBytes((analytics as any)?.storageUsed || 0)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    of {formatBytes((analytics as any)?.storageLimit || 0)}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber((analytics as any)?.apiRequests || 0)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    This month
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
                {(topImages as any[]).slice(0, 5).map((image: any, index: number) => (
                  <div key={image.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded overflow-hidden">
                      <img
                        src={image.cdnUrl}
                        alt={image.originalName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {image.originalName}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatNumber(image.viewCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {formatNumber(image.downloadCount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { source: 'Direct', visits: 2847, percentage: 45, color: 'bg-blue-500' },
                  { source: 'Search Engines', visits: 1923, percentage: 30, color: 'bg-emerald-500' },
                  { source: 'Social Media', visits: 962, percentage: 15, color: 'bg-purple-500' },
                  { source: 'Referrals', visits: 641, percentage: 10, color: 'bg-amber-500' },
                ].map((item) => (
                  <div key={item.source} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.source}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatNumber(item.visits)}
                        </span>
                        <Badge variant="secondary">{item.percentage}%</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Image uploaded', file: 'sunset-beach.jpg', time: '2 minutes ago', type: 'upload' },
                { action: 'API key created', file: 'Production Key', time: '1 hour ago', type: 'api' },
                { action: 'Image downloaded', file: 'mountain-view.png', time: '3 hours ago', type: 'download' },
                { action: 'Collection created', file: 'Nature Photos', time: '1 day ago', type: 'collection' },
                { action: 'Image shared', file: 'city-lights.jpg', time: '2 days ago', type: 'share' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/10">
                  <div className="flex-shrink-0">
                    {activity.type === 'upload' && <ImageIcon className="w-5 h-5 text-blue-600" />}
                    {activity.type === 'api' && <Activity className="w-5 h-5 text-emerald-600" />}
                    {activity.type === 'download' && <Download className="w-5 h-5 text-purple-600" />}
                    {activity.type === 'collection' && <Users className="w-5 h-5 text-amber-600" />}
                    {activity.type === 'share' && <Globe className="w-5 h-5 text-pink-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}: <span className="font-normal">{activity.file}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </SidebarContentLoader>
  );
}