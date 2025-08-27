
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, Code, Database, Upload, Shield, Zap, ArrowRight, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Docs() {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast({
      title: "Copied to clipboard",
      description: "Code snippet copied successfully!",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    {
      title: "Authentication",
      description: "API key management and authentication",
      icon: Shield,
      items: [
        { name: "API Keys", href: "#api-keys", description: "Create and manage API keys" },
        { name: "Authentication", href: "#auth", description: "How to authenticate requests" },
        { name: "Rate Limits", href: "#rate-limits", description: "Understanding rate limiting" },
      ]
    },
    {
      title: "Image Upload",
      description: "Upload and manage your images",
      icon: Upload,
      items: [
        { name: "Upload API", href: "#upload", description: "Upload images via API" },
        { name: "Batch Upload", href: "#batch-upload", description: "Upload multiple images" },
        { name: "Metadata", href: "#metadata", description: "Add custom metadata" },
      ]
    },
    {
      title: "Image Processing",
      description: "Transform and optimize images",
      icon: Zap,
      items: [
        { name: "Resizing", href: "#resize", description: "Resize images dynamically" },
        { name: "Cropping", href: "#crop", description: "Crop images to specific dimensions" },
        { name: "Optimization", href: "#optimize", description: "Optimize for web delivery" },
      ]
    },
    {
      title: "SDKs & Libraries",
      description: "Official SDKs and integrations",
      icon: Database,
      items: [
        { name: "JavaScript SDK", href: "#js-sdk", description: "Full-featured JavaScript SDK" },
        { name: "React Components", href: "#react-sdk", description: "Ready-to-use React components" },
        { name: "Python SDK", href: "#python-sdk", description: "Python integration library" },
      ]
    }
  ];

  const codeExamples = {
    upload: `// Upload an image using the REST API
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('title', 'My Image');
  formData.append('folder', 'uploads');

  const response = await fetch('https://api.imagevault.dev/v1/upload', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: formData
  });

  const result = await response.json();
  return result.url; // Direct image URL
};`,

    sdk: `// Install and use the JavaScript SDK
npm install @imagevault/sdk

import ImageVault from '@imagevault/sdk';

const vault = new ImageVault({
  apiKey: 'your-api-key-here'
});

// Upload with transformations
const result = await vault.upload({
  file: imageFile,
  folder: 'portfolio',
  transformations: {
    width: 800,
    quality: 85,
    format: 'webp'
  },
  metadata: {
    title: 'Portfolio Image',
    tags: ['portfolio', 'design']
  }
});

console.log('Image URL:', result.url);`,

    react: `// React component for image upload
import { ImageUploader } from '@imagevault/react';

function MyComponent() {
  const handleUpload = (result) => {
    console.log('Upload complete:', result.url);
  };

  return (
    <ImageUploader
      apiKey="your-api-key"
      onUpload={handleUpload}
      folder="user-uploads"
      maxSize={10 * 1024 * 1024} // 10MB
      accept="image/*"
      transformations={{
        width: 1200,
        quality: 90
      }}
    />
  );
}`,

    transforms: `// Dynamic image transformations via URL
const baseUrl = 'https://cdn.imagevault.dev/your-image-id';

// Resize to 400x300
const resized = \`\${baseUrl}?w=400&h=300&fit=cover\`;

// Convert to WebP with 85% quality
const optimized = \`\${baseUrl}?format=webp&quality=85\`;

// Crop and apply blur effect
const processed = \`\${baseUrl}?w=500&h=500&crop=center&blur=2\`;

// Responsive images with srcset
const responsive = \`
  \${baseUrl}?w=400 400w,
  \${baseUrl}?w=800 800w,
  \${baseUrl}?w=1200 1200w
\`;`
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <BookOpen className="mx-auto h-16 w-16 text-blue-600 mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ImageVault API Documentation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              Complete guide to integrating ImageVault's powerful image hosting and processing API into your applications
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                View on GitHub
                <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              ← Back to Home
            </Button>
          </Link>
        </div>

        {/* Quick Start */}
        <div className="mb-12">
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">
                🚀 Quick Start Guide
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Get up and running with ImageVault in under 5 minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Sign Up</h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">Create your free ImageVault account with instant access</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Get API Key</h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">Generate your API key from the dashboard in seconds</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Start Uploading</h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">Use our API or SDK to upload and transform images</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documentation Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {sections.map((section, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <section.icon className="w-8 h-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <a
                      key={itemIndex}
                      href={item.href}
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Code Examples */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Code Examples</h2>
          
          {/* Upload Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Image Upload API
              </CardTitle>
              <CardDescription>
                Upload images directly through our REST API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{codeExamples.upload}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(codeExamples.upload, 'upload')}
                >
                  {copiedCode === 'upload' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SDK Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                JavaScript SDK
              </CardTitle>
              <CardDescription>
                Use our JavaScript SDK for a better developer experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{codeExamples.sdk}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(codeExamples.sdk, 'sdk')}
                >
                  {copiedCode === 'sdk' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* React Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                React Components
              </CardTitle>
              <CardDescription>
                Drop-in React components for quick integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{codeExamples.react}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(codeExamples.react, 'react')}
                >
                  {copiedCode === 'react' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transformations Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Image Transformations
              </CardTitle>
              <CardDescription>
                Apply real-time transformations via URL parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{codeExamples.transforms}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(codeExamples.transforms, 'transforms')}
                >
                  {copiedCode === 'transforms' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Reference */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-2xl">API Reference</CardTitle>
            <CardDescription>
              Complete API documentation with all endpoints and parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Core Endpoints</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <code className="text-sm font-mono text-blue-600">POST /v1/upload</code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Upload single or multiple images</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <code className="text-sm font-mono text-blue-600">GET /v1/images</code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">List all your images</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <code className="text-sm font-mono text-blue-600">DELETE /v1/images/:id</code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Delete an image</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Transform Parameters</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <code className="text-sm font-mono text-green-600">?w=400&h=300</code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Resize to specific dimensions</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <code className="text-sm font-mono text-green-600">?quality=85&format=webp</code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Optimize quality and format</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <code className="text-sm font-mono text-green-600">?crop=center&blur=2</code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Apply crop and effects</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Get Started CTA */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to get started?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                Join thousands of developers using ImageVault to power their applications with fast, reliable image hosting and processing.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg">
                    Create Free Account
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
