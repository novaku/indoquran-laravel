import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('app'));

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Enable hot module replacement
if (import.meta.hot) {
    import.meta.hot.accept('./App', () => {
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    });
}
