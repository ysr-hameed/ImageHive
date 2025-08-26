
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { ArrowLeft, Download, Calendar } from 'lucide-react';
import Footer from '@/components/footer';

const pressReleases = [
  {
    title: "ImageVault Raises $5M Series A to Revolutionize Developer Image Hosting",
    date: "December 1, 2024",
    description: "Leading venture capital firms invest in ImageVault's mission to simplify image hosting for developers worldwide."
  },
  {
    title: "ImageVault Launches Global CDN with 200+ Edge Locations",
    date: "November 15, 2024",
    description: "New infrastructure delivers 90% faster image loading times across all continents."
  },
  {
    title: "ImageVault Reaches 10,000 Developer Milestone",
    date: "October 30, 2024",
    description: "Platform now serves over 1 million images daily as developer adoption accelerates."
  }
];

const mediaKit = [
  {
    name: "Logo Package",
    description: "High-resolution logos in various formats",
    file: "imagevault-logos.zip"
  },
  {
    name: "Brand Guidelines",
    description: "Complete brand identity and usage guidelines",
    file: "brand-guidelines.pdf"
  },
  {
    name: "Product Screenshots",
    description: "High-quality product screenshots and mockups",
    file: "product-screenshots.zip"
  }
];

export default function Press() {
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
            Press
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Latest news and media resources from ImageVault
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Recent Press Releases
            </h2>
            <div className="space-y-6">
              {pressReleases.map((release, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{release.title}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{release.date}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{release.description}</CardDescription>
                    <Button variant="outline" size="sm">Read Full Release</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Media Kit
            </h2>
            <div className="space-y-4">
              {mediaKit.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download {item.file}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Media Inquiries</CardTitle>
                <CardDescription>
                  For press inquiries, interviews, or additional information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Email:</strong> press@imagevault.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Response time:</strong> Within 24 hours</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Stay Informed
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Subscribe to receive the latest news and updates
          </p>
          <Button size="lg">Subscribe to Press Updates</Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
