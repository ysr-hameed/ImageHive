import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Shield,
  Heart,
  BarChart3,
  Settings,
  Code
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast API",
    description: "Upload and serve images with sub-200ms response times globally via our optimized CDN network.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "End-to-end encryption, private/public hosting options, and SOC 2 compliance for enterprise needs.",
  },
  {
    icon: Heart,
    title: "Custom Domains",
    description: "Use your own domain with SSL certificates automatically provisioned and managed.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Detailed insights on image views, bandwidth usage, and performance metrics across all endpoints.",
  },
  {
    icon: Settings,
    title: "Image Processing",
    description: "On-the-fly resizing, format conversion, and optimization with 15+ transformation parameters.",
  },
  {
    icon: Code,
    title: "Developer SDKs",
    description: "Native SDKs for JavaScript, Python, PHP, Go, and more with comprehensive documentation.",
  },
];

const apiEndpoints = [
  "POST /v1/images/upload",
  "GET /v1/images/{id}/analytics",
  "PUT /v1/images/{id}/privacy",
  "DELETE /v1/images/{id}",
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to scale
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Built for developers who need reliable, fast, and scalable image hosting with enterprise-grade features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 bg-gray-50 dark:bg-slate-700 rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                data-testid={`feature-${index}`}
              >
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* API Showcase */}
        <div className="bg-gradient-to-r from-brand-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
                50+ API Endpoints
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Comprehensive REST API with everything you need for image management,
                user authentication, analytics, and more.
              </p>
              <div className="space-y-3">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center space-x-3" data-testid={`api-endpoint-${index}`}>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                      {endpoint}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 dark:bg-slate-800 rounded-xl p-6 font-mono text-sm overflow-x-auto">
              <div className="text-gray-400 mb-2">// Upload with metadata</div>
              <div className="text-blue-300">
                <span className="text-white">const</span> response = <span className="text-white">await</span> <span className="text-purple-400">fetch</span>(<span className="text-green-300">'/v1/upload'</span>, {"{"}
                <br />
                <span className="ml-4">method: <span className="text-green-300">'POST'</span>,</span>
                <br />
                <span className="ml-4">headers: {"{"}</span>
                <br />
                <span className="ml-8"><span className="text-green-300">'Authorization'</span>: <span className="text-green-300">'Bearer '</span> + token</span>
                <br />
                <span className="ml-4">{"}"},</span>
                <br />
                <span className="ml-4">body: formData</span>
                <br />
                {"}"});
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}