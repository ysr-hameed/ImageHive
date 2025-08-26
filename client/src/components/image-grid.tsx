import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, Trash2, Share2 } from 'lucide-react';

interface Image {
  id: string;
  filename: string;
  title: string;
  cdnUrl: string;
  size: number;
  mimeType: string;
  createdAt: string;
  views?: number;
  isPublic: boolean;
}

interface ImageGridProps {
  images: Image[];
  onDelete?: (id: string) => void;
  onView?: (image: Image) => void;
  isLoading?: boolean;
}

export function ImageGrid({ images, onDelete, onView, isLoading }: ImageGridProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-video bg-gray-200 dark:bg-slate-700 animate-pulse" />
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!images.length) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Eye className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No images found</h3>
        <p className="text-gray-600 dark:text-gray-400">Upload your first image to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image) => (
        <Card key={image.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-slate-800">
            <img
              src={image.cdnUrl}
              alt={image.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={() => onView?.(image)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={() => window.open(image.cdnUrl, '_blank')}
                >
                  <Download className="w-4 h-4" />
                </Button>
                {onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0"
                    onClick={() => onDelete(image.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="absolute top-2 left-2">
              {image.isPublic ? (
                <Badge variant="secondary" className="text-xs">
                  <Share2 className="w-3 h-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">Private</Badge>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate mb-1">
              {image.title || image.filename}
            </h3>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>{formatFileSize(image.size)}</span>
              <span>{image.views || 0} views</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ImageGrid;