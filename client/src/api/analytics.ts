
import { apiRequest } from '@/lib/queryClient';

export interface AnalyticsData {
  apiCalls: number;
  images: number;
  storage: number;
  bandwidth: number;
}

export async function getUserAnalytics(): Promise<AnalyticsData> {
  const response = await apiRequest('/api/v1/usage');
  return response.data?.current || {
    apiCalls: 0,
    images: 0,
    storage: 0,
    bandwidth: 0
  };
}
