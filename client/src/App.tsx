import React, { Suspense, lazy } from "react";
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
import { FuturisticLoader } from "@/components/futuristic-loader";

// Import all page components
import LandingPage from "./pages/landing";
import Dashboard from "./pages/dashboard";
import Upload from "./pages/upload";
import Images from "./pages/images";
import Analytics from "./pages/analytics";
import Plans from "./pages/plans";
import Settings from "./pages/settings";
import ApiKeys from "./pages/api-keys";
import Notifications from "./pages/notifications";
import Collections from "./pages/collections";
import Activity from "./pages/activity";
import Admin from "./pages/admin";
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
import NotFound from "./pages/not-found";

const ApiDocs = lazy(() => import("./pages/docs").then(m => ({ default: m.default })));

function AppContent() {
  const { user, isLoading } = useAuth();

  // Enhanced debugging and error logging
  React.useEffect(() => {
    // Global error handler
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Global Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    };

    // Global unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Unhandled Promise Rejection:', {
        reason: event.reason,
        promise: event.promise,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    };

    // Add global listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Debug auth state changes
    console.log('🔐 Auth State Debug:', {
      isLoading,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      currentPath: window.location.pathname,
      timestamp: new Date().toISOString()
    });

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [user, isLoading]);

  if (isLoading) {
    console.log('⏳ App Loading State - showing loader');
    return <FuturisticLoader variant="quantum" text="Initializing ImageVault..." />;
  }

  const currentPath = window.location.pathname;
  const isAuthPage = currentPath.startsWith('/auth/');
  const publicPaths = ['/', '/docs', '/features', '/about', '/blog', '/careers', '/press', '/contact', '/help', '/community', '/guides', '/privacy', '/terms', '/status', '/sdks'];
  const isPublicPage = publicPaths.includes(currentPath);

  // Authenticated pages with sidebar
  if (user && !isAuthPage && !isPublicPage) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col min-h-screen">
            <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 py-3 transition-all duration-200">
              <div className="flex items-center justify-between">
                <SidebarTrigger className="md:hidden" />
                <div className="flex items-center gap-4">
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
                <Route path="/plans" component={Plans} />
                <Route path="/notifications" component={Notifications} />
                <Route path="/admin" component={Admin} />
                <Route path="/collections" component={Collections} />
                <Route path="/activity" component={Activity} />
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
    <div className="min-h-screen">
      <Suspense fallback={<FuturisticLoader variant="quantum" text="Loading..." />}>
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
          <Route path="/" component={LandingPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <Router>
            <Suspense fallback={<FuturisticLoader />}>
              <AppContent />
            </Suspense>
            <Toaster />
          </Router>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}