
import React from 'react';
import { cn } from '@/lib/utils';

interface FuturisticLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'pulse' | 'orbit';
  text?: string;
  className?: string;
}

export function FuturisticLoader({ 
  size = 'md', 
  variant = 'default', 
  text = 'Loading...',
  className 
}: FuturisticLoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (variant === 'gradient') {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="relative">
          <div className={cn(
            "rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 animate-spin",
            sizeClasses[size]
          )}>
            <div className="absolute inset-1 rounded-full bg-white dark:bg-slate-900"></div>
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 animate-pulse"></div>
        </div>
        {text && (
          <div className={cn(
            "font-medium text-gray-600 dark:text-gray-300 animate-pulse",
            textSizeClasses[size]
          )}>
            {text}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="relative">
          <div className={cn(
            "rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse",
            sizeClasses[size]
          )}></div>
          <div className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-ping opacity-20",
            sizeClasses[size]
          )}></div>
        </div>
        {text && (
          <div className={cn(
            "font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse",
            textSizeClasses[size]
          )}>
            {text}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'orbit') {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="relative">
          <div className={cn("relative", sizeClasses[size])}>
            <div className="absolute inset-0 rounded-full border-2 border-blue-200 dark:border-blue-800"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-purple-600 animate-spin animate-reverse" style={{ animationDuration: '0.8s' }}></div>
            <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-emerald-600 animate-spin" style={{ animationDuration: '1.2s' }}></div>
          </div>
        </div>
        {text && (
          <div className={cn(
            "font-medium text-gray-600 dark:text-gray-300",
            textSizeClasses[size]
          )}>
            {text}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <div className="relative">
        <div className={cn(
          "rounded-full border-4 border-gray-200 dark:border-slate-700",
          sizeClasses[size]
        )}></div>
        <div className={cn(
          "absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin",
          sizeClasses[size]
        )}></div>
      </div>
      {text && (
        <div className={cn(
          "font-medium text-gray-600 dark:text-gray-300",
          textSizeClasses[size]
        )}>
          {text}
        </div>
      )}
    </div>
  );
}

export function PageLoader({ text = "Loading page..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/30 dark:to-purple-950/30 flex items-center justify-center">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 right-20 w-60 h-60 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 text-center">
        <FuturisticLoader variant="orbit" size="xl" text={text} />
        
        {/* Loading progress dots */}
        <div className="flex justify-center space-x-1 mt-8">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}
