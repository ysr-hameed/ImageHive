import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, Code, Database, Upload, Shield, Zap, ArrowRight, ExternalLink, Copy, CheckCircle, Server, User, Activity } from "lucide-react";
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
      description: "API authentication and user management",
      icon: Shield,
      items: [
        { name: "Login", href: "#login", description: "User authentication" },
        { name: "Register", href: "#register", description: "Create new account" },
        { name: "API Keys", href: "#api-keys", description: "Generate API keys" },
        { name: "User Profile", href: "#user-profile", description: "Get user information" },
      ]
    },
    {
      title: "Image Management",
      description: "Upload, manage and serve images",
      icon: Upload,
      items: [
        { name: "Upload Images", href: "#upload", description: "Upload single or multiple images" },
        { name: "Get Images", href: "#get-images", description: "Retrieve user images" },
        { name: "Delete Images", href: "#delete-images", description: "Remove images" },
        { name: "Image Analytics", href: "#analytics", description: "View image statistics" },
      ]
    },
    {
      title: "Custom Domains",
      description: "Manage custom CDN domains",
      icon: Server,
      items: [
        { name: "Add Domain", href: "#add-domain", description: "Connect custom domains" },
        { name: "Verify Domain", href: "#verify-domain", description: "Verify DNS configuration" },
        { name: "List Domains", href: "#list-domains", description: "Get all domains" },
      ]
    },
    {
      title: "System Endpoints",
      description: "Health checks and admin features",
      icon: Activity,
      items: [
        { name: "Health Check", href: "#health", description: "System status" },
        { name: "Admin Stats", href: "#admin-stats", description: "System statistics" },
        { name: "System Logs", href: "#system-logs", description: "Activity logs" },
      ]
    }
  ];

  const baseUrl = window.location.origin;

  const codeExamples = {
    login: `// Login to get authentication token
const loginUser = async (email, password) => {
  const response = await fetch('${baseUrl}/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json();
  
  if (response.ok) {
    // Store the token for future requests
    localStorage.setItem('token', result.token);
    return result.user;
  } else {
    throw new Error(result.error);
  }
};`,

    register: `// Register a new user account
const registerUser = async (userData) => {
  const response = await fetch('${baseUrl}/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      acceptTerms: true
    })
  });

  const result = await response.json();
  return result;
};`,

    upload: `// Upload an image with processing options
const uploadImage = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('title', options.title || file.name);
  formData.append('description', options.description || '');
  formData.append('privacy', options.privacy || 'public');
  formData.append('quality', options.quality || '85');
  formData.append('format', options.format || 'auto');
  
  if (options.width) formData.append('width', options.width);
  if (options.height) formData.append('height', options.height);

  const token = localStorage.getItem('token');
  const response = await fetch('${baseUrl}/api/v1/images/upload', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`
    },
    body: formData
  });

  const result = await response.json();
  return result.image; // Contains URL and metadata
};`,

    getImages: `// Get all user images with filtering
