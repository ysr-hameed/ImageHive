import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

export default function VerifyEmail() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [token, setToken] = useState('');

  const verifyEmailMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/v1/auth/verify-email', { token });
      return response;
    },
    onSuccess: () => {
      setVerificationStatus('success');
      toast({
        title: 'Email verified!',
        description: 'Your email has been successfully verified.',
      });
    },
    onError: (error: any) => {
      setVerificationStatus('error');
      toast({
        title: 'Verification failed',
        description: error.message || 'Email verification failed',
        variant: 'destructive',
      });
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/v1/auth/resend-verification', {});
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Verification email sent!',
        description: 'Check your email for a new verification link.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend verification email',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    // Extract token from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const verificationToken = urlParams.get('token');
    
    if (verificationToken) {
      setToken(verificationToken);
      verifyEmailMutation.mutate(verificationToken);
    } else {
      setVerificationStatus('error');
    }
  }, [location]);

  const getStatusContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return {
          icon: <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />,
          title: 'Verifying your email...',
          description: 'Please wait while we verify your email address.',
          actions: null,
        };
      
      case 'success':
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-600" />,
          title: 'Email verified!',
          description: 'Your email has been successfully verified. You can now sign in to your account.',
          actions: (
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Continue to sign in
              </Link>
            </Button>
          ),
        };
      
      case 'error':
        return {
          icon: <XCircle className="w-8 h-8 text-red-600" />,
          title: 'Verification failed',
          description: 'The verification link is invalid or has expired. You can request a new verification email.',
          actions: (
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => resendVerificationMutation.mutate()}
                disabled={resendVerificationMutation.isPending}
              >
                {resendVerificationMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend verification email
                  </>
                )}
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/login">
                  Back to sign in
                </Link>
              </Button>
            </div>
          ),
        };
      
      default:
        return null;
    }
  };

  const content = getStatusContent();

  if (!content) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">IV</span>
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 flex items-center justify-center">
                {content.icon}
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {content.title}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {content.description}
                </p>
              </div>
              
              {content.actions && (
                <div className="mt-6">
                  {content.actions}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Need help?{' '}
            <Link href="/support" className="text-blue-600 hover:text-blue-500">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}