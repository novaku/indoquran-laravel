<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

/**
 * Controller for tracking and displaying online users in realtime
 * Uses Redis sorted sets for efficient tracking with automatic expiration,
 * with graceful fallback to file/database cache if Redis is unavailable.
 */
class OnlineUsersController extends Controller
{
    /**
     * Redis key for storing online users
     */
    private const ONLINE_USERS_KEY = 'online_users';

    /**
     * Cache key for fallback when Redis is unavailable
     */
    private const FALLBACK_CACHE_KEY = 'online_users_fallback_map';
    
    /**
     * Time window to consider a user as "online" (in seconds)
     * 5 minutes = 300 seconds
     */
    private const ONLINE_THRESHOLD = 300;

    /**
     * Track a user visit (heartbeat)
     * Should be called periodically from the frontend
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function track(Request $request)
    {
        $visitorId = $this->generateVisitorId($request);
        $timestamp = now()->timestamp;
        $onlineCount = null;

        // Try Redis first
        try {
            Redis::zadd(self::ONLINE_USERS_KEY, $timestamp, $visitorId);
            $cutoffTime = $timestamp - self::ONLINE_THRESHOLD;
            Redis::zremrangebyscore(self::ONLINE_USERS_KEY, '-inf', $cutoffTime);
            $onlineCount = (int) Redis::zcard(self::ONLINE_USERS_KEY);
        } catch (\Throwable $e) {
            Log::warning('Redis online user tracking failed, falling back to cache: ' . $e->getMessage());
            $onlineCount = null;
        }

        // Fallback to cache/database if Redis is not accessible
        if ($onlineCount === null) {
            $onlineCount = $this->trackFallback($visitorId, $timestamp);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Visitor tracked',
            'data' => [
                'online_count' => (int) $onlineCount,
                'visitor_id' => $visitorId
            ]
        ]);
    }

    /**
     * Get current online users count
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function count()
    {
        $timestamp = now()->timestamp;
        $onlineCount = null;

        // Try Redis first
        try {
            $cutoffTime = $timestamp - self::ONLINE_THRESHOLD;
            Redis::zremrangebyscore(self::ONLINE_USERS_KEY, '-inf', $cutoffTime);
            $onlineCount = (int) Redis::zcard(self::ONLINE_USERS_KEY);
        } catch (\Throwable $e) {
            Log::warning('Redis online users count failed, falling back to cache: ' . $e->getMessage());
            $onlineCount = null;
        }

        // Fallback to cache/database if Redis is not accessible
        if ($onlineCount === null) {
            $onlineCount = $this->countFallback($timestamp);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'online_count' => (int) $onlineCount,
                'last_updated' => now()->toIso8601String()
            ]
        ]);
    }

    /**
     * Track visitor in fallback cache when Redis is unavailable.
     */
    private function trackFallback(string $visitorId, int $timestamp): int
    {
        try {
            $cache = $this->getFallbackCache();
            $visitors = $cache->get(self::FALLBACK_CACHE_KEY, []);

            if (!is_array($visitors)) {
                $visitors = [];
            }

            $cutoffTime = $timestamp - self::ONLINE_THRESHOLD;

            // Remove expired visitors
            foreach ($visitors as $id => $time) {
                if ($time < $cutoffTime) {
                    unset($visitors[$id]);
                }
            }

            // Record/update current visitor
            $visitors[$visitorId] = $timestamp;

            // Store back into cache
            $cache->put(self::FALLBACK_CACHE_KEY, $visitors, self::ONLINE_THRESHOLD * 2);

            return max(1, count($visitors));
        } catch (\Throwable $e) {
            Log::warning('Fallback cache online user tracking failed: ' . $e->getMessage());

            try {
                $cutoff = now()->subSeconds(self::ONLINE_THRESHOLD);
                $count = \App\Models\Visitor::where('visited_at', '>=', $cutoff)
                    ->distinct('ip_address')
                    ->count('ip_address');

                return max(1, (int) $count);
            } catch (\Throwable) {
                return 1;
            }
        }
    }

    /**
     * Get online count from fallback cache when Redis is unavailable.
     */
    private function countFallback(int $timestamp): int
    {
        try {
            $cache = $this->getFallbackCache();
            $visitors = $cache->get(self::FALLBACK_CACHE_KEY, []);

            if (!is_array($visitors)) {
                $visitors = [];
            }

            $cutoffTime = $timestamp - self::ONLINE_THRESHOLD;
            $activeCount = 0;

            foreach ($visitors as $id => $time) {
                if ($time >= $cutoffTime) {
                    $activeCount++;
                } else {
                    unset($visitors[$id]);
                }
            }

            $cache->put(self::FALLBACK_CACHE_KEY, $visitors, self::ONLINE_THRESHOLD * 2);

            return $activeCount;
        } catch (\Throwable $e) {
            Log::warning('Fallback cache online count failed: ' . $e->getMessage());

            try {
                $cutoff = now()->subSeconds(self::ONLINE_THRESHOLD);
                $count = \App\Models\Visitor::where('visited_at', '>=', $cutoff)
                    ->distinct('ip_address')
                    ->count('ip_address');

                return (int) $count;
            } catch (\Throwable) {
                return 0;
            }
        }
    }

    /**
     * Get a reliable cache store for fallback (file or configured non-redis driver).
     */
    private function getFallbackCache()
    {
        $default = config('cache.default');
        if ($default === 'redis') {
            return Cache::store('file');
        }

        try {
            return Cache::store($default);
        } catch (\Throwable) {
            return Cache::store('file');
        }
    }

    /**
     * Generate a unique visitor ID based on IP and User Agent
     * 
     * @param Request $request
     * @return string
     */
    private function generateVisitorId(Request $request): string
    {
        $ip = $request->ip() ?? '127.0.0.1';
        $userAgent = $request->userAgent() ?? 'unknown';
        
        // Create a hash combining IP and User Agent
        // This provides reasonable uniqueness while maintaining privacy
        return hash('sha256', $ip . '|' . $userAgent);
    }
}
