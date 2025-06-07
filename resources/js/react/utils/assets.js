/**
 * Utility function to get the correct asset URL based on environment
 * In production, adds '/public' prefix to the URL
 * 
 * @param {string} path - The asset path, should start with a slash, e.g. '/favicon.ico'
 * @returns {string} The full asset URL with the correct prefix for the current environment
 */
export const getAssetUrl = (path) => {
    // Get the base URL from window.Laravel
    const baseUrl = window.Laravel?.baseUrl || '';
    
    // Make sure the path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${baseUrl}${normalizedPath}`;
};

/**
 * Examples:
 * getAssetUrl('/favicon.ico') => '/public/favicon.ico' in production, '/favicon.ico' otherwise
 * getAssetUrl('/images/logo.png') => '/public/images/logo.png' in production, '/images/logo.png' otherwise
 */
