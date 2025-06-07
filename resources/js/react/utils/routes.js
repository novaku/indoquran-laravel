import { getApiUrl } from './api';

/**
 * Utility function to handle routes correctly in production/development environments
 * In production, all routes should be prefixed with '/public'
 * 
 * @param {string} path - The route path, e.g., '/surah/1'
 * @returns {string} The correct path for the current environment
 */
export const getRoutePath = (path) => {
    // Get the base URL from window.Laravel
    const baseUrl = window.Laravel?.baseUrl || '';
    
    // Make sure the path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${baseUrl}${normalizedPath}`;
};

/**
 * Utility function to get a clean route path for React Router
 * Removes the '/public' prefix when in production
 * 
 * @param {string} pathname - The current window.location.pathname
 * @returns {string} The cleaned path for React Router
 */
export const getCleanRoutePath = (pathname) => {
    // Check if APP_ENV is exposed through window.Laravel object
    const appEnv = window.Laravel?.appEnv || import.meta.env.VITE_APP_ENV || 'local';
    
    if (appEnv === 'production' && pathname.startsWith('/public')) {
        return pathname.replace('/public', '');
    }
    return pathname;
};

/**
 * Create the base URL for the React Router
 * In production, this should be '/public'
 * 
 * @returns {string} The base URL for React Router
 */
export const getRouterBasename = () => {
    // Check if baseUrl is exposed through window.Laravel object
    return window.Laravel?.baseUrl || '';
};

export default {
    getRoutePath,
    getCleanRoutePath,
    getRouterBasename
};
