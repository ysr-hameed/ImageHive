import React, { Suspense } from 'react';
import { Router, Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ErrorBoundary } from '@/components/error-boundary';
import { FuturisticLoader } from '@/components/futuristic-loader';
import { NotificationBell } from '@/components/notification-management';
import { ProfileMenu } from '@/components/app-sidebar';
import { useAuth } from '@/hooks/useAuth';

// Pages
import LandingPage from '@/pages/landing';
import Login from '@/pages/auth/login';
import Register from '@/pages/auth/register';
import ForgotPassword from '@/pages/auth/forgot-password';
import ResetPassword from '@/pages/auth/reset-password';
import VerifyEmail from '@/pages/auth/verify-email';
import Dashboard from '@/pages/dashboard';
import Images from '@/pages/images';
import Upload from '@/pages/upload';
import Analytics from '@/pages/analytics';
import ApiKeys from '@/pages/api-keys';
import Settings from '@/pages/settings';
import ApiUsage from '@/pages/api-usage';
import Plans from '@/pages/plans';
import Notifications from '@/pages/notifications';
import Admin from '@/pages/admin';
import Collections from '@/pages/collections';
import Activity from '@/pages/activity';
import ApiDocs from '@/pages/docs';
import NotFound from '@/pages/not-found';

// Footer pages
import Features from '@/pages/features';
import About from '@/pages/about';
import Blog from '@/pages/blog';
import Careers from '@/pages/careers';
import Press from '@/pages/press';
import Contact from '@/pages/contact';
import Help from '@/pages/help';
import Community from '@/pages/community';
import Guides from '@/pages/guides';
import Privacy from '@/pages/privacy';
import Terms from '@/pages/terms';
import Status from '@/pages/status';
import SDKs from '@/pages/sdks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <FuturisticLoader />;
  }

  const currentPath = window.location.pathname;
  const isAuthPage = currentPath.startsWith('/auth/');
  const isPublicPage = ['/', '/docs', '/features', '/about', '/blog', '/careers', '/press', '/contact', '/help', '/community', '/guides', '/privacy', '/terms', '/status', '/sdks'].includes(currentPath);

  // Public pages without sidebar
  if (isAuthPage || (isPublicPage && !user)) {
    return (
      <div className="min-h-screen">
        <Switch>
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/register" component={Register} />
          <Route path="/auth/forgot-password" component={ForgotPassword} />
          <Route path="/auth/reset-password" component={ResetPassword} />
          <Route path="/auth/verify-email" component={VerifyEmail} />
          <Route path="/docs" component={ApiDocs} />
          <Route path="/features" component={Features} />
          <Route path="/about" component={About} />
          <Route path="/blog" component={Blog} />
          <Route path="/careers" component={Careers} />
          <Route path="/press" component={Press} />
          <Route path="/contact" component={Contact} />
          <Route path="/help" component={Help} />
          <Route path="/community" component={Community} />
          <Route path="/guides" component={Guides} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/status" component={Status} />
          <Route path="/sdks" component={SDKs} />
          <Route path="/" component={LandingPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    );
  }

  // Authenticated pages with sidebar
  if (user) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-h-screen">
          <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
            <div className="flex items-center justify-between">
              <SidebarTrigger />
              <div className="flex items-center gap-4">
                <NotificationBell />
                <ProfileMenu />
              </div>
            </div>
          </header>
          <div className="flex-1 w-full bg-gray-50 dark:bg-slate-900">
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
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Fallback to landing page
  return <LandingPage />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Suspense fallback={<FuturisticLoader />}>
            <AppContent />
          </Suspense>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}