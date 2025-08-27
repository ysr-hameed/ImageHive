import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });

    // Additional debugging info in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 ErrorBoundary Debug Info');
      console.log('Error:', error);
      console.log('Error Info:', errorInfo);
      console.log('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  public render() {
    if (this.state.hasError) {
      console.log('🚨 Error Boundary activated, rendering fallback UI');

      // Enhanced fallback UI with more debugging info
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
          <div className="text-center p-8 max-w-2xl">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Application Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ImageVault encountered an unexpected error. Please check the console for details.
            </p>
            {this.state.error && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6 text-left">
                <p className="text-sm text-red-800 dark:text-red-300 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                🏠 Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary as default, ErrorBoundary };