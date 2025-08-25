
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  CreditCard,
  TrendingUp,
  Calendar,
  Download,
  Upload,
  Eye,
  Zap,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface UsageStats {
  currentPeriod: {
    uploads: number;
    storage: number;
    bandwidth: number;
    apiCalls: number;
  };
  limits: {
    uploads: number;
    storage: number;
    bandwidth: number;
    apiCalls: number;
  };
  billing: {
    plan: string;
    nextBillingDate: string;
    amount: number;
    currency: string;
  };
  recentActivity: Array<{
    id: string;
    type: 'upload' | 'download' | 'delete' | 'api_call';
    description: string;
    timestamp: string;
    metadata?: any;
  }>;
}

export default function ApiUsage() {
  const { data: usage, isLoading, error } = useQuery({
    queryKey: ["/api/v1/analytics/usage"],
    queryFn: () => apiRequest('GET', '/api/v1/analytics/usage'),
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <Upload className="w-4 h-4 text-blue-500" />;
      case 'download':
        return <Download className="w-4 h-4 text-green-500" />;
      case 'delete':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'api_call':
        return <Activity className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error Loading Usage Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Failed to load API usage statistics. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default data structure if no usage data
  const usageData: UsageStats = usage || {
    currentPeriod: {
      uploads: 0,
      storage: 0,
      bandwidth: 0,
      apiCalls: 0,
    },
    limits: {
      uploads: 1000,
      storage: 5 * 1024 * 1024 * 1024, // 5GB
      bandwidth: 10 * 1024 * 1024 * 1024, // 10GB
      apiCalls: 10000,
    },
    billing: {
      plan: 'Free',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 0,
      currency: 'USD',
    },
    recentActivity: [],
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              API Usage & Billing
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor your API usage and manage your billing
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {usageData.billing.plan} Plan
          </Badge>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uploads</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(usageData.currentPeriod.uploads)}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                of {formatNumber(usageData.limits.uploads)} limit
              </div>
              <Progress
                value={getUsagePercentage(usageData.currentPeriod.uploads, usageData.limits.uploads)}
                className="h-2"
              />
              <div className={`text-xs mt-1 ${getUsageColor(getUsagePercentage(usageData.currentPeriod.uploads, usageData.limits.uploads))}`}>
                {getUsagePercentage(usageData.currentPeriod.uploads, usageData.limits.uploads).toFixed(1)}% used
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBytes(usageData.currentPeriod.storage)}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                of {formatBytes(usageData.limits.storage)} limit
              </div>
              <Progress
                value={getUsagePercentage(usageData.currentPeriod.storage, usageData.limits.storage)}
                className="h-2"
              />
              <div className={`text-xs mt-1 ${getUsageColor(getUsagePercentage(usageData.currentPeriod.storage, usageData.limits.storage))}`}>
                {getUsagePercentage(usageData.currentPeriod.storage, usageData.limits.storage).toFixed(1)}% used
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bandwidth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBytes(usageData.currentPeriod.bandwidth)}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                of {formatBytes(usageData.limits.bandwidth)} limit
              </div>
              <Progress
                value={getUsagePercentage(usageData.currentPeriod.bandwidth, usageData.limits.bandwidth)}
                className="h-2"
              />
              <div className={`text-xs mt-1 ${getUsageColor(getUsagePercentage(usageData.currentPeriod.bandwidth, usageData.limits.bandwidth))}`}>
                {getUsagePercentage(usageData.currentPeriod.bandwidth, usageData.limits.bandwidth).toFixed(1)}% used
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Calls</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(usageData.currentPeriod.apiCalls)}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                of {formatNumber(usageData.limits.apiCalls)} limit
              </div>
              <Progress
                value={getUsagePercentage(usageData.currentPeriod.apiCalls, usageData.limits.apiCalls)}
                className="h-2"
              />
              <div className={`text-xs mt-1 ${getUsageColor(getUsagePercentage(usageData.currentPeriod.apiCalls, usageData.limits.apiCalls))}`}>
                {getUsagePercentage(usageData.currentPeriod.apiCalls, usageData.limits.apiCalls).toFixed(1)}% used
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Plan</span>
                <Badge>{usageData.billing.plan}</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Next Billing Date</span>
                <span className="text-sm font-medium">
                  {new Date(usageData.billing.nextBillingDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                <span className="text-sm font-medium">
                  ${usageData.billing.amount.toFixed(2)} {usageData.billing.currency}
                </span>
              </div>

              <div className="pt-4 border-t">
                <Button asChild className="w-full">
                  <Link href="/plans">
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usageData.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {usageData.recentActivity.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}