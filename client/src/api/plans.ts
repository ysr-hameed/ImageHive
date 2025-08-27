
import { apiRequest } from '@/lib/queryClient';

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    storage: number;
    apiRequests: number;
    images: number;
  };
}

export async function fetchPlans(): Promise<Plan[]> {
  // Mock data since we don't have a real plans endpoint yet
  return [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['Basic upload', '2GB storage', '5K API calls'],
      limits: {
        storage: 2 * 1024 * 1024 * 1024,
        apiRequests: 5000,
        images: 100
      }
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 9,
      features: ['25GB storage', '25K API calls', 'Advanced features'],
      limits: {
        storage: 25 * 1024 * 1024 * 1024,
        apiRequests: 25000,
        images: 1000
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      features: ['100GB storage', '100K API calls', 'Premium support'],
      limits: {
        storage: 100 * 1024 * 1024 * 1024,
        apiRequests: 100000,
        images: 10000
      }
    }
  ];
}
