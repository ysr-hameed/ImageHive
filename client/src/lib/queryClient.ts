import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Generic API request function
export async function apiRequest(
  method: string | { method?: string; [key: string]: any },
  url?: string,
  data?: any,
  options?: RequestInit
): Promise<any> {
  let requestMethod: string;
  let requestUrl: string;
  let requestData: any;
  let requestOptions: RequestInit = {};

  // Handle different function signatures
  if (typeof method === 'string' && url) {
    // apiRequest('GET', '/api/endpoint', data, options)
    requestMethod = method;
    requestUrl = url;
    requestData = data;
    requestOptions = options || {};
  } else if (typeof method === 'string' && !url) {
    // apiRequest('/api/endpoint')
    requestMethod = 'GET';
    requestUrl = method;
    requestData = undefined;
  } else if (typeof method === 'object') {
    // apiRequest({ method: 'POST', url: '/api/endpoint', data: {...} })
    const { method: httpMethod = 'GET', ...rest } = method;
    requestMethod = httpMethod;
    requestUrl = url || '';
    requestData = data;
    requestOptions = rest;
  } else {
    requestMethod = 'GET';
    requestUrl = method;
    requestData = data;
  }

  const config: RequestInit = {
    method: requestMethod.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
      ...requestOptions.headers,
    },
    credentials: 'include',
    ...requestOptions,
  };

  // Add body for non-GET requests
  if (requestMethod.toUpperCase() !== 'GET' && requestData) {
    if (requestData instanceof FormData) {
      // Don't set Content-Type for FormData, let browser set it
      delete config.headers;
      config.headers = {
        ...requestOptions.headers,
      };
      config.body = requestData;
    } else {
      config.body = JSON.stringify(requestData);
    }
  }

  try {
    const response = await fetch(requestUrl, config);
    
    // Handle different response types
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      // Handle 401 unauthorized
      if (response.status === 401) {
        window.location.href = '/auth/login';
        throw new Error('Unauthorized');
      }
      
      throw new Error(responseData?.message || responseData || `HTTP ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// Query function generator for React Query
export function getQueryFn(endpoint: string) {
  return async () => {
    return await apiRequest('GET', endpoint);
  };
}