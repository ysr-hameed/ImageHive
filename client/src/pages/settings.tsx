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
  AlertCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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

  return (
    <SidebarContentLoader isLoading={!user}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="max-w-4xl mx-auto">
          {/* Page Content Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs defaultValue="domains" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="domains">Custom Domains</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
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
                  {/* Add new domain */}
                  <form onSubmit={handleAddDomain} className="flex space-x-2">
                    <Input
                      placeholder="your-domain.com"
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

                  {/* Existing domains */}
                  <div className="space-y-4">
                    {domainsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
                      </div>
                    ) : (domainsData as any).domains.length === 0 ? (
                      <div className="text-center py-8">
                        <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No custom domains
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Add a custom domain to brand your image URLs
                        </p>
                      </div>
                    ) : (
                      (domainsData as any).domains.map((domain: any) => (
                        <Card key={domain.id} className="border">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <h3 className="font-medium text-lg">{domain.domain}</h3>
                                <Badge variant={domain.isVerified ? "default" : "secondary"}>
                                  {domain.isVerified ? (
                                    <>
                                      <Check className="w-3 h-3 mr-1" />
                                      Verified
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="w-3 h-3 mr-1" />
                                      Pending
                                    </>
                                  )}
                                </Badge>
                              </div>
                              {!domain.isVerified && (
                                <Button
                                  onClick={() => verifyDomainMutation.mutate(domain.id)}
                                  disabled={verifyDomainMutation.isPending}
                                  size="sm"
                                >
                                  Verify
                                </Button>
                              )}
                            </div>

                            {!domain.isVerified && (
                              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-4">
                                <h4 className="font-medium">DNS Setup Instructions</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Add these DNS records to your domain registrar:
                                </p>

                                <div className="space-y-3">
                                  <div className="bg-white dark:bg-slate-700 rounded border p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <Label className="font-medium">CNAME Record</Label>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard("cdn.imagevault.com")}
                                      >
                                        <Copy className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-500">Name:</span>
                                        <div className="font-mono">{domain.domain}</div>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Value:</span>
                                        <div className="font-mono">cdn.imagevault.com</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-white dark:bg-slate-700 rounded border p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <Label className="font-medium">TXT Record (Verification)</Label>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(`_verification.${domain.domain}`)}
                                      >
                                        <Copy className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-500">Name:</span>
                                        <div className="font-mono">_verification.{domain.domain}</div>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Value:</span>
                                        <div className="font-mono">verification-token-here</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  <p><strong>Important:</strong> DNS propagation can take 5-60 minutes. After adding the records, click "Verify" to complete the setup.</p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
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
                      <Input id="firstName" defaultValue={user.firstName} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue={user.lastName} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user.email} disabled />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Settings */}
            <TabsContent value="account">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Plan</h3>
                        <p className="text-sm text-gray-600">{user.plan || 'Free'}</p>
                      </div>
                      <Badge>{user.plan || 'Free'}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Email Verified</h3>
                        <p className="text-sm text-gray-600">
                          {user.emailVerified ? 'Verified' : 'Not verified'}
                        </p>
                      </div>
                      <Badge variant={user.emailVerified ? "default" : "destructive"}>
                        {user.emailVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Change Password</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Update your account password
                        </p>
                        <Button variant="outline">Change Password</Button>
                      </div>
                      <div>
                        <h3 className="font-medium">Delete Account</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Permanently delete your account and all data
                        </p>
                        <Button variant="destructive">Delete Account</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarContentLoader>
  );
}