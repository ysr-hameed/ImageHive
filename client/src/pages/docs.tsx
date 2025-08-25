import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, ExternalLink, Copy, BookOpen, Zap, Globe, Download, Key, Image, Settings, Upload, BarChart3, DollarSign, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";

const codeExamples = {
  curl: `# Upload with transformations
curl -X POST https://your-domain.com/api/v1/images/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@/path/to/image.jpg" \\
  -F "width=800" \\
  -F "height=600" \\
  -F "quality=90" \\
  -F "format=webp" \\
  -F "title=My Image" \\
  -F "description=Beautiful landscape" \\
  -F "tags=nature,landscape,outdoor" \\
  -F "folder=portfolio" \\
  -F "isPublic=true"`,

  javascript: `// JavaScript/Node.js SDK
import { ImageVaultClient } from '@imagevault/sdk';

const client = new ImageVaultClient({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://your-domain.com'
});

// Upload with transformations
const uploadResult = await client.upload({
  file: fileBuffer, // or File object in browser
  width: 800,
  height: 600,
  quality: 90,
  format: 'webp',
  title: 'My Image',
  description: 'Beautiful landscape',
  tags: ['nature', 'landscape', 'outdoor'],
  folder: 'portfolio',
  isPublic: true,
  transforms: {
    brightness: 1.1,
    contrast: 1.2,
    saturation: 1.1,
    sharpen: true
  }
});

console.log('Image uploaded:', uploadResult.url);

// Get images with filtering
const images = await client.getImages({
  folder: 'portfolio',
  tags: ['nature'],
  limit: 20,
  page: 1
});

// Transform existing image URL
const transformedUrl = client.transform('image-url', {
  width: 400,
  height: 300,
  fit: 'cover',
  quality: 85
});`,

  python: `# Python SDK
from imagevault import ImageVaultClient

client = ImageVaultClient(
    api_key='YOUR_API_KEY',
    base_url='https://your-domain.com'
)

# Upload with transformations
with open('image.jpg', 'rb') as f:
    result = client.upload(
        file=f,
        width=800,
        height=600,
        quality=90,
        format='webp',
        title='My Image',
        description='Beautiful landscape',
        tags=['nature', 'landscape', 'outdoor'],
        folder='portfolio',
        is_public=True,
        transforms={
            'brightness': 1.1,
            'contrast': 1.2,
            'saturation': 1.1,
            'sharpen': True
        }
    )

print(f"Image uploaded: {result['url']}")

# Get images with filtering
images = client.get_images(
    folder='portfolio',
    tags=['nature'],
    limit=20,
    page=1
)

# Transform existing image URL
transformed_url = client.transform('image-url', {
    'width': 400,
    'height': 300,
    'fit': 'cover',
    'quality': 85
})`,

  php: `<?php
// PHP SDK
require_once 'vendor/autoload.php';

use ImageVault\\Client;

$client = new Client([
    'apiKey' => 'YOUR_API_KEY',
    'baseUrl' => 'https://your-domain.com'
]);

// Upload with transformations
$result = $client->upload([
    'file' => new CURLFile('/path/to/image.jpg'),
    'width' => 800,
    'height' => 600,
    'quality' => 90,
    'format' => 'webp',
    'title' => 'My Image',
    'description' => 'Beautiful landscape',
    'tags' => ['nature', 'landscape', 'outdoor'],
    'folder' => 'portfolio',
    'isPublic' => true,
    'transforms' => [
        'brightness' => 1.1,
        'contrast' => 1.2,
        'saturation' => 1.1,
        'sharpen' => true
    ]
]);

echo "Image uploaded: " . $result['url'];

// Get images with filtering
$images = $client->getImages([
    'folder' => 'portfolio',
    'tags' => ['nature'],
    'limit' => 20,
    'page' => 1
]);

// Transform existing image URL
$transformedUrl = $client->transform('image-url', [
    'width' => 400,
    'height' => 300,
    'fit' => 'cover',
    'quality' => 85
]);
?>`,

  react: `// React Hook
import { useImageVault } from '@imagevault/react';

function ImageUpload() {
  const { upload, isUploading, error } = useImageVault({
    apiKey: 'YOUR_API_KEY'
  });

  const handleUpload = async (file) => {
    try {
      const result = await upload({
        file,
        width: 800,
        height: 600,
        quality: 90,
        format: 'webp',
        transforms: {
          brightness: 1.1,
          sharpen: true
        }
      });

      console.log('Uploaded:', result.url);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => handleUpload(e.target.files[0])}
        disabled={isUploading}
      />
      {isUploading && <p>Uploading...</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}`,

  cdn: `<!-- CDN Usage -->
<!-- Original image -->
<img src="https://your-domain.com/files/user123/image.jpg" alt="Original" />

<!-- Transformed images using URL parameters -->
<img src="https://your-domain.com/files/user123/image.jpg?w=400&h=300&fit=cover" alt="Thumbnail" />
<img src="https://your-domain.com/files/user123/image.jpg?w=800&quality=90&format=webp" alt="Optimized" />
<img src="https://your-domain.com/files/user123/image.jpg?blur=5&grayscale=true" alt="Artistic" />

<!-- Responsive images -->
<picture>
  <source media="(min-width: 768px)" 
          srcset="https://your-domain.com/files/user123/image.jpg?w=1200&format=webp">
  <source media="(min-width: 480px)" 
          srcset="https://your-domain.com/files/user123/image.jpg?w=800&format=webp">
  <img src="https://your-domain.com/files/user123/image.jpg?w=400&format=webp" 
       alt="Responsive image">
</picture>`
};

