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
