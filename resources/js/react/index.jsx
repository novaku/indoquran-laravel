// Import process shim first
import './process-shim.js';
// Import DevTools fix 
import './devtools-fix.js';
// Use named imports for React
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('app'));

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
        })
        .then((registration) => {
            console.log('SW registered: ', registration);
            
            // Check for updates periodically
            setInterval(() => {
                registration.update();
            }, 60000); // Check every minute
        })
        .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
        });
    });
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
