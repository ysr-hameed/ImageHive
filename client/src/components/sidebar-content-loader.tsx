import React from 'react';

interface SidebarContentLoaderProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export function SidebarContentLoader({ children, isLoading = false }: SidebarContentLoaderProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[200px] bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <div className="flex-1 bg-white dark:bg-slate-900">{children}</div>;
}