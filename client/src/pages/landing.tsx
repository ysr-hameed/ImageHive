import { SEOHead, seoConfigs } from "@/components/seo-head";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import DashboardPreview from "@/components/dashboard-preview";
import PricingSection from "@/components/pricing-section";
import AdminPanelPreview from "@/components/admin-panel-preview";
import Footer from "@/components/footer";
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowRight, PlayCircle, Rocket, BarChart3, Sparkles, Shield, Zap } from 'lucide-react';


export default function Landing() {
  const { isAuthenticated, user, isLoading } = useAuth();

  console.log('🏠 Landing Page Rendering:', { user: !!user, isLoading });


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          {/* Updated loader component */}
          <div className="relative w-24 h-24">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-400 rounded-full animate-spin-slow"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent rounded-full animate-spin-fast [animation-delay:-0.5s]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Rocket className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300 animate-pulse">
            Launching ImageVault...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <SEOHead {...seoConfigs.home} />
      <Navigation />

      {/* Welcome message for authenticated users */}
      {isAuthenticated && user && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Welcome back, {user.firstName || user.email}!
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Plan: {user.plan || 'Free'} • {user.isAdmin ? 'Admin' : 'User'}
                  </p>
                </div>
              </div>
              <Link href="/dashboard">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="relative">
        <HeroSection />
        <FeaturesSection />
        <DashboardPreview />
        <PricingSection />
        <AdminPanelPreview />
        <Footer />
      </main>
    </div>
  );
}