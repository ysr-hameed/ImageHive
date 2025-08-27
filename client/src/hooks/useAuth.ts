import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const queryClient = useQueryClient();
  const hasToken = !!localStorage.getItem("token");

  // Fetch user only if token exists
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User>({
    queryKey: ["/api/v1/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: hasToken,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes("401") || error?.message?.includes("403")) {
        localStorage.removeItem("token");
        return false;
      }
      return failureCount < 1; // Reduced retry attempts
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Prevent immediate mount refetch
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Error handling is done in retry function above
  });

  const isAuthenticated = !!user && hasToken;

  // ---------------------------
  // Auth functions
  // ---------------------------

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    acceptTerms: boolean;
    subscribeNewsletter?: boolean;
  }) => {
    const response = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Registration failed");
    }

    return response.json();
  };

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Login failed");
    }

    const result = await response.json();
    if (result.token) {
      localStorage.setItem("token", result.token);
      queryClient.invalidateQueries({ queryKey: ["/api/v1/auth/user"] });
    }
    return result;
  };

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    window.location.href = "/";
  };

  const loginWithGoogle = () => {
    window.location.href = "/api/v1/auth/google";
  };

  const loginWithGitHub = () => {
    window.location.href = "/api/v1/auth/github";
  };

  // ---------------------------
  // Return state & methods
  // ---------------------------
  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    register,
    login,
    logout,
    loginWithGoogle,
    loginWithGitHub,
  };
}