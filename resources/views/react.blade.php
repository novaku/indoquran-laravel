<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    @if(app()->environment('local'))
    <!-- Development CSP for hot reload -->
    <meta http-equiv="Content-Security-Policy" content="
        script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: http://localhost:5173 ws://localhost:5173;
        style-src 'self' 'unsafe-inline' blob: data: http://localhost:5173 https://fonts.bunny.net https://fonts.googleapis.com fonts.bunny.net;
        connect-src 'self' ws://localhost:5173 http://localhost:5173;
        img-src 'self' data: blob:;
        media-src 'self' https://*.nos.wjv-1.neo.id https://*.equran.id https://*.equran.nos.wjv-1.neo.id https://*.quranicaudio.com https://*.qurancdn.com https://*.vercel.app *;
        font-src 'self' data: blob: https://fonts.bunny.net https://fonts.gstatic.com fonts.bunny.net fonts.gstatic.com;
    ">
    @endif

    <title>{{ config('app.name', 'Al-Quran Digital') }}</title>

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
    <!-- Hot reload script for development -->
    <script>
        if (typeof window !== 'undefined') {
            // Enable React DevTools
            window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
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
