<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AssetServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Configure Vite to use ASSET_URL environment variable for build output
        if (config('app.asset_url')) {
            $assetUrl = config('app.asset_url');
            
            // Use a custom asset path resolver for Vite
            Vite::createAssetPathsUsing(function ($path) use ($assetUrl) {
                // Ensure path doesn't already have the asset URL
                if (str_starts_with($path, $assetUrl)) {
                    return $path;
                }
                
                // For absolute URLs, don't modify
                if (filter_var($path, FILTER_VALIDATE_URL)) {
                    return $path;
                }
                
                // Remove leading slash if present
                $path = ltrim($path, '/');
                
                // Add trailing slash to asset URL if needed
                $assetUrl = rtrim($assetUrl, '/') . '/';
                
                return $assetUrl . $path;
            });
        }
    }
}
