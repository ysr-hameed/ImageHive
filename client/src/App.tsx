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
import LandingPage from "./pages/minimal-landing";
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
import ApiDocs from "./pages/docs";
import NotFound from "./pages/not-found";
import Payment from "./pages/payment"; // Assuming Payment component exists

function AppContent() {
  console.log('🚀 App Content Rendering - Simple Mode');
  
  // Simple routing without authentication for now
  return (
    <div className="min-h-screen w-full">
      <Switch>
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/register" component={Register} />
        <Route path="/features" component={Features} />
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