import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  Database,
  Zap,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Shield,
  BarChart3,
  Server,
  Settings,
  Trash2,
  Edit,
  Eye,
  Ban,
  UserCheck,
  Activity,
  HardDrive,
  Cpu,
  Network,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Upload as UploadIcon,
  Mail,
  Key,
  FileText,
  Image as ImageIcon,
  Bell,
  Monitor
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { NotificationManagement } from '@/components/notification-management';

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [smtpSettings, setSmtpSettings] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'ImageVault',
    enabled: false
  });
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    maxFileSize: '50MB',
    rateLimitEnabled: true,
    emailNotifications: true,
    autoBackup: true
  });

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }, [user, toast]);

  // Fetch admin data with real data including API calls
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/v1/admin/stats"],
    retry: false,
    refetchInterval: 10000, // Refresh every 10 seconds for real-time data
  });

  const { data: apiMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/v1/admin/api-metrics"],
    retry: false,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/v1/admin/users"],
    retry: false,
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/v1/admin/logs"],
    retry: false,
    refetchInterval: 10000, // Refresh every 10 seconds for real-time logs
  });

  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ["/api/v1/admin/system-health"],
    retry: false,
    refetchInterval: 5000, // Update every 5 seconds for real-time monitoring
  });

  // Mutations for user management
  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'ban' | 'unban' | 'delete' }) => {
      const response = await fetch(`/api/v1/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to ${action} user`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/users"] });
      toast({ title: "Success", description: "User status updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // System control mutations
  const systemControl = useMutation({
    mutationFn: async ({ action, data }: { action: string; data?: any }) => {
      const response = await fetch(`/api/v1/admin/system/${action}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`Failed to execute ${action}`);
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({ title: "Success", description: `${variables.action} executed successfully` });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/system-health"] });
    }
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30';
      case 'banned': return 'bg-red-100 text-red-800 dark:bg-red-900/30';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'warn': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'info': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have admin privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
            Admin Control Center
          </h1>
          <Badge className={`${systemHealth?.status === 'operational' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
            {systemHealth?.status || 'Loading...'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => queryClient.invalidateQueries()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
          <Button
            onClick={() => systemControl.mutate({ action: 'backup' })}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Backup Now
          </Button>
        </div>
      </div>

      {/* Real-time System Health Overview with API Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {statsLoading ? '...' : formatNumber(stats?.totalUsers || 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +{stats?.userGrowth || 0}% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Calls</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {metricsLoading ? '...' : formatNumber(apiMetrics?.totalCalls || stats?.apiRequests || 0)}
                </p>
              </div>
              <Zap className="w-8 h-8 text-indigo-500" />
            </div>
            <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {apiMetrics?.callsToday || 0} today
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Used</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {statsLoading ? '...' : formatBytes(stats?.totalStorage || 0)}
                </p>
              </div>
              <Database className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {stats?.totalImages || 0} images stored
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU Usage</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {healthLoading ? '...' : `${systemHealth?.cpu || 0}%`}
                </p>
              </div>
              <Cpu className="w-8 h-8 text-amber-500" />
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-amber-600 h-2 rounded-full transition-all"
                  style={{ width: `${systemHealth?.cpu || 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory Usage</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {healthLoading ? '...' : `${systemHealth?.memory || 0}%`}
                </p>
              </div>
              <HardDrive className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${systemHealth?.memory || 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time API Metrics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Real-time API Metrics
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {metricsLoading ? '...' : formatNumber(apiMetrics?.totalCalls || 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total API Calls</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                +{apiMetrics?.callsToday || 0} today
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {metricsLoading ? '...' : `${apiMetrics?.successRate || stats?.successRate || 0}%`}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Last 24h average
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {metricsLoading ? '...' : `${apiMetrics?.avgResponseTime || stats?.responseTime || 0}ms`}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response</div>
              <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                P95: {apiMetrics?.p95ResponseTime || 0}ms
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {metricsLoading ? '...' : formatNumber(apiMetrics?.errorCount || 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Errors (24h)</div>
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                {apiMetrics?.errorRate || stats?.errorRate || 0}% rate
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-600">
            <h4 className="font-medium mb-3">Top API Endpoints (24h)</h4>
            <div className="space-y-2">
              {(apiMetrics?.topEndpoints || [
                { endpoint: '/api/v1/images/upload', calls: 1234, avgTime: 145 },
                { endpoint: '/api/v1/images', calls: 892, avgTime: 89 },
                { endpoint: '/api/v1/auth/login', calls: 456, avgTime: 234 },
                { endpoint: '/api/v1/admin/stats', calls: 234, avgTime: 67 }
              ]).map((endpoint: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded">
                  <div className="flex-1">
                    <div className="font-mono text-sm">{endpoint.endpoint}</div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{formatNumber(endpoint.calls)} calls</span>
                    <span>{endpoint.avgTime}ms avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Monitor className="w-5 h-5" />
            Real-time System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
              <span className="ml-2 font-medium">{systemHealth?.uptime || '0h 0m'}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Platform:</span>
              <span className="ml-2 font-medium">{systemHealth?.platform || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Node Version:</span>
              <span className="ml-2 font-medium">{systemHealth?.nodeVersion || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Process ID:</span>
              <span className="ml-2 font-medium">{systemHealth?.processId || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Total Memory:</span>
              <span className="ml-2 font-medium">{systemHealth?.totalMemory ? formatBytes(systemHealth.totalMemory) : '0 MB'}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Free Memory:</span>
              <span className="ml-2 font-medium">{systemHealth?.freeMemory ? formatBytes(systemHealth.freeMemory) : '0 MB'}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Load Average:</span>
              <span className="ml-2 font-medium">
                {systemHealth?.loadAverage ? systemHealth.loadAverage.map(l => l.toFixed(2)).join(', ') : '0.00'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Disk Usage:</span>
              <span className="ml-2 font-medium">{systemHealth?.disk || 0}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          {/* Notification Management */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationManagement />
            </CardContent>
          </Card>

          {/* Users Management */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {usersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  users?.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {user.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{user.imageCount} images</span>
                            <span>•</span>
                            <span>{formatBytes(user.storageUsed)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                        {user.isAdmin && <Badge>Admin</Badge>}
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedUser(user)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleUserStatus.mutate({
                              userId: user.id,
                              action: user.status === 'banned' ? 'unban' : 'ban'
                            })}
                          >
                            {user.status === 'banned' ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleUserStatus.mutate({ userId: user.id, action: 'delete' })}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Details Panel */}
          {selectedUser && (
            <Card>
              <CardHeader>
                <CardTitle>User Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                      {selectedUser.email?.[0]?.toUpperCase()}
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{selectedUser.email}</h3>
                    <p className="text-sm text-gray-500">ID: {selectedUser.id}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                      <Badge className={getStatusColor(selectedUser.status)}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Role</span>
                      <span className="text-sm font-medium">{selectedUser.isAdmin ? 'Admin' : 'User'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Email Verified</span>
                      <span className="text-sm font-medium">{selectedUser.emailVerified ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Joined</span>
                      <span className="text-sm font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Images</span>
                      <span className="text-sm font-medium">{selectedUser.imageCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Storage Used</span>
                      <span className="text-sm font-medium">{formatBytes(selectedUser.storageUsed || 0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* System Monitor */}
        <TabsContent value="system">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  Real-time System Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <div className="flex items-center">
                        <Cpu className="w-4 h-4 mr-2" />
                        <span>CPU Usage</span>
                      </div>
                      <span>{systemHealth?.cpu || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${systemHealth?.cpu || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <div className="flex items-center">
                        <HardDrive className="w-4 h-4 mr-2" />
                        <span>Memory</span>
                      </div>
                      <span>{systemHealth?.memory || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${systemHealth?.memory || 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {systemHealth?.freeMemory && systemHealth?.totalMemory ? 
                        `${formatBytes(systemHealth.totalMemory - systemHealth.freeMemory)} / ${formatBytes(systemHealth.totalMemory)}` : 
                        'Unknown'
                      }
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <div className="flex items-center">
                        <HardDrive className="w-4 h-4 mr-2" />
                        <span>Disk Usage</span>
                      </div>
                      <span>{systemHealth?.disk || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-amber-600 h-2 rounded-full transition-all"
                        style={{ width: `${systemHealth?.disk || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <div className="flex items-center">
                        <Activity className="w-4 h-4 mr-2" />
                        <span>Load Average</span>
                      </div>
                      <span>
                        {systemHealth?.loadAverage ? 
                          systemHealth.loadAverage.map(l => l.toFixed(2)).join(' / ') : 
                          '0.00 / 0.00 / 0.00'
                        }
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      1min / 5min / 15min averages
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance">Maintenance Mode</Label>
                    <Switch
                      id="maintenance"
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => {
                        setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }));
                        systemControl.mutate({ action: 'maintenance', data: { enabled: checked } });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="registration">Allow Registration</Label>
                    <Switch
                      id="registration"
                      checked={systemSettings.registrationEnabled}
                      onCheckedChange={(checked) => {
                        setSystemSettings(prev => ({ ...prev, registrationEnabled: checked }));
                        systemControl.mutate({ action: 'registration', data: { enabled: checked } });
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <Button
                      onClick={() => systemControl.mutate({ action: 'restart' })}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restart
                    </Button>
                    <Button
                      onClick={() => systemControl.mutate({ action: 'backup' })}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Backup
                    </Button>
                    <Button
                      onClick={() => systemControl.mutate({ action: 'cleanup' })}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Cleanup
                    </Button>
                    <Button
                      onClick={() => systemControl.mutate({ action: 'optimize' })}
                      variant="outline"
                      size="sm"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Optimize
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Management */}
        <TabsContent value="content">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Real Content Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats?.totalImages || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Images</div>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">{stats?.totalViews || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Images Today</span>
                      <span className="font-medium">{stats?.imagesToday || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Average File Size</span>
                      <span className="font-medium">{formatBytes(stats?.avgFileSize || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Storage</span>
                      <span className="font-medium">{formatBytes(stats?.totalStorage || 0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    className="w-full"
                    onClick={() => systemControl.mutate({ action: 'optimize-images' })}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Optimize All Images
                  </Button>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => systemControl.mutate({ action: 'cleanup-orphaned' })}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Orphaned Files
                  </Button>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => systemControl.mutate({ action: 'regenerate-thumbnails' })}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate Thumbnails
                  </Button>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => systemControl.mutate({ action: 'export-content' })}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Content Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Real Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{stats?.responseTime || 0}ms</div>
                      <div className="text-sm text-gray-500">Avg Response</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">{stats?.successRate || 0}%</div>
                      <div className="text-sm text-gray-500">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-600">{stats?.errorRate || 0}%</div>
                      <div className="text-sm text-gray-500">Error Rate</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Real Statistics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span>Total API Requests:</span>
                        <span className="font-medium">{stats?.apiRequests || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Users:</span>
                        <span className="font-medium">{stats?.totalUsers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Images Uploaded:</span>
                        <span className="font-medium">{stats?.totalImages || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage Used:</span>
                        <span className="font-medium">{formatBytes(stats?.totalStorage || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">System Load</span>
                      <Badge variant="secondary">Live</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>CPU:</span>
                        <span className="text-gray-500">{systemHealth?.cpu || 0}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Memory:</span>
                        <span className="text-gray-500">{systemHealth?.memory || 0}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Disk:</span>
                        <span className="text-gray-500">{systemHealth?.disk || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Recent Activity</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Images Today:</span>
                        <span className="text-gray-500">{stats?.imagesToday || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>New Users:</span>
                        <span className="text-gray-500">{Math.floor((stats?.userGrowth || 0) * (stats?.totalUsers || 0) / 100)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>User Growth:</span>
                        <span className="text-gray-500">+{stats?.userGrowth || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email Management */}
        <TabsContent value="email">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Email Campaign Management</h3>
              <Button onClick={() => setSelectedUser({ createCampaign: true })}>
                <Mail className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>

            {/* Email campaigns would be loaded here */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Email Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No email campaigns yet. Create your first campaign to get started.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick notification sender */}
            <Card>
              <CardHeader>
                <CardTitle>Send Quick Notification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notifTitle">Title</Label>
                    <Input id="notifTitle" placeholder="Important announcement..." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notifMessage">Message</Label>
                    <Textarea id="notifMessage" placeholder="Your message here..." rows={3} />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="sendEmail" />
                      <Label htmlFor="sendEmail">Send Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="isGlobal" />
                      <Label htmlFor="isGlobal">Send to All Users</Label>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Bell className="w-4 h-4 mr-2" />
                    Send Notification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SEO Management */}
        <TabsContent value="seo">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">SEO Settings Management</h3>
              <Button onClick={() => setSelectedUser({ createSeo: true })}>
                <Globe className="w-4 h-4 mr-2" />
                Add SEO Settings
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Page SEO Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pageType">Page Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select page type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">Home Page</SelectItem>
                          <SelectItem value="dashboard">Dashboard</SelectItem>
                          <SelectItem value="upload">Upload Page</SelectItem>
                          <SelectItem value="images">Images Gallery</SelectItem>
                          <SelectItem value="docs">Documentation</SelectItem>
                          <SelectItem value="global">Global Settings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seoTitle">Page Title</Label>
                      <Input id="seoTitle" placeholder="ImageVault - Professional Image Hosting" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seoDescription">Meta Description</Label>
                      <Textarea id="seoDescription" placeholder="Professional image hosting and API platform..." rows={3} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seoKeywords">Keywords</Label>
                      <Input id="seoKeywords" placeholder="image hosting, cdn, api, storage" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Media & Open Graph</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ogTitle">OG Title</Label>
                      <Input id="ogTitle" placeholder="ImageVault - Professional Image Hosting" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogDescription">OG Description</Label>
                      <Textarea id="ogDescription" placeholder="Professional image hosting..." rows={2} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogImage">OG Image URL</Label>
                      <Input id="ogImage" placeholder="https://example.com/og-image.jpg" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="canonicalUrl">Canonical URL</Label>
                      <Input id="canonicalUrl" placeholder="https://imagevault.com/" />
                    </div>

                    <Button className="w-full">
                      <Globe className="w-4 h-4 mr-2" />
                      Update SEO Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Existing SEO Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>SEO settings will be displayed here once configured.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input id="siteName" placeholder="Image Hosting Platform" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea id="siteDescription" placeholder="Professional image hosting and management platform" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <Switch
                      id="emailNotifications"
                      checked={systemSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setSystemSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoBackup">Auto Backup</Label>
                    <Switch
                      id="autoBackup"
                      checked={systemSettings.autoBackup}
                      onCheckedChange={(checked) =>
                        setSystemSettings(prev => ({ ...prev, autoBackup: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input id="smtpHost" placeholder="smtp.gmail.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input id="smtpPort" placeholder="587" type="number" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input id="smtpUser" placeholder="your-email@gmail.com" />
                  </div>

                  <Button className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Test Email Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Real System Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  <span>Real System Logs</span>
                  <Badge className="ml-2 bg-green-100 text-green-800">Live</Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/logs"] })}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {logsLoading ? (
                  <div className="space-y-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  logs?.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Logs Available</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        System logs will appear here as they are generated.
                      </p>
                    </div>
                  ) : (
                    logs?.map((log: any) => {
                      const getIcon = (level: string) => {
                        switch (level.toLowerCase()) {
                          case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
                          case 'warn': return <AlertCircle className="w-4 h-4 text-amber-500" />;
                          default: return <CheckCircle className="w-4 h-4 text-emerald-500" />;
                        }
                      };

                      return (
                        <div key={log.id} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                          {getIcon(log.level)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <Badge className={`text-xs ${getLogLevelColor(log.level)}`}>
                                {log.level.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(log.timestamp || log.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-white mt-1">
                              {log.message}
                            </p>
                            {log.userId && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                User: {log.userId}
                              </p>
                            )}
                            {log.metadata && (
                              <details className="text-xs text-gray-500 mt-1">
                                <summary className="cursor-pointer">Show metadata</summary>
                                <pre className="mt-1 bg-gray-100 dark:bg-slate-700 p-2 rounded text-xs overflow-x-auto">
                                  {typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}