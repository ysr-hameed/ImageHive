export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }
  return response.json();
};

export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }
  return response.json();
};

export const logoutUser = async (): Promise<void> => {
  const token = getAuthToken();
  if (!token) return;

  const response = await fetch('/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    console.error('Logout failed');
  }
  clearAuthToken();
};

export const getCurrentUser = async (): Promise<User | null> => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch('/api/v1/auth/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearAuthToken();
        return null;
      }
      throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }

    const user: User = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

// Placeholder for getAuthToken and clearAuthToken functions
// In a real application, these would handle token storage (e.g., localStorage, cookies)
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

function clearAuthToken(): void {
  localStorage.removeItem('authToken');
}

// Define types for clarity (assuming these are defined elsewhere in a real project)
interface AuthResponse {
  token: string;
  user: User;
}

interface User {
  id: string;
  email: string;
  name: string;
  // other user properties
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}