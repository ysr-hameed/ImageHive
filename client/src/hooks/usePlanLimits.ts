import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { deleteNotification, getAllNotifications } from '@/api/notifications';
import { getUserAnalytics } from '@/api/analytics';
import { fetchPlans } from '@/api/plans';
import { getCurrentUserUsage } from '@/api/usage';

interface PlanLimits {
  storageLimit: number;
  apiRequestsLimit: number;
  imagesLimit: number;
  foldersLimit: number;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    storageLimit: 2 * 1024 * 1024 * 1024, // 2GB
    apiRequestsLimit: 5000,
    imagesLimit: 100,
    foldersLimit: 5
  },
  starter: {
    storageLimit: 25 * 1024 * 1024 * 1024, // 25GB
    apiRequestsLimit: 25000,
    imagesLimit: 1000,
    foldersLimit: 20
  },
  pro: {
    storageLimit: 100 * 1024 * 1024 * 1024, // 100GB
    apiRequestsLimit: 100000,
    imagesLimit: 10000,
    foldersLimit: 100
  },
  enterprise: {
    storageLimit: 500 * 1024 * 1024 * 1024, // 500GB
    apiRequestsLimit: 1000000,
    imagesLimit: 100000,
    foldersLimit: 1000
  }
};

export function usePlanLimits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getUserLimits = (): PlanLimits => {
    const plan = user?.plan || 'free';
    return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  };

  const checkStorageLimit = (newFileSize: number, currentUsage: number = 0): boolean => {
    const limits = getUserLimits();
    const totalUsage = currentUsage + newFileSize;

    if (totalUsage > limits.storageLimit) {
      toast({
        title: 'Storage Limit Exceeded',
        description: `Your ${user?.plan || 'free'} plan allows ${formatBytes(limits.storageLimit)} storage. Please upgrade your plan or delete some files.`,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const checkImagesLimit = (currentCount: number): boolean => {
    const limits = getUserLimits();

    if (currentCount >= limits.imagesLimit) {
      toast({
        title: 'Images Limit Reached',
        description: `Your ${user?.plan || 'free'} plan allows ${limits.imagesLimit} images. Please upgrade your plan or delete some images.`,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const checkApiRequestsLimit = (currentUsage: number): boolean => {
    const limits = getUserLimits();

    if (currentUsage >= limits.apiRequestsLimit) {
      toast({
        title: 'API Requests Limit Reached',
        description: `Your ${user?.plan || 'free'} plan allows ${limits.apiRequestsLimit} API requests per month. Please upgrade your plan.`,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const checkFoldersLimit = (currentCount: number): boolean => {
    const limits = getUserLimits();

    if (currentCount >= limits.foldersLimit) {
      toast({
        title: 'Folders Limit Reached',
        description: `Your ${user?.plan || 'free'} plan allows ${limits.foldersLimit} folders. Please upgrade your plan or delete some folders.`,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const getUsagePercentage = (used: number, type: 'storage' | 'api' | 'images' | 'folders'): number => {
    const limits = getUserLimits();
    switch (type) {
      case 'storage':
        return Math.min(100, (used / limits.storageLimit) * 100);
      case 'api':
        return Math.min(100, (used / limits.apiRequestsLimit) * 100);
      case 'images':
        return Math.min(100, (used / limits.imagesLimit) * 100);
      case 'folders':
        return Math.min(100, (used / limits.foldersLimit) * 100);
      default:
        return 0;
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Notification Deleted',
        description: 'The notification has been successfully deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error Deleting Notification',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    },
  });

  const invalidateNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const fetchNotifications = () => {
    return getAllNotifications();
  };

  const fetchAnalytics = () => {
    return getUserAnalytics();
  };

  const fetchPlans = () => {
    return fetchPlans();
  };

  const fetchUserUsage = () => {
    return getCurrentUserUsage();
  };

  return {
    getUserLimits,
    checkStorageLimit,
    checkImagesLimit,
    checkApiRequestsLimit,
    checkFoldersLimit,
    getUsagePercentage,
    formatBytes,
    currentPlan: user?.plan || 'free',
    deleteNotificationMutation,
    invalidateNotifications,
    fetchNotifications,
    fetchAnalytics,
    fetchPlans,
    fetchUserUsage,
  };
}