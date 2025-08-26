
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen,
  Code2,
  Globe,
  Zap,
  Search,
  Copy,
  ExternalLink,
  Download,
  Upload,
  Eye,
  Trash2,
  Key,
  Shield,
  Clock,
  BarChart3,
  Rocket,
  Database,
  Image as ImageIcon,
  Settings,
  Star,
  CreditCard
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

const codeExamples = {
  javascript: {
    upload: `// Upload an image with advanced processing
const formData = new FormData();
formData.append('image', file);
formData.append('title', 'My awesome image');
formData.append('description', 'High-quality product photo');
formData.append('tags', 'product,ecommerce,photo');
formData.append('isPublic', 'true');
formData.append('quality', '90');
formData.append('format', 'webp');
formData.append('width', '1200');
formData.append('height', '800');
formData.append('watermark', 'true');
formData.append('watermarkText', '© Your Brand');

const response = await fetch('/api/v1/images/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
});

const result = await response.json();
console.log('Optimized image URL:', result.url);
console.log('CDN URL:', result.cdnUrl);
console.log('Analytics:', result.analytics);`,

    fetch: `// Fetch images with filtering and pagination
const response = await fetch('/api/v1/images?page=1&limit=20&search=product&folder=ecommerce', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const data = await response.json();
console.log('Images:', data.images);
console.log('Total:', data.total);
console.log('Has more:', data.hasMore);`,

    analytics: `// Get detailed analytics
const response = await fetch('/api/v1/analytics/usage', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const analytics = await response.json();
console.log('Total views:', analytics.totalViews);
console.log('Bandwidth used:', analytics.bandwidthUsed);
console.log('Top performing images:', analytics.topImages);`,

    transform: `// Transform images on-the-fly via URL
const baseUrl = 'https://your-domain.com/img/abc123';
const transformedUrls = {
  thumbnail: \`\${baseUrl}?w=200&h=200&fit=cover&q=80\`,
  medium: \`\${baseUrl}?w=800&h=600&format=webp\`,
  blurred: \`\${baseUrl}?blur=10&brightness=0.8\`,
  watermarked: \`\${baseUrl}?watermark=true&wm_text=©Brand\`
};`
  },

  python: {
    upload: `import requests
import os

# Upload with advanced processing
def upload_image(file_path, api_key):
    with open(file_path, 'rb') as f:
        files = {'image': f}
        data = {
            'title': 'Product Image',
            'description': 'High-quality product photo',
            'tags': 'product,ecommerce,photo',
            'isPublic': True,
            'quality': 90,
            'format': 'webp',
            'width': 1200,
            'height': 800,
            'watermark': True,
            'watermarkText': '© Your Brand'
        }
        headers = {'Authorization': f'Bearer {api_key}'}

        response = requests.post(
            '/api/v1/images/upload', 
            files=files, 
            data=data, 
            headers=headers
        )

        if response.status_code == 200:
            result = response.json()
            print(f"Uploaded: {result['url']}")
            print(f"CDN URL: {result['cdnUrl']}")
            return result
        else:
            print(f"Error: {response.text}")
            return None

# Usage
result = upload_image('product.jpg', 'your_api_key_here')`,

    sdk: `# Install the ImageVault Python SDK
pip install imagevault-python

from imagevault import ImageVault

# Initialize client
client = ImageVault(api_key='your_api_key')

# Upload with transformations
result = client.upload(
    file_path='image.jpg',
    transformations={
        'width': 1200,
        'height': 800,
        'quality': 90,
        'format': 'webp',
        'watermark': True
    },
    metadata={
        'title': 'My Image',
        'tags': ['product', 'photo']
    }
)

print(f"Image uploaded: {result.url}")`,

    batch: `import requests
import concurrent.futures

def batch_upload(file_paths, api_key):
    def upload_single(file_path):
        with open(file_path, 'rb') as f:
            files = {'image': f}
            headers = {'Authorization': f'Bearer {api_key}'}
            response = requests.post('/api/v1/images/upload', files=files, headers=headers)
            return response.json()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(upload_single, file_paths))
    
    return results

# Upload multiple files in parallel
files = ['img1.jpg', 'img2.png', 'img3.webp']
results = batch_upload(files, 'your_api_key')`
  }
};

