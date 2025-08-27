import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative py-8 sm:py-16 lg:py-24 xl:py-32 overflow-hidden min-h-[80vh] sm:min-h-[85vh] lg:min-h-[90vh]">
      <div className="absolute inset-0 bg-gray-50 dark:bg-slate-900"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center h-full">
          <div className="animate-fade-in">
            <Badge 
              className="inline-flex items-center px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-medium mb-6"
              data-testid="hero-badge"
            >
              <span className="w-2 h-2 bg-brand-500 rounded-full mr-2 animate-pulse"></span>
              Live: Professional Image Hosting API
            </Badge>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 lg:mb-6 leading-tight">
              Professional Image Hosting for{" "}
              <span className="text-blue-600 dark:text-blue-400 block sm:inline">
                Developers
              </span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 lg:mb-8 leading-relaxed max-w-2xl">
              Scale your image hosting to millions of users with our lightning-fast API. 
              Built on Backblaze B2 with global CDN, custom domains, and enterprise-grade security.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
              <Button 
                size="lg" 
                asChild 
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
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
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg"
                data-testid="button-view-plans"
              >
                <a href="/plans">
                  View Plans
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
          
          <div className="relative animate-fade-in mt-8 lg:mt-0">
            {/* Interactive API Demo Terminal */}
            <div className="bg-gray-900 dark:bg-slate-800 rounded-xl shadow-2xl p-4 sm:p-6 font-mono text-xs sm:text-sm overflow-x-auto">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="ml-4 text-gray-400">api-demo.sh</span>
              </div>
              <div className="text-green-400 overflow-x-auto">
                <div className="mb-2 whitespace-nowrap">$ curl -X POST /api/upload \</div>
                <div className="ml-2 sm:ml-4 mb-2 whitespace-nowrap">-H "Authorization: Bearer your-api-key" \</div>
                <div className="ml-2 sm:ml-4 mb-2 whitespace-nowrap">-F "image=@photo.jpg" \</div>
                <div className="ml-2 sm:ml-4 mb-4 whitespace-nowrap">-F "isPublic=true"</div>
                <div className="text-blue-300">
                  {"{"}
                  <br />
                  <span className="ml-2">"success": true,</span>
                  <br />
                  <span className="ml-2 text-xs sm:text-sm break-all">"url": "https://cdn.imagevault.app/uploads/abc123.jpg",</span>
                  <br />
                  <span className="ml-2">"id": "abc123",</span>
                  <br />
                  <span className="ml-2">"size": 245760</span>
                  <br />
                  {"}"}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
