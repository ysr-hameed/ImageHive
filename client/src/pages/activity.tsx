import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Activity as ActivityIcon,
  Upload,
  Download,
  Eye,
  Key,
  Trash2,
  Edit,
  Share,
  Users,
  Calendar,
  Search,
  Filter,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth'; // Assuming useAuth is in this path
import { PageLoader } from "@/components/futuristic-loader";

export default function Activity() {
  const { user, isLoading: authLoading } = useAuth();

  // Fetch real activity data
  const { data: activitiesData = {}, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/v1/activity"],
    enabled: !!user,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');

  if (authLoading) {
    return <PageLoader text="Loading activity..." />;
  }

  if (!user) {
    window.location.href = "/auth/login";
    return null;
  }

  // Use real data or fallback to empty array
  const activities = (activitiesData as any)?.activities || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return Upload;
      case 'download': return Download;
      case 'view': return Eye;
      case 'share': return Share;
      case 'delete': return Trash2;
      case 'edit': return Edit;
      case 'api_key': return Key;
      case 'collection': return Users;
      default: return ActivityIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'upload': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'download': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'view': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'share': return 'text-pink-600 bg-pink-50 dark:bg-pink-900/20';
      case 'delete': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'edit': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
      case 'api_key': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
      case 'collection': return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      const days = Math.floor(diffInDays);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const filteredActivities = (activities as any[]).filter((activity: any) => {
    const matchesSearch = activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.resource?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || activity.type === filterType;
    return matchesSearch && matchesType;
  });

  const groupedActivities = filteredActivities.reduce((groups: any, activity: any) => {
    const date = new Date(activity.createdAt || activity.timestamp).toDateString(); // Use 'createdAt' or 'timestamp'
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  if (activitiesLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <ActivityIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Activity Log
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track all activities and changes in your account
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="upload">Uploads</SelectItem>
              <SelectItem value="download">Downloads</SelectItem>
              <SelectItem value="view">Views</SelectItem>
              <SelectItem value="share">Shares</SelectItem>
              <SelectItem value="edit">Edits</SelectItem>
              <SelectItem value="delete">Deletions</SelectItem>
              <SelectItem value="api_key">API Keys</SelectItem>
              <SelectItem value="collection">Collections</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Clock className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activity List */}
        {Object.keys(groupedActivities).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ActivityIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery || filterType !== 'all' ? 'No matching activities' : 'No activity yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || filterType !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start using ImageVault to see your activity here'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, dayActivities]: [string, any]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                  </div>

                  <div className="space-y-3">
                    {dayActivities.map((activity: any) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <Card key={activity.id} className="hover:shadow-sm transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                                <Icon className="w-4 h-4" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {activity.description}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {activity.type.replace('_', ' ')}
                                  </Badge>
                                </div>

                                {activity.resource && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Resource: {activity.resource}
                                  </p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(activity.createdAt || activity.timestamp)} {/* Use 'createdAt' or 'timestamp' */}
                                  </span>

                                  {activity.ipAddress && (
                                    <span>IP: {activity.ipAddress}</span>
                                  )}

                                  {activity.userAgent && (
                                    <span className="truncate max-w-xs">
                                      {activity.userAgent.split(' ')[0]}
                                    </span>
                                  )}
                                </div>

                                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <details className="cursor-pointer">
                                      <summary>View details</summary>
                                      <pre className="mt-1 p-2 bg-gray-50 dark:bg-slate-800 rounded text-xs overflow-x-auto">
                                        {JSON.stringify(activity.metadata, null, 2)}
                                      </pre>
                                    </details>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}

        {filteredActivities.length > 50 && (
          <div className="text-center mt-8">
            <Button variant="outline">
              Load More Activities
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}