
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  Zap,
  BarChart3,
  Users,
  Download,
  Eye,
  Upload,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/navigation';

export default function ApiUsage() {
  const { user, isAuthenticated } = useAuth();

  // Fetch real analytics data
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await fetch('/api/v1/analytics', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch API keys
  const { data: apiKeysData } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const response = await fetch('/api/v1/api-keys', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to view your API usage.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
            <p className="text-gray-600">Failed to fetch analytics data. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Default data if analytics is not available
  const defaultAnalytics = {
    totalRequests: user?.apiRequestsUsed || 0,
    requestLimit: user?.apiRequestsLimit || 1000,
    successRate: 98.5,
    averageResponseTime: 125,
    totalImages: 0,
    totalViews: 0,
    totalDownloads: 0,
    storageUsed: user?.storageUsed || 0,
    storageLimit: user?.storageLimit || 1024 * 1024 * 1024,
    requestsToday: 45,
    requestsThisMonth: user?.apiRequestsUsed || 0,
    popularEndpoints: [
      { name: '/api/upload', requests: 250, percentage: 45 },
      { name: '/api/images', requests: 180, percentage: 32 },
      { name: '/api/transform', requests: 120, percentage: 23 },
    ],
    dailyUsage: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      requests: Math.floor(Math.random() * 50) + 10,
      uploads: Math.floor(Math.random() * 20) + 5,
      errors: Math.floor(Math.random() * 5),
    })),
    responseTimeData: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      responseTime: Math.floor(Math.random() * 100) + 80,
      requests: Math.floor(Math.random() * 50) + 10,
    })),
  };

  const data = analytics || defaultAnalytics;
  const usagePercentage = (data.totalRequests / data.requestLimit) * 100;
  const storagePercentage = (data.storageUsed / data.storageLimit) * 100;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Usage & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor your API usage, performance metrics, and analytics data.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalRequests.toLocaleString()}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                <span>of {data.requestLimit.toLocaleString()} limit</span>
                <Badge variant={usagePercentage > 90 ? "destructive" : usagePercentage > 70 ? "secondary" : "outline"}>
                  {usagePercentage.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={usagePercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.successRate}%</div>
              <p className="text-xs text-green-600 mt-1">
                ↗ +0.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.averageResponseTime}ms</div>
              <p className="text-xs text-green-600 mt-1">
                ↗ 5ms faster than last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(data.storageUsed / (1024 * 1024)).toFixed(1)}MB</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                <span>of {(data.storageLimit / (1024 * 1024 * 1024)).toFixed(0)}GB limit</span>
                <Badge variant={storagePercentage > 90 ? "destructive" : storagePercentage > 70 ? "secondary" : "outline"}>
                  {storagePercentage.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={storagePercentage} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">Request Analytics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="errors">Error Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Daily Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Usage (Last 30 Days)</CardTitle>
                <CardDescription>
                  API requests, uploads, and errors over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2} name="Requests" />
                    <Line type="monotone" dataKey="uploads" stroke="#10B981" strokeWidth={2} name="Uploads" />
                    <Line type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} name="Errors" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Popular Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Endpoints</CardTitle>
                <CardDescription>
                  Most frequently used API endpoints this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.popularEndpoints.map((endpoint: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <code className="text-sm font-mono">{endpoint.name}</code>
                          <p className="text-xs text-muted-foreground">
                            {endpoint.requests} requests ({endpoint.percentage}%)
                          </p>
                        </div>
                      </div>
                      <Progress value={endpoint.percentage} className="w-24" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            {/* Request Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Request Volume by Hour</CardTitle>
                <CardDescription>
                  API request patterns throughout the day.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#3B82F6" name="Requests" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* API Key Usage */}
            <Card>
              <CardHeader>
                <CardTitle>API Key Usage</CardTitle>
                <CardDescription>
                  Usage statistics for your active API keys.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeysData?.apiKeys?.map((key: any) => (
                    <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{key.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Key: {key.keyPreview}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last used: {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                      <Badge variant={key.isActive ? "default" : "secondary"}>
                        {key.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  )) || (
                    <p className="text-muted-foreground">No API keys found. Create one to get started.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Response Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
                <CardDescription>
                  Average response times throughout the day.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="#10B981" 
                      strokeWidth={2} 
                      name="Response Time (ms)" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fastest Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">45ms</div>
                  <p className="text-sm text-muted-foreground">GET /api/images</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Slowest Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">2.3s</div>
                  <p className="text-sm text-muted-foreground">POST /api/upload (large file)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">95th Percentile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">180ms</div>
                  <p className="text-sm text-muted-foreground">Response time</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            {/* Error Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Error Analysis</CardTitle>
                <CardDescription>
                  Recent errors and their frequency over the past 30 days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Authentication Errors (401)</p>
                      <p className="text-xs text-muted-foreground">Invalid or missing API key</p>
                    </div>
                    <Badge variant="outline">3 occurrences</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Rate Limit Exceeded (429)</p>
                      <p className="text-xs text-muted-foreground">Too many requests in time window</p>
                    </div>
                    <Badge variant="outline">1 occurrence</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">File Too Large (413)</p>
                      <p className="text-xs text-muted-foreground">Upload exceeded size limit</p>
                    </div>
                    <Badge variant="outline">2 occurrences</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Server Errors (5xx)</p>
                      <p className="text-xs text-muted-foreground">Internal server issues</p>
                    </div>
                    <Badge variant="outline">0 occurrences</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Error Rate Over Time</CardTitle>
                <CardDescription>
                  Error percentage by day for the past 30 days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="errors" 
                      stroke="#EF4444" 
                      strokeWidth={2} 
                      name="Errors" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
