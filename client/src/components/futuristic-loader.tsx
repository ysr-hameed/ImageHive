
import React from 'react';
import { cn } from '@/lib/utils';

interface FuturisticLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'pulse' | 'orbit' | 'matrix' | 'neural' | 'quantum';
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

  if (variant === 'quantum') {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="relative">
          <div className={cn("relative", sizeClasses[size])}>
            {/* Holographic projection */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-emerald-500/20 rounded-full animate-spin blur-sm" style={{ animationDuration: '6s' }}></div>
            <div className="absolute inset-1 bg-gradient-to-r from-emerald-500/30 via-blue-500/30 to-purple-500/30 rounded-full animate-spin blur-xs" style={{ animationDuration: '4s', animationDirection: 'reverse' }}></div>
            
            {/* Central holographic core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full animate-pulse shadow-2xl shadow-cyan-500/60"></div>
                <div className="absolute inset-0 w-6 h-6 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 rounded-full animate-ping opacity-30"></div>
              </div>
            </div>
            
            {/* Floating data particles */}
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full animate-bounce"
                style={{
                  background: `linear-gradient(45deg, hsl(${180 + i * 20}, 70%, 60%), hsl(${240 + i * 15}, 80%, 70%))`,
                  left: `${15 + (i % 4) * 20}%`,
                  top: `${15 + Math.floor(i / 4) * 20}%`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: `${2 + (i % 3)}s`,
                  boxShadow: `0 0 10px hsl(${180 + i * 20}, 70%, 60%)`
                }}
              />
            ))}
            
            {/* Energy rings with holographic effect */}
            <div className="absolute inset-0 border-2 border-gradient-to-r from-cyan-400/40 via-purple-400/40 to-emerald-400/40 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
            <div className="absolute inset-3 border-2 border-gradient-to-r from-purple-400/50 via-pink-400/50 to-cyan-400/50 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
            <div className="absolute inset-6 border-1 border-gradient-to-r from-emerald-400/60 via-blue-400/60 to-purple-400/60 rounded-full animate-spin" style={{ animationDuration: '4s' }}></div>
            
            {/* Holographic scan lines */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent animate-pulse" style={{ top: '25%', animationDelay: '0s' }}></div>
              <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400/80 to-transparent animate-pulse" style={{ top: '50%', animationDelay: '1s' }}></div>
              <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent animate-pulse" style={{ top: '75%', animationDelay: '2s' }}></div>
            </div>
          </div>
        </div>
        {text && (
          <div className={cn(
            "font-medium bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent animate-pulse",
            textSizeClasses[size]
          )}>
            {text}
          </div>
        )}
      </div>
    );
  }

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
            "font-medium bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent animate-pulse",
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
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-purple-600 animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
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

  // Default variant - clean and simple
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4 min-h-screen", className)}>
      <div className="relative">
        <div className={cn(
          "rounded-full border-3 border-gray-200 dark:border-slate-700",
          sizeClasses[size]
        )}></div>
        <div className={cn(
          "absolute inset-0 rounded-full border-3 border-transparent border-t-blue-600 animate-spin",
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

export function PageLoader({ text = "Initializing ImageVault...", variant = "default" }: { text?: string; variant?: 'default' | 'orbit' }) {
  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-slate-900 flex items-center justify-center z-50">
      <div className="text-center">
        <FuturisticLoader variant={variant} size="xl" text={text} />
        
        {/* Simple loading progress indicators */}
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        {/* Status indicators */}
        <div className="mt-6 space-y-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {text}
          </div>
          <div className="flex justify-center space-x-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Auth</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Storage</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span>CDN</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
