import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, X, ImageIcon, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';


interface UploadOptions {
  title: string;
  description: string;
  privacy: 'public' | 'private';
  quality: number;
  format: 'auto' | 'jpeg' | 'png' | 'webp' | 'avif';
  width?: number;
  height?: number;
  progressive: boolean;
  watermark: boolean;
  autoOptimize: boolean;
}

interface UploadedFile {
  file: File;
  preview: string;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

const SimpleUploadForm: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploadOptions, setUploadOptions] = useState<UploadOptions>({
    title: '',
    description: '',
    privacy: 'public',
    quality: 85,
    format: 'auto',
    progressive: false,
    watermark: false,
    autoOptimize: false,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending' as const,
      progress: 0,
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.avif']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    for (const fileData of files) {
      if (fileData.status !== 'pending') continue;

      // Update status to uploading
      setFiles(prev => 
        prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'uploading' as const }
            : f
        )
      );

      try {
        const formData = new FormData();
        formData.append('image', fileData.file);
        formData.append('title', uploadOptions.title || fileData.file.name);
        formData.append('description', uploadOptions.description);
        formData.append('privacy', uploadOptions.privacy);
        formData.append('quality', uploadOptions.quality.toString());
        formData.append('format', uploadOptions.format);
        if (uploadOptions.width) formData.append('width', uploadOptions.width.toString());
        if (uploadOptions.height) formData.append('height', uploadOptions.height.toString());
        formData.append('progressive', uploadOptions.progressive.toString());
        formData.append('watermark', uploadOptions.watermark.toString());
        formData.append('autoOptimize', uploadOptions.autoOptimize.toString());

        const token = localStorage.getItem('token');
        const response = await fetch('/api/v1/images/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setFiles(prev => 
            prev.map(f => 
              f.id === fileData.id 
                ? { ...f, status: 'success' as const, progress: 100, url: result.url }
                : f
            )
          );
          toast.success(`${fileData.file.name} uploaded successfully`);
        } else {
          const errorText = await response.text();
          throw new Error(`Upload failed: ${errorText}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'error' as const, error: errorMessage }
              : f
          )
        );
        toast.error(`Failed to upload ${fileData.file.name}: ${errorMessage}`);
      }
    }
  };

  const clearAll = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop images here, or click to select</p>
                <p className="text-sm text-gray-500">
                  Supports: JPEG, PNG, GIF, WebP, BMP, TIFF, AVIF (max 10MB each)
                </p>
              </div>
            )}
          </div>

          {/* File Preview */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Selected Files ({files.length})</h3>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((fileData) => (
                  <Card key={fileData.id} className="relative">
                    <CardContent className="p-4">
                      <div className="relative aspect-square mb-2">
                        <img
                          src={fileData.preview}
                          alt={fileData.file.name}
                          className="w-full h-full object-cover rounded"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeFile(fileData.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {fileData.status === 'success' && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium truncate">{fileData.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>

                        <Badge variant={
                          fileData.status === 'success' ? 'default' :
                          fileData.status === 'error' ? 'destructive' :
                          fileData.status === 'uploading' ? 'secondary' : 'outline'
                        }>
                          {fileData.status}
                        </Badge>

                        {fileData.status === 'uploading' && (
                          <Progress value={fileData.progress} className="w-full" />
                        )}

                        {fileData.error && (
                          <p className="text-xs text-red-500">{fileData.error}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Configuration Tabs */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
              <TabsTrigger value="effects">Effects</TabsTrigger>
              <TabsTrigger value="premium">Premium</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={uploadOptions.title}
                  onChange={(e) => setUploadOptions(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter image title..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadOptions.description}
                  onChange={(e) => setUploadOptions(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter image description..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="privacy">Privacy</Label>
                <Select 
                  value={uploadOptions.privacy} 
                  onValueChange={(value) => setUploadOptions(prev => ({ ...prev, privacy: value as 'public' | 'private' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="optimization" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Output Format</Label>
                  <Select 
                    value={uploadOptions.format} 
                    onValueChange={(value) => setUploadOptions(prev => ({ ...prev, format: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (Keep Original)</SelectItem>
                      <SelectItem value="jpeg">JPEG - Smaller size, good for photos</SelectItem>
                      <SelectItem value="png">PNG - Lossless, supports transparency</SelectItem>
                      <SelectItem value="webp">WebP - Modern, smaller size</SelectItem>
                      <SelectItem value="avif">AVIF - Best compression</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quality">Quality ({uploadOptions.quality}%)</Label>
                  <Slider
                    id="quality"
                    min={10}
                    max={100}
                    step={5}
                    value={[uploadOptions.quality]}
                    onValueChange={([value]) => setUploadOptions(prev => ({ ...prev, quality: value }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resize">Resize (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Width (px)"
                      type="number"
                      min="1"
                      max="8192"
                      value={uploadOptions.width || ''}
                      onChange={(e) => setUploadOptions(prev => ({ ...prev, width: parseInt(e.target.value) || undefined }))}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Height (px)"
                      type="number" 
                      min="1"
                      max="8192"
                      value={uploadOptions.height || ''}
                      onChange={(e) => setUploadOptions(prev => ({ ...prev, height: parseInt(e.target.value) || undefined }))}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Leave empty to maintain aspect ratio</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Optimization</Label>
                    <div className="text-sm text-gray-500">
                      Automatically optimize images for web delivery
                    </div>
                  </div>
                  <Switch
                    checked={uploadOptions.autoOptimize}
                    onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, autoOptimize: checked }))}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="effects" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="progressive">Progressive JPEG</Label>
                <Switch
                  id="progressive"
                  checked={uploadOptions.progressive}
                  onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, progressive: checked }))}
                />
              </div>
            </TabsContent>

            <TabsContent value="premium" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="watermark">Add Watermark</Label>
                <Switch
                  id="watermark"
                  checked={uploadOptions.watermark}
                  onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, watermark: checked }))}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Upload Button */}
          <div className="flex gap-4">
            <Button 
              onClick={uploadFiles} 
              disabled={files.length === 0 || files.some(f => f.status === 'uploading')}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload {files.filter(f => f.status === 'pending').length} Images
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleUploadForm;