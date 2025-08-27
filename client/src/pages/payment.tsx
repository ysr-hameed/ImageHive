
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Shield,
  Check,
  ArrowLeft,
  Loader2,
  Globe,
  Zap
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Payment() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: ""
  });

  // Get plan from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const selectedPlan = urlParams.get("plan") || "pro";
  const planPrice = urlParams.get("price") || "19";

  const plans = {
    starter: { name: "Starter", price: 9, features: ["5K images/month", "25GB storage", "Email support"] },
    pro: { name: "Pro", price: 19, features: ["25K images/month", "100GB storage", "Priority support", "Custom domains"] },
    business: { name: "Business", price: 49, features: ["100K images/month", "500GB storage", "24/7 support", "Advanced features"] },
  };

  const currentPlan = plans[selectedPlan as keyof typeof plans] || plans.pro;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with payment",
        variant: "destructive",
      });
      setLocation("/auth/login");
    }
  }, [isAuthenticated, isLoading, toast, setLocation]);

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === "number") {
      // Format card number with spaces
      formattedValue = value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    } else if (field === "expiry") {
      // Format expiry as MM/YY
      formattedValue = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2");
      if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5);
    } else if (field === "cvv") {
      // Only numbers for CVV
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setCardData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handlePayment = async (method: "paypal" | "payu" | "card") => {
    setProcessing(true);
    
    try {
      // Real payment processing with backend API
      const response = await fetch('/api/v1/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          plan: selectedPlan,
          paymentMethod: method,
          cardData: method === 'card' ? cardData : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed');
      }
      
      if (method === "paypal" && result.paypalUrl) {
        // Redirect to PayPal
        window.location.href = result.paypalUrl;
      } else if (method === "payu" && result.payuUrl) {
        // Redirect to PayU
        window.location.href = result.payuUrl;
      } else {
        // Card payment successful
        toast({
          title: "Payment Successful!",
          description: `Welcome to ${currentPlan.name} plan! Redirecting to dashboard...`,
        });
        
        setTimeout(() => {
          setLocation("/dashboard?upgraded=true");
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/plans">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Subscribe to {currentPlan.name} plan and unlock powerful features
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="card">Credit Card</TabsTrigger>
                    <TabsTrigger value="paypal">PayPal</TabsTrigger>
                    <TabsTrigger value="payu">PayU</TabsTrigger>
                  </TabsList>

                  <TabsContent value="card" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={cardData.name}
                          onChange={(e) => handleCardInputChange("name", e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardData.number}
                          onChange={(e) => handleCardInputChange("number", e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            value={cardData.expiry}
                            onChange={(e) => handleCardInputChange("expiry", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={cardData.cvv}
                            onChange={(e) => handleCardInputChange("cvv", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-6" 
                      onClick={() => handlePayment("card")}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay $${currentPlan.price}/month`
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="paypal" className="space-y-4 mt-6">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Pay with PayPal</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        You'll be redirected to PayPal to complete your payment securely.
                      </p>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        onClick={() => handlePayment("paypal")}
                        disabled={processing}
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Redirecting...
                          </>
                        ) : (
                          `Continue with PayPal - $${currentPlan.price}/month`
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="payu" className="space-y-4 mt-6">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Pay with PayU</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Fast and secure payment processing with PayU.
                      </p>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700" 
                        onClick={() => handlePayment("payu")}
                        disabled={processing}
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Redirecting...
                          </>
                        ) : (
                          `Continue with PayU - $${currentPlan.price}/month`
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Secure Payment</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your payment information is encrypted and secure. We never store your card details.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">{currentPlan.name} Plan</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Most Popular
                  </Badge>
                </div>

                <div className="space-y-2">
                  {currentPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${currentPlan.price}.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${currentPlan.price}.00/month</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t">
                  <p>• 14-day free trial included</p>
                  <p>• Cancel anytime</p>
                  <p>• Billed monthly</p>
                  <p>• Auto-renewal (can be disabled)</p>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Our support team is here to help with any questions about your subscription.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
