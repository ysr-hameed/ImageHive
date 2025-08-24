
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
import { 
  Upload, 
  X, 
  FileImage,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UploadFile extends File {
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  result?: any;
  error?: string;
}

interface UploadSettings {
  privacy: 'public' | 'private';
  description: string;
  altText: string;
  tags: string;
  quality: number;
  format: string;
  width: string;
  height: string;
  generateThumbnails: boolean;
  enableCDN: boolean;
}

export default function EnhancedUploadForm() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSettings, setUploadSettings] = useState<UploadSettings>({
    privacy: 'public',
    description: '',
    altText: '',
    tags: '',
    quality: 80,
    format: '',
    width: '',
    height: '',
    generateThumbnails: true,
    enableCDN: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, settings }: { file: UploadFile; settings: UploadSettings }) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('privacy', settings.privacy);
      if (settings.description) formData.append('description', settings.description);
      if (settings.altText) formData.append('altText', settings.altText);
      if (settings.tags) formData.append('tags', settings.tags);
      if (settings.quality !== 80) formData.append('quality', settings.quality.toString());
      if (settings.format) formData.append('format', settings.format);
      if (settings.width) formData.append('width', settings.width);
      if (settings.height) formData.append('height', settings.height);
      formData.append('generateThumbnails', settings.generateThumbnails.toString());
      formData.append('enableCDN', settings.enableCDN.toString());

      const response = await fetch('/api/v1/images/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
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
    onError: (error, variables) => {
      setFiles(prev => 
        prev.map(f => 
          f.id === variables.file.id 
            ? { ...f, status: 'error', error: error.message, progress: 0 }
            : f
        )
      );
      toast({
        title: "Upload Failed",
        description: error.message,
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
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < pendingFiles.length; i++) {
      const file = pendingFiles[i];
      
      setFiles(prev => 
        prev.map(f => 
          f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
        )
      );

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setFiles(prev => 
          prev.map(f => {
            if (f.id === file.id && f.status === 'uploading' && f.progress < 90) {
              return { ...f, progress: f.progress + 10 };
            }
            return f;
          })
        );
      }, 200);

      try {
        await uploadMutation.mutateAsync({ file, settings: uploadSettings });
        clearInterval(progressInterval);
        setUploadProgress(((i + 1) / pendingFiles.length) * 100);
      } catch (error) {
        clearInterval(progressInterval);
      }
    }

    setUploading(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

  return (
    <div className="space-y-6">
      {/* Upload Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="privacy">Privacy Setting</Label>
              <Select 
                value={uploadSettings.privacy} 
                onValueChange={(value: 'public' | 'private') => setUploadSettings({ 
                  ...uploadSettings, 
                  privacy: value 
                })}
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

            <div>
              <Label htmlFor="quality">Quality ({uploadSettings.quality}%)</Label>
              <Input
                type="range"
                min="10"
                max="100"
                step="10"
                value={uploadSettings.quality}
                onChange={(e) => setUploadSettings({ 
                  ...uploadSettings, 
                  quality: parseInt(e.target.value) 
                })}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="nature, landscape, outdoor"
                value={uploadSettings.tags}
                onChange={(e) => setUploadSettings({ 
                  ...uploadSettings, 
                  tags: e.target.value 
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="format">Format</Label>
              <Select 
                value={uploadSettings.format} 
                onValueChange={(value) => setUploadSettings({ 
                  ...uploadSettings, 
                  format: value 
                })}
              >
                <SelectTrigger>
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
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                placeholder="Auto"
                value={uploadSettings.width}
                onChange={(e) => setUploadSettings({ 
                  ...uploadSettings, 
                  width: e.target.value 
                })}
              />
            </div>

            <div>
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number"
                placeholder="Auto"
                value={uploadSettings.height}
                onChange={(e) => setUploadSettings({ 
                  ...uploadSettings, 
                  height: e.target.value 
                })}
              />
            </div>
          </div>

          <div className="space-y-3">
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
          </div>
        </CardContent>
      </Card>

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
                <span>•</span>
                <span>Up to 10 files</span>
              </div>
            </div>
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
                  disabled={uploading}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {files.map((file) => (
                <div 
                  key={file.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <FileImage className="w-8 h-8 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <Badge variant={uploadSettings.privacy === 'public' ? 'default' : 'secondary'}>
                          {uploadSettings.privacy}
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
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
