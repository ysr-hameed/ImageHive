
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Search,
  Code,
  Upload,
  Download,
  Settings,
  Key,
  Globe,
  Zap,
  Shield,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Image,
  Layers,
  Sliders
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import Prism for syntax highlighting
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-typescript';

export default function Docs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize Prism syntax highlighting
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({
      title: "Copied to clipboard",
      description: "Code copied successfully!",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language, id }: { code: string, language: string, id: string }) => (
    <div className="relative">
      <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-t-lg">
        <Badge variant="secondary" className="text-xs">{language}</Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(code, id)}
          className="h-8 w-8 p-0"
        >
          {copiedCode === id ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className="bg-gray-50 dark:bg-slate-900 p-4 rounded-b-lg overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );

  const sidebarItems = [
    { id: "getting-started", title: "Getting Started", icon: BookOpen },
    { id: "upload-forms", title: "Upload Forms", icon: Upload },
    { id: "enhanced-upload", title: "Enhanced Upload", icon: Layers },
    { id: "simple-upload", title: "Simple Upload", icon: Image },
    { id: "basic-upload", title: "Basic Upload", icon: FileText },
    { id: "authentication", title: "Authentication", icon: Key },
    { id: "upload-api", title: "Upload API", icon: Upload },
    { id: "image-api", title: "Image Management", icon: Download },
    { id: "transforms", title: "Image Transforms", icon: Sliders },
    { id: "webhooks", title: "Webhooks", icon: Globe },
    { id: "sdks", title: "SDKs & Libraries", icon: Code },
    { id: "rate-limits", title: "Rate Limits", icon: Shield },
    { id: "examples", title: "Code Examples", icon: Zap },
  ];

  const [activeSection, setActiveSection] = useState("getting-started");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700">
          <div className="flex-1 flex flex-col min-h-0 pt-5 pb-4">
            <div className="flex items-center flex-shrink-0 px-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Documentation</h1>
            </div>
            <div className="mt-5 flex-1 px-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeSection === item.id
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white"
                    }`}
                  >
                    <item.icon className="mr-3 w-5 h-5" />
                    {item.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:pl-64 flex flex-col w-0 flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Getting Started */}
            {activeSection === "getting-started" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Getting Started</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Welcome to ImageVault API documentation. Get started with our powerful image hosting and management platform.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Start</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">1. Get Your API Key</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        First, you'll need to get your API key from the dashboard.
                      </p>
                      <Button asChild>
                        <a href="/api-keys">Get API Key</a>
                      </Button>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">2. Base URL</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">All API requests should be made to:</p>
                      <CodeBlock 
                        code="https://api.imagevault.io/v1"
                        language="url"
                        id="base-url"
                      />
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">3. Authentication</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">Include your API key in the Authorization header:</p>
                      <CodeBlock 
                        code={`Authorization: Bearer YOUR_API_KEY`}
                        language="http"
                        id="auth-header"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Upload Forms Overview */}
            {activeSection === "upload-forms" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Upload Forms</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    ImageVault provides multiple upload form components to suit different needs and complexity levels.
                  </p>
                </div>

                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        Enhanced Upload Form
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        The most feature-rich upload component with advanced transformations, effects, and premium features.
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Features:</h4>
                          <ul className="text-xs space-y-1 text-gray-600">
                            <li>• Drag & drop upload</li>
                            <li>• Image transformations</li>
                            <li>• Effects & filters</li>
                            <li>• Premium features</li>
                            <li>• Metadata management</li>
                            <li>• Real-time preview</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Use Cases:</h4>
                          <ul className="text-xs space-y-1 text-gray-600">
                            <li>• Professional workflows</li>
                            <li>• Advanced image editing</li>
                            <li>• Bulk uploads</li>
                            <li>• Premium subscribers</li>
                          </ul>
                        </div>
                      </div>
                      <Button asChild size="sm">
                        <a href="#enhanced-upload">View Details</a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="w-5 h-5" />
                        Simple Upload Form
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        A streamlined upload form with essential features and clean interface.
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Features:</h4>
                          <ul className="text-xs space-y-1 text-gray-600">
                            <li>• Drag & drop upload</li>
                            <li>• Basic transformations</li>
                            <li>• Quality settings</li>
                            <li>• Format conversion</li>
                            <li>• Progress tracking</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Use Cases:</h4>
                          <ul className="text-xs space-y-1 text-gray-600">
                            <li>• General purpose uploads</li>
                            <li>• Standard users</li>
                            <li>• Quick image processing</li>
                            <li>• Web integration</li>
                          </ul>
                        </div>
                      </div>
                      <Button asChild size="sm">
                        <a href="#simple-upload">View Details</a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Basic Upload Form
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        A minimal upload form with core functionality for simple use cases.
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Features:</h4>
                          <ul className="text-xs space-y-1 text-gray-600">
                            <li>• File selection</li>
                            <li>• Basic metadata</li>
                            <li>• Privacy settings</li>
                            <li>• Upload progress</li>
                            <li>• Error handling</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Use Cases:</h4>
                          <ul className="text-xs space-y-1 text-gray-600">
                            <li>• Basic uploads</li>
                            <li>• Free tier users</li>
                            <li>• Minimal interfaces</li>
                            <li>• Quick prototyping</li>
                          </ul>
                        </div>
                      </div>
                      <Button asChild size="sm">
                        <a href="#basic-upload">View Details</a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Enhanced Upload Form */}
            {activeSection === "enhanced-upload" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Enhanced Upload Form</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    The most comprehensive upload component with advanced features for professional workflows.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Component Import</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock 
                      code={`import { EnhancedUploadForm } from '@/components/enhanced-upload-form';

