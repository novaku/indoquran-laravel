<?php

if (!function_exists('asset_url')) {
    /**
     * Generate a URL for an asset considering the production environment
     * In production, all assets will have a /public prefix
     *
     * @param string $path
     * @return string
     */
    function asset_url($path)
    {
        if (app()->environment('production')) {
            $path = ltrim($path, '/');
            return url("/public/{$path}");
        }
        
        return url($path);
    }
}

if (!function_exists('route_url')) {
    /**
     * Generate a URL for a route considering the production environment
     * In production, all routes will have a /public prefix
     *
     * @param string $path
     * @return string
     */
    function route_url($path)
    {
        if (app()->environment('production')) {
            $path = ltrim($path, '/');
            return url("/public/{$path}");
        }
        
        return url($path);
    }
}
