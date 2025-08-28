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
      <div className="min-h-screen w-full bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 animate-pulse">
            Loading ImageVault...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-slate-900 overflow-x-hidden">
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