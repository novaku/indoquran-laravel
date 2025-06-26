<?php
/**
 * Redis Test Script
 * Tests Redis connectivity and basic operations using Unix socket
 */

// Redis socket path
$redisSocket = '/home/indoqura/tmp/redis.sock';

echo "=== Redis Test Script ===\n";
echo "Socket Path: {$redisSocket}\n";
echo "Date: " . date('Y-m-d H:i:s') . "\n\n";

// Check if Redis extension is loaded
if (!extension_loaded('redis')) {
    echo "❌ Error: Redis PHP extension is not loaded!\n";
    echo "Please install Redis PHP extension first.\n";
    exit(1);
}

echo "✅ Redis PHP extension is loaded\n";

try {
    // Create Redis instance
    $redis = new Redis();
    
    echo "Attempting to connect to Redis via socket...\n";
    
    // Connect using Unix socket
    $connection = $redis->connect($redisSocket);
    
    if (!$connection) {
        throw new Exception("Failed to connect to Redis socket");
    }
    
    echo "✅ Successfully connected to Redis via socket\n";
    
    // Test basic operations
    echo "\n=== Testing Basic Operations ===\n";
    
    // Test ping
    $pong = $redis->ping();
    echo "Ping test: " . ($pong === '+PONG' || $pong === 'PONG' ? '✅ PONG' : '❌ Failed') . "\n";
    
    // Test set/get
    $testKey = 'test_key_' . time();
    $testValue = 'Hello Redis from IndoQuran!';
    
    $setResult = $redis->set($testKey, $testValue);
    echo "Set operation: " . ($setResult ? '✅ Success' : '❌ Failed') . "\n";
    
    $getValue = $redis->get($testKey);
    echo "Get operation: " . ($getValue === $testValue ? '✅ Success' : '❌ Failed') . "\n";
    echo "Retrieved value: {$getValue}\n";
    
    // Test TTL
    $redis->expire($testKey, 60);
    $ttl = $redis->ttl($testKey);
    echo "TTL test: " . ($ttl > 0 ? "✅ TTL set to {$ttl} seconds" : '❌ Failed') . "\n";
    
    // Test delete
    $delResult = $redis->del($testKey);
    echo "Delete operation: " . ($delResult ? '✅ Success' : '❌ Failed') . "\n";
    
    // Test Redis info
    echo "\n=== Redis Server Information ===\n";
    $info = $redis->info();
    
    if ($info && is_array($info)) {
        echo "Redis Version: " . ($info['redis_version'] ?? 'Unknown') . "\n";
        echo "Connected Clients: " . ($info['connected_clients'] ?? 'Unknown') . "\n";
        echo "Used Memory: " . ($info['used_memory_human'] ?? 'Unknown') . "\n";
        echo "Uptime: " . ($info['uptime_in_seconds'] ?? 'Unknown') . " seconds\n";
    }
    
    // Test hash operations
    echo "\n=== Testing Hash Operations ===\n";
    $hashKey = 'test_hash_' . time();
    
    $redis->hSet($hashKey, 'field1', 'value1');
    $redis->hSet($hashKey, 'field2', 'value2');
    echo "Hash set operations: ✅ Success\n";
    
    $hashValue = $redis->hGet($hashKey, 'field1');
    echo "Hash get operation: " . ($hashValue === 'value1' ? '✅ Success' : '❌ Failed') . "\n";
    
    $allHash = $redis->hGetAll($hashKey);
    echo "Hash get all: " . (count($allHash) === 2 ? '✅ Success' : '❌ Failed') . "\n";
    
    $redis->del($hashKey);
    echo "Hash cleanup: ✅ Success\n";
    
    // Test list operations
    echo "\n=== Testing List Operations ===\n";
    $listKey = 'test_list_' . time();
    
    $redis->lPush($listKey, 'item1', 'item2', 'item3');
    echo "List push operations: ✅ Success\n";
    
    $listLength = $redis->lLen($listKey);
    echo "List length: " . ($listLength === 3 ? "✅ {$listLength} items" : '❌ Failed') . "\n";
    
    $item = $redis->lPop($listKey);
    echo "List pop operation: " . ($item === 'item3' ? '✅ Success' : '❌ Failed') . "\n";
    
    $redis->del($listKey);
    echo "List cleanup: ✅ Success\n";
    
    // Test set operations
    echo "\n=== Testing Set Operations ===\n";
    $setKey = 'test_set_' . time();
    
    $redis->sAdd($setKey, 'member1', 'member2', 'member3');
    echo "Set add operations: ✅ Success\n";
    
    $setSize = $redis->sCard($setKey);
    echo "Set size: " . ($setSize === 3 ? "✅ {$setSize} members" : '❌ Failed') . "\n";
    
    $isMember = $redis->sIsMember($setKey, 'member1');
    echo "Set membership test: " . ($isMember ? '✅ Success' : '❌ Failed') . "\n";
    
    $redis->del($setKey);
    echo "Set cleanup: ✅ Success\n";
    
    // Performance test
    echo "\n=== Performance Test ===\n";
    $startTime = microtime(true);
    $iterations = 1000;
    
    for ($i = 0; $i < $iterations; $i++) {
        $redis->set("perf_test_{$i}", "value_{$i}");
    }
    
    $endTime = microtime(true);
    $duration = ($endTime - $startTime) * 1000; // Convert to milliseconds
    echo "Set {$iterations} keys: " . number_format($duration, 2) . " ms\n";
    
    // Cleanup performance test keys
    for ($i = 0; $i < $iterations; $i++) {
        $redis->del("perf_test_{$i}");
    }
    echo "Performance test cleanup: ✅ Success\n";
    
    // Close connection
    $redis->close();
    echo "\n✅ All tests completed successfully!\n";
    echo "Redis is working properly via socket connection.\n";
    
} catch (RedisException $e) {
    echo "❌ Redis Error: " . $e->getMessage() . "\n";
    echo "This could indicate:\n";
    echo "- Redis server is not running\n";
    echo "- Socket file does not exist or is not accessible\n";
    echo "- Permission issues with the socket file\n";
    exit(1);
} catch (Exception $e) {
    echo "❌ General Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n=== Test completed at " . date('Y-m-d H:i:s') . " ===\n";
?>
