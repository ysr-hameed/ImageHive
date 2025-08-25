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
  BarChart3
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const codeExamples = {
  javascript: {
    upload: `// Upload an image
const formData = new FormData();
formData.append('image', file);
formData.append('privacy', 'public');

const response = await fetch('/api/v1/images/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
});

const result = await response.json();
console.log('Image uploaded:', result.url);`,

    fetch: `// Fetch images
const response = await fetch('/api/v1/images', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const images = await response.json();
console.log('Images:', images);`,

    delete: `// Delete an image
const response = await fetch('/api/v1/images/{imageId}', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

console.log('Image deleted:', response.ok);`
  },

  python: {
    upload: `import requests

# Upload an image
with open('image.jpg', 'rb') as f:
    files = {'image': f}
    data = {'privacy': 'public'}
    headers = {'Authorization': 'Bearer YOUR_API_KEY'}

    response = requests.post('/api/v1/images/upload', 
                           files=files, 
                           data=data, 
                           headers=headers)

    result = response.json()
    print(f"Image uploaded: {result['url']}")`,

    fetch: `import requests

# Fetch images
headers = {'Authorization': 'Bearer YOUR_API_KEY'}
response = requests.get('/api/v1/images', headers=headers)

images = response.json()
print(f"Images: {images}")`,

    delete: `import requests

# Delete an image
headers = {'Authorization': 'Bearer YOUR_API_KEY'}
response = requests.delete('/api/v1/images/{imageId}', headers=headers)

print(f"Image deleted: {response.ok}")`
  }
};

export default function ApiDocs() {
  const { isAuthenticated } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [searchQuery, setSearchQuery] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/v1/images/upload',
      description: 'Upload a new image',
      auth: true,
      parameters: [
        { name: 'image', type: 'File', required: true, description: 'Image file to upload' },
        { name: 'privacy', type: 'String', required: false, description: 'public or private (default: public)' },
        { name: 'description', type: 'String', required: false, description: 'Image description' },
        { name: 'altText', type: 'String', required: false, description: 'Alt text for accessibility' },
        { name: 'tags', type: 'String', required: false, description: 'Comma-separated tags' }
      ]
    },
    {
      method: 'GET',
      path: '/api/v1/images',
      description: 'List all images',
      auth: true,
      parameters: [
        { name: 'page', type: 'Number', required: false, description: 'Page number (default: 1)' },
        { name: 'limit', type: 'Number', required: false, description: 'Items per page (default: 20)' },
        { name: 'search', type: 'String', required: false, description: 'Search query' },
        { name: 'privacy', type: 'String', required: false, description: 'Filter by privacy setting' }
      ]
    },
    {
      method: 'GET',
      path: '/api/v1/images/{id}',
      description: 'Get image details',
      auth: true,
      parameters: [
        { name: 'id', type: 'String', required: true, description: 'Image ID' }
      ]
    },
    {
      method: 'PUT',
      path: '/api/v1/images/{id}',
      description: 'Update image metadata',
      auth: true,
      parameters: [
        { name: 'id', type: 'String', required: true, description: 'Image ID' },
        { name: 'description', type: 'String', required: false, description: 'Image description' },
        { name: 'altText', type: 'String', required: false, description: 'Alt text for accessibility' },
        { name: 'tags', type: 'String', required: false, description: 'Comma-separated tags' },
        { name: 'privacy', type: 'String', required: false, description: 'public or private' }
      ]
    },
    {
      method: 'DELETE',
      path: '/api/v1/images/{id}',
      description: 'Delete an image',
      auth: true,
      parameters: [
        { name: 'id', type: 'String', required: true, description: 'Image ID' }
      ]
    },
    {
      method: 'GET',
      path: '/api/v1/analytics/usage',
      description: 'Get usage statistics',
      auth: true,
      parameters: []
    }
  ];

  const filteredEndpoints = endpoints.filter(endpoint =>
    endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="#getting-started" className="block py-2 px-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                  Getting Started
                </a>
                <a href="#authentication" className="block py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                  Authentication
                </a>
                <a href="#endpoints" className="block py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                  API Endpoints
                </a>
                <a href="#examples" className="block py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                  Code Examples
                </a>
                <a href="#errors" className="block py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                  Error Handling
                </a>
                <a href="#rate-limits" className="block py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                  Rate Limits
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Getting Started */}
            <section id="getting-started">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <p>
                    Welcome to the ImageVault API! Our REST API allows you to upload, manage, and serve images at scale.
                    Get started by creating an API key and making your first request.
                  </p>

                  <h4>Base URL</h4>
                  <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-md font-mono text-sm">
                    https://your-domain.com/api/v1
                  </div>

                  {isAuthenticated && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                        <Key className="w-4 h-4 inline mr-1" />
                        Ready to get started?
                      </p>
                      <Button asChild size="sm">
                        <a href="/api-keys">
                          Generate API Key
                        </a>
                      </Button>
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
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <p>
                    All API requests require authentication using an API key. Include your API key in the Authorization header:
                  </p>

                  <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-md font-mono text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mt-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Keep your API key secure and never expose it in client-side code.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* API Endpoints */}
            <section id="endpoints">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="w-5 h-5" />
                    API Endpoints
                  </CardTitle>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search endpoints..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {filteredEndpoints.map((endpoint, index) => (
                      <div key={index} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant={endpoint.method === 'GET' ? 'default' : 
                                       endpoint.method === 'POST' ? 'destructive' :
                                       endpoint.method === 'PUT' ? 'secondary' : 'outline'}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                          {endpoint.auth && (
                            <Badge variant="outline" className="text-xs">
                              <Key className="w-3 h-3 mr-1" />
                              Auth Required
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {endpoint.description}
                        </p>

                        {endpoint.parameters.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold mb-2">Parameters</h5>
                            <div className="space-y-2">
                              {endpoint.parameters.map((param, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm">
                                  <code className="font-mono bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
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
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {param.description}
                                  </span>
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
                    Code Examples
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <TabsList>
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                    </TabsList>

                    <TabsContent value={selectedLanguage} className="space-y-6">
                      {Object.entries(codeExamples[selectedLanguage as keyof typeof codeExamples]).map(([operation, code]) => (
                        <div key={operation} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold capitalize">{operation.replace('_', ' ')}</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(code)}
                            >
                              <Copy className="w-4 h-4" />
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

            {/* Error Handling */}
            <section id="errors">
              <Card>
                <CardHeader>
                  <CardTitle>Error Handling</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <p>The API uses conventional HTTP response codes to indicate success or failure:</p>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="default">200</Badge>
                      <span>Success</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">400</Badge>
                      <span>Bad Request - Invalid parameters</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">401</Badge>
                      <span>Unauthorized - Invalid API key</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">403</Badge>
                      <span>Forbidden - Insufficient permissions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">404</Badge>
                      <span>Not Found - Resource doesn't exist</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">429</Badge>
                      <span>Too Many Requests - Rate limit exceeded</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">500</Badge>
                      <span>Internal Server Error</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Rate Limits */}
            <section id="rate-limits">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Rate Limits
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <p>API rate limits vary by plan:</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                      <h4 className="font-semibold">Free Plan</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        100 requests/hour
                      </p>
                    </div>
                    <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                      <h4 className="font-semibold">Pro Plan</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        1,000 requests/hour
                      </p>
                    </div>
                    <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                      <h4 className="font-semibold">Enterprise</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Custom limits
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Rate limit information is included in response headers: <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, and <code>X-RateLimit-Reset</code>.
                    </p>
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