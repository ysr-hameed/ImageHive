
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, BookOpen, Key, Upload, Image, Settings, Shield, Zap, Globe } from 'lucide-react';

export default function ApiDocs() {
  const endpoints = [
    {
      method: 'POST',
      path: '/api/v1/auth/register',
      description: 'Register a new user account',
      params: ['email', 'password', 'firstName', 'lastName'],
      response: { token: 'string', user: 'object' }
    },
    {
      method: 'POST',
      path: '/api/v1/auth/login',
      description: 'Authenticate user and get access token',
      params: ['email', 'password'],
      response: { token: 'string', user: 'object' }
    },
    {
      method: 'POST',
      path: '/api/v1/images/upload',
      description: 'Upload and process images with advanced optimization',
      params: ['image', 'title', 'quality', 'format', 'width', 'height'],
      response: { id: 'string', url: 'string', metadata: 'object' }
    },
    {
      method: 'GET',
      path: '/api/v1/images',
      description: 'List user images with pagination and filtering',
      params: ['page', 'limit', 'folder', 'tags'],
      response: { images: 'array', total: 'number', pages: 'number' }
    },
    {
      method: 'GET',
      path: '/api/v1/images/:id',
      description: 'Get image details and transformation URLs',
      params: ['id'],
      response: { image: 'object', transformations: 'array' }
    },
    {
      method: 'DELETE',
      path: '/api/v1/images/:id',
      description: 'Delete an image and all its transformations',
      params: ['id'],
      response: { success: 'boolean', message: 'string' }
    },
    {
      method: 'GET',
      path: '/api/v1/analytics/usage',
      description: 'Get usage analytics and statistics',
      params: ['period', 'metric'],
      response: { usage: 'object', stats: 'array' }
    }
  ];

  const transformations = [
    { param: 'w', description: 'Width in pixels', example: '?w=400' },
    { param: 'h', description: 'Height in pixels', example: '?h=300' },
    { param: 'q', description: 'Quality (1-100)', example: '?q=85' },
    { param: 'f', description: 'Format (webp, avif, jpeg, png)', example: '?f=webp' },
    { param: 'fit', description: 'Resize mode (cover, contain, fill)', example: '?fit=cover' },
    { param: 'blur', description: 'Blur radius (0-50)', example: '?blur=5' },
    { param: 'bright', description: 'Brightness (0-2)', example: '?bright=1.2' },
    { param: 'contrast', description: 'Contrast (0-2)', example: '?contrast=1.1' },
    { param: 'sat', description: 'Saturation (0-2)', example: '?sat=1.3' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                ImageVault API Documentation
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Complete guide to integrating with ImageVault's powerful image management API
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">7+</div>
              <div className="text-sm text-blue-800 dark:text-blue-200">API Endpoints</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-emerald-600">25+</div>
              <div className="text-sm text-emerald-800 dark:text-emerald-200">Transform Options</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">Global</div>
              <div className="text-sm text-purple-800 dark:text-purple-200">CDN Network</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-600">99.9%</div>
              <div className="text-sm text-amber-800 dark:text-amber-200">Uptime SLA</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
            <TabsTrigger value="transformations">Image Transforms</TabsTrigger>
            <TabsTrigger value="examples">Code Examples</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  ImageVault API provides powerful image management capabilities with global CDN delivery, 
                  real-time transformations, and enterprise-grade security.
                </p>
                
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Base URL</h4>
                  <code className="text-sm bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                    https://api.imagevault.com/v1
                  </code>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium">Secure by Default</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      API key authentication with rate limiting
                    </p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <Zap className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <h4 className="font-medium">Lightning Fast</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Global CDN with edge processing
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Settings className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium">Highly Configurable</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Extensive transformation options
                    </p>
                  </div>
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
                  All API requests require authentication using Bearer tokens or API keys.
                </p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Bearer Token (Recommended)</h4>
                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                      <code className="text-sm">
                        Authorization: Bearer your_access_token_here
                      </code>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">API Key Header</h4>
                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                      <code className="text-sm">
                        X-API-Key: your_api_key_here
                      </code>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                      Rate Limits
                    </h4>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                      <li>• Free tier: 1,000 requests/hour</li>
                      <li>• Pro tier: 10,000 requests/hour</li>
                      <li>• Enterprise: Custom limits</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Endpoints */}
          <TabsContent value="endpoints" className="space-y-6">
            {endpoints.map((endpoint, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Badge 
                        variant={endpoint.method === 'GET' ? 'secondary' : 
                               endpoint.method === 'POST' ? 'default' : 'destructive'}
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm">{endpoint.path}</code>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {endpoint.description}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Parameters</h4>
                      <div className="space-y-1">
                        {endpoint.params.map(param => (
                          <code key={param} className="block text-sm bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                            {param}
                          </code>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Response</h4>
                      <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                        <pre className="text-sm">
                          {JSON.stringify(endpoint.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Transformations */}
          <TabsContent value="transformations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Real-time Image Transformations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Transform images on-the-fly by adding query parameters to image URLs.
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {transformations.map((transform, index) => (
                    <div key={index} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-medium">{transform.param}</code>
                        <Badge variant="outline">{transform.example}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transform.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Example URL
                  </h4>
                  <code className="text-sm text-blue-700 dark:text-blue-300 break-all">
                    https://cdn.imagevault.com/img/abc123.jpg?w=800&h=600&q=85&f=webp&fit=cover
                  </code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Examples */}
          <TabsContent value="examples" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>JavaScript/Node.js</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <pre>{`// Upload an image
const formData = new FormData();
formData.append('image', file);
formData.append('quality', '85');
formData.append('format', 'webp');

const response = await fetch('/api/v1/images/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});

const result = await response.json();
console.log('Image URL:', result.url);`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Python</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <pre>{`import requests

# Upload an image
files = {'image': open('photo.jpg', 'rb')}
data = {
    'quality': 85,
    'format': 'webp',
    'title': 'My Photo'
}
headers = {
    'Authorization': f'Bearer {token}'
}

response = requests.post(
    'https://api.imagevault.com/v1/images/upload',
    files=files,
    data=data,
    headers=headers
)

result = response.json()
print(f"Image URL: {result['url']}")`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>cURL</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <pre>{`# Upload an image
curl -X POST \\
  https://api.imagevault.com/v1/images/upload \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "image=@photo.jpg" \\
  -F "quality=85" \\
  -F "format=webp" \\
  -F "title=My Photo"

# Get images list
curl -X GET \\
  "https://api.imagevault.com/v1/images?page=1&limit=20" \\
  -H "Authorization: Bearer YOUR_TOKEN"`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>PHP</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <pre>{`<?php
// Upload an image
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => 'https://api.imagevault.com/v1/images/upload',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $token
    ],
    CURLOPT_POSTFIELDS => [
        'image' => new CURLFile('photo.jpg'),
        'quality' => 85,
        'format' => 'webp'
    ]
]);

$response = curl_exec($curl);
$result = json_decode($response, true);
echo "Image URL: " . $result['url'];
?>`}</pre>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>SDKs and Libraries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Official SDKs</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Badge variant="outline">JavaScript</Badge>
                        <code>npm install @imagevault/sdk</code>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline">Python</Badge>
                        <code>pip install imagevault</code>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline">PHP</Badge>
                        <code>composer require imagevault/sdk</code>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Framework Integrations</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Badge variant="outline">React</Badge>
                        <code>@imagevault/react</code>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline">Next.js</Badge>
                        <code>@imagevault/next</code>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline">WordPress</Badge>
                        <code>ImageVault Plugin</code>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
