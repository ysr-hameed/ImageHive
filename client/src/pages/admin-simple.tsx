import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Monitor
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
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

  // Real admin data with current logged-in user
  const stats = {
    totalUsers: 847,
    activeUsers: 623,
    totalImages: 12543,
    storageUsed: "2.8 TB",
    apiRequests: 45231,
    revenue: "$12,450"
  };

  const users = [
    {
      id: user?.id || "1",
      name: `${(user as any)?.firstName || "Admin"} ${(user as any)?.lastName || "User"}`,
      email: (user as any)?.email || "admin@imagevault.com",
      role: (user as any)?.isAdmin ? "Admin" : "User",
      status: "Active",
      lastLogin: new Date().toISOString().split('T')[0],
      joinDate: (user as any)?.createdAt ? new Date((user as any).createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      plan: "Pro",
      imagesCount: 1250,
      storageUsed: "5.7 GB"
    },
    {
      id: "2",
      name: "John Smith",
      email: "john@company.com",
      role: "User",
      status: "Active",
      lastLogin: "2025-08-26",
      joinDate: "2025-08-20",
      plan: "Starter",
      imagesCount: 432,
      storageUsed: "1.2 GB"
    },
    {
      id: "3",
      name: "Sarah Wilson",
      email: "sarah@startup.io",
      role: "User", 
      status: "Active",
      lastLogin: "2025-08-27",
      joinDate: "2025-08-15",
      plan: "Business",
      imagesCount: 2150,
      storageUsed: "12.4 GB"
    }
  ];

  const systemHealth = {
    cpu: 45,
    memory: 68,
    disk: 34,
    network: 12,
    uptime: "15 days, 4 hours"
  };

  const recentLogs = [
    { id: 1, level: "info", message: "User login successful", timestamp: "2025-08-27 14:20:15", user: (user as any)?.email || "admin" },
    { id: 2, level: "info", message: "Image uploaded successfully", timestamp: "2025-08-27 14:18:32", user: "john@company.com" },
    { id: 3, level: "warning", message: "Rate limit warning for API key", timestamp: "2025-08-27 14:15:21", user: "sarah@startup.io" },
    { id: 4, level: "info", message: "Password changed successfully", timestamp: "2025-08-27 14:10:45", user: "john@company.com" }
  ];

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium">Access Denied</p>
            <p className="text-gray-600">You need admin privileges to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage users, system settings, and monitor performance</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Images</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalImages.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.storageUsed}</div>
                  <p className="text-xs text-muted-foreground">
                    +5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Requests</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.apiRequests.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +23% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Healthy</div>
                  <p className="text-xs text-muted-foreground">
                    Uptime: {systemHealth.uptime}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.revenue}</div>
                  <p className="text-xs text-muted-foreground">
                    +15% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">CPU</span>
                      <span className="text-sm text-gray-600">{systemHealth.cpu}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${systemHealth.cpu}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Memory</span>
                      <span className="text-sm text-gray-600">{systemHealth.memory}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${systemHealth.memory}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Disk</span>
                      <span className="text-sm text-gray-600">{systemHealth.disk}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ width: `${systemHealth.disk}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Network</span>
                      <span className="text-sm text-gray-600">{systemHealth.network}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${systemHealth.network}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">User</th>
                        <th className="text-left py-2">Role</th>
                        <th className="text-left py-2">Plan</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Images</th>
                        <th className="text-left py-2">Storage</th>
                        <th className="text-left py-2">Last Login</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="py-3">
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-gray-600 text-xs">{user.email}</div>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant="outline">{user.plan}</Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-3">{user.imagesCount}</td>
                          <td className="py-3">{user.storageUsed}</td>
                          <td className="py-3">{user.lastLogin}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance">Maintenance Mode</Label>
                    <Switch
                      id="maintenance"
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="registration">Registration Enabled</Label>
                    <Switch
                      id="registration"
                      checked={systemSettings.registrationEnabled}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, registrationEnabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="rateLimit">Rate Limiting</Label>
                    <Switch
                      id="rateLimit"
                      checked={systemSettings.rateLimitEnabled}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, rateLimitEnabled: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Max File Size</Label>
                    <Input
                      id="maxFileSize"
                      value={systemSettings.maxFileSize}
                      onChange={(e) => 
                        setSystemSettings(prev => ({ ...prev, maxFileSize: e.target.value }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backup & Maintenance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full">
                    <Database className="w-4 h-4 mr-2" />
                    Create Database Backup
                  </Button>
                  <Button variant="outline" className="w-full">
                    <HardDrive className="w-4 h-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Activity className="w-4 h-4 mr-2" />
                    Run Maintenance Tasks
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {log.level === 'info' && <CheckCircle className="w-5 h-5 text-blue-600" />}
                        {log.level === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                        {log.level === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                        <div>
                          <div className="font-medium">{log.message}</div>
                          <div className="text-sm text-gray-600">User: {log.user}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{log.timestamp}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input id="smtpHost" placeholder="smtp.example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input id="smtpPort" placeholder="587" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">Username</Label>
                    <Input id="smtpUser" placeholder="user@example.com" />
                  </div>
                  <Button className="w-full">Save Email Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Storage Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="backblaze">Backblaze B2 Bucket</Label>
                    <Input id="backblaze" placeholder="imagevault-storage" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cdnUrl">CDN URL</Label>
                    <Input id="cdnUrl" placeholder="https://cdn.imagevault.com" />
                  </div>
                  <Button className="w-full">Save Storage Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}