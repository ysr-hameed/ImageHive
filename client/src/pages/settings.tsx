import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarContentLoader } from "@/components/sidebar-content-loader";
import { useToast } from "@/hooks/use-toast";
import {
  Settings as SettingsIcon,
  Globe,
  Key,
  User,
  Check,
  X,
  Plus,
  Copy,
  AlertCircle,
  Trash2,
  Bell,
  CreditCard
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";

export default function Settings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newDomain, setNewDomain] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
      window.location.href = "/auth/login";
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch custom domains
  const { data: domainsData = { domains: [] }, isLoading: domainsLoading } = useQuery({
    queryKey: ["/api/v1/domains"],
    retry: false,
  });

  // Create domain mutation
  const createDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      return await apiRequest("POST", "/api/v1/domains", { domain });
    },
    onSuccess: (data) => {
      toast({
        title: "Domain added",
        description: "Follow the DNS setup instructions to verify your domain.",
      });
      setNewDomain("");
      queryClient.invalidateQueries({ queryKey: ["/api/v1/domains"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add domain",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Verify domain mutation
  const verifyDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      return await apiRequest("POST", `/api/v1/domains/${domainId}/verify`, {});
    },
    onSuccess: () => {
      toast({
        title: "Domain verified",
        description: "Your custom domain is now active!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/domains"] });
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    createDomainMutation.mutate(newDomain);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "DNS record copied to clipboard",
    });
  };

  // EnhancedUploadForm component from the original code snippet (assuming it was there)
  // This is a placeholder to show where the fix might be applied if it was present.
  // The actual fix for "Cannot read properties of undefined (reading 'title')" would involve
  // checking if 'user' and 'user.plan' are defined before accessing them.
  // For example: const userPlan = user?.plan ?? 'Free';
  // Since the original code provided does not contain EnhancedUploadForm, this comment serves
  // as an explanation of the error found in the user message.
  // The primary changes below focus on the layout as requested.


  return (
    <SidebarContentLoader isLoading={!user}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
        <div className="w-full max-w-full">


          <Tabs defaultValue="domains" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="domains">Domains</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            {/* Custom Domains */}
            <TabsContent value="domains">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Custom Domains</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Connect your own domain to serve images from your branded URL. Available for Pro and Enterprise plans.
                    </p>

                    {/* Domain Input Form */}
                    <form onSubmit={handleAddDomain} className="flex gap-4 mb-6">
                      <Input
                        placeholder="images.yourdomain.com"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        disabled={createDomainMutation.isPending}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Domain
                      </Button>
                    </form>
                  </div>

                  {/* Existing Domains */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Connected Domains
                    </h4>

                    {domainsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
                      </div>
                    ) : (domainsData as any).domains.length === 0 ? (
                      <div className="text-center py-8">
                        <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No custom domains yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Add a custom domain to brand your image URLs.
                        </p>
                      </div>
                    ) : (
                      (domainsData as any).domains.map((domain: any) => (
                        <div key={domain.id} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {domain.domain}
                              </span>
                              <Badge variant={domain.isVerified ? "outline" : "secondary"} className={domain.isVerified ? "text-green-600 border-green-200" : "text-yellow-600"}>
                                {domain.isVerified ? "Verified" : "Pending Verification"}
                              </Badge>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {!domain.isVerified && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <p className="mb-2">Please add this DNS record to verify domain ownership:</p>
                              <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded font-mono text-xs">
                                <div>Type: CNAME</div>
                                <div>Name: {domain.domain}</div>
                                <div>Value: cdn.imagevault.io</div>
                              </div>
                              <Button onClick={() => verifyDomainMutation.mutate(domain.id)} disabled={verifyDomainMutation.isPending} className="mt-3">Verify</Button>
                            </div>
                          )}

                          {domain.isVerified && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <p className="mb-2">DNS Configuration:</p>
                              <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded font-mono text-xs">
                                <div>Type: CNAME</div>
                                <div>Name: {domain.domain}</div>
                                <div>Value: cdn.imagevault.io</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p>• Custom domains require Pro or Enterprise plan</p>
                    <p>• SSL certificates are automatically provisioned</p>
                    <p>• DNS changes can take up to 48 hours to propagate</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Settings */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue={user?.firstName} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue={user?.lastName} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email} disabled />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Settings */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="w-5 h-5" />
                    <span>Security Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Change Password</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Update your account password
                      </p>
                      <Button variant="outline">Change Password</Button>
                    </div>
                    {/* Add more security features here like 2FA */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <div className="text-sm text-gray-500">
                        Receive updates about your account and usage
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Usage Alerts</Label>
                      <div className="text-sm text-gray-500">
                        Get notified when approaching plan limits
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Security Alerts</Label>
                      <div className="text-sm text-gray-500">
                        Important security and login notifications
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Button>Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Settings */}
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Billing & Subscription</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Plan */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Current Plan</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user?.plan ?? 'Free'} Plan
                      </p>
                    </div>
                    <Button asChild>
                      <Link to="/plans">Upgrade Plan</Link>
                    </Button>
                  </div>

                  {/* Usage Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Storage Used
                      </h5>
                      <p className="text-2xl font-bold text-blue-600">2.1 GB</p>
                      <p className="text-xs text-gray-500">of 5 GB limit</p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        API Calls
                      </h5>
                      <p className="text-2xl font-bold text-green-600">1.2K</p>
                      <p className="text-xs text-gray-500">of 10K limit</p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Payment Method
                    </h4>
                    <div className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 bg-gray-200 dark:bg-slate-600 rounded flex items-center justify-center text-xs">
                            CARD
                          </div>
                          <div>
                            <p className="text-sm font-medium">**** **** **** 4242</p>
                            <p className="text-xs text-gray-500">Expires 12/2025</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Billing History */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Recent Invoices
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Pro Plan - January 2024</p>
                          <p className="text-xs text-gray-500">Paid on Jan 1, 2024</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">$29.00</p>
                          <Button variant="ghost" size="sm">Download</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarContentLoader>
  );
}