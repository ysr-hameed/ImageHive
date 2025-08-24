import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MoreHorizontal, 
  Eye, 
  Download, 
  Trash2, 
  ExternalLink,
  Copy,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Image {
  id: string;
  filename: string;
  originalName: string;
  cdnUrl: string;
  size: number;
  width?: number;
  height?: number;
  privacy: 'public' | 'private';
  description?: string;
  altText?: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
}

interface ImageGridProps {
  images: Image[];
}

export default function ImageGrid({ images }: ImageGridProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      await apiRequest("DELETE", `/api/v1/images/${imageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/images"] });
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (imageId: string) => {
    if (window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      deleteImageMutation.mutate(imageId);
    }
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
          <Eye className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Images</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Upload your first image to get started with ImageVault.
        </p>
        <Button asChild data-testid="button-upload-first">
          <a href="/upload">Upload Images</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection Actions */}
      {selectedImages.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedImages([])}
                data-testid="button-clear-selection"
              >
                Clear Selection
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                data-testid="button-delete-selected"
              >
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <Card 
            key={image.id} 
            className={`group cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedImages.includes(image.id) 
                ? 'ring-2 ring-blue-500 ring-offset-2' 
                : ''
            }`}
            data-testid={`image-card-${image.id}`}
          >
            <CardContent className="p-0">
              {/* Image Container */}
              <div className="relative aspect-square bg-gray-100 dark:bg-slate-800 rounded-t-lg overflow-hidden">
                <img
                  src={image.cdnUrl}
                  alt={image.altText || image.originalName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center space-x-1">
                      {/* Selection Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleImageSelection(image.id);
                        }}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          selectedImages.includes(image.id)
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-white/10 border-white/30 hover:bg-white/20'
                        }`}
                        data-testid={`checkbox-select-${image.id}`}
                      >
                        {selectedImages.includes(image.id) && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      
                      {/* More Actions */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg"
                        data-testid={`button-more-${image.id}`}
                      >
                        <MoreHorizontal className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bottom Actions */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg"
                          onClick={() => window.open(image.cdnUrl, '_blank')}
                          data-testid={`button-view-${image.id}`}
                        >
                          <ExternalLink className="w-4 h-4 text-white" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg"
                          onClick={() => copyToClipboard(image.cdnUrl, 'Image URL')}
                          data-testid={`button-copy-${image.id}`}
                        >
                          <Copy className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg"
                        onClick={() => handleDelete(image.id)}
                        data-testid={`button-delete-${image.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Privacy Badge */}
                <div className="absolute top-2 left-2">
                  <Badge 
                    className={`text-xs ${
                      image.privacy === 'public' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {image.privacy}
                  </Badge>
                </div>
              </div>
              
              {/* Image Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1 mr-2">
                    {image.originalName}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                    data-testid={`button-edit-${image.id}`}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>{formatBytes(image.size)}</span>
                    {image.width && image.height && (
                      <span>{image.width} × {image.height}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatNumber(image.viewCount)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Download className="w-3 h-3" />
                        <span>{formatNumber(image.downloadCount)}</span>
                      </span>
                    </div>
                    <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {image.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                    {image.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
