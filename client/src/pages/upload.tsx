
import React from 'react';
import { SidebarContentLoader } from '@/components/sidebar-content-loader';
import { EnhancedUploadForm } from '@/components/enhanced-upload-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Zap, Shield, Globe } from 'lucide-react';

export default function UploadPage() {
  const features = [
    {
      icon: Upload,
      title: "Drag & Drop",
      description: "Simply drag files or click to upload"
    },
    {
      icon: Zap,
      title: "Fast Processing",
      description: "Images processed in seconds"
    },
    {
      icon: Shield,
      title: "Secure Storage",
      description: "Your images are safely stored"
    },
    {
      icon: Globe,
      title: "Global CDN",
      description: "Fast delivery worldwide"
    }
  ];

  return (
    <SidebarContentLoader>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Upload Images
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Upload and manage your images with our powerful tools
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="p-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Your Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedUploadForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarContentLoader>
  );
}