export default function ApiDocs() {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code example has been copied to your clipboard.",
    });
  };

  const CodeBlock = ({ code, language }: { code: string; language: string }) => (
    <div className="relative">
      <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-lg">
        <span className="text-sm font-medium">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(code)}
          className="text-white hover:bg-gray-700"
        >
          <Copy className="w-4 h-4" />
        </Button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
              API Documentation
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Complete guide to integrating with our Image Management API
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <Badge variant="outline">
                <BookOpen className="w-4 h-4 mr-1" />
                Comprehensive Docs
              </Badge>
              <Badge variant="outline">
                <Zap className="w-4 h-4 mr-1" />
                SDKs Available
              </Badge>
              <Badge variant="outline">
                <Globe className="w-4 h-4 mr-1" />
                Global CDN
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="php">PHP</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="cdn">CDN</TabsTrigger>
            </TabsList>

            {Object.entries(codeExamples).map(([key, code]) => (
              <TabsContent key={key} value={key}>
                <CodeBlock code={code} language={key} />
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-12 space-y-8">
            {/* Authentication */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  <CardTitle>Authentication</CardTitle>
                </div>
                <CardDescription>
                  Secure your API requests with an API key.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Obtain API Key</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Generate your API key from your account dashboard:
                    <a href="/dashboard/keys" className="text-blue-500 hover:underline ml-1">
                      /dashboard/keys
                    </a>
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">2. Include in Request Header</h4>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <code>Authorization: Bearer YOUR_API_KEY</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload API */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  <CardTitle>Image Upload</CardTitle>
                </div>
                <CardDescription>
                  Upload images to your ImageVault account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Endpoint</h4>
                  <CodeBlock code="POST /api/v1/images/upload" language="HTTP" />
                </div>
                <div>
                  <h4 className="font-medium mb-2">File Size Limit</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">50MB per file.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Parameters</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">Parameter</th>
                          <th className="text-left py-2 px-3">Type</th>
                          <th className="text-left py-2 px-3">Required</th>
                          <th className="text-left py-2 px-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 dark:text-gray-300">
                        {[
                          { name: "image", type: "File", required: true, description: "Image file (JPEG, PNG, WebP, GIF, BMP)" },
                          { name: "title", type: "String", required: false, description: "Image title (max 255 chars)" },
                          { name: "description", type: "String", required: false, description: "Image description (max 1000 chars)" },
                          { name: "isPublic", type: "Boolean", required: false, description: "Make image public (default: false)" },
                          { name: "folder", type: "String", required: false, description: "Upload to a specific folder" },
                          { name: "tags", type: "Array<String>", required: false, description: "Tags for organization (max 10)" },
                          { name: "quality", type: "Integer", required: false, description: "JPEG/WebP quality (1-100, default: 85)" },
                          { name: "width", type: "Integer", required: false, description: "Resize width (max 4000px)" },
                          { name: "height", type: "Integer", required: false, description: "Resize height (max 4000px)" },
                          { name: "format", type: "String", required: false, description: "Output format: jpeg, png, webp, avif (default: auto)" },
                          { name: "watermark", type: "Boolean", required: false, description: "Apply watermark (Pro feature)" }
                        ].map((param) => (
                          <tr key={param.name} className="border-b">
                            <td className="py-2 px-3"><code>{param.name}</code></td>
                            <td className="py-2 px-3">{param.type}</td>
                            <td className="py-2 px-3">{param.required ? "Yes" : "No"}</td>
                            <td className="py-2 px-3">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image Transformations */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  <CardTitle>Image Transformations</CardTitle>
                </div>
                <CardDescription>
                  Apply real-time transformations via URL parameters.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Parameters</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">Parameter</th>
                          <th className="text-left py-2 px-3">Values</th>
                          <th className="text-left py-2 px-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 dark:text-gray-300">
                        {[
                          { name: "w / width", values: "1-4000", description: "Resize width" },
                          { name: "h / height", values: "1-4000", description: "Resize height" },
                          { name: "q / quality", values: "1-100", description: "JPEG/WebP quality (default: 85)" },
                          { name: "f / format", values: "jpeg, png, webp, avif", description: "Output format (default: auto)" },
                          { name: "fit", values: "cover, contain, fill, inside, outside", description: "Resize fit mode (default: cover)" },
                          { name: "blur", values: "0.3-1000", description: "Gaussian blur radius" },
                          { name: "brightness", values: "0.1-3.0", description: "Brightness multiplier (1.0 = no change)" },
                          { name: "contrast", values: "0.1-3.0", description: "Contrast multiplier (1.0 = no change)" },
                          { name: "saturation", values: "0.0-3.0", description: "Saturation multiplier (0 = grayscale)" },
                          { name: "rotate", values: "0-360", description: "Rotation angle in degrees" },
                          { name: "sharpen", values: "true/false", description: "Apply sharpening effect" },
                          { name: "grayscale", values: "true/false", description: "Convert image to grayscale" },
                        ].map((param) => (
                          <tr key={param.name} className="border-b">
                            <td className="py-2 px-3"><code>{param.name}</code></td>
                            <td className="py-2 px-3">{param.values}</td>
                            <td className="py-2 px-3">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Examples</h4>
                  <div className="space-y-2">
                    <CodeBlock code="https://cdn.imagevault.app/uploads/abc123.jpg?w=800&h=600&format=webp" language="URL" />
                    <CodeBlock code="https://cdn.imagevault.app/uploads/abc123.jpg?w=1200&q=95&brightness=1.1&contrast=1.05" language="URL" />
                    <CodeBlock code="https://cdn.imagevault.app/uploads/abc123.jpg?w=300&h=300&fit=cover&blur=2&sharpen=true" language="URL" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manage Images */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <CardTitle>Manage Images</CardTitle>
                </div>
                <CardDescription>
                  Retrieve, update, and delete your uploaded images.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">List Images</h4>
                  <CodeBlock code="GET /api/v1/images?page=1&limit=20&sortBy=createdAt&order=desc&tag=nature&folder=portfolio" language="HTTP" />
                  <div className="mt-2">
                    <h5 className="font-medium text-sm">Query Parameters:</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 mt-1 space-y-1">
                      <li><code>page</code> - Page number (default: 1)</li>
                      <li><code>limit</code> - Items per page (max: 100, default: 20)</li>
                      <li><code>sortBy</code> - Sort field: createdAt, size, title, width, height (default: createdAt)</li>
                      <li><code>order</code> - Sort order: asc, desc (default: desc)</li>
                      <li><code>tag</code> - Filter by tag</li>
                      <li><code>folder</code> - Filter by folder</li>
                      <li><code>isPublic</code> - Filter by visibility: true, false</li>
                      <li><code>format</code> - Filter by format: jpeg, png, webp, gif, avif</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Get Image Details</h4>
                  <CodeBlock code="GET /api/v1/images/{imageId}" language="HTTP" />
                </div>

                <div>
                  <h4 className="font-medium mb-2">Update Image</h4>
                  <CodeBlock code={`PATCH /api/v1/images/{imageId}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "New description",
  "folder": "new-folder",
  "isPublic": false,
  "tags": ["tag1", "tag2"]
}`} language="HTTP" />
                </div>

                <div>
                  <h4 className="font-medium mb-2">Delete Image</h4>
                  <CodeBlock code="DELETE /api/v1/images/{imageId}" language="HTTP" />
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <CardTitle>Analytics & Tracking</CardTitle>
                </div>
                <CardDescription>
                  Track image views, bandwidth, and performance metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Analytics are automatically tracked. Access detailed reports and insights via your dashboard:
                  <a href="/dashboard/analytics" className="text-blue-500 hover:underline ml-1">
                    /dashboard/analytics
                  </a>
                </p>
              </CardContent>
            </Card>

            {/* Error Codes */}
            <Card>
              <CardHeader>
                <CardTitle>Common Error Codes</CardTitle>
                <CardDescription>
                  Understanding API responses and error handling.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <code>400 Bad Request</code>
                    <span>Invalid request parameters or payload.</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <code>401 Unauthorized</code>
                    <span>Missing or invalid API key.</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <code>404 Not Found</code>
                    <span>The requested resource could not be found.</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <code>413 Payload Too Large</code>
                    <span>Uploaded file exceeds the size limit.</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <code>429 Too Many Requests</code>
                    <span>Rate limit exceeded. Please try again later.</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <code>500 Internal Server Error</code>
                    <span>An unexpected error occurred on our server.</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SDK & Libraries */}
            <Card>
              <CardHeader>
                <CardTitle>SDK & Libraries</CardTitle>
                <CardDescription>
                  Integrate ImageVault seamlessly with our official SDKs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    JavaScript / Node.js <ExternalLink className="w-3 h-3 text-gray-500" />
                  </h4>
                  <CodeBlock code={`// Install: npm install @imagevault/sdk
import { ImageVaultClient } from '@imagevault/sdk';

const client = new ImageVaultClient({ apiKey: 'YOUR_API_KEY' });

// Upload image
const uploaded = await client.upload({
  file: './image.jpg', // or File object
  width: 800,
  title: 'My JS Image'
});

console.log(uploaded.url);`} language="javascript" />
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    Python <ExternalLink className="w-3 h-3 text-gray-500" />
                  </h4>
                  <CodeBlock code={`# Install: pip install imagevault-python
from imagevault import ImageVaultClient

client = ImageVaultClient(api_key='YOUR_API_KEY')

# Upload image
with open('image.jpg', 'rb') as f:
    uploaded = client.upload(
        file=f,
        width=800,
        title='My Python Image'
    )

print(uploaded['url'])`} language="python" />
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    PHP <ExternalLink className="w-3 h-3 text-gray-500" />
                  </h4>
                  <CodeBlock code={`// Install: composer require imagevault/php-sdk
use ImageVault\\Client;

$client = new Client('YOUR_API_KEY');

// Upload image
$uploaded = $client->upload([
    'file' => new CURLFile('./image.jpg'),
    'width' => 800,
    'title' => 'My PHP Image'
]);

echo $uploaded['url'];`} language="php" />
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Plans */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <CardTitle>Pricing & Plans</CardTitle>
                </div>
                <CardDescription>
                  Choose a plan that fits your needs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-6 justify-center">
                  {/* Free Plan */}
                  <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center flex flex-col justify-between w-full lg:w-72">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Free</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">For personal projects and testing</p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold">$0</span>
                        <span className="text-gray-500"> /month</span>
                      </div>
                      <ul className="text-left text-sm space-y-3 text-gray-600 dark:text-gray-300">
                        <li><Check className="w-4 h-4 inline-block mr-2 text-green-500" /> 1,000 Images</li>
                        <li><Check className="w-4 h-4 inline-block mr-2 text-green-500" /> 5GB Storage</li>
                        <li><Check className="w-4 h-4 inline-block mr-2 text-green-500" /> 10GB Bandwidth</li>
                        <li><Check className="w-4 h-4 inline-block mr-2 text-green-500" /> Basic Transformations</li>
                        <li><X className="w-4 h-4 inline-block mr-2 text-red-500" /> No Priority Support</li>
                        <li><X className="w-4 h-4 inline-block mr-2 text-red-500" /> No Custom Watermark</li>
                      </ul>
                    </div>
                    <Button variant="secondary" className="mt-6 w-full">Get Started Free</Button>
                  </div>

                  {/* Pro Plan */}
                  <div className="border-2 border-blue-500 rounded-lg p-6 text-center flex flex-col justify-between relative shadow-lg w-full lg:w-80 scale-105">
                    <Badge variant="destructive" className="absolute -top-3 left-1/2 -translate-x-1/2 py-1 px-3 rounded-full">Popular</Badge>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Pro</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">For growing businesses and apps</p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold">$29</span>
                        <span className="text-gray-500"> /month</span>
                      </div>
                      <ul className="text-left text-sm space-y-3 text-gray-600 dark:text-gray-300">
                        <li><Check className="w-4 h-4 inline-block mr-2 text-green-500" /> 50,000 Images</li>
                        <li><Check className="w-4 h-4 inline-block mr-2 text-green-500" /> 100GB Storage</li>
                        <li><Check className="w-4 h-4 inline-block mr-2 text-green-500" /> 500GB Bandwidth</li>
                        <li><Check className="w-4 h-4 inline-block mr-2 text-green-500" /> Advanced Transformations</li>
                        <li><Check className="w-4 h-4 inline-block mr-2 text-green-500" /> Priority Support</li>
                        <li><Check className="w-4 h-4 inline-block mr-2 text-green-500" /> Custom Watermark</li>
                      </ul>
                    </div>
                    <Button className="mt-6 w-full">Upgrade to Pro</Button>
                  </div>

                  {/* Business Plan */}
                  <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center flex flex-col justify-between w-full lg:w-72">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Business</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">For large-scale applications</p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold">Custom</span>
                      </div>
                      <ul className="text-left text-sm space-y-3 text-gray-600 dark:text-gray-300">
                        <li><Check className="w-4 h-4 inline-block mr-2 text-green-500" /> Unlimited Images</li>
                        <li><Check className="w-4 h-4 inline-block mr-2 text-green-500" /> Custom Storage</li>
                        <li><Check className="w-4 h-4 inline-block mr-2 text-green-500" /> Custom Bandwidth</li>
                        <li><Check className="w-4 h-4 inline-block mr-2 text-green-500" /> All Pro Features</li>
                        <li><Check className="w-4 h-4 inline-block mr-2 text-green-500" /> Dedicated Account Manager</li>
                      </ul>
                    </div>
                    <Button variant="secondary" className="mt-6 w-full">Contact Sales</Button>
                  </div>
                </div>
                <div className="text-center mt-8">
                  <Button variant="link" className="text-blue-500 hover:underline">
                    View Full Pricing Details <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}