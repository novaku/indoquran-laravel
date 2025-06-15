// Import process shim first
import './process-shim.js';
// Import DevTools fix 
import './devtools-fix.js';
// Use named imports for React
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Get the app container
const container = document.getElementById('app');

if (!container) {
    console.error('React app container #app not found');
} else {
    try {
        const root = createRoot(container);
        
        root.render(
            <StrictMode>
                <App />
            </StrictMode>
        );
        
        console.log('React app initialized successfully');
    } catch (error) {
        console.error('Failed to initialize React app:', error);
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
