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
import { ArrowRight, PlayCircle } from 'lucide-react';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/30 dark:to-purple-950/30">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 right-20 w-60 h-60 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Navigation />

      {/* Get Started Banner for Logged In Users */}
      {isAuthenticated && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <PlayCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="font-medium block sm:inline">Ready to get started?</span>
                <span className="text-blue-100 text-sm block sm:inline sm:ml-2">Access your dashboard and start uploading images.</span>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="secondary" size="sm" className="bg-white text-blue-600 hover:bg-gray-100 flex-shrink-0">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
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