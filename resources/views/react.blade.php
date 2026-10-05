<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" prefix="og: https://ogp.me/ns#">
<head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ config('services.google.analytics_id', 'G-1JPHVNB3YX') }}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', '{{ config('services.google.analytics_id', 'G-1JPHVNB3YX') }}');
    </script>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#22c55e">
    <meta name="color-scheme" content="only light">
    <meta name="supported-color-schemes" content="light">
    
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
    <meta property="og:url" content="{{ $canonicalUrl ?? url()->current() }}">
    <meta property="og:title" content="{{ $metaTitle ?? 'IndoQuran - Al-Quran Digital Indonesia' }}">
    <meta property="og:description" content="{{ $metaDescription ?? 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia, fitur bookmark, dan audio murottal.' }}">
    <meta property="og:image" content="{{ $ogImage ?? url('/android-chrome-512x512.png') }}">
    <meta property="og:image:width" content="512">
    <meta property="og:image:height" content="512">
    <meta property="og:image:type" content="image/png">
    <meta property="og:site_name" content="IndoQuran">
    <meta property="og:locale" content="id_ID">
    @if(isset($articleOpenGraphMeta))
        @if(!empty($articleOpenGraphMeta['published_time']))
    <meta property="article:published_time" content="{{ $articleOpenGraphMeta['published_time'] }}">
        @endif
        @if(!empty($articleOpenGraphMeta['modified_time']))
    <meta property="article:modified_time" content="{{ $articleOpenGraphMeta['modified_time'] }}">
        @endif
        @if(!empty($articleOpenGraphMeta['author']))
    <meta property="article:author" content="{{ $articleOpenGraphMeta['author'] }}">
        @endif
        @if(!empty($articleOpenGraphMeta['section']))
    <meta property="article:section" content="{{ $articleOpenGraphMeta['section'] }}">
        @endif
        @if(!empty($articleOpenGraphMeta['tags']))
            @foreach($articleOpenGraphMeta['tags'] as $articleTag)
    <meta property="article:tag" content="{{ $articleTag }}">
            @endforeach
        @endif
    @endif
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:site" content="@indoquran">
    <meta property="twitter:creator" content="@indoquran">
    <meta property="twitter:url" content="{{ $canonicalUrl ?? url()->current() }}">
    <meta property="twitter:title" content="{{ $metaTitle ?? 'IndoQuran - Al-Quran Digital Indonesia' }}">
    <meta property="twitter:description" content="{{ $metaDescription ?? 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia.' }}">
    <meta property="twitter:image" content="{{ $ogImage ?? url('/android-chrome-512x512.png') }}">
    
    <!-- Canonical URL managed by Server Side for SEO Consistency -->
    <!-- This prevents duplicate canonical tags and ensures Google sees one consistent canonical URL -->
    <link rel="canonical" href="{{ $canonicalUrl ?? url()->current() }}">
    
    <!-- Additional SEO Links -->
    <link rel="alternate" hreflang="id" href="{{ $canonicalUrl ?? url()->current() }}">
    <link rel="alternate" hreflang="x-default" href="{{ url('/') }}">
    <title>{{ $metaTitle ?? 'IndoQuran - Al-Quran Digital Indonesia' }}</title>

    <!-- Critical Performance Optimizations -->
    @if(!request()->is('admin*'))
    <!-- DNS prefetch for external domains (highest priority) - reduced to only used resources -->
    <link rel="dns-prefetch" href="//pagead2.googlesyndication.com">
    @endif
    <link rel="dns-prefetch" href="//www.googletagmanager.com">
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">

    @if(!request()->is('admin*'))
    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9994842285785390" crossorigin="anonymous"></script>
    @endif
    
    <!-- Preconnect to critical external resources only (fonts) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Preload critical resources for faster initial load -->
    <link rel="modulepreload" href="{{ Vite::asset('resources/js/react/index.jsx') }}" as="script">
    
    <!-- Optimized Font Loading - Load fonts asynchronously to avoid blocking -->
    <!-- Using stylesheet with font-display: swap for better performance -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Naskh+Arabic:wght@400;600&display=swap" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Naskh+Arabic:wght@400;600&display=swap"></noscript>
    
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
        
        /* Typography rendering enhancements */
        * {
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        /* Prevent Google Auto Ads from inserting unformatted/full-screen/injected ads on homepage */
        .no-auto-ads .google-auto-placed,
        .no-auto-ads ins.adsbygoogle[data-anchor-status] {
            display: none !important;
        }
    </style>

    <!-- Icons with optimized sizes and cache-busting -->
    @php
        $favVersion = file_exists(public_path('favicon.ico')) ? filemtime(public_path('favicon.ico')) : '1.0';
    @endphp
    <link rel="icon" type="image/x-icon" href="/favicon.ico?v={{ $favVersion }}">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v={{ $favVersion }}">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v={{ $favVersion }}">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v={{ $favVersion }}">
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json?v=2.31.0">
    
    <!-- PWA iOS Meta Tags -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="IndoQuran">
    <meta name="mobile-web-app-capable" content="yes">
    
    <!-- Enhanced Anti-Injection Security -->
    <script src="/anti-injection-security.js"></script>
    
    <!-- PWA Manager -->
    <script src="/pwa-manager.js?v=2.31.0"></script>

    
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
    <!-- Google Identity Services (One Tap & Sign In) -->
    @if(!request()->is('admin*'))
    <script>
        window.GOOGLE_CLIENT_ID = "{{ config('services.google.client_id') }}";
    </script>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    @endif

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

    @if(isset($articleStructuredData))
    <script type="application/ld+json">
    {!! json_encode($articleStructuredData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
    </script>
    @endif

    @if(isset($breadcrumbStructuredData))
    <script type="application/ld+json">
    {!! json_encode($breadcrumbStructuredData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
    </script>
    @endif

    @if(isset($siteNavigationStructuredData))
    <script type="application/ld+json">
    {!! json_encode($siteNavigationStructuredData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
    </script>
    @endif

    @if(isset($customStructuredData))
    <script type="application/ld+json">
    {!! json_encode($customStructuredData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
    </script>
    @endif

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
        @php
            $hasSsrContent = !empty($reactData['surahs']) 
                || !empty($reactData['currentSurah']) 
                || !empty($reactData['currentJuz']) 
                || !empty($reactData['juzList'])
                || !empty($reactData['currentPage']) 
                || !empty($reactData['halamanList'])
                || !empty($reactData['currentArticle']) 
                || !empty($reactData['articles'])
                || !empty($reactData['currentTafsirTopic'])
                || !empty($reactData['haditsHub'])
                || !empty($reactData['haditsKitab'])
                || !empty($reactData['haditsDetail'])
                || !empty($reactData['haditsTopic']);
        @endphp

        <!-- Fallback content while React loads (only rendered if no SSR content is pre-rendered) -->
        @if(!$hasSsrContent)
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
                
                <div style="
                    font-size: 2rem;
                    font-weight: 600;
                    margin: 0 0 1rem 0;
                    color: #ffffff;
                ">IndoQuran</div>
                
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
        @endif

        <!-- SEO Content (Server Side Rendered) to ensure indexing -->
        @if(isset($reactData['surahs']))
            <div id="ssr-surah-list" style="padding: 2rem; background: #fff; color: #1f2937;">
                <nav aria-label="Navigasi Utama IndoQuran" style="max-width: 1200px; margin: 0 auto 2rem; display: flex; flex-wrap: wrap; gap: 0.625rem; justify-content: center; align-items: center;">
                    <a href="/surah" style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
                        📖 Al-Quran Digital
                    </a>
                    <a href="/hadits" style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
                        📚 Hadits Shahih Online
                    </a>
                    <a href="/hadits/shahih_bukhari" style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; background: #ffffff; border: 1px solid #e5e7eb; color: #374151; border-radius: 9999px; text-decoration: none; font-weight: 500; font-size: 0.875rem;">
                        Hadits Bukhari
                    </a>
                    <a href="/hadits/shahih_muslim" style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; background: #ffffff; border: 1px solid #e5e7eb; color: #374151; border-radius: 9999px; text-decoration: none; font-weight: 500; font-size: 0.875rem;">
                        Hadits Muslim
                    </a>
                    <a href="/juz/30" style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; background: #ffffff; border: 1px solid #e5e7eb; color: #374151; border-radius: 9999px; text-decoration: none; font-weight: 500; font-size: 0.875rem;">
                        Juz Amma (Juz 30)
                    </a>
                    <a href="/tafsir-maudhui" style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; background: #ffffff; border: 1px solid #e5e7eb; color: #374151; border-radius: 9999px; text-decoration: none; font-weight: 500; font-size: 0.875rem;">
                        Tafsir Maudhui
                    </a>
                    <a href="/asmaul-husna" style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; background: #ffffff; border: 1px solid #e5e7eb; color: #374151; border-radius: 9999px; text-decoration: none; font-weight: 500; font-size: 0.875rem;">
                        99 Asmaul Husna
                    </a>
                    <a href="/doa-bersama" style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; background: #ffffff; border: 1px solid #e5e7eb; color: #374151; border-radius: 9999px; text-decoration: none; font-weight: 500; font-size: 0.875rem;">
                        Kumpulan Doa
                    </a>
                    <a href="/artikel" style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; background: #ffffff; border: 1px solid #e5e7eb; color: #374151; border-radius: 9999px; text-decoration: none; font-weight: 500; font-size: 0.875rem;">
                        Artikel Islami
                    </a>
                </nav>
                <header style="max-width: 960px; margin: 0 auto 2.5rem; text-align: center;">
                    <h1 style="font-size: 2.125rem; font-weight: 800; margin-bottom: 0.875rem; color: #166534; line-height: 1.3;">
                        Al-Quran Online Indonesia - Baca Al-Qur'an Digital 30 Juz & Hadits Shahih
                    </h1>
                    <p style="font-size: 1.0625rem; line-height: 1.7; color: #4b5563; margin: 0 auto;">
                        Platform Al-Quran online terlengkap di Indonesia. Baca 114 surah dan 30 juz Al-Quran dengan teks Arab berharakat jelas, transliterasi latin, terjemahan bahasa Indonesia resmi standar Kementerian Agama RI (Kemenag), audio murottal merdu, tafsir tematik, serta 7 kitab hadits shahih nabawi.
                    </p>
                </header>

                <!-- Surah Populer Paling Sering Dibaca -->
                <section aria-label="Surah Populer Paling Sering Dibaca" style="max-width: 1200px; margin: 0 auto 2.5rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.75rem; padding: 1.5rem;">
                    <h2 style="font-size: 1.25rem; font-weight: 700; color: #166534; margin: 0 0 1rem 0; text-align: center;">
                        🌟 Surah Populer Paling Sering Dibaca
                    </h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.875rem;">
                        <a href="/surah/36" style="background: white; border: 1px solid #86efac; border-radius: 0.5rem; padding: 0.875rem 1rem; text-decoration: none; color: #1f2937; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #15803d; font-size: 1rem;">Surat Yasin</strong>
                                <div style="font-size: 0.8125rem; color: #6b7280; margin-top: 0.25rem;">Surah ke-36 • 83 Ayat</div>
                            </div>
                            <span class="arabic-text" style="font-size: 1.5rem; color: #166534;">يس</span>
                        </a>
                        <a href="/surah/18" style="background: white; border: 1px solid #86efac; border-radius: 0.5rem; padding: 0.875rem 1rem; text-decoration: none; color: #1f2937; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #15803d; font-size: 1rem;">Surat Al-Kahfi</strong>
                                <div style="font-size: 0.8125rem; color: #6b7280; margin-top: 0.25rem;">Surah ke-18 • 110 Ayat</div>
                            </div>
                            <span class="arabic-text" style="font-size: 1.5rem; color: #166534;">الكهف</span>
                        </a>
                        <a href="/surah/67" style="background: white; border: 1px solid #86efac; border-radius: 0.5rem; padding: 0.875rem 1rem; text-decoration: none; color: #1f2937; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #15803d; font-size: 1rem;">Surat Al-Mulk</strong>
                                <div style="font-size: 0.8125rem; color: #6b7280; margin-top: 0.25rem;">Surah ke-67 • 30 Ayat</div>
                            </div>
                            <span class="arabic-text" style="font-size: 1.5rem; color: #166534;">الملك</span>
                        </a>
                        <a href="/surah/56" style="background: white; border: 1px solid #86efac; border-radius: 0.5rem; padding: 0.875rem 1rem; text-decoration: none; color: #1f2937; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #15803d; font-size: 1rem;">Surat Al-Waqi'ah</strong>
                                <div style="font-size: 0.8125rem; color: #6b7280; margin-top: 0.25rem;">Surah ke-56 • 96 Ayat</div>
                            </div>
                            <span class="arabic-text" style="font-size: 1.5rem; color: #166534;">الواقعة</span>
                        </a>
                        <a href="/surah/55" style="background: white; border: 1px solid #86efac; border-radius: 0.5rem; padding: 0.875rem 1rem; text-decoration: none; color: #1f2937; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #15803d; font-size: 1rem;">Surat Ar-Rahman</strong>
                                <div style="font-size: 0.8125rem; color: #6b7280; margin-top: 0.25rem;">Surah ke-55 • 78 Ayat</div>
                            </div>
                            <span class="arabic-text" style="font-size: 1.5rem; color: #166534;">الرحمن</span>
                        </a>
                        <a href="/surah/2" style="background: white; border: 1px solid #86efac; border-radius: 0.5rem; padding: 0.875rem 1rem; text-decoration: none; color: #1f2937; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #15803d; font-size: 1rem;">Surat Al-Baqarah</strong>
                                <div style="font-size: 0.8125rem; color: #6b7280; margin-top: 0.25rem;">Surah ke-2 • 286 Ayat</div>
                            </div>
                            <span class="arabic-text" style="font-size: 1.5rem; color: #166534;">البقرة</span>
                        </a>
                        <a href="/juz/30" style="background: white; border: 1px solid #86efac; border-radius: 0.5rem; padding: 0.875rem 1rem; text-decoration: none; color: #1f2937; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #15803d; font-size: 1rem;">Juz 30 (Juz 'Amma)</strong>
                                <div style="font-size: 0.8125rem; color: #6b7280; margin-top: 0.25rem;">37 Surah Pendek</div>
                            </div>
                            <span class="arabic-text" style="font-size: 1.5rem; color: #166534;">عمّ</span>
                        </a>
                        <a href="/juz" style="background: white; border: 1px solid #86efac; border-radius: 0.5rem; padding: 0.875rem 1rem; text-decoration: none; color: #1f2937; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #15803d; font-size: 1rem;">Al-Quran Per Juz</strong>
                                <div style="font-size: 0.8125rem; color: #6b7280; margin-top: 0.25rem;">Juz 1 s/d 30 Lengkap</div>
                            </div>
                            <span class="arabic-text" style="font-size: 1.5rem; color: #166534;">الأجزاء</span>
                        </a>
                        <a href="/halaman" style="background: white; border: 1px solid #86efac; border-radius: 0.5rem; padding: 0.875rem 1rem; text-decoration: none; color: #1f2937; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #15803d; font-size: 1rem;">Al-Quran Per Halaman</strong>
                                <div style="font-size: 0.8125rem; color: #6b7280; margin-top: 0.25rem;">604 Halaman Mushaf Madinah</div>
                            </div>
                            <span class="arabic-text" style="font-size: 1.5rem; color: #166534;">الصفحات</span>
                        </a>
                        <a href="/juz/15" style="background: white; border: 1px solid #86efac; border-radius: 0.5rem; padding: 0.875rem 1rem; text-decoration: none; color: #1f2937; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #15803d; font-size: 1rem;">Juz 15 (Al-Isra & Al-Kahf)</strong>
                                <div style="font-size: 0.8125rem; color: #6b7280; margin-top: 0.25rem;">Hal. 282-301 • 185 Ayat</div>
                            </div>
                            <span class="arabic-text" style="font-size: 1.5rem; color: #166534;">١٥</span>
                        </a>
                    </div>
                </section>

                <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; text-align: center; color: #1f2937;">Daftar Lengkap 114 Surah Al-Quran</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; max-width: 1200px; margin: 0 auto;">
                    @foreach($reactData['surahs'] as $surah)
                        <a href="/surah/{{ $surah->number }}" data-google-vignette="false" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; color: inherit; background-color: #f9fafb; transition: all 0.2s;">
                            <div>
                                <div style="font-weight: 700; color: #111827;">{{ $surah->number }}. {{ $surah->name_latin }}</div>
                                <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">{{ $surah->name_indonesian }} • {{ $surah->total_ayahs }} Ayat</div>
                            </div>
                            <div class="arabic-text" style="font-size: 1.5rem; color: #15803d;">{{ $surah->name_arabic }}</div>
                        </a>
                    @endforeach
                </div>

                <!-- FAQ Section for Google Snippets -->
                <section id="ssr-faq" style="max-width: 960px; margin: 3rem auto 1rem; padding: 2rem; background: #f9fafb; border-radius: 0.75rem; border: 1px solid #e5e7eb;">
                    <h2 style="font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0 0 1.5rem 0; text-align: center;">
                        Pertanyaan Umum Seputar Al-Quran Online di IndoQuran (FAQ)
                    </h2>
                    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <article>
                            <h3 style="font-size: 1.1rem; font-weight: 600; color: #166534; margin: 0 0 0.5rem 0;">
                                Bagaimana cara membaca Al-Quran online di IndoQuran?
                            </h3>
                            <p style="font-size: 0.95rem; line-height: 1.6; color: #4b5563; margin: 0;">
                                Anda dapat langsung memilih surah dari daftar 114 surah di atas, membaca per juz (Juz 1 sampai 30), atau per halaman mushaf standar Madinah (Halaman 1 sampai 604). Setiap ayat ditampilkan dengan teks Arab jelas, transliterasi latin, dan arti bahasa Indonesia.
                            </p>
                        </article>
                        <article>
                            <h3 style="font-size: 1.1rem; font-weight: 600; color: #166534; margin: 0 0 0.5rem 0;">
                                Apakah terjemahan Al-Quran di IndoQuran bersumber dari Kemenag?
                            </h3>
                            <p style="font-size: 0.95rem; line-height: 1.6; color: #4b5563; margin: 0;">
                                Ya, seluruh terjemahan ayat Al-Quran di IndoQuran mengacu pada terjemahan resmi standar Kementerian Agama Republik Indonesia (Kemenag) yang telah diakui dan digunakan secara luas di Indonesia.
                            </p>
                        </article>
                        <article>
                            <h3 style="font-size: 1.1rem; font-weight: 600; color: #166534; margin: 0 0 0.5rem 0;">
                                Apakah tersedia audio murottal dan pemutar ayat?
                            </h3>
                            <p style="font-size: 0.95rem; line-height: 1.6; color: #4b5563; margin: 0;">
                                Ya, IndoQuran menyediakan fitur audio murottal berkualitas tinggi per surah dan per ayat dari qari-qari terkemuka dunia seperti Mishary Rashid Alafasy, Abdurrahman As-Sudais, Sa'ad Al-Ghamdi, dan lainnya yang dapat diputar secara gratis.
                            </p>
                        </article>
                        <article>
                            <h3 style="font-size: 1.1rem; font-weight: 600; color: #166534; margin: 0 0 0.5rem 0;">
                                Kitab hadits apa saja yang tersedia di IndoQuran?
                            </h3>
                            <p style="font-size: 0.95rem; line-height: 1.6; color: #4b5563; margin: 0;">
                                Selain Al-Quran, IndoQuran menyediakan koleksi lengkap 7 kitab hadits shahih nabawi: Shahih Bukhari, Shahih Muslim, Sunan Abu Daud, Sunan Tirmidzi, Sunan An-Nasa'i, Sunan Ibnu Majah, dan Musnad Ahmad lengkap dengan teks Arab dan terjemahan Indonesia.
                            </p>
                        </article>
                        <article>
                            <h3 style="font-size: 1.1rem; font-weight: 600; color: #166534; margin: 0 0 0.5rem 0;">
                                Apakah IndoQuran gratis dan ramah pengguna ponsel?
                            </h3>
                            <p style="font-size: 0.95rem; line-height: 1.6; color: #4b5563; margin: 0;">
                                IndoQuran 100% gratis untuk seluruh umat Muslim. Tampilan website dirancang sangat responsif dan ringan (PWA ready) sehingga nyaman dibaca di smartphone Android, iOS iPhone, maupun tablet dan komputer.
                            </p>
                        </article>
                    </div>
                </section>
            </div>
        @endif

        @if(isset($reactData['currentSurah']))
            <div id="ssr-surah-detail" style="padding: 3rem 1.5rem; background: #fff; color: #1f2937; max-width: 860px; margin: 0 auto;">
                <header style="text-align: center; margin-bottom: 2.5rem;">
                    <h1 style="font-size: 2.25rem; font-weight: 800; margin-bottom: 0.5rem; color: #111827;">Surah {{ $reactData['currentSurah']->name_latin }}</h1>
                    <h2 class="arabic-text" style="font-size: 3.5rem; margin: 0.75rem 0; color: #166534;">{{ $reactData['currentSurah']->name_arabic }}</h2>
                    <div style="font-size: 1rem; color: #4b5563; background: #f3f4f6; display: inline-block; padding: 0.5rem 1.25rem; border-radius: 9999px; font-weight: 500;">
                        {{ $reactData['currentSurah']->name_indonesian }} • {{ $reactData['currentSurah']->total_ayahs }} Ayat • {{ $reactData['currentSurah']->revelation_place }}
                    </div>
                </header>

                @if(isset($reactData['currentAyah']) && $reactData['currentAyah'])
                    <article id="ssr-ayah-detail" style="margin: 0 auto 2.5rem; border: 2px solid #22c55e; border-radius: 0.75rem; padding: 1.5rem; background: #f0fdf4;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                            <h3 style="font-size: 1.25rem; font-weight: 700; color: #14532d; margin: 0;">
                                Ayat {{ $reactData['currentAyah']->ayah_number }} Surah {{ $reactData['currentSurah']->name_latin }}
                            </h3>
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                @php
                                    $ssrShareText = "*" . strtoupper($reactData['currentSurah']->name_latin) . " : AYAT " . $reactData['currentAyah']->ayah_number . "*\n"
                                        . $reactData['currentSurah']->name_arabic . " - Ayat " . $reactData['currentAyah']->ayah_number . "\n\n"
                                        . $reactData['currentAyah']->text_arabic . "\n\n"
                                        . (!empty($reactData['currentAyah']->text_latin) ? "_" . $reactData['currentAyah']->text_latin . "_\n\n" : "")
                                        . (!empty($reactData['currentAyah']->text_indonesian) ? "_" . $reactData['currentAyah']->text_indonesian . "_\n\n" : "")
                                        . "[ BACA SELENGKAPNYA ]\n" . url("/surah/" . $reactData['currentSurah']->number . "/" . $reactData['currentAyah']->ayah_number) . "\n\n"
                                        . "INDOQURAN - Baca Al-Qur'an dengan mudah";
                                    $ssrWaUrl = "https://api.whatsapp.com/send?text=" . rawurlencode($ssrShareText);
                                @endphp
                                <a href="{{ $ssrWaUrl }}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.875rem; background: #16a34a; color: white; border-radius: 0.5rem; text-decoration: none; font-size: 0.8125rem; font-weight: 600;">
                                    Share WhatsApp
                                </a>
                                <a href="/surah/{{ $reactData['currentSurah']->number }}" style="color: #15803d; font-size: 0.875rem; font-weight: 600; text-decoration: none;">
                                    &larr; Lihat Seluruh Surah
                                </a>
                            </div>
                        </div>

                        <p class="arabic-text" style="font-size: 2.25rem; line-height: 2.3; color: #111827; text-align: right; margin: 0 0 1.25rem 0; direction: rtl;">
                            {{ $reactData['currentAyah']->text_arabic }}
                        </p>

                        @if(!empty($reactData['currentAyah']->text_latin))
                            <p style="font-size: 1.0625rem; color: #374151; line-height: 1.7; margin: 0 0 0.75rem 0; font-style: italic;">
                                {{ $reactData['currentAyah']->text_latin }}
                            </p>
                        @endif

                        @if(!empty($reactData['currentAyah']->text_indonesian))
                            <p style="font-size: 1.0625rem; color: #1f2937; line-height: 1.7; margin: 0;">
                                <strong>Artinya:</strong> {{ $reactData['currentAyah']->text_indonesian }}
                            </p>
                        @endif

                        <nav style="margin-top: 1.25rem; display: flex; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; border-top: 1px solid #bbf7d0; padding-top: 0.75rem;">
                            @if(isset($reactData['ayahNavigation']['prev']) && $reactData['ayahNavigation']['prev'])
                                <a href="/surah/{{ $reactData['currentSurah']->number }}#ayah-{{ $reactData['ayahNavigation']['prev'] }}" style="color: #166534; font-weight: 600; text-decoration: none;">&larr; Ayat {{ $reactData['ayahNavigation']['prev'] }}</a>
                            @else
                                <span></span>
                            @endif
                            @if(isset($reactData['ayahNavigation']['next']) && $reactData['ayahNavigation']['next'])
                                <a href="/surah/{{ $reactData['currentSurah']->number }}#ayah-{{ $reactData['ayahNavigation']['next'] }}" style="color: #166534; font-weight: 600; text-decoration: none;">Ayat {{ $reactData['ayahNavigation']['next'] }} &rarr;</a>
                            @endif
                        </nav>
                    </article>
                @endif

                @if(!empty($reactData['surahAyahs']) && $reactData['surahAyahs']->isNotEmpty())
                    <section id="ssr-surah-verses" style="margin-bottom: 2.5rem;">
                        <h3 style="font-size: 1.25rem; font-weight: 700; color: #14532d; margin: 0 0 1rem 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
                            Bacaan Ayat Surah {{ $reactData['currentSurah']->name_latin }}
                        </h3>
                        @foreach($reactData['surahAyahs'] as $ayah)
                            <article style="padding: 1.25rem 0; border-bottom: 1px solid #f3f4f6;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                                    <a href="/surah/{{ $reactData['currentSurah']->number }}/{{ $ayah->ayah_number }}" id="ayah-{{ $ayah->ayah_number }}" title="Baca Surah {{ $reactData['currentSurah']->name_latin }} Ayat {{ $ayah->ayah_number }}" style="display: inline-block; background: #e0f2fe; color: #0369a1; font-weight: 700; font-size: 0.875rem; padding: 0.25rem 0.75rem; border-radius: 9999px; text-decoration: none;">
                                        Ayat {{ $ayah->ayah_number }}
                                    </a>
                                </div>
                                <p class="arabic-text" style="font-size: 2rem; line-height: 2.2; color: #111827; text-align: right; margin: 0 0 0.75rem 0; direction: rtl;">
                                    {{ $ayah->text_arabic }}
                                </p>
                                @if(!empty($ayah->text_latin))
                                    <p style="font-size: 1rem; color: #4b5563; line-height: 1.6; margin: 0 0 0.5rem 0; font-style: italic;">
                                        {{ $ayah->text_latin }}
                                    </p>
                                @endif
                                @if(!empty($ayah->text_indonesian))
                                    <p style="font-size: 1rem; color: #1f2937; line-height: 1.6; margin: 0;">
                                        {{ $ayah->text_indonesian }}
                                    </p>
                                @endif
                            </article>
                        @endforeach
                    </section>
                @endif

                <div style="text-align: center; margin-top: 2rem;">
                    <a href="/" style="display: inline-block; padding: 0.75rem 1.5rem; background: #16a34a; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">&larr; Kembali ke Daftar Surah</a>
                </div>
            </div>
        @endif

        @if(isset($reactData['currentJuz']))
            <div id="ssr-juz-detail" style="padding: 3rem 1.5rem; background: #fff; color: #1f2937; max-width: 860px; margin: 0 auto;">
                <header style="text-align: center; margin-bottom: 2rem;">
                    <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 0.75rem; color: #111827;">{{ $reactData['currentJuz']['title'] }}</h1>
                    <p style="font-size: 1.0625rem; color: #4b5563; line-height: 1.8; margin: 0 auto 1rem; max-width: 700px;">{{ $reactData['currentJuz']['description'] }}</p>
                    @if(!empty($reactData['currentJuz']['metadata']))
                        <div style="display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem;">
                            <span style="display: inline-block; background: #f0fdf4; border: 1px solid #86efac; color: #15803d; font-size: 0.875rem; font-weight: 600; padding: 0.35rem 0.85rem; border-radius: 9999px;">
                                Halaman {{ $reactData['currentJuz']['metadata']['min_page'] }} - {{ $reactData['currentJuz']['metadata']['max_page'] }} (Total {{ $reactData['currentJuz']['metadata']['total_pages'] }} Halaman)
                            </span>
                            <span style="display: inline-block; background: #f0fdf4; border: 1px solid #86efac; color: #15803d; font-size: 0.875rem; font-weight: 600; padding: 0.35rem 0.85rem; border-radius: 9999px;">
                                Total {{ $reactData['currentJuz']['metadata']['total_ayahs'] }} Ayat
                            </span>
                        </div>
                    @endif
                </header>

                @if(!empty($reactData['currentJuz']['metadata']['surahs']))
                    <section style="margin: 0 auto 2rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem;">
                        <h2 style="font-size: 1.15rem; font-weight: 700; color: #14532d; margin: 0 0 0.75rem 0;">Daftar Surah dalam Juz {{ $reactData['currentJuz']['number'] }}</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.75rem;">
                            @foreach($reactData['currentJuz']['metadata']['surahs'] as $surahItem)
                                <a href="/surah/{{ $surahItem['surah_number'] }}" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; color: inherit;">
                                    <div>
                                        <strong style="color: #111827; font-size: 0.95rem;">Surah {{ $surahItem['name_latin'] }}</strong>
                                        <div style="font-size: 0.8125rem; color: #6b7280; margin-top: 0.2rem;">Ayat {{ $surahItem['from_ayah'] }} - {{ $surahItem['to_ayah'] }}</div>
                                    </div>
                                    <span class="arabic-text" style="font-size: 1.25rem; color: #15803d;">{{ $surahItem['name_arabic'] }}</span>
                                </a>
                            @endforeach
                        </div>
                    </section>
                @endif

                <!-- FAQ Section for Google Snippets on Juz -->
                @if(!empty($reactData['currentJuz']['metadata']))
                    <section style="margin: 0 auto 2rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.75rem; padding: 1.5rem;">
                        <h2 style="font-size: 1.2rem; font-weight: 700; color: #14532d; margin: 0 0 1rem 0;">
                            Pertanyaan Umum Seputar Juz {{ $reactData['currentJuz']['number'] }} (FAQ)
                        </h2>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <article>
                                <h3 style="font-size: 1rem; font-weight: 600; color: #166534; margin: 0 0 0.35rem 0;">
                                    Juz {{ $reactData['currentJuz']['number'] }} Al-Quran surah apa saja?
                                </h3>
                                <p style="font-size: 0.925rem; line-height: 1.6; color: #374151; margin: 0;">
                                    Juz {{ $reactData['currentJuz']['number'] }} memuat {{ $reactData['currentJuz']['metadata']['surahs_summary'] }}.
                                </p>
                            </article>
                            <article>
                                <h3 style="font-size: 1rem; font-weight: 600; color: #166534; margin: 0 0 0.35rem 0;">
                                    Juz {{ $reactData['currentJuz']['number'] }} berapa halaman dan dari halaman berapa sampai berapa?
                                </h3>
                                <p style="font-size: 0.925rem; line-height: 1.6; color: #374151; margin: 0;">
                                    Juz {{ $reactData['currentJuz']['number'] }} terdiri dari {{ $reactData['currentJuz']['metadata']['total_pages'] }} halaman, dimulai dari halaman {{ $reactData['currentJuz']['metadata']['min_page'] }} sampai halaman {{ $reactData['currentJuz']['metadata']['max_page'] }} pada mushaf standar Madinah dan standar Kementerian Agama RI.
                                </p>
                            </article>
                            <article>
                                <h3 style="font-size: 1rem; font-weight: 600; color: #166534; margin: 0 0 0.35rem 0;">
                                    Berapa jumlah ayat dalam Juz {{ $reactData['currentJuz']['number'] }}?
                                </h3>
                                <p style="font-size: 0.925rem; line-height: 1.6; color: #374151; margin: 0;">
                                    Juz {{ $reactData['currentJuz']['number'] }} memuat total {{ $reactData['currentJuz']['metadata']['total_ayahs'] }} ayat lengkap teks Arab, transliterasi latin, dan terjemahan bahasa Indonesia.
                                </p>
                            </article>
                        </div>
                    </section>
                @endif

                @if(!empty($reactData['currentJuz']['ayahs']) && $reactData['currentJuz']['ayahs']->isNotEmpty())
                    <section style="margin-bottom: 2rem;">
                        <h2 style="font-size: 1.25rem; font-weight: 700; color: #14532d; margin: 0 0 1rem 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
                            Ayat Pembuka Juz {{ $reactData['currentJuz']['number'] }}
                        </h2>
                        @foreach($reactData['currentJuz']['ayahs'] as $ayah)
                            <article style="padding: 1rem 0; border-bottom: 1px solid #f3f4f6;">
                                <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem; font-weight: 600;">
                                    <a href="/surah/{{ $ayah->surah_number }}/{{ $ayah->ayah_number }}" style="color: #0369a1; text-decoration: none;">
                                        {{ $ayah->surah->name_latin ?? 'Surah' }} ayat {{ $ayah->ayah_number }}
                                    </a>
                                </div>
                                <p class="arabic-text" style="font-size: 1.85rem; line-height: 2.1; color: #111827; text-align: right; margin: 0 0 0.5rem 0; direction: rtl;">
                                    {{ $ayah->text_arabic }}
                                </p>
                                @if(!empty($ayah->text_latin))
                                    <p style="font-size: 0.95rem; color: #4b5563; line-height: 1.6; margin: 0 0 0.35rem 0; font-style: italic;">
                                        {{ $ayah->text_latin }}
                                    </p>
                                @endif
                                @if(!empty($ayah->text_indonesian))
                                    <p style="font-size: 0.95rem; color: #1f2937; line-height: 1.6; margin: 0;">
                                        {{ $ayah->text_indonesian }}
                                    </p>
                                @endif
                            </article>
                        @endforeach
                    </section>
                @endif

                <div style="text-align: center;">
                    <a href="/juz" style="display: inline-block; padding: 0.75rem 1.5rem; background: #16a34a; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">&larr; Kembali ke Daftar Juz</a>
                </div>
            </div>
        @endif

        @if(isset($reactData['juzList']))
            <div id="ssr-juz-list" style="padding: 3rem 1.5rem; background: #fff; color: #1f2937; max-width: 960px; margin: 0 auto;">
                <header style="text-align: center; margin-bottom: 2.5rem;">
                    <h1 style="font-size: 2.25rem; font-weight: 800; margin-bottom: 0.75rem; color: #111827;">Daftar 30 Juz Al-Quran Lengkap</h1>
                    <p style="font-size: 1.0625rem; color: #4b5563; line-height: 1.8; margin: 0 auto; max-width: 750px;">
                        Al-Quran terdiri dari 30 Juz, 114 Surah, dan 6.236 Ayat yang terbagi dalam 604 halaman mushaf standar rasm Utsmani Madinah dan standar Kemenag RI. Pilih juz di bawah untuk membaca lengkap teks Arab, latin, terjemahan, dan audio murottal.
                    </p>
                </header>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 2.5rem;">
                    @foreach($reactData['juzList'] as $jNum => $jItem)
                        <a href="/juz/{{ $jNum }}" style="display: block; padding: 1rem 1.25rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; color: inherit; transition: border-color 0.2s;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                                <strong style="color: #15803d; font-size: 1.05rem;">Juz {{ $jNum }}</strong>
                                <span style="font-size: 0.8rem; background: #e0f2fe; color: #0369a1; padding: 0.2rem 0.5rem; border-radius: 9999px; font-weight: 600;">Hal. {{ $jItem['min_page'] }}-{{ $jItem['max_page'] }}</span>
                            </div>
                            <div style="font-size: 0.875rem; color: #374151; font-weight: 500;">{{ $jItem['surah_names'] }}</div>
                            <div style="font-size: 0.8rem; color: #6b7280; margin-top: 0.25rem;">{{ $jItem['total_pages'] }} Halaman • {{ $jItem['total_ayahs'] }} Ayat</div>
                        </a>
                    @endforeach
                </div>

                <!-- FAQ Section for 30 Juz / 1 Juz Berapa Halaman -->
                <section style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.75rem; padding: 2rem;">
                    <h2 style="font-size: 1.35rem; font-weight: 700; color: #14532d; margin: 0 0 1.25rem 0; text-align: center;">
                        Pertanyaan Umum Seputar 30 Juz Al-Quran (FAQ)
                    </h2>
                    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <article>
                            <h3 style="font-size: 1.05rem; font-weight: 600; color: #166534; margin: 0 0 0.35rem 0;">
                                30 juz berapa halaman dalam Al-Quran?
                            </h3>
                            <p style="font-size: 0.95rem; line-height: 1.6; color: #374151; margin: 0;">
                                Al-Quran 30 juz terdiri dari total <strong>604 halaman</strong> pada mushaf standar rasm Utsmani Madinah dan mushaf standar Kementerian Agama Republik Indonesia (Kemenag RI).
                            </p>
                        </article>
                        <article>
                            <h3 style="font-size: 1.05rem; font-weight: 600; color: #166534; margin: 0 0 0.35rem 0;">
                                1 juz berapa halaman dalam Al-Quran?
                            </h3>
                            <p style="font-size: 0.95rem; line-height: 1.6; color: #374151; margin: 0;">
                                Rata-rata 1 juz Al-Quran terdiri dari <strong>20 halaman</strong> (10 lembar bolak-balik), kecuali Juz 1 yang terdiri dari 21 halaman dan Juz 30 yang terdiri dari 23 halaman.
                            </p>
                        </article>
                        <article>
                            <h3 style="font-size: 1.05rem; font-weight: 600; color: #166534; margin: 0 0 0.35rem 0;">
                                Ada berapa juz, surah, dan ayat dalam Al-Quran?
                            </h3>
                            <p style="font-size: 0.95rem; line-height: 1.6; color: #374151; margin: 0;">
                                Kitab suci Al-Quran terdiri dari <strong>30 Juz</strong>, <strong>114 Surah</strong>, dan <strong>6.236 Ayat</strong>.
                            </p>
                        </article>
                        <article>
                            <h3 style="font-size: 1.05rem; font-weight: 600; color: #166534; margin: 0 0 0.35rem 0;">
                                Apa fungsi pembagian juz dalam Al-Quran?
                            </h3>
                            <p style="font-size: 0.95rem; line-height: 1.6; color: #374151; margin: 0;">
                                Pembagian 30 juz dibuat untuk memudahkan umat Islam menyelesaikan tilawah (khatam) Al-Quran secara teratur, khususnya membaca satu juz setiap hari selama satu bulan penuh seperti pada bulan Ramadhan (program One Day One Juz).
                            </p>
                        </article>
                    </div>
                </section>
            </div>
        @endif

        @if(isset($reactData['currentPage']))
            <div id="ssr-page-detail" style="padding: 3rem 1.5rem; background: #fff; color: #1f2937; max-width: 860px; margin: 0 auto;">
                <header style="text-align: center; margin-bottom: 2rem;">
                    <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 0.75rem; color: #111827;">{{ $reactData['currentPage']['title'] }}</h1>
                    <p style="font-size: 1.0625rem; color: #4b5563; line-height: 1.8; margin: 0 auto; max-width: 700px;">{{ $reactData['currentPage']['description'] }}</p>
                    <div style="display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem;">
                        <span style="display: inline-block; background: #f0fdf4; border: 1px solid #86efac; color: #15803d; font-size: 0.875rem; font-weight: 600; padding: 0.35rem 0.85rem; border-radius: 9999px;">
                            Juz {{ $reactData['currentPage']['juz_number'] ?? '1' }}
                        </span>
                        <span style="display: inline-block; background: #f0fdf4; border: 1px solid #86efac; color: #15803d; font-size: 0.875rem; font-weight: 600; padding: 0.35rem 0.85rem; border-radius: 9999px;">
                            Muka Surat {{ $reactData['currentPage']['number'] }}
                        </span>
                    </div>
                </header>

                @if(!empty($reactData['currentPage']['has_ssr_content']) && !empty($reactData['currentPage']['surah_spans']))
                    <section style="margin: 0 auto 1.5rem; max-width: 860px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1rem 1.25rem;">
                        <h2 style="font-size: 1.125rem; font-weight: 700; color: #14532d; margin: 0 0 0.75rem 0;">Kandungan Halaman {{ $reactData['currentPage']['number'] }}</h2>
                        <ul style="margin: 0; padding-left: 1.25rem; color: #374151; line-height: 1.7;">
                            @foreach($reactData['currentPage']['surah_spans'] as $span)
                                <li>
                                    Surah {{ $span['surah_name_latin'] }} ({{ $span['surah_name_arabic'] }}) ayat {{ $span['from_ayah'] }}-{{ $span['to_ayah'] }}
                                    <a href="/surah/{{ $span['surah_number'] }}/{{ $span['from_ayah'] }}" style="margin-left: 0.5rem; color: #166534; text-decoration: none; font-weight: 600;">Baca Ayat</a>
                                </li>
                            @endforeach
                        </ul>
                    </section>

                    <!-- FAQ Section for Halaman -->
                    <section style="margin: 0 auto 1.5rem; max-width: 860px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.75rem; padding: 1.25rem;">
                        <h2 style="font-size: 1.125rem; font-weight: 700; color: #14532d; margin: 0 0 0.75rem 0;">
                            Pertanyaan Umum Halaman {{ $reactData['currentPage']['number'] }} (FAQ)
                        </h2>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <article>
                                <h3 style="font-size: 0.95rem; font-weight: 600; color: #166534; margin: 0 0 0.25rem 0;">
                                    Al-Quran Halaman {{ $reactData['currentPage']['number'] }} (muka surat {{ $reactData['currentPage']['number'] }}) memuat surah apa saja?
                                </h3>
                                <p style="font-size: 0.9rem; line-height: 1.6; color: #374151; margin: 0;">
                                    Halaman {{ $reactData['currentPage']['number'] }} memuat {{ $reactData['currentPage']['description'] ?? 'ayat-ayat suci Al-Quran' }}.
                                </p>
                            </article>
                            <article>
                                <h3 style="font-size: 0.95rem; font-weight: 600; color: #166534; margin: 0 0 0.25rem 0;">
                                    Halaman {{ $reactData['currentPage']['number'] }} Al-Quran berada di Juz berapa?
                                </h3>
                                <p style="font-size: 0.9rem; line-height: 1.6; color: #374151; margin: 0;">
                                    Halaman {{ $reactData['currentPage']['number'] }} terletak pada Al-Quran Juz {{ $reactData['currentPage']['juz_number'] ?? '1' }}.
                                </p>
                            </article>
                        </div>
                    </section>

                    @if(!empty($reactData['currentPage']['ayah_previews']))
                        <section style="margin: 0 auto 1.5rem; max-width: 860px; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; background: #ffffff;">
                            <h2 style="font-size: 1.125rem; font-weight: 700; color: #14532d; margin: 0 0 1rem 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">
                                Teks Lengkap Ayat Halaman {{ $reactData['currentPage']['number'] }}
                            </h2>
                            @foreach($reactData['currentPage']['ayah_previews'] as $ayah)
                                <article style="padding: 1rem 0; border-bottom: 1px solid #f3f4f6;">
                                    <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.35rem; font-weight: 600;">
                                        <a href="/surah/{{ $ayah->surah_number }}/{{ $ayah->ayah_number }}" style="color: #0369a1; text-decoration: none;">
                                            {{ $ayah->surah->name_latin ?? 'Surah' }} ayat {{ $ayah->ayah_number }}
                                        </a>
                                    </div>
                                    <p class="arabic-text" style="font-size: 1.85rem; line-height: 2.1; color: #111827; margin: 0 0 0.5rem 0; direction: rtl; text-align: right;">{{ $ayah->text_arabic }}</p>
                                    @if(!empty($ayah->text_latin))
                                        <p style="font-size: 0.95rem; color: #4b5563; line-height: 1.6; margin: 0 0 0.35rem 0; font-style: italic;">
                                            {{ $ayah->text_latin }}
                                        </p>
                                    @endif
                                    @if(!empty($ayah->text_indonesian))
                                        <p style="font-size: 0.95rem; color: #374151; line-height: 1.6; margin: 0;">
                                            {{ $ayah->text_indonesian }}
                                        </p>
                                    @endif
                                </article>
                            @endforeach
                        </section>
                    @endif
                @endif

                <nav aria-label="Navigasi Halaman Mushaf" style="display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; gap: 0.5rem; flex-wrap: wrap;">
                    @if($reactData['currentPage']['number'] > 1)
                        <a href="/halaman/{{ $reactData['currentPage']['number'] - 1 }}" style="padding: 0.6rem 1.2rem; background: #f3f4f6; color: #1f2937; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
                            &larr; Halaman {{ $reactData['currentPage']['number'] - 1 }}
                        </a>
                    @else
                        <span></span>
                    @endif

                    <a href="/halaman" style="padding: 0.6rem 1.2rem; background: #16a34a; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
                        Semua Halaman
                    </a>

                    @if($reactData['currentPage']['number'] < 604)
                        <a href="/halaman/{{ $reactData['currentPage']['number'] + 1 }}" style="padding: 0.6rem 1.2rem; background: #f3f4f6; color: #1f2937; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
                            Halaman {{ $reactData['currentPage']['number'] + 1 }} &rarr;
                        </a>
                    @else
                        <span></span>
                    @endif
                </nav>
            </div>
        @endif

        @if(isset($reactData['halamanList']))
            <div id="ssr-halaman-list" style="padding: 3rem 1.5rem; background: #fff; color: #1f2937; max-width: 960px; margin: 0 auto;">
                <header style="text-align: center; margin-bottom: 2.5rem;">
                    <h1 style="font-size: 2.25rem; font-weight: 800; margin-bottom: 0.75rem; color: #111827;">Daftar 604 Halaman Al-Quran Mushaf Madinah</h1>
                    <p style="font-size: 1.0625rem; color: #4b5563; line-height: 1.8; margin: 0 auto; max-width: 750px;">
                        Akses mushaf Al-Quran standar Madinah dan standar Kemenag RI dari Halaman 1 hingga 604. Dilengkapi navigasi per juz, teks Arab berharakat jelas, transliterasi latin, terjemahan Indonesia, dan audio murottal per ayat.
                    </p>
                </header>

                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 2.5rem;">
                    <h2 style="font-size: 1.15rem; font-weight: 700; color: #14532d; margin: 0 0 1rem 0;">Navigasi Cepat Halaman Awal Tiap Juz (1 - 30)</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.5rem;">
                        @foreach($reactData['halamanList']['juz_metadata'] as $jNum => $jMeta)
                            <a href="/halaman/{{ $jMeta['min_page'] }}" style="display: block; text-align: center; padding: 0.5rem 0.75rem; background: white; border: 1px solid #d1d5db; border-radius: 0.375rem; text-decoration: none; color: #1f2937; font-size: 0.85rem;">
                                <strong>Juz {{ $jNum }}</strong>: Hal. {{ $jMeta['min_page'] }}
                            </a>
                        @endforeach
                    </div>
                </div>

                <!-- FAQ Section for Halaman -->
                <section style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.75rem; padding: 2rem;">
                    <h2 style="font-size: 1.35rem; font-weight: 700; color: #14532d; margin: 0 0 1.25rem 0; text-align: center;">
                        Pertanyaan Umum Seputar Halaman Al-Quran (FAQ)
                    </h2>
                    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <article>
                            <h3 style="font-size: 1.05rem; font-weight: 600; color: #166534; margin: 0 0 0.35rem 0;">
                                Berapa jumlah halaman dalam Al-Quran 30 juz?
                            </h3>
                            <p style="font-size: 0.95rem; line-height: 1.6; color: #374151; margin: 0;">
                                Mushaf Al-Quran standar internasional (mushaf Madinah rasm Utsmani) dan standar Kementerian Agama Republik Indonesia memiliki <strong>604 halaman</strong>.
                            </p>
                        </article>
                        <article>
                            <h3 style="font-size: 1.05rem; font-weight: 600; color: #166534; margin: 0 0 0.35rem 0;">
                                Berapa lembar dalam Al-Quran 604 halaman?
                            </h3>
                            <p style="font-size: 0.95rem; line-height: 1.6; color: #374151; margin: 0;">
                                Karena setiap lembar terdiri dari dua halaman (depan dan belakang), maka Al-Quran 604 halaman terdiri dari <strong>302 lembar</strong>.
                            </p>
                        </article>
                        <article>
                            <h3 style="font-size: 1.05rem; font-weight: 600; color: #166534; margin: 0 0 0.35rem 0;">
                                Apa keuntungan membaca Al-Quran per halaman di IndoQuran?
                            </h3>
                            <p style="font-size: 0.95rem; line-height: 1.6; color: #374151; margin: 0;">
                                Membaca per halaman memudahkan bagi pembaca yang terbiasa dengan mushaf cetak standar Madinah (mushaf pojok). Setiap halaman di IndoQuran menyajikan ayat yang persis sama dengan mushaf cetak, dilengkapi fitur audio murottal dan terjemahan Indonesia per ayat.
                            </p>
                        </article>
                    </div>
                </section>
            </div>
        @endif

        @if(isset($reactData['currentArticle']) && $reactData['currentArticle'])
            <div id="ssr-article-detail" style="padding: 3rem 1.5rem; background: #fff; color: #1f2937; max-width: 860px; margin: 0 auto; line-height: 1.8;">
                <nav aria-label="Breadcrumb" style="margin-bottom: 1.5rem; font-size: 0.875rem; color: #4b5563;">
                    <a href="/" style="color: #16a34a; text-decoration: none;">Beranda</a>
                    <span style="margin: 0 0.5rem; color: #9ca3af;">/</span>
                    <a href="/artikel" style="color: #16a34a; text-decoration: none;">Artikel</a>
                    <span style="margin: 0 0.5rem; color: #9ca3af;">/</span>
                    <span style="color: #111827; font-weight: 600;">{{ $reactData['currentArticle']->title }}</span>
                </nav>

                <article>
                    <header style="margin-bottom: 2rem;">
                        <h1 style="font-size: 2.25rem; font-weight: 800; line-height: 1.3; color: #111827; margin-bottom: 1rem;">
                            {{ $reactData['currentArticle']->title }}
                        </h1>

                        <div style="display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.875rem; color: #6b7280; margin-bottom: 1.25rem;">
                            <span>✍️ {{ $reactData['currentArticle']->author->name ?? 'Redaksi IndoQuran' }}</span>
                            <span>📅 <time datetime="{{ $reactData['currentArticle']->published_at ? $reactData['currentArticle']->published_at->toIso8601String() : '' }}">{{ $reactData['currentArticle']->formatted_date ?? ($reactData['currentArticle']->published_at ? $reactData['currentArticle']->published_at->format('d M Y') : '') }}</time></span>
                            <span>⏱️ {{ $reactData['currentArticle']->reading_time }} menit baca</span>
                        </div>

                        @if($reactData['currentArticle']->tags && $reactData['currentArticle']->tags->isNotEmpty())
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
                                @foreach($reactData['currentArticle']->tags as $tag)
                                    <a href="/artikel?tag={{ $tag->slug }}" style="display: inline-block; background: #dcfce7; color: #15803d; font-size: 0.8125rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; text-decoration: none;">
                                        #{{ $tag->name }}
                                    </a>
                                @endforeach
                            </div>
                        @endif
                    </header>

                    @if($reactData['currentArticle']->featured_image_url || $reactData['currentArticle']->featured_image)
                        <figure style="margin: 0 0 2rem 0;">
                            <img 
                                src="{{ $reactData['currentArticle']->featured_image_url ?? asset('storage/' . $reactData['currentArticle']->featured_image) }}" 
                                alt="{{ $reactData['currentArticle']->title }}" 
                                style="width: 100%; max-height: 480px; object-fit: cover; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" 
                            />
                        </figure>
                    @endif

                    @if(!empty(trim($reactData['currentArticle']->excerpt ?? '')))
                        <div class="article-excerpt" style="font-size: 1.125rem; font-weight: 500; line-height: 1.75; color: #374151; margin-bottom: 2rem; padding: 1.25rem 1.5rem; background: #f0fdf4; border: 1px solid #dcfce7; border-left: 4px solid #16a34a; border-radius: 0 0.75rem 0.75rem 0; font-style: italic;">
                            {{ trim($reactData['currentArticle']->excerpt) }}
                        </div>
                    @endif

                    <div class="article-body" style="font-size: 1.125rem; color: #374151; margin-bottom: 3rem;">
                        {!! $reactData['currentArticle']->content !!}
                    </div>

                    @if(!empty($reactData['relatedArticles']) && $reactData['relatedArticles']->isNotEmpty())
                        <section style="border-top: 2px solid #f3f4f6; padding-top: 2rem; margin-top: 2rem;">
                            <h2 style="font-size: 1.5rem; font-weight: 700; color: #111827; margin-bottom: 1.25rem;">Artikel Terkait</h2>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem;">
                                @foreach($reactData['relatedArticles'] as $related)
                                    <a href="/artikel/{{ $related->slug }}" style="display: block; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; color: inherit; background: #f9fafb;">
                                        <h3 style="font-size: 1rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">{{ $related->title }}</h3>
                                        <p style="font-size: 0.875rem; color: #6b7280; margin: 0;">{{ Str::limit(strip_tags($related->excerpt ?: $related->content), 80) }}</p>
                                    </a>
                                @endforeach
                            </div>
                        </section>
                    @endif

                    <div style="text-align: center; margin-top: 2.5rem;">
                        <a href="/artikel" style="display: inline-block; padding: 0.75rem 1.5rem; background: #16a34a; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">&larr; Lihat Semua Artikel</a>
                    </div>
                </article>
            </div>
        @endif

        @if(isset($reactData['articles']) && $reactData['articles']->isNotEmpty())
            <div id="ssr-article-list" style="padding: 3rem 1.5rem; background: #fff; color: #1f2937; max-width: 1100px; margin: 0 auto;">
                <header style="text-align: center; margin-bottom: 2.5rem;">
                    <h1 style="font-size: 2.25rem; font-weight: 800; color: #166534; margin-bottom: 0.75rem;">Artikel Islami & Kajian Al-Quran</h1>
                    <p style="font-size: 1.125rem; color: #4b5563; max-width: 700px; margin: 0 auto;">Kumpulan artikel pilihan, kajian Al-Quran, tafsir, dan pengetahuan Islam untuk memperdalam keimanan dan wawasan religi Anda.</p>
                </header>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
                    @foreach($reactData['articles'] as $art)
                        <article style="border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
                            @if($art->featured_image_url || $art->featured_image)
                                <img src="{{ $art->featured_image_url ?? asset('storage/' . $art->featured_image) }}" alt="{{ $art->title }}" style="width: 100%; height: 180px; object-fit: cover;" loading="lazy" />
                            @endif
                            <div style="padding: 1.25rem; flex: 1; display: flex; flex-direction: column;">
                                <h2 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0; line-height: 1.4;">
                                    <a href="/artikel/{{ $art->slug }}" style="color: #111827; text-decoration: none;">{{ $art->title }}</a>
                                </h2>
                                <p style="font-size: 0.875rem; color: #4b5563; line-height: 1.6; margin: 0 0 1rem 0; flex: 1;">
                                    {{ Str::limit(strip_tags($art->excerpt ?: $art->content), 120) }}
                                </p>
                                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8125rem; color: #6b7280; border-top: 1px solid #f3f4f6; padding-top: 0.75rem;">
                                    <span>{{ $art->formatted_date ?? ($art->published_at ? $art->published_at->format('d M Y') : '') }}</span>
                                    <a href="/artikel/{{ $art->slug }}" style="color: #16a34a; font-weight: 600; text-decoration: none;">Baca Selengkapnya &rarr;</a>
                                </div>
                            </div>
                        </article>
                    @endforeach
                </div>
            </div>
        @endif

        @if(isset($reactData['currentTafsirTopic']) && $reactData['currentTafsirTopic'])
            <div id="ssr-tafsir-detail" style="padding: 3rem 1.5rem; background: #fff; color: #1f2937; max-width: 860px; margin: 0 auto; line-height: 1.8;">
                <nav aria-label="Breadcrumb" style="margin-bottom: 1.5rem; font-size: 0.875rem; color: #4b5563;">
                    <a href="/" style="color: #16a34a; text-decoration: none;">Beranda</a>
                    <span style="margin: 0 0.5rem; color: #9ca3af;">/</span>
                    <a href="/tafsir-maudhui" style="color: #16a34a; text-decoration: none;">Tafsir Maudhui</a>
                    <span style="margin: 0 0.5rem; color: #9ca3af;">/</span>
                    <span style="color: #111827; font-weight: 600;">{{ $reactData['currentTafsirTopic']->topic }}</span>
                </nav>

                <article>
                    <header style="margin-bottom: 2rem;">
                        <h1 style="font-size: 2.25rem; font-weight: 800; line-height: 1.3; color: #111827; margin-bottom: 1rem;">
                            Tafsir Maudhui: {{ $reactData['currentTafsirTopic']->topic }}
                        </h1>
                        @if(!empty($reactData['currentTafsirTopic']->description))
                            <p style="font-size: 1.125rem; color: #4b5563; line-height: 1.7; background: #f9fafb; padding: 1.25rem; border-radius: 0.75rem; border: 1px solid #e5e7eb;">
                                {{ $reactData['currentTafsirTopic']->description }}
                            </p>
                        @endif
                    </header>

                    @if(!empty($reactData['currentTafsirTopic']->verses) && $reactData['currentTafsirTopic']->verses->isNotEmpty())
                        <section style="margin-top: 2rem;">
                            <h2 style="font-size: 1.25rem; font-weight: 700; color: #14532d; margin-bottom: 1rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
                                Ayat-ayat Terkait ({{ $reactData['currentTafsirTopic']->verses->count() }} Ayat)
                            </h2>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.75rem;">
                                @foreach($reactData['currentTafsirTopic']->verses as $verse)
                                    <a href="/surah/{{ $verse->surah_number }}/{{ $verse->ayah_number }}" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; color: #1f2937; background: #fdfdfd;">
                                        <span style="font-weight: 600; color: #15803d;">Surah {{ $verse->surah_number }}, Ayat {{ $verse->ayah_number }}</span>
                                        <span style="font-size: 0.8125rem; color: #6b7280;">Buka &rarr;</span>
                                    </a>
                                @endforeach
                            </div>
                        </section>
                    @endif

                    <div style="text-align: center; margin-top: 2.5rem;">
                        <a href="/tafsir-maudhui" style="display: inline-block; padding: 0.75rem 1.5rem; background: #16a34a; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">&larr; Lihat Semua Topik Tafsir</a>
                    </div>
                </article>
            </div>
        @endif

        @if(isset($reactData['haditsHub']))
            <div id="ssr-hadits-hub" style="padding: 3rem 1.5rem; background: #fff; color: #1f2937; max-width: 1200px; margin: 0 auto;">
                <nav aria-label="Breadcrumb" style="margin-bottom: 1.5rem; font-size: 0.875rem; color: #4b5563;">
                    <a href="/" style="color: #16a34a; text-decoration: none;">Beranda</a>
                    <span style="margin: 0 0.5rem; color: #9ca3af;">/</span>
                    <span style="color: #111827; font-weight: 600;">Hadits Shahih Online</span>
                </nav>

                <header style="text-align: center; margin-bottom: 2.5rem;">
                    <h1 style="font-size: 2.25rem; font-weight: 800; color: #166534; margin-bottom: 0.75rem;">
                        Koleksi 7 Kitab Hadits Shahih Online
                    </h1>
                    <p style="font-size: 1.125rem; color: #4b5563; max-width: 800px; margin: 0 auto; line-height: 1.7;">
                        Baca dan cari hadits shahih nabawi online dari Kutubus Sittah dan Musnad Ahmad. Dilengkapi teks Arab berharakat, nomor hadits, dan terjemahan bahasa Indonesia lengkap.
                    </p>
                </header>

                @if(!empty($reactData['haditsHub']['topics']))
                    <section style="margin-bottom: 2.5rem; padding: 1.5rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem;">
                        <h2 style="font-size: 1.125rem; font-weight: 700; color: #14532d; margin: 0 0 1rem 0;">
                            Topik & Hadits Tematik Pilihan
                        </h2>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            @foreach($reactData['haditsHub']['topics'] as $topic)
                                <a href="/hadits/tentang/{{ $topic['slug'] }}" style="display: inline-block; padding: 0.5rem 1rem; background: #ffffff; border: 1px solid #d1d5db; color: #15803d; border-radius: 9999px; text-decoration: none; font-size: 0.875rem; font-weight: 600; transition: all 0.2s;">
                                    Hadits Tentang {{ $topic['name'] }}
                                </a>
                            @endforeach
                        </div>
                    </section>
                @endif

                <section style="margin-bottom: 3rem;">
                    <h2 style="font-size: 1.35rem; font-weight: 700; color: #111827; margin: 0 0 1.25rem 0;">
                        7 Kitab Induk Hadits Nabawi
                    </h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem;">
                        @foreach($reactData['haditsHub']['kitabs'] as $kitab)
                            <article style="border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;">
                                <div>
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                                        <h3 style="font-size: 1.25rem; font-weight: 700; margin: 0;">
                                            <a href="/hadits/{{ $kitab['slug'] }}" style="color: #111827; text-decoration: none;">
                                                Hadits {{ $kitab['name'] }}
                                            </a>
                                        </h3>
                                        <span class="arabic-text" style="font-size: 1.5rem; color: #166534; direction: rtl;">
                                            {{ $kitab['arab'] }}
                                        </span>
                                    </div>
                                    <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">
                                        {{ $kitab['author'] }} • <span style="font-weight: 600; color: #15803d;">{{ number_format($kitab['total'], 0, ',', '.') }} Hadits</span>
                                    </div>
                                    <p style="font-size: 0.9375rem; color: #4b5563; line-height: 1.6; margin: 0 0 1rem 0;">
                                        {{ $kitab['description'] }}
                                    </p>
                                </div>
                                <div style="border-top: 1px solid #f3f4f6; padding-top: 0.75rem;">
                                    <a href="/hadits/{{ $kitab['slug'] }}" style="color: #16a34a; font-weight: 600; text-decoration: none; font-size: 0.875rem; display: inline-flex; align-items: center; gap: 0.25rem;">
                                        Buka Kitab {{ $kitab['name'] }} &rarr;
                                    </a>
                                </div>
                            </article>
                        @endforeach
                    </div>
                </section>
            </div>
        @endif

        @if(isset($reactData['haditsKitab']))
            <div id="ssr-hadits-kitab" style="padding: 3rem 1.5rem; background: #fff; color: #1f2937; max-width: 900px; margin: 0 auto;">
                <nav aria-label="Breadcrumb" style="margin-bottom: 1.5rem; font-size: 0.875rem; color: #4b5563;">
                    <a href="/" style="color: #16a34a; text-decoration: none;">Beranda</a>
                    <span style="margin: 0 0.5rem; color: #9ca3af;">/</span>
                    <a href="/hadits" style="color: #16a34a; text-decoration: none;">Hadits</a>
                    <span style="margin: 0 0.5rem; color: #9ca3af;">/</span>
                    <span style="color: #111827; font-weight: 600;">Hadits {{ $reactData['haditsKitab']['kitab']['name'] }}</span>
                </nav>

                <header style="text-align: center; margin-bottom: 2.5rem;">
                    <h1 style="font-size: 2.25rem; font-weight: 800; color: #111827; margin-bottom: 0.5rem;">
                        Hadits {{ $reactData['haditsKitab']['kitab']['name'] }} Online
                    </h1>
                    <h2 class="arabic-text" style="font-size: 2.5rem; color: #166534; margin: 0.5rem 0;">
                        {{ $reactData['haditsKitab']['kitab']['arab'] }}
                    </h2>
                    <div style="font-size: 1rem; color: #4b5563; background: #f3f4f6; display: inline-block; padding: 0.5rem 1.25rem; border-radius: 9999px; font-weight: 500; margin-top: 0.5rem;">
                        {{ $reactData['haditsKitab']['kitab']['author'] }} • Total {{ number_format($reactData['haditsKitab']['kitab']['total'], 0, ',', '.') }} Hadits • {{ $reactData['haditsKitab']['kitab']['category_label'] }}
                    </div>
                    <p style="font-size: 1.0625rem; color: #4b5563; margin-top: 1rem; max-width: 750px; margin-left: auto; margin-right: auto; line-height: 1.7;">
                        {{ $reactData['haditsKitab']['kitab']['description'] }}
                    </p>
                </header>

                @if(!empty($reactData['haditsKitab']['hadiths']))
                    <section style="margin-bottom: 2.5rem;">
                        <h3 style="font-size: 1.25rem; font-weight: 700; color: #14532d; margin: 0 0 1rem 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
                            Daftar Bacaan Hadits {{ $reactData['haditsKitab']['kitab']['name'] }}
                        </h3>
                        @foreach($reactData['haditsKitab']['hadiths'] as $item)
                            <article style="padding: 1.25rem 0; border-bottom: 1px solid #f3f4f6;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                                    <span style="display: inline-block; background: #e0f2fe; color: #0369a1; font-weight: 700; font-size: 0.875rem; padding: 0.25rem 0.75rem; border-radius: 9999px;">
                                        Hadits No. {{ data_get($item, 'no') }}
                                    </span>
                                    @if(!empty(data_get($item, 'kategori')))
                                        <span style="font-size: 0.8125rem; color: #6b7280; font-style: italic;">
                                            {{ data_get($item, 'kategori') }}
                                        </span>
                                    @endif
                                </div>
                                <p class="arabic-text" style="font-size: 1.85rem; line-height: 2.2; color: #111827; text-align: right; margin: 0 0 0.75rem 0; direction: rtl;">
                                    {{ data_get($item, 'arab') }}
                                </p>
                                <p style="font-size: 1rem; color: #1f2937; line-height: 1.6; margin: 0 0 0.5rem 0;">
                                    <strong>Terjemahan:</strong> {{ Str::limit(data_get($item, 'indonesia'), 280) }}
                                </p>
                                <a href="/hadits/{{ $reactData['haditsKitab']['kitab']['slug'] }}/{{ data_get($item, 'no') }}" style="color: #16a34a; font-weight: 600; text-decoration: none; font-size: 0.875rem;">
                                    Baca Selengkapnya &rarr;
                                </a>
                            </article>
                        @endforeach
                    </section>
                @endif

                <div style="text-align: center; margin-top: 2rem;">
                    <a href="/hadits" style="display: inline-block; padding: 0.75rem 1.5rem; background: #16a34a; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">
                        &larr; Kembali ke Koleksi Kitab Hadits
                    </a>
                </div>
            </div>
        @endif

        @if(isset($reactData['haditsDetail']))
            <div id="ssr-hadits-detail" style="padding: 3rem 1.5rem; background: #fff; color: #1f2937; max-width: 860px; margin: 0 auto; line-height: 1.8;">
                <nav aria-label="Breadcrumb" style="margin-bottom: 1.5rem; font-size: 0.875rem; color: #4b5563;">
                    <a href="/" style="color: #16a34a; text-decoration: none;">Beranda</a>
                    <span style="margin: 0 0.5rem; color: #9ca3af;">/</span>
                    <a href="/hadits" style="color: #16a34a; text-decoration: none;">Hadits</a>
                    <span style="margin: 0 0.5rem; color: #9ca3af;">/</span>
                    <a href="/hadits/{{ $reactData['haditsDetail']['kitab']['slug'] }}" style="color: #16a34a; text-decoration: none;">{{ $reactData['haditsDetail']['kitab']['name'] }}</a>
                    <span style="margin: 0 0.5rem; color: #9ca3af;">/</span>
                    <span style="color: #111827; font-weight: 600;">No. {{ data_get($reactData['haditsDetail']['hadits'], 'no') }}</span>
                </nav>

                <article>
                    <header style="text-align: center; margin-bottom: 2rem;">
                        <h1 style="font-size: 2rem; font-weight: 800; color: #111827; margin-bottom: 0.5rem;">
                            Hadits {{ $reactData['haditsDetail']['kitab']['name'] }} Nomor {{ data_get($reactData['haditsDetail']['hadits'], 'no') }}
                        </h1>
                        @if(!empty(data_get($reactData['haditsDetail']['hadits'], 'kategori')))
                            <div style="font-size: 0.9375rem; color: #15803d; font-weight: 600; background: #dcfce7; display: inline-block; padding: 0.35rem 1rem; border-radius: 9999px;">
                                {{ data_get($reactData['haditsDetail']['hadits'], 'kategori') }}
                            </div>
                        @endif
                    </header>

                    <div style="border: 2px solid #22c55e; border-radius: 0.75rem; padding: 1.5rem; background: #f0fdf4; margin-bottom: 2rem;">
                        <p class="arabic-text" style="font-size: 2.25rem; line-height: 2.3; color: #111827; text-align: right; margin: 0 0 1.25rem 0; direction: rtl;">
                            {{ data_get($reactData['haditsDetail']['hadits'], 'arab') }}
                        </p>

                        <div style="font-size: 1.0625rem; color: #1f2937; line-height: 1.8; margin-top: 1rem; border-top: 1px solid #bbf7d0; padding-top: 1rem;">
                            <strong style="color: #14532d;">Terjemahan:</strong>
                            <p style="margin: 0.5rem 0 0 0;">{{ data_get($reactData['haditsDetail']['hadits'], 'indonesia') }}</p>
                        </div>

                        @if(!empty(data_get($reactData['haditsDetail']['hadits'], 'penjelasan')))
                            <div style="font-size: 1rem; color: #374151; line-height: 1.7; margin-top: 1.25rem; background: #ffffff; padding: 1rem 1.25rem; border-radius: 0.5rem; border: 1px solid #d1fae5;">
                                <strong style="color: #065f46;">Penjelasan & Makna Hadits:</strong>
                                <p style="margin: 0.5rem 0 0 0;">{!! strip_tags(data_get($reactData['haditsDetail']['hadits'], 'penjelasan'), '<p><br><strong><em><b><i><ul><ol><li><h2><h3>') !!}</p>
                            </div>
                        @endif

                        @php
                            $detailNo = data_get($reactData['haditsDetail']['hadits'], 'no');
                            $detailArab = data_get($reactData['haditsDetail']['hadits'], 'arab');
                            $detailIndo = data_get($reactData['haditsDetail']['hadits'], 'indonesia');
                            $waText = "*HADITS " . strtoupper($reactData['haditsDetail']['kitab']['name']) . " NO. " . $detailNo . "*\n\n"
                                . $detailArab . "\n\n"
                                . "_" . $detailIndo . "_\n\n"
                                . "[ BACA SELENGKAPNYA ]\n" . url("/hadits/" . $reactData['haditsDetail']['kitab']['slug'] . "/" . $detailNo) . "\n\n"
                                . "INDOQURAN - Platform Al-Quran & Hadits Digital Indonesia";
                            $waUrl = "https://api.whatsapp.com/send?text=" . rawurlencode($waText);
                        @endphp
                        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end;">
                            <a href="{{ $waUrl }}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; background: #16a34a; color: white; border-radius: 0.5rem; text-decoration: none; font-size: 0.875rem; font-weight: 600;">
                                Bagikan ke WhatsApp
                            </a>
                        </div>
                    </div>

                    <nav aria-label="Navigasi Hadits" style="display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; gap: 0.5rem; flex-wrap: wrap;">
                        @if(!empty($reactData['haditsDetail']['navigation']['prev_nomor']))
                            <a href="/hadits/{{ $reactData['haditsDetail']['kitab']['slug'] }}/{{ $reactData['haditsDetail']['navigation']['prev_nomor'] }}" style="padding: 0.6rem 1.2rem; background: #f3f4f6; color: #1f2937; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
                                &larr; Hadits No. {{ $reactData['haditsDetail']['navigation']['prev_nomor'] }}
                            </a>
                        @else
                            <span></span>
                        @endif

                        <a href="/hadits/{{ $reactData['haditsDetail']['kitab']['slug'] }}" style="padding: 0.6rem 1.2rem; background: #16a34a; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
                            Daftar Hadits {{ $reactData['haditsDetail']['kitab']['name'] }}
                        </a>

                        @if(!empty($reactData['haditsDetail']['navigation']['next_nomor']))
                            <a href="/hadits/{{ $reactData['haditsDetail']['kitab']['slug'] }}/{{ $reactData['haditsDetail']['navigation']['next_nomor'] }}" style="padding: 0.6rem 1.2rem; background: #f3f4f6; color: #1f2937; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
                                Hadits No. {{ $reactData['haditsDetail']['navigation']['next_nomor'] }} &rarr;
                            </a>
                        @else
                            <span></span>
                        @endif
                    </nav>
                </article>
            </div>
        @endif

        @if(isset($reactData['haditsTopic']))
            <div id="ssr-hadits-topic" style="padding: 3rem 1.5rem; background: #fff; color: #1f2937; max-width: 900px; margin: 0 auto; line-height: 1.8;">
                <nav aria-label="Breadcrumb" style="margin-bottom: 1.5rem; font-size: 0.875rem; color: #4b5563;">
                    <a href="/" style="color: #16a34a; text-decoration: none;">Beranda</a>
                    <span style="margin: 0 0.5rem; color: #9ca3af;">/</span>
                    <a href="/hadits" style="color: #16a34a; text-decoration: none;">Hadits</a>
                    <span style="margin: 0 0.5rem; color: #9ca3af;">/</span>
                    <span style="color: #111827; font-weight: 600;">Hadits tentang {{ $reactData['haditsTopic']['topic'] }}</span>
                </nav>

                <header style="text-align: center; margin-bottom: 2.5rem;">
                    <h1 style="font-size: 2.25rem; font-weight: 800; color: #166534; margin-bottom: 0.75rem;">
                        Hadits tentang {{ $reactData['haditsTopic']['topic'] }}
                    </h1>
                    <p style="font-size: 1.125rem; color: #4b5563; max-width: 750px; margin: 0 auto;">
                        Kumpulan hadits shahih mengenai {{ strtolower($reactData['haditsTopic']['topic']) }}. Teks Arab berharakat, nomor hadits, dan terjemahan bahasa Indonesia di IndoQuran.
                    </p>
                </header>

                @if(!empty($reactData['haditsTopic']['hadiths']))
                    <section style="margin-bottom: 2.5rem;">
                        @foreach($reactData['haditsTopic']['hadiths'] as $item)
                            <article style="padding: 1.5rem; margin-bottom: 1.25rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; background: #fdfdfd;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
                                    <span style="font-weight: 700; color: #15803d; font-size: 0.9375rem;">
                                        {{ $item['kitab_name'] }} • Hadits No. {{ $item['no'] }}
                                    </span>
                                    @if(!empty($item['kategori']))
                                        <span style="font-size: 0.8125rem; color: #6b7280; background: #f3f4f6; padding: 0.2rem 0.6rem; border-radius: 9999px;">
                                            {{ $item['kategori'] }}
                                        </span>
                                    @endif
                                </div>
                                <p class="arabic-text" style="font-size: 1.85rem; line-height: 2.2; color: #111827; text-align: right; margin: 0 0 0.75rem 0; direction: rtl;">
                                    {{ $item['arab'] }}
                                </p>
                                <p style="font-size: 1rem; color: #374151; line-height: 1.7; margin: 0 0 0.75rem 0;">
                                    <strong>Terjemahan:</strong> {{ $item['indonesia'] }}
                                </p>
                                <a href="/hadits/{{ $item['kitab_slug'] }}/{{ $item['no'] }}" style="color: #16a34a; font-weight: 600; text-decoration: none; font-size: 0.875rem;">
                                    Lihat Selengkapnya &rarr;
                                </a>
                            </article>
                        @endforeach
                    </section>
                @endif

                <div style="text-align: center; margin-top: 2rem;">
                    <a href="/hadits" style="display: inline-block; padding: 0.75rem 1.5rem; background: #16a34a; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">
                        &larr; Lihat Koleksi Kitab Hadits
                    </a>
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
                const loadingEl = document.getElementById('app-loading');
                if (!loadingEl) {
                    clearTimeout(loadingTimeout);
                    return true;
                }
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
