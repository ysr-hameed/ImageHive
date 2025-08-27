import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Upload, X, ImageIcon, Settings, Eye, Download, FolderPlus, Bell, LayoutDashboard, FileText, Code, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, AlertCircle } from 'lucide-react';
import { Link } from "wouter";
import { Checkbox } from '@/components/ui/checkbox';


// Mocking Upay integration for now, replace with actual integration
const upayPayment = {
  init: () => console.log('Upay initialized'),
  open: (options: any) => console.log('Opening Upay with:', options),
};

interface UploadFile extends File {
  id: string;
  preview?: string;
  status?: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  progress?: number; // Added progress for visual feedback
}

// Initialize uploadOptions with default values
const initialUploadOptions = {
  privacy: 'public',
  quality: 85,
  format: 'original',
  watermark: false,
  resize: false,
  width: 0,
  height: 0,
  compression: 'balanced',
  colorSpace: 'srgb',
  dpi: 72,
  autoEnhance: false,
  generateThumbs: false,
  progressive: false,
  stripExif: false,
  metadata: {
    title: '',
    author: '',
    copyright: '',
    keywords: '',
  },
  // Effects options
  blur: 0,
  brightness: 1,
  contrast: 1,
  saturation: 1,
  sharpen: false,
  grayscale: false,
  // Premium options
  watermarkText: '',
  watermarkOpacity: 50,
  watermarkPosition: 'bottom-right',
  autoBackup: false,
  encryption: false,
};

