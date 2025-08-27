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
  Sliders,
  User,
  Lock,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApiDocs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

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
    <div className="relative mb-6">
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
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-b-lg overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );

  const endpoints = [
    {
      id: "health",
      method: "GET",
      path: "/api/v1/health",
      title: "Health Check",
      description: "Check API status and connectivity",
      category: "System",
      icon: Zap,
      auth: false,
      example: `curl -X GET "https://your-domain.com/api/v1/health"`,
      response: `{
  "status": "OK",
  "timestamp": "2025-08-27T14:18:54.978Z",
  "database": "connected",
  "version": "1.0.0"
}`
    },
    {
      id: "register",
      method: "POST", 
      path: "/api/v1/auth/register",
      title: "User Registration",
      description: "Create a new user account",
      category: "Authentication",
      icon: User,
      auth: false,
      example: `curl -X POST "https://your-domain.com/api/v1/auth/register" \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john@example.com",
    "password": "securepassword123",
    "acceptTerms": true,
    "subscribeNewsletter": false
  }'`,
      response: `{
  "message": "Registration successful. Please check your email to verify your account.",
  "requiresVerification": true
}`
    },
    {
      id: "login",
      method: "POST",
      path: "/api/v1/auth/login", 
      title: "User Login",
      description: "Authenticate user and get access token",
      category: "Authentication",
      icon: Lock,
      auth: false,
      example: `curl -X POST "https://your-domain.com/api/v1/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'`,
      response: `{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": true,
    "isAdmin": false,
    "createdAt": "2025-08-27T10:00:00.000Z"
  }
}`
    },
    {
      id: "user-profile",
      method: "GET",
      path: "/api/v1/auth/user",
      title: "Get User Profile",
      description: "Get current authenticated user information", 
      category: "Authentication",
      icon: User,
      auth: true,
      example: `curl -X GET "https://your-domain.com/api/v1/auth/user" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`,
      response: `{
  "id": "uuid-here",
  "email": "john@example.com", 
  "firstName": "John",
  "lastName": "Doe",
  "emailVerified": true,
  "isAdmin": false,
  "profileImageUrl": null,
  "createdAt": "2025-08-27T10:00:00.000Z"
}`
    },
    {
      id: "change-password",
      method: "PUT",
      path: "/api/v1/auth/change-password",
      title: "Change Password",
      description: "Update user password",
      category: "Authentication", 
      icon: Lock,
      auth: true,
      example: `curl -X PUT "https://your-domain.com/api/v1/auth/change-password" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword456" 
  }'`,
      response: `{
  "message": "Password changed successfully"
}`
    },
    {
      id: "forgot-password",
      method: "POST",
      path: "/api/v1/auth/forgot-password",
      title: "Forgot Password",
      description: "Request password reset email",
      category: "Authentication",
      icon: Mail,
      auth: false,
      example: `curl -X POST "https://your-domain.com/api/v1/auth/forgot-password" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "john@example.com"
  }'`,
      response: `{
  "message": "If an account with that email exists, we have sent a password reset link."
}`
    },
    {
      id: "upload-image",
      method: "POST", 
      path: "/api/v1/images/upload",
      title: "Upload Image",
      description: "Upload and process images with CDN optimization",
      category: "Images",
      icon: Upload,
      auth: true,
      example: `curl -X POST "https://your-domain.com/api/v1/images/upload" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -F "image=@/path/to/image.jpg" \\
  -F "name=My Image" \\
  -F "altText=Description of image" \\
  -F "width=800" \\
  -F "height=600" \\
  -F "quality=85" \\
  -F "format=webp"`,
      response: `{
  "id": "img_uuid_here",
  "url": "https://cdn.imagevault.com/img_uuid_here.webp",
  "originalUrl": "https://cdn.imagevault.com/original/img_uuid_here.jpg",
  "thumbnailUrl": "https://cdn.imagevault.com/thumb/img_uuid_here.webp", 
  "name": "My Image",
  "altText": "Description of image",
  "size": 245760,
  "width": 800,
  "height": 600,
  "format": "webp",
  "createdAt": "2025-08-27T14:30:00.000Z"
}`
    }
  ];

  const filteredEndpoints = endpoints.filter(endpoint =>
    endpoint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(endpoints.map(e => e.category)));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Documentation</h1>
                <p className="text-gray-600 dark:text-gray-300">Complete guide to ImageVault REST API</p>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Start</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">Base URL</h4>
                    <code className="text-xs bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                      https://your-domain.com
                    </code>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">Authentication</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Include JWT token in Authorization header:
                    </p>
                    <code className="text-xs bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded block mt-1">
                      Bearer YOUR_JWT_TOKEN
                    </code>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">Categories</h4>
                    <div className="space-y-1">
                      {categories.map(category => (
                        <Badge key={category} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {filteredEndpoints.map(endpoint => {
                const IconComponent = endpoint.icon;
                return (
                  <Card key={endpoint.id} id={endpoint.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{endpoint.title}</CardTitle>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{endpoint.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {endpoint.auth && (
                            <Badge variant="secondary">
                              <Lock className="w-3 h-3 mr-1" />
                              Auth Required
                            </Badge>
                          )}
                          <Badge variant={endpoint.method === 'GET' ? 'default' : endpoint.method === 'POST' ? 'destructive' : 'secondary'}>
                            {endpoint.method}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">Endpoint</h4>
                          <code className="bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded text-sm font-mono">
                            {endpoint.method} {endpoint.path}
                          </code>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">Example Request</h4>
                          <CodeBlock 
                            code={endpoint.example}
                            language="bash"
                            id={`example-${endpoint.id}`}
                          />
                        </div>

                        <div>
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">Example Response</h4>
                          <CodeBlock 
                            code={endpoint.response}
                            language="json"
                            id={`response-${endpoint.id}`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}