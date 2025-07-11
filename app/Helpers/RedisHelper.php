<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

class RedisHelper
{
    /**
     * Test Redis connection and log configuration details
     */
    public static function testConnection(): bool
    {
        try {
            $redisSocket = config('database.redis.default.socket');
            $redisHost = config('database.redis.default.host');
            $redisPort = config('database.redis.default.port');
            
            Log::info('Redis Configuration:', [
                'socket' => $redisSocket,
                'host' => $redisHost,
                'port' => $redisPort,
                'using_socket' => !empty($redisSocket),
            ]);
            
            // Test the connection
            Redis::ping();
            
            Log::info('Redis connection successful');
            return true;
            
        } catch (\Exception $e) {
            Log::error('Redis connection failed:', [
                'error' => $e->getMessage(),
                'socket' => config('database.redis.default.socket'),
                'host' => config('database.redis.default.host'),
                'port' => config('database.redis.default.port'),
            ]);
            
            return false;
        }
    }
    
    /**
     * Check if Redis is using socket connection
     */
    public static function isUsingSocket(): bool
    {
        return !empty(config('database.redis.default.socket'));
    }
    
    /**
     * Get Redis connection info
     */
    public static function getConnectionInfo(): array
    {
        return [
            'socket' => config('database.redis.default.socket'),
            'host' => config('database.redis.default.host'),
            'port' => config('database.redis.default.port'),
            'using_socket' => static::isUsingSocket(),
            'client' => config('database.redis.client'),
        ];
    }
}
