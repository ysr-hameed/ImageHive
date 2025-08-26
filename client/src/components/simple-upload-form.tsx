import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Upload, X, ImageIcon, Settings, Sliders, Image as ImageLucide, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface UploadFile extends File {
  id: string;
  preview?: string;
  status?: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export function SimpleUploadForm() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Enhanced form state with CDN/hosting parameters
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    altText: '',
    tags: '',
    folder: '',
  });

  // CDN and optimization parameters
  const [cdnOptions, setCdnOptions] = useState({
    quality: 85,
    format: 'auto', // auto, webp, avif, jpeg, png
    resize: false,
    width: '',
    height: '',
    fit: 'cover', // cover, contain, fill, inside, outside
    position: 'center', // center, top, bottom, left, right
    blur: 0,
    sharpen: false,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    progressive: true,
    stripMetadata: true,
    cacheTtl: 31536000, // 1 year in seconds
  });

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to upload images.
          </p>
        </CardContent>
      </Card>
    );
  }

  const uploadMutation = useMutation({
    mutationFn: async (file: UploadFile) => {
      const formData = new FormData();
      formData.append('image', file);
      
      // Metadata
      if (metadata.title) formData.append('title', metadata.title);
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.altText) formData.append('altText', metadata.altText);
      if (metadata.tags) formData.append('tags', metadata.tags);
      if (metadata.folder) formData.append('folder', metadata.folder);
      formData.append('isPublic', 'true');

      // CDN optimization parameters
      if (cdnOptions.quality !== 85) formData.append('quality', cdnOptions.quality.toString());
      if (cdnOptions.format !== 'auto') formData.append('format', cdnOptions.format);
      if (cdnOptions.resize && cdnOptions.width) formData.append('width', cdnOptions.width);
      if (cdnOptions.resize && cdnOptions.height) formData.append('height', cdnOptions.height);
      if (cdnOptions.fit !== 'cover') formData.append('fit', cdnOptions.fit);
      if (cdnOptions.position !== 'center') formData.append('position', cdnOptions.position);
      if (cdnOptions.blur > 0) formData.append('blur', cdnOptions.blur.toString());
      if (cdnOptions.sharpen) formData.append('sharpen', 'true');
      if (cdnOptions.brightness !== 100) formData.append('brightness', (cdnOptions.brightness / 100).toString());
      if (cdnOptions.contrast !== 100) formData.append('contrast', (cdnOptions.contrast / 100).toString());
      if (cdnOptions.saturation !== 100) formData.append('saturation', (cdnOptions.saturation / 100).toString());
      if (!cdnOptions.progressive) formData.append('progressive', 'false');
      if (!cdnOptions.stripMetadata) formData.append('stripMetadata', 'false');
      if (cdnOptions.cacheTtl !== 31536000) formData.append('cacheTtl', cdnOptions.cacheTtl.toString());

      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/images/upload', {
        method: 'POST',
        body: formData,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data, file) => {
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'completed' } : f
      ));
      queryClient.invalidateQueries({ queryKey: ['/api/v1/images'] });
      toast({
        title: "Upload successful",
        description: "Your image has been uploaded successfully.",
      });
    },
    onError: (error: any, file) => {
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'error', error: error.message } : f
      ));
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => {
      const uploadFile: UploadFile = Object.assign(file, {
        id: Math.random().toString(36).substr(2, 9),
        preview: URL.createObjectURL(file),
        status: 'pending' as const
      });
      return uploadFile;
    });

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    onDrop(selectedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    onDrop(imageFiles);
  };

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    for (const file of files) {
      if (file.status === 'completed') continue;

      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'uploading' } : f
      ));

      uploadMutation.mutate(file);
    }

    setIsUploading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Professional Image Upload & CDN Optimization
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload images with advanced CDN optimization for maximum performance and hosting efficiency
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Drop images here or click to browse
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Support JPG, PNG, GIF, WebP up to 50MB
            </p>
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Advanced Configuration Tabs */}
          <Tabs defaultValue="metadata" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="metadata" className="flex items-center gap-2">
                <ImageLucide className="w-4 h-4" />
                Metadata
              </TabsTrigger>
              <TabsTrigger value="optimization" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                CDN Optimization
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="metadata" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={metadata.title}
                    onChange={(e) => setMetadata({...metadata, title: e.target.value})}
                    placeholder="Enter image title"
                  />
                </div>
                <div>
                  <Label htmlFor="altText">Alt Text (SEO)</Label>
                  <Input
                    id="altText"
                    value={metadata.altText}
                    onChange={(e) => setMetadata({...metadata, altText: e.target.value})}
                    placeholder="Descriptive alt text for accessibility"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={metadata.tags}
                    onChange={(e) => setMetadata({...metadata, tags: e.target.value})}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                <div>
                  <Label htmlFor="folder">Folder/Category</Label>
                  <Input
                    id="folder"
                    value={metadata.folder}
                    onChange={(e) => setMetadata({...metadata, folder: e.target.value})}
                    placeholder="Optional folder organization"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={metadata.description}
                    onChange={(e) => setMetadata({...metadata, description: e.target.value})}
                    placeholder="Detailed image description"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="optimization" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Format & Quality
                  </h4>
                  
                  <div>
                    <Label>Output Format</Label>
                    <Select value={cdnOptions.format} onValueChange={(value) => setCdnOptions({...cdnOptions, format: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (Best Format)</SelectItem>
                        <SelectItem value="webp">WebP (Modern)</SelectItem>
                        <SelectItem value="avif">AVIF (Ultra Modern)</SelectItem>
                        <SelectItem value="jpeg">JPEG (Universal)</SelectItem>
                        <SelectItem value="png">PNG (Lossless)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Quality: {cdnOptions.quality}%</Label>
                    <Slider
                      value={[cdnOptions.quality]}
                      onValueChange={(value) => setCdnOptions({...cdnOptions, quality: value[0]})}
                      min={1}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Resize Options</h4>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={cdnOptions.resize}
                      onCheckedChange={(checked) => setCdnOptions({...cdnOptions, resize: checked})}
                    />
                    <Label>Enable Resizing</Label>
                  </div>

                  {cdnOptions.resize && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="width">Width (px)</Label>
                          <Input
                            id="width"
                            type="number"
                            value={cdnOptions.width}
                            onChange={(e) => setCdnOptions({...cdnOptions, width: e.target.value})}
                            placeholder="1920"
                          />
                        </div>
                        <div>
                          <Label htmlFor="height">Height (px)</Label>
                          <Input
                            id="height"
                            type="number"
                            value={cdnOptions.height}
                            onChange={(e) => setCdnOptions({...cdnOptions, height: e.target.value})}
                            placeholder="1080"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Fit Mode</Label>
                        <Select value={cdnOptions.fit} onValueChange={(value) => setCdnOptions({...cdnOptions, fit: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cover">Cover (Crop to Fill)</SelectItem>
                            <SelectItem value="contain">Contain (Fit Inside)</SelectItem>
                            <SelectItem value="fill">Fill (Stretch)</SelectItem>
                            <SelectItem value="inside">Inside (Max Dimensions)</SelectItem>
                            <SelectItem value="outside">Outside (Min Dimensions)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Sliders className="w-4 h-4" />
                    Image Adjustments
                  </h4>

                  <div>
                    <Label>Brightness: {cdnOptions.brightness}%</Label>
                    <Slider
                      value={[cdnOptions.brightness]}
                      onValueChange={(value) => setCdnOptions({...cdnOptions, brightness: value[0]})}
                      min={0}
                      max={200}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Contrast: {cdnOptions.contrast}%</Label>
                    <Slider
                      value={[cdnOptions.contrast]}
                      onValueChange={(value) => setCdnOptions({...cdnOptions, contrast: value[0]})}
                      min={0}
                      max={200}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Saturation: {cdnOptions.saturation}%</Label>
                    <Slider
                      value={[cdnOptions.saturation]}
                      onValueChange={(value) => setCdnOptions({...cdnOptions, saturation: value[0]})}
                      min={0}
                      max={200}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Blur: {cdnOptions.blur}px</Label>
                    <Slider
                      value={[cdnOptions.blur]}
                      onValueChange={(value) => setCdnOptions({...cdnOptions, blur: value[0]})}
                      min={0}
                      max={50}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">CDN & Performance</h4>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={cdnOptions.sharpen}
                      onCheckedChange={(checked) => setCdnOptions({...cdnOptions, sharpen: checked})}
                    />
                    <Label>Enable Sharpening</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={cdnOptions.progressive}
                      onCheckedChange={(checked) => setCdnOptions({...cdnOptions, progressive: checked})}
                    />
                    <Label>Progressive Loading</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={cdnOptions.stripMetadata}
                      onCheckedChange={(checked) => setCdnOptions({...cdnOptions, stripMetadata: checked})}
                    />
                    <Label>Strip EXIF Metadata</Label>
                  </div>

                  <div>
                    <Label>Cache TTL (seconds)</Label>
                    <Select 
                      value={cdnOptions.cacheTtl.toString()} 
                      onValueChange={(value) => setCdnOptions({...cdnOptions, cacheTtl: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3600">1 Hour</SelectItem>
                        <SelectItem value="86400">1 Day</SelectItem>
                        <SelectItem value="604800">1 Week</SelectItem>
                        <SelectItem value="2592000">1 Month</SelectItem>
                        <SelectItem value="31536000">1 Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Image Position (for cropping)</Label>
                    <Select value={cdnOptions.position} onValueChange={(value) => setCdnOptions({...cdnOptions, position: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Files to upload:</h4>
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {file.preview && (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {file.status === 'uploading' && (
                      <p className="text-xs text-blue-600">Uploading...</p>
                    )}
                    {file.status === 'completed' && (
                      <p className="text-xs text-green-600">✓ Uploaded</p>
                    )}
                    {file.status === 'error' && (
                      <p className="text-xs text-red-600">✗ {file.error}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {files.length > 0 && (
            <Button
              onClick={uploadFiles}
              disabled={isUploading || files.every(f => f.status === 'completed')}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Upload Images'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}