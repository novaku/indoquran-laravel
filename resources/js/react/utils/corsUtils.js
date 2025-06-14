/**
 * CORS utility functions
 * Helper functions for handling cross-origin resources in development
 */

/**
 * Get the proper URL for assets, considering CORS in development
 * @param {string} url - The original URL (can be relative or absolute)
 * @param {Object} options - Options for the proxy
 * @param {boolean} options.useProxy - Whether to use the proxy in development (default: true)
 * @param {string} options.prodDomain - Production domain (default: 'https://my.indoquran.web.id')
 * @returns {string} The appropriate URL to use
 */
export const getCorsSafeUrl = (url, options = {}) => {
  const {
    useProxy = true,
    prodDomain = 'https://my.indoquran.web.id'
  } = options;
  
  // If it's already a relative URL, just return it
  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }
  
  // If we're in development and should use the proxy
  if ((process.env.NODE_ENV === 'development' || window.location.hostname === '127.0.0.1' || 
       window.location.hostname === 'localhost') && useProxy) {
    // For absolute URLs to our own production domain
    if (url.startsWith(prodDomain)) {
      // Convert to proxy URL
      const path = url.replace(prodDomain, '');
      return `/proxy-assets${path}`;
    }
    
    // For URLs that might be to our production domain but without the protocol/domain part
    if (url.startsWith('//my.indoquran.web.id')) {
      const path = url.replace('//my.indoquran.web.id', '');
      return `/proxy-assets${path}`;
    }
  }
  
  // For all other cases, return the URL as is
  return url;
};

/**
 * Create a fetch function that handles CORS in development
 * @param {Function} originalFetch - The original fetch function to wrap
 * @returns {Function} A wrapped fetch function
 */
export const createCorsSafeFetch = (originalFetch = fetch) => {
  return (url, options = {}) => {
    const corsUrl = getCorsSafeUrl(url);
    return originalFetch(corsUrl, options);
  };
};

/**
 * A fetch function that handles CORS in development
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} - The fetch promise
 */
export const corsSafeFetch = (url, options = {}) => {
  const corsUrl = getCorsSafeUrl(url);
  return fetch(corsUrl, options);
};

/**
 * For scripts and stylesheets, creates a URL that can be used in development
 * @param {string} assetPath - Path to the asset
 * @param {string} assetType - Type of asset ('js', 'css', etc.)
 * @returns {string} - A proxy URL for development or the original URL for production
 */
export const getAssetUrl = (assetPath, assetType = 'js') => {
  // If it's already an absolute URL
  if (assetPath.startsWith('http')) {
    return getCorsSafeUrl(assetPath);
  }
  
  // For relative paths
  const prodDomain = 'https://my.indoquran.web.id';
  
  if (process.env.NODE_ENV === 'development') {
    // In development, try the local asset first
    // If it fails, the service worker will handle falling back to the proxy
    return assetPath;
  } else {
    // In production, use the asset directly
    return assetPath;
  }
};
