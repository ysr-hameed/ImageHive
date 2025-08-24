import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  Trash2,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApiKeys, setShowApiKeys] = useState(false);
  
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: (user as any)?.bio || '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    browserNotifications: false,
    marketingEmails: false,
    weeklyDigest: true,
    publicProfile: false,
    showInDirectory: true,
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('PUT', '/api/v1/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({ title: 'Success', description: 'Profile updated successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Failed to update profile', 
        variant: 'destructive' 
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('PUT', '/api/v1/password', data);
    },
    onSuccess: () => {
      setPassword({ current: '', new: '', confirm: '' });
      toast({ title: 'Success', description: 'Password updated successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Failed to update password', 
        variant: 'destructive' 
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/v1/account');
    },
    onSuccess: () => {
      window.location.href = '/';
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete account', 
        variant: 'destructive' 
      });
    },
  });

  const { data: usage = {} } = useQuery({
    queryKey: ['/api/v1/usage'],
    retry: false,
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'starter': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'pro': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200';
      case 'enterprise': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your images and data.')) {
      if (window.confirm('This is your final warning. Type DELETE to confirm account deletion.')) {
        const confirmation = window.prompt('Type DELETE to confirm:');
        if (confirmation === 'DELETE') {
          deleteAccountMutation.mutate();
        }
      }
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
              </div>
              
              <Button 
                onClick={() => updateProfileMutation.mutate(profile)}
                disabled={updateProfileMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Account & Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account & Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Current Plan</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your subscription plan and usage
                  </p>
                </div>
                <Badge className={getPlanColor(user?.plan || 'free')}>
                  {(user?.plan || 'free').charAt(0).toUpperCase() + (user?.plan || 'free').slice(1)} Plan
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Storage Used</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatBytes((usage as any)?.storageUsed || 0)} / {formatBytes(user?.storageLimit || 0)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ 
                      width: `${Math.min(100, (((usage as any)?.storageUsed || 0) / (user?.storageLimit || 1)) * 100)}%`
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">API Requests This Month</span>
                  <span className="text-gray-900 dark:text-white">
                    {(usage as any)?.apiRequests || 0} / {user?.apiRequestsLimit || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{ 
                      width: `${Math.min(100, (((usage as any)?.apiRequests || 0) / (user?.apiRequestsLimit || 1)) * 100)}%`
                    }}
                  />
                </div>
              </div>
              
              <Button variant="outline">
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={password.current}
                  onChange={(e) => setPassword({ ...password, current: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={password.new}
                    onChange={(e) => setPassword({ ...password, new: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={password.confirm}
                    onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                  />
                </div>
              </div>
              
              <Button 
                onClick={() => updatePasswordMutation.mutate(password)}
                disabled={updatePasswordMutation.isPending || password.new !== password.confirm}
              >
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(preferences).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, [key]: checked })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Delete Account</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    disabled={deleteAccountMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}