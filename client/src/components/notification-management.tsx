import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { 
  Bell, 
  Check, 
  Trash2, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  XCircle,
  Settings,
  Plus,
  Eye,
  EyeOff,
  Edit
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  isActive: boolean;
  createdAt: string;
  read: boolean; // Added 'read' property
}

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bell, Trash2, Send } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export function NotificationManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info',
    sendEmail: false,
    isGlobal: true,
    userIds: ''
  });

  // Fetch existing notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/v1/admin/notifications'],
    queryFn: () => apiRequest('GET', '/api/v1/admin/notifications'),
    retry: false
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (data: typeof notificationForm) => {
      const payload = {
        ...data,
        userIds: data.isGlobal ? [] : data.userIds.split(',').map(id => id.trim()).filter(Boolean)
      };
      return await apiRequest('POST', '/api/v1/admin/send-notification', payload);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Notification sent successfully'
      });
      setNotificationForm({
        title: '',
        message: '',
        type: 'info',
        sendEmail: false,
        isGlobal: true,
        userIds: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send notification',
        variant: 'destructive'
      });
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/v1/admin/notifications/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Notification deleted successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete notification',
        variant: 'destructive'
      });
    }
  });

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationForm.title || !notificationForm.message) {
      toast({
        title: 'Error',
        description: 'Title and message are required',
        variant: 'destructive'
      });
      return;
    }
    sendNotificationMutation.mutate(notificationForm);
  };

  return (
    <div className="space-y-6">
      {/* Send Notification Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Notification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={notificationForm.type}
                  onValueChange={(value) => setNotificationForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Notification message"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sendEmail"
                  checked={notificationForm.sendEmail}
                  onCheckedChange={(checked) => setNotificationForm(prev => ({ ...prev, sendEmail: checked }))}
                />
                <Label htmlFor="sendEmail">Send Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isGlobal"
                  checked={notificationForm.isGlobal}
                  onCheckedChange={(checked) => setNotificationForm(prev => ({ ...prev, isGlobal: checked }))}
                />
                <Label htmlFor="isGlobal">Send to All Users</Label>
              </div>
            </div>

            {!notificationForm.isGlobal && (
              <div>
                <Label htmlFor="userIds">User IDs (comma-separated)</Label>
                <Input
                  id="userIds"
                  value={notificationForm.userIds}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, userIds: e.target.value }))}
                  placeholder="user1,user2,user3"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={sendNotificationMutation.isPending}
              className="w-full"
            >
              {sendNotificationMutation.isPending ? 'Sending...' : 'Send Notification'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notifications sent yet.</p>
              </div>
            ) : (
              notifications.map((notification: any) => (
                <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{notification.title}</h4>
                      <Badge variant={notification.type === 'error' ? 'destructive' : 'default'}>
                        {notification.type}
                      </Badge>
                      {notification.isGlobal && <Badge variant="outline">Global</Badge>}
                      {notification.emailSent && <Badge variant="secondary">Email Sent</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotificationMutation.mutate(notification.id)}
                    disabled={deleteNotificationMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success',
    isActive: true,
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/v1/admin/notifications'],
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/v1/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/notifications'] });
      resetForm();
      toast({ title: 'Notification created successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to create notification', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const response = await fetch(`/api/v1/admin/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/notifications'] });
      resetForm();
      toast({ title: 'Notification updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update notification', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/admin/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete notification');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/notifications'] });
      toast({ title: 'Notification deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete notification', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      isActive: true,
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (notification: Notification) => {
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isActive: notification.isActive,
    });
    setEditingId(notification.id);
    setIsCreating(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200';
      case 'success': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
    }
  };

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/notifications"] });
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/notifications"] });
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    },
  });

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
    // State will be updated via query invalidation
  };

  const deleteNotification = (id: string) => {
    deleteNotificationMutation.mutate(id);
    // State will be updated via query invalidation
  };

  return (
    <div className="space-y-6">
      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {editingId ? 'Edit Notification' : 'Create New Notification'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Notification title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'info' | 'warning' | 'success') => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Notification message"
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Update' : 'Create'} Notification
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Create Button */}
      {!isCreating && (
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Notification
        </Button>
      )}

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading notifications...</div>
          ) : !Array.isArray(notifications) || notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(notifications as Notification[]).map((notification) => (
                <div key={notification.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-2xl mb-2">
                        {notification.type === 'info' && <Info className="w-6 h-6 text-blue-500" />}
                        {notification.type === 'warning' && <AlertCircle className="w-6 h-6 text-yellow-500" />}
                        {notification.type === 'success' && <CheckCircle className="w-6 h-6 text-green-500" />}
                        {notification.type === 'success' && <CheckCircle className="w-6 h-6 text-green-500" />}
                      </div>
                      <h4 className="font-medium">{notification.title}</h4>
                      <Badge className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <Badge variant={notification.isActive ? 'default' : 'secondary'}>
                        {notification.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(notification)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced NotificationBell component for the header
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/v1/notifications'],
    retry: false,
  });

  const unreadCount = Array.isArray(notifications) 
    ? notifications.filter((n: any) => n.isActive && n.read === false).length 
    : 0;

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: false }), // Assuming isActive is used to mark as read in this context
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/notifications'] });
      // Toast is handled by the hook
      toast({ title: 'Notification marked as read' });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      // Toast is handled by the hook
      toast({ title: 'Failed to mark notification as read', variant: 'destructive' });
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4">
          <h3 className="font-semibold mb-2">Notifications</h3>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : !Array.isArray(notifications) || notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.slice(0, 10).map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    notification.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    )}
                  </div>
                </div>
              ))}
              {notifications.length > 10 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/notifications">View All</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}