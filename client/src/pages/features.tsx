
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { ArrowLeft, Upload, Shield, Zap, Globe, BarChart, Code, Smartphone } from 'lucide-react';
import Footer from '@/components/footer';

const features = [
  {
    icon: Upload,
    title: "Fast Uploads",
    description: "Upload images in seconds with our optimized infrastructure",
    badge: "Core"
  },
  {
    icon: Shield,
    title: "Secure Storage",
    description: "Enterprise-grade security with encrypted storage",
    badge: "Security"
  },
  {
    icon: Zap,
    title: "Lightning CDN",
    description: "Global CDN ensures fast delivery worldwide",
    badge: "Performance"
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Serve images from 200+ edge locations worldwide",
    badge: "Infrastructure"
  },
  {
    icon: BarChart,
    title: "Advanced Analytics",
    description: "Detailed insights into your image performance",
    badge: "Analytics"
  },
  {
    icon: Code,
    title: "Developer API",
    description: "RESTful API with comprehensive documentation",
    badge: "Developer"
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Automatic optimization for mobile devices",
    badge: "Mobile"
  }
];

export default function Features() {
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
            Features
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Everything you need for professional image hosting
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                  <Badge variant="secondary">{feature.badge}</Badge>
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of developers using ImageVault
          </p>
          <div className="space-x-4">
            <Link href="/auth/register">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg">View Documentation</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
