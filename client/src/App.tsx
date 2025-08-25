
import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarContentLoader } from "@/components/sidebar-content-loader";
import Navigation from "@/components/navigation";
import Landing from "@/pages/landing";
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

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center border-b px-4 bg-white dark:bg-slate-800">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="flex-1 overflow-auto">
            <SidebarContentLoader isLoading={false}>
              {children}
            </SidebarContentLoader>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading, user, error } = useAuth();

  // Show loading screen while checking authentication
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

  // Handle authentication errors
  if (error && !isAuthenticated) {
    // If it's an email verification error, redirect to a verification page
    if (error.message?.includes('EMAIL_NOT_VERIFIED')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
          <div className="text-center max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Email Verification Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please verify your email address to continue. Check your inbox for the verification email.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Login
            </Link>
          </div>
        </div>
      );
    }
  }

  return (
    <Switch>
      {/* Auth Routes - Always Available */}
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      <Route path="/auth/forgot-password" component={ForgotPassword} />
      <Route path="/auth/reset-password" component={ResetPassword} />
      <Route path="/auth/verify-email" component={VerifyEmail} />

      {/* Protected Routes - Only for authenticated users */}
      {isAuthenticated ? (
        <AppLayout>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/upload" component={Upload} />
          <Route path="/upload/bulk" component={Upload} />
          <Route path="/upload/url" component={Upload} />
          <Route path="/images" component={Images} />
          <Route path="/images/recent" component={Images} />
          <Route path="/images/favorites" component={Images} />
          <Route path="/images/collections" component={Collections} />
          <Route path="/docs" component={ApiDocs} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/settings" component={Settings} />
          <Route path="/api-keys" component={ApiKeys} />
          <Route path="/api-usage" component={ApiUsage} />
          <Route path="/activity" component={Activity} />
          <Route path="/plans" component={Plans} />
          <Route path="/notifications" component={Notifications} />
          {user?.isAdmin && <Route path="/admin" component={Admin} />}
          <Route path="/upgrade" component={Upgrade} />
          <Route path="/:rest*" component={NotFound} />
        </AppLayout>
      ) : (
        /* Public Routes - Only for non-authenticated users */
        <>
          <Route path="/" component={Landing} />
          <Route path="/docs" component={ApiDocs} />
          <Route path="/terms" component={Landing} />
          <Route path="/privacy" component={Landing} />
          <Route path="/support" component={Landing} />
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/register" component={Register} />
          <Route path="/auth/forgot-password" component={ForgotPassword} />
          <Route path="/auth/reset-password" component={ResetPassword} />
          <Route path="/auth/verify-email" component={VerifyEmail} />
          <Route component={Login} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
