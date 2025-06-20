// Import process shim first
import './process-shim.js';
// Import DevTools fix 
import './devtools-fix.js';
// Use named imports for React
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// Handle React DevTools in production
if (typeof window !== 'undefined' && !window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {};
}

// Get the app container
const container = document.getElementById('app');

if (!container) {
    console.error('React app container #app not found');
} else {
    try {
        const root = createRoot(container);
        
        root.render(
            <StrictMode>
                <ErrorBoundary>
                    <App />
                </ErrorBoundary>
            </StrictMode>
        );
        
        if (process.env.NODE_ENV === 'development') {
            console.log('React app initialized successfully');
        }
    } catch (error) {
        console.error('Failed to initialize React app:', error);
        
        // Fallback error UI if React fails to initialize
        container.innerHTML = `
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f9fafb; padding: 1rem;">
                <div style="max-width: 400px; width: 100%; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); padding: 2rem; text-align: center;">
                    <h1 style="color: #1f2937; margin-bottom: 1rem;">Loading Error</h1>
                    <p style="color: #6b7280; margin-bottom: 1.5rem;">Unable to load the application. Please refresh the page.</p>
                    <button onclick="window.location.reload()" style="background-color: #059669; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer;">
                        Refresh Page
                    </button>
                </div>
            </div>
        `;
    }
}

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator && import.meta.env.PROD && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
        })
        .then((registration) => {
            console.log('SW registered: ', registration);
            
            // Periodic update check disabled to prevent unwanted refreshes
            // setInterval(() => {
            //     registration.update();
            // }, 60000); // Check every minute - DISABLED
        })
        .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
        });
    });
} else {
    // Unregister any service workers in development
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for (let registration of registrations) {
                registration.unregister();
                console.log('SW unregistered in development');
            }
        });
    }
}

// Enable hot module replacement
if (import.meta.hot) {
    import.meta.hot.accept('./App', () => {
        root.render(
            <StrictMode>
                <App />
            </StrictMode>
        );
    });
}
