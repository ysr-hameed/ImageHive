
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Shield, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Payment() {
  const [selectedPayment, setSelectedPayment] = useState<'paypal' | 'payu' | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Get plan details from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const planName = urlParams.get('plan') || 'pro';
  const planPrice = urlParams.get('price') || '19';

  const planDetails = {
    pro: {
      name: "Pro Plan",
      price: "$19",
      features: ["10,000 images/month", "50GB storage", "Advanced API", "Priority support"]
    },
    enterprise: {
      name: "Enterprise Plan", 
      price: "$99",
      features: ["Unlimited images", "500GB storage", "Custom integrations", "24/7 support"]
    }
  };

  const currentPlan = planDetails[planName as keyof typeof planDetails] || planDetails.pro;

  const handlePayment = async (method: 'paypal' | 'payu') => {
    setLoading(true);
    try {
      // Here you would integrate with actual payment providers
      if (method === 'paypal') {
        // PayPal integration
        toast({
          title: "Redirecting to PayPal",
          description: "You will be redirected to complete payment",
        });
        // window.location.href = `https://paypal.com/checkout?amount=${planPrice}&plan=${planName}`;
        
        // For demo, simulate success after 2 seconds
        setTimeout(() => {
          toast({
            title: "Payment Successful!",
            description: "Your plan has been upgraded successfully",
          });
          window.location.href = '/dashboard';
        }, 2000);
        
      } else if (method === 'payu') {
        // PayU integration
        toast({
          title: "Redirecting to PayU",
          description: "You will be redirected to complete payment",
        });
        // window.location.href = `https://secure.payu.in/payment?amount=${planPrice}&plan=${planName}`;
        
        // For demo, simulate success after 2 seconds
        setTimeout(() => {
          toast({
            title: "Payment Successful!",
            description: "Your plan has been upgraded successfully",
          });
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/plans">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Secure checkout for your {currentPlan.name}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">{currentPlan.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">Monthly subscription</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{currentPlan.price}</div>
                  <div className="text-sm text-gray-500">/month</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Included Features:</h4>
                <ul className="space-y-1">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-2xl font-bold">{currentPlan.price}/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Cancel anytime • 14-day free trial
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method Selection */}
              <div className="space-y-3">
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPayment === 'paypal' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setSelectedPayment('paypal')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-sm">PP</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">PayPal</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pay securely with your PayPal account
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPayment === 'payu' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setSelectedPayment('payu')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-sm">PU</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">PayU</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Credit/Debit cards, UPI, Net banking
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="space-y-4">
                <h4 className="font-semibold">Billing Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your payment information is encrypted and secure
                </p>
              </div>

              {/* Payment Button */}
              <Button 
                className="w-full" 
                size="lg"
                disabled={!selectedPayment || loading}
                onClick={() => selectedPayment && handlePayment(selectedPayment)}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  `Pay ${currentPlan.price} with ${selectedPayment === 'paypal' ? 'PayPal' : 'PayU'}`
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By completing this purchase, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
