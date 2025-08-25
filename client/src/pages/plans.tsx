import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Check, Crown, Zap, Star, CreditCard, ArrowRight, Users, Shield, Headphones, Clock } from 'lucide-react';
import Navigation from '@/components/navigation';

const plans = [
    {
      name: "Free",
      price: 0,
      period: "forever",
      description: "Perfect for personal projects",
      features: [
        "2 GB storage",
        "5,000 API requests/month",
        "Basic image optimization",
        "HTTPS & CDN",
        "Community support"
      ],
      limitations: [
        "Limited storage",
        "Basic features only",
        "Community support"
      ]
    },
    {
      name: "Starter",
      price: 5,
      period: "/month",
      description: "Great for small businesses",
      features: [
        "25 GB storage", 
        "25,000 API requests/month",
        "Advanced image processing",
        "Custom domains",
        "Email support"
      ],
      popular: true
    },
    {
      name: "Pro", 
      price: 15,
      period: "/month",
      description: "For growing applications",
      features: [
        "100 GB storage",
        "100,000 API requests/month", 
        "Watermarks & branding",
        "Priority support",
        "Advanced analytics"
      ]
    },
    {
      name: "Enterprise",
      price: 49,
      period: "/month",
      description: "Custom enterprise solutions", 
      features: [
        "500 GB storage",
        "1M API requests/month",
        "Custom integrations", 
        "SLA guarantees",
        "Dedicated support"
      ]
    }
  ];

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Global CDN ensures your images load quickly worldwide'
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: '99.9% uptime with enterprise-grade security'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together with your team on image management'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Get help when you need it with our support team'
  }
];

export default function Plans() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePlanSelect = async (planId: string) => {
    if (!isAuthenticated) {
      setLocation('/auth/login');
      return;
    }

    if (planId === 'enterprise') {
      window.open('mailto:sales@imagevault.com?subject=Enterprise Plan Inquiry');
      return;
    }

    if (planId === user?.plan) {
      toast({
        title: 'Already subscribed',
        description: 'You are already on this plan.',
      });
      return;
    }

    setLoadingPlan(planId);

    try {
      // Initialize PayU payment
      const response = await fetch('/api/v1/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/upgrade/success`,
          cancelUrl: `${window.location.origin}/plans`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const { paymentUrl } = await response.json();
      window.location.href = paymentUrl;
    } catch (error) {
      toast({
        title: 'Payment Error',
        description: 'Failed to start payment process. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose the Perfect Plan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Scale your image management with plans designed for every need. Start free and upgrade as you grow.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-8">
              <span className={`text-sm mr-3 transition-colors ${!isYearly ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className={`text-sm ml-3 transition-colors ${isYearly ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                Yearly
              </span>
              {isYearly && (
                <Badge variant="secondary" className="ml-2">
                  Save 20%
                </Badge>
              )}
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {plans.map((plan) => {
              const isCurrentPlan = user?.plan === plan.name.toLowerCase();
              const price = typeof plan.price === 'object'
                ? (isYearly ? plan.price.yearly : plan.price.monthly)
                : plan.price;

              return (
                <Card key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-2">
                    <CardTitle className="flex items-center justify-center gap-2">
                      {plan.name === 'Pro' && <Crown className="w-5 h-5 text-yellow-500" />}
                      {plan.name}
                      {plan.name === 'Enterprise' && <Badge variant="outline" className="border-gray-400 text-gray-400">Custom</Badge>}
                    </CardTitle>
                    <div className="text-3xl font-bold">
                      {typeof price === 'number' ? (
                        <>
                          ${price}
                          <span className="text-base font-normal text-gray-500">
                            /{isYearly ? 'year' : 'month'}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl">Custom</span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {plan.description}
                    </p>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-500">
                          <span className="w-4 h-4 mr-2 flex-shrink-0">×</span>
                          <span>{limitation}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? 'secondary' : (plan.popular ? 'default' : plan.buttonVariant)}
                      disabled={isCurrentPlan || loadingPlan === plan.name.toLowerCase()}
                      onClick={() => handlePlanSelect(plan.name.toLowerCase())}
                    >
                      {loadingPlan === plan.name.toLowerCase() ? (
                        'Processing...'
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        <>
                          {plan.buttonText}
                          {!plan.enterprise && <ArrowRight className="w-4 h-4 ml-2" />}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Features Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              Why Choose ImageVault?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <feature.icon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately. For yearly plans, downgrades will be reflected at the end of the current billing cycle.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    We accept all major credit cards (Visa, Mastercard, American Express) via Stripe, our secure payment processor.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Is there a free trial for paid plans?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    We offer a 14-day free trial for our Starter and Pro plans. You can cancel anytime before the trial ends to avoid charges. Our Free plan is always available.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">How does the custom domain feature work?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    With a custom domain, you can serve your images through your own domain name (e.g., images.yourdomain.com). You'll need to configure DNS records to point to our CDN. Full instructions are in our documentation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Ready to Scale Your Image Management?</h2>
                <p className="mb-6 opacity-90">
                  Join thousands of developers and businesses who trust ImageVault for their image management needs. Get started with our Free plan today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" asChild>
                    <a href="/auth/register">Start Free</a>
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
                    <a href="/docs">View Documentation</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}