import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import DashboardPreview from "@/components/dashboard-preview";
import PricingSection from "@/components/pricing-section";
import AdminPanelPreview from "@/components/admin-panel-preview";
import Footer from "@/components/footer";
import { ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-brand-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-semibold text-gray-900 dark:text-white">
                ImageVault
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </nav>
      </header>
      <main>
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