export function EnhancedUploadForm() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);


  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form state with new variables
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folder, setFolder] = useState('');
  const [altText, setAltText] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [customFilename, setCustomFilename] = useState('');
  const [overrideFilename, setOverrideFilename] = useState(false);

  const [transforms, setTransforms] = useState({
    width: '',
    height: '',
    format: 'auto',
    fit: 'cover',
    quality: 80,
    blur: 0,
    brightness: 1,
    contrast: 1,
    saturation: 1,
    grayscale: false,
    sharpen: false,
    watermark: false,
    rotate: 0,
  });

  const [uploadOptions, setUploadOptions] = useState(initialUploadOptions);


  if (!isAuthenticated || !user) {
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

      // Add metadata
      if (metadata.title) formData.append('title', metadata.title);
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.tags) formData.append('tags', metadata.tags);
      if (metadata.folder) formData.append('folder', metadata.folder);
      formData.append('isPublic', 'true'); // Always public

      // Add transforms
      if (transforms.width) formData.append('width', transforms.width);
      if (transforms.height) formData.append('height', transforms.height);
      if (transforms.quality !== 80) formData.append('quality', transforms.quality.toString());
      if (transforms.format) formData.append('format', transforms.format);
      if (transforms.fit !== 'cover') formData.append('fit', transforms.fit);
      if (transforms.blur > 0) formData.append('blur', transforms.blur.toString());
      if (transforms.brightness !== 1) formData.append('brightness', transforms.brightness.toString());
      if (transforms.contrast !== 1) formData.append('contrast', transforms.contrast.toString());
      if (transforms.saturation !== 1) formData.append('saturation', transforms.saturation.toString());
      if (transforms.hue !== 0) formData.append('hue', transforms.hue.toString());
      if (transforms.rotate !== 0) formData.append('rotate', transforms.rotate.toString());
      if (transforms.grayscale) formData.append('grayscale', 'true');
      if (transforms.sharpen) formData.append('sharpen', 'true');
      if (transforms.watermark) formData.append('watermark', 'true'); // Append watermark if selected

      // Append new upload options
      formData.append('privacy', uploadOptions.privacy);
      formData.append('quality', uploadOptions.quality.toString());
      formData.append('format', uploadOptions.format);
      if (uploadOptions.watermark) {
        formData.append('watermark', 'true');
      }

      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? `${pair[1].name} (${pair[1].size} bytes)` : pair[1]));
      }

      // Set uploading status immediately
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'uploading', progress: 10 } : f
      ));

      const response = await fetch('/api/v1/images/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || 'Upload failed';
        } catch (e) {
          errorMessage = errorText || 'Upload failed';
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      return result;
    },
    onSuccess: (data, file) => {
      setFiles(prev => prev.map(f =>
        f.id === file.id
          ? { ...f, status: 'completed', progress: 100 }
          : f
      ));
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        title: "Upload successful",
        description: "Your image has been uploaded successfully.",
      });
    },
    onError: (error: any, file) => {
      setFiles(prev => prev.map(f =>
        f.id === file.id
          ? { ...f, status: 'error', error: error.message, progress: 0 }
          : f
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

      try {
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
        ));

        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', title || file.name); // Use state variable
        formData.append('description', description);
        formData.append('folder', folder);
        formData.append('altText', altText);
        formData.append('tags', tags);
        formData.append('isPublic', isPublic.toString());
        if (customFilename) {
          formData.append('customFilename', customFilename);
          formData.append('overrideFilename', overrideFilename.toString());
        }

        // Add transform options
        Object.entries(transforms).forEach(([key, value]) => {
          if (value !== '' && value !== 0 && value !== false && value !== 1 && value !== 'auto' && value !== 'cover') {
            if (key === 'blur' && value === 0) {
            } else {
               formData.append(`transform_${key}`, value.toString());
            }
          } else if (key === 'grayscale' && value === true) {
            formData.append(`transform_${key}`, 'true');
          } else if (key === 'sharpen' && value === true) {
            formData.append(`transform_${key}`, 'true');
          } else if (key === 'watermark' && value === true) {
            formData.append(`transform_${key}`, 'true');
          }
        });


        // Add processing options to form data
        if (uploadOptions.resize) {
          formData.append('width', uploadOptions.width.toString());
          formData.append('height', uploadOptions.height.toString());
        }
        if (uploadOptions.quality !== 85) {
          formData.append('quality', uploadOptions.quality.toString());
        }
        if (uploadOptions.format !== 'original') {
          formData.append('format', uploadOptions.format);
        }
        if (uploadOptions.watermark) {
          formData.append('watermark', 'true');
        }
        if (uploadOptions.compression !== 'balanced') {
          formData.append('compression', uploadOptions.compression);
        }
        if (uploadOptions.colorSpace !== 'srgb') {
          formData.append('colorSpace', uploadOptions.colorSpace);
        }
        if (uploadOptions.dpi !== 72) {
          formData.append('dpi', uploadOptions.dpi.toString());
        }
        if (uploadOptions.autoEnhance) {
          formData.append('autoEnhance', 'true');
        }
        if (uploadOptions.generateThumbs) {
          formData.append('generateThumbs', 'true');
        }
        if (uploadOptions.progressive) {
          formData.append('progressive', 'true');
        }
        if (uploadOptions.stripExif) {
          formData.append('stripExif', 'true');
        }

        // Append nested metadata
        if (uploadOptions.metadata.title) formData.append('meta_title', uploadOptions.metadata.title);
        if (uploadOptions.metadata.author) formData.append('meta_author', uploadOptions.metadata.author);
        if (uploadOptions.metadata.copyright) formData.append('meta_copyright', uploadOptions.metadata.copyright);
        if (uploadOptions.metadata.keywords) formData.append('meta_keywords', uploadOptions.metadata.keywords);

        // Append effect options
        if (uploadOptions.blur > 0) formData.append('blur', uploadOptions.blur.toString());
        if (uploadOptions.brightness !== 1) formData.append('brightness', uploadOptions.brightness.toString());
        if (uploadOptions.contrast !== 1) formData.append('contrast', uploadOptions.contrast.toString());
        if (uploadOptions.saturation !== 1) formData.append('saturation', uploadOptions.saturation.toString());
        if (uploadOptions.sharpen) formData.append('sharpen', 'true');
        if (uploadOptions.grayscale) formData.append('grayscale', 'true');

        // Append premium options (only if user has a plan that supports them or is upgrading)
        if (user?.plan === 'pro' || user?.plan === 'enterprise') {
          if (uploadOptions.watermarkText) formData.append('watermark_text', uploadOptions.watermarkText);
          if (uploadOptions.watermarkOpacity !== 50) formData.append('watermark_opacity', uploadOptions.watermarkOpacity.toString());
          if (uploadOptions.watermarkPosition !== 'bottom-right') formData.append('watermark_position', uploadOptions.watermarkPosition);
          if (uploadOptions.autoBackup) formData.append('auto_backup', 'true');
          if (uploadOptions.encryption) formData.append('encryption', 'true');
        }


        const response = await fetch('/api/v1/images/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
        }

        const result = await response.json();

        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, status: 'completed', progress: 100 } : f
        ));

        toast({
          title: "Upload successful",
          description: `${file.name} uploaded successfully`,
        });

      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map(f =>
          f.id === file.id ? {
            ...f,
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed',
            progress: 0
          } : f
        ));

        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }
    }

    setIsUploading(false);
    queryClient.invalidateQueries({ queryKey: ['/api/v1/images'] });
  };


  const totalProgress = files.length > 0
    ? Math.round(files.reduce((acc, file) => acc + (file.progress || 0), 0) / files.length)
    : 0;

  const handleUpgradePlan = () => {
    upayPayment.open({
      amount: 1000, // Example amount for upgrade
      currency: 'USD',
      metadata: { userId: user?.id, plan: 'pro' },
    });
  };

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="w-full">
        {/* Upload Area */}
        <Card>
          <CardContent className="p-8">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed rounded-lg p-8 text-center transition-colors border-gray-300 dark:border-gray-600 hover:border-gray-400"
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                ref={fileInputRef}
              />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Upload your images
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop your images here, or click to browse
              </p>
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upload Options and Transforms */}
        <Tabs defaultValue="metadata" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="transforms">Transforms</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
          </TabsList>
          <TabsContent value="metadata">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderPlus className="w-5 h-5" />
                  Image Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Updated Metadata Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter image title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customFilename">Custom Filename (Optional)</Label>
                    <div className="space-y-2">
                      <Input
                        id="customFilename"
                        value={customFilename}
                        onChange={(e) => setCustomFilename(e.target.value)}
                        placeholder="my-custom-name"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="overrideFilename"
                          checked={overrideFilename}
                          onChange={(e) => setOverrideFilename(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="overrideFilename" className="text-sm">
                          Override original filename
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="folder">Folder</Label>
                    <Input
                      id="folder"
                      value={folder}
                      onChange={(e) => setFolder(e.target.value)}
                      placeholder="e.g., products/2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="altText">Alt Text</Label>
                    <Input
                      id="altText"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Describe the image for accessibility"
                    />
                  </div>
                </div>
                {/* End of Updated Metadata Section */}

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="nature, landscape, outdoor"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate tags with commas (max 10 tags, 50 chars each)</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={isPublic}
                    onCheckedChange={(checked) => setIsPublic(checked)}
                  />
                  <Label htmlFor="isPublic">Make images publicly accessible</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="transforms">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Image Transforms & Effects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={transforms.width}
                      onChange={(e) => setTransforms(prev => ({ ...prev, width: e.target.value }))}
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
                      value={transforms.height}
                      onChange={(e) => setTransforms(prev => ({ ...prev, height: e.target.value }))}
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
                      value={transforms.format}
                      onValueChange={(value) => setTransforms(prev => ({ ...prev, format: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
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
                      value={transforms.fit}
                      onValueChange={(value) => setTransforms(prev => ({ ...prev, fit: value }))}
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
                  <Label htmlFor="quality">Quality ({transforms.quality}%)</Label>
                  <Slider
                    id="quality"
                    min={1}
                    max={100}
                    step={1}
                    value={[transforms.quality]}
                    onValueChange={(value) => setTransforms(prev => ({ ...prev, quality: value[0] }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="rotate">Rotation (degrees)</Label>
                  <Input
                    id="rotate"
                    type="number"
                    value={transforms.rotate}
                    onChange={(e) => setTransforms(prev => ({ ...prev, rotate: parseInt(e.target.value) }))}
                    placeholder="0"
                    min="0"
                    max="360"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="blur">Blur (0.3-1000)</Label>
                    <Input
                      id="blur"
                      type="number"
                      value={transforms.blur}
                      onChange={(e) => setTransforms(prev => ({ ...prev, blur: parseInt(e.target.value) }))}
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
                      value={transforms.brightness}
                      onChange={(e) => setTransforms(prev => ({ ...prev, brightness: parseFloat(e.target.value) }))}
                      placeholder="1.0"
                      min="0.1"
                      max="3.0"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contrast">Contrast (0.1-3.0)</Label>
                    <Input
                      id="contrast"
                      type="number"
                      value={transforms.contrast}
                      onChange={(e) => setTransforms(prev => ({ ...prev, contrast: parseFloat(e.target.value) }))}
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
                      value={transforms.saturation}
                      onChange={(e) => setTransforms(prev => ({ ...prev, saturation: parseFloat(e.target.value) }))}
                      placeholder="1.0"
                      min="0.0"
                      max="3.0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="grayscale"
                      checked={transforms.grayscale}
                      onCheckedChange={(checked) => setTransforms(prev => ({ ...prev, grayscale: checked }))}
                    />
                    <Label htmlFor="grayscale">Grayscale</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sharpen"
                      checked={transforms.sharpen}
                      onCheckedChange={(checked) => setTransforms(prev => ({ ...prev, sharpen: checked }))}
                    />
                    <Label htmlFor="sharpen">Sharpen</Label>
                  </div>

                  {user?.plan === 'pro' || user?.plan === 'enterprise' ? (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="watermark"
                        checked={transforms.watermark}
                        onCheckedChange={(checked) => setTransforms(prev => ({ ...prev, watermark: checked }))}
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
          </TabsContent>

          <TabsContent value="optimization">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Optimization & Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="compression">Compression Strategy</Label>
                  <Select
                    value={uploadOptions.compression}
                    onValueChange={(value) => setUploadOptions(prev => ({ ...prev, compression: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lossless">Lossless (Best Quality)</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="aggressive">Aggressive (Smaller Size)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="colorSpace">Color Space</Label>
                  <Select
                    value={uploadOptions.colorSpace}
                    onValueChange={(value) => setUploadOptions(prev => ({ ...prev, colorSpace: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="srgb">sRGB</SelectItem>
                      <SelectItem value="adobergb">Adobe RGB</SelectItem>
                      <SelectItem value="p3">Display P3</SelectItem>
                      <SelectItem value="rec2020">Rec.2020</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dpi">DPI (Dots Per Inch)</Label>
                  <Input
                    id="dpi"
                    type="number"
                    value={uploadOptions.dpi}
                    onChange={(e) => setUploadOptions(prev => ({ ...prev, dpi: parseInt(e.target.value) || 72 }))}
                    placeholder="72"
                    min="72"
                    max="300"
                  />
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoEnhance"
                      checked={uploadOptions.autoEnhance}
                      onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, autoEnhance: checked }))}
                    />
                    <Label htmlFor="autoEnhance">Auto Enhance</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="generateThumbs"
                      checked={uploadOptions.generateThumbs}
                      onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, generateThumbs: checked }))}
                    />
                    <Label htmlFor="generateThumbs">Generate Thumbnails</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="progressive"
                      checked={uploadOptions.progressive}
                      onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, progressive: checked }))}
                    />
                    <Label htmlFor="progressive">Progressive Loading</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="stripExif"
                      checked={uploadOptions.stripExif}
                      onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, stripExif: checked }))}
                    />
                    <Label htmlFor="stripExif">Strip EXIF Data</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="effects">
            <Card className="mt-4">
              <CardContent className="p-4">
                <h5 className="font-medium mb-2">Image Effects</h5>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="blur">Blur</Label>
                      <Input
                        id="blur"
                        type="range"
                        min="0"
                        max="100"
                        value={uploadOptions.blur || 0}
                        onChange={(e) => setUploadOptions(prev => ({ ...prev, blur: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{uploadOptions.blur || 0}%</span>
                    </div>
                    <div>
                      <Label htmlFor="brightness">Brightness</Label>
                      <Input
                        id="brightness"
                        type="range"
                        min="0"
                        max="200"
                        value={(uploadOptions.brightness || 1) * 100}
                        onChange={(e) => setUploadOptions(prev => ({ ...prev, brightness: parseInt(e.target.value) / 100 }))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{Math.round((uploadOptions.brightness || 1) * 100)}%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contrast">Contrast</Label>
                      <Input
                        id="contrast"
                        type="range"
                        min="0"
                        max="200"
                        value={(uploadOptions.contrast || 1) * 100}
                        onChange={(e) => setUploadOptions(prev => ({ ...prev, contrast: parseInt(e.target.value) / 100 }))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{Math.round((uploadOptions.contrast || 1) * 100)}%</span>
                    </div>
                    <div>
                      <Label htmlFor="saturation">Saturation</Label>
                      <Input
                        id="saturation"
                        type="range"
                        min="0"
                        max="200"
                        value={(uploadOptions.saturation || 1) * 100}
                        onChange={(e) => setUploadOptions(prev => ({ ...prev, saturation: parseInt(e.target.value) / 100 }))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{Math.round((uploadOptions.saturation || 1) * 100)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sharpen"
                        checked={uploadOptions.sharpen || false}
                        onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, sharpen: checked }))}
                      />
                      <Label htmlFor="sharpen">Sharpen</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="grayscale"
                        checked={uploadOptions.grayscale || false}
                        onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, grayscale: checked }))}
                      />
                      <Label htmlFor="grayscale">Grayscale</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="premium">
            <Card className="mt-4">
              <CardContent className="p-4">
                {user?.plan === 'free' ? (
                  <div className="text-center space-y-4">
                    <h5 className="font-medium">Premium Features Available</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Upgrade to unlock advanced features
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded">
                        <span>Custom Watermarks</span>
                        <Badge variant="secondary">Pro</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded">
                        <span>Advanced Compression</span>
                        <Badge variant="secondary">Pro</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded">
                        <span>Custom Domains</span>
                        <Badge variant="secondary">Pro</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded">
                        <span>Priority Processing</span>
                        <Badge variant="secondary">Pro</Badge>
                      </div>
                    </div>
                    <Button onClick={() => window.location.href = '/plans'} className="w-full">
                      Upgrade to Pro
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h5 className="font-medium mb-2">Premium Features</h5>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="watermarkText">Watermark Text</Label>
                        <Input
                          id="watermarkText"
                          value={uploadOptions.watermarkText || ''}
                          onChange={(e) => setUploadOptions(prev => ({ ...prev, watermarkText: e.target.value }))}
                          placeholder="Enter watermark text"
                        />
                      </div>
                      <div>
                        <Label htmlFor="watermarkOpacity">Watermark Opacity</Label>
                        <Input
                          id="watermarkOpacity"
                          type="range"
                          min="0"
                          max="100"
                          value={uploadOptions.watermarkOpacity || 50}
                          onChange={(e) => setUploadOptions(prev => ({ ...prev, watermarkOpacity: parseInt(e.target.value) }))}
                        />
                        <span className="text-xs text-gray-500">{uploadOptions.watermarkOpacity || 50}%</span>
                      </div>
                      <div>
                        <Label htmlFor="watermarkPosition">Watermark Position</Label>
                        <Select
                          value={uploadOptions.watermarkPosition || 'bottom-right'}
                          onValueChange={(value) => setUploadOptions(prev => ({ ...prev, watermarkPosition: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top-left">Top Left</SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="autoBackup"
                          checked={uploadOptions.autoBackup || false}
                          onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, autoBackup: checked }))}
                        />
                        <Label htmlFor="autoBackup">Auto Backup</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="encryption"
                          checked={uploadOptions.encryption || false}
                          onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, encryption: checked }))}
                        />
                        <Label htmlFor="encryption">Enable Encryption</Label>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upload Button and Progress */}
        {files.length > 0 && (
          <Card className="mt-6">
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
                  {isUploading ? 'Uploading...' : 'Upload All'}
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
          <Card className="mt-6">
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
                          <ImageIcon className="w-6 h-6 text-gray-400" />
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
                        {file.status === 'completed' ? 'Done' : file.status === 'error' ? 'Failed' : file.status === 'uploading' ? 'Uploading' : 'Pending'}
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
        {/* Added Section for Documentation and Library Usage */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentation & Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold mb-2">How to Use</h4>
              <Tabs defaultValue="library" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="library">Library</TabsTrigger>
                  <TabsTrigger value="sdk">SDK</TabsTrigger>
                  <TabsTrigger value="api">API</TabsTrigger>
                </TabsList>
                <TabsContent value="library">
                  <Card className="mt-4">
                    <CardContent className="p-4">
                      <h5 className="font-medium mb-2">Using the Library</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Integrate our React component seamlessly into your project.
                        Follow the installation instructions and import `EnhancedUploadForm`
                        wherever you need an upload interface.
                      </p>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mt-2">
                        <code>{`import { EnhancedUploadForm } from './your-upload-component';

function App() {
  return (
    <div>
      {/* Other components */}
      <EnhancedUploadForm />
      {/* Other components */}
    </div>
  );
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="sdk">
                  <Card className="mt-4">
                    <CardContent className="p-4">
                      <h5 className="font-medium mb-2">Using the SDK</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Our SDK simplifies interactions with our services. Install it via npm
                        and leverage its functions for more advanced control.
                      </p>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mt-2">
                        <code>{`npm install your-service-sdk
# or
yarn add your-service-sdk`}</code>
                      </pre>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mt-2">
                        <code>{`import { YourService } from 'your-service-sdk';

const service = new YourService({ apiKey: 'YOUR_API_KEY' });
service.uploadImage({ file: imageFile, options: {...} }).then(res => console.log(res));`}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="api">
                  <Card className="mt-4">
                    <CardContent className="p-4">
                      <h5 className="font-medium mb-2">Using the API</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Interact directly with our robust API endpoints for maximum flexibility.
                        Refer to the API documentation for detailed endpoint specifications and request/response formats.
                      </p>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mt-2">
                        <code>{`POST /api/upload
Content-Type: multipart/form-data

{
  "image": "<binary file data>",
  "title": "Optional Title",
  "description": "Optional Description",
  // ... other metadata and transform options
}`}</code>
                      </pre>
                      <a href="/api/docs" className="text-blue-600 hover:underline mt-2 inline-block">View Full API Documentation</a>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            {/* Upgrade Plan Section */}
            {user?.plan !== 'pro' && user?.plan !== 'enterprise' && (
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5" />
                      Upgrade Your Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Unlock advanced features and higher limits by upgrading your plan.
                      Click the button below to proceed with the upgrade.
                    </p>
                    <Button onClick={handleUpgradePlan} className="bg-green-600 hover:bg-green-700">
                      Upgrade to Pro Plan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}