const getUserImages = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.privacy) params.append('privacy', filters.privacy);
  if (filters.sort) params.append('sort', filters.sort);

  const token = localStorage.getItem('token');
  const response = await fetch(\`${baseUrl}/api/v1/images?\${params}\`, {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer \${token}\`
    }
  });

  const result = await response.json();
  return result.images;
};`,

    apiKeys: `// Create a new API key
const createApiKey = async (name, permissions = ['read']) => {
  const token = localStorage.getItem('token');
  const response = await fetch('${baseUrl}/api/v1/api-keys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({
      name: name,
      permissions: permissions
    })
  });

  const result = await response.json();
  return result.apiKey;
};`,

    customDomain: `// Add a custom domain
const addCustomDomain = async (domain) => {
  const token = localStorage.getItem('token');
  const response = await fetch('${baseUrl}/api/v1/domains', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({ domain })
  });

  const result = await response.json();
  return result; // Returns domain with CNAME target
};`,

    health: `// Check system health
const checkHealth = async () => {
  const response = await fetch('${baseUrl}/api/v1/health');
  const result = await response.json();
  
  console.log('System Status:', result.status);
  console.log('Database:', result.database);
  return result;
};`
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Documentation</h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Complete guide to ImageVault REST API endpoints
              </p>
            </div>
            <Link href="/dashboard" className="inline-flex items-center">
              <Button>
                <ArrowRight className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Start */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Quick Start
              </CardTitle>
              <CardDescription>
                Get started with ImageVault API in minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium">1. Create Account</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Register for a free account to get started
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-medium">2. Generate API Key</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create an API key for authentication
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-medium">3. Upload Images</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Start uploading and serving images instantly
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {sections.map((section) => (
            <Card key={section.title} className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <section.icon className="w-5 h-5 mr-2" />
                  {section.title}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <ArrowRight className="w-3 h-3 mr-2" />
                        {item.name}
                      </a>
                      <p className="text-xs text-gray-500 ml-5 mt-1">
                        {item.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed API Reference */}
        <div className="space-y-8">
          {/* Authentication */}
          <Card id="login">
            <CardHeader>
              <CardTitle>User Login</CardTitle>
              <CardDescription>
                <code className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">
                  POST /api/v1/auth/login
                </code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Request Body</h4>
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                    <pre className="text-sm">
{`{
  "email": "user@example.com",
  "password": "your-password"
}`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Example Code</h4>
                  <div className="relative bg-slate-900 text-green-400 p-4 rounded-lg">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-slate-700"
                      onClick={() => copyToClipboard(codeExamples.login, 'login')}
                    >
                      {copiedCode === 'login' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <pre className="text-sm overflow-x-auto">
                      <code>{codeExamples.login}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="register">
            <CardHeader>
              <CardTitle>User Registration</CardTitle>
              <CardDescription>
                <code className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">
                  POST /api/v1/auth/register
                </code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Request Body</h4>
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                    <pre className="text-sm">
{`{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "acceptTerms": true
}`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Example Code</h4>
                  <div className="relative bg-slate-900 text-green-400 p-4 rounded-lg">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-slate-700"
                      onClick={() => copyToClipboard(codeExamples.register, 'register')}
                    >
                      {copiedCode === 'register' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <pre className="text-sm overflow-x-auto">
                      <code>{codeExamples.register}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="upload">
            <CardHeader>
              <CardTitle>Image Upload</CardTitle>
              <CardDescription>
                <code className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">
                  POST /api/v1/images/upload
                </code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Form Data Parameters</h4>
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div><strong>image:</strong> File (required) - The image file</div>
                      <div><strong>title:</strong> String - Image title</div>
                      <div><strong>description:</strong> String - Image description</div>
                      <div><strong>privacy:</strong> String - "public" or "private"</div>
                      <div><strong>quality:</strong> Number - JPEG quality (1-100)</div>
                      <div><strong>format:</strong> String - "auto", "webp", "jpeg", "png"</div>
                      <div><strong>width:</strong> Number - Resize width</div>
                      <div><strong>height:</strong> Number - Resize height</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Example Code</h4>
                  <div className="relative bg-slate-900 text-green-400 p-4 rounded-lg">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-slate-700"
                      onClick={() => copyToClipboard(codeExamples.upload, 'upload')}
                    >
                      {copiedCode === 'upload' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <pre className="text-sm overflow-x-auto">
                      <code>{codeExamples.upload}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="get-images">
            <CardHeader>
              <CardTitle>Get User Images</CardTitle>
              <CardDescription>
                <code className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">
                  GET /api/v1/images
                </code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Query Parameters</h4>
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div><strong>search:</strong> String - Search in titles and descriptions</div>
                      <div><strong>privacy:</strong> String - Filter by "public" or "private"</div>
                      <div><strong>sort:</strong> String - "newest", "oldest", "name", "size"</div>
                      <div><strong>tags:</strong> String - Comma-separated list of tags</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Example Code</h4>
                  <div className="relative bg-slate-900 text-green-400 p-4 rounded-lg">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-slate-700"
                      onClick={() => copyToClipboard(codeExamples.getImages, 'getImages')}
                    >
                      {copiedCode === 'getImages' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <pre className="text-sm overflow-x-auto">
                      <code>{codeExamples.getImages}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="api-keys">
            <CardHeader>
              <CardTitle>Create API Key</CardTitle>
              <CardDescription>
                <code className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">
                  POST /api/v1/api-keys
                </code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Request Body</h4>
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                    <pre className="text-sm">
{`{
  "name": "My API Key",
  "permissions": ["read", "write", "delete"]
}`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Example Code</h4>
                  <div className="relative bg-slate-900 text-green-400 p-4 rounded-lg">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-slate-700"
                      onClick={() => copyToClipboard(codeExamples.apiKeys, 'apiKeys')}
                    >
                      {copiedCode === 'apiKeys' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <pre className="text-sm overflow-x-auto">
                      <code>{codeExamples.apiKeys}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="add-domain">
            <CardHeader>
              <CardTitle>Add Custom Domain</CardTitle>
              <CardDescription>
                <code className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">
                  POST /api/v1/domains
                </code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Request Body</h4>
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                    <pre className="text-sm">
{`{
  "domain": "images.yourdomain.com"
}`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Example Code</h4>
                  <div className="relative bg-slate-900 text-green-400 p-4 rounded-lg">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-slate-700"
                      onClick={() => copyToClipboard(codeExamples.customDomain, 'customDomain')}
                    >
                      {copiedCode === 'customDomain' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <pre className="text-sm overflow-x-auto">
                      <code>{codeExamples.customDomain}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="health">
            <CardHeader>
              <CardTitle>Health Check</CardTitle>
              <CardDescription>
                <code className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">
                  GET /api/v1/health
                </code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Response</h4>
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                    <pre className="text-sm">
{`{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Example Code</h4>
                  <div className="relative bg-slate-900 text-green-400 p-4 rounded-lg">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-slate-700"
                      onClick={() => copyToClipboard(codeExamples.health, 'health')}
                    >
                      {copiedCode === 'health' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <pre className="text-sm overflow-x-auto">
                      <code>{codeExamples.health}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Response Codes */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>HTTP Response Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 text-green-600">Success Codes</h4>
                <div className="space-y-1 text-sm">
                  <div><code>200</code> - Success</div>
                  <div><code>201</code> - Created</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-red-600">Error Codes</h4>
                <div className="space-y-1 text-sm">
                  <div><code>400</code> - Bad Request</div>
                  <div><code>401</code> - Unauthorized</div>
                  <div><code>403</code> - Forbidden</div>
                  <div><code>404</code> - Not Found</div>
                  <div><code>500</code> - Server Error</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Rate Limiting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Free Plan</h4>
                <div>100 requests per hour</div>
                <div>10 MB max file size</div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Pro Plan</h4>
                <div>1000 requests per hour</div>
                <div>50 MB max file size</div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Enterprise</h4>
                <div>Unlimited requests</div>
                <div>100 MB max file size</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}