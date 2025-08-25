import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SidebarContentLoader } from "@/components/sidebar-content-loader";
import EnhancedImageGrid from "@/components/enhanced-image-grid";
import EmailVerificationBanner from "@/components/email-verification-banner";
import { NotificationBanner } from '@/components/notification-banner';
import { Upload, Image as ImageIcon, BarChart3, Key, Settings } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CreateApiKeyDialog } from "@/components/api-key-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Don't render dashboard if not authenticated
  if (!isAuthenticated && !authLoading) {
    window.location.href = "/auth/login";
    return null;
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Fetch user analytics
  const { data: analytics = {}, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ["/api/v1/analytics"],
    retry: (failureCount, error) => failureCount < 3 && !isUnauthorizedError(error as Error),
    enabled: !!user, // Only fetch when user is available
  });

  // Fetch user images
  const { data: imagesData = {}, isLoading: imagesLoading, error: imagesError } = useQuery({
    queryKey: ["/api/v1/images"],
    retry: (failureCount, error) => failureCount < 3 && !isUnauthorizedError(error as Error),
    enabled: !!user, // Only fetch when user is available
  });

  // Fetch user API keys
  const { data: apiKeysData = {}, isLoading: apiKeysLoading, error: apiKeysError } = useQuery({
    queryKey: ["/api/v1/api-keys"],
    retry: (failureCount, error) => failureCount < 3 && !isUnauthorizedError(error as Error),
    enabled: !!user, // Only fetch when user is available
  });

  const apiKeys = (apiKeysData as any)?.apiKeys || [];

  // Handle unauthorized errors
  useEffect(() => {
    const errors = [analyticsError, imagesError, apiKeysError].filter(Boolean);
    for (const error of errors) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Session expired",
          description: "Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 1000);
        return;
      }
    }
  }, [analyticsError, imagesError, apiKeysError, toast]);

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

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'starter': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'pro': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200';
      case 'enterprise': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const handleLogout = () => {
    // Implement logout logic here (e.g., clear tokens, redirect to login)
    toast({
      title: "Logged out successfully",
      description: "You have been logged out.",
    });
    // Assuming useAuth provides a logout function:
    // logout(); 
    window.location.href = "/auth/login";
  };

  return (
    <div className="w-full max-w-none min-h-screen space-y-4 p-4 md:p-8">
      {/* Notifications */}
      <NotificationBanner />

      {/* Email Verification Banner */}
      {user && !user.emailVerified && (
        <EmailVerificationBanner userEmail={user.email || ''} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.firstName || user?.email}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className={getPlanColor(user?.plan || 'free')} data-testid="user-plan">
            {(user?.plan || 'free').charAt(0).toUpperCase() + (user?.plan || 'free').slice(1)} Plan
          </Badge>
          <Button asChild data-testid="button-upload">
            <Link href="/upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload Images
            </Link>
          </Button>
          {/* Profile Icon with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Profile" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-700 dark:text-gray-300">{user?.firstName ? user.firstName.charAt(0) : user?.email?.charAt(0)}</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled className="cursor-default">
                <div>
                  <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Images</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-total-images">
                  {analyticsLoading ? '...' : formatNumber((analytics as any)?.totalImages || 0)}
                </p>
              </div>
              <ImageIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-storage-used">
                  {analyticsLoading ? '...' : formatBytes((analytics as any)?.storageUsed || 0)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              of {formatBytes(user?.storageLimit || 0)} limit
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-total-views">
                  {analyticsLoading ? '...' : formatNumber((analytics as any)?.totalViews || 0)}
                </p>
              </div>
              <ImageIcon className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Downloads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-total-downloads">
                  {analyticsLoading ? '...' : formatNumber((analytics as any)?.totalDownloads || 0)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="images" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="images" data-testid="tab-images">Images</TabsTrigger>
          <TabsTrigger value="api-keys" data-testid="tab-api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Images</span>
                <Button asChild size="sm" data-testid="button-upload-images">
                  <Link href="/upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload More
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {imagesLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <EnhancedImageGrid images={(imagesData as any)?.images || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>API Keys</span>
                <CreateApiKeyDialog>
                  <Button size="sm" data-testid="button-create-api-key">
                    <Key className="w-4 h-4 mr-2" />
                    Create New Key
                  </Button>
                </CreateApiKeyDialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {apiKeysLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(apiKeys) && apiKeys.length === 0 ? (
                    <div className="text-center py-8">
                      <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No API Keys</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Create your first API key to start using the ImageVault API.
                      </p>
                      <CreateApiKeyDialog>
                        <Button data-testid="button-create-first-api-key">
                          <Key className="w-4 h-4 mr-2" />
                          Create API Key
                        </Button>
                      </CreateApiKeyDialog>
                    </div>
                  ) : (
                    apiKeys?.map((apiKey: any) => (
                      <div key={apiKey.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg" data-testid={`api-key-${apiKey.id}`}>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{apiKey.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Created {new Date(apiKey.createdAt).toLocaleDateString()}
                            {apiKey.lastUsed && ` • Last used ${new Date(apiKey.lastUsed).toLocaleDateString()}`}
                          </p>
                          <code className="text-xs bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded font-mono">
                            {apiKey.keyPreview || `${apiKey.key?.substring(0, 20)}...`}
                          </code>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                            {apiKey.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Button variant="outline" size="sm" data-testid={`button-delete-api-key-${apiKey.id}`}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>
                <Settings className="w-5 h-5 inline mr-2" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="text-gray-900 dark:text-white" data-testid="user-email">
                      {user?.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plan
                    </label>
                    <Badge className={getPlanColor(user?.plan || 'free')} data-testid="user-plan-setting">
                      {(user?.plan || 'free').charAt(0).toUpperCase() + (user?.plan || 'free').slice(1)} Plan
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Usage Limits</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Storage</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatBytes((analytics as any)?.storageUsed || 0)} / {formatBytes(user?.storageLimit || 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (((analytics as any)?.storageUsed || 0) / (user?.storageLimit || 1)) * 100)}%`
                        }}
                        data-testid="storage-progress"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">API Requests (Monthly)</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatNumber(user?.apiRequestsUsed || 0)} / {formatNumber(user?.apiRequestsLimit || 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, ((user?.apiRequestsUsed || 0) / (user?.apiRequestsLimit || 1)) * 100)}%`
                        }}
                        data-testid="api-requests-progress"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}