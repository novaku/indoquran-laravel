<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

class RedisOptimizeCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'redis:optimize {--clear : Clear Redis cache (FLUSHDB) to immediately free all memory}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Diagnose and optimize Redis memory, set eviction policy to allkeys-lru to prevent OOM';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('=== Redis Memory Optimization ===');

        try {
            $info = Redis::info('memory');
            $serverInfo = Redis::info('server');

            $usedMemory = $info['used_memory_human'] ?? ($info['Memory']['used_memory_human'] ?? 'Unknown');
            $maxMemory = $info['maxmemory_human'] ?? ($info['Memory']['maxmemory_human'] ?? '0 (no limit)');
            $maxMemoryPolicy = $info['maxmemory_policy'] ?? ($info['Memory']['maxmemory_policy'] ?? 'unknown');

            $this->line("Redis Version: " . ($serverInfo['redis_version'] ?? ($serverInfo['Server']['redis_version'] ?? 'Unknown')));
            $this->line("Used Memory: {$usedMemory}");
            $this->line("Max Memory: {$maxMemory}");
            $this->line("Eviction Policy: {$maxMemoryPolicy}");
            $this->newLine();

            // Try to set maxmemory-policy to allkeys-lru
            if ($maxMemoryPolicy === 'noeviction') {
                $this->warn("⚠️  Current eviction policy is 'noeviction', which causes Redis to throw OOM errors when maxmemory is reached.");
            }

            try {
                $this->line("Attempting to set maxmemory-policy to 'allkeys-lru'...");
                Redis::command('config', ['set', 'maxmemory-policy', 'allkeys-lru']);
                $this->info("✅ Successfully set maxmemory-policy to 'allkeys-lru'!");
            } catch (\Throwable $e) {
                $this->warn("⚠️  Could not run CONFIG SET (may be restricted by host): " . $e->getMessage());
                $this->line("If this is a managed host, please set 'maxmemory-policy allkeys-lru' in your redis.conf or hosting panel.");
            }

            if ($this->option('clear')) {
                $this->newLine();
                $this->line("Flushing Redis database...");
                Redis::flushdb();
                $this->info("✅ Redis cache cleared (FLUSHDB successful)!");

                $newInfo = Redis::info('memory');
                $newUsed = $newInfo['used_memory_human'] ?? ($newInfo['Memory']['used_memory_human'] ?? 'Unknown');
                $this->info("New Used Memory: {$newUsed}");
            }

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error("❌ Redis optimization failed: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
