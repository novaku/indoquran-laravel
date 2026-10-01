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
                fastRefresh: true,
                babel: {
                    plugins: [
                        // Remove console logs in production
                        ...(!isDev ? [['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }]] : [])
                    ]
                }
            }),
            tailwindcss(),
        ],
        build: {
            // Enable more aggressive minification and optimization
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    pure_funcs: ['console.log', 'console.info', 'console.debug'],
                    passes: 2,
                },
                mangle: {
                    safari10: true,
                },
                format: {
                    comments: false,
                },
            },
            // Optimize chunk size warning limit for modern React SPA
            chunkSizeWarningLimit: 600,
            // Disable source maps for production to reduce size significantly
            sourcemap: false,
            // Enhanced code splitting for aggressive bundle size reduction
            rollupOptions: {
                output: {
                    entryFileNames: 'assets/[name]-[hash].js',
                    chunkFileNames: 'assets/[name]-[hash].js',
                    assetFileNames: (assetInfo) => {
                        const extType = assetInfo.name.split('.').at(1);
                        if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(extType)) {
                            return `assets/img/[name]-[hash][extname]`;
                        }
                        if (/css/i.test(extType)) {
                            return `assets/css/[name]-[hash][extname]`;
                        }
                        if (/woff2?|eot|ttf|otf/i.test(extType)) {
                            return `assets/fonts/[name]-[hash][extname]`;
                        }
                        return `assets/[name]-[hash][extname]`;
                    },
                    format: 'es',
                    // Aggressive code splitting to minimize initial bundle
                    manualChunks: (id) => {
                        // Core React dependencies & runtime internals
                        if (
                            (id.includes('node_modules/react/') && !id.includes('react-dom')) ||
                            id.includes('react-is') ||
                            id.includes('scheduler') ||
                            id.includes('use-sync-external-store')
                        ) {
                            return 'vendor-react-core';
                        }
                        if (id.includes('node_modules/react-dom')) {
                            return 'vendor-react-dom';
                        }
                        // Router (separate chunk)
                        if (id.includes('react-router')) {
                            return 'vendor-router';
                        }
                        // UI components (separate chunks)
                        if (id.includes('@heroicons')) {
                            return 'vendor-icons';
                        }
                        if (id.includes('react-hot-toast')) {
                            return 'vendor-toast';
                        }
                        if (id.includes('react-icons')) {
                            return 'vendor-react-icons';
                        }
                        // TanStack Query (separate chunk)
                        if (id.includes('@tanstack')) {
                            return 'vendor-query';
                        }
                        // Heavy animation libraries & motion primitives
                        if (
                            id.includes('framer-motion') ||
                            id.includes('motion-dom') ||
                            id.includes('motion-utils')
                        ) {
                            return 'vendor-motion';
                        }
                        if (id.includes('date-fns')) {
                            return 'vendor-date';
                        }
                        if (id.includes('lodash')) {
                            return 'vendor-lodash';
                        }
                        if (id.includes('axios')) {
                            return 'vendor-axios';
                        }
                        if (id.includes('moment')) {
                            return 'vendor-moment';
                        }
                        if (
                            id.includes('chart.js') ||
                            id.includes('react-chartjs-2') ||
                            id.includes('@kurkle')
                        ) {
                            return 'vendor-charts';
                        }
                        // TipTap & ProseMirror suite - WYSIWYG editor (lazy loaded for admin)
                        if (
                            id.includes('@tiptap') ||
                            id.includes('prosemirror') ||
                            id.includes('orderedmap') ||
                            id.includes('w3c-keyname') ||
                            id.includes('rope-sequence') ||
                            id.includes('crelt')
                        ) {
                            return 'vendor-editor';
                        }
                        // Web Vitals & Performance metrics
                        if (id.includes('web-vitals')) {
                            return 'vendor-vitals';
                        }
                        // Alpine.js
                        if (id.includes('alpinejs')) {
                            return 'vendor-alpine';
                        }
                        // Other small vendor libs (grouped)
                        if (id.includes('node_modules')) {
                            return 'vendor-utils';
                        }
                    },
                },
                // Handle external modules and warnings
                external: [],
                onwarn: (warning, warn) => {
                    // Suppress specific warnings to reduce noise
                    if (warning.code === 'EVAL' || 
                        warning.code === 'CIRCULAR_DEPENDENCY' ||
                        warning.message.includes('React DevTools') ||
                        warning.message.includes('__REACT_DEVTOOLS_GLOBAL_HOOK__')) {
                        return;
                    }
                    warn(warning);
                },
            },
            // Performance optimizations for mobile with strict limits
            assetsDir: 'assets',
            target: ['es2020', 'chrome80', 'firefox78', 'safari14', 'edge88'],
            cssCodeSplit: true,
            outDir: 'public/build',
            modulePreload: {
                polyfill: false // Disable unnecessary polyfill for modern browsers
            },
            // Aggressive asset inlining for smallest possible files
            assetsInlineLimit: 2048, // Reduced from 4096 to minimize HTTP requests
            // Additional options for React optimization
            commonjsOptions: {
                transformMixedEsModules: true,
                include: [/node_modules/],
            },
            // Aggressive chunk size optimization
            experimentalMinChunkSize: 500, // Reduced to force smaller chunks
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
