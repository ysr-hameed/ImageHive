
import { apiRequest } from '@/lib/queryClient';

export interface UserUsage {
  requests: number;
  storage: number;
  bandwidth: number;
  images: number;
}

export async function getCurrentUserUsage(): Promise<UserUsage> {
  const response = await apiRequest('/api/v1/usage');
  return response.data?.current || {
    requests: 0,
    storage: 0,
    bandwidth: 0,
    images: 0
  };
}
