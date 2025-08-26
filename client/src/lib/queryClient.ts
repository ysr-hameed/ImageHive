import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Assuming API_BASE_URL is defined elsewhere, e.g., in an environment variable or config file
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api/v1';
// For the purpose of this example, let's define a placeholder:
const API_BASE_URL = '/api/v1';


async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use statusText
      const text = await res.text();
      errorMessage = text || errorMessage;
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const token = localStorage.getItem('token');

  // Ensure URL starts with API base URL if it's a relative path
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/api/v1') ? url.slice(7) : (url.startsWith('/') ? url : '/' + url)}`;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(fullUrl, config);

  await throwIfResNotOk(response);

  // Handle empty responses
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }

  return null;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Construct the URL using the queryKey, assuming it's an array of path segments.
    // The queryKey might look like ['users', '123', 'profile'] which should become '/api/v1/users/123/profile'
    // Or it could be ['api', 'v1', 'images'] which should become '/api/v1/images'
    // We need to ensure it's correctly joined with the API_BASE_URL.

    // Let's assume queryKey directly represents the path segments after the base URL.
    // If queryKey could be like ['users'], we need to ensure it becomes '/users' before joining with API_BASE_URL.
    // A safer approach might be to always join the base URL correctly.
    const path = queryKey.join("/");

    // Improved URL construction for queries
    let fullUrl: string;
    if (path.startsWith('http')) {
      fullUrl = path;
    } else if (path.startsWith('/api/v1')) {
      fullUrl = path; // Already has full API path
    } else if (path.startsWith('/api/')) {
      fullUrl = path; // Legacy API path, keep as is
    } else if (path.startsWith('/')) {
      fullUrl = `${API_BASE_URL}${path}`;
    } else {
      fullUrl = `${API_BASE_URL}/${path}`;
    }

    try {
      const res = await fetch(fullUrl, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);

      // Handle empty responses
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      }

      return null;
    } catch (error) {
      console.error('Query Error:', error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 401, 403, 404
        if (error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on client errors
        if (error.message.includes('4')) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});