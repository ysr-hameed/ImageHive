
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  File,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  Sliders
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UploadFile extends File {
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  privacy?: string;
  result?: any;
  error?: string;
}

export default function UploadForm() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploadOptions, setUploadOptions] = useState({
    privacy: 'public',
    description: '',
    altText: '',
    tags: '',
    quality: 80,
    format: '',
    width: '',
    height: '',
    autoOptimize: true,
    generateThumbnails: true,
    preserveExif: false,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, options }: { file: UploadFile; options: any }) => {
      const formData = new FormData();
      formData.append('image', file);
      
      // Add all options to formData
      Object.entries(options).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await fetch('/api/v1/images/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Upload failed`);
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      setFiles(prev => 
        prev.map(f => 
          f.id === variables.file.id 
            ? { ...f, status: 'completed', result: data, progress: 100 }
            : f
        )
      );
      queryClient.invalidateQueries({ queryKey: ["/api/v1/images"] });
      toast({
        title: "Upload Successful",
        description: "Your image has been uploaded successfully.",
      });
    },
    onError: (error: any, variables) => {
      setFiles(prev => 
        prev.map(f => 
          f.id === variables.file.id 
            ? { ...f, status: 'error', error: error.message, progress: 0 }
            : f
        )
      );
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending',
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.avif']
    },
    multiple: true,
    maxFiles: 10,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach((rejection) => {
        const errors = rejection.errors.map(e => e.message).join(', ');
        toast({
          title: "File Rejected",
          description: `${rejection.file.name}: ${errors}`,
          variant: "destructive",
        });
      });
    },
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const startUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const file of pendingFiles) {
      setFiles(prev => 
        prev.map(f => 
          f.id === file.id ? { ...f, status: 'uploading', progress: 10 } : f
        )
      );

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setFiles(prev => 
          prev.map(f => {
            if (f.id === file.id && f.status === 'uploading' && f.progress < 90) {
              return { ...f, progress: Math.min(f.progress + 15, 90) };
            }
            return f;
          })
        );
      }, 300);

      try {
        await uploadMutation.mutateAsync({ file, options: uploadOptions });
        clearInterval(progressInterval);
      } catch (error) {
        clearInterval(progressInterval);
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-blue-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const hasUploadableFiles = files.some(f => f.status === 'pending');
  const isUploading = files.some(f => f.status === 'uploading');

  return (
    <div className="space-y-8">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="transform">Transform</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="privacy">Privacy Setting</Label>
                <Select 
                  value={uploadOptions.privacy} 
                  onValueChange={(value) => setUploadOptions(prev => ({ ...prev, privacy: value }))}
                >
                  <SelectTrigger data-testid="select-privacy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your image..."
                  value={uploadOptions.description}
                  onChange={(e) => setUploadOptions(prev => ({ ...prev, description: e.target.value }))}
                  data-testid="input-description"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="altText">Alt Text</Label>
                <Input
                  id="altText"
                  placeholder="Alternative text for accessibility"
                  value={uploadOptions.altText}
                  onChange={(e) => setUploadOptions(prev => ({ ...prev, altText: e.target.value }))}
                  data-testid="input-alt-text"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="nature, landscape, outdoor"
                  value={uploadOptions.tags}
                  onChange={(e) => setUploadOptions(prev => ({ ...prev, tags: e.target.value }))}
                  data-testid="input-tags"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transform" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                Image Transformation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="format">Output Format</Label>
                    <Select 
                      value={uploadOptions.format} 
                      onValueChange={(value) => setUploadOptions(prev => ({ ...prev, format: value }))}
                    >
                      <SelectTrigger data-testid="select-format">
                        <SelectValue placeholder="Original" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Original</SelectItem>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="webp">WebP</SelectItem>
                        <SelectItem value="avif">AVIF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quality">Quality ({uploadOptions.quality}%)</Label>
                    <Input
                      id="quality"
                      type="range"
                      min="10"
                      max="100"
                      step="10"
                      value={uploadOptions.quality}
                      onChange={(e) => setUploadOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                      data-testid="input-quality"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Higher quality = larger file size
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="width">Width (px)</Label>
                      <Input
                        id="width"
                        type="number"
                        placeholder="Auto"
                        value={uploadOptions.width}
                        onChange={(e) => setUploadOptions(prev => ({ ...prev, width: e.target.value }))}
                        data-testid="input-width"
                      />
                    </div>

                    <div>
                      <Label htmlFor="height">Height (px)</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="Auto"
                        value={uploadOptions.height}
                        onChange={(e) => setUploadOptions(prev => ({ ...prev, height: e.target.value }))}
                        data-testid="input-height"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Leave empty to maintain aspect ratio
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Generate Thumbnails</Label>
                  <div className="text-sm text-gray-500">
                    Create multiple sizes for responsive images
                  </div>
                </div>
                <Switch
                  checked={uploadOptions.generateThumbnails}
                  onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, generateThumbnails: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Preserve EXIF Data</Label>
                  <div className="text-sm text-gray-500">
                    Keep original metadata (location, camera settings, etc.)
                  </div>
                </div>
                <Switch
                  checked={uploadOptions.preserveExif}
                  onCheckedChange={(checked) => setUploadOptions(prev => ({ ...prev, preserveExif: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* File Drop Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10'
                : 'border-gray-300 dark:border-slate-600 hover:border-brand-400 dark:hover:border-brand-500'
            }`}
            data-testid="dropzone"
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg text-brand-600 dark:text-brand-400 font-medium">
                Drop the images here...
              </p>
            ) : (
              <div>
                <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Drag & drop images here, or click to select
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supports JPEG, PNG, GIF, WebP, SVG, and more. Max size: 50MB per file.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Selected Files ({files.length})
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFiles([])}
                  disabled={isUploading}
                  data-testid="button-clear-files"
                >
                  Clear All
                </Button>
                {hasUploadableFiles && (
                  <Button
                    onClick={startUpload}
                    disabled={isUploading}
                    data-testid="button-start-upload"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload {files.filter(f => f.status === 'pending').length} Files
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {files.map((file) => (
                <div 
                  key={file.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg"
                  data-testid={`file-item-${file.id}`}
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <Badge 
                          variant={file.privacy === 'public' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {file.privacy || uploadOptions.privacy}
                        </Badge>
                        {getStatusIcon(file.status)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatBytes(file.size)} • {file.type}
                      </p>
                      
                      {file.status === 'uploading' && (
                        <Progress value={file.progress} className="w-full mt-2" />
                      )}
                      
                      {file.status === 'error' && file.error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {file.error}
                        </p>
                      )}
                      
                      {file.status === 'completed' && file.result && (
                        <div className="mt-2">
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            Uploaded successfully
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <button
                              onClick={() => navigator.clipboard.writeText(file.result.url)}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Copy URL
                            </button>
                            <a
                              href={file.result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              View Image
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={file.status === 'uploading'}
                    className="p-2"
                    data-testid={`button-remove-${file.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
