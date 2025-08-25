import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for personal projects and testing",
    features: [
      "2 GB storage",
      "5,000 API requests/month",
      "Basic image optimization",
      "HTTPS & CDN included",
      "Community support"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Starter",
    price: "$5",
    period: "/month",
    description: "Great for small businesses and portfolios",
    features: [
      "25 GB storage",
      "25,000 API requests/month",
      "Advanced image processing",
      "Custom domains",
      "Email support",
      "Image analytics"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Pro",
    price: "$15",
    period: "/month",
    description: "For growing applications and teams",
    features: [
      "100 GB storage",
      "100,000 API requests/month",
      "Watermarks & branding",
      "Batch operations",
      "Priority support",
      "Advanced analytics",
      "Team collaboration"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "/month",
    description: "Custom solutions for large-scale applications",
    features: [
      "500 GB storage",
      "1M API requests/month",
      "Custom integrations",
      "SLA guarantees",
      "Dedicated support",
      "Advanced security",
      "White-label solution"
    ],
    cta: "Contact Sales",
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
            const price = isEnterprise
              ? "Custom"
              : isYearly
                ? (plan.price as { monthly: number; yearly: number }).yearly
                : (plan.price as { monthly: number; yearly: number }).monthly;

            return (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 relative ${
                  plan.popular
                    ? 'bg-gradient-to-br from-brand-500 to-emerald-500 text-white'
                    : 'bg-gray-50 dark:bg-slate-700'
                } ${plan.popular ? '' : 'border border-gray-200 dark:border-slate-600'}`}
                data-testid={`plan-${plan.name.toLowerCase()}`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/20 text-white border-white/30" data-testid="popular-badge">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {plan.name}
                  </h3>

                  <div className="mb-6">
                    {isEnterprise ? (
                      <span className={`text-3xl font-bold ${
                        plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}>
                        Custom
                      </span>
                    ) : (
                      <>
                        <span className={`text-3xl font-bold ${
                          plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'
                        }`}>
                          ${price}
                        </span>
                        <span className={`${
                          plan.popular ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {plan.period}
                        </span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className={`w-4 h-4 mr-3 ${
                          plan.popular ? 'text-white' : 'text-emerald-500'
                        }`} />
                        <span className={
                          plan.popular ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                        }>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-white text-brand-600 hover:bg-gray-50'
                        : plan.name === 'Enterprise'
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                        : 'bg-brand-600 hover:bg-brand-700 text-white'
                    }`}
                    asChild
                    data-testid={`button-${plan.name.toLowerCase()}`}
                  >
                    <a href="/auth/login">
                      {plan.cta}
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}