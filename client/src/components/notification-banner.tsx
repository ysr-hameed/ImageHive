
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Bell, Info, AlertTriangle, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  isActive: boolean;
  createdAt: string;
}

export function NotificationBanner() {
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>(() => {
    const stored = localStorage.getItem('dismissedNotifications');
    return stored ? JSON.parse(stored) : [];
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/v1/notifications'],
    retry: false,
  });

  const activeNotifications = (notifications as Notification[]).filter(
    notification => 
      notification.isActive && 
      !dismissedNotifications.includes(notification.id)
  );

  const dismissNotification = (notificationId: string) => {
    const newDismissed = [...dismissedNotifications, notificationId];
    setDismissedNotifications(newDismissed);
    localStorage.setItem('dismissedNotifications', JSON.stringify(newDismissed));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/10 dark:border-amber-800 dark:text-amber-200';
      case 'success': return 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/10 dark:border-emerald-800 dark:text-emerald-200';
      default: return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/10 dark:border-blue-800 dark:text-blue-200';
    }
  };

  if (activeNotifications.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {activeNotifications.map((notification) => {
        const Icon = getIcon(notification.type);
        return (
          <Card key={notification.id} className={`p-4 ${getColors(notification.type)} border`}>
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">{notification.title}</h4>
                <p className="text-sm mt-1">{notification.message}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="flex-shrink-0 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
