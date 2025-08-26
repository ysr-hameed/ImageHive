
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Last updated: December 1, 2024
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>By accessing and using ImageVault, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>ImageVault provides image hosting and management services including:</p>
              <ul>
                <li>Image upload and storage</li>
                <li>Content delivery network (CDN)</li>
                <li>API access for developers</li>
                <li>Image processing and optimization</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>You are responsible for:</p>
              <ul>
                <li>Maintaining the confidentiality of your account</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Providing accurate and complete information</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>You agree not to use the service to:</p>
              <ul>
                <li>Upload illegal, harmful, or offensive content</li>
                <li>Violate any intellectual property rights</li>
                <li>Distribute malware or viruses</li>
                <li>Engage in any fraudulent activities</li>
                <li>Overload or damage our systems</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Content and Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>You retain ownership of your content. By uploading content, you grant us a license to:</p>
              <ul>
                <li>Store and deliver your content</li>
                <li>Process and optimize your images</li>
                <li>Display your content as necessary for service operation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Payment and Billing</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>For paid services:</p>
              <ul>
                <li>Fees are charged based on your selected plan</li>
                <li>Payments are processed securely through third-party providers</li>
                <li>Refunds are subject to our refund policy</li>
                <li>We may suspend service for non-payment</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Service Availability</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We strive to maintain high availability but cannot guarantee uninterrupted service. We may perform maintenance that temporarily affects service availability.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>Our liability is limited to the fullest extent permitted by law. We are not liable for any indirect, incidental, or consequential damages.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>Either party may terminate this agreement at any time. Upon termination:</p>
              <ul>
                <li>Your access to the service will be suspended</li>
                <li>You may download your content for a limited time</li>
                <li>We may delete your data after a reasonable period</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>Questions about these terms should be sent to:</p>
              <ul>
                <li>Email: legal@imagevault.com</li>
                <li>Address: 123 Main St, San Francisco, CA 94105</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
