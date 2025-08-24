
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
import Navigation from "@/components/navigation";
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
  Memory,
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
  Image as ImageIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
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

  // Fetch admin data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/v1/admin/stats"],
    retry: false,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/v1/admin/users"],
    retry: false,
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/v1/admin/logs"],
    retry: false,
  });

  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ["/api/v1/admin/system-health"],
    retry: false,
    refetchInterval: 30000, // Update every 30 seconds
  });

  // Mutations for user management
  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'ban' | 'unban' | 'delete' }) => {
      const response = await fetch(`/api/v1/admin/users/${userId}/${action}`, {
        method: 'POST',
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
        headers: { 'Content-Type': 'application/json' },
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-8 h-8 text-brand-600 dark:text-brand-400" />
              <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                Admin Control Center
              </h1>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                {systemHealth?.status || 'Loading...'}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => systemControl.mutate({ action: 'restart' })}
                variant="outline" 
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Restart System
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
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Used</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {statsLoading ? '...' : formatBytes(stats?.totalStorage || 0)}
                  </p>
                </div>
                <Database className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                {((stats?.totalStorage || 0) / (1024 ** 4) * 100).toFixed(1)}% of 1TB
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Requests/hr</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {statsLoading ? '...' : formatNumber(stats?.apiRequests || 0)}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-amber-500" />
              </div>
              <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                <Activity className="w-3 h-3 inline mr-1" />
                Within limits
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Uptime</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {healthLoading ? '...' : (systemHealth?.uptime || '99.98%')}
                  </p>
                </div>
                <Server className="w-8 h-8 text-purple-500" />
              </div>
              <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-3 h-3 inline mr-1" />
                Excellent
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>User Management</span>
                      <Badge variant="secondary">
                        {users?.length || 0} total users
                      </Badge>
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
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Joined {new Date(user.createdAt).toLocaleDateString()}
                                </p>
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
              </div>
              
              {/* User Details Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>User Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedUser ? (
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
                          <span className="text-sm text-gray-600 dark:text-gray-400">Joined</span>
                          <span className="text-sm font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Images</span>
                          <span className="text-sm font-medium">{selectedUser.imageCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Storage</span>
                          <span className="text-sm font-medium">{formatBytes(selectedUser.storageUsed || 0)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Select a user to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Monitor */}
          <TabsContent value="system">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="w-5 h-5 mr-2" />
                    System Resources
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
                          <Memory className="w-4 h-4 mr-2" />
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
                          <Network className="w-4 h-4 mr-2" />
                          <span>Network I/O</span>
                        </div>
                        <span>{formatBytes(systemHealth?.networkIO || 0)}/s</span>
                      </div>
                      <div className="flex space-x-2 text-xs text-gray-500">
                        <span>↓ {formatBytes(systemHealth?.networkIn || 0)}/s</span>
                        <span>↑ {formatBytes(systemHealth?.networkOut || 0)}/s</span>
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
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="rateLimit">Rate Limiting</Label>
                      <Switch 
                        id="rateLimit"
                        checked={systemSettings.rateLimitEnabled}
                        onCheckedChange={(checked) => {
                          setSystemSettings(prev => ({ ...prev, rateLimitEnabled: checked }));
                          systemControl.mutate({ action: 'rateLimit', data: { enabled: checked } });
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxFileSize">Max File Size</Label>
                      <Select value={systemSettings.maxFileSize} onValueChange={(value) => 
                        setSystemSettings(prev => ({ ...prev, maxFileSize: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10MB">10MB</SelectItem>
                          <SelectItem value="25MB">25MB</SelectItem>
                          <SelectItem value="50MB">50MB</SelectItem>
                          <SelectItem value="100MB">100MB</SelectItem>
                        </SelectContent>
                      </Select>
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
                    Content Overview
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
                        <span className="text-sm text-gray-600 dark:text-gray-400">Popular Format</span>
                        <span className="font-medium">{stats?.popularFormat || 'JPEG'}</span>
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
                    Performance Analytics
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
                    
                    <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Analytics charts would be displayed here</p>
                        <p className="text-sm text-gray-400">Integration with charting library needed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Most Active Users</span>
                        <Badge variant="secondary">Top 5</Badge>
                      </div>
                      <div className="space-y-2">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>user{i}@example.com</span>
                            <span className="text-gray-500">{100 - i * 15} uploads</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Popular File Types</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>JPEG</span>
                          <span className="text-gray-500">45%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>PNG</span>
                          <span className="text-gray-500">35%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>WebP</span>
                          <span className="text-gray-500">20%</span>
                        </div>
                      </div>
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
                      <Input id="siteName" placeholder="Enter site name" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Textarea id="siteDescription" placeholder="Enter site description" />
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

          {/* System Logs */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    <span>System Logs</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Logs
                    </Button>
                    <Button size="sm" variant="outline">
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
                                <Badge className="text-xs">
                                  {log.level.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-900 dark:text-white mt-1 font-mono">
                                {log.message}
                              </p>
                              {log.userId && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  User: {log.userId}
                                </p>
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
    </div>
  );
}
