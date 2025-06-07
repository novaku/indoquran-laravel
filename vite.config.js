import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
    // Load env file based on mode
    const env = loadEnv(mode, process.cwd(), '')
    
    // Force development mode to use local assets, only use ASSET_URL for production builds
    const isDev = command === 'serve' || mode === 'development'
    const assetUrl = !isDev && mode === 'production' 
        ? (env.ASSET_URL || env.VITE_ASSET_URL || env.APP_URL || '')
        : ''
    
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
        // Set base URL for asset loading - force local paths for development
        base: !isDev && mode === 'production' && assetUrl ? `${assetUrl}/` : '/',
        server: {
            hmr: {
                host: '127.0.0.1',
                protocol: 'ws',
            },
            host: '127.0.0.1',
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
        build: {
            rollupOptions: {
                output: {
                    assetFileNames: (assetInfo) => {
                        // Keep font files with a simple naming pattern
                        if (assetInfo.name && /\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name)) {
                            return 'assets/[name]-[hash][extname]';
                        }
                        return 'assets/[name]-[hash][extname]';
                    }
                }
            },
            assetsDir: 'assets',
        },
        assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2', '**/*.eot', '**/*.otf']
    };
});
