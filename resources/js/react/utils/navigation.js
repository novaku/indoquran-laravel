/**
 * Utility function to handle navigation in React Router with support for the production URL structure
 * This function will ensure the correct URL format is used, including any base path prefix needed in production
 * 
 * @param {function} navigate - The navigate function from useNavigate hook
 * @param {string} path - The path to navigate to
 * @param {object} options - Additional options for the navigate function
 */
export const navigateTo = (navigate, path, options = {}) => {
    // Use getRoutePath to ensure the path includes any production prefix
    const { getRoutePath } = require('./routes');
    const routePath = getRoutePath(path);
    
    // Navigate to the formatted path
    navigate(routePath, options);
};