import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest('POST', '/api/auth/forgot-password', { email });
      return response;
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: 'Reset link sent!',
        description: 'Check your email for password reset instructions.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset link',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }
    forgotPasswordMutation.mutate(email);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Check your email
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              We've sent password reset instructions to:
            </p>
            <p className="mt-1 font-medium text-gray-900 dark:text-white">
              {email}
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="mb-2">Didn't receive the email? Check your spam folder or:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Wait a few minutes for the email to arrive</li>
                    <li>Make sure you entered the correct email address</li>
                    <li>Try requesting a new reset link</li>
                  </ul>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try different email
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => forgotPasswordMutation.mutate(email)}
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? 'Sending...' : 'Resend email'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center">
            <Link 
              href="/auth/login" 
              className="text-blue-600 hover:text-blue-500 font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">IV</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            Forgot password?
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            No worries, we'll send you reset instructions
          </p>
        </div>

        {/* Forgot Password Form */}
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <p className="text-center">
          <Link 
            href="/auth/login" 
            className="text-blue-600 hover:text-blue-500 font-medium flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}