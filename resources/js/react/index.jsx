// Import process shim first
import './process-shim.js';
// Import DevTools fix 
import './devtools-fix.js';
// Use named imports for React
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import * as serviceWorker from './utils/serviceWorker';

// Initialize QueryClient with smart defaults
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 10,
            refetchOnWindowFocus: true,
            retry: 1,
        },
    },
});

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
                    <QueryClientProvider client={queryClient}>
                        <App />
                    </QueryClientProvider>
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

// Register service worker for enhanced caching (production only)
if (process.env.NODE_ENV === 'production') {
    serviceWorker.register({
        onSuccess: () => {
            console.log('SW: Content cached for offline use');
        },
        onUpdate: () => {
            console.log('SW: New content available, please refresh');
            // You could show a toast notification here
        }
    });
} else {
    // Unregister service workers in development
    serviceWorker.unregister();
}

// Enable hot module replacement
if (import.meta.hot) {
    import.meta.hot.accept('./App', () => {
        root.render(
            <StrictMode>
                <QueryClientProvider client={queryClient}>
                    <App />
                </QueryClientProvider>
            </StrictMode>
        );
    });
}
