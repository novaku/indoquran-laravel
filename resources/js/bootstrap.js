import axios from 'axios';
window.axios = axios;

// Conditionally set base URL based on environment
// In production, add '/public' to the base URL
if (import.meta.env.PROD) {
    window.axios.defaults.baseURL = '/public';
}

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
