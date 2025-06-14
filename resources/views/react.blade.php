<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" prefix="og: https://ogp.me/ns#">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#22c55e">
    <meta name="color-scheme" content="light">
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="{{ $metaDescription ?? 'IndoQuran - Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia, fitur bookmark, pencarian ayat, dan audio murottal berkualitas tinggi.' }}">
    <meta name="keywords" content="{{ $metaKeywords ?? 'al quran indonesia, quran online, al quran digital, baca quran, terjemahan quran, murottal, quran indonesia, ayat al quran, surah quran, tafsir quran, hafalan quran, indoquran' }}">
    <meta name="author" content="IndoQuran">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <meta name="language" content="id">
    <meta name="geo.region" content="ID">
    <meta name="geo.country" content="Indonesia">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="{{ $ogType ?? 'website' }}">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title" content="{{ $metaTitle ?? 'IndoQuran - Al-Quran Digital Indonesia' }}">
    <meta property="og:description" content="{{ $metaDescription ?? 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia, fitur bookmark, dan audio murottal.' }}">
    <meta property="og:image" content="{{ $ogImage ?? url('/android-chrome-512x512.png') }}">
    <meta property="og:image:width" content="512">
    <meta property="og:image:height" content="512">
    <meta property="og:image:type" content="image/png">
    <meta property="og:site_name" content="IndoQuran">
    <meta property="og:locale" content="id_ID">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:site" content="@indoquran">
    <meta property="twitter:creator" content="@indoquran">
    <meta property="twitter:url" content="{{ url()->current() }}">
    <meta property="twitter:title" content="{{ $metaTitle ?? 'IndoQuran - Al-Quran Digital Indonesia' }}">
    <meta property="twitter:description" content="{{ $metaDescription ?? 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia.' }}">
    <meta property="twitter:image" content="{{ $ogImage ?? url('/android-chrome-512x512.png') }}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="{{ $canonicalUrl ?? url()->current() }}">
    
    <!-- Additional SEO Links -->
    <link rel="alternate" hreflang="id" href="{{ url()->current() }}">
    <link rel="alternate" hreflang="x-default" href="{{ url('/') }}">
    
    <title>{{ $metaTitle ?? 'IndoQuran - Al-Quran Digital Indonesia' }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    
    <!-- Google Fonts for enhanced typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Lateef&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Scheherazade+New:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Icons and Manifest -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    
    <!-- Module MIME Type Fix Script -->
    <script>
        // Enhanced fix for JS module MIME type issues
        (function() {
            // Override the default module loading to handle MIME type errors
            const originalFetch = window.fetch;
            
            window.fetch = function(resource, options = {}) {
                // Handle JS modules in build/assets directory
                if (typeof resource === 'string' && 
                    (resource.includes('/build/assets/') || resource.includes('/assets/')) && 
                    resource.endsWith('.js')) {
                    
                    console.log('Intercepting JS module request:', resource);
                    
                    // Set proper headers for module requests
                    const enhancedOptions = {
                        ...options,
                        headers: {
                            ...options.headers,
                            'Accept': 'application/javascript, text/javascript, */*',
                            'Content-Type': 'application/javascript',
                        },
                        credentials: 'same-origin',
                        mode: 'cors'
                    };
                    
                    return originalFetch(resource, enhancedOptions)
                        .then(response => {
                            // If the response is not ok, try to fix it
                            if (!response.ok || !response.headers.get('Content-Type')?.includes('javascript')) {
                                console.warn('MIME type issue detected, attempting fix for:', resource);
                                
                                // Clone the response and fix the content type
                                return response.blob().then(blob => {
                                    return new Response(blob, {
                                        status: response.status,
                                        statusText: response.statusText,
                                        headers: new Headers({
                                            ...Object.fromEntries(response.headers.entries()),
                                            'Content-Type': 'application/javascript; charset=utf-8'
                                        })
                                    });
                                });
                            }
                            return response;
                        })
                        .catch(error => {
                            console.error('Failed to load JS module:', resource, error);
                            // Return empty module to prevent app crashes
                            return new Response('/* Failed to load module */ export default {};', {
                                headers: { 'Content-Type': 'application/javascript; charset=utf-8' }
                            });
                        });
                }
                
                // For all other requests, use original fetch
                return originalFetch(resource, options);
            };
            
            // Also handle dynamic import errors
            const originalImport = window.import || (function() {});
            if (typeof window.import !== 'undefined') {
                const originalDynamicImport = window.import;
                window.import = function(specifier) {
                    return originalDynamicImport(specifier).catch(error => {
                        console.error('Dynamic import failed:', specifier, error);
                        // Return empty module
                        return { default: {} };
                    });
                };
            }
            
            console.log('Enhanced JS module MIME type fix loaded');
        })();
    </script>
    
    <!-- PWA Meta Tags -->
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="IndoQuran">
    <meta name="application-name" content="IndoQuran">
    <meta name="msapplication-TileColor" content="#22c55e">
    <meta name="msapplication-config" content="/browserconfig.xml">
    
    <!-- PWA Display Override -->
    <meta name="display-mode" content="standalone">
    <meta name="standalone" content="yes">
    
    <!-- Arabic Fonts -->
    <link rel="stylesheet" href="{{ asset('fonts/arabic-font.css') }}">
    <link rel="preload" href="{{ asset('fonts/arabic-font.woff2') }}" as="font" type="font/woff2" crossorigin="anonymous">
    
    <!-- Production Scripts - Only load in production -->
    @if(app()->environment('production'))
    <!-- Vite Assets for Production -->
    @vite(['resources/css/app.css', 'resources/js/app.js', 'resources/js/react/index.jsx'])
    @else
    <!-- Development Assets -->
    @vite(['resources/css/app.css', 'resources/js/app.js', 'resources/js/react/index.jsx'])
    @endif
    
    <!-- Structured Data for SEO -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "IndoQuran",
        "alternateName": "Al-Quran Digital Indonesia",
        "url": "https://my.indoquran.web.id",
        "description": "Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia.",
        "inLanguage": "id",
        "publisher": {
            "@type": "Organization",
            "name": "IndoQuran",
            "url": "https://my.indoquran.web.id",
            "logo": {
                "@type": "ImageObject",
                "url": "https://my.indoquran.web.id/android-chrome-512x512.png",
                "width": 512,
                "height": 512
            }
        },
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://my.indoquran.web.id/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    }
    </script>

    @if(app()->environment('local'))
    <!-- Font override for local development to prevent CORS issues -->
    <link rel="stylesheet" href="{{ asset('dev-fonts.css') }}">
    <!-- Hot reload script for development -->
    <script>
        if (typeof window !== 'undefined') {
            // React 19 DevTools setup
            window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
            // Disable the warning about outdated DevTools
            window.__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE = function() {};
        }
    </script>
    @endif
</head>
<body class="font-sans antialiased">
    <div id="app"></div>
    
    @if(app()->environment('local'))
    <!-- Development helpers: Hot reload is handled by Vite in the React components -->
    @endif
</body>
</html>
