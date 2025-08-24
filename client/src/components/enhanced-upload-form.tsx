import React, { useState, useCallback } from 'react';
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
import { Upload, X, ImageIcon, Settings, Eye, Download, FolderPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UploadFile extends File {
  id: string;
  preview?: string;
  status?: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export function EnhancedUploadForm() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    tags: '',
    folder: '',
    isPublic: true,
  });

  // Transform state
  const [transforms, setTransforms] = useState({
    width: '',
    height: '',
    quality: 80,
    format: '',
    fit: 'cover',
    blur: 0,
    brightness: 1,
    contrast: 1,
    saturation: 1,
    hue: 0,
    rotate: 0,
    grayscale: false,
    sharpen: false,
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

      // Add metadata
      if (metadata.title) formData.append('title', metadata.title);
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.tags) formData.append('tags', metadata.tags);
      if (metadata.folder) formData.append('folder', metadata.folder);
      formData.append('isPublic', metadata.isPublic.toString());

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

      console.log('Uploading file:', file.name, 'with options:', { ...metadata, ...transforms });

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
    onSuccess: (data, file) => {
      setFiles(prev => prev.map(f =>
        f.id === file.id
          ? { ...f, status: 'completed' }
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
          ? { ...f, status: 'error', error: error.message }
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
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'pending',
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

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        if (file.status === 'pending' || file.status === 'error') {
          await uploadMutation.mutateAsync(file as UploadFile);
        }
      }
      // Optionally clear files after all uploads are attempted
      // setTimeout(() => {
      //   setFiles([]);
      // }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const totalProgress = files.length > 0
    ? Math.round(files.reduce((acc, file) => acc + (file.status === 'completed' ? 100 : 0), 0) / files.length)
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
              Supports: JPEG, PNG, GIF, WebP, SVG, BMP, AVIF (max 10MB each)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Options and Transforms */}
      <Tabs defaultValue="metadata" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="transforms">Transforms</TabsTrigger>
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
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={metadata.title}
                  onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Image title (optional)"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={metadata.description}
                  onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Image description (optional)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={metadata.tags}
                  onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="nature, landscape, outdoor"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas (max 10 tags, 50 chars each)</p>
              </div>

              <div>
                <Label htmlFor="folder">Folder</Label>
                <Input
                  id="folder"
                  value={metadata.folder}
                  onChange={(e) => setMetadata(prev => ({ ...prev, folder: e.target.value }))}
                  placeholder="Enter folder name (optional)"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={metadata.isPublic}
                  onCheckedChange={(checked) => setMetadata(prev => ({ ...prev, isPublic: checked }))}
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
      </Tabs>

      {/* Upload Button and Progress */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                {files.length} file{files.length !== 1 ? 's' : ''} ready to upload
              </div>
              <Button
                onClick={handleUpload}
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
    </div>
  );
}