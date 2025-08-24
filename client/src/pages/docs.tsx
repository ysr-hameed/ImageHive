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
                          <td>Image file (JPEG, PNG, WebP, GIF, BMP) - Max 50MB</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>title</code></td>
                          <td>String</td>
                          <td>No</td>
                          <td>Image title (max 255 characters)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>description</code></td>
                          <td>String</td>
                          <td>No</td>
                          <td>Image description (max 1000 characters)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>isPublic</code></td>
                          <td>Boolean</td>
                          <td>No</td>
                          <td>Make image publicly accessible (default: false)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>tags</code></td>
                          <td>JSON Array</td>
                          <td>No</td>
                          <td>Array of tags for organization (max 10 tags, 50 chars each)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>quality</code></td>
                          <td>Integer</td>
                          <td>No</td>
                          <td>JPEG quality (1-100, default: 85)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>width</code></td>
                          <td>Integer</td>
                          <td>No</td>
                          <td>Resize width in pixels (max 4000px)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>height</code></td>
                          <td>Integer</td>
                          <td>No</td>
                          <td>Resize height in pixels (max 4000px)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>format</code></td>
                          <td>String</td>
                          <td>No</td>
                          <td>Output format: jpeg, png, webp, avif (default: auto)</td>
                        </tr>
                        <tr>
                          <td className="py-2"><code>watermark</code></td>
                          <td>Boolean</td>
                          <td>No</td>
                          <td>Apply custom watermark (Pro plan feature)</td>
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
                    <div className="ml-4">-H "Content-Type: multipart/form-data" \</div>
                    <div className="ml-4">-F "image=@photo.jpg" \</div>
                    <div className="ml-4">-F "title=Professional Headshot" \</div>
                    <div className="ml-4">-F "description=Corporate headshot for company website" \</div>
                    <div className="ml-4">-F "isPublic=true" \</div>
                    <div className="ml-4">-F 'tags=["professional", "headshot", "corporate"]' \</div>
                    <div className="ml-4">-F "width=800" \</div>
                    <div className="ml-4">-F "height=600" \</div>
                    <div className="ml-4">-F "quality=90" \</div>
                    <div className="ml-4">-F "format=webp"</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Example Response</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-blue-300">
                    <div>{'{'}</div>
                    <div className="ml-2">"success": true,</div>
                    <div className="ml-2">"data": {'{'}</div>
                    <div className="ml-4">"id": "img_abc123def456",</div>
                    <div className="ml-4">"url": "https://cdn.imagevault.app/uploads/abc123.webp",</div>
                    <div className="ml-4">"thumbnailUrl": "https://cdn.imagevault.app/thumbnails/abc123.webp",</div>
                    <div className="ml-4">"title": "Professional Headshot",</div>
                    <div className="ml-4">"size": 245760,</div>
                    <div className="ml-4">"width": 800,</div>
                    <div className="ml-4">"height": 600,</div>
                    <div className="ml-4">"format": "webp",</div>
                    <div className="ml-4">"isPublic": true,</div>
                    <div className="ml-4">"createdAt": "2024-01-15T10:30:00Z"</div>
                    <div className="ml-2">{'}'}</div>
                    <div>{'}'}</div>
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
                  <h4 className="font-medium mb-2">Transform Parameters</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Parameter</th>
                          <th className="text-left py-2">Values</th>
                          <th className="text-left py-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 dark:text-gray-300">
                        <tr className="border-b">
                          <td className="py-2"><code>w</code> / <code>width</code></td>
                          <td>1-4000</td>
                          <td>Resize width in pixels</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>h</code> / <code>height</code></td>
                          <td>1-4000</td>
                          <td>Resize height in pixels</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>quality</code> / <code>q</code></td>
                          <td>1-100</td>
                          <td>JPEG/WebP quality (default: 85)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>format</code> / <code>f</code></td>
                          <td>jpeg, png, webp, avif</td>
                          <td>Output format (default: auto)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>fit</code></td>
                          <td>cover, contain, fill, inside, outside</td>
                          <td>How to resize image (default: cover)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>blur</code></td>
                          <td>0.3-1000</td>
                          <td>Gaussian blur radius</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>brightness</code></td>
                          <td>0.1-3.0</td>
                          <td>Brightness multiplier (1.0 = no change)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>contrast</code></td>
                          <td>0.1-3.0</td>
                          <td>Contrast multiplier (1.0 = no change)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>saturation</code></td>
                          <td>0.0-3.0</td>
                          <td>Saturation multiplier (0 = grayscale)</td>
                        </tr>
                        <tr>
                          <td className="py-2"><code>rotate</code></td>
                          <td>0-360</td>
                          <td>Rotation angle in degrees</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">URL Transform Examples</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Basic resize with format conversion:</p>
                      <div className="bg-gray-900 rounded-lg p-3 text-sm font-mono text-blue-300 break-all">
                        https://cdn.imagevault.app/uploads/abc123.jpg?w=800&h=600&format=webp
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">High quality with effects:</p>
                      <div className="bg-gray-900 rounded-lg p-3 text-sm font-mono text-blue-300 break-all">
                        https://cdn.imagevault.app/uploads/abc123.jpg?w=1200&q=95&brightness=1.1&contrast=1.05
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Thumbnail with blur effect:</p>
                      <div className="bg-gray-900 rounded-lg p-3 text-sm font-mono text-blue-300 break-all">
                        https://cdn.imagevault.app/uploads/abc123.jpg?w=300&h=300&fit=cover&blur=2
                      </div>
                    </div>
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
                    <div>GET /api/images?page=1&limit=20&sortBy=createdAt&order=desc&tag=professional</div>
                  </div>
                  <div className="mt-2">
                    <h5 className="font-medium text-sm">Query Parameters:</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 mt-1 space-y-1">
                      <li><code>page</code> - Page number (default: 1)</li>
                      <li><code>limit</code> - Items per page (max: 100, default: 20)</li>
                      <li><code>sortBy</code> - Sort field: createdAt, size, title (default: createdAt)</li>
                      <li><code>order</code> - Sort order: asc, desc (default: desc)</li>
                      <li><code>tag</code> - Filter by tag</li>
                      <li><code>isPublic</code> - Filter by visibility: true, false</li>
                      <li><code>format</code> - Filter by format: jpeg, png, webp, gif</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Get Image Details</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400">
                    <div>GET /api/images/{'{imageId}'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Update Image</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-yellow-400">
                    <div>PATCH /api/images/{'{imageId}'}</div>
                    <div className="text-gray-500 mt-2">Body: {'{"title": "New Title", "isPublic": false}'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Delete Image</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-red-400">
                    <div>DELETE /api/images/{'{imageId}'}</div>
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
                  Official SDKs and code examples for popular programming languages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">JavaScript / Node.js</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400">
                    <div className="text-gray-500">// npm install imagevault-js</div>
                    <div className="mt-2">import ImageVault from 'imagevault-js';</div>
                    <div></div>
                    <div>const client = new ImageVault('your-api-key');</div>
                    <div></div>
                    <div>// Upload image</div>
                    <div>const result = await client.upload(file, {'{'}</div>
                    <div className="ml-2">title: 'My Image',</div>
                    <div className="ml-2">isPublic: true,</div>
                    <div className="ml-2">width: 800,</div>
                    <div className="ml-2">format: 'webp'</div>
                    <div>{'});'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Python</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400">
                    <div className="text-gray-500"># pip install imagevault-python</div>
                    <div className="mt-2">from imagevault import ImageVault</div>
                    <div></div>
                    <div>client = ImageVault('your-api-key')</div>
                    <div></div>
                    <div># Upload image</div>
                    <div>with open('image.jpg', 'rb') as f:</div>
                    <div className="ml-4">result = client.upload(f, {'{'}</div>
                    <div className="ml-8">'title': 'My Image',</div>
                    <div className="ml-8">'isPublic': True,</div>
                    <div className="ml-8">'width': 800</div>
                    <div className="ml-4">{'})'})</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">PHP</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400">
                    <div className="text-gray-500">// composer require imagevault/php-sdk</div>
                    <div className="mt-2">use ImageVault\Client;</div>
                    <div></div>
                    <div>$client = new Client('your-api-key');</div>
                    <div></div>
                    <div>// Upload image</div>
                    <div>$result = $client-{'>'} upload('image.jpg', [</div>
                    <div className="ml-4">'title' ={'>'} 'My Image',</div>
                    <div className="ml-4">'isPublic' ={'>'} true,</div>
                    <div className="ml-4">'width' ={'>'} 800</div>
                    <div>]);</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">curl Example</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400">
                    <div># Using curl with JSON response parsing</div>
                    <div>response=$(curl -s -X POST /api/upload \</div>
                    <div className="ml-4">-H "Authorization: Bearer $API_KEY" \</div>
                    <div className="ml-4">-F "image=@image.jpg" \</div>
                    <div className="ml-4">-F "title=My Image")</div>
                    <div></div>
                    <div>image_url=$(echo $response | jq -r '.data.url')</div>
                    <div>echo "Image uploaded: $image_url"</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}