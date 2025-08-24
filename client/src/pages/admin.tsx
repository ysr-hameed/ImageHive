import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/navigation";
import { 
  Users, 
  Database, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Shield,
  BarChart3
} from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();

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

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["/api/v1/admin/stats"],
    retry: false,
  });

  // Fetch system logs
  const { data: logs, isLoading: logsLoading, error: logsError } = useQuery({
    queryKey: ["/api/v1/admin/logs"],
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    const errors = [statsError, logsError].filter(Boolean);
    for (const error of errors) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    }
  }, [statsError, logsError, toast]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getLogLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warn': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'info': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getLogLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error': return AlertCircle;
      case 'warn': return AlertCircle;
      case 'info': return CheckCircle;
      default: return CheckCircle;
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
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" data-testid="admin-status">
              Live
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            System overview and management tools
          </p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="stat-total-users">
                    {statsLoading ? '...' : formatNumber(stats?.totalUsers || 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +12% this month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Storage</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="stat-total-storage">
                    {statsLoading ? '...' : formatBytes(stats?.totalStorage || 0)}
                  </p>
                </div>
                <Database className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +8% this week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Images</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid="stat-total-images">
                    {statsLoading ? '...' : formatNumber(stats?.totalImages || 0)}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-amber-500" />
              </div>
              <div className="mt-2 text-xs text-red-500">
                -3% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="stat-total-views">
                    {statsLoading ? '...' : formatNumber(stats?.totalViews || 0)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
              <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-3 h-3 inline mr-1" />
                Above average
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logs" data-testid="tab-logs">System Logs</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent System Logs</span>
                  <Badge variant="secondary" data-testid="log-count">
                    {logs?.length || 0} entries
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {logs?.length === 0 ? (
                      <div className="text-center py-8">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Logs Available</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          System logs will appear here as they are generated.
                        </p>
                      </div>
                    ) : (
                      logs?.map((log: any) => {
                        const Icon = getLogLevelIcon(log.level);
                        return (
                          <div 
                            key={log.id} 
                            className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg"
                            data-testid={`log-entry-${log.id}`}
                          >
                            <div className={`p-1 rounded-full ${getLogLevelColor(log.level)}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <Badge className={`text-xs ${getLogLevelColor(log.level)} border-0`}>
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
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">99.98%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">API Response Time</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">142ms avg</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Cache Hit Rate</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">89.2%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">0.02%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">CPU Usage</span>
                        <span className="text-gray-900 dark:text-white">23%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: '23%' }}
                          data-testid="cpu-progress"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Memory Usage</span>
                        <span className="text-gray-900 dark:text-white">456MB / 512MB</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full transition-all"
                          style={{ width: '89%' }}
                          data-testid="memory-progress"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Disk Usage</span>
                        <span className="text-gray-900 dark:text-white">847TB</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-amber-600 h-2 rounded-full transition-all"
                          style={{ width: '67%' }}
                          data-testid="disk-progress"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
