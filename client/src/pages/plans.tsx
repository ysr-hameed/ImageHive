import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Check, Star, Zap, Shield, Crown, ArrowRight, Sparkles } from "lucide-react";

export default function Plans() {
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for personal projects and testing",
      features: [
        "100 images/month",
        "Basic image processing",
        "1GB storage",
        "Standard support",
        "API access",
        "Basic analytics",
        "Public sharing"
      ],
      limitations: [
        "Limited bandwidth",
        "Basic analytics",
        "No custom domains"
      ],
      icon: Zap,
      color: "gray",
      buttonText: "Get Started",
      popular: false,
      trial: false
    },
    {
      id: "starter",
      name: "Starter",
      price: "$9",
      period: "month",
      description: "Great for small businesses and developers",
      features: [
        "5,000 images/month",
        "Advanced image processing",
        "25GB storage",
        "Email support",
        "Advanced API features",
        "Detailed analytics",
        "Password protection",
        "Folder organization"
      ],
      limitations: [],
      icon: Star,
      color: "blue",
      buttonText: "Start 14-Day Trial",
      popular: false,
      trial: true
    },
    {
      id: "pro",
      name: "Pro",
      price: "$19",
      period: "month",
      description: "Ideal for growing businesses and applications",
      features: [
        "25,000 images/month",
        "Premium image processing",
        "100GB storage",
        "Priority support",
        "Advanced API features",
        "Custom domains",
        "Webhook support",
        "Advanced analytics",
        "Team collaboration"
      ],
      limitations: [],
      icon: Sparkles,
      color: "purple",
      buttonText: "Start 14-Day Trial",
      popular: true,
      trial: true
    },
    {
      id: "business",
      name: "Business",
      price: "$49",
      period: "month",
      description: "For established businesses with high volume needs",
      features: [
        "100,000 images/month",
        "Advanced image processing",
        "500GB storage",
        "24/7 phone support",
        "Custom integrations",
        "Multiple custom domains",
        "Advanced webhooks",
        "White-label options",
        "SSO integration",
        "Advanced security"
      ],
      limitations: [],
      icon: Crown,
      color: "gold",
      buttonText: "Start 14-Day Trial",
      popular: false,
      trial: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$199",
      period: "month",
      description: "For large-scale applications with custom needs",
      features: [
        "Unlimited images",
        "Custom image processing",
        "2TB+ storage",
        "24/7 dedicated support",
        "Custom integrations",
        "SLA guarantee",
        "Advanced security",
        "Custom analytics",
        "White-label options",
        "On-premise deployment",
        "Custom contracts"
      ],
      limitations: [],
      icon: Shield,
      color: "emerald",
      buttonText: "Contact Sales",
      popular: false,
      trial: false
    }
  ];

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'purple': return 'text-purple-600';
      case 'gold': return 'text-yellow-600';
      case 'emerald': return 'text-emerald-600';
      default: return 'text-gray-600';
    }
  };

  const getButtonClass = (color: string, popular: boolean) => {
    if (popular) {
      return 'bg-purple-600 hover:bg-purple-700 text-white';
    }
    switch (color) {
      case 'blue': return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'purple': return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'gold': return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      default: return 'border border-gray-300 hover:bg-gray-50 text-gray-900';
    }
  };

  const handlePlanSelect = async (plan: any) => {
    if (plan.name === 'Free') {
      window.location.href = '/auth/register';
      return;
    } 
    
    if (plan.name === 'Enterprise') {
      window.location.href = '/contact?plan=enterprise';
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/auth/register';
      return;
    }

    // If plan has trial, start trial instead of payment
    if (plan.trial) {
      try {
        const response = await fetch(`/api/v1/plans/${plan.id}/trial`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to start trial');
        }

        const result = await response.json();
        alert(`${plan.name} trial started successfully! Trial ends on ${new Date(result.trialEndsAt).toLocaleDateString()}`);
        window.location.href = '/dashboard';
        return;
      } catch (error) {
        console.error('Trial start error:', error);
        // Fallback to payment flow
      }
    }

    try {
      // Create payment session
      const response = await fetch('/api/v1/payments/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          price: parseFloat(plan.price.replace('$', '')),
          currency: 'USD'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const { paymentUrl } = await response.json();
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('Payment error:', error);
      // Fallback to payment page
      window.location.href = `/payment?plan=${plan.id}&price=${plan.price.replace('$', '')}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Start free and scale as you grow. All paid plans include a 14-day free trial.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline">
              ← Back to Home
            </Button>
          </Link>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-6 mb-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${plan.popular ? 'border-2 border-purple-500 shadow-xl scale-105' : 'border shadow-lg'} hover:shadow-xl transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <plan.icon className={`w-12 h-12 ${getIconColor(plan.color)}`} />
                </div>
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                  <span className="text-base font-normal text-gray-600 dark:text-gray-400">
                    /{plan.period}
                  </span>
                </div>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  className={`w-full ${getButtonClass(plan.color, plan.popular)}`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  {plan.buttonText}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Features included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className="text-xs text-gray-500 dark:text-gray-500">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  How does the free trial work?
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Start with a 14-day free trial of any paid plan. No credit card required to start your trial.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Can I upgrade or downgrade anytime?
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes, you can change your plan at any time. Changes take effect immediately with prorated billing.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  What happens if I exceed my limits?
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  We'll notify you when you approach your limits. You can upgrade or additional usage will be charged at standard rates.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Do you offer custom enterprise solutions?
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes, we offer custom solutions for enterprise clients with specific requirements and volume discounts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Need a custom solution?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Contact our sales team to discuss enterprise options and custom pricing.
          </p>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}