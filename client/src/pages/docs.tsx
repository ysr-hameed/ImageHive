
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Search, Code, Book, Key, Upload, Server, Shield, Database, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import Prism for syntax highlighting
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-php';

export default function ApiDocs() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    Prism.highlightAll();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code snippet copied to clipboard",
    });
  };

  const CodeBlock = ({ code, language = 'javascript' }: { code: string; language?: string }) => {
    return (
      <div className="relative">
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 z-10"
          onClick={() => copyToClipboard(code)}
        >
          <Copy className="w-4 h-4" />
        </Button>
        <pre className={`language-${language} rounded-lg p-4 overflow-x-auto`}>
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    );
  };

  const sections = [
    {
      title: "Authentication",
      description: "API authentication and user management",
      icon: Shield,
      items: [
        { 
          name: "Get API Key", 
          href: "#get-api-key", 
          method: "POST",
          endpoint: "/api/v1/auth/api-keys",
          description: "Generate new API key" 
        },
        { 
          name: "User Profile", 
          href: "#user-profile", 
          method: "GET",
          endpoint: "/api/v1/auth/profile",
          description: "Get user information" 
        },
      ]
    },
    {
      title: "Image Management",
      description: "Upload, manage and serve images",
      icon: Upload,
      items: [
        { 
          name: "Upload Image", 
          href: "#upload-image", 
          method: "POST",
          endpoint: "/api/v1/images/upload",
          description: "Upload single or multiple images" 
        },
        { 
          name: "Get Images", 
          href: "#get-images", 
          method: "GET",
          endpoint: "/api/v1/images",
          description: "Retrieve user images with filters" 
        },
        { 
          name: "Delete Image", 
          href: "#delete-image", 
          method: "DELETE",
          endpoint: "/api/v1/images/{id}",
          description: "Remove specific image" 
        },
        { 
          name: "Get Image Details", 
          href: "#image-details", 
          method: "GET",
          endpoint: "/api/v1/images/{id}",
          description: "Get detailed image information" 
        },
      ]
    },
    {
      title: "Custom Domains",
      description: "Manage custom CDN domains",
      icon: Server,
      items: [
        { 
          name: "Add Domain", 
          href: "#add-domain", 
          method: "POST",
          endpoint: "/api/v1/domains",
          description: "Connect custom domains" 
        },
        { 
          name: "Verify Domain", 
          href: "#verify-domain", 
          method: "POST",
          endpoint: "/api/v1/domains/{id}/verify",
          description: "Verify DNS configuration" 
        },
        { 
          name: "List Domains", 
          href: "#list-domains", 
          method: "GET",
          endpoint: "/api/v1/domains",
          description: "Get all domains" 
        },
      ]
    },
    {
      title: "Analytics",
      description: "Usage statistics and analytics",
      icon: Database,
      items: [
        { 
          name: "Usage Stats", 
          href: "#usage-stats", 
          method: "GET",
          endpoint: "/api/v1/analytics/usage",
          description: "Get usage statistics" 
        },
        { 
          name: "Image Analytics", 
          href: "#image-analytics", 
          method: "GET",
          endpoint: "/api/v1/analytics/images",
          description: "Get image view statistics" 
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <Book className="w-12 h-12 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                API Documentation
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Complete guide to ImageVault REST API
              </p>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search API endpoints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Start */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Base URL</h4>
              <CodeBlock code="https://api.imagevault.io" language="bash" />
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Authentication</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Include your API key in the Authorization header:
              </p>
              <CodeBlock 
                code="Authorization: Bearer YOUR_API_KEY" 
                language="bash" 
              />
            </div>

            <div>
              <h4 className="font-semibold mb-2">Example Request</h4>
              <CodeBlock 
                code={`curl -X GET \\
  https://api.imagevault.io/api/v1/images \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                language="bash" 
              />
            </div>
          </CardContent>
        </Card>

        {/* API Sections */}
        <Tabs defaultValue="authentication" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Authentication Tab */}
          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle id="get-api-key">Generate API Key</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">POST</Badge>
                  <code className="text-sm">/api/v1/auth/api-keys</code>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Create a new API key for authentication.</p>
                
                <div>
                  <h5 className="font-semibold mb-2">Request Body</h5>
                  <CodeBlock 
                    code={`{
  "name": "My App Key",
  "permissions": ["images:read", "images:write", "domains:read"]
}`}
                    language="json" 
                  />
                </div>

                <div>
                  <h5 className="font-semibold mb-2">Response</h5>
                  <CodeBlock 
                    code={`{
  "success": true,
  "data": {
    "id": "key_123456",
    "name": "My App Key",
    "key": "iv_live_1234567890abcdef",
    "permissions": ["images:read", "images:write", "domains:read"],
    "createdAt": "2024-01-15T10:00:00Z"
  }
}`}
                    language="json" 
                  />
                </div>

                <div>
                  <h5 className="font-semibold mb-2">JavaScript Example</h5>
                  <CodeBlock 
                    code={`const response = await fetch('/api/v1/auth/api-keys', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    name: 'My App Key',
    permissions: ['images:read', 'images:write']
  })
});

const data = await response.json();
console.log('API Key:', data.data.key);`}
                    language="javascript" 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle id="upload-image">Upload Image</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">POST</Badge>
                  <code className="text-sm">/api/v1/images/upload</code>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Upload one or more images with optional transformations.</p>
                
                <div>
                  <h5 className="font-semibold mb-2">Form Data</h5>
                  <CodeBlock 
                    code={`files: File[] (required)
title: string (optional)
description: string (optional)
privacy: "public" | "private" (default: "public")
quality: number 1-100 (default: 85)
format: "auto" | "jpeg" | "png" | "webp" | "avif" (default: "auto")
width: number (optional)
height: number (optional)`}
                    language="text" 
                  />
                </div>

                <div>
                  <h5 className="font-semibold mb-2">JavaScript Example</h5>
                  <CodeBlock 
                    code={`const formData = new FormData();
formData.append('files', fileInput.files[0]);
formData.append('title', 'My Image');
formData.append('privacy', 'public');
formData.append('quality', '90');

const response = await fetch('/api/v1/images/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
});

const result = await response.json();`}
                    language="javascript" 
                  />
                </div>

                <div>
                  <h5 className="font-semibold mb-2">Response</h5>
                  <CodeBlock 
                    code={`{
  "success": true,
  "data": [
    {
      "id": "img_123456",
      "url": "https://cdn.imagevault.io/img_123456.jpg",
      "originalName": "photo.jpg",
      "size": 245760,
      "width": 1920,
      "height": 1080,
      "format": "jpeg",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}`}
                    language="json" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle id="get-images">Get Images</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-sm">/api/v1/images</code>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Retrieve your uploaded images with optional filters.</p>
                
                <div>
                  <h5 className="font-semibold mb-2">Query Parameters</h5>
                  <CodeBlock 
                    code={`page: number (default: 1)
limit: number (default: 20, max: 100)
search: string (search in filename/title)
privacy: "public" | "private" | "all" (default: "all")
sort: "newest" | "oldest" | "name" | "size" (default: "newest")
tags: string (comma-separated)`}
                    language="text" 
                  />
                </div>

                <div>
                  <h5 className="font-semibold mb-2">Example Request</h5>
                  <CodeBlock 
                    code={`curl -X GET \\
  'https://api.imagevault.io/api/v1/images?page=1&limit=10&privacy=public' \\
  -H 'Authorization: Bearer YOUR_API_KEY'`}
                    language="bash" 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Domains Tab */}
          <TabsContent value="domains" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle id="add-domain">Add Custom Domain</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">POST</Badge>
                  <code className="text-sm">/api/v1/domains</code>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Add a custom domain for serving your images.</p>
                
                <div>
                  <h5 className="font-semibold mb-2">Request Body</h5>
                  <CodeBlock 
                    code={`{
  "domain": "images.yourdomain.com"
}`}
                    language="json" 
                  />
                </div>

                <div>
                  <h5 className="font-semibold mb-2">Python Example</h5>
                  <CodeBlock 
                    code={`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

data = {
    'domain': 'images.yourdomain.com'
}

response = requests.post(
    'https://api.imagevault.io/api/v1/domains',
    headers=headers,
    json=data
)

result = response.json()
print(f"Domain ID: {result['data']['id']}")`}
                    language="python" 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle id="usage-stats">Usage Statistics</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-sm">/api/v1/analytics/usage</code>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Get your account usage statistics.</p>
                
                <div>
                  <h5 className="font-semibold mb-2">Response</h5>
                  <CodeBlock 
                    code={`{
  "success": true,
  "data": {
    "storage": {
      "used": 2147483648,
      "limit": 5368709120,
      "percentage": 40
    },
    "bandwidth": {
      "used": 1073741824,
      "limit": 10737418240,
      "percentage": 10
    },
    "images": {
      "count": 1234,
      "limit": 10000
    },
    "apiCalls": {
      "used": 5000,
      "limit": 100000
    }
  }
}`}
                    language="json" 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* SDKs Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Official SDKs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">JavaScript/TypeScript</h4>
                <CodeBlock 
                  code={`npm install @imagevault/sdk

import { ImageVault } from '@imagevault/sdk';

const client = new ImageVault('your-api-key');
const result = await client.upload(file);`}
                  language="bash" 
                />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Python</h4>
                <CodeBlock 
                  code={`pip install imagevault-python

from imagevault import ImageVault

client = ImageVault('your-api-key')
result = client.upload('path/to/image.jpg')`}
                  language="python" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Rate Limits & Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Rate Limits</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Free Plan: 100 requests/hour</li>
                  <li>Pro Plan: 1,000 requests/hour</li>
                  <li>Enterprise: Custom limits</li>
                  <li>Upload endpoints: Lower limits apply</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Best Practices</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Use pagination for large datasets</li>
                  <li>Cache responses when possible</li>
                  <li>Handle rate limit errors (429)</li>
                  <li>Use webhooks for real-time updates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
