<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class CriticalCSSService
{
    /**
     * Generate critical CSS for above-the-fold content
     */
    public static function getCriticalCSS(): string
    {
        return Cache::remember('critical_css_mobile', 86400, function () {
            return self::generateCriticalCSS();
        });
    }

    private static function generateCriticalCSS(): string
    {
        return '<style id="critical-css">
/* Critical CSS for mobile performance - above the fold only */
*,*::before,*::after{box-sizing:border-box}
html{line-height:1.15;-webkit-text-size-adjust:100%}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-size:16px;line-height:1.5;color:#1f2937;background:#fff}
header{background:#22c55e;color:#fff;padding:0.75rem 1rem}
nav{display:flex;align-items:center;justify-content:space-between}
.logo{font-size:1.25rem;font-weight:600;text-decoration:none;color:#fff}
.menu-button{background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer}
.loading{position:fixed;top:0;left:0;right:0;bottom:0;background:#f9fafb;display:flex;align-items:center;justify-content:center;z-index:9999}
.spinner{width:32px;height:32px;border:3px solid #e5e7eb;border-top:3px solid #22c55e;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.container{max-width:1200px;margin:0 auto;padding:0 1rem}
.text-center{text-align:center}
.text-green{color:#22c55e}
.font-bold{font-weight:700}
.mb-4{margin-bottom:1rem}
.p-4{padding:1rem}
.rounded{border-radius:0.375rem}
.shadow{box-shadow:0 1px 3px 0 rgba(0,0,0,0.1)}
.bg-white{background-color:#fff}
.border{border:1px solid #e5e7eb}
/* Hide non-critical content initially */
.below-fold{visibility:hidden}
/* Critical mobile viewport fixes */
@media(max-width:768px){
body{font-size:14px}
.container{padding:0 0.75rem}
header{padding:0.5rem 0.75rem}
.logo{font-size:1.125rem}
}
/* Prevent layout shift for images */
img{max-width:100%;height:auto;display:block}
/* Font display swap for web fonts */
@font-face{font-display:swap}
</style>';
    }

    /**
     * Preload critical resources for mobile
     */
    public static function getCriticalResourcePreloads(): string
    {
        $buildPath = public_path('build');
        $manifest = [];
        
        if (File::exists($buildPath . '/manifest.json')) {
            $manifest = json_decode(File::get($buildPath . '/manifest.json'), true);
        }

        $preloads = [];
        
        // Preload critical CSS
        if (isset($manifest['resources/css/app.css'])) {
            $cssFile = $manifest['resources/css/app.css']['file'];
            $preloads[] = "<link rel=\"preload\" href=\"/build/{$cssFile}\" as=\"style\" onload=\"this.onload=null;this.rel='stylesheet'\">";
        }

        // Preload critical JS
        if (isset($manifest['resources/js/react/index.jsx'])) {
            $jsFile = $manifest['resources/js/react/index.jsx']['file'];
            $preloads[] = "<link rel=\"modulepreload\" href=\"/build/{$jsFile}\">";
        }

        return implode("\n", $preloads);
    }

    /**
     * Generate mobile-optimized meta tags
     */
    public static function getMobileOptimizedMeta(): string
    {
        return '
<!-- Mobile Performance Optimizations -->
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="format-detection" content="telephone=no">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#22c55e" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#16a34a" media="(prefers-color-scheme: dark)">
<!-- Resource hints for critical external domains -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="dns-prefetch" href="//fonts.gstatic.com">
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- Prefetch critical pages for faster navigation -->
<link rel="prefetch" href="/api/surahs">
<link rel="prefetch" href="/build/assets/vendor-react.js">
';
    }
}
