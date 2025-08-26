
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link } from 'wouter';
import { ArrowLeft, Search, Book, MessageCircle, Video, FileText } from 'lucide-react';
import Footer from '@/components/footer';

const helpCategories = [
  {
    icon: Book,
    title: "Getting Started",
    description: "Learn the basics of ImageVault",
    articles: 12
  },
  {
    icon: FileText,
    title: "API Documentation",
    description: "Complete API reference and guides",
    articles: 25
  },
  {
    icon: Video,
    title: "Video Tutorials",
    description: "Step-by-step video guides",
    articles: 8
  },
  {
    icon: MessageCircle,
    title: "Troubleshooting",
    description: "Common issues and solutions",
    articles: 15
  }
];

const popularArticles = [
  "How to upload your first image",
  "Understanding API rate limits",
  "Setting up custom domains",
  "Image optimization best practices",
  "Managing your account settings",
  "Billing and subscription FAQ"
];

export default function Help() {
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
            Help Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Find answers, guides, and resources to help you succeed
          </p>
        </div>

        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for help articles..."
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {helpCategories.map((category, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <category.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <span className="text-sm text-gray-500">{category.articles} articles</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Popular Articles
            </h2>
            <div className="space-y-4">
              {popularArticles.map((article, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{article}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Need More Help?
            </h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>
                    Get personalized help from our support team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/contact">
                    <Button className="w-full">Contact Support</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Join Our Community</CardTitle>
                  <CardDescription>
                    Connect with other developers and get community support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/community">
                    <Button variant="outline" className="w-full">Join Community</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Documentation</CardTitle>
                  <CardDescription>
                    Complete technical documentation and examples
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/docs">
                    <Button variant="outline" className="w-full">View API Docs</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
