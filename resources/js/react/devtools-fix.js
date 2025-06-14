/**
 * React 19 DevTools compatibility fix
 * 
 * This script:
 * 1. Suppresses the DevTools version warning
 * 2. Provides missing DevTools functions expected by React 19
 * 3. Filters out console errors related to Vite plugin and DevTools
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
                    args[0].includes('@vitejs/plugin-react can\'t detect preamble')) {
                    return;
                }
            }
            return originalConsoleError.apply(console, args);
        };

        // Create or get React DevTools global hook
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
        
        // Set up supportsFiber flag
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__.supportsFiber = true;
        
        // Disable DCE check that triggers the warning
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE = function() {};
        
        // Create stub functions for React 19 DevTools integration
        const noop = () => {};
        
        // Provide the necessary hooks for React DevTools
        const hooks = ['inject', 'onCommitFiberRoot', 'onCommitFiberUnmount'];
        hooks.forEach(hook => {
            if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__[hook]) {
                window.__REACT_DEVTOOLS_GLOBAL_HOOK__[hook] = noop;
            }
        });
    }
})();
