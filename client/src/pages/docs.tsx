
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { 
  ArrowLeft, 
  Search, 
  Book, 
  Code, 
  Terminal, 
  Zap, 
  Shield, 
  Globe,
  Download,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';

export default function Docs() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: Book },
    { id: 'authentication', title: 'Authentication', icon: Shield },
    { id: 'upload-api', title: 'Upload API', icon: Zap },
    { id: 'image-management', title: 'Image Management', icon: Globe },
    { id: 'sdks', title: 'SDKs & Libraries', icon: Code },
    { id: 'examples', title: 'Code Examples', icon: Terminal }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                API Documentation
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Everything you need to integrate ImageVault into your applications
              </p>
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    <span className="font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Getting Started */}
            {activeSection === 'getting-started' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Getting Started</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Quick start guide to using the ImageVault API
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      Quick Setup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">1. Get Your API Key</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        Sign up for an account and generate your API key from the dashboard.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">2. Make Your First Request</h4>
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 text-sm">cURL</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard('curl -X POST https://api.imagevault.app/upload \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -F "image=@photo.jpg"', 'quick-curl')}
                          >
                            {copiedCode === 'quick-curl' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <code className="text-green-400 text-sm">
{`curl -X POST https://api.imagevault.app/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@photo.jpg"`}
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Base URL</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <code className="text-blue-700 dark:text-blue-300 font-mono">
                        https://api.imagevault.app
                      </code>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Authentication */}
            {activeSection === 'authentication' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Authentication</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    All API requests require authentication using API keys
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      API Key Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      Include your API key in the Authorization header of every request:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">HTTP Header</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth-header')}
                        >
                          {copiedCode === 'auth-header' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <code className="text-green-400">
                        Authorization: Bearer YOUR_API_KEY
                      </code>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Upload API */}
            {activeSection === 'upload-api' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Upload API</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Upload and manage your images via our RESTful API
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>POST /api/upload</CardTitle>
                    <Badge variant="secondary">multipart/form-data</Badge>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Parameters</h4>
                      <div className="space-y-2">
                        <div className="flex gap-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-blue-600 font-mono">image</code>
                          <span className="text-gray-600 dark:text-gray-400">File - The image to upload</span>
                        </div>
                        <div className="flex gap-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-blue-600 font-mono">isPublic</code>
                          <span className="text-gray-600 dark:text-gray-400">Boolean - Make image publicly accessible</span>
                        </div>
                        <div className="flex gap-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-blue-600 font-mono">folder</code>
                          <span className="text-gray-600 dark:text-gray-400">String - Optional folder path</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Example Request</h4>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <code className="text-green-400 text-sm">
{`curl -X POST https://api.imagevault.app/api/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@photo.jpg" \\
  -F "isPublic=true" \\
  -F "folder=uploads/2024"`}
                        </code>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Example Response</h4>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <code className="text-cyan-300 text-sm">
{`{
  "success": true,
  "url": "https://cdn.imagevault.app/uploads/abc123.jpg",
  "id": "abc123",
  "filename": "photo.jpg",
  "size": 245760,
  "contentType": "image/jpeg",
  "isPublic": true,
  "folder": "uploads/2024",
  "views": 0,
  "uploadedAt": "2024-01-15T10:30:00Z"
}`}
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Image Management */}
            {activeSection === 'image-management' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Image Management</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Manage your uploaded images with these endpoints
                  </p>
                </div>

                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>GET /api/images</span>
                        <Badge variant="outline">List Images</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Retrieve a list of all your uploaded images
                      </p>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <code className="text-green-400 text-sm">
                          GET https://api.imagevault.app/api/images?page=1&limit=20
                        </code>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>GET /api/images/:id</span>
                        <Badge variant="outline">Get Image Details</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Get detailed information about a specific image
                      </p>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <code className="text-green-400 text-sm">
                          GET https://api.imagevault.app/api/images/abc123
                        </code>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>DELETE /api/images/:id</span>
                        <Badge variant="destructive">Delete Image</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Permanently delete an image from your account
                      </p>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <code className="text-red-400 text-sm">
                          DELETE https://api.imagevault.app/api/images/abc123
                        </code>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* SDKs */}
            {activeSection === 'sdks' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">SDKs & Libraries</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Official SDKs and community libraries
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-yellow-600" />
                        JavaScript/Node.js
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-900 rounded-lg p-4">
                        <code className="text-green-400 text-sm">
                          npm install imagevault-js
                        </code>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="https://github.com/imagevault/imagevault-js" target="_blank">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on GitHub
                        </a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-blue-600" />
                        Python
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-900 rounded-lg p-4">
                        <code className="text-green-400 text-sm">
                          pip install imagevault-python
                        </code>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="https://github.com/imagevault/imagevault-python" target="_blank">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on GitHub
                        </a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-red-600" />
                        PHP
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-900 rounded-lg p-4">
                        <code className="text-green-400 text-sm">
                          composer require imagevault/imagevault-php
                        </code>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="https://github.com/imagevault/imagevault-php" target="_blank">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on GitHub
                        </a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-green-600" />
                        Go
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-900 rounded-lg p-4">
                        <code className="text-green-400 text-sm">
                          go get github.com/imagevault/imagevault-go
                        </code>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="https://github.com/imagevault/imagevault-go" target="_blank">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on GitHub
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Examples */}
            {activeSection === 'examples' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Code Examples</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Ready-to-use code examples for common use cases
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>JavaScript/Node.js Upload Example</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">JavaScript</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`const formData = new FormData();
formData.append('image', file);
formData.append('isPublic', 'true');

const response = await fetch('https://api.imagevault.app/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
});

const result = await response.json();
console.log('Image uploaded:', result.url);`, 'js-example')}
                        >
                          {copiedCode === 'js-example' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <code className="text-cyan-300 text-sm">
{`const formData = new FormData();
formData.append('image', file);
formData.append('isPublic', 'true');

const response = await fetch('https://api.imagevault.app/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
});

const result = await response.json();
console.log('Image uploaded:', result.url);`}
                      </code>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Python Upload Example</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <code className="text-cyan-300 text-sm">
{`import requests

url = 'https://api.imagevault.app/api/upload'
headers = {'Authorization': 'Bearer YOUR_API_KEY'}
files = {'image': open('photo.jpg', 'rb')}
data = {'isPublic': 'true'}

response = requests.post(url, headers=headers, files=files, data=data)
result = response.json()
print(f"Image uploaded: {result['url']}")`}
                      </code>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
