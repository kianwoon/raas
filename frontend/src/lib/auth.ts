/**
 * Authentication utility functions for consistent auth state management
 */

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token?: string; // For backward compatibility
}

export interface UserData {
  id?: string;
  email: string;
  name?: string;
  full_name?: string;
  [key: string]: any;
}

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  
  const keysToRemove = [
    'isAuthenticated',
    'access_token',
    'refresh_token',
    'token',
    'refreshToken',
    'user'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
};

/**
 * Store authentication tokens with backward compatibility
 */
export const storeAuthTokens = (tokens: AuthTokens): void => {
  if (typeof window === 'undefined') return;
  
  // Store with both naming conventions for backward compatibility
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
  
  if (tokens.token) {
    localStorage.setItem('token', tokens.token);
  } else {
    localStorage.setItem('token', tokens.access_token);
  }
  
  localStorage.setItem('isAuthenticated', 'true');
};

/**
 * Store user data
 */
export const storeUserData = (userData: UserData): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('user', JSON.stringify(userData));
};

/**
 * Get current authentication tokens
 */
export const getAuthTokens = (): { accessToken: string | null; refreshToken: string | null } => {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }
  
  return {
    accessToken: localStorage.getItem('access_token') || localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken')
  };
};

/**
 * Get current user data
 */
export const getUserData = (): UserData | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return localStorage.getItem('isAuthenticated') === 'true';
};

/**
 * Perform complete sign out
 */
export const signOut = async (): Promise<void> => {
  try {
    const { accessToken } = getAuthTokens();
    
    // Call backend logout endpoint if token exists
    if (accessToken) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ token: accessToken })
        });
      } catch (error) {
        console.warn('Backend logout failed, proceeding with local cleanup:', error);
      }
    }
    
    // Clear all authentication data
    clearAuthData();
    
    // Dispatch auth state change event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('authStateChange'));
    }
    
  } catch (error) {
    console.error('Sign out failed:', error);
    // Even if backend fails, clear local data
    clearAuthData();
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('authStateChange'));
    }
  }
};