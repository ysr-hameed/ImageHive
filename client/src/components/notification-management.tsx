import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Check, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  XCircle,
  Settings,
  Plus,
  Eye,
  EyeOff,
  Edit,
  Bell,
  Trash2,
  Send
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isActive: boolean;
  createdAt: string;
  read: boolean;
  isGlobal?: boolean;
  emailSent?: boolean;
}

// Mock components - replace with actual UI library components
const Button = ({ children, variant = 'default', size = 'default', disabled = false, type = 'button', className = '', onClick, asChild = false, ...props }: any) => (
  <button 
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`px-4 py-2 rounded ${variant === 'outline' ? 'border border-gray-300' : variant === 'ghost' ? 'bg-transparent hover:bg-gray-100' : 'bg-blue-600 text-white'} ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Input = ({ className = '', ...props }: any) => (
  <input className={`w-full px-3 py-2 border border-gray-300 rounded ${className}`} {...props} />
);

const Label = ({ children, htmlFor, ...props }: any) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1" {...props}>
    {children}
  </label>
);

const Textarea = ({ className = '', ...props }: any) => (
  <textarea className={`w-full px-3 py-2 border border-gray-300 rounded ${className}`} {...props} />
);

const Select = ({ children, value, onValueChange, ...props }: any) => (
  <select 
    value={value} 
    onChange={(e) => onValueChange?.(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded"
    {...props}
  >
    {children}
  </select>
);

const SelectTrigger = ({ children }: any) => <>{children}</>;
const SelectContent = ({ children }: any) => <>{children}</>;
const SelectItem = ({ children, value }: any) => <option value={value}>{children}</option>;
const SelectValue = () => null;

const Switch = ({ checked, onCheckedChange, id, ...props }: any) => (
  <input 
    type="checkbox" 
    id={id}
    checked={checked} 
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    className="toggle"
    {...props}
  />
);

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }: any) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }: any) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }: any) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const Badge = ({ children, variant = 'default', className = '' }: any) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    destructive: 'bg-red-100 text-red-800',
    outline: 'border border-gray-300 text-gray-700',
    secondary: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
};

const DropdownMenu = ({ children, open, onOpenChange }: any) => (
  <div className="relative inline-block text-left">
    {children}
  </div>
);

const DropdownMenuTrigger = ({ children, asChild }: any) => (
  <div>{children}</div>
);

const DropdownMenuContent = ({ children, align = 'left', className = '' }: any) => (
  <div className={`absolute z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 ${align === 'end' ? 'right-0' : 'left-0'} ${className}`}>
    {children}
  </div>
);

// Mock hooks
const useToast = () => ({
  toast: ({ title, description, variant }: any) => {
    console.log(`Toast: ${title} - ${description} (${variant || 'default'})`);
  }
});

// Mock API function
const apiRequest = async (method: string, url: string, data?: any) => {
  // Mock implementation
  console.log(`API ${method} ${url}`, data);
  return { success: true, data: [] };
};

export function NotificationManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    sendEmail: false,
    isGlobal: true,
    userIds: ''
  });

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  // Create notification mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/v1/admin/notifications', data);
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

  // Update notification mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest('PUT', `/api/v1/admin/notifications/${id}`, data);
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

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('PATCH', `/api/v1/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/notifications"] });
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    },
  });

  const resetForm = () => {
    setNotificationForm({
      title: '',
      message: '',
      type: 'info',
      sendEmail: false,
      isGlobal: true,
      userIds: ''
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (notification: Notification) => {
    setNotificationForm({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      sendEmail: false,
      isGlobal: notification.isGlobal || true,
      userIds: ''
    });
    setEditingId(notification.id);
    setIsCreating(true);
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: notificationForm });
    } else {
      createMutation.mutate(notificationForm);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-100 text-amber-800';
      case 'success': return 'bg-emerald-100 text-emerald-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error': return <XCircle className="w-6 h-6 text-red-500" />;
      default: return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const deleteNotification = (id: string) => {
    deleteNotificationMutation.mutate(id);
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNotificationForm(prev => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Notification title"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={notificationForm.type}
                  onValueChange={(value: 'info' | 'warning' | 'success' | 'error') => 
                    setNotificationForm(prev => ({ ...prev, type: value }))
                  }
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
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  setNotificationForm(prev => ({ ...prev, message: e.target.value }))
                }
                placeholder="Notification message"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sendEmail"
                  checked={notificationForm.sendEmail}
                  onCheckedChange={(checked: boolean) => 
                    setNotificationForm(prev => ({ ...prev, sendEmail: checked }))
                  }
                />
                <Label htmlFor="sendEmail">Send Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isGlobal"
                  checked={notificationForm.isGlobal}
                  onCheckedChange={(checked: boolean) => 
                    setNotificationForm(prev => ({ ...prev, isGlobal: checked }))
                  }
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNotificationForm(prev => ({ ...prev, userIds: e.target.value }))
                  }
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
                  <Label htmlFor="create-title">Title</Label>
                  <Input
                    id="create-title"
                    value={notificationForm.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setNotificationForm(prev => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Notification title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-type">Type</Label>
                  <Select
                    value={notificationForm.type}
                    onValueChange={(value: 'info' | 'warning' | 'success' | 'error') => 
                      setNotificationForm(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="create-message">Message</Label>
                <Textarea
                  id="create-message"
                  value={notificationForm.message}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    setNotificationForm(prev => ({ ...prev, message: e.target.value }))
                  }
                  placeholder="Notification message"
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={notificationForm.isGlobal}
                  onCheckedChange={(checked: boolean) => 
                    setNotificationForm(prev => ({ ...prev, isGlobal: checked }))
                  }
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

      {/* Existing Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading notifications...</div>
            ) : !Array.isArray(notifications) || notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notifications sent yet.</p>
              </div>
            ) : (
              (notifications as Notification[]).map((notification) => (
                <div key={notification.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-2xl mb-2">
                        {getTypeIcon(notification.type)}
                      </div>
                      <h4 className="font-medium">{notification.title}</h4>
                      <Badge className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <Badge variant={notification.isActive ? 'default' : 'secondary'}>
                        {notification.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {notification.isGlobal && <Badge variant="outline">Global</Badge>}
                      {notification.emailSent && <Badge variant="secondary">Email Sent</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
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
                      disabled={deleteNotificationMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced NotificationBell component for the header
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/v1/notifications'],
    queryFn: () => apiRequest('GET', '/api/v1/notifications'),
    retry: false,
  });

  const unreadCount = Array.isArray(notifications) 
    ? notifications.filter((n: any) => n.isActive && n.read === false).length 
    : 0;

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('PATCH', `/api/v1/notifications/${id}`, { isActive: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/notifications'] });
      toast({ title: 'Notification marked as read' });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
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
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                    notification.read ? 'bg-gray-50' : 'bg-blue-50'
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
                      <p className="text-xs text-gray-600 mt-1">
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
                  <Button variant="ghost" size="sm">
                    <a href="/notifications">View All</a>
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