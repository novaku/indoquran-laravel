<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="{{ $metaDescription ?? 'Al-Quran Digital Indonesia - Baca, dengar, dan pelajari Al-Quran secara online dengan terjemahan bahasa Indonesia, fitur bookmark, dan pencarian ayat.' }}">
    <meta name="keywords" content="{{ $metaKeywords ?? 'al quran digital, baca quran online, al quran indonesia, terjemahan quran, quran digital, al quran indonesia' }}">
    <meta name="author" content="IndoQuran">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title" content="{{ $metaTitle ?? config('app.name', 'Al-Quran Digital') }}">
    <meta property="og:description" content="{{ $metaDescription ?? 'Al-Quran Digital Indonesia - Baca, dengar, dan pelajari Al-Quran secara online dengan terjemahan bahasa Indonesia.' }}">
    <meta property="og:image" content="{{ asset('android-chrome-512x512.png') }}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{ url()->current() }}">
    <meta property="twitter:title" content="{{ $metaTitle ?? config('app.name', 'Al-Quran Digital') }}">
    <meta property="twitter:description" content="{{ $metaDescription ?? 'Al-Quran Digital Indonesia - Baca, dengar, dan pelajari Al-Quran secara online dengan terjemahan bahasa Indonesia.' }}">
    <meta property="twitter:image" content="{{ asset('android-chrome-512x512.png') }}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="{{ url()->current() }}">
    
    <title>{{ $metaTitle ?? config('app.name', 'Al-Quran Digital') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    
    <!-- Google Fonts for enhanced typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Lateef&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Scheherazade+New:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js', 'resources/js/react/index.jsx'])
    
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
