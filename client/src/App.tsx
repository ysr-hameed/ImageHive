import { Switch, Route, Link, Redirect, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import Upload from "@/pages/upload";
import Images from "@/pages/images";
import Analytics from "@/pages/analytics";
import Activity from "@/pages/activity";
import Settings from "@/pages/settings";
import ApiKeys from "@/pages/api-keys";
import Collections from "@/pages/collections";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";
import VerifyEmail from "@/pages/auth/verify-email";
import NotFound from "@/pages/not-found";
import ApiDocs from "@/pages/docs";
import ApiUsage from "@/pages/api-usage";
import Upgrade from "./pages/upgrade";
import Plans from "./pages/plans";
import Notifications from "./pages/notifications";
import { apiRequest } from "./lib/queryClient";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";

// Notification Bell Component
function NotificationBell() {
  const { data: notifications } = useQuery({
    queryKey: ['/api/v1/notifications'],
    queryFn: () => apiRequest('GET', '/api/v1/notifications'),
    retry: false,
  });

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter(n => !n.isRead).length
    : 0;

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/notifications">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </Button>
    </div>
  );
}

// Profile Menu Component
function ProfileMenu() {
  const { user } = useAuth();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/v1/auth/logout', {});
    },
    onSuccess: () => {
      // Clear local storage and redirect
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
  });

  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center text-white text-sm font-medium">
        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
      </div>
    </div>
  );
}

// AppContent component to handle routing and layout
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Email verification should be accessible without authentication */}
      <Route path="/auth/verify-email" component={VerifyEmail} />

      {!isAuthenticated ? (
        <>
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/register" component={Register} />
          <Route path="/auth/forgot-password" component={ForgotPassword} />
          <Route path="/auth/reset-password" component={ResetPassword} />
          <Route path="/upgrade" component={Upgrade} />
          <Route path="/" component={LandingPage} />
          <Route component={() => <Redirect to="/auth/login" />} />
        </>
      ) : (
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <SidebarInset className="flex-1 w-full">
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
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/images" component={Images} />
                <Route path="/upload" component={Upload} />
                <Route path="/analytics" component={Analytics} />
                <Route path="/api-keys" component={ApiKeys} />
                <Route path="/docs" component={ApiDocs} />
                <Route path="/settings" component={Settings} />
                <Route path="/api-usage" component={ApiUsage} />
                <Route path="/plans" component={Plans} />
                <Route path="/notifications" component={Notifications} />
                <Route path="/admin" component={Admin} />
                <Route path="/collections" component={Collections} />
                <Route path="/activity" component={Activity} />
                <Route path="/" component={LandingPage} />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      )}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary fallback={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600">We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      }>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router>
              <AppContent />
            </Router>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;