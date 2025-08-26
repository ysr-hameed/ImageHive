
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { ArrowLeft, Clock, User, ArrowRight } from 'lucide-react';
import Footer from '@/components/footer';

const guides = [
  {
    title: "Getting Started with ImageVault",
    description: "Complete beginner's guide to setting up your account and uploading your first image",
    difficulty: "Beginner",
    readTime: "5 min",
    category: "Setup"
  },
  {
    title: "API Integration Guide",
    description: "Step-by-step guide to integrate ImageVault API into your application",
    difficulty: "Intermediate",
    readTime: "15 min",
    category: "Development"
  },
  {
    title: "Image Optimization Best Practices",
    description: "Learn how to optimize images for better performance and user experience",
    difficulty: "Intermediate",
    readTime: "10 min",
    category: "Optimization"
  },
  {
    title: "Setting Up Custom Domains",
    description: "Configure custom domains for your image hosting needs",
    difficulty: "Advanced",
    readTime: "20 min",
    category: "Configuration"
  },
  {
    title: "Bulk Upload with Node.js",
    description: "Implement efficient bulk image uploading using our Node.js SDK",
    difficulty: "Advanced",
    readTime: "25 min",
    category: "Development"
  },
  {
    title: "CDN Configuration Guide",
    description: "Optimize your CDN settings for maximum performance",
    difficulty: "Advanced",
    readTime: "18 min",
    category: "Performance"
  }
];

const categories = ["All", "Setup", "Development", "Optimization", "Configuration", "Performance"];

export default function Guides() {
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const filteredGuides = selectedCategory === "All" 
    ? guides 
    : guides.filter(guide => guide.category === selectedCategory);

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
            Guides
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Comprehensive tutorials and guides to help you master ImageVault
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow group">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{guide.category}</Badge>
                  <Badge 
                    variant={guide.difficulty === 'Beginner' ? 'default' : 
                            guide.difficulty === 'Intermediate' ? 'secondary' : 'destructive'}
                  >
                    {guide.difficulty}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {guide.title}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {guide.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{guide.readTime}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Need Help with Something Specific?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="space-x-4">
            <Link href="/contact">
              <Button size="lg">Contact Support</Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg">API Documentation</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
