
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { ArrowLeft, Download, Github, BookOpen, Code } from 'lucide-react';
import Footer from '@/components/footer';

const sdks = [
  {
    name: "JavaScript SDK",
    description: "Full-featured SDK for JavaScript and TypeScript applications",
    version: "v2.1.0",
    downloads: "50K+",
    language: "JavaScript",
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    name: "Python SDK",
    description: "Comprehensive Python library for server-side applications",
    version: "v1.8.0",
    downloads: "30K+",
    language: "Python",
    color: "bg-blue-100 text-blue-800"
  },
  {
    name: "Node.js SDK",
    description: "Native Node.js SDK with TypeScript support",
    version: "v2.0.5",
    downloads: "45K+",
    language: "Node.js",
    color: "bg-green-100 text-green-800"
  },
  {
    name: "PHP SDK",
    description: "Easy-to-use PHP library for web applications",
    version: "v1.5.2",
    downloads: "20K+",
    language: "PHP",
    color: "bg-purple-100 text-purple-800"
  },
  {
    name: "Go SDK",
    description: "High-performance SDK for Go applications",
    version: "v1.3.0",
    downloads: "15K+",
    language: "Go",
    color: "bg-cyan-100 text-cyan-800"
  },
  {
    name: "Ruby SDK",
    description: "Ruby gem for Rails and Sinatra applications",
    version: "v1.4.1",
    downloads: "12K+",
    language: "Ruby",
    color: "bg-red-100 text-red-800"
  }
];

const codeExamples = {
  javascript: `import { ImageVault } from '@imagevault/sdk';

const client = new ImageVault('your-api-key');

// Upload an image
const result = await client.upload(file, {
  folder: 'avatars',
  quality: 90
});

console.log('Image URL:', result.url);`,

  python: `from imagevault import ImageVault

client = ImageVault('your-api-key')

# Upload an image
with open('image.jpg', 'rb') as f:
    result = client.upload(f, folder='avatars', quality=90)
    
print(f'Image URL: {result.url}')`,

  nodejs: `const { ImageVault } = require('@imagevault/node');

const client = new ImageVault('your-api-key');

// Upload an image
client.upload('path/to/image.jpg', {
  folder: 'avatars',
  quality: 90
}).then(result => {
  console.log('Image URL:', result.url);
});`
};

export default function SDKs() {
  const [selectedLanguage, setSelectedLanguage] = React.useState('javascript');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            SDKs & Libraries
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Official SDKs and libraries to integrate ImageVault into your applications
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {sdks.map((sdk, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={sdk.color}>{sdk.language}</Badge>
                  <span className="text-sm text-gray-500">{sdk.version}</span>
                </div>
                <CardTitle>{sdk.name}</CardTitle>
                <CardDescription>{sdk.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">{sdk.downloads} downloads</span>
                </div>
                <div className="space-y-2">
                  <Button className="w-full" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Install
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Github className="w-4 h-4 mr-1" />
                      Source
                    </Button>
                    <Button variant="outline" size="sm">
                      <BookOpen className="w-4 h-4 mr-1" />
                      Docs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Quick Start
            </h2>
            
            <div className="mb-6">
              <div className="flex space-x-2 mb-4">
                {Object.keys(codeExamples).map((lang) => (
                  <Button
                    key={lang}
                    variant={selectedLanguage === lang ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </Button>
                ))}
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <code>{codeExamples[selectedLanguage]}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Installation
              </h3>
              <Card>
                <CardContent className="py-4">
                  <div className="space-y-2">
                    <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      npm install @imagevault/sdk
                    </div>
                    <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      pip install imagevault
                    </div>
                    <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      go get github.com/imagevault/go-sdk
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Features
            </h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Code className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle>Type Safety</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Full TypeScript support with comprehensive type definitions
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Download className="w-8 h-8 text-green-600 mb-2" />
                  <CardTitle>Easy Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Simple APIs that integrate seamlessly with your existing codebase
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BookOpen className="w-8 h-8 text-purple-600 mb-2" />
                  <CardTitle>Comprehensive Docs</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Detailed documentation with examples and best practices
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Need Help?
              </h3>
              <div className="space-y-3">
                <Link href="/docs">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    API Documentation
                  </Button>
                </Link>
                <Link href="/guides">
                  <Button variant="outline" className="w-full justify-start">
                    <Code className="w-4 h-4 mr-2" />
                    Integration Guides
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="w-full justify-start">
                    <Github className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
