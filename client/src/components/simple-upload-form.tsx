import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Upload, X, ImageIcon, Settings, Eye, Download, FolderPlus, CreditCard, Star, Zap, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPayment, setShowPayment] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folder, setFolder] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [altText, setAltText] = useState('');
  const [tags, setTags] = useState('');

  // Advanced parameters
  const [quality, setQuality] = useState([85]);
  const [format, setFormat] = useState('auto');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [fit, setFit] = useState('cover');
  const [position, setPosition] = useState('center');
  const [blur, setBlur] = useState([0]);
  const [sharpen, setSharpen] = useState(false);
  const [brightness, setBrightness] = useState([1]);
  const [contrast, setContrast] = useState([1]);
  const [saturation, setSaturation] = useState([1]);
  const [progressive, setProgressive] = useState(true);
  const [stripMetadata, setStripMetadata] = useState(true);
  const [cacheTtl, setCacheTtl] = useState('31536000');
  const [watermark, setWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkOpacity, setWatermarkOpacity] = useState([50]);
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');
  const [autoBackup, setAutoBackup] = useState(false);
  const [encryption, setEncryption] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [downloadLimit, setDownloadLimit] = useState('');
  const [geoRestriction, setGeoRestriction] = useState('');

  // Handle paste functionality
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        onDrop(imageFiles);
        toast({
          title: "Images pasted",
          description: `${imageFiles.length} image(s) added from clipboard.`,
        });
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

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
      formData.append('title', title);
      formData.append('description', description);
      formData.append('altText', altText);
      formData.append('tags', tags);
      formData.append('folder', folder);
      formData.append('isPublic', isPublic.toString());


      // Advanced parameters
      formData.append('quality', quality[0].toString());
      formData.append('format', format);
      if (width) formData.append('width', width);
      if (height) formData.append('height', height);
      formData.append('fit', fit);
      formData.append('position', position);
      formData.append('blur', blur[0].toString());
      formData.append('sharpen', sharpen.toString());
      formData.append('brightness', brightness[0].toString());
      formData.append('contrast', contrast[0].toString());
      formData.append('saturation', saturation[0].toString());
      formData.append('progressive', progressive.toString());
      formData.append('stripMetadata', stripMetadata.toString());
      formData.append('cacheTtl', cacheTtl);
      formData.append('watermark', watermark.toString());
      if (watermark && watermarkText) {
        formData.append('watermarkText', watermarkText);
        formData.append('watermarkOpacity', watermarkOpacity[0].toString());
        formData.append('watermarkPosition', watermarkPosition);
      }
      formData.append('autoBackup', autoBackup.toString());
      formData.append('encryption', encryption.toString());
      if (expiryDate) formData.append('expiryDate', expiryDate);
      if (downloadLimit) formData.append('downloadLimit', downloadLimit);
      if (geoRestriction) formData.append('geoRestriction', geoRestriction);

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

  const resetForm = () => {
    setFiles([]);
    setTitle('');
    setDescription('');
    setFolder('');
    setIsPublic(true);
    setAltText('');
    setTags('');
    setQuality([85]);
    setFormat('auto');
    setWidth('');
    setHeight('');
    setUploadProgress(0);
    setIsUploading(false); // Corrected from setUploading to setIsUploading
  };

  const handlePayment = async (provider: 'payu' | 'paypal' | 'stripe') => {
    try {
      const response = await fetch('/api/v1/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          provider,
          amount: files.length * 10, // $0.10 per file
          currency: 'USD',
          description: `Upload ${files.length} image(s)`,
          returnUrl: `${window.location.origin}/dashboard`,
          cancelUrl: `${window.location.origin}/upload`,
        }),
      });

      if (!response.ok) throw new Error('Payment creation failed');

      const { paymentUrl, orderId } = await response.json();

      if (provider === 'payu') {
        // Redirect to PayU
        window.location.href = paymentUrl;
      } else if (provider === 'paypal') {
        // Redirect to PayPal
        window.location.href = paymentUrl;
      } else if (provider === 'stripe') {
        // Handle Stripe checkout
        window.location.href = paymentUrl;
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    }
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
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer group"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="relative">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4 group-hover:text-blue-500 transition-colors" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                +
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Drop images here or click to browse
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Support JPG, PNG, GIF, WebP, AVIF up to 50MB each
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              💡 Pro tip: You can also paste images directly from your clipboard (Ctrl+V)
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="text-lg font-bold text-blue-600">25+</div>
                <div className="text-xs text-blue-800 dark:text-blue-200">Transform Options</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                <div className="text-lg font-bold text-emerald-600">Global</div>
                <div className="text-xs text-emerald-800 dark:text-emerald-200">CDN Delivery</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <div className="text-lg font-bold text-purple-600">Auto</div>
                <div className="text-xs text-purple-800 dark:text-purple-200">Optimization</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                <div className="text-lg font-bold text-amber-600">Instant</div>
                <div className="text-xs text-amber-800 dark:text-amber-200">Processing</div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter image title..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter image description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="folder">Folder</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="folder"
                      value={folder}
                      onChange={(e) => setFolder(e.target.value)}
                      placeholder="Optional folder..."
                    />
                    <Button variant="outline" size="icon" type="button">
                      <FolderPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="altText">Alt Text</Label>
                <Input
                  id="altText"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Accessibility description..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="isPublic">Make images publicly accessible</Label>
              </div>
            </TabsContent>

            <TabsContent value="optimization" className="space-y-4">
              <div className="space-y-2">
                <Label>Quality: {quality[0]}%</Label>
                <Slider
                  value={quality}
                  onValueChange={setQuality}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                      <SelectItem value="avif">AVIF</SelectItem>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fit Mode</Label>
                  <Select value={fit} onValueChange={setFit}>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="Auto"
                    type="number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Auto"
                    type="number"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="progressive"
                    checked={progressive}
                    onCheckedChange={setProgressive}
                  />
                  <Label htmlFor="progressive">Progressive JPEG</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="stripMetadata"
                    checked={stripMetadata}
                    onCheckedChange={setStripMetadata}
                  />
                  <Label htmlFor="stripMetadata">Strip Metadata</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="effects" className="space-y-4">
              <div className="space-y-2">
                <Label>Blur: {blur[0]}px</Label>
                <Slider
                  value={blur}
                  onValueChange={setBlur}
                  max={50}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Brightness: {brightness[0].toFixed(1)}</Label>
                <Slider
                  value={brightness}
                  onValueChange={setBrightness}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Contrast: {contrast[0].toFixed(1)}</Label>
                <Slider
                  value={contrast}
                  onValueChange={setContrast}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Saturation: {saturation[0].toFixed(1)}</Label>
                <Slider
                  value={saturation}
                  onValueChange={setSaturation}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="sharpen"
                  checked={sharpen}
                  onCheckedChange={setSharpen}
                />
                <Label htmlFor="sharpen">Enable Sharpening</Label>
              </div>
            </TabsContent>

            <TabsContent value="premium" className="space-y-4">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span className="font-medium text-amber-800 dark:text-amber-200">Premium Features</span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Unlock advanced features with our premium plans
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="watermark"
                    checked={watermark}
                    onCheckedChange={setWatermark}
                  />
                  <Label htmlFor="watermark">Add Watermark</Label>
                  <Badge variant="secondary">Premium</Badge>
                </div>

                {watermark && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="watermarkText">Watermark Text</Label>
                      <Input
                        id="watermarkText"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="© Your Company"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Opacity: {watermarkOpacity[0]}%</Label>
                      <Slider
                        value={watermarkOpacity}
                        onValueChange={setWatermarkOpacity}
                        max={100}
                        min={10}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Select value={watermarkPosition} onValueChange={setWatermarkPosition}>
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
                  </>
                )}

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoBackup"
                      checked={autoBackup}
                      onCheckedChange={setAutoBackup}
                    />
                    <Label htmlFor="autoBackup">Auto Backup</Label>
                    <Badge variant="secondary">Premium</Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="encryption"
                      checked={encryption}
                      onCheckedChange={setEncryption}
                    />
                    <Label htmlFor="encryption">End-to-End Encryption</Label>
                    <Badge variant="secondary">Premium</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="downloadLimit">Download Limit</Label>
                    <Input
                      id="downloadLimit"
                      type="number"
                      value={downloadLimit}
                      onChange={(e) => setDownloadLimit(e.target.value)}
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="geoRestriction">Geo Restriction</Label>
                  <Input
                    id="geoRestriction"
                    value={geoRestriction}
                    onChange={(e) => setGeoRestriction(e.target.value)}
                    placeholder="US,CA,IN (country codes)"
                  />
                </div>
              </div>

              {/* Payment Options */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Payment Options</h4>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => handlePayment('payu')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    PayU (India) - ₹{(files.length * 10 * 75).toFixed(0)}
                  </Button>
                  <Button
                    onClick={() => handlePayment('paypal')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    PayPal - ${(files.length * 10).toFixed(2)}
                  </Button>
                  <Button
                    onClick={() => handlePayment('stripe')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Credit/Debit Card - ${(files.length * 10).toFixed(2)}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Premium features require payment. $0.10 per image.
                </p>
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

          {/* Bulk Actions */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 justify-between items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{files.length} file(s) selected</span>
                  <Badge variant="outline">
                    {(files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB total
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFiles([])}
                    disabled={isUploading}
                  >
                    Clear All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Apply current settings to all files
                      toast({
                        title: "Settings Applied",
                        description: "Current settings will be applied to all files.",
                      });
                    }}
                    disabled={isUploading}
                  >
                    Apply Settings to All
                  </Button>
                </div>
              </div>

              <Button
                onClick={uploadFiles}
                disabled={isUploading || files.every(f => f.status === 'completed')}
                className="w-full relative overflow-hidden"
                size="lg"
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing {files.filter(f => f.status === 'uploading').length} of {files.length} files...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload {files.length} Image{files.length > 1 ? 's' : ''}
                    {files.length > 1 && (
                      <Badge variant="secondary" className="ml-2">
                        Batch Upload
                      </Badge>
                    )}
                  </div>
                )}
              </Button>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {files.filter(f => f.status === 'completed').length} / {files.length} completed
                    </span>
                  </div>
                  <Progress
                    value={(files.filter(f => f.status === 'completed').length / files.length) * 100}
                    className="w-full"
                  />
                </div>
              )}

              {/* Quick Actions for completed uploads */}
              {files.some(f => f.status === 'completed') && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-emerald-900 dark:text-emerald-100 mb-2">
                    🎉 Upload Successful!
                  </h4>
                  <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-3">
                    Your images have been uploaded and optimized. What would you like to do next?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/dashboard">
                        <Eye className="w-4 h-4 mr-1" />
                        View in Dashboard
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/api-usage">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        View Analytics
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        resetForm();
                        toast({
                          title: "Ready for next upload",
                          description: "Form has been reset for your next batch.",
                        });
                      }}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Upload More
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}