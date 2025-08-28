import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { 
  Rocket, 
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function HeroSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="relative py-12 sm:py-20 lg:py-28 xl:py-36 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%229C92AC%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in">
            <Badge 
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-200 dark:border-blue-800"
              data-testid="hero-badge"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              🚀 Professional Image Hosting API
            </Badge>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight">
                Professional Image Hosting for{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                  Developers
                </span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Scale your image hosting to <span className="font-semibold text-gray-900 dark:text-white">millions of users</span> with our lightning-fast API. 
                Built on Backblaze B2 with global CDN, custom domains, and enterprise-grade security.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {isAuthenticated && user ? (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 text-white border-0 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  asChild
                >
                  <Link href="/dashboard">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 text-white border-0 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  asChild
                >
                  <Link href="/auth/register">
                    <Rocket className="w-5 h-5 mr-2" />
                    Get Started Free
                  </Link>
                </Button>
              )}
              <Button 
                variant="outline" 
                size="lg"
                asChild
                className="px-8 py-4 text-lg font-medium border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800/50 transition-all duration-200"
                data-testid="button-view-plans"
              >
                <Link href="/plans">
                  💎 View Plans
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">99.9% Uptime SLA</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">Global CDN</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">RESTful API</span>
              </div>
            </div>
          </div>

          {/* Right Content - Interactive API Demo */}
          <div className="relative animate-fade-in-up">
            <div className="bg-gray-900 dark:bg-slate-800 rounded-2xl shadow-2xl p-6 font-mono text-sm overflow-x-auto border border-gray-700 backdrop-blur-sm bg-opacity-95">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="ml-4 text-gray-400 text-sm">api-demo.sh</span>
              </div>

              <div className="text-green-400 space-y-2">
                <div className="text-blue-300 mb-3"># Upload image via API</div>
                <div>$ curl -X POST /api/upload \</div>
                <div className="ml-4">-H "Authorization: Bearer your-api-key" \</div>
                <div className="ml-4">-F "image=@photo.jpg" \</div>
                <div className="ml-4 mb-4">-F "isPublic=true"</div>

                <div className="text-blue-300 mb-2"># Response</div>
                <div className="text-cyan-300">
                  {"{"}
                  <br />
                  <span className="ml-2 text-emerald-300">"success": true,</span>
                  <br />
                  <span className="ml-2 text-yellow-300">"url": "https://cdn.imagevault.app/uploads/abc123.jpg",</span>
                  <br />
                  <span className="ml-2 text-purple-300">"id": "abc123",</span>
                  <br />
                  <span className="ml-2 text-pink-300">"size": 245760,</span>
                  <br />
                  <span className="ml-2 text-blue-300">"views": 0</span>
                  <br />
                  {"}"}
                </div>

                <div className="mt-4 text-emerald-400 text-sm">
                  <span className="animate-pulse">✅ Image uploaded successfully!</span>
                </div>
              </div>
            </div>

            {/* Floating elements for visual appeal */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full opacity-10 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
}