import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Star, Shield } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function Payment() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "month",
      description: "Perfect for getting started",
      features: ["100 images/month", "Basic API access", "5GB storage", "Community support"],
      popular: false,
      color: "gray"
    },
    {
      name: "Pro",
      price: "$29",
      period: "month",
      description: "For growing businesses",
      features: ["10,000 images/month", "Advanced API", "100GB storage", "Priority support", "Custom domains"],
      popular: true,
      color: "blue"
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "month",
      description: "For large organizations",
      features: ["Unlimited images", "Full API access", "1TB storage", "24/7 support", "Custom integrations", "SLA guarantee"],
      popular: false,
      color: "purple"
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      <AppSidebar />
      <SidebarInset className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <h1 className="text-xl font-semibold">Billing & Payment</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Choose Your Plan
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Scale your image hosting with confidence
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white px-3 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-500">/{plan.period}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.price === "$0" ? "Current Plan" : "Upgrade Now"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Security Badge */}
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                Secure payment processing with industry-standard encryption
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  );
}