import React from 'react';

interface SidebarContentLoaderProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export function SidebarContentLoader({ children, isLoading }: { children: React.ReactNode; isLoading?: boolean }) {
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

  return <>{children}</>;
}