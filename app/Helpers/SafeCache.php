<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SafeCache
{
    /**
     * Safely remember a cached value.
     * If Redis or Cache backend fails (e.g. OOM, connection lost),
     * the callback is executed directly without crashing the request.
     */
    public static function remember(string $key, int|\DateTimeInterface|\DateInterval $ttl, \Closure $callback): mixed
    {
        try {
            return Cache::remember($key, $ttl, $callback);
        } catch (\Throwable $e) {
            Log::warning("SafeCache::remember failed for [{$key}], falling back to direct execution: " . $e->getMessage());
            return $callback();
        }
    }

    /**
     * Safely get a value from cache.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        try {
            return Cache::get($key, $default);
        } catch (\Throwable $e) {
            Log::warning("SafeCache::get failed for [{$key}]: " . $e->getMessage());
            return value($default);
        }
    }

    /**
     * Safely store an item in the cache.
     */
    public static function put(string $key, mixed $value, int|\DateTimeInterface|\DateInterval|null $ttl = null): bool
    {
        try {
            return Cache::put($key, $value, $ttl);
        } catch (\Throwable $e) {
            Log::warning("SafeCache::put failed for [{$key}]: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Safely check if a key exists in cache.
     */
    public static function has(string $key): bool
    {
        try {
            return Cache::has($key);
        } catch (\Throwable $e) {
            Log::warning("SafeCache::has failed for [{$key}]: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Safely remove an item from the cache.
     */
    public static function forget(string $key): bool
    {
        try {
            return Cache::forget($key);
        } catch (\Throwable $e) {
            Log::warning("SafeCache::forget failed for [{$key}]: " . $e->getMessage());
            return false;
        }
    }
}
