
/**
 * Utility function to get the correct API URL based on environment
 * In production, adds '/public' prefix to the URL
 * 
 * @param {string} endpoint - The API endpoint, should start with a slash, e.g. '/api/user'
 * @returns {string} The full API URL with the correct prefix for the current environment
 */
export const getApiUrl = (endpoint) => {
    // Check if APP_ENV is exposed through window.Laravel object
    const appEnv = window.Laravel?.appEnv || import.meta.env.VITE_APP_ENV || 'local';
    
    if (appEnv === 'production') {
        return `/public${endpoint}`;
    }
    return endpoint;
};

/**
 * Examples:
 * getApiUrl('/api/user') => '/public/api/user' in production, '/api/user' otherwise
 * getApiUrl('/api/search?q=something') => '/public/api/search?q=something' in production, '/api/search?q=something' otherwise
 */
