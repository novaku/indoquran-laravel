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
    
    // Setup environment for React
    process.env.NODE_ENV = isDev ? 'development' : 'production';
    
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
                // Ensure font files are properly handled
                publicDirectory: 'public',
            }),
            react({
                // Simplified React configuration
                include: '**/*.{js,jsx,tsx}', // Add .js to support JSX in js files
                jsxRuntime: 'automatic',
                fastRefresh: true
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
            // Proxy API calls to Laravel backend
            proxy: {
                '/api': {
                    target: 'http://127.0.0.1:8000',
                    changeOrigin: true,
                    secure: false,
                    ws: true,
                },
                '/sanctum': {
                    target: 'http://127.0.0.1:8000',
                    changeOrigin: true,
                    secure: false,
                },
                '/login': {
                    target: 'http://127.0.0.1:8000',
                    changeOrigin: true,
                    secure: false,
                },
                '/logout': {
                    target: 'http://127.0.0.1:8000',
                    changeOrigin: true,
                    secure: false,
                },
                '/register': {
                    target: 'http://127.0.0.1:8000',
                    changeOrigin: true,
                    secure: false,
                }
            },
            cors: {
                origin: '*',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                credentials: true,
            },
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        },
        define: {
            // Fix for development build
            global: 'globalThis',
            // Add process.env polyfill for React
            'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
            // Fix for React DevTools and React 19
            '__DEV__': isDev,
            // Ensure React JSX runtime is properly defined
            'process.env.BABEL_ENV': JSON.stringify(isDev ? 'development' : 'production')
        },
        build: {
            // Ensure assets are properly processed
            assetsInlineLimit: 0, // Don't inline any assets
            outDir: 'public/build',
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['react', 'react-dom'],
                    },
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
        resolve: {
            alias: {
                '@': '/resources',
            },
        },
        assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2', '**/*.eot', '**/*.otf']
    };
});
