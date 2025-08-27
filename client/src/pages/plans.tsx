import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarContentLoader } from "@/components/sidebar-content-loader";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  CreditCard, 
  Lock,
  Unlock,
  ArrowRight,
  MessageCircle 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for personal projects and small websites",
    features: [
      "1GB Storage",
      "100 Images/month",
      "Basic transformations",
      "Community support",
      "Basic analytics"
    ],
    limitations: [
      "Limited API calls",
      "No custom domains",
      "Basic support only"
    ],
    popular: false,
    icon: Lock
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "Best for growing businesses and developers",
    features: [
      "100GB Storage",
      "10,000 Images/month",
      "Advanced transformations",
      "Custom domains",
      "Priority support",
      "Advanced analytics",
      "API access",
      "Webhook support"
    ],
    limitations: [],
    popular: true,
    icon: Zap
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$199",
    period: "per month",
    description: "For large organizations with custom needs",
    features: [
      "Unlimited Storage",
      "Unlimited Images",
      "Custom transformations",
      "Multiple custom domains",
      "24/7 dedicated support",
      "Advanced analytics & reports",
      "SLA guarantee",
      "Custom integrations",
      "White-label solution"
    ],
    limitations: [],
    popular: false,
    icon: Crown
  }
];

export default function Plans() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

  const upgradeMutation = useMutation({
    mutationFn: async (planId: string) => {
      return await apiRequest("POST", "/api/v1/payments/create-checkout", { 
        planId,
        successUrl: `${window.location.origin}/dashboard?upgraded=true`,
        cancelUrl: `${window.location.origin}/plans`
      });
    },
    onSuccess: (data: any) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
      setIsUpgrading(null);
    },
  });

  const handleUpgrade = async (planId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upgrade your plan",
        variant: "destructive",
      });
      return;
    }

    setIsUpgrading(planId);
    upgradeMutation.mutate(planId);
  };

  const currentPlan = user?.plan?.toLowerCase() || 'free';

  return (
    <SidebarContentLoader>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Scale your image management with flexible pricing that grows with your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentPlan === plan.id;
              const canUpgrade = plan.id !== 'free' && !isCurrentPlan && currentPlan !== 'enterprise';
              const isDowngrade = (currentPlan === 'enterprise' && plan.id !== 'enterprise') || 
                                 (currentPlan === 'pro' && plan.id === 'free');

              return (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white px-4 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-500 text-white px-4 py-1">
                        <Check className="w-3 h-3 mr-1" />
                        Current Plan
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-6">
                    <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                      <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                        /{plan.period}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6">
                      {isCurrentPlan ? (
                        <Button className="w-full" disabled>
                          <Check className="w-4 h-4 mr-2" />
                          Current Plan
                        </Button>
                      ) : isDowngrade ? (
                        <Button variant="outline" className="w-full" disabled>
                          Contact Support to Downgrade
                        </Button>
                      ) : canUpgrade ? (
                        <Button 
                          className="w-full" 
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={isUpgrading === plan.id}
                        >
                          {isUpgrading === plan.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Upgrade to {plan.name}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full">
                          <Unlock className="w-4 h-4 mr-2" />
                          Get Started
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Can I change my plan anytime?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    What payment methods do you accept?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Is there a free trial?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Our Free plan allows you to test all basic features. Pro and Enterprise plans come with 14-day free trials.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    What happens to my data if I downgrade?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Your data is preserved, but access may be limited based on your new plan's quotas until usage is reduced.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarContentLoader>
  );
}