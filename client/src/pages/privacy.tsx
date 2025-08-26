
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/footer';

export default function Privacy() {
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
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Last updated: December 1, 2024
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We collect information you provide directly to us, such as when you create an account, upload images, or contact us for support.</p>
              <ul>
                <li>Account information (email, name, company)</li>
                <li>Images and metadata you upload</li>
                <li>Usage data and analytics</li>
                <li>Communication preferences</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect and prevent fraudulent activities</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
              <ul>
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With service providers who assist us in operating our platform</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We implement appropriate technical and organizational measures to protect your data:</p>
              <ul>
                <li>Encryption in transit and at rest</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication</li>
                <li>Incident response procedures</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We retain your information for as long as your account is active or as needed to provide services. We may retain certain information after account deletion for legal or business purposes.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>If you have any questions about this privacy policy, please contact us:</p>
              <ul>
                <li>Email: privacy@imagevault.com</li>
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
