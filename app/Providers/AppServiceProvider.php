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
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configure Redis based on environment
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
                
                if ($host) {
                    URL::forceRootUrl($scheme . '://' . $host);
                }
            }
            
            Redis::enableEvents();
            // Use UNIX socket in production
            config(['database.redis.default.socket' => '/home/indoqura/tmp/redis.sock']);
            config(['database.redis.cache.socket' => '/home/indoqura/tmp/redis.sock']);
            config(['database.redis.default.host' => null]);
            config(['database.redis.cache.host' => null]);
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
