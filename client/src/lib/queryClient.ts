import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE_URL = '/api/v1';

// Create a default query function
const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const url = `${API_BASE_URL}${queryKey[0]}`;
  const token = localStorage.getItem('token');

  const response = await fetch(url, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  return response.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Helper function for authenticated requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

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
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Helper to get query function with auth handling
export const getQueryFn = (options: { on401?: "returnNull" | "throw" } = {}) => {
  return async ({ queryKey }: { queryKey: readonly unknown[] }) => {
    try {
      return await apiRequest(queryKey[0] as string);
    } catch (error: any) {
      if (error.message.includes('401') && options.on401 === "returnNull") {
        return null;
      }
      throw error;
    }
  };
};