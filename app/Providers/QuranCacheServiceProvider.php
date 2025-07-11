<?php

namespace App\Providers;

use App\Services\QuranCacheService;
use Illuminate\Support\ServiceProvider;

class QuranCacheServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(QuranCacheService::class, function ($app) {
            return new QuranCacheService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Warm up cache on application boot if enabled
        if (config('quran_cache.warm_on_boot', false)) {
            $this->app->make(QuranCacheService::class)->warmUpCache();
        }
    }
}
