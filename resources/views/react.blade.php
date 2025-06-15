<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" prefix="og: https://ogp.me/ns#">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#22c55e">
    <meta name="color-scheme" content="light">
    
    <!-- Permissions Policy for Geolocation -->
    <meta http-equiv="Permissions-Policy" content="geolocation=(self)">
    
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
        // Enhanced fix for JS module MIME type issues and malicious script injection protection
        (function() {
            // Prevent malicious script injection
            const originalCreateElement = document.createElement.bind(document);
            document.createElement = function(tagName) {
                const element = originalCreateElement(tagName);
                
                // Block creation of script elements with suspicious sources
                if (tagName.toLowerCase() === 'script') {
                    const originalSetAttribute = element.setAttribute.bind(element);
                    element.setAttribute = function(name, value) {
                        if (name.toLowerCase() === 'src' && 
                            (value.includes('infird.com') || 
                             value.includes('b50b7f30') ||
                             value.match(/^https?:\/\/[^\/]+\/cdn\/[a-f0-9-]+/))) {
                            console.warn('Blocked suspicious script injection:', value);
                            return; // Block the script
                        }
                        return originalSetAttribute(name, value);
                    };
                    
                    // Also override src property
                    Object.defineProperty(element, 'src', {
                        set: function(value) {
                            if (value.includes('infird.com') || 
                                value.includes('b50b7f30') ||
                                value.match(/^https?:\/\/[^\/]+\/cdn\/[a-f0-9-]+/)) {
                                console.warn('Blocked suspicious script src:', value);
                                return;
                            }
                            this.setAttribute('src', value);
                        },
                        get: function() {
                            return this.getAttribute('src');
                        }
                    });
                }
                
                return element;
            };
            
            // Override the default module loading to handle MIME type errors
            const originalFetch = window.fetch;
            
            window.fetch = function(resource, options = {}) {
                // Block suspicious requests
                if (typeof resource === 'string' && 
                    (resource.includes('infird.com') || 
                     resource.includes('b50b7f30') ||
                     resource.match(/^https?:\/\/[^\/]+\/cdn\/[a-f0-9-]+/))) {
                    console.warn('Blocked suspicious fetch request:', resource);
                    return Promise.reject(new Error('Blocked suspicious request'));
                }
                
                // Handle JS modules in build/assets directory
                if (typeof resource === 'string' && 
                    (resource.includes('/build/assets/') || resource.includes('/assets/')) && 
                    resource.endsWith('.js')) {
                    
                    console.log('Loading JS module:', resource);
                    
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
            
            // Block document.write injection
            const originalWrite = document.write;
            document.write = function(markup) {
                if (markup.includes('infird.com') || 
                    markup.includes('b50b7f30') ||
                    markup.match(/script[^>]*src[^>]*\/cdn\/[a-f0-9-]+/)) {
                    console.warn('Blocked suspicious document.write:', markup);
                    return;
                }
                return originalWrite.call(document, markup);
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
            
            console.log('Enhanced security and JS module MIME type fix loaded');
        })();
        
        // Error handling for the React app
        window.addEventListener('error', function(e) {
            if (e.message && e.message.includes('infird.com')) {
                console.warn('Blocked error from malicious script injection');
                e.preventDefault();
                return false;
            }
            
            // If there's a module loading error, try to recover
            if (e.message && e.message.includes('Failed to fetch')) {
                console.error('Module loading failed, attempting recovery...');
                // Don't prevent the error, but log it for debugging
            }
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', function(e) {
            if (e.reason && e.reason.toString().includes('infird.com')) {
                console.warn('Blocked promise rejection from malicious script');
                e.preventDefault();
                return false;
            }
        });
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
    
    <!-- Vite Assets -->
    @vite(['resources/css/app.css', 'resources/js/react/index.jsx'])
    
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
    <div id="app">
        <!-- Fallback content while React loads -->
        <div id="app-loading" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            font-family: 'Figtree', sans-serif;
            text-align: center;
            padding: 2rem;
        ">
            <div style="
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 3rem;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                max-width: 500px;
                width: 100%;
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    border-top: 4px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 2rem;
                "></div>
                
                <h1 style="
                    font-size: 2rem;
                    font-weight: 600;
                    margin: 0 0 1rem 0;
                    background: linear-gradient(45deg, #ffffff, #f0f9ff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                ">IndoQuran</h1>
                
                <p style="
                    font-size: 1.1rem;
                    margin: 0 0 1.5rem 0;
                    opacity: 0.9;
                ">Al-Quran Digital Indonesia</p>
                
                <div id="loading-status" style="
                    font-size: 0.9rem;
                    opacity: 0.8;
                    min-height: 1.5rem;
                ">Memuat aplikasi...</div>
                
                <div style="
                    margin-top: 2rem;
                    font-size: 0.8rem;
                    opacity: 0.7;
                ">
                    <div>Platform Al-Quran terlengkap</div>
                    <div>dengan terjemahan bahasa Indonesia</div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Loading timeout and error handling -->
    <script>
        (function() {
            let loadingTimeout;
            let retryCount = 0;
            const maxRetries = 3;
            
            function updateLoadingStatus(message) {
                const statusEl = document.getElementById('loading-status');
                if (statusEl) statusEl.textContent = message;
            }
            
            function hideLoadingScreen() {
                const loadingEl = document.getElementById('app-loading');
                if (loadingEl) {
                    loadingEl.style.opacity = '0';
                    loadingEl.style.transition = 'opacity 0.5s ease-out';
                    setTimeout(() => {
                        if (loadingEl.parentNode) {
                            loadingEl.parentNode.removeChild(loadingEl);
                        }
                    }, 500);
                }
            }
            
            function showError() {
                updateLoadingStatus('Terjadi masalah saat memuat. Silakan refresh halaman.');
                
                // Add retry button
                const statusEl = document.getElementById('loading-status');
                if (statusEl) {
                    statusEl.innerHTML = `
                        <div>Terjadi masalah saat memuat aplikasi</div>
                        <button onclick="console.log('Manual refresh required'); alert('Silakan refresh halaman secara manual (Ctrl+R atau Cmd+R)');" style="
                            background: rgba(255, 255, 255, 0.2);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            color: white;
                            padding: 0.5rem 1rem;
                            border-radius: 8px;
                            margin-top: 1rem;
                            cursor: pointer;
                            font-size: 0.9rem;
                        ">Refresh Manual</button>
                    `;
                }
            }
            
            // Check if React app loaded successfully
            function checkAppLoaded() {
                const appEl = document.getElementById('app');
                if (appEl && appEl.children.length > 1) {
                    // React app has loaded
                    hideLoadingScreen();
                    clearTimeout(loadingTimeout);
                    return true;
                }
                return false;
            }
            
            // Monitor for React app loading
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.target.id === 'app') {
                        if (checkAppLoaded()) {
                            observer.disconnect();
                        }
                    }
                });
            });
            
            observer.observe(document.getElementById('app'), {
                childList: true,
                subtree: true
            });
            
            // Set timeout for loading (disabled to prevent unwanted refreshes)
            loadingTimeout = setTimeout(function() {
                if (!checkAppLoaded()) {
                    if (retryCount < maxRetries) {
                        retryCount++;
                        updateLoadingStatus(`App masih loading... (${retryCount}/${maxRetries})`);
                        
                        // Removed auto-reload to prevent unwanted page refreshes
                        console.log('App still loading, but auto-reload disabled');
                    } else {
                        showError();
                    }
                }
            }, 30000); // Increased timeout to 30 seconds and disabled auto-reload
            
            // Update loading messages
            setTimeout(() => updateLoadingStatus('Memuat komponen...'), 1000);
            setTimeout(() => updateLoadingStatus('Menyiapkan antarmuka...'), 3000);
            setTimeout(() => updateLoadingStatus('Hampir selesai...'), 6000);
        })();
    </script>
    
    <!-- CSS for loading animation -->
    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
    
    @if(app()->environment('local'))
    <!-- Development helpers: Hot reload is handled by Vite in the React components -->
    @endif
</body>
</html>
