
import React from "react";
import { Router, Routes, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import ErrorBoundary from "@/components/error-boundary";
import { queryClient } from "@/lib/queryClient";

// Auth Pages
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";
import VerifyEmail from "@/pages/auth/verify-email";

// Main Pages
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Upload from "@/pages/upload";
import Images from "@/pages/images";
import Collections from "@/pages/collections";
import Analytics from "@/pages/analytics";
import ApiKeys from "@/pages/api-keys";
import ApiUsage from "@/pages/api-usage";
import Activity from "@/pages/activity";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";
import Plans from "@/pages/plans";
import Payment from "@/pages/payment";
import Admin from "@/pages/admin";
import Docs from "@/pages/docs";
import ApiDocs from "@/pages/api-docs";
import About from "@/pages/about";
import Features from "@/pages/features";
import Contact from "@/pages/contact";
import Help from "@/pages/help";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="imagevault-ui-theme">
        <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            <Router>
              <Routes>
                {/* Auth Routes */}
                <Route path="/auth/login" component={Login} />
                <Route path="/auth/register" component={Register} />
                <Route path="/auth/forgot-password" component={ForgotPassword} />
                <Route path="/auth/reset-password" component={ResetPassword} />
                <Route path="/auth/verify-email" component={VerifyEmail} />

                {/* Main App Routes */}
                <Route path="/" component={Landing} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/upload" component={Upload} />
                <Route path="/images" component={Images} />
                <Route path="/collections" component={Collections} />
                <Route path="/analytics" component={Analytics} />
                <Route path="/api-keys" component={ApiKeys} />
                <Route path="/api-usage" component={ApiUsage} />
                <Route path="/activity" component={Activity} />
                <Route path="/notifications" component={Notifications} />
                <Route path="/settings" component={Settings} />
                <Route path="/plans" component={Plans} />
                <Route path="/payment" component={Payment} />
                <Route path="/admin" component={Admin} />
                <Route path="/docs" component={Docs} />
                <Route path="/api-docs" component={ApiDocs} />

                {/* Public Pages */}
                <Route path="/about" component={About} />
                <Route path="/features" component={Features} />
                <Route path="/contact" component={Contact} />
                <Route path="/help" component={Help} />
                <Route path="/terms" component={Terms} />
                <Route path="/privacy" component={Privacy} />

                {/* 404 */}
                <Route component={NotFound} />
              </Routes>
            </Router>
          </SidebarProvider>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
