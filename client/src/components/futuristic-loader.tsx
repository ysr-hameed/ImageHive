
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
            {/* Quantum particles */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animation: `quantumFloat 3s ease-in-out infinite ${i * 0.25}s`,
                }}
              />
            ))}
            {/* Central quantum core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full animate-pulse shadow-lg shadow-cyan-500/50"></div>
            </div>
            {/* Energy rings */}
            <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-full animate-spin" style={{ animationDuration: '4s' }}></div>
            <div className="absolute inset-2 border-2 border-blue-400/40 rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
          </div>
        </div>
        {text && (
          <div className={cn(
            "font-medium bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent",
            textSizeClasses[size]
          )}>
            {text}
          </div>
        )}
        <style jsx>{`
          @keyframes quantumFloat {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
            33% { transform: translate(10px, -10px) scale(1.2); opacity: 1; }
            66% { transform: translate(-5px, 10px) scale(0.8); opacity: 0.5; }
          }
        `}</style>
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

export function PageLoader({ text = "Initializing ImageVault...", variant = "neural" }: { text?: string; variant?: 'neural' | 'quantum' | 'matrix' | 'orbit' }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/30 dark:to-purple-950/30 flex items-center justify-center">
      {/* Enhanced animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 dark:from-blue-600/10 dark:to-cyan-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 right-20 w-60 h-60 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 dark:from-emerald-600/10 dark:to-teal-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 text-center">
        <FuturisticLoader variant={variant} size="xl" text={text} />
        
        {/* Enhanced loading progress indicators */}
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-bounce shadow-lg shadow-blue-500/50"></div>
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce shadow-lg shadow-purple-500/50" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-bounce shadow-lg shadow-emerald-500/50" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        {/* Status indicators */}
        <div className="mt-6 space-y-2">
          <div className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
            Connecting to services...
          </div>
          <div className="flex justify-center space-x-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Auth</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span>Storage</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span>CDN</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
