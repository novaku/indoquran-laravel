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
    <meta name="robots" content="{{ $robots ?? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' }}">
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
    
    <!-- Canonical URL managed by Server Side for SEO Consistency -->
    <!-- This prevents duplicate canonical tags and ensures Google sees one consistent canonical URL -->
    <link rel="canonical" href="{{ $canonicalUrl ?? url()->current() }}">
    
    <!-- Additional SEO Links -->
    <link rel="alternate" hreflang="id" href="{{ url()->current() }}">
    <link rel="alternate" hreflang="x-default" href="{{ url('/') }}">
    @if(isset($reactData['currentSurah']) && $reactData['currentSurah'])
    <link rel="amphtml" href="{{ url('/amp/surah/' . $reactData['currentSurah']->number) }}">
    @endif
    
    <title>{{ $metaTitle ?? 'IndoQuran - Al-Quran Digital Indonesia' }}</title>

    <!-- Critical Performance Optimizations -->
    <!-- DNS prefetch for external domains (highest priority) - reduced to only used resources -->
    <link rel="dns-prefetch" href="//pagead2.googlesyndication.com">
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">

    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9994842285785390" crossorigin="anonymous"></script>
    
    <!-- Preconnect to critical external resources only (fonts) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Preload critical resources for faster initial load -->
    <link rel="modulepreload" href="{{ Vite::asset('resources/js/react/index.jsx') }}" as="script">
    
    <!-- Optimized Font Loading - Load fonts asynchronously to avoid blocking -->
    <!-- Using stylesheet with font-display: swap for better performance -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@400;600&family=Noto+Naskh+Arabic:wght@400;600&display=swap" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@400;600&family=Noto+Naskh+Arabic:wght@400;600&display=swap"></noscript>
    
    <!-- Fallback system fonts for immediate rendering -->
    <style>
        /* Optimize font loading with font-display: swap */
        @font-face {
            font-family: 'Inter Fallback';
            font-style: normal;
            font-weight: 400;
            src: local('Arial');
            ascent-override: 90%;
            descent-override: 22%;
            line-gap-override: 0%;
            size-adjust: 107%;
        }
        
        body { 
            font-family: Inter, 'Inter Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-display: swap;
        }
        
        .arabic-text { 
            font-family: 'Amiri', 'Noto Naskh Arabic', 'Arabic Typesetting', 'Traditional Arabic', serif;
            font-display: swap;
        }
        
        /* Reduce layout shift from font loading */
        * {
            font-synthesis: none;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
    </style>

    <!-- Icons with optimized sizes -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json">
    
    <!-- PWA iOS Meta Tags -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="IndoQuran">
    <meta name="mobile-web-app-capable" content="yes">
    
    <!-- Enhanced Anti-Injection Security -->
    <script src="/anti-injection-security.js"></script>
    
    <!-- PWA Manager -->
    <script src="/pwa-manager.js"></script>
    
    <!-- Critical CSS for above-the-fold content -->
    {!! App\Services\PerformanceOptimizationService::getCriticalCSS() !!}
    
    <!-- Module MIME Type Fix Script (Lightweight - Anti-injection handled by anti-injection-security.js) -->
    <script>
        // Fix for JS module MIME type issues only - Security handled by external script
        (function() {
            // Override the default module loading to handle MIME type errors
            const originalFetch = window.fetch;
            
            window.fetch = function(resource, options = {}) {
                // Handle JS modules in build/assets directory
                if (typeof resource === 'string' && 
                    (resource.includes('/build/assets/') || resource.includes('/assets/')) && 
                    resource.endsWith('.js')) {
                    
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
            
            console.log('JS module MIME type fix loaded');
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
    
    <!-- Arabic Fonts - Load after page load to avoid blocking -->
    <link rel="stylesheet" href="{{ asset('fonts/arabic-font.css') }}" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="{{ asset('fonts/arabic-font.css') }}"></noscript>
    
    <!-- Vite Assets -->
    @vite(['resources/css/app.css', 'resources/js/react/index.jsx'])
    
    <!-- Structured Data for SEO -->
    <script type="application/ld+json">
    {
        "@@context": "https://schema.org",
        "@@type": "WebSite",
        "name": "IndoQuran",
        "alternateName": "Al-Quran Digital Indonesia",
        "url": "https://indoquran.web.id",
        "description": "Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia.",
        "inLanguage": "id",
        "publisher": {
            "@@type": "Organization",
            "name": "IndoQuran",
            "url": "https://indoquran.web.id",
            "logo": {
                "@@type": "ImageObject",
                "url": "https://indoquran.web.id/android-chrome-512x512.png",
                "width": 512,
                "height": 512
            }
        },
        "potentialAction": {
            "@@type": "SearchAction",
            "target": "https://indoquran.web.id/cari?q={search_term_string}",
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

        <!-- SEO Content (Server Side Rendered) to ensure indexing -->
        @if(isset($reactData['surahs']))
            <div id="ssr-surah-list" style="padding: 2rem; background: #fff; color: #1f2937;">
                <h1 style="font-size: 1.875rem; font-weight: 800; margin-bottom: 2rem; text-align: center; color: #166534;">Daftar Surah Al-Quran</h1>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; max-width: 1200px; margin: 0 auto;">
                    @foreach($reactData['surahs'] as $surah)
                        <a href="/surah/{{ $surah->number }}" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; color: inherit; background-color: #f9fafb; transition: all 0.2s;">
                            <div>
                                <div style="font-weight: 700; color: #111827;">{{ $surah->number }}. {{ $surah->name_latin }}</div>
                                <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">{{ $surah->name_indonesian }} • {{ $surah->total_ayahs }} Ayat</div>
                            </div>
                            <div class="arabic-text" style="font-size: 1.5rem; color: #15803d;">{{ $surah->name_arabic }}</div>
                        </a>
                    @endforeach
                </div>
            </div>
        @endif

        @if(isset($reactData['currentSurah']))
            <div id="ssr-surah-detail" style="padding: 4rem 2rem; background: #fff; color: #1f2937; text-align: center; max-width: 800px; margin: 0 auto;">
                <h1 style="font-size: 2.25rem; font-weight: 800; margin-bottom: 0.5rem; color: #111827;">Surah {{ $reactData['currentSurah']->name_latin }}</h1>
                <h2 class="arabic-text" style="font-size: 3.75rem; margin-bottom: 1.5rem; color: #166534;">{{ $reactData['currentSurah']->name_arabic }}</h2>
                <div style="font-size: 1.125rem; color: #4b5563; margin-bottom: 3rem; background: #f3f4f6; display: inline-block; padding: 0.5rem 1.5rem; border-radius: 9999px;">
                    {{ $reactData['currentSurah']->name_indonesian }} • {{ $reactData['currentSurah']->total_ayahs }} Ayat • {{ $reactData['currentSurah']->revelation_place }}
                </div>

                @if(isset($reactData['currentAyah']) && $reactData['currentAyah'])
                    <article id="ssr-ayah-detail" style="text-align: left; margin: 0 auto 2rem; max-width: 720px; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; background: #fafaf9;">
                        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem; color: #14532d;">
                            Ayat {{ $reactData['currentAyah']->ayah_number }} Surah {{ $reactData['currentSurah']->name_latin }}
                        </h3>

                        <p class="arabic-text" style="font-size: 2rem; line-height: 2.4; color: #111827; text-align: right; margin: 0 0 1rem 0; direction: rtl;">
                            {{ $reactData['currentAyah']->text_arabic }}
                        </p>

                        @if(!empty($reactData['currentAyah']->text_latin))
                            <p style="font-size: 1rem; color: #4b5563; line-height: 1.7; margin: 0 0 0.75rem 0;">
                                {{ $reactData['currentAyah']->text_latin }}
                            </p>
                        @endif

                        @if(!empty($reactData['currentAyah']->text_indonesian))
                            <p style="font-size: 1rem; color: #1f2937; line-height: 1.7; margin: 0;">
                                {{ $reactData['currentAyah']->text_indonesian }}
                            </p>
                        @endif

                        <nav style="margin-top: 1rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
                            @if(isset($reactData['ayahNavigation']['prev']) && $reactData['ayahNavigation']['prev'])
                                <a href="/surah/{{ $reactData['currentSurah']->number }}/{{ $reactData['ayahNavigation']['prev'] }}" style="color: #166534; font-weight: 600; text-decoration: none;">&larr; Ayat {{ $reactData['ayahNavigation']['prev'] }}</a>
                            @endif
                            @if(isset($reactData['ayahNavigation']['next']) && $reactData['ayahNavigation']['next'])
                                <a href="/surah/{{ $reactData['currentSurah']->number }}/{{ $reactData['ayahNavigation']['next'] }}" style="color: #166534; font-weight: 600; text-decoration: none;">Ayat {{ $reactData['ayahNavigation']['next'] }} &rarr;</a>
                            @endif
                        </nav>
                    </article>
                @endif

                <div>
                    <a href="/" style="display: inline-block; padding: 0.75rem 1.5rem; background: #16a34a; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">&larr; Kembali ke Daftar Surah</a>
                </div>
            </div>
        @endif

        @if(isset($reactData['currentJuz']))
            <div id="ssr-juz-detail" style="padding: 3rem 2rem; background: #fff; color: #1f2937; text-align: center; max-width: 900px; margin: 0 auto;">
                <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 0.75rem; color: #111827;">{{ $reactData['currentJuz']['title'] }}</h1>
                <p style="font-size: 1.0625rem; color: #4b5563; line-height: 1.8; margin: 0 auto 1.5rem; max-width: 700px;">{{ $reactData['currentJuz']['description'] }}</p>
                <div style="font-size: 0.9375rem; color: #6b7280; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 0.875rem 1rem; display: inline-block;">
                    Query terkait: juz {{ $reactData['currentJuz']['number'] }}, juz {{ $reactData['currentJuz']['number'] }} arab saja, para {{ $reactData['currentJuz']['number'] }}.
                </div>
            </div>
        @endif

        @if(isset($reactData['currentPage']))
            <div id="ssr-page-detail" style="padding: 3rem 2rem; background: #fff; color: #1f2937; text-align: center; max-width: 900px; margin: 0 auto;">
                <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 0.75rem; color: #111827;">{{ $reactData['currentPage']['title'] }}</h1>
                <p style="font-size: 1.0625rem; color: #4b5563; line-height: 1.8; margin: 0 auto 1.5rem; max-width: 700px;">{{ $reactData['currentPage']['description'] }}</p>
                <div style="font-size: 0.9375rem; color: #6b7280; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 0.875rem 1rem; display: inline-block;">
                    Query terkait: al quran halaman {{ $reactData['currentPage']['number'] }}, alquran halaman {{ $reactData['currentPage']['number'] }}, quran halaman {{ $reactData['currentPage']['number'] }}.
                </div>
            </div>
        @endif
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
    
    <!-- Performance Monitoring -->
    {!! App\Services\PerformanceOptimizationService::getPerformanceMonitoringScript() !!}
    
    <!-- Optimized CSS for performance -->
    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Optimize font loading to prevent FOUT */
        body { font-display: swap; }
        
        /* Prevent cumulative layout shift */
        img { max-width: 100%; height: auto; }
        
        /* Optimize animations for performance */
        * {
            will-change: auto;
        }
        
        .animate-spin {
            will-change: transform;
        }
    </style>

    @if(app()->environment('local'))
        <!-- Development helpers: Hot reload is handled by Vite in the React components -->
    @endif
</body>
</html>
