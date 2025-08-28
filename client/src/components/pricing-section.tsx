import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { useState } from "react";

const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "2GB storage",
        "5,000 API requests/month",
        "100 images max",
        "5 folders",
        "Basic support",
        "Standard CDN"
      ],
      highlighted: false,
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Starter", 
      price: "$9",
      period: "/month",
      description: "Great for small projects",
      features: [
        "25GB storage",
        "25,000 API requests/month",
        "1,000 images max",
        "20 folders",
        "Priority support",
        "Global CDN",
        "Custom domains"
      ],
      highlighted: false,
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const,
      popular: true
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month", 
      description: "Best for growing businesses",
      features: [
        "100GB storage",
        "100,000 API requests/month",
        "10,000 images max",
        "100 folders",
        "Priority support",
        "Advanced analytics",
        "Custom domains",
        "Image optimization",
        "Team collaboration"
      ],
      highlighted: true,
      buttonText: "Start Free Trial",
      buttonVariant: "default" as const,
      popular: false
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large-scale operations",
      features: [
        "500GB+ storage",
        "1M+ API requests/month",
        "100K+ images",
        "1000+ folders",
        "24/7 dedicated support",
        "Custom domains",
        "Advanced analytics",
        "Full API access",
        "Global CDN",
        "SLA guarantee",
        "Custom integrations",
        "White-label solution",
        "Dedicated account manager"
      ],
      highlighted: false,
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      popular: false
    }
  ];

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-20 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-8">
            <span className={`text-sm mr-3 transition-colors ${!isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                isYearly ? 'bg-brand-600' : 'bg-gray-300 dark:bg-slate-600'
              }`}
              data-testid="pricing-toggle"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ml-3 transition-colors ${isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
              Yearly
              <Badge variant="secondary" className="ml-2 text-xs">
                Save 20%
              </Badge>
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const isEnterprise = plan.name === "Enterprise";
            let displayPrice = plan.price;
            
            // Calculate yearly discount if not Enterprise
            if (!isEnterprise && plan.price !== "Custom") {
              const monthlyPrice = parseFloat(plan.price.replace('$', ''));
              if (monthlyPrice > 0) {
                const yearlyPrice = Math.round(monthlyPrice * 12 * 0.8); // 20% discount
                displayPrice = isYearly ? `$${yearlyPrice}` : plan.price;
              }
            }

            return (
              <div
                key={index}
                className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? "ring-2 ring-blue-500 scale-105 z-10 shadow-2xl"
                    : "hover:shadow-xl hover:scale-102"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 text-sm font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {plan.popular && !plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-emerald-500 text-white px-4 py-1 text-xs">
                      Best Value
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {displayPrice}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className={`w-4 h-4 mr-3 ${
                        plan.highlighted ? 'text-white' : 'text-emerald-500'
                      }`} />
                      <span className={
                        plan.highlighted ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                      }>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-white text-blue-600 hover:bg-gray-50'
                      : plan.name === 'Enterprise'
                        ? 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                  asChild
                  data-testid={`button-${plan.name.toLowerCase()}`}
                >
                  <a href="/auth/login">
                    {plan.buttonText}
                  </a>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}