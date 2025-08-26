
import React, { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useAuth } from '@/hooks/useAuth';
import { PageLoader } from '@/components/futuristic-loader';

interface SidebarContentLoaderProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function SidebarContentLoader({ children, showSidebar = true }: SidebarContentLoaderProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return <PageLoader text="Loading application..." variant="neural" />;
  }

  // If user should have sidebar but isn't authenticated, redirect
  if (showSidebar && !isAuthenticated) {
    window.location.href = '/auth/login';
    return <PageLoader text="Redirecting to login..." variant="quantum" />;
  }

  // If sidebar should be shown and user is authenticated
  if (showSidebar && isAuthenticated) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 flex flex-col min-h-screen">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // No sidebar needed (e.g., landing page, auth pages)
  return <>{children}</>;
}
