
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { ArrowLeft, Users, Target, Award } from 'lucide-react';
import Footer from '@/components/footer';

export default function About() {
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
            About ImageVault
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Building the future of image hosting for developers
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Founded in 2024, ImageVault was born from the frustration of dealing with slow, unreliable image hosting solutions. Our team of experienced developers set out to create a platform that would make image hosting simple, fast, and reliable.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Today, we serve thousands of developers and businesses worldwide, providing them with the tools they need to deliver exceptional visual experiences to their users.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              We believe that every developer should have access to enterprise-grade image hosting without the enterprise complexity.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <div className="text-white text-center">
                <h3 className="text-2xl font-bold mb-2">1M+</h3>
                <p>Images hosted daily</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>Our Team</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                A diverse team of engineers, designers, and product experts passionate about solving developer problems.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Target className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                To provide developers with the most reliable, fast, and easy-to-use image hosting platform.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Award className="w-8 h-8 text-yellow-600 mb-2" />
              <CardTitle>Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Reliability, simplicity, and developer happiness drive everything we do.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Join Our Mission
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Help us build the future of image hosting
          </p>
          <div className="space-x-4">
            <Link href="/careers">
              <Button size="lg">View Careers</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">Contact Us</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
