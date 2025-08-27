
import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Code, Key, Upload, Image, Settings, Shield } from 'lucide-react';

const ApiDocs = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const codeExamples = {
    javascript: `// Upload an image
const formData = new FormData();
formData.append('image', file);

const response = await fetch('/api/v1/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
});

const result = await response.json();
console.log('Image URL:', result.url);`,

    curl: `# Upload an image
curl -X POST "https://your-app.replit.dev/api/v1/upload" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@/path/to/your/image.jpg"`,

    python: `import requests

# Upload an image
with open('image.jpg', 'rb') as f:
    files = {'image': f}
    headers = {'Authorization': 'Bearer YOUR_API_KEY'}
    response = requests.post(
        'https://your-app.replit.dev/api/v1/upload',
        files=files,
        headers=headers
    )
    
result = response.json()
print(f"Image URL: {result['url']}")`,

    php: `<?php
// Upload an image
$ch = curl_init();
$file = new CURLFile('/path/to/image.jpg');

curl_setopt_array($ch, [
    CURLOPT_URL => 'https://your-app.replit.dev/api/v1/upload',
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => ['image' => $file],
    CURLOPT_HTTPHEADER => ['Authorization: Bearer YOUR_API_KEY'],
    CURLOPT_RETURNTRANSFER => true
]);

$response = curl_exec($ch);
$result = json_decode($response, true);
echo "Image URL: " . $result['url'];
curl_close($ch);
?>`
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ImageVault API Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            Complete guide to integrating ImageVault's powerful image hosting and transformation API into your applications.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="authentication">Auth</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="transformations">Transform</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Fast Upload
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Upload images instantly with our high-performance API. Supports all major formats including JPEG, PNG, WebP, and more.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Auto Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Automatic image optimization, compression, and format conversion to ensure the best performance for your users.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Real-time Transform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Transform images on-the-fly with URL parameters. Resize, crop, rotate, and apply filters instantly.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">1. Get Your API Key</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Generate an API key from your dashboard to authenticate your requests.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">2. Upload Your First Image</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Use our simple upload endpoint to store your images securely in the cloud.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">3. Transform & Serve</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Apply transformations via URL parameters and serve optimized images globally.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication */}
          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  All API requests require authentication using an API key in the Authorization header.
                </p>
                
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <code className="text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2"
                    onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Security Best Practices</h4>
                  <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1">
                    <li>Store API keys securely as environment variables</li>
                    <li>Never expose API keys in client-side code</li>
                    <li>Rotate keys regularly for enhanced security</li>
                    <li>Use different keys for different environments</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline">POST</Badge>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                    /api/v1/upload
                  </code>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Request</h4>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <code className="text-sm whitespace-pre-wrap">
{`Content-Type: multipart/form-data
Authorization: Bearer YOUR_API_KEY

Form Data:
- image: (file) The image file to upload
- folder: (string, optional) Folder to organize images
- public: (boolean, optional) Make image publicly accessible`}
                      </code>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Response</h4>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <code className="text-sm whitespace-pre-wrap">
{`{
  "success": true,
  "id": "img_abc123",
  "url": "https://cdn.imagevault.com/img_abc123.jpg",
  "originalName": "photo.jpg",
  "size": 1048576,
  "format": "jpeg",
  "width": 1920,
  "height": 1080,
  "folder": "uploads",
  "createdAt": "2024-01-15T10:30:00Z"
}`}
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supported Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Badge variant="secondary">JPEG</Badge>
                  <Badge variant="secondary">PNG</Badge>
                  <Badge variant="secondary">WebP</Badge>
                  <Badge variant="secondary">GIF</Badge>
                  <Badge variant="secondary">BMP</Badge>
                  <Badge variant="secondary">TIFF</Badge>
                  <Badge variant="secondary">SVG</Badge>
                  <Badge variant="secondary">AVIF</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images */}
          <TabsContent value="images" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>List Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">GET</Badge>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                      /api/v1/images
                    </code>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Retrieve a paginated list of your uploaded images with optional filtering.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Get Image Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">GET</Badge>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                      /api/v1/images/:id
                    </code>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get detailed information about a specific image including metadata and analytics.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Update Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">PUT</Badge>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                      /api/v1/images/:id
                    </code>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update image metadata such as title, description, and folder organization.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delete Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">DELETE</Badge>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                      /api/v1/images/:id
                    </code>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Permanently delete an image and all its transformations from storage.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transformations */}
          <TabsContent value="transformations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>URL-based Transformations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Transform images on-the-fly by adding parameters to the image URL.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Resize</h4>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <code className="text-sm">
                        https://cdn.imagevault.com/img_abc123.jpg?w=800&h=600
                      </code>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Crop</h4>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <code className="text-sm">
                        https://cdn.imagevault.com/img_abc123.jpg?w=400&h=400&crop=center
                      </code>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Format Conversion</h4>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <code className="text-sm">
                        https://cdn.imagevault.com/img_abc123.jpg?format=webp&quality=80
                      </code>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Filters</h4>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <code className="text-sm">
                        https://cdn.imagevault.com/img_abc123.jpg?blur=5&brightness=110
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Size & Crop</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li><code>w</code> - Width in pixels</li>
                      <li><code>h</code> - Height in pixels</li>
                      <li><code>crop</code> - Crop mode (center, top, bottom, left, right)</li>
                      <li><code>fit</code> - Fit mode (cover, contain, fill, inside)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Format & Quality</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li><code>format</code> - Output format (webp, jpeg, png)</li>
                      <li><code>quality</code> - Quality (1-100)</li>
                      <li><code>progressive</code> - Progressive JPEG</li>
                      <li><code>lossless</code> - Lossless compression</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Effects</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li><code>blur</code> - Blur radius (0-100)</li>
                      <li><code>brightness</code> - Brightness (0-200)</li>
                      <li><code>contrast</code> - Contrast (0-200)</li>
                      <li><code>saturation</code> - Saturation (0-200)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Rotation</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li><code>rotate</code> - Rotation angle (0-360)</li>
                      <li><code>flip</code> - Flip horizontally</li>
                      <li><code>flop</code> - Flip vertically</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples */}
          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="javascript" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="php">PHP</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>
                  
                  {Object.entries(codeExamples).map(([lang, code]) => (
                    <TabsContent key={lang} value={lang}>
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                          <code>{code}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Free Plan</h4>
                    <p className="text-green-600 dark:text-green-400">100 requests/hour</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Pro Plan</h4>
                    <p className="text-blue-600 dark:text-blue-400">1,000 requests/hour</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200">Enterprise</h4>
                    <p className="text-purple-600 dark:text-purple-400">Custom limits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Check out our support resources or contact our team.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Support Center
                </Button>
                <Button variant="outline">
                  <Code className="w-4 h-4 mr-2" />
                  GitHub Examples
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
  );
};

export default ApiDocs;
