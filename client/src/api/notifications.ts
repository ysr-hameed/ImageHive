
import { apiRequest } from '@/lib/queryClient';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getAllNotifications(): Promise<Notification[]> {
  const response = await apiRequest('/api/v1/notifications');
  return response.data || [];
}

export async function deleteNotification(id: string): Promise<void> {
  await apiRequest(`/api/v1/notifications/${id}`, {
    method: 'DELETE',
  });
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await apiRequest(`/api/v1/notifications/${id}`, {
    method: 'PATCH',
    data: { isActive: false },
  });
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiRequest('/api/v1/notifications/mark-all-read', {
    method: 'PATCH',
  });
}
