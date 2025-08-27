import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const queryClient = useQueryClient();
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

  // Auth functions
  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    acceptTerms: boolean;
    subscribeNewsletter?: boolean;
  }) => {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    return response.json();
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const result = await response.json();
    if (result.token) {
      localStorage.setItem('token', result.token);
      // Invalidate queries to refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/v1/auth/user"] });
    }
    return result;
  };

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.clear();
    window.location.href = '/';
  };

  const loginWithGoogle = async () => {
    // Redirect to Google OAuth endpoint
    window.location.href = '/api/v1/auth/google';
  };

  const loginWithGitHub = async () => {
    // Redirect to GitHub OAuth endpoint
    window.location.href = '/api/v1/auth/github';
  };

  return {
    user,
    isLoading: hasToken ? isLoading : false,
    isAuthenticated,
    error,
    register,
    login,
    logout,
    loginWithGoogle,
    loginWithGitHub,
  };
}