function MyPage() {
  return (
    <div>
      <EnhancedUploadForm />
    </div>
  );
}`}
                      language="typescript"
                      id="enhanced-import"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Features & Tabs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Metadata Tab</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Image title and custom filename</li>
                        <li>• Folder organization</li>
                        <li>• Alt text for accessibility</li>
                        <li>• Tags and descriptions</li>
                        <li>• Privacy settings</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Transforms Tab</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Width and height resizing</li>
                        <li>• Format conversion (JPEG, PNG, WebP, AVIF)</li>
                        <li>• Quality adjustment (1-100%)</li>
                        <li>• Rotation controls</li>
                        <li>• Blur, brightness, contrast, saturation</li>
                        <li>• Grayscale and sharpen effects</li>
                        <li>• Watermark application (Pro/Enterprise)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Optimization Tab</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Compression strategies (lossless, balanced, aggressive)</li>
                        <li>• Color space selection (sRGB, Adobe RGB, P3, Rec.2020)</li>
                        <li>• DPI settings (72-300)</li>
                        <li>• Auto enhancement</li>
                        <li>• Thumbnail generation</li>
                        <li>• Progressive loading</li>
                        <li>• EXIF data stripping</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Effects Tab</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Blur effects (0-100%)</li>
                        <li>• Brightness adjustment (0-200%)</li>
                        <li>• Contrast control (0-200%)</li>
                        <li>• Saturation tuning (0-200%)</li>
                        <li>• Sharpen filter</li>
                        <li>• Grayscale conversion</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Premium Tab</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Custom watermark text</li>
                        <li>• Watermark opacity (0-100%)</li>
                        <li>• Watermark positioning</li>
                        <li>• Auto backup to cloud</li>
                        <li>• File encryption</li>
                        <li>• Priority processing</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>API Integration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      The Enhanced Upload Form automatically handles all API requests to:
                    </p>
                    <CodeBlock 
                      code={`POST /api/v1/images/upload

FormData includes:
- image: File blob
- title: Image title
- description: Image description
- folder: Folder path
- altText: Alternative text
- tags: Comma-separated tags
- isPublic: Privacy setting
- transform_*: Transform parameters
- meta_*: Metadata fields
- watermark_*: Watermark settings (Pro/Enterprise)`}
                      language="http"
                      id="enhanced-api"
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Simple Upload Form */}
            {activeSection === "simple-upload" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Simple Upload Form</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    A streamlined upload component with essential features and clean interface.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Component Import</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock 
                      code={`import SimpleUploadForm from '@/components/simple-upload-form';

