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
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      console.error('Error caught by boundary:', error, errorInfo);
      console.error('Component stack:', errorInfo.componentStack);
      console.error('Error stack:', error.stack);
    } else {
      // In production, only log essential error info
      console.error('Application error occurred');
    }
  }

  public render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>

              {isDevelopment && this.state.error && (
                <div className="text-left bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                    Development Error Details:
                  </h3>
                  <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto max-h-32">
                    {this.state.error.message}
                  </pre>
                  {this.state.error.stack && (
                    <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto max-h-32 mt-2">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}

              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Refresh Page
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