import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Enable refetch on mount
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // If there's an error and it's not a 401, consider user as not authenticated
  const isAuthenticated = !!user && !error;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
  };
}
