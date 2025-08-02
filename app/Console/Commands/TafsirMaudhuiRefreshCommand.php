<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Database\Seeders\TafsirMaudhuiSeeder;
use Illuminate\Support\Facades\Cache;

class TafsirMaudhuiRefreshCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tafsir:refresh {--clear-cache : Clear cache after refreshing data}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Refresh tafsir maudhui data from JSON file to database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Refreshing Tafsir Maudhui data...');
        
        try {
            // Run the seeder
            $seeder = new TafsirMaudhuiSeeder();
            $seeder->setCommand($this);
            $seeder->run();
            
            // Clear cache if requested
            if ($this->option('clear-cache')) {
                $this->info('🧹 Clearing cache...');
                $this->clearTafsirCache();
                $this->info('✅ Cache cleared successfully');
            }
            
            $this->info('✅ Tafsir Maudhui data refreshed successfully!');
            
            return Command::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error('❌ Error refreshing data: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
    
    /**
     * Clear tafsir-related cache entries
     */
    private function clearTafsirCache()
    {
        $keys = [
            'tafsir_maudhui_all_topics',
            'tafsir_maudhui_api_topics'
        ];

        foreach ($keys as $key) {
            Cache::forget($key);
        }
        
        // Clear search cache patterns (in production, you might want to use a more selective approach)
        // For now, we'll just forget the known keys
    }
}
