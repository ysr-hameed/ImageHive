
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Link } from 'wouter';
import { ArrowLeft, Mail, Phone, MessageSquare, Clock } from 'lucide-react';
import Footer from '@/components/footer';

export default function Contact() {
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
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get in touch with our team - we'd love to hear from you
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input id="company" placeholder="Acme Inc." />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                  />
                </div>
                <Button className="w-full">Send Message</Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Mail className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Email Support</CardTitle>
                <CardDescription>
                  Get help with technical questions and account issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium">support@imagevault.com</p>
                <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Response within 24 hours</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Phone className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Phone Support</CardTitle>
                <CardDescription>
                  Speak directly with our support team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium">+1 (555) 123-4567</p>
                <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Mon-Fri, 9 AM - 6 PM PST</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>
                  Get instant help from our support team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Live Chat</Button>
                <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Available 24/7</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Other Ways to Reach Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Sales:</strong> sales@imagevault.com
                </div>
                <div>
                  <strong>Press:</strong> press@imagevault.com
                </div>
                <div>
                  <strong>Partnerships:</strong> partners@imagevault.com
                </div>
                <div>
                  <strong>Security:</strong> security@imagevault.com
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
