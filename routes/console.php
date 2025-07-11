<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Redis;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('redis:quick-test', function () {
    $socketPath = config('database.redis.default.socket');
    
    $this->info("Testing Redis connection to: {$socketPath}");
    
    try {
        // Force disconnect any existing connections
        Redis::disconnect();
        
        // Create a fresh Predis client directly with socket configuration
        $client = new \Predis\Client([
            'scheme' => 'unix',
            'path' => $socketPath,
        ]);
        
        // Test connection
        $pong = $client->ping();
        
        if ($pong === '+PONG' || $pong === 'PONG') {
            $this->info('✅ Redis connection successful!');
            
            // Test basic operation
            $testKey = 'quick_test_' . time();
            $client->set($testKey, 'Hello IndoQuran!');
            $value = $client->get($testKey);
            $client->del($testKey);
            
            if ($value === 'Hello IndoQuran!') {
                $this->info('✅ Basic Redis operations working!');
            } else {
                $this->error('❌ Basic operations failed');
            }
        } else {
            $this->error('❌ Redis ping failed');
        }
    } catch (\Exception $e) {
        $this->error('❌ Connection failed: ' . $e->getMessage());
        $this->warn('Troubleshooting tips:');
        $this->warn("1. Check if Redis server is running");
        $this->warn("2. Verify socket file exists: {$socketPath}");
        $this->warn("3. Check socket file permissions");
        $this->warn("4. Ensure proper Redis configuration");
    }
})->purpose('Quick Redis connection test using socket path');

Artisan::command('redis:debug', function () {
    $this->info('=== Redis Configuration Debug ===');
    
    // Check environment variables
    $this->line('Environment Variables:');
    $this->line('REDIS_CLIENT: ' . (env('REDIS_CLIENT') ?: 'not set'));
    $this->line('REDIS_SOCKET: ' . (env('REDIS_SOCKET') ?: 'not set'));
    $this->line('REDIS_HOST: ' . (env('REDIS_HOST') !== null ? '"' . env('REDIS_HOST') . '"' : 'not set'));
    $this->line('REDIS_PORT: ' . (env('REDIS_PORT') !== null ? '"' . env('REDIS_PORT') . '"' : 'not set'));
    $this->line('REDIS_PASSWORD: ' . (env('REDIS_PASSWORD') !== null ? '"' . env('REDIS_PASSWORD') . '"' : 'not set'));
    
    $this->newLine();
    $this->line('Laravel Config:');
    $defaultConfig = config('database.redis.default');
    foreach ($defaultConfig as $key => $value) {
        $this->line("{$key}: " . ($value !== null ? '"' . $value . '"' : 'null'));
    }
    
    $this->newLine();
    $this->line('Cache Config:');
    $cacheConfig = config('database.redis.cache');
    foreach ($cacheConfig as $key => $value) {
        $this->line("{$key}: " . ($value !== null ? '"' . $value . '"' : 'null'));
    }
    
    // Check socket file
    $socketPath = config('database.redis.default.socket');
    $this->newLine();
    $this->line('Socket File Check:');
    if ($socketPath) {
        $this->line("Socket path: {$socketPath}");
        $this->line('File exists: ' . (file_exists($socketPath) ? 'YES' : 'NO'));
        if (file_exists($socketPath)) {
            $this->line('Is socket: ' . (is_link($socketPath) || (file_exists($socketPath) && filetype($socketPath) === 'socket') ? 'YES' : 'NO'));
            $this->line('Readable: ' . (is_readable($socketPath) ? 'YES' : 'NO'));
            $this->line('Writable: ' . (is_writable($socketPath) ? 'YES' : 'NO'));
        }
    } else {
        $this->error('No socket path configured!');
    }
    
    // Test direct Predis connection
    $this->newLine();
    $this->line('Direct Predis Test:');
    try {
        $client = new \Predis\Client([
            'scheme' => 'unix',
            'path' => $socketPath,
        ]);
        $pong = $client->ping();
        $this->info("✅ Direct Predis connection successful: {$pong}");
    } catch (\Exception $e) {
        $this->error('❌ Direct Predis connection failed: ' . $e->getMessage());
    }
    
})->purpose('Debug Redis configuration and connection');

Artisan::command('redis:safe-clear', function () {
    $this->info('=== Safe Redis Cache Clear ===');
    
    try {
        // Clear caches without triggering Redis connections
        $this->info('Clearing configuration cache...');
        \Illuminate\Support\Facades\Artisan::call('config:clear');
        
        $this->info('Clearing route cache...');
        \Illuminate\Support\Facades\Artisan::call('route:clear');
        
        $this->info('Clearing view cache...');
        \Illuminate\Support\Facades\Artisan::call('view:clear');
        
        // Manually clear Redis cache using direct connection
        $socketPath = config('database.redis.default.socket');
        if ($socketPath && file_exists($socketPath)) {
            $this->info('Clearing Redis cache via socket...');
            
            $client = new \Predis\Client([
                'scheme' => 'unix',
                'path' => $socketPath,
            ]);
            
            // Clear cache database (database 1)
            $client->select(1);
            $client->flushdb();
            
            $this->info('✅ Redis cache cleared successfully');
        } else {
            $this->warn('⚠️  Redis socket not available, skipping Redis cache clear');
        }
        
        $this->info('✅ All caches cleared safely');
        
    } catch (\Exception $e) {
        $this->error('❌ Cache clear failed: ' . $e->getMessage());
    }
})->purpose('Safely clear caches without triggering Redis connection issues');
