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
        // Test connection
        $pong = Redis::ping();
        
        if ($pong === '+PONG' || $pong === 'PONG') {
            $this->info('✅ Redis connection successful!');
            
            // Test basic operation
            $testKey = 'quick_test_' . time();
            Redis::set($testKey, 'Hello IndoQuran!');
            $value = Redis::get($testKey);
            Redis::del($testKey);
            
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
