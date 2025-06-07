import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
    // Load env file based on mode
    const env = loadEnv(mode, process.cwd(), '')
    
    // Check if ASSET_URL is defined in the environment
    const assetUrl = env.ASSET_URL || env.VITE_ASSET_URL || env.APP_URL || ''
    
    return {
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
        // Set base URL for asset loading
        base: command === 'build' && assetUrl ? `${assetUrl}/` : '',
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
    };
});
