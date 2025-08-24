import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarContentLoader } from "@/components/sidebar-content-loader";
import EnhancedUploadForm from "@/components/enhanced-upload-form";
import { Upload as UploadIcon, Image as ImageIcon, Zap, Shield } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Upload() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUsagePercentage = () => {
    if (!user?.storageUsed || !user?.storageLimit) return 0;
    return Math.min(100, (user.storageUsed / user.storageLimit) * 100);
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

  // Don't render anything if not authenticated to avoid flashing
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <SidebarContentLoader isLoading={isLoading}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UploadIcon className="w-8 h-8 text-brand-600 dark:text-brand-400" />
              <div>
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                  Upload Images
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Upload and manage your images with our powerful API
                </p>
              </div>
            </div>
            <Badge className={getPlanColor(user?.plan || 'free')} data-testid="user-plan">
              {(user?.plan || 'free').charAt(0).toUpperCase() + (user?.plan || 'free').slice(1)} Plan
            </Badge>
          </div>
        </div>

        {/* Storage Usage Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5" />
              <span>Storage Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Used</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formatBytes(user?.storageUsed || 0)} / {formatBytes(user?.storageLimit || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    getUsagePercentage() > 90 
                      ? 'bg-red-500' 
                      : getUsagePercentage() > 75 
                      ? 'bg-amber-500' 
                      : 'bg-brand-600'
                  }`}
                  style={{ width: `${getUsagePercentage()}%` }}
                  data-testid="storage-usage-bar"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0%</span>
                <span>{getUsagePercentage().toFixed(1)}% used</span>
                <span>100%</span>
              </div>
              
              {getUsagePercentage() > 90 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700 dark:text-red-400 font-medium">
                      Storage Almost Full
                    </span>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Consider upgrading your plan to continue uploading images.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-brand-600 dark:text-brand-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Fast Upload</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lightning fast uploads with global CDN delivery
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Secure Storage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enterprise-grade security with Backblaze B2
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <ImageIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Image Processing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                On-the-fly resizing and format conversion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>Upload New Images</CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedUploadForm />
          </CardContent>
        </Card>

        {/* API Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>API Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Upload via API</h4>
              <pre className="text-sm text-gray-600 dark:text-gray-400 overflow-x-auto">
{`curl -X POST https://api.imagevault.com/v1/images/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@photo.jpg" \\
  -F "privacy=public" \\
  -F "description=My awesome image"`}
              </pre>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Need an API key? Create one in your dashboard settings.
                </p>
                <Button variant="outline" size="sm" asChild data-testid="button-view-api-docs">
                  <a href="/#docs">View API Docs</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </SidebarContentLoader>
  );
}