export default function ApiDocs() {
  const { isAuthenticated, user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [searchQuery, setSearchQuery] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/v1/images/upload',
      description: 'Upload images with 25+ processing parameters and real-time optimization',
      auth: true,
      category: 'Upload',
      parameters: [
        { name: 'image', type: 'File', required: true, description: 'Image file (JPEG, PNG, WebP, AVIF up to 50MB)' },
        { name: 'title', type: 'String', required: false, description: 'Image title for SEO and organization' },
        { name: 'description', type: 'String', required: false, description: 'Detailed image description' },
        { name: 'tags', type: 'String', required: false, description: 'Comma-separated tags for categorization' },
        { name: 'folder', type: 'String', required: false, description: 'Folder path for organization (e.g., "products/shoes")' },
        { name: 'isPublic', type: 'Boolean', required: false, description: 'Make image publicly accessible (default: true)' },
        { name: 'width', type: 'Number', required: false, description: 'Target width in pixels (auto-scaling)' },
        { name: 'height', type: 'Number', required: false, description: 'Target height in pixels (smart cropping)' },
        { name: 'quality', type: 'Number', required: false, description: 'JPEG/WebP quality (1-100, default: 85)' },
        { name: 'format', type: 'String', required: false, description: 'Output format: auto, jpeg, png, webp, avif' },
        { name: 'fit', type: 'String', required: false, description: 'Resize mode: cover, contain, fill, inside, outside' },
        { name: 'position', type: 'String', required: false, description: 'Crop position: center, top, bottom, left, right' },
        { name: 'blur', type: 'Number', required: false, description: 'Gaussian blur radius (0-50)' },
        { name: 'brightness', type: 'Number', required: false, description: 'Brightness adjustment (0.1-3.0)' },
        { name: 'contrast', type: 'Number', required: false, description: 'Contrast adjustment (0.1-3.0)' },
        { name: 'saturation', type: 'Number', required: false, description: 'Color saturation (0.0-3.0)' },
        { name: 'hue', type: 'Number', required: false, description: 'Hue rotation in degrees (0-360)' },
        { name: 'rotate', type: 'Number', required: false, description: 'Image rotation in degrees' },
        { name: 'grayscale', type: 'Boolean', required: false, description: 'Convert to grayscale' },
        { name: 'sharpen', type: 'Boolean', required: false, description: 'Apply sharpening filter' },
        { name: 'watermark', type: 'Boolean', required: false, description: 'Apply custom watermark (Pro+)' },
        { name: 'watermarkText', type: 'String', required: false, description: 'Watermark text content' },
        { name: 'watermarkOpacity', type: 'Number', required: false, description: 'Watermark opacity (10-100)' },
        { name: 'watermarkPosition', type: 'String', required: false, description: 'Watermark position on image' },
        { name: 'stripMetadata', type: 'Boolean', required: false, description: 'Remove EXIF data (default: true)' },
        { name: 'progressive', type: 'Boolean', required: false, description: 'Generate progressive JPEG' },
        { name: 'autoBackup', type: 'Boolean', required: false, description: 'Enable automatic cloud backup (Pro+)' },
        { name: 'encryption', type: 'Boolean', required: false, description: 'Enable end-to-end encryption (Enterprise)' },
        { name: 'expiryDate', type: 'String', required: false, description: 'Auto-delete date (ISO format)' },
        { name: 'downloadLimit', type: 'Number', required: false, description: 'Maximum download count' },
        { name: 'geoRestriction', type: 'String', required: false, description: 'Comma-separated country codes (US,CA,GB)' }
      ]
    },
    {
      method: 'GET',
      path: '/api/v1/images',
      description: 'List images with advanced filtering, search, and pagination',
      auth: true,
      category: 'Retrieval',
      parameters: [
        { name: 'page', type: 'Number', required: false, description: 'Page number (default: 1)' },
        { name: 'limit', type: 'Number', required: false, description: 'Items per page (1-100, default: 20)' },
        { name: 'search', type: 'String', required: false, description: 'Search in title, description, tags' },
        { name: 'folder', type: 'String', required: false, description: 'Filter by folder path' },
        { name: 'tags', type: 'String', required: false, description: 'Filter by tags (comma-separated)' },
        { name: 'format', type: 'String', required: false, description: 'Filter by image format' },
        { name: 'dateFrom', type: 'String', required: false, description: 'Filter from date (ISO format)' },
        { name: 'dateTo', type: 'String', required: false, description: 'Filter to date (ISO format)' },
        { name: 'sortBy', type: 'String', required: false, description: 'Sort by: createdAt, views, size, name' },
        { name: 'sortOrder', type: 'String', required: false, description: 'Sort order: asc, desc' },
        { name: 'isPublic', type: 'Boolean', required: false, description: 'Filter by privacy setting' }
      ]
    },
    {
      method: 'GET',
      path: '/api/v1/images/{id}',
      description: 'Get detailed image information and metadata',
      auth: true,
      category: 'Retrieval',
      parameters: [
        { name: 'id', type: 'String', required: true, description: 'Unique image identifier' },
        { name: 'includeAnalytics', type: 'Boolean', required: false, description: 'Include view/download statistics' }
      ]
    },
    {
      method: 'GET',
      path: '/img/{id}',
      description: 'Serve optimized images with real-time transformations',
      auth: false,
      category: 'CDN',
      parameters: [
        { name: 'id', type: 'String', required: true, description: 'Image identifier' },
        { name: 'w', type: 'Number', required: false, description: 'Width in pixels' },
        { name: 'h', type: 'Number', required: false, description: 'Height in pixels' },
        { name: 'q', type: 'Number', required: false, description: 'Quality (1-100)' },
        { name: 'format', type: 'String', required: false, description: 'Output format (auto, webp, avif, jpeg, png)' },
        { name: 'fit', type: 'String', required: false, description: 'Resize behavior' },
        { name: 'blur', type: 'Number', required: false, description: 'Blur effect (0-50)' },
        { name: 'brightness', type: 'Number', required: false, description: 'Brightness (0.1-3.0)' },
        { name: 'contrast', type: 'Number', required: false, description: 'Contrast (0.1-3.0)' },
        { name: 'watermark', type: 'Boolean', required: false, description: 'Apply watermark' }
      ]
    },
    {
      method: 'PUT',
      path: '/api/v1/images/{id}',
      description: 'Update image metadata and settings',
      auth: true,
      category: 'Management',
      parameters: [
        { name: 'id', type: 'String', required: true, description: 'Image identifier' },
        { name: 'title', type: 'String', required: false, description: 'Updated title' },
        { name: 'description', type: 'String', required: false, description: 'Updated description' },
        { name: 'tags', type: 'String', required: false, description: 'Updated tags' },
        { name: 'isPublic', type: 'Boolean', required: false, description: 'Update privacy setting' },
        { name: 'folder', type: 'String', required: false, description: 'Move to different folder' }
      ]
    },
    {
      method: 'DELETE',
      path: '/api/v1/images/{id}',
      description: 'Permanently delete an image and all its variants',
      auth: true,
      category: 'Management',
      parameters: [
        { name: 'id', type: 'String', required: true, description: 'Image identifier' },
        { name: 'force', type: 'Boolean', required: false, description: 'Skip trash, delete immediately' }
      ]
    },
    {
      method: 'GET',
      path: '/api/v1/analytics/usage',
      description: 'Get comprehensive usage analytics and insights',
      auth: true,
      category: 'Analytics',
      parameters: [
        { name: 'period', type: 'String', required: false, description: 'Time period: day, week, month, year' },
        { name: 'breakdown', type: 'String', required: false, description: 'Breakdown by: format, folder, device' }
      ]
    },
    {
      method: 'POST',
      path: '/api/v1/payment/create',
      description: 'Create payment session for premium features',
      auth: true,
      category: 'Billing',
      parameters: [
        { name: 'provider', type: 'String', required: true, description: 'Payment provider: payu, paypal, stripe' },
        { name: 'amount', type: 'Number', required: true, description: 'Amount in smallest currency unit' },
        { name: 'currency', type: 'String', required: true, description: 'Currency code (USD, INR, EUR)' },
        { name: 'plan', type: 'String', required: false, description: 'Subscription plan identifier' }
      ]
    }
  ];

  const categories = ['All', 'Upload', 'Retrieval', 'CDN', 'Management', 'Analytics', 'Billing'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch = endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         endpoint.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || endpoint.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                ImageVault API Documentation
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Complete guide to integrating with our professional image management platform
              </p>
            </div>
            {isAuthenticated && (
              <div className="flex items-center space-x-3">
                <Button asChild variant="outline">
                  <Link href="/dashboard">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Start Uploading
                  </Link>
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <BookOpen className="w-4 h-4 mr-1" />
              50+ API Endpoints
            </Badge>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <Zap className="w-4 h-4 mr-1" />
              Global CDN
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Shield className="w-4 h-4 mr-1" />
              Enterprise Ready
            </Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <Globe className="w-4 h-4 mr-1" />
              Multi-Region
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Quick Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="#overview" className="block py-2 px-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                  Platform Overview
                </a>
                <a href="#getting-started" className="block py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors">
                  Quick Start Guide
                </a>
                <a href="#authentication" className="block py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors">
                  Authentication
                </a>
                <a href="#endpoints" className="block py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors">
                  API Reference
                </a>
                <a href="#sdks" className="block py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors">
                  SDKs & Libraries
                </a>
                <a href="#examples" className="block py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors">
                  Code Examples
                </a>
                <a href="#transformations" className="block py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors">
                  Image Transformations
                </a>
                <a href="#webhooks" className="block py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors">
                  Webhooks
                </a>
                <a href="#rate-limits" className="block py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors">
                  Rate Limits & Pricing
                </a>
                <a href="#support" className="block py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors">
                  Support & Community
                </a>
              </CardContent>
            </Card>

            {!isAuthenticated && (
              <Card className="mt-4">
                <CardContent className="p-4 text-center">
                  <Rocket className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-medium mb-2">Ready to get started?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Create your free account and get 1GB storage + 10K API requests.
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link href="/auth/register">
                      Start Free Trial
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Platform Overview */}
            <section id="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Platform Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    ImageVault is a professional image management platform designed for developers, businesses, and enterprises 
                    who need reliable, fast, and scalable image hosting with advanced processing capabilities.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🚀 Performance First</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Global CDN with edge caching, WebP/AVIF conversion, and sub-200ms response times worldwide.
                      </p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">🔧 Developer Experience</h4>
                      <p className="text-sm text-emerald-800 dark:text-emerald-200">
                        RESTful APIs, comprehensive SDKs, real-time transformations, and detailed analytics.
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">🛡️ Enterprise Security</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        End-to-end encryption, SOC 2 compliance, private hosting, and advanced access controls.
                      </p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">📈 Scalability</h4>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        Auto-scaling infrastructure, unlimited bandwidth, and pay-as-you-grow pricing.
                      </p>
                    </div>
                  </div>

                  <h4>Key Features</h4>
                  <ul className="grid md:grid-cols-2 gap-2 text-sm">
                    <li>✅ 25+ image transformation parameters</li>
                    <li>✅ Real-time URL-based transformations</li>
                    <li>✅ Global CDN with 200+ edge locations</li>
                    <li>✅ Automatic format optimization (WebP/AVIF)</li>
                    <li>✅ Advanced analytics and insights</li>
                    <li>✅ Custom domains with SSL</li>
                    <li>✅ Batch upload and processing</li>
                    <li>✅ Webhook notifications</li>
                    <li>✅ Multi-region storage</li>
                    <li>✅ Enterprise-grade security</li>
                    <li>✅ Comprehensive API coverage</li>
                    <li>✅ Native SDKs for popular languages</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Getting Started */}
            <section id="getting-started">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Quick Start Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg mb-6">
                    <h4 className="text-lg font-semibold mb-3">Get up and running in 3 steps</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                        <p className="font-medium">Create Account</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sign up for free</p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                        <p className="font-medium">Get API Key</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Generate your key</p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                        <p className="font-medium">Start Building</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Upload your first image</p>
                      </div>
                    </div>
                  </div>

                  <h4>Base URL</h4>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-md font-mono text-sm mb-4">
                    https://your-domain.com/api/v1
                  </div>

                  <h4>Test Your First Upload</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
{`curl -X POST "https://your-domain.com/api/v1/images/upload" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@your-image.jpg" \\
  -F "title=My First Upload" \\
  -F "quality=90" \\
  -F "format=webp"`}
                    </pre>
                  </div>

                  {isAuthenticated && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg mt-4">
                      <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-3 flex items-center">
                        <Key className="w-4 h-4 mr-2" />
                        You're logged in! Generate your API key to get started.
                      </p>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href="/api-keys">
                            Generate API Key
                          </Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link href="/upload">
                            Try Upload Interface
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Authentication */}
            <section id="authentication">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Authentication & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <p>All API requests require authentication using an API key in the Authorization header:</p>

                  <div className="bg-gray-900 text-gray-100 p-3 rounded-md font-mono text-sm mb-4">
                    Authorization: Bearer YOUR_API_KEY
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                      <h5 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">🔒 Security Best Practices</h5>
                      <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                        <li>• Never expose API keys in client-side code</li>
                        <li>• Use environment variables for keys</li>
                        <li>• Rotate keys regularly</li>
                        <li>• Monitor key usage in dashboard</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🔑 API Key Features</h5>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Multiple keys per account</li>
                        <li>• Custom names and descriptions</li>
                        <li>• Usage tracking and analytics</li>
                        <li>• Instant activation/deactivation</li>
                      </ul>
                    </div>
                  </div>

                  <h4>Error Handling</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="default">200</Badge>
                      <span>Success - Request completed successfully</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="secondary">400</Badge>
                      <span>Bad Request - Invalid parameters or malformed request</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="destructive">401</Badge>
                      <span>Unauthorized - Invalid or missing API key</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="destructive">403</Badge>
                      <span>Forbidden - Insufficient permissions or plan limits</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="destructive">429</Badge>
                      <span>Rate Limited - Too many requests, slow down</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* API Endpoints */}
            <section id="endpoints">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                      <Code2 className="w-5 h-5" />
                      API Reference
                    </CardTitle>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search endpoints..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {filteredEndpoints.map((endpoint, index) => (
                      <div key={index} className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge variant={
                            endpoint.method === 'GET' ? 'default' : 
                            endpoint.method === 'POST' ? 'destructive' :
                            endpoint.method === 'PUT' ? 'secondary' : 
                            endpoint.method === 'DELETE' ? 'outline' : 'default'
                          }>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-md flex-1">
                            {endpoint.path}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {endpoint.category}
                          </Badge>
                          {endpoint.auth && (
                            <Badge variant="outline" className="text-xs">
                              <Key className="w-3 h-3 mr-1" />
                              Auth Required
                            </Badge>
                          )}
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {endpoint.description}
                        </p>

                        {endpoint.parameters.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Parameters</h5>
                            <div className="space-y-3">
                              {endpoint.parameters.map((param, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-md">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <code className="font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded text-xs border">
                                      {param.name}
                                    </code>
                                    <Badge variant="outline" className="text-xs">
                                      {param.type}
                                    </Badge>
                                    {param.required && (
                                      <Badge variant="destructive" className="text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {param.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Code Examples */}
            <section id="examples">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="w-5 h-5" />
                    Code Examples & SDKs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="javascript">JavaScript / Node.js</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                    </TabsList>

                    <TabsContent value={selectedLanguage} className="space-y-6">
                      {Object.entries(codeExamples[selectedLanguage as keyof typeof codeExamples]).map(([operation, code]) => (
                        <div key={operation} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
                              {operation.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(code)}
                              className="flex items-center gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm text-gray-100">
                              <code>{code}</code>
                            </pre>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </section>

            {/* Rate Limits & Pricing */}
            <section id="rate-limits">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Rate Limits & Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 text-center">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Free</h4>
                      <p className="text-2xl font-bold text-blue-600 mt-2">$0</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        1GB storage<br/>
                        10K API requests/month<br/>
                        Basic transformations
                      </p>
                    </div>
                    <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center bg-blue-50 dark:bg-blue-900/20">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Starter</h4>
                      <p className="text-2xl font-bold text-blue-600 mt-2">$19</p>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                        50GB storage<br/>
                        500K API requests/month<br/>
                        Advanced transformations
                      </p>
                    </div>
                    <div className="border border-purple-200 dark:border-purple-700 rounded-lg p-4 text-center bg-purple-50 dark:bg-purple-900/20">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100">Pro</h4>
                      <p className="text-2xl font-bold text-purple-600 mt-2">$99</p>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                        500GB storage<br/>
                        5M API requests/month<br/>
                        Premium features
                      </p>
                    </div>
                    <div className="border border-emerald-200 dark:border-emerald-700 rounded-lg p-4 text-center bg-emerald-50 dark:bg-emerald-900/20">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Enterprise</h4>
                      <p className="text-2xl font-bold text-emerald-600 mt-2">Custom</p>
                      <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">
                        Unlimited storage<br/>
                        Custom limits<br/>
                        White-label solution
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 <strong>Rate limit headers:</strong> All responses include <code>X-RateLimit-Limit</code>, 
                      <code>X-RateLimit-Remaining</code>, and <code>X-RateLimit-Reset</code> for monitoring usage.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Support */}
            <section id="support">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Support & Community
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Get Help</h4>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <a href="mailto:support@imagevault.com">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Email Support
                          </a>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <a href="#" target="_blank">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            GitHub Discussions
                          </a>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <a href="#" target="_blank">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Discord Community
                          </a>
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Resources</h4>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <a href="#" target="_blank">
                            <Download className="w-4 h-4 mr-2" />
                            Postman Collection
                          </a>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <a href="#" target="_blank">
                            <Code2 className="w-4 h-4 mr-2" />
                            OpenAPI Spec
                          </a>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <a href="#" target="_blank">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Status Page
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                      🚀 Need custom features or enterprise support?
                    </h4>
                    <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-3">
                      Our team can help with custom integrations, white-label solutions, and dedicated support.
                    </p>
                    <Button size="sm" variant="outline">
                      Contact Enterprise Sales
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
