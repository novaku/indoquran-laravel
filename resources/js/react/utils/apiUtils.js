/**
 * API utility functions with Bearer token authentication
 */
import { corsSafeFetch, getCorsSafeUrl } from './corsUtils';

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export const getAuthToken = () => {
    return localStorage.getItem('auth_token');
};

/**
 * Get default headers for API requests with Bearer token
 * @returns {Object} Headers object with authentication and content type
 */
export const getAuthHeaders = () => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

/**
 * Get CSRF token from meta tag
 * @returns {string} CSRF token or empty string if not found
 */
export const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
};

/**
 * Make a GET request with authentication
 * @param {string} url - The URL to fetch
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const getWithAuth = async (url, options = {}) => {
    const corsUrl = getCorsSafeUrl(url);
    return fetch(corsUrl, {
        method: 'GET',
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        },
        ...options
    });
};

/**
 * Make a POST request with authentication
 * @param {string} url - The URL to fetch
 * @param {Object} data - The data to send in the request body
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const postWithAuth = async (url, data = {}, options = {}) => {
    const corsUrl = getCorsSafeUrl(url);
    return fetch(corsUrl, {
        method: 'POST',
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        },
        body: JSON.stringify(data),
        ...options
    });
};

/**
 * Make a PUT request with authentication
 * @param {string} url - The URL to fetch
 * @param {Object} data - The data to send in the request body
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const putWithAuth = async (url, data = {}, options = {}) => {
    const corsUrl = getCorsSafeUrl(url);
    return fetch(corsUrl, {
        method: 'PUT',
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        },
        body: JSON.stringify(data),
        ...options
    });
};

/**
 * Make a DELETE request with authentication
 * @param {string} url - The URL to fetch
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const deleteWithAuth = async (url, options = {}) => {
    const corsUrl = getCorsSafeUrl(url);
    return fetch(corsUrl, {
        method: 'DELETE',
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        },
        ...options
    });
};

/**
 * Make a fetch request with authentication (generic method)
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const fetchWithAuth = async (url, options = {}) => {
    const corsUrl = getCorsSafeUrl(url);
    return fetch(corsUrl, {
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        },
        ...options
    });
};