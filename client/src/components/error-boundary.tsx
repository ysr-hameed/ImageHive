import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }> | React.ReactElement;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Log additional context
    console.error('Component stack:', errorInfo.componentStack);

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service like Sentry
      // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (React.isValidElement(this.props.fallback)) {
        return this.props.fallback;
      }

      if (typeof this.props.fallback === 'function') {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/30 dark:to-purple-950/30 p-4">
          <div className="max-w-lg w-full bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 rounded-xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-full flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400 animate-pulse" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-red-600 dark:text-red-400 font-medium mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs bg-red-50 dark:bg-red-900/10 p-3 rounded border overflow-auto max-h-40 text-red-800 dark:text-red-200">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    '\n\nComponent Stack:' + this.state.errorInfo.componentStack
                  )}
                </pre>
              </details>
            )}

            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>

              <Button
                variant="ghost"
                onClick={() => window.location.reload()}
                className="w-full text-gray-600 dark:text-gray-400"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for logging errors
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: { componentStack?: string }) => {
    console.error('Application Error:', error, errorInfo);

    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }, []);
}