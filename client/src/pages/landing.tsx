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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/30 dark:to-purple-950/30">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 right-20 w-60 h-60 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Navigation />

      

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