<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

class AsmaulHusnaRefreshCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'asmaul-husna:refresh {--clear-cache : Clear related cache after refresh}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Refresh Asmaul Husna data from JSON file to database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting Asmaul Husna data refresh...');
        $this->newLine();

        try {
            // Run the seeder
            $this->info('📊 Running Asmaul Husna seeder...');
            Artisan::call('db:seed', [
                '--class' => 'AsmaulHusnaSeeder'
            ]);
            
            $this->info(Artisan::output());

            // Clear cache if requested
            if ($this->option('clear-cache')) {
                $this->info('🧹 Clearing Asmaul Husna cache...');
                
                $cacheKeys = [
                    'asmaul_husna_all_names',
                    'asmaul_husna_api_data'
                ];

                foreach ($cacheKeys as $key) {
                    Cache::forget($key);
                    $this->line("   • Cleared: {$key}");
                }

                $this->info('✅ Cache cleared successfully!');
            }

            $this->newLine();
            $this->info('🎉 Asmaul Husna data refresh completed successfully!');
            
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ Error refreshing Asmaul Husna data: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
