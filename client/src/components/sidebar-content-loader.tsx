import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SidebarContentLoaderProps {
  children: React.ReactNode;
  delay?: number;
}

export function SidebarContentLoader({ children, delay = 500 }: SidebarContentLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showComponents, setShowComponents] = useState<boolean[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Stagger component loading
      const componentCount = React.Children.count(children);
      const staggerDelay = 150;
      
      for (let i = 0; i < componentCount; i++) {
        setTimeout(() => {
          setShowComponents(prev => {
            const newState = [...prev];
            newState[i] = true;
            return newState;
          });
        }, i * staggerDelay);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [children, delay]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {/* Header skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        {/* Content skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="w-full">
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={`transition-all duration-300 ${
            showComponents[index] 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}
          style={{ 
            transitionDelay: showComponents[index] ? '0ms' : `${index * 150}ms` 
          }}
        >
          {showComponents[index] ? child : <Skeleton className="h-32 w-full" />}
        </div>
      ))}
    </div>
  );
}