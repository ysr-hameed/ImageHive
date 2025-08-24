import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative py-12 sm:py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="animate-fade-in">
            <Badge 
              className="inline-flex items-center px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-medium mb-6"
              data-testid="hero-badge"
            >
              <span className="w-2 h-2 bg-brand-500 rounded-full mr-2 animate-pulse"></span>
              Live: Professional Image Hosting API
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
              Professional Image Hosting for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-600">
                Developers
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
              Scale your image hosting to millions of users with our lightning-fast API. 
              Built on Backblaze B2 with global CDN, custom domains, and enterprise-grade security.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Button 
                size="lg" 
                asChild 
                className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                data-testid="button-start-free-trial"
              >
                <a href="/auth/register">
                  Get Started Free
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                asChild
                className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                data-testid="button-view-docs"
              >
                <a href="/docs">
                  View Documentation
                </a>
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>99.9% Uptime SLA</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Global CDN</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>RESTful API</span>
              </div>
            </div>
          </div>
          
          <div className="relative animate-fade-in">
            {/* Interactive API Demo Terminal */}
            <div className="bg-gray-900 dark:bg-slate-800 rounded-xl shadow-2xl p-6 font-mono text-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="ml-4 text-gray-400">api-demo.sh</span>
              </div>
              <div className="text-green-400">
                <div className="mb-2">$ curl -X POST /api/upload \</div>
                <div className="ml-4 mb-2">-H "Authorization: Bearer your-api-key" \</div>
                <div className="ml-4 mb-2">-F "image=@photo.jpg" \</div>
                <div className="ml-4 mb-4">-F "isPublic=true"</div>
                <div className="text-blue-300">
                  {"{"}
                  <br />
                  <span className="ml-2">"success": true,</span>
                  <br />
                  <span className="ml-2">"url": "https://cdn.imagevault.app/uploads/abc123.jpg",</span>
                  <br />
                  <span className="ml-2">"id": "abc123",</span>
                  <br />
                  <span className="ml-2">"size": 245760</span>
                  <br />
                  {"}"}
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full opacity-20 animate-pulse" 
                 style={{ animationDuration: '3s' }}></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-emerald-500 to-brand-500 rounded-full opacity-10 animate-pulse" 
                 style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
