<?php

namespace App\Console\Commands;

use App\Services\QuranCacheService;
use Illuminate\Console\Command;

class QuranCacheCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'quran:cache {action : Action to perform (clear|warm-up|status)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage Quran cache (clear, warm-up, or check status)';

    protected QuranCacheService $quranCacheService;

    /**
     * Create a new command instance.
     */
    public function __construct(QuranCacheService $quranCacheService)
    {
        parent::__construct();
        $this->quranCacheService = $quranCacheService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $action = $this->argument('action');

        switch ($action) {
            case 'clear':
                return $this->clearCache();
            case 'warm-up':
                return $this->warmUpCache();
            case 'status':
                return $this->checkStatus();
            default:
                $this->error("Invalid action: {$action}");
                $this->info('Valid actions: clear, warm-up, status');
                return 1;
        }
    }

    /**
     * Clear all Quran cache
     */
    private function clearCache(): int
    {
        $this->info('Clearing Quran cache...');
        
        try {
            $this->quranCacheService->clearCache();
            $this->info('✅ Quran cache cleared successfully!');
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Failed to clear cache: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Warm up the cache
     */
    private function warmUpCache(): int
    {
        $this->info('Warming up Quran cache...');
        
        try {
            $this->quranCacheService->warmUpCache();
            $this->info('✅ Cache warm-up completed successfully!');
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Failed to warm up cache: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Check cache status
     */
    private function checkStatus(): int
    {
        $this->info('Checking Quran cache status...');
        
        try {
            // Check if Redis is working
            $cacheStore = config('cache.default');
            $this->info("Default cache store: {$cacheStore}");
            
            if ($cacheStore === 'redis') {
                $redis = \Illuminate\Support\Facades\Cache::getRedis();
                $this->info('✅ Redis connection is working');
                
                // Check some cache keys
                $keys = $redis->keys(config('cache.prefix') . 'quran:*');
                $this->info('Cached Quran keys found: ' . count($keys));
                
                if (count($keys) > 0) {
                    $this->info('Sample cached keys:');
                    foreach (array_slice($keys, 0, 5) as $key) {
                        $this->info('  - ' . str_replace(config('cache.prefix'), '', $key));
                    }
                    if (count($keys) > 5) {
                        $this->info('  ... and ' . (count($keys) - 5) . ' more');
                    }
                }
            } else {
                $this->warn("⚠️  Cache store is not Redis: {$cacheStore}");
            }
            
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Cache status check failed: ' . $e->getMessage());
            return 1;
        }
    }
}
