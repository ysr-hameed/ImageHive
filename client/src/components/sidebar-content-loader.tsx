
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

  // No sidebar needed (e.g., landing page, auth pages)
  return <>{children}</>;
}
