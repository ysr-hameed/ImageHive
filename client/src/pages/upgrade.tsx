
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Check, Crown, Zap, Star, CreditCard } from 'lucide-react';
import Navigation from '@/components/navigation';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    currency: 'USD',
    interval: 'month',
    features: [
      '10GB Storage',
      '10,000 API Requests/month',
      'Basic image transformations',
      'CDN delivery',
      'Email support'
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    currency: 'USD',
    interval: 'month',
    features: [
      '100GB Storage',
      '100,000 API Requests/month',
      'Advanced transformations',
      'Custom domains',
      'Watermarks',
      'Priority support',
      'Analytics dashboard'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited Storage',
      'Unlimited API Requests',
      'All transformations',
      'Multiple custom domains',
      'White-label solution',
      'Dedicated support',
      'SLA guarantee',
      'Advanced analytics'
    ],
    popular: false
  }
];

export default function Upgrade() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  if (!isAuthenticated && !isLoading) {
    setLocation('/auth/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleUpgrade = async (planId: string) => {
    setProcessingPlan(planId);
    
    try {
      // Integrate with UPay payment gateway
      const response = await fetch('/api/v1/payments/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/upgrade/success`,
          cancelUrl: `${window.location.origin}/upgrade`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const { paymentUrl } = await response.json();
      
      // Redirect to UPay payment page
      window.location.href = paymentUrl;

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Upgrade Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your image management needs
          </p>
          {user?.plan && (
            <Badge variant="outline" className="mt-4">
              Current Plan: {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {plan.id === 'starter' && <Zap className="w-12 h-12 text-blue-500" />}
                  {plan.id === 'pro' && <Crown className="w-12 h-12 text-purple-500" />}
                  {plan.id === 'enterprise' && <Star className="w-12 h-12 text-emerald-500" />}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-500 dark:text-gray-400">/{plan.interval}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={processingPlan === plan.id || user?.plan === plan.id}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {processingPlan === plan.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : user?.plan === plan.id ? (
                    'Current Plan'
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Upgrade to {plan.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-2">Need a custom solution?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Contact our sales team for enterprise pricing and custom features.
            </p>
            <Button variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
