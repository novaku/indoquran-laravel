/**
 * React DevTools compatibility fix
 * 
 * This script:
 * 1. Suppresses the DevTools version warning
 * 2. Provides missing DevTools functions expected by React
 * 3. Filters out console errors related to Vite plugin and DevTools
 * 4. Fixes the "Cannot set property __REACT_DEVTOOLS_GLOBAL_HOOK__" error
 */

// Using an IIFE to avoid global scope pollution
(function() {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
        // Filter console errors related to React DevTools and Vite plugin
        const originalConsoleError = console.error;
        console.error = function(...args) {
            // Skip DevTools warnings and Vite plugin errors
            if (args[0] && typeof args[0] === 'string') {
                if (args[0].includes('React DevTools') || 
                    args[0].includes('@vitejs/plugin-react can\'t detect preamble') ||
                    args[0].includes('__REACT_DEVTOOLS_GLOBAL_HOOK__') ||
                    args[0].includes('which has only a getter')) {
                    return;
                }
            }
            return originalConsoleError.apply(console, args);
        };

        // Fix for "Cannot set property __REACT_DEVTOOLS_GLOBAL_HOOK__" error
        try {
            // Check if __REACT_DEVTOOLS_GLOBAL_HOOK__ already exists
            if (!window.hasOwnProperty('__REACT_DEVTOOLS_GLOBAL_HOOK__')) {
                // Define the property with a configurable descriptor
                Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
                    value: {},
                    writable: true,
                    configurable: true,
                    enumerable: false
                });
            }
        } catch (e) {
            // If we can't define the property, try to access existing one
            try {
                const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
                if (typeof hook === 'object') {
                    // Hook exists but might be read-only, so we'll work with what we have
                    console.log('React DevTools hook exists but is read-only');
                }
            } catch (hookError) {
                // Silently ignore if we can't access the hook
            }
        }

        // Ensure the hook object has the necessary properties
        try {
            const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
            if (hook && typeof hook === 'object') {
                // Set up supportsFiber flag
                if (!hook.hasOwnProperty('supportsFiber')) {
                    try {
                        hook.supportsFiber = true;
                    } catch (e) {
                        // Ignore if we can't set this property
                    }
                }
                
                // Disable DCE check that triggers the warning
                if (!hook.hasOwnProperty('checkDCE')) {
                    try {
                        hook.checkDCE = function() {};
                    } catch (e) {
                        // Ignore if we can't set this property
                    }
                }
                
                // Create stub functions for React DevTools integration
                const noop = () => {};
                
                // Provide the necessary hooks for React DevTools
                const hooks = ['inject', 'onCommitFiberRoot', 'onCommitFiberUnmount'];
                hooks.forEach(hookName => {
                    if (!hook.hasOwnProperty(hookName)) {
                        try {
                            hook[hookName] = noop;
                        } catch (e) {
                            // Ignore if we can't set this property
                        }
                    }
                });
            }
        } catch (e) {
            // If all else fails, silently continue without DevTools support
            if (process.env.NODE_ENV === 'development') {
                console.log('React DevTools setup failed, continuing without DevTools support');
            }
        }
    }
})();
