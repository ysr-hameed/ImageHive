import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  // Check if token exists in localStorage
  const hasToken = !!localStorage.getItem('token');
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/v1/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error?.message?.includes('401')) {
        // Clear invalid token
        localStorage.removeItem('token');
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: hasToken, // Only fetch user data if token exists
  });

  // Consider user authenticated if user data exists and token is present
  const isAuthenticated = !!user && hasToken;

  // If we have a token but no user data and not loading, there might be an auth issue
  const authError = hasToken && !user && !isLoading;

  if (authError && error) {
    console.warn('Authentication error:', error);
    localStorage.removeItem('token');
  }

  return {
    user,
    isLoading: hasToken ? isLoading : false,
    isAuthenticated,
    error,
  };
}