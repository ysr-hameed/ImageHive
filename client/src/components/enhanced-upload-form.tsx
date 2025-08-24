import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import {
  Upload,
  X,
  Image as ImageIcon,
  FileImage,
  AlertCircle,
  Check,
  Settings,
  Palette,
  Zap
} from 'lucide-react';

interface UploadFile extends File {
  id: string;
  preview?: string;
  progress?: number;
  status?: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface UploadOptions {
  title: string;
  description: string;
  isPublic: boolean;
  tags: string;
  folder: string;
  quality: number;
  width: string;
  height: string;
  format: string;
  fit: string;
  blur: string;
  brightness: string;
  contrast: string;
  saturation: string;
  hue: string;
  rotate: string;
  grayscale: boolean;
  sharpen: boolean;
  watermark: boolean;
}

export function EnhancedUploadForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadOptions, setUploadOptions] = useState<UploadOptions>({
    title: '',
    description: '',
    isPublic: true,
    tags: '',
    folder: '',
    quality: 85,
    width: '',
    height: '',
    format: '',
    fit: 'cover',
    blur: '',
    brightness: '',
    contrast: '',
    saturation: '',
    hue: '',
    rotate: '',
    grayscale: false,
    sharpen: false,
    watermark: false,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, options }: { file: UploadFile; options: UploadOptions }) => {
      const formData = new FormData();
      formData.append('image', file);
      
      // Add all the options to formData
      if (options.title) formData.append('title', options.title);
      if (options.description) formData.append('description', options.description);
      formData.append('isPublic', options.isPublic.toString());
      if (options.tags) formData.append('tags', JSON.stringify(options.tags.split(',').map(tag => tag.trim()).filter(Boolean)));
      if (options.folder) formData.append('folder', options.folder);
      
      // Quality and format
      formData.append('quality', options.quality.toString());
      if (options.format) formData.append('format', options.format);
      
      // Resize options
      if (options.width) formData.append('width', options.width);
      if (options.height) formData.append('height', options.height);
      if (options.fit) formData.append('fit', options.fit);
      
      // Effects
      if (options.blur) formData.append('blur', options.blur);
      if (options.brightness) formData.append('brightness', options.brightness);
      if (options.contrast) formData.append('contrast', options.contrast);
      if (options.saturation) formData.append('saturation', options.saturation);
      if (options.hue) formData.append('hue', options.hue);
      if (options.rotate) formData.append('rotate', options.rotate);
      if (options.grayscale) formData.append('grayscale', options.grayscale.toString());
      if (options.sharpen) formData.append('sharpen', options.sharpen.toString());
      if (options.watermark) formData.append('watermark', options.watermark.toString());

      console.log('Uploading file:', file.name, 'with options:', options);

      // Use the correct endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      setFiles(prev => prev.map(f => 
        f.id === variables.file.id 
          ? { ...f, status: 'completed', progress: 100 }
          : f
      ));
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any, variables) => {
      setFiles(prev => prev.map(f => 
        f.id === variables.file.id 
          ? { ...f, status: 'error', error: error.message }
          : f
      ));
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'pending',
      progress: 0,
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach((rejection) => {
        const { file, errors } = rejection;
        errors.forEach((error) => {
          toast({
            title: "File rejected",
            description: `${file.name}: ${error.message}`,
            variant: "destructive",
          });
        });
      });
    },
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        if (file.status === 'pending') {
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
          ));

          await uploadMutation.mutateAsync({ 
            file, 
            options: {
              ...uploadOptions,
              title: uploadOptions.title || file.name
            }
          });
        }
      }

      toast({
        title: "Upload completed",
        description: `Successfully uploaded ${files.filter(f => f.status === 'completed').length} images`,
      });

      // Clear completed files after a delay
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.status !== 'completed'));
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const totalProgress = files.length > 0 
    ? Math.round(files.reduce((acc, file) => acc + (file.progress || 0), 0) / files.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10'
                : 'border-gray-300 dark:border-gray-600 hover:border-brand-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop images here'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              or click to browse files
            </p>
            <p className="text-sm text-gray-400">
              Supports: JPEG, PNG, GIF, WebP, SVG, BMP, AVIF (max 50MB each)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Options */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Basic Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Basic Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={uploadOptions.title}
                onChange={(e) => setUploadOptions(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Image title (optional)"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={uploadOptions.description}
                onChange={(e) => setUploadOptions(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Image description (optional)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={uploadOptions.tags}
                onChange={(e) => setUploadOptions(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="nature, landscape, outdoor"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas (max 10 tags, 50 chars each)</p>
            </div>

            <div>
              <Label htmlFor="folder">Folder</Label>
              <Input
                id="folder"
                value={uploadOptions.folder}
                onChange={(e) => setUploadOptions(prev => ({ ...prev, folder: e.target.value }))}
                placeholder="Enter folder name (optional)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={uploadOptions.isPublic}
                onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, isPublic: checked }))}
              />
              <Label htmlFor="isPublic">Make images publicly accessible</Label>
            </div>
          </CardContent>
        </Card>

        {/* Transform Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Transform Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={uploadOptions.width}
                  onChange={(e) => setUploadOptions(prev => ({ ...prev, width: e.target.value }))}
                  placeholder="Auto"
                  min="1"
                  max="4000"
                />
              </div>
              <div>
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={uploadOptions.height}
                  onChange={(e) => setUploadOptions(prev => ({ ...prev, height: e.target.value }))}
                  placeholder="Auto"
                  min="1"
                  max="4000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="format">Output Format</Label>
                <Select 
                  value={uploadOptions.format} 
                  onValueChange={(value) => setUploadOptions(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Auto</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                    <SelectItem value="avif">AVIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fit">Resize Mode</Label>
                <Select 
                  value={uploadOptions.fit} 
                  onValueChange={(value) => setUploadOptions(prev => ({ ...prev, fit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="fill">Fill</SelectItem>
                    <SelectItem value="inside">Inside</SelectItem>
                    <SelectItem value="outside">Outside</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="quality">Quality ({uploadOptions.quality}%)</Label>
              <Input
                id="quality"
                type="range"
                min="1"
                max="100"
                step="1"
                value={uploadOptions.quality}
                onChange={(e) => setUploadOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="rotate">Rotation (degrees)</Label>
              <Input
                id="rotate"
                type="number"
                value={uploadOptions.rotate}
                onChange={(e) => setUploadOptions(prev => ({ ...prev, rotate: e.target.value }))}
                placeholder="0"
                min="0"
                max="360"
              />
            </div>
          </CardContent>
        </Card>

        {/* Effects Options */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Effects & Adjustments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="blur">Blur (0.3-1000)</Label>
                <Input
                  id="blur"
                  type="number"
                  value={uploadOptions.blur}
                  onChange={(e) => setUploadOptions(prev => ({ ...prev, blur: e.target.value }))}
                  placeholder="0"
                  min="0.3"
                  max="1000"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="brightness">Brightness (0.1-3.0)</Label>
                <Input
                  id="brightness"
                  type="number"
                  value={uploadOptions.brightness}
                  onChange={(e) => setUploadOptions(prev => ({ ...prev, brightness: e.target.value }))}
                  placeholder="1.0"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="contrast">Contrast (0.1-3.0)</Label>
                <Input
                  id="contrast"
                  type="number"
                  value={uploadOptions.contrast}
                  onChange={(e) => setUploadOptions(prev => ({ ...prev, contrast: e.target.value }))}
                  placeholder="1.0"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="saturation">Saturation (0.0-3.0)</Label>
                <Input
                  id="saturation"
                  type="number"
                  value={uploadOptions.saturation}
                  onChange={(e) => setUploadOptions(prev => ({ ...prev, saturation: e.target.value }))}
                  placeholder="1.0"
                  min="0.0"
                  max="3.0"
                  step="0.1"
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="grayscale"
                  checked={uploadOptions.grayscale}
                  onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, grayscale: checked }))}
                />
                <Label htmlFor="grayscale">Grayscale</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="sharpen"
                  checked={uploadOptions.sharpen}
                  onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, sharpen: checked }))}
                />
                <Label htmlFor="sharpen">Sharpen</Label>
              </div>

              {user?.plan === 'pro' || user?.plan === 'enterprise' ? (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="watermark"
                    checked={uploadOptions.watermark}
                    onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, watermark: checked }))}
                  />
                  <Label htmlFor="watermark">Apply Watermark</Label>
                  <Badge variant="secondary">Pro</Badge>
                </div>
              ) : (
                <div className="flex items-center space-x-2 opacity-50">
                  <Switch id="watermark-disabled" disabled />
                  <Label htmlFor="watermark-disabled">Apply Watermark</Label>
                  <Badge variant="outline">Pro Only</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Button and Progress */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                {files.length} file{files.length !== 1 ? 's' : ''} ready to upload
              </div>
              <Button
                onClick={uploadFiles}
                disabled={isUploading || files.every(f => f.status === 'completed')}
                size="lg"
              >
                {isUploading ? 'Uploading...' : 'Upload All Images'}
                <Upload className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {isUploading && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Overall progress</span>
                  <span>{totalProgress}%</span>
                </div>
                <Progress value={totalProgress} className="h-3" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Files Queue</h3>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                        <FileImage className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    {file.status === 'uploading' && (
                      <Progress value={file.progress || 0} className="h-1 mt-2" />
                    )}

                    {file.status === 'error' && (
                      <p className="text-sm text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex items-center space-x-2">
                    <Badge variant={
                      file.status === 'completed' ? 'default' :
                      file.status === 'uploading' ? 'secondary' :
                      file.status === 'error' ? 'destructive' : 'outline'
                    }>
                      {file.status === 'completed' && <Check className="w-3 h-3 mr-1" />}
                      {file.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {file.status || 'pending'}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={file.status === 'uploading'}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}