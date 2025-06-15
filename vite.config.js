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
                        return `assets/[name]-[hash][extname]`;
                    },
                    format: 'es',
                    manualChunks: {
                        vendor: ['react', 'react-dom'],
                    },
                },
            },
            minify: 'esbuild',
            sourcemap: false,
            assetsDir: 'assets',
            chunkSizeWarningLimit: 1000,
            cssCodeSplit: true,
            outDir: 'public/build',
            target: 'es2020',
        },
        base: '/',
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
