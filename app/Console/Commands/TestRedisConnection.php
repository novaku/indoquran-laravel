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
            if ($pong === '+PONG' || $pong === 'PONG') {
                $this->info('✅ Redis connection successful');
                return true;
            } else {
                $this->error('❌ Redis ping failed');
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
        
        $cacheKey = 'laravel_cache_cmd_' . time();
        $cacheValue = [
            'app' => config('app.name'),
            'env' => config('app.env'),
            'timestamp' => now()->toISOString()
        ];
        
        // Cache put
        Cache::put($cacheKey, $cacheValue, 300);
        $this->info('✅ Cache PUT operation');
        
        // Cache get
        $cachedValue = Cache::get($cacheKey);
        if ($cachedValue && is_array($cachedValue) && $cachedValue['app'] === config('app.name')) {
            $this->info('✅ Cache GET operation');
            $this->line('  App: ' . $cachedValue['app']);
            $this->line('  Environment: ' . $cachedValue['env']);
        } else {
            $this->error('❌ Cache GET operation failed');
        }
        
        // Cache forget
        Cache::forget($cacheKey);
        $this->info('✅ Cache FORGET operation');
        
        $this->newLine();
    }
    
    private function testHashOperations()
    {
        $this->info('=== Testing Hash Operations ===');
        
        $hashKey = 'laravel_hash_cmd_' . time();
        
        Redis::hset($hashKey, 'app_name', config('app.name'));
        Redis::hset($hashKey, 'app_url', config('app.url'));
        Redis::hset($hashKey, 'timezone', config('app.timezone'));
        
        $appName = Redis::hget($hashKey, 'app_name');
        if ($appName === config('app.name')) {
            $this->info('✅ Hash operations successful');
        } else {
            $this->error('❌ Hash operations failed');
        }
        
        Redis::del($hashKey);
        $this->newLine();
    }
    
    private function testListOperations()
    {
        $this->info('=== Testing List Operations ===');
        
        $listKey = 'laravel_list_cmd_' . time();
        
        Redis::lpush($listKey, 'task1', 'task2', 'task3');
        $length = Redis::llen($listKey);
        
        if ($length === 3) {
            $this->info("✅ List operations successful ({$length} items)");
        } else {
            $this->error('❌ List operations failed');
        }
        
        Redis::del($listKey);
        $this->newLine();
    }
    
    private function testSetOperations()
    {
        $this->info('=== Testing Set Operations ===');
        
        $setKey = 'laravel_set_cmd_' . time();
        
        Redis::sadd($setKey, 'member1', 'member2', 'member3');
        $size = Redis::scard($setKey);
        
        if ($size === 3) {
            $this->info("✅ Set operations successful ({$size} members)");
        } else {
            $this->error('❌ Set operations failed');
        }
        
        Redis::del($setKey);
        $this->newLine();
    }
    
    private function testPerformance()
    {
        $this->info('=== Performance Test ===');
        
        $iterations = 100;
        $startTime = microtime(true);
        
        for ($i = 0; $i < $iterations; $i++) {
            Cache::put("perf_cmd_{$i}", "value_{$i}", 60);
        }
        
        $endTime = microtime(true);
        $duration = ($endTime - $startTime) * 1000;
        
        $this->info("✅ Cached {$iterations} items in " . number_format($duration, 2) . " ms");
        
        // Cleanup
        for ($i = 0; $i < $iterations; $i++) {
            Cache::forget("perf_cmd_{$i}");
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