function MyPage() {
  return (
    <div>
      <SimpleUploadForm />
    </div>
  );
}`}
                      language="typescript"
                      id="simple-import"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Features & Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Basic Tab</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Image title</li>
                        <li>• Description</li>
                        <li>• Privacy settings (public/private)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Optimization Tab</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Output format selection</li>
                        <li>• Quality slider (10-100%)</li>
                        <li>• Resize dimensions (optional)</li>
                        <li>• Auto optimization toggle</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Effects Tab</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Progressive JPEG</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Premium Tab</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Watermark toggle</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upload Handling</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock 
                      code={`// File validation
accept: 'image/*' with extensions: .jpeg, .jpg, .png, .gif, .webp, .bmp, .tiff, .avif
maxSize: 10MB per file
multiple: true

// API endpoint
POST /api/v1/images/upload

// FormData structure
formData.append('image', file);
formData.append('title', title || file.name);
formData.append('description', description);
formData.append('privacy', privacy);
formData.append('quality', quality.toString());
formData.append('format', format);
formData.append('width', width);
formData.append('height', height);
formData.append('progressive', progressive.toString());
formData.append('watermark', watermark.toString());
formData.append('autoOptimize', autoOptimize.toString());`}
                      language="javascript"
                      id="simple-handling"
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Basic Upload Form */}
            {activeSection === "basic-upload" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Basic Upload Form</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    A minimal upload form with core functionality for simple use cases.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Component Import</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock 
                      code={`import UploadForm from '@/components/upload-form';

function MyPage() {
  return (
    <div>
      <UploadForm />
    </div>
  );
}`}
                      language="typescript"
                      id="basic-import"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Features & Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Basic Settings Tab</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Privacy setting (public/private)</li>
                        <li>• Description</li>
                        <li>• Alt text for accessibility</li>
                        <li>• Tags (comma-separated)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Transform Tab</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Output format selection</li>
                        <li>• Quality slider (10-100%)</li>
                        <li>• Width and height (optional)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Advanced Tab</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Auto optimization</li>
                        <li>• Generate thumbnails</li>
                        <li>• Preserve EXIF data</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>File Handling</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock 
                      code={`// File validation
accept: 'image/*' with extensions: .jpeg, .jpg, .png, .gif, .webp, .svg, .bmp, .tiff, .avif
maxFiles: 10
maxSize: 50MB per file
multiple: true

// Drag and drop support
onDrop: Accepts multiple files
onDropRejected: Shows error messages for invalid files

// Upload status tracking
- pending: File selected, waiting to upload
- uploading: Currently uploading with progress
- completed: Successfully uploaded
- error: Upload failed with error message`}
                      language="javascript"
                      id="basic-handling"
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Image Transforms */}
            {activeSection === "transforms" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Image Transforms</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    All upload forms support various image transformations and optimizations.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Available Transformations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Resize & Format</h3>
                      <CodeBlock 
                        code={`// Resize parameters
width: number (1-4000px)
height: number (1-4000px)
fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'

// Format conversion
format: 'auto' | 'jpeg' | 'png' | 'webp' | 'avif'
quality: number (1-100)

// Example API call
formData.append('width', '800');
formData.append('height', '600');
formData.append('format', 'webp');
formData.append('quality', '85');`}
                        language="javascript"
                        id="resize-transforms"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Color & Effects</h3>
                      <CodeBlock 
                        code={`// Color adjustments
brightness: number (0.1-3.0, default: 1.0)
contrast: number (0.1-3.0, default: 1.0)
saturation: number (0.0-3.0, default: 1.0)
blur: number (0.3-1000, default: 0)

// Effects
grayscale: boolean
sharpen: boolean
rotate: number (0-360 degrees)

// Example usage
formData.append('brightness', '1.2');
formData.append('contrast', '1.1');
formData.append('saturation', '1.3');
formData.append('blur', '2');
formData.append('grayscale', 'true');`}
                        language="javascript"
                        id="effects-transforms"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Premium Features</h3>
                      <CodeBlock 
                        code={`// Watermark (Pro/Enterprise only)
watermark: boolean
watermark_text: string
watermark_opacity: number (0-100)
watermark_position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'

// Advanced options
auto_backup: boolean
encryption: boolean

