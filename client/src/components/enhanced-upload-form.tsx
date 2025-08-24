
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import {
  Upload,
  X,
  Image as ImageIcon,
  FileImage,
  AlertCircle,
  Check
} from 'lucide-react';

interface UploadFile extends File {
  id: string;
  preview?: string;
  progress?: number;
  status?: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export function EnhancedUploadForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [folder, setFolder] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, folderName }: { file: UploadFile; folderName: string }) => {
      const formData = new FormData();
      formData.append('image', file);
      if (folderName) formData.append('folder', folderName);

      return apiRequest('POST', '/api/upload', formData, {
        headers: {
          // Remove Content-Type to let browser set boundary for FormData
        },
      });
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
          
          await uploadMutation.mutateAsync({ file, folderName: folder });
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
              Supports: JPEG, PNG, GIF, WebP, SVG (max 10MB each)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Options */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="folder">Folder (optional)</Label>
              <Input
                id="folder"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="Enter folder name"
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {files.length} file{files.length !== 1 ? 's' : ''} ready to upload
              </div>
              <Button
                onClick={uploadFiles}
                disabled={isUploading || files.every(f => f.status === 'completed')}
                className="ml-4"
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
                <Progress value={totalProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Files</h3>
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
                      <Progress value={file.progress || 0} className="h-1 mt-1" />
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
