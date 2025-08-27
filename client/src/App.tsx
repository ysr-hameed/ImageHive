import React from "react";
import { Router, Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar, ProfileMenu } from "@/components/app-sidebar";
import { NotificationBell } from "@/components/notification-management";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import ErrorBoundary from "@/components/error-boundary";
import { PageLoader } from '@/components/futuristic-loader';

// Import all page components directly (no lazy loading for now)
import LandingPage from "./pages/landing";
import Dashboard from "./pages/simple-dashboard";
import Upload from "./pages/upload";
import Images from "./pages/images";
import Analytics from "./pages/analytics";
import Plans from "./pages/plans";
import Settings from "./pages/settings";
import ApiKeys from "./pages/api-keys";
import Notifications from "./pages/notifications";
import Collections from "./pages/collections";
import Activity from "./pages/activity";
import Admin from "./pages/admin-simple";
import ApiUsage from "./pages/api-usage";
import Upgrade from "./pages/upgrade";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword from "./pages/auth/reset-password";
import VerifyEmail from "./pages/auth/verify-email";
import Features from "./pages/features";
import About from "./pages/about";
import Blog from "./pages/blog";
import Careers from "./pages/careers";
import Community from "./pages/community";
import Guides from "./pages/guides";
import Help from "./pages/help";
import Press from "./pages/press";
import Status from "./pages/status";
import Privacy from "./pages/privacy";
import Terms from "./pages/terms";
import Contact from "./pages/contact";
import SDKs from "./pages/sdks";
import ApiDocs from "./pages/docs";
import NotFound from "./pages/not-found";
import Payment from "./pages/payment"; // Assuming Payment component exists

function AppContent() {
  const { user, isLoading } = useAuth();

  console.log('🔐 Auth State Debug');
  console.log('Loading:', isLoading);
  console.log('User:', user ? { id: (user as any)?.id, email: (user as any)?.email } : null);
  console.log('Current path:', window.location.pathname);

  if (isLoading) {
    console.log('⏳ App Loading State - showing loader');
    return <PageLoader text="Initializing ImageVault..." />;
  }

  const currentPath = window.location.pathname;
  const isAuthPage = currentPath.startsWith('/auth/');
  const publicPaths = ['/', '/docs', '/plans', '/documentation', '/api-docs', '/features', '/about', '/blog', '/careers', '/press', '/contact', '/help', '/community', '/guides', '/privacy', '/terms', '/status', '/sdks'];
  const isPublicPage = publicPaths.includes(currentPath) || currentPath.startsWith('/docs');

  console.log('Route Debug:', { currentPath, isAuthPage, isPublicPage, hasUser: !!user });

  // Authenticated pages with sidebar
  if (user && !isAuthPage && !isPublicPage) {
    console.log('✅ Rendering authenticated app with sidebar for user:', (user as any)?.email);
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col min-h-screen">
            <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 transition-all duration-200">
              <div className="flex items-center justify-between">
                <SidebarTrigger className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors" />
                <div className="flex items-center gap-4 ml-auto">
                  <NotificationBell />
                  <ProfileMenu />
                </div>
              </div>
            </header>
            <main className="flex-1 w-full bg-gray-50 dark:bg-slate-900 overflow-auto">
              <Switch>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/images" component={Images} />
                <Route path="/upload" component={Upload} />
                <Route path="/analytics" component={Analytics} />
                <Route path="/api-keys" component={ApiKeys} />
                <Route path="/settings" component={Settings} />
                <Route path="/api-usage" component={ApiUsage} />
                <Route path="/notifications" component={Notifications} />
                <Route path="/admin" component={Admin} />
                <Route path="/collections" component={Collections} />
                <Route path="/activity" component={Activity} />
                <Route path="/upgrade" component={Upgrade} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // Public pages without sidebar (including auth pages)
  return (
    <div className="min-h-screen w-full">
      <Switch>
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/register" component={Register} />
        <Route path="/auth/forgot-password" component={ForgotPassword} />
        <Route path="/auth/reset-password" component={ResetPassword} />
        <Route path="/auth/verify-email" component={VerifyEmail} />
        <Route path="/docs" component={ApiDocs} />
        <Route path="/documentation" component={ApiDocs} />
        <Route path="/api-docs" component={ApiDocs} />
        <Route path="/features" component={Features} />
        <Route path="/about" component={About} />
        <Route path="/blog" component={Blog} />
        <Route path="/careers" component={Careers} />
        <Route path="/community" component={Community} />
        <Route path="/guides" component={Guides} />
        <Route path="/help" component={Help} />
        <Route path="/press" component={Press} />
        <Route path="/status" component={Status} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/contact" component={Contact} />
        <Route path="/sdks" component={SDKs} />
        <Route path="/plans" component={Plans} />
        <Route path="/payment" component={Payment} />
        <Route path="/" component={LandingPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="imagevault-theme">
        <QueryClientProvider client={queryClient}>
          <Router>
            <AppContent />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;