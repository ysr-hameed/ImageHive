
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import Footer from '@/components/footer';

const blogPosts = [
  {
    title: "Introducing ImageVault: The Future of Image Hosting",
    description: "Learn about our vision and what makes ImageVault different from other image hosting solutions.",
    category: "Product",
    date: "December 1, 2024",
    author: "Sarah Chen",
    readTime: "5 min read"
  },
  {
    title: "Building a Global CDN: Performance at Scale",
    description: "Deep dive into how we built our global content delivery network to serve images lightning fast.",
    category: "Engineering",
    date: "November 28, 2024",
    author: "Alex Rodriguez",
    readTime: "8 min read"
  },
  {
    title: "Security Best Practices for Image Storage",
    description: "Essential security measures every developer should consider when handling user-uploaded images.",
    category: "Security",
    date: "November 25, 2024",
    author: "Mike Johnson",
    readTime: "6 min read"
  },
  {
    title: "API Design Philosophy: Simplicity Meets Power",
    description: "How we designed our API to be both simple for beginners and powerful for advanced use cases.",
    category: "Developer",
    date: "November 22, 2024",
    author: "Emma Davis",
    readTime: "7 min read"
  }
];

export default function Blog() {
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
            Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Insights, updates, and technical deep-dives from the ImageVault team
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {blogPosts.map((post, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span className="text-sm text-gray-500">{post.readTime}</span>
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">{post.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Subscribe to get the latest updates and insights
          </p>
          <Button size="lg">Subscribe to Newsletter</Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
