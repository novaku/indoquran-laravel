import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js', 'resources/js/react/index.jsx'],
            refresh: [
                'resources/views/**',
                'resources/js/react/**',
                'app/**/*.php',
                'routes/**/*.php',
            ],
        }),
        react({
            // Enable Fast Refresh
            fastRefresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        hmr: {
            host: 'localhost',
            protocol: 'ws',
        },
        cors: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    },
    define: {
        // Fix for development build
        global: 'globalThis',
    },
});
