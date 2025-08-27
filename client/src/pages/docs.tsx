
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, Code, Database, Upload, Shield, Zap, ArrowRight, ExternalLink } from "lucide-react";

export default function Docs() {
  const sections = [
    {
      title: "Getting Started",
      description: "Quick start guide to begin using ImageVault",
      icon: Zap,
      links: [
        { name: "Authentication", href: "#auth" },
        { name: "Upload Images", href: "#upload" },
        { name: "API Keys", href: "#api-keys" },
      ]
    },
    {
      title: "API Reference",
      description: "Complete API documentation",
      icon: Code,
      links: [
        { name: "REST API", href: "#rest-api" },
        { name: "Upload API", href: "#upload-api" },
        { name: "Management API", href: "#management-api" },
      ]
    },
    {
      title: "SDKs & Libraries",
      description: "Official SDKs and community libraries",
      icon: Database,
      links: [
        { name: "JavaScript SDK", href: "#js-sdk" },
        { name: "Python SDK", href: "#python-sdk" },
        { name: "React Components", href: "#react-sdk" },
      ]
    },
    {
      title: "Security",
      description: "Security best practices and guidelines",
      icon: Shield,
      links: [
        { name: "API Security", href: "#security" },
        { name: "Rate Limiting", href: "#rate-limits" },
        { name: "CORS Setup", href: "#cors" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Documentation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Everything you need to integrate ImageVault into your applications
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Quick Start
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Get up and running with ImageVault in minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Create Account</h4>
                    <p className="text-blue-700 dark:text-blue-300">Sign up for a free ImageVault account</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Get API Key</h4>
                    <p className="text-blue-700 dark:text-blue-300">Generate your API key from the dashboard</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Start Uploading</h4>
                    <p className="text-blue-700 dark:text-blue-300">Use our API or SDK to upload images</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/auth/register">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Get Started Free
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
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
                <div className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.href}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="text-sm font-medium">{link.name}</span>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Example Code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Example Usage</CardTitle>
            <CardDescription>
              Here's how to upload an image using our JavaScript SDK
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{`// Install the SDK
npm install @imagevault/sdk

// Import and initialize
import ImageVault from '@imagevault/sdk';

const vault = new ImageVault({
  apiKey: 'your-api-key-here'
});

// Upload an image
const result = await vault.upload({
  file: imageFile,
  folder: 'uploads',
  metadata: {
    title: 'My Image',
    tags: ['photo', 'landscape']
  }
});

console.log('Image uploaded:', result.url);`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
