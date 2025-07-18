import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
    // Load env file based on mode
    const env = loadEnv(mode, process.cwd(), '')
    
    // Force development mode to use local assets, only use ASSET_URL for production builds
    const isDev = command === 'serve' || mode === 'development'
    
    // Setup environment for React
    process.env.NODE_ENV = isDev ? 'development' : 'production';
    
    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/react/index.jsx'],
                refresh: [
                    'resources/views/**',
                    'resources/js/react/**',
                    'app/**/*.php',
                    'routes/**/*.php',
                ],
                publicDirectory: 'public',
            }),
            react({
                include: '**/*.{js,jsx,tsx}',
                jsxRuntime: 'automatic',
                fastRefresh: true
            }),
            tailwindcss(),
        ],
        build: {
            // Enable minification and optimization
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                },
            },
            // Increase chunk size warning limit
            chunkSizeWarningLimit: 1000,
            // Enable source maps for production debugging
            sourcemap: false,
            rollupOptions: {
                output: {
                    entryFileNames: 'assets/[name]-[hash].js',
                    chunkFileNames: 'assets/[name]-[hash].js',
                    assetFileNames: (assetInfo) => {
                        const extType = assetInfo.name.split('.').at(1);
                        if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
                            return `assets/img/[name]-[hash][extname]`;
                        }
                        if (/css/i.test(extType)) {
                            return `assets/css/[name]-[hash][extname]`;
                        }
                        if (/woff2?|eot|ttf|otf/i.test(extType)) {
                            return `assets/fonts/[name]-[hash][extname]`;
                        }
                        // Ensure all font files go to assets/fonts directory
                        if (assetInfo.name && /\.(woff2?|eot|ttf)$/i.test(assetInfo.name)) {
                            return `assets/fonts/[name]-[hash][extname]`;
                        }
                        return `assets/[name]-[hash][extname]`;
                    },
                    format: 'es',
                    // Code splitting for better caching
                    manualChunks: {
                        // Core React dependencies
                        vendor: ['react', 'react-dom'],
                        // Router and navigation
                        router: ['react-router-dom'],
                        // UI components and icons
                        ui: ['@heroicons/react', 'react-icons', 'react-hot-toast'],
                        // Motion and animations
                        motion: ['framer-motion'],
                        // Utilities
                        utils: ['date-fns'],
                    },
                },
                // Handle external modules and warnings
                external: [],
                onwarn: (warning, warn) => {
                    // Suppress specific warnings
                    if (warning.code === 'EVAL' || 
                        warning.message.includes('React DevTools') ||
                        warning.message.includes('__REACT_DEVTOOLS_GLOBAL_HOOK__')) {
                        return;
                    }
                    warn(warning);
                },
            },
            // Performance optimizations
            assetsDir: 'assets',
            target: ['es2020', 'chrome80', 'firefox78', 'safari14'],
            cssCodeSplit: true,
            outDir: 'public/build',
            modulePreload: {
                polyfill: false // Disable unnecessary polyfill for modern browsers
            },
            // Additional options to handle React DevTools
            commonjsOptions: {
                transformMixedEsModules: true,
            },
        },
        base: '/build/',
        server: {
            hmr: {
                host: '127.0.0.1',
                protocol: 'ws',
            },
            host: '127.0.0.1',
            middlewareMode: false,
        },
        define: {
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.VITE_APP_URL': JSON.stringify(env.VITE_APP_URL || 'http://localhost:8000'),
            'import.meta.env.DEV': isDev,
            'import.meta.env.PROD': !isDev,
            'import.meta.env.MODE': JSON.stringify(mode),
            // Fix React DevTools issue
            '__REACT_DEVTOOLS_GLOBAL_HOOK__': JSON.stringify({}),
            'global': 'globalThis',
        },
        resolve: {
            alias: {
                '@': '/resources/js',
                '~': '/resources',
            },
        },
        assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2', '**/*.eot', '**/*.otf']
    };
});
