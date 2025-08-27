
import React from 'react';
import { cn } from '@/lib/utils';

interface FuturisticLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'pulse' | 'orbit' | 'matrix' | 'neural' | 'quantum' | 'minimal';
  text?: string;
  className?: string;
}

export function FuturisticLoader({ 
  size = 'md', 
  variant = 'minimal', 
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

  if (variant === 'minimal') {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="relative">
          <div className={cn(
            "rounded-full border-3 border-gray-200 dark:border-gray-700",
            sizeClasses[size]
          )}></div>
          <div className={cn(
            "absolute inset-0 rounded-full border-3 border-transparent border-t-blue-600 animate-spin",
            sizeClasses[size]
          )}></div>
          <div className={cn(
            "absolute inset-1 rounded-full border-2 border-transparent border-t-blue-400 animate-spin",
            sizeClasses[size]
          )} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        {text && (
          <div className={cn(
            "font-medium text-gray-700 dark:text-gray-200 animate-pulse",
            textSizeClasses[size]
          )}>
            {text}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'matrix') {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="relative">
          <div className={cn("grid grid-cols-3 gap-1", sizeClasses[size])}>
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent animate-pulse"></div>
        </div>
        {text && (
          <div className={cn(
            "font-mono font-medium bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent",
            textSizeClasses[size]
          )}>
            {text}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'neural') {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="relative">
          <div className={cn("relative", sizeClasses[size])}>
            {/* Central node */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            {/* Outer nodes */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{
                  transform: `rotate(${i * 60}deg) translateY(-${size === 'xl' ? '40px' : size === 'lg' ? '28px' : size === 'md' ? '20px' : '12px'})`,
                  transformOrigin: 'center center',
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full animate-pulse" style={{ animationDuration: '3s' }}>
              {[...Array(6)].map((_, i) => (
                <line
                  key={i}
                  x1="50%"
                  y1="50%"
                  x2={`${50 + 40 * Math.cos((i * 60) * Math.PI / 180)}%`}
                  y2={`${50 + 40 * Math.sin((i * 60) * Math.PI / 180)}%`}
                  stroke="url(#neural-gradient)"
                  strokeWidth="1"
                  opacity="0.6"
                />
              ))}
              <defs>
                <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        {text && (
          <div className={cn(
            "font-medium bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent",
            textSizeClasses[size]
          )}>
            {text}
          </div>
        )}
      </div>
    );
  }

  // Default variant - clean and modern
  return (
    <div className={cn("fixed inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center space-y-6 z-50", className)}>
      <div className="relative">
        <div className={cn(
          "rounded-full border-4 border-gray-200 dark:border-slate-700",
          sizeClasses[size]
        )}></div>
        <div className={cn(
          "absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-500 animate-spin",
          sizeClasses[size]
        )}></div>
        <div className={cn(
          "absolute inset-2 rounded-full border-2 border-transparent border-t-purple-500 animate-spin",
          sizeClasses[size]
        )} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      {text && (
        <div className={cn(
          "font-medium text-gray-700 dark:text-gray-200 text-center animate-pulse",
          textSizeClasses[size]
        )}>
          {text}
        </div>
      )}
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
}

export function PageLoader({ text = "Initializing ImageVault...", variant = "minimal" }: { text?: string; variant?: 'minimal' | 'neural' | 'matrix' }) {
  return (
    <div className="fixed inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center max-w-md mx-auto px-6">
        <FuturisticLoader variant={variant} size="lg" text={text} />
        
        {/* Status indicators */}
        <div className="flex justify-center space-x-6 text-xs text-gray-400 dark:text-gray-500 mt-8">
          <span className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span>Authentication</span>
          </span>
          <span className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <span>Storage</span>
          </span>
          <span className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <span>CDN</span>
          </div>
        </div>
      </div>
    </div>
  );
}
