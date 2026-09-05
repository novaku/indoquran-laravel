<?php

namespace App\Providers;

use App\Models\Ayah;
use App\Models\Surah;
use Illuminate\Filesystem\Filesystem;
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

        // Override the default filesystem "link" behavior for environments
        // (such as some cPanel shared hosting) where both the PHP "symlink"
        // and "exec" functions are unavailable. In that case Laravel's
        // default implementation throws "Call to undefined function
        // Illuminate\\Filesystem\\exec()" when running "php artisan storage:link".
        //
        // Here we replace the "files" binding with a subclass that, on
        // non‑Windows systems, avoids calling exec() and instead falls
        // back to copying the directory / file so that "storage:link"
        // completes without fatal errors.
        $this->app->extend('files', function ($service, $app) {
            return new class extends Filesystem {
                /**
                 * Create a link to the target file or directory.
                 *
                 * On hosts where both "symlink" and "exec" are disabled,
                 * we fall back to copying the contents so Laravel can still
                 * serve files from "public/storage" without using real
                 * filesystem symlinks.
                 */
                public function link($target, $link)
                {
                    // Keep the default behavior on Windows where exec()
                    // is typically available and symlink semantics are
                    // different.
                    if (windows_os()) {
                        return parent::link($target, $link);
                    }

                    // Preferred: if PHP's symlink() exists and is allowed, use it.
                    if (function_exists('symlink')) {
                        return @symlink($target, $link);
                    }

                    // Fallback for environments (like some cPanel setups)
                    // where both "symlink" and "exec" are unavailable:
                    // - If the target is a directory, recursively copy it.
                    // - If it's a single file, copy the file.
                    if ($this->isDirectory($target)) {
                        return $this->copyDirectory($target, $link);
                    }

                    $this->ensureDirectoryExists(dirname($link));

                    return $this->copy($target, $link);
                }
            };
        });
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
            // Use UNIX socket in production if available, otherwise preserve TCP host/port fallback
            $redisSocket = env('REDIS_SOCKET', '/home/indoqura/tmp/redis.sock');
            if ($redisSocket && file_exists($redisSocket)) {
                config(['database.redis.default.socket' => $redisSocket]);
                config(['database.redis.cache.socket' => $redisSocket]);
                config(['database.redis.default.scheme' => 'unix']);
                config(['database.redis.cache.scheme' => 'unix']);
                config(['database.redis.default.path' => $redisSocket]);
                config(['database.redis.cache.path' => $redisSocket]);
                config(['database.redis.default.host' => null]);
                config(['database.redis.cache.host' => null]);
            }
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
