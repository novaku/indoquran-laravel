// Authentication utilities for IndoQuran

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The auth token or null if not found
 */
export const getAuthToken = () => {
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.warn('Failed to get auth token:', error);
    return null;
  }
};

/**
 * Set the authentication token in localStorage
 * @param {string} token - The auth token to store
 */
export const setAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  } catch (error) {
    console.warn('Failed to set auth token:', error);
  }
};

/**
 * Remove the authentication token from localStorage
 */
export const removeAuthToken = () => {
  try {
    localStorage.removeItem('auth_token');
  } catch (error) {
    console.warn('Failed to remove auth token:', error);
  }
};

/**
 * Check if user is authenticated by verifying token existence
 * @returns {boolean} True if user has a token
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  return Boolean(token && token.trim().length > 0);
};

/**
 * Get authorization headers for API requests
 * @returns {Object} Headers object with Authorization if token exists
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

/**
 * Make authenticated API request with proper error handling
 * @param {string} url - The API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const authenticatedFetch = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // If unauthorized, clear token and redirect to login
    if (response.status === 401) {
      removeAuthToken();
      // Don't redirect here, let the component handle it
    }

    return response;
  } catch (error) {
    console.error('Authenticated fetch failed:', error);
    throw error;
  }
};

/**
 * Handle authentication errors consistently
 * @param {Error} error - The error to handle
 * @param {Function} redirectToLogin - Function to redirect to login
 */
export const handleAuthError = (error, redirectToLogin) => {
  if (error.status === 401 || error.message?.includes('401')) {
    removeAuthToken();
    if (typeof redirectToLogin === 'function') {
      redirectToLogin();
    }
  }
};

/**
 * Validate token format (basic validation)
 * @param {string} token - The token to validate
 * @returns {boolean} True if token format is valid
 */
export const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Basic JWT format check (three parts separated by dots)
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

/**
 * Get user info from token (basic JWT decode - client-side only for UI purposes)
 * @param {string} token - The JWT token
 * @returns {Object|null} Decoded payload or null if invalid
 */
export const getUserFromToken = (token) => {
  try {
    if (!isValidTokenFormat(token)) {
      return null;
    }

    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.warn('Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if token is expired (client-side check only)
 * @param {string} token - The JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  try {
    const user = getUserFromToken(token);
    if (!user || !user.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= user.exp;
  } catch (error) {
    console.warn('Failed to check token expiration:', error);
    return true;
  }
};

/**
 * Auto-refresh token if needed (placeholder for future implementation)
 * @returns {Promise<boolean>} True if token was refreshed successfully
 */
export const refreshTokenIfNeeded = async () => {
  const token = getAuthToken();
  
  if (!token || isTokenExpired(token)) {
    removeAuthToken();
    return false;
  }

  // TODO: Implement auto-refresh logic here
  // For now, just return true if token exists and isn't expired
  return true;
};

// Export default object for compatibility
export default {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  isAuthenticated,
  getAuthHeaders,
  authenticatedFetch,
  handleAuthError,
  isValidTokenFormat,
  getUserFromToken,
  isTokenExpired,
  refreshTokenIfNeeded
};
