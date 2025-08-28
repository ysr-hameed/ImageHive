
import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE_URL = '/api/v1';

// Create a default query function with better error handling
const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  try {
    const endpoint = Array.isArray(queryKey) ? queryKey.join('/') : String(queryKey);
    const url = endpoint.startsWith('/') ? `${API_BASE_URL}${endpoint}` : `${API_BASE_URL}/${endpoint}`;
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.message?.includes('HTTP 4')) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

// Helper function for authenticated requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = localStorage.getItem('token');
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use the default message
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Helper to get query function with auth handling
export const getQueryFn = (options: { on401?: "returnNull" | "throw" } = {}) => {
  return async ({ queryKey }: { queryKey: readonly unknown[] }) => {
    try {
      const endpoint = Array.isArray(queryKey) ? queryKey.join('/') : String(queryKey[0]);
      return await apiRequest(endpoint);
    } catch (error: any) {
      if (error.message.includes('HTTP 401') && options.on401 === "returnNull") {
        return null;
      }
      throw error;
    }
  };
};
