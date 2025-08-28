import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  plan?: string;
  isEmailVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export function useAuth(): AuthState & {
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<any>;
} {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Mock helper functions that would be defined elsewhere
  const getToken = () => localStorage.getItem('authToken');
  const clearAuth = () => {
    localStorage.removeItem('authToken');
    queryClient.invalidateQueries({ queryKey: ["auth"] });
  };

  // Get current user
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<User | null>({
    queryKey: ["auth"],
    queryFn: async () => {
      try {
        console.log('🔍 Fetching user data...');
        const token = getToken();
        if (!token) {
          console.log('❌ No token found');
          return null;
        }

        const response = await fetch("/api/v1/auth/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.log('🔒 Token expired, clearing auth');
            clearAuth();
            return null; // Not logged in
          }
          throw new Error("Failed to fetch user");
        }

        const userData = await response.json();
        console.log('✅ User data received:', userData);
        return userData;
      } catch (error) {
        console.error('Auth query failed:', error);

        // Log all auth errors for debugging
        if (error instanceof Error) {
          console.log('Auth error details:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          });

          if (error.message.includes('401') || error.message.includes('403')) {
            clearAuth();
          }
        }
        return null;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
          const response = await fetch("/api/v1/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              email: credentials.email?.trim() || "",
              password: credentials.password?.trim() || ""
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Login failed" }));
            throw new Error(errorData.error || "Login failed");
          }

          const data = await response.json();
          if (data.token) {
            localStorage.setItem('authToken', data.token);
          }
          return data;
        } catch (error) {
          console.error('Login request failed:', error);
          throw error;
        }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      navigate("/dashboard");
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Registration failed");
      }

      // Assuming the response contains the token
      const responseData = await response.json();
      if (responseData.token) {
        localStorage.setItem('authToken', responseData.token);
      }

      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      navigate("/dashboard");
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }
      clearAuth(); // Ensure token is cleared on logout
    },
    onSuccess: () => {
      // queryClient.setQueryData(["auth"], null); // Already handled by clearAuth
      navigate("/");
    },
  });

  return {
    user: user || null,
    isAuthenticated: !!user,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    isError: isError,
    error: error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refetch,
  };
}