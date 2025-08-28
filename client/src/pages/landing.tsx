
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { 
  Upload, 
  Zap, 
  Shield, 
  Globe, 
  Code, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ImageIcon,
  Lock,
  Gauge
} from 'lucide-react';
import HeroSection from '@/components/hero-section';
import FeaturesSection from '@/components/features-section';
import PricingSection from '@/components/pricing-section';

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  console.log('🏠 Landing Page Rendering:', { user: !!user, isLoading });

  const features = [
    {
      icon: Upload,
      title: "Lightning Fast Uploads",
      description: "Upload images instantly with our optimized infrastructure and get shareable URLs immediately."
    },
    {
      icon: Zap,
      title: "Instant CDN Delivery",
      description: "Global CDN ensures your images load fast anywhere in the world with 99.9% uptime."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption, secure API keys, and compliance with industry standards."
    },
    {
      icon: Code,
      title: "Developer-First API",
      description: "RESTful API with SDKs for popular languages. Complete documentation and examples."
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track views, downloads, and usage patterns with detailed analytics and insights."
    },
    {
      icon: Globe,
      title: "Custom Domains",
      description: "Use your own domain for a seamless brand experience with SSL certificates included."
    }
  ];

  const stats = [
    { value: "10M+", label: "Images Hosted" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "150+", label: "Countries" },
    { value: "<100ms", label: "API Response" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
              <Sparkles className="w-4 h-4 mr-2" />
              Trusted by 50,000+ developers worldwide
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Scale Your Image Hosting to{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                Millions of Users
              </span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Enterprise-grade image hosting with lightning-fast CDN, powerful API, and seamless integrations. 
              Built for developers who demand performance and reliability.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" asChild>
                  <Link href="/dashboard">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" asChild>
                    <Link href="/auth/register">
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800" asChild>
                    <Link href="/docs">
                      View Documentation
                    </Link>
                  </Button>
                </>
              )}
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From startups to enterprise, our platform grows with your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white dark:bg-slate-800">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* API Preview Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Developer-Friendly API
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Simple REST API that just works. Upload images with a single request.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-900 border-gray-700 overflow-hidden">
              <CardHeader className="bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="ml-4 text-gray-400 text-sm">Upload API Example</span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
                  <code>{`curl -X POST https://api.imagevault.com/v1/images/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@photo.jpg" \\
  -F "title=My Image" \\
  -F "isPublic=true"

# Response
{
  "success": true,
  "image": {
    "id": "img_abc123",
    "url": "https://cdn.imagevault.com/images/abc123.jpg",
    "title": "My Image",
    "size": 524288,
    "format": "jpeg"
  }
}`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/docs">
                <Code className="w-5 h-5 mr-2" />
                Explore Full API Documentation
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Trust Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of companies that rely on our platform for their image hosting needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center p-8 border-0 shadow-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600 dark:text-gray-300">Uptime SLA</div>
            </Card>
            <Card className="text-center p-8 border-0 shadow-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">50ms</div>
              <div className="text-gray-600 dark:text-gray-300">Avg Response Time</div>
            </Card>
            <Card className="text-center p-8 border-0 shadow-lg">
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Expert Support</div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Scale Your Image Hosting?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Start with our free plan and upgrade as you grow. No hidden fees, no setup costs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-lg" asChild>
              <Link href="/auth/register">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-medium" asChild>
              <Link href="/contact">
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
