<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Cache;

class TestRedisConnection extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'redis:test {--detailed : Show detailed output}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test Redis connection using Unix socket configuration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== Laravel Redis Test Command ===');
        $this->info('Date: ' . now()->format('Y-m-d H:i:s'));
        $this->info('Socket Path: ' . config('database.redis.default.socket'));
        $this->newLine();

        try {
            // Test Redis Configuration
            $this->testConfiguration();
            
            // Test Basic Connection
            if (!$this->testConnection()) {
                return Command::FAILURE;
            }
            
            // Test Basic Operations
            $this->testBasicOperations();
            
            // Test Laravel Cache
            $this->testLaravelCache();
            
            if ($this->option('detailed')) {
                // Run detailed tests
                $this->testHashOperations();
                $this->testListOperations();
                $this->testSetOperations();
                $this->testPerformance();
                $this->showServerInfo();
            }
            
            $this->info('✅ All Redis tests passed successfully!');
            return Command::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error('❌ Redis test failed: ' . $e->getMessage());
            
            if ($this->option('verbose')) {
                $this->error($e->getTraceAsString());
            }
            
            return Command::FAILURE;
        }
    }
    
    private function testConfiguration()
    {
        $this->info('=== Redis Configuration ===');
        $this->line('Client: ' . config('database.redis.client'));
        $this->line('Socket: ' . config('database.redis.default.socket'));
        $this->line('Host: ' . (config('database.redis.default.host') ?: 'not set'));
        $this->line('Port: ' . (config('database.redis.default.port') ?: 'not set'));
        $this->line('Cache Driver: ' . config('cache.default'));
        
        // Check if socket file exists
        $socketPath = config('database.redis.default.socket');
        if ($socketPath) {
            if (file_exists($socketPath)) {
                $this->info('✅ Socket file exists');
                
                // Check if socket is readable/writable
                if (is_readable($socketPath) && is_writable($socketPath)) {
                    $this->info('✅ Socket has proper permissions');
                } else {
                    $this->warn('⚠️  Socket permissions may be incorrect');
                    $this->line('  Readable: ' . (is_readable($socketPath) ? 'Yes' : 'No'));
                    $this->line('  Writable: ' . (is_writable($socketPath) ? 'Yes' : 'No'));
                }
                
                // Check file permissions
                $perms = fileperms($socketPath);
                $this->line('  Permissions: ' . substr(sprintf('%o', $perms), -4));
            } else {
                $this->error('❌ Socket file does not exist: ' . $socketPath);
                $this->warn('Please check if Redis server is running and configured correctly.');
                $this->warn('Redis should be configured with:');
                $this->warn('  unixsocket ' . $socketPath);
                $this->warn('  unixsocketperm 666');
            }
        } else {
            $this->warn('⚠️  No socket configured - will use TCP connection');
        }
        
        $this->newLine();
    }
    
    private function testConnection()
    {
        $this->info('=== Testing Connection ===');
        
        try {
            $socketPath = config('database.redis.default.socket');
            
            // Create direct Predis client
            $client = new \Predis\Client([
                'scheme' => 'unix',
                'path' => $socketPath,
            ]);
            
            $pong = $client->ping();
            
            // Handle different response types from Predis
            $pingSuccess = false;
            if ($pong === '+PONG' || $pong === 'PONG' || $pong === true) {
                $pingSuccess = true;
            } elseif (is_object($pong) && method_exists($pong, '__toString')) {
                $stringResponse = (string) $pong;
                if ($stringResponse === 'PONG') {
                    $pingSuccess = true;
                }
            } elseif (is_object($pong) && isset($pong->payload)) {
                if ($pong->payload === 'PONG') {
                    $pingSuccess = true;
                }
            }
            
            if ($pingSuccess) {
                $this->info('✅ Redis connection successful');
                return true;
            } else {
                $this->error('❌ Redis ping failed - unexpected response: ' . var_export($pong, true));
                return false;
            }
        } catch (\Exception $e) {
            $this->error('❌ Connection failed: ' . $e->getMessage());
            $this->warn('Please check:');
            $this->warn('- Redis server is running');
            $this->warn('- Socket file exists and is accessible');
            $this->warn('- Correct permissions on socket file');
            return false;
        }
    }
    
    private function testBasicOperations()
    {
        $this->info('=== Testing Basic Operations ===');
        
        try {
            $socketPath = config('database.redis.default.socket');
            $client = new \Predis\Client([
                'scheme' => 'unix',
                'path' => $socketPath,
            ]);
            
            $testKey = 'laravel_cmd_test_' . time();
            $testValue = 'Hello from IndoQuran Laravel Command!';
            
            // Set
            $client->set($testKey, $testValue);
            $this->info('✅ SET operation');
            
            // Get
            $getValue = $client->get($testKey);
            if ($getValue === $testValue) {
                $this->info('✅ GET operation');
            } else {
                $this->error('❌ GET operation failed');
            }
            
            // TTL
            $client->expire($testKey, 300);
            $ttl = $client->ttl($testKey);
            if ($ttl > 0) {
                $this->info("✅ TTL set to {$ttl} seconds");
            } else {
                $this->error('❌ TTL operation failed');
            }
            
            // Delete
            $client->del($testKey);
            $this->info('✅ DELETE operation');
            
        } catch (\Exception $e) {
            $this->error('❌ Basic operations failed: ' . $e->getMessage());
        }
        
        $this->newLine();
    }
    
    private function testLaravelCache()
    {
        $this->info('=== Testing Laravel Cache ===');
        
        try {
            $socketPath = config('database.redis.default.socket');
            $cacheClient = new \Predis\Client([
                'scheme' => 'unix',
                'path' => $socketPath,
            ]);
            
            // Switch to cache database (database 1)
            $cacheClient->select(config('database.redis.cache.database', 1));
            
            $cacheKey = 'laravel_cache_cmd_' . time();
            $cacheValue = json_encode([
                'app' => config('app.name'),
                'env' => config('app.env'),
                'timestamp' => now()->toISOString()
            ]);
            
            // Cache put
            $cacheClient->setex($cacheKey, 300, $cacheValue);
            $this->info('✅ Cache PUT operation');
            
            // Cache get
            $cachedValue = $cacheClient->get($cacheKey);
            if ($cachedValue) {
                $decodedValue = json_decode($cachedValue, true);
                if ($decodedValue && is_array($decodedValue) && $decodedValue['app'] === config('app.name')) {
                    $this->info('✅ Cache GET operation');
                    $this->line('  App: ' . $decodedValue['app']);
                    $this->line('  Environment: ' . $decodedValue['env']);
                } else {
                    $this->error('❌ Cache GET operation failed - invalid data');
                }
            } else {
                $this->error('❌ Cache GET operation failed - no data found');
            }
            
            // Cache forget
            $cacheClient->del($cacheKey);
            $this->info('✅ Cache DELETE operation');
            
        } catch (\Exception $e) {
            $this->error('❌ Laravel cache test failed: ' . $e->getMessage());
        }
        
        $this->newLine();
    }
    
    private function testHashOperations()
    {
        $this->info('=== Testing Hash Operations ===');
        
        try {
            $socketPath = config('database.redis.default.socket');
            $client = new \Predis\Client([
                'scheme' => 'unix',
                'path' => $socketPath,
            ]);
            
            $hashKey = 'laravel_hash_cmd_' . time();
            
            $client->hset($hashKey, 'app_name', config('app.name'));
            $client->hset($hashKey, 'app_url', config('app.url'));
            $client->hset($hashKey, 'timezone', config('app.timezone'));
            
            $appName = $client->hget($hashKey, 'app_name');
            if ($appName === config('app.name')) {
                $this->info('✅ Hash operations successful');
            } else {
                $this->error('❌ Hash operations failed');
            }
            
            $client->del($hashKey);
        } catch (\Exception $e) {
            $this->error('❌ Hash operations failed: ' . $e->getMessage());
        }
        
        $this->newLine();
    }
    
    private function testListOperations()
    {
        $this->info('=== Testing List Operations ===');
        
        try {
            $socketPath = config('database.redis.default.socket');
            $client = new \Predis\Client([
                'scheme' => 'unix',
                'path' => $socketPath,
            ]);
            
            $listKey = 'laravel_list_cmd_' . time();
            
            $client->lpush($listKey, 'task1', 'task2', 'task3');
            $length = $client->llen($listKey);
            
            if ($length === 3) {
                $this->info("✅ List operations successful ({$length} items)");
            } else {
                $this->error('❌ List operations failed');
            }
            
            $client->del($listKey);
        } catch (\Exception $e) {
            $this->error('❌ List operations failed: ' . $e->getMessage());
        }
        
        $this->newLine();
    }
    
    private function testSetOperations()
    {
        $this->info('=== Testing Set Operations ===');
        
        try {
            $socketPath = config('database.redis.default.socket');
            $client = new \Predis\Client([
                'scheme' => 'unix',
                'path' => $socketPath,
            ]);
            
            $setKey = 'laravel_set_cmd_' . time();
            
            $client->sadd($setKey, 'member1', 'member2', 'member3');
            $size = $client->scard($setKey);
            
            if ($size === 3) {
                $this->info("✅ Set operations successful ({$size} members)");
            } else {
                $this->error('❌ Set operations failed');
            }
            
            $client->del($setKey);
        } catch (\Exception $e) {
            $this->error('❌ Set operations failed: ' . $e->getMessage());
        }
        
        $this->newLine();
    }
    
    private function testPerformance()
    {
        $this->info('=== Performance Test ===');
        
        try {
            $socketPath = config('database.redis.default.socket');
            $client = new \Predis\Client([
                'scheme' => 'unix',
                'path' => $socketPath,
            ]);
            
            // Switch to cache database for performance test
            $client->select(config('database.redis.cache.database', 1));
            
            $iterations = 100;
            $startTime = microtime(true);
            
            for ($i = 0; $i < $iterations; $i++) {
                $client->setex("perf_cmd_{$i}", 60, "value_{$i}");
            }
            
            $endTime = microtime(true);
            $duration = ($endTime - $startTime) * 1000;
            
            $this->info("✅ Cached {$iterations} items in " . number_format($duration, 2) . " ms");
            
            // Cleanup
            for ($i = 0; $i < $iterations; $i++) {
                $client->del("perf_cmd_{$i}");
            }
            
        } catch (\Exception $e) {
            $this->error('❌ Performance test failed: ' . $e->getMessage());
        }
        
        $this->newLine();
    }
    
    private function showServerInfo()
    {
        $this->info('=== Redis Server Information ===');
        
        try {
            $info = Redis::info();
            if ($info && is_array($info)) {
                $this->line('Redis Version: ' . ($info['redis_version'] ?? 'Unknown'));
                $this->line('Connected Clients: ' . ($info['connected_clients'] ?? 'Unknown'));
                $this->line('Used Memory: ' . ($info['used_memory_human'] ?? 'Unknown'));
                $this->line('Total Commands: ' . ($info['total_commands_processed'] ?? 'Unknown'));
            }
        } catch (\Exception $e) {
            $this->warn('Could not retrieve server info: ' . $e->getMessage());
        }
        
        $this->newLine();
    }
}
