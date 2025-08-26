
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
import { SidebarContentLoader } from '@/components/sidebar-content-loader';

export default function Landing() {
  const { isAuthenticated, user, isLoading } = useAuth();

  return (
    <SidebarContentLoader showSidebar={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/30 dark:to-purple-950/30">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 right-20 w-60 h-60 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Navigation />

      {/* Enhanced Auth Banner */}
      {!isLoading && (
        <div className="relative z-10">
          {isAuthenticated ? (
            <div className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white py-4 px-4 shadow-lg">
              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-center lg:text-left">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg">Welcome back, {user?.firstName || 'User'}!</span>
                      <Sparkles className="w-5 h-5 text-yellow-300" />
                    </div>
                    <span className="text-emerald-100 text-sm">Your dashboard is ready with all your images and analytics.</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-4 text-sm text-white/80">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      <span>Fast</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>Analytics</span>
                    </div>
                  </div>
                  <Link href="/dashboard">
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="bg-white text-blue-600 hover:bg-gray-100 font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0"
                    >
                      Open Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 px-4 shadow-lg">
              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-center lg:text-left">
                  <div className="p-2 bg-white/20 rounded-full">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg mb-1">Start Your Image Management Journey</div>
                    <span className="text-blue-100 text-sm">Join thousands of users who trust ImageVault for their image storage and optimization needs.</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/auth/login">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600 font-medium transition-all duration-200"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="bg-white text-blue-600 hover:bg-gray-100 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Get Started Free
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
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
    </SidebarContentLoader>
  );
}
