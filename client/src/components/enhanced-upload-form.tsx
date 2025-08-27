
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Tag, 
  Eye, 
  EyeOff,
  Folder,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface UploadFile extends File {
  id: string;
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  uploadError?: string;
}

export function EnhancedUploadForm() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({
    folder: '',
    isPublic: true,
    tags: '',
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (fileData: { file: UploadFile; settings: any }) => {
      const formData = new FormData();
      formData.append('image', fileData.file);
      formData.append('title', fileData.settings.title || fileData.file.name);
      formData.append('description', fileData.settings.description || '');
      formData.append('folder', fileData.settings.folder || '');
      formData.append('altText', fileData.settings.altText || '');
      formData.append('tags', fileData.settings.tags || '');
      formData.append('isPublic', fileData.settings.isPublic.toString());

      const response = await fetch('/api/v1/images/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Update file status
      setFiles(prev => prev.map(f => 
        f.id === variables.file.id 
          ? { ...f, uploadStatus: 'success' as const, uploadProgress: 100 }
          : f
      ));
      
      // Refresh images list
      queryClient.invalidateQueries({ queryKey: ['/api/v1/images'] });
      
      toast({
        title: "Upload successful",
        description: `${variables.file.name} has been uploaded successfully.`,
      });
    },
    onError: (error, variables) => {
      // Update file status
      setFiles(prev => prev.map(f => 
        f.id === variables.file.id 
          ? { ...f, uploadStatus: 'error' as const, uploadError: error.message }
          : f
      ));
      
      toast({
        title: "Upload failed",
        description: `Failed to upload ${variables.file.name}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36),
      preview: URL.createObjectURL(file),
      uploadProgress: 0,
      uploadStatus: 'pending' as const,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    multiple: true,
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

  const updateFileSettings = (fileId: string, settings: Partial<any>) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, ...settings }
        : f
    ));
  };

  const handleUploadAll = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    // Reset all files to pending status
    setFiles(prev => prev.map(f => ({ 
      ...f, 
      uploadStatus: 'pending' as const, 
      uploadProgress: 0,
      uploadError: undefined 
    })));

    try {
      // Upload files sequentially
      for (const file of files) {
        if (file.uploadStatus === 'success') continue;
        
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, uploadStatus: 'uploading' as const, uploadProgress: 25 }
            : f
        ));

        const settings = {
          title: (file as any).title || file.name,
          description: (file as any).description || '',
          folder: (file as any).folder || globalSettings.folder,
          altText: (file as any).altText || '',
          tags: (file as any).tags || globalSettings.tags,
          isPublic: (file as any).isPublic ?? globalSettings.isPublic,
        };

        await uploadMutation.mutateAsync({ file, settings });
      }
      
      toast({
        title: "All uploads completed",
        description: `Successfully uploaded ${files.length} image(s).`,
      });
      
      // Clear files after successful upload
      setTimeout(() => {
        setFiles([]);
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: UploadFile['uploadStatus']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <ImageIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-lg text-blue-600 dark:text-blue-400">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Supports: PNG, JPG, JPEG, GIF, WebP, SVG
            </p>
          </div>
        )}
      </div>

      {/* Global Settings */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Global Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="global-folder">Folder</Label>
                <div className="relative">
                  <Folder className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="global-folder"
                    placeholder="e.g., photos/2024"
                    value={globalSettings.folder}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, folder: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="global-tags">Tags</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="global-tags"
                    placeholder="tag1, tag2, tag3"
                    value={globalSettings.tags}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, tags: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="global-public"
                  checked={globalSettings.isPublic}
                  onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="global-public" className="flex items-center">
                  {globalSettings.isPublic ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                  {globalSettings.isPublic ? 'Public' : 'Private'}
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Files to Upload ({files.length})
            </h3>
            <Button 
              onClick={handleUploadAll}
              disabled={isUploading || files.every(f => f.uploadStatus === 'success')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload All
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {files.map((file) => (
              <Card key={file.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Preview */}
                    <div className="flex-shrink-0">
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* File Details */}
                    <div className="flex-grow space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(file.uploadStatus)}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {file.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          disabled={file.uploadStatus === 'uploading'}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Progress Bar */}
                      {file.uploadStatus === 'uploading' && (
                        <Progress value={file.uploadProgress} className="w-full" />
                      )}

                      {/* Error Message */}
                      {file.uploadStatus === 'error' && file.uploadError && (
                        <div className="text-sm text-red-600 dark:text-red-400">
                          Error: {file.uploadError}
                        </div>
                      )}

                      {/* Individual File Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Title</Label>
                          <Input
                            placeholder="Image title"
                            value={(file as any).title || ''}
                            onChange={(e) => updateFileSettings(file.id, { title: e.target.value })}
                            disabled={file.uploadStatus === 'uploading' || file.uploadStatus === 'success'}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Alt Text</Label>
                          <Input
                            placeholder="Alternative text"
                            value={(file as any).altText || ''}
                            onChange={(e) => updateFileSettings(file.id, { altText: e.target.value })}
                            disabled={file.uploadStatus === 'uploading' || file.uploadStatus === 'success'}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
