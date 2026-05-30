<!doctype html>
<html ⚡ lang="id">
<head>
    <meta charset="utf-8">
    <title>{{ trim($__env->yieldContent('title')) }} - IndoQuran AMP</title>
    <link rel="canonical" href="{{ trim($__env->yieldContent('canonical')) }}">
    <meta name="robots" content="noindex,follow">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    
    <!-- AdSense AMP Script -->
    <script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"></script>
    <script async custom-element="amp-auto-ads" src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js"></script>

    <style amp-custom>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
        }
        header {
            background-color: #1f2937;
            color: white;
            padding: 1rem;
            text-align: center;
        }
        header h1 {
            margin: 0;
            font-size: 1.5rem;
        }
        header a {
            color: white;
            text-decoration: none;
        }
        main {
            max-width: 800px;
            margin: 0 auto;
            padding: 1rem;
            background-color: white;
        }
        .ayah-container {
            border-bottom: 1px solid #e5e7eb;
            padding: 1.5rem 0;
        }
        .ayah-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1rem;
            color: #6b7280;
            font-size: 0.875rem;
        }
        .arabic-text {
            font-family: "Amiri", serif;
            font-size: 1.75rem;
            text-align: right;
            direction: rtl;
            line-height: 2.5;
            margin-bottom: 1rem;
            color: #111827;
        }
        .latin-text {
            font-size: 0.9rem;
            color: #10b981;
            margin-bottom: 0.5rem;
            font-style: italic;
        }
        .translation-text {
            font-size: 1rem;
            color: #374151;
        }
        .footer {
            text-align: center;
            padding: 2rem;
            color: #6b7280;
            font-size: 0.875rem;
        }
        .ad-container {
            margin: 2rem 0;
            text-align: center;
            background: #f3f4f6;
            padding: 1rem;
        }
    </style>
</head>
<body>
    <amp-auto-ads type="adsense"
        data-ad-client="ca-pub-9994842285785390">
    </amp-auto-ads>

    <header>
        <h1><a href="{{ url('/') }}">IndoQuran</a></h1>
    </header>

    <main>
        @yield('content')
    </main>

    <footer class="footer">
        <p>&copy; {{ date('Y') }} IndoQuran. All rights reserved.</p>
    </footer>
</body>
</html>
