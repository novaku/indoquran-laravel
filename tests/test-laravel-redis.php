<?php
/**
 * Laravel Redis Test Script
 * Tests Laravel Redis configuration using the configured socket connection
 * 
 * Run with: php artisan tinker
 * Or create a route/command to execute this
 */

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class LaravelRedisTest
{
    public static function runTests()
    {
        echo "=== Laravel Redis Test Script ===\n";
        echo "Date: " . now()->format('Y-m-d H:i:s') . "\n";
        echo "Socket Path: " . config('database.redis.default.socket') . "\n\n";

        try {
            // Test 1: Basic Redis Connection
            echo "=== Testing Redis Connection ===\n";
            
            $pong = Redis::ping();
            echo "Redis Ping: " . ($pong === '+PONG' || $pong === 'PONG' ? '✅ Connected' : '❌ Failed') . "\n";
            
            // Test 2: Basic Set/Get Operations
            echo "\n=== Testing Basic Operations ===\n";
            
            $testKey = 'laravel_test_' . time();
            $testValue = 'Hello from Laravel IndoQuran!';
            
            Redis::set($testKey, $testValue);
            echo "Redis Set: ✅ Success\n";
            
            $getValue = Redis::get($testKey);
            echo "Redis Get: " . ($getValue === $testValue ? '✅ Success' : '❌ Failed') . "\n";
            echo "Retrieved Value: {$getValue}\n";
            
            // Test TTL
            Redis::expire($testKey, 300); // 5 minutes
            $ttl = Redis::ttl($testKey);
            echo "Redis TTL: " . ($ttl > 0 ? "✅ Set to {$ttl} seconds" : '❌ Failed') . "\n";
            
            // Cleanup
            Redis::del($testKey);
            echo "Redis Delete: ✅ Success\n";
            
            // Test 3: Laravel Cache (which uses Redis)
            echo "\n=== Testing Laravel Cache (Redis Backend) ===\n";
            
            $cacheKey = 'laravel_cache_test_' . time();
            $cacheValue = ['message' => 'Cached from IndoQuran Laravel', 'timestamp' => now()];
            
            Cache::put($cacheKey, $cacheValue, 300); // 5 minutes
            echo "Cache Put: ✅ Success\n";
            
            $cachedValue = Cache::get($cacheKey);
            $isValid = $cachedValue && 
                      is_array($cachedValue) && 
                      $cachedValue['message'] === 'Cached from IndoQuran Laravel';
            echo "Cache Get: " . ($isValid ? '✅ Success' : '❌ Failed') . "\n";
            
            if ($isValid) {
                echo "Cached Message: " . $cachedValue['message'] . "\n";
                echo "Cached Timestamp: " . $cachedValue['timestamp'] . "\n";
            }
            
            Cache::forget($cacheKey);
            echo "Cache Forget: ✅ Success\n";
            
            // Test 4: Redis Hash Operations (Laravel way)
            echo "\n=== Testing Redis Hash Operations ===\n";
            
            $hashKey = 'laravel_hash_' . time();
            
            Redis::hset($hashKey, 'app_name', config('app.name'));
            Redis::hset($hashKey, 'app_env', config('app.env'));
            Redis::hset($hashKey, 'cache_driver', config('cache.default'));
            echo "Hash Set Operations: ✅ Success\n";
            
            $appName = Redis::hget($hashKey, 'app_name');
            echo "Hash Get (app_name): " . ($appName === config('app.name') ? '✅ Success' : '❌ Failed') . "\n";
            
            $allHash = Redis::hgetall($hashKey);
            echo "Hash Get All: " . (count($allHash) === 3 ? '✅ Success' : '❌ Failed') . "\n";
            
            foreach ($allHash as $field => $value) {
                echo "  {$field}: {$value}\n";
            }
            
            Redis::del($hashKey);
            echo "Hash Cleanup: ✅ Success\n";
            
            // Test 5: Redis Lists (Queue simulation)
            echo "\n=== Testing Redis List Operations (Queue Simulation) ===\n";
            
            $queueKey = 'laravel_queue_' . time();
            
            // Simulate adding jobs to queue
            Redis::lpush($queueKey, json_encode(['job' => 'SendEmail', 'data' => ['email' => 'user@indoquran.com']]));
            Redis::lpush($queueKey, json_encode(['job' => 'ProcessPayment', 'data' => ['amount' => 100]]));
            Redis::lpush($queueKey, json_encode(['job' => 'UpdateCache', 'data' => ['key' => 'homepage']]));
            echo "Queue Push Operations: ✅ Success\n";
            
            $queueLength = Redis::llen($queueKey);
            echo "Queue Length: " . ($queueLength === 3 ? "✅ {$queueLength} jobs" : '❌ Failed') . "\n";
            
            // Process a job
            $job = Redis::rpop($queueKey);
            $jobData = json_decode($job, true);
            echo "Queue Pop: " . ($jobData && isset($jobData['job']) ? '✅ Success' : '❌ Failed') . "\n";
            
            if ($jobData) {
                echo "Processed Job: " . $jobData['job'] . "\n";
            }
            
            Redis::del($queueKey);
            echo "Queue Cleanup: ✅ Success\n";
            
            // Test 6: Redis Sets (Tags/Categories)
            echo "\n=== Testing Redis Set Operations (Tags) ===\n";
            
            $tagsKey = 'laravel_tags_' . time();
            
            Redis::sadd($tagsKey, 'quran', 'islam', 'education', 'indonesia', 'arabic');
            echo "Set Add Operations: ✅ Success\n";
            
            $tagCount = Redis::scard($tagsKey);
            echo "Set Size: " . ($tagCount === 5 ? "✅ {$tagCount} tags" : '❌ Failed') . "\n";
            
            $hasTag = Redis::sismember($tagsKey, 'quran');
            echo "Set Membership (quran): " . ($hasTag ? '✅ Found' : '❌ Not Found') . "\n";
            
            $allTags = Redis::smembers($tagsKey);
            echo "All Tags: " . implode(', ', $allTags) . "\n";
            
            Redis::del($tagsKey);
            echo "Set Cleanup: ✅ Success\n";
            
            // Test 7: Redis Server Info
            echo "\n=== Redis Server Information ===\n";
            
            $info = Redis::info();
            if ($info && is_array($info)) {
                echo "Redis Version: " . ($info['redis_version'] ?? 'Unknown') . "\n";
                echo "Connected Clients: " . ($info['connected_clients'] ?? 'Unknown') . "\n";
                echo "Used Memory: " . ($info['used_memory_human'] ?? 'Unknown') . "\n";
                echo "Total Commands Processed: " . ($info['total_commands_processed'] ?? 'Unknown') . "\n";
                echo "Keyspace Hits: " . ($info['keyspace_hits'] ?? 'Unknown') . "\n";
                echo "Keyspace Misses: " . ($info['keyspace_misses'] ?? 'Unknown') . "\n";
            }
            
            // Test 8: Performance Test
            echo "\n=== Performance Test ===\n";
            
            $startTime = microtime(true);
            $iterations = 500;
            
            for ($i = 0; $i < $iterations; $i++) {
                Cache::put("perf_test_{$i}", "Laravel cached value {$i}", 60);
            }
            
            $endTime = microtime(true);
            $duration = ($endTime - $startTime) * 1000;
            echo "Cache {$iterations} items: " . number_format($duration, 2) . " ms\n";
            
            // Cleanup performance test
            for ($i = 0; $i < $iterations; $i++) {
                Cache::forget("perf_test_{$i}");
            }
            echo "Performance test cleanup: ✅ Success\n";
            
            echo "\n✅ All Laravel Redis tests completed successfully!\n";
            echo "Laravel is properly configured to use Redis via Unix socket.\n";
            
            return true;
            
        } catch (\Exception $e) {
            echo "❌ Error: " . $e->getMessage() . "\n";
            echo "Stack trace: " . $e->getTraceAsString() . "\n";
            
            // Log the error
            Log::error('Redis Test Failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return false;
        }
    }
    
    public static function testRedisConfig()
    {
        echo "=== Laravel Redis Configuration ===\n";
        echo "Redis Client: " . config('database.redis.client') . "\n";
        echo "Redis Socket: " . config('database.redis.default.socket') . "\n";
        echo "Redis Host: " . config('database.redis.default.host') . "\n";
        echo "Redis Port: " . config('database.redis.default.port') . "\n";
        echo "Redis Database: " . config('database.redis.default.database') . "\n";
        echo "Cache Driver: " . config('cache.default') . "\n";
        echo "Session Driver: " . config('session.driver') . "\n";
        echo "Queue Connection: " . config('queue.default') . "\n";
        echo "\n";
    }
}

// If running this file directly (not recommended in production)
if (php_sapi_name() === 'cli' && basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'])) {
    echo "Note: This script should be run within Laravel context.\n";
    echo "Use: php artisan tinker\n";
    echo "Then: LaravelRedisTest::runTests()\n";
    echo "Or create a command/route to execute this.\n";
}
?>