// Example usage
formData.append('watermark', 'true');
formData.append('watermark_text', 'My Company');
formData.append('watermark_opacity', '50');
formData.append('watermark_position', 'bottom-right');`}
                        language="javascript"
                        id="premium-transforms"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Transform URL API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You can also apply transformations via URL parameters after upload:
                    </p>
                    <CodeBlock 
                      code={`// Base image URL
https://cdn.imagevault.io/images/12345.jpg

// Resize to 400x300
https://cdn.imagevault.io/images/12345.jpg?w=400&h=300

// Convert to WebP with 85% quality
https://cdn.imagevault.io/images/12345.jpg?format=webp&quality=85

// Apply blur and brightness
https://cdn.imagevault.io/images/12345.jpg?blur=5&brightness=1.2

// Combine multiple transforms
https://cdn.imagevault.io/images/12345.jpg?w=600&h=400&format=webp&quality=90&fit=crop`}
                      language="url"
                      id="url-transforms"
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Authentication */}
            {activeSection === "authentication" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Authentication</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Learn how to authenticate your API requests securely.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>API Key Authentication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      ImageVault uses API key authentication. Include your API key in the Authorization header of every request.
                    </p>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Example Request</h3>
                      <CodeBlock 
                        code={`curl -X POST "https://api.imagevault.io/v1/images/upload" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "image=@/path/to/image.jpg"`}
                        language="bash"
                        id="auth-example"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">JavaScript Example</h3>
                      <CodeBlock 
                        code={`const response = await fetch('/api/v1/images/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData,
  credentials: 'include'
});

const data = await response.json();`}
                        language="javascript"
                        id="auth-js"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Upload API */}
            {activeSection === "upload-api" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Upload API</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Upload images to ImageVault using our RESTful API.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Upload Single Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">POST</Badge>
                      <code className="ml-2 text-sm bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                        /api/v1/images/upload
                      </code>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Request</h3>
                      <CodeBlock 
                        code={`curl -X POST "/api/v1/images/upload" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@/path/to/image.jpg" \\
  -F "title=My Image" \\
  -F "description=A beautiful image" \\
  -F "tags=nature,landscape" \\
  -F "isPublic=true" \\
  -F "quality=85" \\
  -F "format=webp"`}
                        language="bash"
                        id="upload-curl"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">JavaScript Example</h3>
                      <CodeBlock 
                        code={`const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('title', 'My Image');
formData.append('description', 'A beautiful image');
formData.append('tags', 'nature,landscape');
formData.append('isPublic', 'true');
formData.append('quality', '85');
formData.append('format', 'webp');

const response = await fetch('/api/v1/images/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData,
  credentials: 'include'
});

const result = await response.json();`}
                        language="javascript"
                        id="upload-js"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Response</h3>
                      <CodeBlock 
                        code={`{
  "success": true,
  "data": {
    "id": "img_12345",
    "url": "https://cdn.imagevault.io/images/12345.jpg",
    "thumbnail": "https://cdn.imagevault.io/thumbnails/12345.jpg",
    "title": "My Image",
    "description": "A beautiful image",
    "tags": ["nature", "landscape"],
    "size": 1024768,
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "created_at": "2024-01-15T10:30:00Z"
  }
}`}
                        language="json"
                        id="upload-response"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Image Management */}
            {activeSection === "image-api" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Image Management</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Manage your uploaded images with our comprehensive API.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>List Images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">GET</Badge>
                      <code className="ml-2 text-sm bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                        /api/v1/images
                      </code>
                    </div>

                    <CodeBlock 
                      code={`curl -X GET "/api/v1/images?page=1&limit=20" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                      language="bash"
                      id="list-images"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Get Single Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">GET</Badge>
                      <code className="ml-2 text-sm bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                        /api/v1/images/:id
                      </code>
                    </div>

                    <CodeBlock 
                      code={`curl -X GET "/api/v1/images/img_12345" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                      language="bash"
                      id="get-image"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Delete Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Badge variant="destructive" className="mb-2">DELETE</Badge>
                      <code className="ml-2 text-sm bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                        /api/v1/images/:id
                      </code>
                    </div>

                    <CodeBlock 
                      code={`curl -X DELETE "/api/v1/images/img_12345" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                      language="bash"
                      id="delete-image"
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* SDKs */}
            {activeSection === "sdks" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">SDKs & Libraries</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Official SDKs and community libraries for popular programming languages.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Code className="w-5 h-5 mr-2" />
                        JavaScript SDK
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Official JavaScript SDK for browser and Node.js environments.
                      </p>
                      <CodeBlock 
                        code="npm install @imagevault/js-sdk"
                        language="bash"
                        id="js-install"
                      />
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <a href="https://github.com/imagevault/js-sdk" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on GitHub
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Code className="w-5 h-5 mr-2" />
                        Python SDK
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Official Python SDK for seamless integration.
                      </p>
                      <CodeBlock 
                        code="pip install imagevault-python"
                        language="bash"
                        id="python-install"
                      />
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <a href="https://github.com/imagevault/python-sdk" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on GitHub
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>JavaScript Usage Example</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock 
                      code={`import { ImageVault } from '@imagevault/js-sdk';

const client = new ImageVault({
  apiKey: 'YOUR_API_KEY'
});

// Upload an image
const upload = await client.upload({
  file: fileInput.files[0],
  title: 'My Image',
  tags: ['nature', 'landscape']
});

// Get image details
const image = await client.getImage(upload.id);

// List all images
const images = await client.listImages({
  page: 1,
  limit: 20
});`}
                      language="javascript"
                      id="js-usage"
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Rate Limits */}
            {activeSection === "rate-limits" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Rate Limits</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Understand API rate limits and how to handle them.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Rate Limit Headers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      Every API response includes rate limit information in the headers:
                    </p>
                    <CodeBlock 
                      code={`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200`}
                      language="http"
                      id="rate-headers"
                    />
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Free Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-blue-600">1,000</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">requests per hour</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pro Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-purple-600">10,000</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">requests per hour</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Enterprise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-emerald-600">100,000+</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">custom limits</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Examples */}
            {activeSection === "examples" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Code Examples</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Practical examples for common use cases with all upload forms.
                  </p>
                </div>

                <Tabs defaultValue="upload" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="upload">Image Upload</TabsTrigger>
                    <TabsTrigger value="gallery">Gallery Widget</TabsTrigger>
                    <TabsTrigger value="resize">Image Resizing</TabsTrigger>
                    <TabsTrigger value="integration">Form Integration</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload">
                    <Card>
                      <CardHeader>
                        <CardTitle>Complete Upload Example</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock 
                          code={`<!DOCTYPE html>
<html>
<head>
    <title>ImageVault Upload</title>
</head>
<body>
    <input type="file" id="fileInput" accept="image/*" multiple>
    <button onclick="uploadImage()">Upload</button>

    <div id="result"></div>

    <script>
    async function uploadImage() {
        const fileInput = document.getElementById('fileInput');
        const resultDiv = document.getElementById('result');

        if (!fileInput.files[0]) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        formData.append('title', 'My Image');
        formData.append('description', 'Uploaded via API');
        formData.append('isPublic', 'true');

        try {
            const response = await fetch('/api/v1/images/upload', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer YOUR_API_KEY'
                },
                body: formData,
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                resultDiv.innerHTML = \`
                    <h3>Upload Successful!</h3>
                    <img src="\${result.data.thumbnail}" alt="Uploaded image">
                    <p>Image ID: \${result.data.id}</p>
                    <p>URL: <a href="\${result.data.url}" target="_blank">\${result.data.url}</a></p>
                \`;
            } else {
                resultDiv.innerHTML = \`<p>Upload failed: \${result.message}</p>\`;
            }
        } catch (error) {
            resultDiv.innerHTML = \`<p>Error: \${error.message}</p>\`;
        }
    }
    </script>
</body>
</html>`}
                          language="html"
                          id="upload-example"
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="integration">
                    <Card>
                      <CardHeader>
                        <CardTitle>React Integration with Upload Forms</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock 
                          code={`import React from 'react';
import { EnhancedUploadForm } from '@/components/enhanced-upload-form';
import SimpleUploadForm from '@/components/simple-upload-form';
import UploadForm from '@/components/upload-form';

function MyUploadPage() {
  const [uploadMode, setUploadMode] = React.useState('enhanced');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Image Upload</h1>
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setUploadMode('enhanced')}
            className={\`px-4 py-2 rounded \${uploadMode === 'enhanced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}\`}
          >
            Enhanced
          </button>
          <button 
            onClick={() => setUploadMode('simple')}
            className={\`px-4 py-2 rounded \${uploadMode === 'simple' ? 'bg-blue-500 text-white' : 'bg-gray-200'}\`}
          >
            Simple
          </button>
          <button 
            onClick={() => setUploadMode('basic')}
            className={\`px-4 py-2 rounded \${uploadMode === 'basic' ? 'bg-blue-500 text-white' : 'bg-gray-200'}\`}
          >
            Basic
          </button>
        </div>
      </div>

      {uploadMode === 'enhanced' && <EnhancedUploadForm />}
      {uploadMode === 'simple' && <SimpleUploadForm />}
      {uploadMode === 'basic' && <UploadForm />}
    </div>
  );
}

export default MyUploadPage;`}
                          language="typescript"
                          id="integration-example"
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="gallery">
                    <Card>
                      <CardHeader>
                        <CardTitle>Image Gallery Widget</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock 
                          code={`class ImageVaultGallery {
    constructor(apiKey, containerId) {
        this.apiKey = apiKey;
        this.container = document.getElementById(containerId);
        this.baseUrl = '/api/v1';
    }

    async loadImages(page = 1, limit = 12) {
        try {
            const response = await fetch(\`\${this.baseUrl}/images?page=\${page}&limit=\${limit}\`, {
                headers: {
                    'Authorization': \`Bearer \${this.apiKey}\`
                },
                credentials: 'include'
            });

            const data = await response.json();
            this.renderImages(data.images);
        } catch (error) {
            console.error('Failed to load images:', error);
        }
    }

    renderImages(images) {
        this.container.innerHTML = '';

        images.forEach(image => {
            const imageElement = document.createElement('div');
            imageElement.className = 'gallery-item';
            imageElement.innerHTML = \`
                <img src="\${image.thumbnail}" alt="\${image.title}" 
                     onclick="this.openImage('\${image.url}')">
                <h4>\${image.title}</h4>
                <p>\${image.description}</p>
            \`;

            this.container.appendChild(imageElement);
        });
    }

    openImage(url) {
        window.open(url, '_blank');
    }
}

// Usage
const gallery = new ImageVaultGallery('YOUR_API_KEY', 'gallery-container');
gallery.loadImages();`}
                          language="javascript"
                          id="gallery-example"
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="resize">
                    <Card>
                      <CardHeader>
                        <CardTitle>Dynamic Image Resizing</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock 
                          code={`// ImageVault supports URL-based image transformations
const baseUrl = 'https://cdn.imagevault.io/images/12345.jpg';

// Resize to specific dimensions
const resized = \`\${baseUrl}?w=300&h=200\`;

// Resize maintaining aspect ratio
const resizedRatio = \`\${baseUrl}?w=300\`;

// Create thumbnail
const thumbnail = \`\${baseUrl}?w=150&h=150&fit=crop\`;

// Apply filters
const filtered = \`\${baseUrl}?w=400&blur=5&brightness=1.2\`;

// Convert format
const webp = \`\${baseUrl}?w=400&format=webp\`;

// Combine multiple transformations
const complex = \`\${baseUrl}?w=500&h=300&fit=crop&quality=85&format=webp\`;

// Usage in HTML
document.getElementById('hero-image').src = resized;
document.getElementById('thumbnail').src = thumbnail;`}
                          language="javascript"
                          id="resize-example"
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Webhooks */}
            {activeSection === "webhooks" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Webhooks</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Receive real-time notifications about upload events and image processing.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Available Events</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Upload Events</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• <code>image.uploaded</code> - Image successfully uploaded</li>
                        <li>• <code>image.upload_failed</code> - Image upload failed</li>
                        <li>• <code>image.processing_complete</code> - Image processing finished</li>
                        <li>• <code>image.deleted</code> - Image deleted</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Webhook Payload Example</h3>
                      <CodeBlock 
                        code={`{
  "event": "image.uploaded",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "img_12345",
    "url": "https://cdn.imagevault.io/images/12345.jpg",
    "title": "My Image",
    "user_id": "user_67890",
    "size": 1024768,
    "dimensions": {
      "width": 1920,
      "height": 1080
    }
  }
}`}
                        language="json"
                        id="webhook-payload"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
