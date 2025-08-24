import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Code, Upload, Key, Image, Settings, BarChart3 } from "lucide-react";

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ImageVault API Documentation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Complete guide to integrating with ImageVault's professional image hosting API. 
              Upload, transform, and deliver images at scale.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <Badge variant="secondary">REST API</Badge>
              <Badge variant="secondary">Rate Limited</Badge>
              <Badge variant="secondary">CDN Optimized</Badge>
              <Badge variant="secondary">Real-time Processing</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="sticky top-8 space-y-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Navigation</h3>
              <a href="#authentication" className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
                Authentication
              </a>
              <a href="#upload" className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
                Upload Images
              </a>
              <a href="#transform" className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
                Image Transforms
              </a>
              <a href="#manage" className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
                Manage Images
              </a>
              <a href="#analytics" className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
                Analytics
              </a>
              <a href="#errors" className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
                Error Codes
              </a>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Getting Started */}
            <Card id="authentication">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  <CardTitle>Authentication</CardTitle>
                </div>
                <CardDescription>
                  All API requests require authentication using an API key.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Generate an API Key</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Create an API key from your dashboard at <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">/api/keys</code>
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">2. Include in Headers</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400">
                    <div>Authorization: Bearer your-api-key-here</div>
                    <div className="text-gray-500">Content-Type: application/json</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Images */}
            <Card id="upload">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  <CardTitle>Upload Images</CardTitle>
                </div>
                <CardDescription>
                  Upload images with optional transformations and metadata.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Upload</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400">
                    <div>POST /api/upload</div>
                    <div className="text-gray-500 mt-2">Content-Type: multipart/form-data</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Form Parameters</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Parameter</th>
                          <th className="text-left py-2">Type</th>
                          <th className="text-left py-2">Required</th>
                          <th className="text-left py-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 dark:text-gray-300">
                        <tr className="border-b">
                          <td className="py-2"><code>image</code></td>
                          <td>File</td>
                          <td>Yes</td>
                          <td>Image file (JPEG, PNG, WebP)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>title</code></td>
                          <td>String</td>
                          <td>No</td>
                          <td>Image title</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>description</code></td>
                          <td>String</td>
                          <td>No</td>
                          <td>Image description</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>isPublic</code></td>
                          <td>Boolean</td>
                          <td>No</td>
                          <td>Make image publicly accessible</td>
                        </tr>
                        <tr>
                          <td className="py-2"><code>tags</code></td>
                          <td>JSON Array</td>
                          <td>No</td>
                          <td>Array of tags for organization</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Example Request</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400">
                    <div>curl -X POST /api/upload \</div>
                    <div className="ml-4">-H "Authorization: Bearer your-api-key" \</div>
                    <div className="ml-4">-F "image=@photo.jpg" \</div>
                    <div className="ml-4">-F "title=My Photo" \</div>
                    <div className="ml-4">-F "isPublic=true"</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image Transforms */}
            <Card id="transform">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  <CardTitle>Image Transformations</CardTitle>
                </div>
                <CardDescription>
                  Apply real-time transformations during upload or via URL parameters.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Available Transforms</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-sm">Resize</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-300">width, height, quality</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Format</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-300">jpeg, png, webp, avif</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Filters</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-300">blur, brightness, contrast</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Effects</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-300">grayscale, saturation, hue</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">URL Transform Example</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-blue-300 break-all">
                    https://cdn.imagevault.app/uploads/abc123.jpg?w=800&h=600&quality=85&format=webp
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Get Images */}
            <Card id="manage">
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
                  <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400">
                    <div>GET /api/images?page=1&limit=20</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Get Public Images</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400">
                    <div>GET /api/public/images?page=1&limit=20</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card id="analytics">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <CardTitle>Analytics & Tracking</CardTitle>
                </div>
                <CardDescription>
                  Track image views, downloads, and performance metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Analytics are automatically tracked for all images. View detailed metrics in your dashboard at <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">/analytics</code>.
                </p>
              </CardContent>
            </Card>

            {/* Error Codes */}
            <Card id="errors">
              <CardHeader>
                <CardTitle>Common Error Codes</CardTitle>
                <CardDescription>
                  Standard HTTP status codes and error responses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <code>400</code>
                    <span className="text-gray-600 dark:text-gray-300">Bad Request - Invalid parameters</span>
                  </div>
                  <div className="flex justify-between">
                    <code>401</code>
                    <span className="text-gray-600 dark:text-gray-300">Unauthorized - Invalid API key</span>
                  </div>
                  <div className="flex justify-between">
                    <code>413</code>
                    <span className="text-gray-600 dark:text-gray-300">Payload Too Large - File size limit exceeded</span>
                  </div>
                  <div className="flex justify-between">
                    <code>429</code>
                    <span className="text-gray-600 dark:text-gray-300">Too Many Requests - Rate limit exceeded</span>
                  </div>
                  <div className="flex justify-between">
                    <code>500</code>
                    <span className="text-gray-600 dark:text-gray-300">Internal Server Error - Server issue</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SDK & Libraries */}
            <Card>
              <CardHeader>
                <CardTitle>SDK & Libraries</CardTitle>
                <CardDescription>
                  Official SDKs and community libraries for popular languages.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" asChild>
                    <a href="/auth/register" target="_blank">
                      JavaScript SDK
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/auth/register" target="_blank">
                      Python SDK
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/auth/register" target="_blank">
                      Node.js SDK
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/auth/register" target="_blank">
                      PHP SDK
                    </a>
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