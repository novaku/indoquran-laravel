/**
 * API utility functions with Bearer token authentication
 */

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

let isFetchingGuestToken = false;
let guestTokenPromise = null;

/**
 * Ensure a token exists, fetching a guest token if necessary
 * @returns {Promise<string|null>} The token
 */
export const ensureToken = async () => {
    let token = getAuthToken();
    if (token) return token;

    if (isFetchingGuestToken) {
        return guestTokenPromise;
    }

    isFetchingGuestToken = true;
    guestTokenPromise = fetch('/api/guest-token', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('is_guest', 'true');
            return data.token;
        }
        return null;
    })
    .catch(err => {
        console.error('Failed to fetch guest token', err);
        return null;
    })
    .finally(() => {
        isFetchingGuestToken = false;
    });

    return guestTokenPromise;
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
export const getWithAuth = async (url, options = {}, isRetry = false) => {
    await ensureToken();
    const response = await fetch(url, {
        method: 'GET',
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
        }
    });

    if (response.status === 401 && !isRetry) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('is_guest');
        return getWithAuth(url, options, true);
    }

    return response;
};

/**
 * Make a POST request with authentication
 * @param {string} url - The URL to fetch
 * @param {Object|FormData} data - The data to send in the request body
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const postWithAuth = async (url, data = {}, options = {}, isRetry = false) => {
    await ensureToken();
    const isFormData = data instanceof FormData;
    const headers = { ...getAuthHeaders(), ...(options.headers || {}) };
    
    // Remove Content-Type for FormData to let browser set it with boundary
    if (isFormData) {
        delete headers['Content-Type'];
    }
    
    const response = await fetch(url, {
        method: 'POST',
        ...options,
        headers,
        body: isFormData ? data : JSON.stringify(data)
    });

    if (response.status === 401 && !isRetry) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('is_guest');
        return postWithAuth(url, data, options, true);
    }

    return response;
};

/**
 * Make a PUT request with authentication
 * @param {string} url - The URL to fetch
 * @param {Object} data - The data to send in the request body
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const putWithAuth = async (url, data = {}, options = {}, isRetry = false) => {
    await ensureToken();
    const response = await fetch(url, {
        method: 'PUT',
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
        },
        body: JSON.stringify(data)
    });

    if (response.status === 401 && !isRetry) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('is_guest');
        return putWithAuth(url, data, options, true);
    }

    return response;
};

/**
 * Make a DELETE request with authentication
 * @param {string} url - The URL to fetch
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const deleteWithAuth = async (url, options = {}, isRetry = false) => {
    await ensureToken();
    const response = await fetch(url, {
        method: 'DELETE',
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
        }
    });

    if (response.status === 401 && !isRetry) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('is_guest');
        return deleteWithAuth(url, options, true);
    }

    return response;
};

/**
 * Make a fetch request with authentication (generic method)
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const fetchWithAuth = async (url, options = {}, isRetry = false) => {
    await ensureToken();
    const response = await fetch(url, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
        }
    });

    if (response.status === 401 && !isRetry) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('is_guest');
        return fetchWithAuth(url, options, true);
    }

    return response;
};