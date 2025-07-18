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
            // Enable more aggressive minification and optimization
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
                    passes: 3, // Increased passes for better compression
                    unsafe: true,
                    unsafe_comps: true,
                    unsafe_math: true,
                    unsafe_methods: true,
                    // Remove dead code more aggressively
                    dead_code: true,
                    unused: true,
                    // Inline small functions
                    inline: 2,
                    // Optimize conditionals
                    conditionals: true,
                    evaluate: true,
                    // Reduce file size
                    reduce_vars: true,
                    reduce_funcs: true,
                },
                mangle: {
                    safari10: true,
                    toplevel: true,
                    properties: {
                        regex: /^_/
                    }
                },
                format: {
                    comments: false,
                    semicolons: false,
                    beautify: false,
                },
            },
            // Reduce chunk size warning limit for mobile
            chunkSizeWarningLimit: 250, // Reduced from 500KB to 250KB
            // Disable source maps for production to reduce size
            sourcemap: false,
            rollupOptions: {
                output: {
                    entryFileNames: 'assets/[name]-[hash].js',
                    chunkFileNames: 'assets/[name]-[hash].js',
                    assetFileNames: (assetInfo) => {
                        const extType = assetInfo.name.split('.').at(1);
                        if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(extType)) {
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
                    // Enhanced code splitting for better mobile caching
                    manualChunks: (id) => {
                        // Core React dependencies (critical)
                        if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                            return 'vendor-react';
                        }
                        // Router and navigation (high priority)
                        if (id.includes('react-router')) {
                            return 'vendor-router';
                        }
                        // UI components and icons (medium priority)
                        if (id.includes('@heroicons') || id.includes('react-icons')) {
                            return 'vendor-icons';
                        }
                        // Toast notifications (low priority - can be lazy loaded)
                        if (id.includes('react-hot-toast')) {
                            return 'vendor-toast';
                        }
                        // Motion and animations (low priority on mobile)
                        if (id.includes('framer-motion')) {
                            return 'vendor-motion';
                        }
                        // Date and utility libraries
                        if (id.includes('date-fns')) {
                            return 'vendor-date';
                        }
                        if (id.includes('lodash')) {
                            return 'vendor-utils';
                        }
                        // Audio and media libraries
                        if (id.includes('audio') || id.includes('media') || id.includes('video')) {
                            return 'vendor-media';
                        }
                        // Prayer and Islamic libraries
                        if (id.includes('prayer') || id.includes('hijri') || id.includes('islamic')) {
                            return 'vendor-islamic';
                        }
                        // Separate chunk for other large node_modules
                        if (id.includes('node_modules')) {
                            const packageName = id.split('node_modules/')[1].split('/')[0];
                            // Group small packages together
                            if (packageName.length < 10) {
                                return 'vendor-small';
                            }
                            return 'vendor-libs';
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
            // Performance optimizations for mobile
            assetsDir: 'assets',
            target: ['es2020', 'chrome80', 'firefox78', 'safari14', 'edge88'],
            cssCodeSplit: true,
            outDir: 'public/build',
            modulePreload: {
                polyfill: false // Disable unnecessary polyfill for modern browsers
            },
            // Enable asset inlining for small files (reduced threshold for mobile)
            assetsInlineLimit: 2048, // Reduced from 4096 to 2048 for mobile
            // Additional options for React optimization
            commonjsOptions: {
                transformMixedEsModules: true,
                include: [/node_modules/],
            },
            // Mobile-specific optimizations
            reportCompressedSize: false, // Faster builds
            write: true,
            emptyOutDir: true,
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
