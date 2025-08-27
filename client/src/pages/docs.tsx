
import { useState } from "react";
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
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Docs() {
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
        <code className="text-gray-800 dark:text-gray-200">{code}</code>
      </pre>
    </div>
  );

  const sidebarItems = [
    { id: "getting-started", title: "Getting Started", icon: BookOpen },
    { id: "authentication", title: "Authentication", icon: Key },
    { id: "upload-api", title: "Upload API", icon: Upload },
    { id: "image-api", title: "Image Management", icon: Download },
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
                        code={`curl -X GET "https://api.imagevault.io/v1/images" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                        language="bash"
                        id="auth-example"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">JavaScript Example</h3>
                      <CodeBlock 
                        code={`const response = await fetch('https://api.imagevault.io/v1/images', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
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
                        /v1/upload
                      </code>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Request</h3>
                      <CodeBlock 
                        code={`curl -X POST "https://api.imagevault.io/v1/upload" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@/path/to/image.jpg" \\
  -F "title=My Image" \\
  -F "description=A beautiful image" \\
  -F "tags=nature,landscape"`}
                        language="bash"
                        id="upload-curl"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">JavaScript Example</h3>
                      <CodeBlock 
                        code={`const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('title', 'My Image');
formData.append('description', 'A beautiful image');
formData.append('tags', 'nature,landscape');

const response = await fetch('https://api.imagevault.io/v1/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
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
                        /v1/images
                      </code>
                    </div>

                    <CodeBlock 
                      code={`curl -X GET "https://api.imagevault.io/v1/images?page=1&limit=20" \\
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
                        /v1/images/:id
                      </code>
                    </div>

                    <CodeBlock 
                      code={`curl -X GET "https://api.imagevault.io/v1/images/img_12345" \\
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
                        /v1/images/:id
                      </code>
                    </div>

                    <CodeBlock 
                      code={`curl -X DELETE "https://api.imagevault.io/v1/images/img_12345" \\
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
                    Practical examples for common use cases.
                  </p>
                </div>

                <Tabs defaultValue="upload" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="upload">Image Upload</TabsTrigger>
                    <TabsTrigger value="gallery">Gallery Widget</TabsTrigger>
                    <TabsTrigger value="resize">Image Resizing</TabsTrigger>
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
    <input type="file" id="fileInput" accept="image/*">
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
        formData.append('file', fileInput.files[0]);
        
        try {
            const response = await fetch('https://api.imagevault.io/v1/upload', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer YOUR_API_KEY'
                },
                body: formData
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
        this.baseUrl = 'https://api.imagevault.io/v1';
    }
    
    async loadImages(page = 1, limit = 12) {
        try {
            const response = await fetch(\`\${this.baseUrl}/images?page=\${page}&limit=\${limit}\`, {
                headers: {
                    'Authorization': \`Bearer \${this.apiKey}\`
                }
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
          </div>
        </div>
      </div>
    </div>
  );
}
