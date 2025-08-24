import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  FileImage, 
  Settings,
  Eye,
  EyeOff,
  Tag,
  Palette,
  Maximize2,
  Zap,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface UploadFormProps {
  onUploadComplete?: () => void;
}

export default function EnhancedUploadForm({ onUploadComplete }: UploadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [uploadSettings, setUploadSettings] = useState({
    privacy: 'public',
    description: '',
    altText: '',
    tags: '',
    quality: 85,
    format: 'auto',
    width: '',
    height: '',
    watermark: false,
    generateThumbnails: true,
    optimizeForWeb: true,
    enableCDN: true,
    exifStripping: true,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/v1/images/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/analytics'] });
      setFiles([]);
      setUploadProgress(0);
      toast({
        title: 'Success!',
        description: `${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully`,
      });
      onUploadComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload images',
        variant: 'destructive',
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
      const maxSize = 50 * 1024 * 1024; // 50MB
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a supported image format`,
          variant: 'destructive',
        });
        return false;
      }
      
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds the 50MB limit`,
          variant: 'destructive',
        });
        return false;
      }
      
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.avif']
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select at least one image to upload',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        
        formData.append('image', file);
        formData.append('privacy', uploadSettings.privacy);
        formData.append('description', uploadSettings.description);
        formData.append('altText', uploadSettings.altText || file.name);
        formData.append('tags', uploadSettings.tags);
        formData.append('quality', uploadSettings.quality.toString());
        formData.append('format', uploadSettings.format);
        
        if (uploadSettings.width) formData.append('width', uploadSettings.width);
        if (uploadSettings.height) formData.append('height', uploadSettings.height);
        
        formData.append('watermark', uploadSettings.watermark.toString());
        formData.append('generateThumbnails', uploadSettings.generateThumbnails.toString());
        formData.append('optimizeForWeb', uploadSettings.optimizeForWeb.toString());
        formData.append('enableCDN', uploadSettings.enableCDN.toString());
        formData.append('exifStripping', uploadSettings.exifStripping.toString());

        await uploadMutation.mutateAsync(formData);
        setUploadProgress(((i + 1) / files.length) * 100);
      }
    } catch (error) {
      // Error handled in mutation
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* File Drop Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <FileImage className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  or click to browse files
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>JPEG, PNG, WebP, GIF, AVIF</span>
                <span>•</span>
                <span>Max 50MB per file</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Files ({files.length})</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiles([])}
              >
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <ImageIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Upload Settings
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="privacy">Privacy</Label>
              <Select value={uploadSettings.privacy} onValueChange={(value) => 
                setUploadSettings({ ...uploadSettings, privacy: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Public
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4" />
                      Private
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quality">Quality ({uploadSettings.quality}%)</Label>
              <Input
                type="range"
                min="10"
                max="100"
                step="5"
                value={uploadSettings.quality}
                onChange={(e) => setUploadSettings({ 
                  ...uploadSettings, 
                  quality: parseInt(e.target.value) 
                })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your images..."
              value={uploadSettings.description}
              onChange={(e) => setUploadSettings({ 
                ...uploadSettings, 
                description: e.target.value 
              })}
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="tags"
                placeholder="nature, landscape, photography"
                value={uploadSettings.tags}
                onChange={(e) => setUploadSettings({ 
                  ...uploadSettings, 
                  tags: e.target.value 
                })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white">Advanced Options</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="format">Output Format</Label>
                  <Select value={uploadSettings.format} onValueChange={(value) => 
                    setUploadSettings({ ...uploadSettings, format: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (Recommended)</SelectItem>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                      <SelectItem value="avif">AVIF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="altText">Alt Text</Label>
                  <Input
                    id="altText"
                    placeholder="Alternative text for accessibility"
                    value={uploadSettings.altText}
                    onChange={(e) => setUploadSettings({ 
                      ...uploadSettings, 
                      altText: e.target.value 
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width">Resize Width (px)</Label>
                  <div className="relative">
                    <Maximize2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="width"
                      type="number"
                      placeholder="Auto"
                      value={uploadSettings.width}
                      onChange={(e) => setUploadSettings({ 
                        ...uploadSettings, 
                        width: e.target.value 
                      })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="height">Resize Height (px)</Label>
                  <div className="relative">
                    <Maximize2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="height"
                      type="number"
                      placeholder="Auto"
                      value={uploadSettings.height}
                      onChange={(e) => setUploadSettings({ 
                        ...uploadSettings, 
                        height: e.target.value 
                      })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Optimize for Web</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Compress and optimize images for faster web loading
                    </p>
                  </div>
                  <Switch
                    checked={uploadSettings.optimizeForWeb}
                    onCheckedChange={(checked) => setUploadSettings({ 
                      ...uploadSettings, 
                      optimizeForWeb: checked 
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Generate Thumbnails</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Create multiple sizes for responsive images
                    </p>
                  </div>
                  <Switch
                    checked={uploadSettings.generateThumbnails}
                    onCheckedChange={(checked) => setUploadSettings({ 
                      ...uploadSettings, 
                      generateThumbnails: checked 
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable CDN</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Serve images from global CDN for faster access
                    </p>
                  </div>
                  <Switch
                    checked={uploadSettings.enableCDN}
                    onCheckedChange={(checked) => setUploadSettings({ 
                      ...uploadSettings, 
                      enableCDN: checked 
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Strip EXIF Data</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Remove metadata for privacy and smaller file sizes
                    </p>
                  </div>
                  <Switch
                    checked={uploadSettings.exifStripping}
                    onCheckedChange={(checked) => setUploadSettings({ 
                      ...uploadSettings, 
                      exifStripping: checked 
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Add Watermark</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Apply watermark to protect your images
                    </p>
                  </div>
                  <Switch
                    checked={uploadSettings.watermark}
                    onCheckedChange={(checked) => setUploadSettings({ 
                      ...uploadSettings, 
                      watermark: checked 
                    })}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Uploading...
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={files.length === 0 || uploading}
        className="w-full"
        size="lg"
      >
        {uploading ? (
          <>
            <Zap className="w-5 h-5 mr-2 animate-pulse" />
            Uploading {files.length} image{files.length > 1 ? 's' : ''}...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-2" />
            Upload {files.length} image{files.length > 1 ? 's' : ''}
          </>
        )}
      </Button>
    </div>
  );
}