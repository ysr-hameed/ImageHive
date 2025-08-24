import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
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

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <SidebarTrigger className="-ml-1" />
          
          {/* Profile Section */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.firstName || user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center text-white text-sm font-medium">
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

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
          <Route path="/analytics" component={Analytics} />
          <Route path="/activity" component={Activity} />
          <Route path="/settings" component={Settings} />
          <Route path="/api-keys" component={ApiKeys} />
          <Route path="/docs" component={ApiDocs} />
          <Route path="/api-usage" component={ApiUsage} />
          {user?.isAdmin && <Route path="/admin" component={Admin} />}
          <Route component={NotFound} />
        </AppLayout>
      ) : (
        /* Public Routes - Only for non-authenticated users */
        <>
          <Route path="/" component={Landing} />
          <Route path="/docs" component={ApiDocs} />
          <Route path="/terms" component={Landing} />
          <Route path="/privacy" component={Landing} />
          <Route path="/support" component={Landing} />
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
