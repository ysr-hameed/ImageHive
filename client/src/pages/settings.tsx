
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
  CreditCard,
  Eye,
  EyeOff
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";

export default function Settings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newDomain, setNewDomain] = useState("");
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || ""
      });
    }
  }, [user]);

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
    queryFn: async () => {
      try {
        return await apiRequest("GET", "/api/v1/domains");
      } catch (error) {
        console.log("Domains API not available yet");
        return { domains: [] };
      }
    },
    retry: false,
  });

  // Create domain mutation
  const createDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        throw new Error("Invalid domain format");
      }
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
      let errorMessage = "Failed to add domain";
      if (error.message.includes("already exists")) {
        errorMessage = "Domain already exists";
      } else if (error.message.includes("Invalid")) {
        errorMessage = "Invalid domain format. Use format: subdomain.domain.com";
      }
      toast({
        title: "Failed to add domain",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Verify domain mutation
  const verifyDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      return await apiRequest("POST", `/api/v1/domains/${domainId}/verify`);
    },
    onSuccess: () => {
      toast({
        title: "Domain verified",
        description: "Your custom domain is now active!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/domains"] });
    },
    onError: (error: any) => {
      let errorMessage = "Verification failed";
      if (error.message.includes("DNS")) {
        errorMessage = "DNS records not found. Please check your DNS configuration.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Verification timeout. DNS changes can take up to 48 hours.";
      }
      toast({
        title: "Verification failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Delete domain mutation
  const deleteDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      return await apiRequest("DELETE", `/api/v1/domains/${domainId}`);
    },
    onSuccess: () => {
      toast({
        title: "Domain deleted",
        description: "Custom domain has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/domains"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete domain",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      return await apiRequest("PUT", "/api/v1/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update profile",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("New passwords do not match");
      }
      if (data.newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      return await apiRequest("PUT", "/api/v1/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to change password",
        description: error.message || "Please check your current password and try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    createDomainMutation.mutate(newDomain);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    changePasswordMutation.mutate(passwordData);
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
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this domain? This action cannot be undone.')) {
                                  deleteDomainMutation.mutate(domain.id);
                                }
                              }}
                              disabled={deleteDomainMutation.isPending}
                            >
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
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={profileData.email} disabled />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support if needed.</p>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="w-5 h-5" />
                    <span>Security Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input 
                          id="currentPassword" 
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Enter your current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input 
                          id="newPassword" 
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Enter your new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input 
                          id="confirmPassword" 
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm your new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                    </Button>
                  </form>
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
                      <p className="text-2xl font-bold text-blue-600">{user?.usage?.storage || '0 MB'}</p>
                      <p className="text-xs text-gray-500">of {user?.limits?.storage || '1 GB'} limit</p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        API Calls
                      </h5>
                      <p className="text-2xl font-bold text-green-600">{user?.usage?.apiCalls || '0'}</p>
                      <p className="text-xs text-gray-500">of {user?.limits?.apiCalls || '1K'} limit</p>
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
                            <p className="text-sm font-medium">No payment method added</p>
                            <p className="text-xs text-gray-500">Add a payment method to upgrade</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/payment">Add Payment Method</Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Billing History */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Recent Invoices
                    </h4>
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No invoices yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Your billing history will appear here after your first payment.
                      </p>
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
