
/**
 * Utility function to get the correct API URL based on environment
 * In production, adds '/public' prefix to the URL
 * 
 * @param {string} endpoint - The API endpoint, should start with a slash, e.g. '/api/user'
 * @returns {string} The full API URL with the correct prefix for the current environment
 */
export const getApiUrl = (endpoint) => {
    // Get the base URL from window.Laravel
    const baseUrl = window.Laravel?.baseUrl || '';
    
    return `${baseUrl}${endpoint}`;
};

/**
 * Examples:
 * getApiUrl('/api/user') => '/public/api/user' in production, '/api/user' otherwise
 * getApiUrl('/api/search?q=something') => '/public/api/search?q=something' in production, '/api/search?q=something' otherwise
 */
