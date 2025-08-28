
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
  Gauge,
  Star,
  PlayCircle,
  Users,
  TrendingUp,
  Clock,
  Database
} from 'lucide-react';
import Navigation from '@/components/navigation';
import PricingSection from '@/components/pricing-section';

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  console.log('🏠 Landing Page Rendering:', { user: !!user, isLoading });

  const features = [
    {
      icon: Upload,
      title: "Lightning Fast Uploads",
      description: "Upload images instantly with our optimized infrastructure. Bulk uploads, drag & drop, and API integration supported.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Global CDN Delivery",
      description: "99.9% uptime with edge locations worldwide. Your images load in under 100ms globally.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption, secure API keys, GDPR compliant, and SOC 2 Type II certified.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Code,
      title: "Developer-First API",
      description: "RESTful API with SDKs for 10+ languages. Webhooks, real-time events, and comprehensive docs.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time insights, bandwidth monitoring, geographic data, and custom reporting dashboards.",
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      icon: Globe,
      title: "Custom Domains",
      description: "White-label solution with your own domain. SSL certificates and custom branding included.",
      gradient: "from-teal-500 to-green-500"
    }
  ];

  const stats = [
    { value: "50M+", label: "Images Hosted", icon: ImageIcon },
    { value: "99.99%", label: "Uptime SLA", icon: Clock },
    { value: "180+", label: "Countries", icon: Globe },
    { value: "<50ms", label: "Global Latency", icon: Zap }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO at TechFlow",
      avatar: "SC",
      quote: "ImageVault transformed our media delivery. 10x faster load times and seamless integration.",
      rating: 5
    },
    {
      name: "Marcus Williams",
      role: "Lead Dev at StartupCo",
      avatar: "MW", 
      quote: "Best image hosting platform we've used. The API is incredibly well-designed and reliable.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Product Manager at ScaleUp",
      avatar: "ER",
      quote: "Saved us months of development time. The analytics dashboard is a game-changer.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-700/25"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 dark:from-blue-950/20 dark:to-purple-950/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-32 sm:pb-32">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <Badge variant="secondary" className="mb-8 px-6 py-3 text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50 rounded-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Trusted by 10,000+ developers worldwide
            </Badge>
            
            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight mb-8">
              <span className="block">Enterprise-Grade</span>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent block">
                Image Hosting
              </span>
              <span className="block text-slate-700 dark:text-slate-300 text-4xl sm:text-5xl lg:text-6xl">
                Built for Scale
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed mb-12 font-medium">
              Lightning-fast CDN delivery, powerful APIs, and enterprise security. 
              The complete image hosting solution for modern applications.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              {user ? (
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-6 text-xl font-bold shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 rounded-full" asChild>
                  <Link href="/dashboard">
                    <ImageIcon className="w-6 h-6 mr-3" />
                    Go to Dashboard
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-6 text-xl font-bold shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 rounded-full" asChild>
                    <Link href="/auth/register">
                      Start Free Trial
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="px-10 py-6 text-xl font-semibold border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-800 rounded-full" asChild>
                    <Link href="/docs">
                      <PlayCircle className="w-6 h-6 mr-3" />
                      View Demo
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4 group-hover:scale-110 transition-transform duration-200">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Everything You Need to Scale
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              From startups to enterprise, our comprehensive platform grows with your business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-white dark:bg-slate-800 overflow-hidden">
                  <CardHeader className="pb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* API Demo Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Developer-Friendly API
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Simple, powerful REST API that just works. Upload, transform, and deliver images with a single request.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4" />
                  <span className="text-lg font-medium text-slate-700 dark:text-slate-300">RESTful API with comprehensive SDKs</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4" />
                  <span className="text-lg font-medium text-slate-700 dark:text-slate-300">Real-time webhooks and events</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4" />
                  <span className="text-lg font-medium text-slate-700 dark:text-slate-300">Interactive API documentation</span>
                </div>
              </div>

              <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-8 py-4 rounded-full" asChild>
                <Link href="/docs">
                  <Code className="w-5 h-5 mr-3" />
                  Explore API Docs
                </Link>
              </Button>
            </div>

            <div>
              <Card className="bg-slate-900 border-slate-700 overflow-hidden shadow-2xl">
                <CardHeader className="bg-slate-800 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="ml-4 text-slate-400 text-sm font-medium">Upload API Example</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <pre className="text-sm text-slate-300 font-mono overflow-x-auto leading-relaxed">
                    <code className="language-bash">{`curl -X POST https://api.imagevault.com/v1/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@photo.jpg" \\
  -F "optimize=true" \\
  -F "resize=800x600"

{
  "success": true,
  "image": {
    "id": "img_abc123xyz",
    "url": "https://cdn.imagevault.com/abc123.jpg",
    "optimized_url": "https://cdn.imagevault.com/abc123_opt.webp",
    "size": 245760,
    "format": "webp",
    "dimensions": {
      "width": 800,
      "height": 600
    }
  }
}`}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Join thousands of companies that rely on ImageVault for their critical image infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-slate-800">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</div>
                      <div className="text-slate-600 dark:text-slate-400">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8">
            Ready to Scale Your Images?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of developers building amazing applications with ImageVault. 
            Start free, scale as you grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-50 px-10 py-6 text-xl font-bold shadow-2xl rounded-full" asChild>
              <Link href="/auth/register">
                <Users className="w-6 h-6 mr-3" />
                Start Free Trial
                <ArrowRight className="w-6 h-6 ml-3" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10 px-10 py-6 text-xl font-semibold rounded-full" asChild>
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
