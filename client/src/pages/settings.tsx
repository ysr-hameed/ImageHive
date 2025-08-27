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
  EyeOff,
  UploadCloud,
  FileText,
  DollarSign
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Link, navigate } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";


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

  // State for new upload form
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");

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
      navigate("/auth/login");
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

  // API Keys
  const { data: apiKeysData = [], isLoading: apiKeysLoading } = useQuery({
    queryKey: ["/api/v1/api-keys"],
    queryFn: async () => {
      try {
        return await apiRequest("GET", "/api/v1/api-keys");
      } catch (error) {
        console.error("Failed to fetch API keys:", error);
        toast({
          title: "Error fetching API keys",
          description: "Could not load your API keys. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
    retry: false,
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string, description: string }) => {
      if (!name.trim() || !description.trim()) {
        throw new Error("Name and description are required");
      }
      return await apiRequest("POST", "/api/v1/api-keys", { name, description });
    },
    onSuccess: (data) => {
      toast({
        title: "API Key created",
        description: "Your new API key has been generated successfully.",
      });
      setUploadName(""); // Reset form fields
      setUploadDescription("");
      queryClient.invalidateQueries({ queryKey: ["/api/v1/api-keys"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create API key",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      return await apiRequest("DELETE", `/api/v1/api-keys/${keyId}`);
    },
    onSuccess: () => {
      toast({
        title: "API Key deleted",
        description: "The API key has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/api-keys"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete API key",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload Page New Form
  const uploadFileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest("POST", "/api/v1/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (response) => {
      toast({
        title: "Upload successful",
        description: `File uploaded: ${response.fileName}`,
      });
      setSelectedFile(null);
      setUploadName("");
      setUploadDescription("");
      queryClient.invalidateQueries({ queryKey: ["/api/v1/files"] }); // Assuming a query for files exists
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Please check the file and try again.",
        variant: "destructive",
      });
    },
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({ title: "No file selected", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", uploadName || selectedFile.name); // Use name from input or filename
    formData.append("description", uploadDescription);
    formData.append("plan", selectedPlan); // Assuming plan selection is relevant for upload

    uploadFileMutation.mutate(formData);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadName(event.target.files[0].name); // Pre-fill name with filename
    }
  };

  // Fetching plans for the upgrade logic
  const { data: plansData = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/v1/plans"],
    queryFn: () => apiRequest("GET", "/api/v1/plans"),
    staleTime: Infinity, // Plans don't change often
  });

  // Mutation to create a payment session
  const createPaymentSessionMutation = useMutation({
    mutationFn: async (planId: string) => {
      return await apiRequest("POST", "/api/v1/payment/create-session", { planId });
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank"); // Open checkout in new tab
      } else {
        throw new Error("Payment session URL not provided.");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to start payment",
        description: error.message || "Could not initiate payment session.",
        variant: "destructive",
      });
    },
  });

  // Mutation to update user's plan after successful payment
  const updateUserPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      return await apiRequest("PUT", "/api/v1/user/plan", { planId });
    },
    onSuccess: () => {
      toast({
        title: "Plan updated",
        description: "Your subscription plan has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/auth/me"] }); // Refresh user data
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update plan",
        description: error.message || "Could not update your plan.",
        variant: "destructive",
      });
    },
  });

  const handleChoosePlan = (planId: string) => {
    setSelectedPlan(planId); // Set selected plan for potential later use or confirmation
    createPaymentSessionMutation.mutate(planId);
  };

  // Dummy mutations for admin notifications (replace with actual API calls)
  const createNotificationMutation = useMutation({
    mutationFn: async (notification: any) => {
      console.log("Creating notification:", notification);
      // Replace with actual API call: await apiRequest("POST", "/api/v1/admin/notifications", notification);
      return Promise.resolve({ id: Date.now(), ...notification });
    },
    onSuccess: (data) => {
      toast({
        title: "Notification created",
        description: "Notification sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/notifications"] }); // Assuming this query exists
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create notification",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      console.log("Deleting notification:", notificationId);
      // Replace with actual API call: await apiRequest("DELETE", `/api/v1/admin/notifications/${notificationId}`);
      return Promise.resolve({});
    },
    onSuccess: () => {
      toast({
        title: "Notification deleted",
        description: "Notification removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/notifications"] }); // Assuming this query exists
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete notification",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Dummy settings data and mutations
  const [appSettings, setAppSettings] = useState({
    siteName: "ImageVault",
    siteUrl: "https://imagevault.io",
    contactEmail: "support@imagevault.io",
    defaultStorageClass: "standard",
    enableEmailVerification: true,
    enableTwoFactorAuth: false,
    maxUploadFileSize: 100, // MB
    allowedFileTypes: ["jpg", "png", "gif"],
    cdnUrl: "https://cdn.imagevault.io",
    supportChatEnabled: true,
    darkModeByDefault: false,
    ssoEnabled: false,
    defaultPlanId: "free",
    maxConcurrentUploads: 5,
    assetWatermarking: false,
    thumbnailGeneration: true,
    imageOptimizationLevel: "medium",
    customDomainVerification: true,
    rateLimitPerMinute: 1000,
    storageQuotaWarning: 80, // percentage
    emailNotificationFrequency: "daily",
    passwordResetTokenExpiry: 60, // minutes
    auditLogRetentionDays: 90,
    loginAttemptLimit: 5,
    maintenanceMode: false
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<typeof appSettings>) => {
      console.log("Updating settings:", settings);
      // Replace with actual API call: await apiRequest("PUT", "/api/v1/settings", settings);
      return Promise.resolve({ ...appSettings, ...settings });
    },
    onSuccess: (updatedSettings) => {
      toast({
        title: "Settings updated",
        description: "Application settings have been saved.",
      });
      setAppSettings(updatedSettings);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update settings",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSettingsChange = (key: keyof typeof appSettings, value: any) => {
    setAppSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(appSettings);
  };


  // Handlers for form submissions
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

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    createApiKeyMutation.mutate({ name: uploadName, description: uploadDescription });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "API Key copied to clipboard",
    });
  };

  // Extract API key value for copying
  const getApiKeyForCopy = (key: string) => {
    // In a real scenario, you might only display a masked version and have a "copy" button
    // For this example, we'll assume the full key is available and needs copying
    return key;
  }

  return (
    <SidebarContentLoader isLoading={!user}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
        <div className="w-full max-w-full">
          <Tabs defaultValue="domains" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="domains">Domains</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="plans">Plans</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
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

            {/* API Keys */}
            <TabsContent value="api-keys">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="w-5 h-5" />
                    <span>API Keys</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateApiKey} className="space-y-4 mb-6">
                    <h4 className="text-md font-semibold">Create New API Key</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="apiKeyName">Key Name</Label>
                        <Input
                          id="apiKeyName"
                          value={uploadName}
                          onChange={(e) => setUploadName(e.target.value)}
                          placeholder="e.g., My Project Key"
                        />
                      </div>
                      <div>
                        <Label htmlFor="apiKeyDescription">Description</Label>
                        <Input
                          id="apiKeyDescription"
                          value={uploadDescription}
                          onChange={(e) => setUploadDescription(e.target.value)}
                          placeholder="e.g., Access for my web app"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={createApiKeyMutation.isPending}
                    >
                      {createApiKeyMutation.isPending ? "Creating..." : "Create API Key"}
                    </Button>
                  </form>

                  <hr className="my-6 border-gray-200 dark:border-slate-700" />

                  <h4 className="text-md font-semibold mb-4">Your API Keys</h4>
                  {apiKeysLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
                    </div>
                  ) : apiKeysData.length === 0 ? (
                    <div className="text-center py-8">
                      <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No API Keys yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Create an API key to access your data programmatically.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {apiKeysData.map((key: any) => (
                        <div key={key.id} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{key.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">{key.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                              {/* Masking the key for security, show only a part */}
                              {key.key.substring(0, 8)}...{key.key.substring(key.key.length - 4)}
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(key.key)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this API key?')) {
                                  deleteApiKeyMutation.mutate(key.id);
                                }
                              }}
                              disabled={deleteApiKeyMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Upload Page */}
            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UploadCloud className="w-5 h-5" />
                    <span>Upload Files</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUploadSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* File Upload */}
                      <div>
                        <Label htmlFor="fileUpload">Select File</Label>
                        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 pt-5 pb-6">
                          <div className="text-center">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-1 text-sm text-gray-600">
                              {selectedFile ? selectedFile.name : 'Drag and drop a file or'}
                            </p>
                            <label
                              htmlFor="fileUpload"
                              className="relative cursor-pointer font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2"
                            >
                              <span className="text-brand-600"> Upload a file</span>
                              <input
                                id="fileUpload"
                                name="fileUpload"
                                type="file"
                                className="sr-only"
                                onChange={handleFileChange}
                                accept=".jpg,.jpeg,.png,.gif" // Limit accepted file types
                              />
                            </label>
                            {selectedFile && (
                              <p className="text-xs text-gray-500 mt-1">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* File Details */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="uploadName">File Name</Label>
                          <Input
                            id="uploadName"
                            value={uploadName}
                            onChange={(e) => setUploadName(e.target.value)}
                            placeholder="Enter a name for the file"
                          />
                        </div>
                        <div>
                          <Label htmlFor="uploadDescription">Description</Label>
                          <Textarea
                            id="uploadDescription"
                            value={uploadDescription}
                            onChange={(e) => setUploadDescription(e.target.value)}
                            placeholder="Describe the file"
                            className="min-h-[80px]"
                          />
                        </div>
                        {/* Plan Selection for Upload (if applicable) */}
                        <div>
                          <Label htmlFor="uploadPlan">Assign to Plan</Label>
                          <Select onValueChange={setSelectedPlan} value={selectedPlan}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                            <SelectContent>
                              {plansLoading ? (
                                <SelectItem value="" disabled>Loading plans...</SelectItem>
                              ) : plansData.length === 0 ? (
                                <SelectItem value="" disabled>No plans available</SelectItem>
                              ) : (
                                plansData.map((plan: any) => (
                                  <SelectItem key={plan.id} value={plan.id}>
                                    {plan.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={uploadFileMutation.isPending || !selectedFile}
                      >
                        {uploadFileMutation.isPending ? "Uploading..." : "Upload File"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plans Page */}
            <TabsContent value="plans">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5" />
                    <span>Subscription Plans</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plansLoading ? (
                    <div className="col-span-3 text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
                    </div>
                  ) : plansData.length === 0 ? (
                    <div className="col-span-3 text-center py-8">
                      <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No plans available
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Please check back later or contact support.
                      </p>
                    </div>
                  ) : (
                    plansData.map((plan: any) => (
                      <div key={plan.id} className={`border rounded-lg p-6 flex flex-col justify-between ${plan.isRecommended ? 'border-brand-500 shadow-lg' : 'border-gray-200 dark:border-slate-600'}`}>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
                          <p className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
                            ${plan.price}
                            <span className="text-base font-normal text-gray-500 dark:text-gray-400">/month</span>
                          </p>

                          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                            {plan.features.map((feature: string, index: number) => (
                              <li key={index} className="flex items-center space-x-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          onClick={() => handleChoosePlan(plan.id)}
                          disabled={createPaymentSessionMutation.isPending}
                          className={`mt-8 w-full ${plan.isRecommended ? '' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600'}`}
                        >
                          {createPaymentSessionMutation.isPending && selectedPlan === plan.id
                            ? "Processing..."
                            : "Choose Plan"}
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* General Settings */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <SettingsIcon className="w-5 h-5" />
                    <span>Application Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold">Basic Information</h4>
                      <div>
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input
                          id="siteName"
                          value={appSettings.siteName}
                          onChange={(e) => handleSettingsChange('siteName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="siteUrl">Site URL</Label>
                        <Input
                          id="siteUrl"
                          value={appSettings.siteUrl}
                          onChange={(e) => handleSettingsChange('siteUrl', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          value={appSettings.contactEmail}
                          onChange={(e) => handleSettingsChange('contactEmail', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cdnUrl">CDN URL</Label>
                        <Input
                          id="cdnUrl"
                          value={appSettings.cdnUrl}
                          onChange={(e) => handleSettingsChange('cdnUrl', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Upload & Storage */}
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold">Upload & Storage</h4>
                      <div>
                        <Label htmlFor="maxUploadFileSize">Max Upload File Size (MB)</Label>
                        <Input
                          id="maxUploadFileSize"
                          type="number"
                          value={appSettings.maxUploadFileSize}
                          onChange={(e) => handleSettingsChange('maxUploadFileSize', parseInt(e.target.value, 10))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="allowedFileTypes">Allowed File Types (comma-separated)</Label>
                        <Input
                          id="allowedFileTypes"
                          value={appSettings.allowedFileTypes.join(',')}
                          onChange={(e) => handleSettingsChange('allowedFileTypes', e.target.value.split(',').map(t => t.trim()).filter(t => t.length > 0))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="defaultStorageClass">Default Storage Class</Label>
                        <Select onValueChange={(val) => handleSettingsChange('defaultStorageClass', val)} value={appSettings.defaultStorageClass}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select storage class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="infrequent_access">Infrequent Access</SelectItem>
                            <SelectItem value="archive">Archive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="storageQuotaWarning">Storage Quota Warning (%)</Label>
                        <Input
                          id="storageQuotaWarning"
                          type="number"
                          min="1"
                          max="99"
                          value={appSettings.storageQuotaWarning}
                          onChange={(e) => handleSettingsChange('storageQuotaWarning', parseInt(e.target.value, 10))}
                        />
                      </div>
                    </div>

                    {/* Security & Auth */}
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold">Security & Authentication</h4>
                      <div>
                        <Label htmlFor="enableEmailVerification">Enable Email Verification</Label>
                        <Switch
                          id="enableEmailVerification"
                          checked={appSettings.enableEmailVerification}
                          onCheckedChange={(checked) => handleSettingsChange('enableEmailVerification', checked)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="enableTwoFactorAuth">Enable Two-Factor Authentication</Label>
                        <Switch
                          id="enableTwoFactorAuth"
                          checked={appSettings.enableTwoFactorAuth}
                          onCheckedChange={(checked) => handleSettingsChange('enableTwoFactorAuth', checked)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="loginAttemptLimit">Login Attempt Limit</Label>
                        <Input
                          id="loginAttemptLimit"
                          type="number"
                          value={appSettings.loginAttemptLimit}
                          onChange={(e) => handleSettingsChange('loginAttemptLimit', parseInt(e.target.value, 10))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="passwordResetTokenExpiry">Password Reset Token Expiry (minutes)</Label>
                        <Input
                          id="passwordResetTokenExpiry"
                          type="number"
                          value={appSettings.passwordResetTokenExpiry}
                          onChange={(e) => handleSettingsChange('passwordResetTokenExpiry', parseInt(e.target.value, 10))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ssoEnabled">Enable SSO</Label>
                        <Switch
                          id="ssoEnabled"
                          checked={appSettings.ssoEnabled}
                          onCheckedChange={(checked) => handleSettingsChange('ssoEnabled', checked)}
                        />
                      </div>
                    </div>

                    {/* Performance & Features */}
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold">Performance & Features</h4>
                      <div>
                        <Label htmlFor="supportChatEnabled">Enable Support Chat</Label>
                        <Switch
                          id="supportChatEnabled"
                          checked={appSettings.supportChatEnabled}
                          onCheckedChange={(checked) => handleSettingsChange('supportChatEnabled', checked)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="darkModeByDefault">Dark Mode by Default</Label>
                        <Switch
                          id="darkModeByDefault"
                          checked={appSettings.darkModeByDefault}
                          onCheckedChange={(checked) => handleSettingsChange('darkModeByDefault', checked)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="thumbnailGeneration">Thumbnail Generation</Label>
                        <Switch
                          id="thumbnailGeneration"
                          checked={appSettings.thumbnailGeneration}
                          onCheckedChange={(checked) => handleSettingsChange('thumbnailGeneration', checked)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="imageOptimizationLevel">Image Optimization Level</Label>
                        <Select onValueChange={(val) => handleSettingsChange('imageOptimizationLevel', val)} value={appSettings.imageOptimizationLevel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select optimization level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="assetWatermarking">Asset Watermarking</Label>
                        <Switch
                          id="assetWatermarking"
                          checked={appSettings.assetWatermarking}
                          onCheckedChange={(checked) => handleSettingsChange('assetWatermarking', checked)}
                        />
                      </div>
                    </div>

                    {/* Admin & System */}
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold">Admin & System</h4>
                      <div>
                        <Label htmlFor="defaultPlanId">Default Plan ID</Label>
                        <Input
                          id="defaultPlanId"
                          value={appSettings.defaultPlanId}
                          onChange={(e) => handleSettingsChange('defaultPlanId', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxConcurrentUploads">Max Concurrent Uploads</Label>
                        <Input
                          id="maxConcurrentUploads"
                          type="number"
                          value={appSettings.maxConcurrentUploads}
                          onChange={(e) => handleSettingsChange('maxConcurrentUploads', parseInt(e.target.value, 10))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="customDomainVerification">Custom Domain Verification</Label>
                        <Switch
                          id="customDomainVerification"
                          checked={appSettings.customDomainVerification}
                          onCheckedChange={(checked) => handleSettingsChange('customDomainVerification', checked)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="rateLimitPerMinute">Rate Limit Per Minute</Label>
                        <Input
                          id="rateLimitPerMinute"
                          type="number"
                          value={appSettings.rateLimitPerMinute}
                          onChange={(e) => handleSettingsChange('rateLimitPerMinute', parseInt(e.target.value, 10))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="auditLogRetentionDays">Audit Log Retention (Days)</Label>
                        <Input
                          id="auditLogRetentionDays"
                          type="number"
                          value={appSettings.auditLogRetentionDays}
                          onChange={(e) => handleSettingsChange('auditLogRetentionDays', parseInt(e.target.value, 10))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emailNotificationFrequency">Email Notification Frequency</Label>
                        <Select onValueChange={(val) => handleSettingsChange('emailNotificationFrequency', val)} value={appSettings.emailNotificationFrequency}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="immediate">Immediate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                        <Switch
                          id="maintenanceMode"
                          checked={appSettings.maintenanceMode}
                          onCheckedChange={(checked) => handleSettingsChange('maintenanceMode', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button onClick={handleSaveSettings} disabled={updateSettingsMutation.isPending}>
                      {updateSettingsMutation.isPending ? "Saving..." : "Save All Settings"}
                    </Button>
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