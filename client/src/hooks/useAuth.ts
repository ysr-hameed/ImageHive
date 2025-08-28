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
  } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return null;
        }

        const response = await fetch("/api/v1/auth/me", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            return null;
          }
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Auth failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Auth error:", error);
        if (error instanceof Error && error.message.includes('401')) {
          localStorage.removeItem("token");
        }
        return null;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('401') || error?.message?.includes('Auth failed')) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
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