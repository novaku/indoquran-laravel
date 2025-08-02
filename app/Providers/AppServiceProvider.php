<?php

namespace App\Providers;

use App\Models\Ayah;
use App\Models\Surah;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register helpers
        require_once app_path('Helpers/AssetHelper.php');
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configure URLs based on environment
        if (app()->environment('production')) {
            // Force HTTPS in production
            URL::forceScheme('https');
            
            // If ASSET_URL is set, use it for all assets
            if (config('app.asset_url')) {
                $assetUrl = config('app.asset_url');
                // Parse the URL to get just the domain part
                $parsedUrl = parse_url($assetUrl);
                $scheme = $parsedUrl['scheme'] ?? 'https';
                $host = $parsedUrl['host'] ?? null;
                $port = isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '';
                
                if ($host) {
                    URL::forceRootUrl($scheme . '://' . $host . $port);
                }
            }
            
            Redis::enableEvents();
            // Use UNIX socket in production
            config(['database.redis.default.socket' => '/home/indoqura/tmp/redis.sock']);
            config(['database.redis.cache.socket' => '/home/indoqura/tmp/redis.sock']);
            config(['database.redis.default.host' => null]);
            config(['database.redis.cache.host' => null]);
        } else {
            // Development environment - DON'T force any URL schemes
            // Let Laravel use the default APP_URL for local development
            // Only force asset URL if it's different from app URL and needed for CDN
            $appUrl = config('app.url');
            $assetUrl = config('app.asset_url');
            
            // Only force asset URL if it's specifically set and different from app URL
            if ($assetUrl && $assetUrl !== $appUrl && !str_contains($assetUrl, 'localhost') && !str_contains($assetUrl, '127.0.0.1')) {
                $parsedUrl = parse_url($assetUrl);
                $scheme = $parsedUrl['scheme'] ?? 'http';
                $host = $parsedUrl['host'] ?? null;
                $port = isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '';
                
                if ($host) {
                    URL::forceRootUrl($scheme . '://' . $host . $port);
                }
            }
        }
        
        // Implement caching for Surah model
        Surah::retrieved(function ($surah) {
            $cacheKey = "surah_{$surah->number}";
            if (!Cache::has($cacheKey)) {
                Cache::put($cacheKey, $surah, now()->addDays(30));
            }
        });

        // Implement caching for Ayah model
        Ayah::retrieved(function ($ayah) {
            $cacheKey = "ayah_{$ayah->surah_number}_{$ayah->ayah_number}";
            if (!Cache::has($cacheKey)) {
                Cache::put($cacheKey, $ayah, now()->addDays(30));
            }
        });
    }
}
