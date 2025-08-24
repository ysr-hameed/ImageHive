import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreateApiKeyDialog } from '@/components/api-key-dialog';
import { SidebarContentLoader } from '@/components/sidebar-content-loader';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/navigation';
import { useLocation } from 'wouter';
import { 
  Key,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Activity,
  Plus,
  Search,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiRequest } from '@/lib/queryClient';

export default function ApiKeys() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
      setLocation("/auth/login");
    }
  }, [isAuthenticated, authLoading, toast, setLocation]);

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['/api/v1/api-keys'],
    retry: false,
    enabled: isAuthenticated,
  });

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state if not authenticated while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      await apiRequest('DELETE', `/api/v1/api-keys/${keyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/api-keys'] });
      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive',
      });
    },
  });

  const updateKeyMutation = useMutation({
    mutationFn: async ({ keyId, data }: { keyId: string; data: any }) => {
      await apiRequest('PATCH', `/api/v1/api-keys/${keyId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/api-keys'] });
      toast({
        title: 'Success',
        description: 'API key updated successfully',
      });
    },
  });

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => 
      prev.includes(keyId) 
        ? prev.filter(id => id !== keyId)
        : [...prev, keyId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const filteredKeys = Array.isArray(apiKeys) ? apiKeys.filter((key: any) =>
    key.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.keyPreview?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      <SidebarContentLoader isLoading={isLoading}>
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
          <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Key className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                API Keys
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your API keys for programmatic access
              </p>
            </div>
          </div>
          
          <CreateApiKeyDialog>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Key
            </Button>
          </CreateApiKeyDialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search API keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* API Keys List */}
        {filteredKeys.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No matching API keys' : 'No API keys found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Create your first API key to start using the ImageVault API'
                }
              </p>
              {!searchQuery && (
                <CreateApiKeyDialog>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create API Key
                  </Button>
                </CreateApiKeyDialog>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredKeys.map((apiKey: any) => (
              <Card key={apiKey.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {apiKey.name}
                        </h3>
                        <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                          {apiKey.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded font-mono">
                            {visibleKeys.includes(apiKey.id) 
                              ? apiKey.key 
                              : `${apiKey.key.substring(0, 20)}${'•'.repeat(20)}`
                            }
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {visibleKeys.includes(apiKey.id) ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(apiKey.key, 'API key')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          <span>{formatNumber(apiKey.requestCount)} requests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Created {formatDate(apiKey.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Last used {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}</span>
                        </div>
                      </div>
                      
                      {apiKey.permissions && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Permissions:</p>
                          <div className="flex flex-wrap gap-1">
                            {apiKey.permissions.map((permission: string) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => updateKeyMutation.mutate({
                            keyId: apiKey.id,
                            data: { isActive: !apiKey.isActive }
                          })}
                        >
                          {apiKey.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => copyToClipboard(apiKey.key, 'API key')}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Key
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
                              deleteKeyMutation.mutate(apiKey.id);
                            }
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Usage Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>API Usage Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Authentication</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Include your API key in the Authorization header:
                </p>
                <code className="text-xs bg-gray-100 dark:bg-slate-800 p-2 rounded block">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Rate Limits</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  API keys are subject to rate limits based on your plan. Monitor your usage
                  to avoid hitting limits.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
        </div>
      </SidebarContentLoader>
    </div>
  );
}