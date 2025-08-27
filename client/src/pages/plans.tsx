import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Check, Star, Zap, Shield, Crown, ArrowRight } from "lucide-react";

export default function Plans() {
  const plans = [
    {
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
      ],
      limitations: [
        "Limited bandwidth",
        "Basic analytics"
      ],
      icon: Zap,
      color: "gray",
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "month",
      description: "Ideal for growing businesses and applications",
      features: [
        "10,000 images/month",
        "Advanced image processing",
        "50GB storage",
        "Priority support",
        "Advanced API features",
        "Custom domains",
        "Analytics dashboard",
        "Webhook support"
      ],
      limitations: [],
      icon: Star,
      color: "blue",
      buttonText: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "month",
      description: "For large-scale applications with custom needs",
      features: [
        "Unlimited images",
        "Custom image processing",
        "500GB storage",
        "24/7 dedicated support",
        "Custom integrations",
        "SLA guarantee",
        "Advanced security",
        "Custom analytics",
        "White-label options"
      ],
      limitations: [],
      icon: Crown,
      color: "purple",
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'purple': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getButtonClass = (color: string, popular: boolean) => {
    if (popular) {
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
    switch (color) {
      case 'purple': return 'bg-purple-600 hover:bg-purple-700 text-white';
      default: return 'border border-gray-300 hover:bg-gray-50 text-gray-900';
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
              Start free and scale as you grow. All plans include our core features with different usage limits.
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
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-xl' : 'border shadow-lg'} hover:shadow-xl transition-shadow`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <plan.icon className={`w-12 h-12 ${getIconColor(plan.color)}`} />
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                  <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                    /{plan.period}
                  </span>
                </div>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button 
                  className={`w-full ${getButtonClass(plan.color, plan.popular)}`}
                  asChild
                >
                  <Link href={plan.name === 'Free' ? '/auth/register' : '/auth/register'}>
                    {plan.buttonText}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Features included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className="text-sm text-gray-500 dark:text-gray-500">
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
                  Can I upgrade or downgrade anytime?
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes, you can change your plan at any time. Changes take effect immediately.
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
                  Is there a free trial for paid plans?
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes, all paid plans come with a 14-day free trial. No credit card required.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Do you offer custom enterprise solutions?
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes, we offer custom solutions for enterprise clients with specific requirements.
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