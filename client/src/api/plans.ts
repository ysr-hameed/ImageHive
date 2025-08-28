
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
  return [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['2GB storage', '5K API calls', '100 images', 'Basic support'],
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
      features: ['25GB storage', '25K API calls', '1K images', 'Priority support'],
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
      features: ['100GB storage', '100K API calls', '10K images', 'Advanced features'],
      limits: {
        storage: 100 * 1024 * 1024 * 1024,
        apiRequests: 100000,
        images: 10000
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 0, // Custom pricing
      features: ['500GB+ storage', '1M+ API calls', '100K+ images', 'Dedicated support'],
      limits: {
        storage: 500 * 1024 * 1024 * 1024,
        apiRequests: 1000000,
        images: 100000
      }
    }
  ];
}
