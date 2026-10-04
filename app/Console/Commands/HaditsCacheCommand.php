<?php

namespace App\Console\Commands;

use App\Http\Controllers\HaditsController;
use App\Services\HaditsCacheService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Cache\RedisStore;

class HaditsCacheCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hadits:cache 
                            {action=clear : Aksi yang dijalankan (clear|status|warm-up)} 
                            {--kitab= : Opsional slug kitab hadits (contoh: shahih_bukhari, bukhari, muslim)}';

    /**
     * Command aliases
     *
     * @var array
     */
    protected $aliases = ['hadits:clear-cache'];

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kelola cache hadits (clear, status, warm-up)';

    protected HaditsCacheService $haditsCacheService;

    public function __construct(HaditsCacheService $haditsCacheService)
    {
        parent::__construct();
        $this->haditsCacheService = $haditsCacheService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $action = strtolower($this->argument('action'));

        return match ($action) {
            'clear' => $this->clearCache(),
            'warm-up', 'warmup' => $this->warmUpCache(),
            'status' => $this->checkStatus(),
            default => $this->invalidAction($action),
        };
    }

    /**
     * Clear hadith cache
     */
    protected function clearCache(): int
    {
        $kitabInput = $this->option('kitab');

        if ($kitabInput) {
            $resolved = HaditsController::resolveKitabSlug($kitabInput);
            if (!$resolved) {
                $this->error("❌ Kitab '{$kitabInput}' tidak dikenali.");
                $this->info("Kitab yang valid: " . implode(', ', array_keys(HaditsController::getKitabCatalog())));
                return 1;
            }

            $this->info("Membersihkan cache hadits untuk kitab: {$resolved}...");
            $cleared = $this->haditsCacheService->clearKitabCache($resolved);

            if ($cleared) {
                $this->info("✅ Cache hadits untuk kitab [{$resolved}] berhasil dibersihkan!");
                return 0;
            }

            $this->error("❌ Gagal membersihkan cache kitab [{$resolved}].");
            return 1;
        }

        $this->info('Membersihkan seluruh cache hadits (katalog, dropdown, halaman kitab, detail, pencarian)...');
        $cleared = $this->haditsCacheService->clearAllCache();

        if ($cleared) {
            $this->info('✅ Seluruh cache hadits berhasil dibersihkan!');
            return 0;
        }

        $this->error('❌ Gagal membersihkan seluruh cache hadits.');
        return 1;
    }

    /**
     * Warm up initial caches (catalog, dropdown, featured, first page of kitabs)
     */
    protected function warmUpCache(): int
    {
        $this->info('Memulai warm-up cache hadits...');

        try {
            $this->line('1. Meng-cache katalog hadits...');
            $this->haditsCacheService->getCatalog();

            $this->line('2. Meng-cache opsi dropdown hadits...');
            $this->haditsCacheService->getDropdownOptions();

            $this->line('3. Meng-cache hadits pilihan harian...');
            $this->haditsCacheService->getFeaturedHadits();

            $this->line('4. Meng-cache halaman 1 untuk setiap kitab hadits...');
            $catalog = HaditsController::getKitabCatalog();
            $bar = $this->output->createProgressBar(count($catalog));
            $bar->start();

            foreach ($catalog as $slug => $info) {
                $this->haditsCacheService->getKitabHadits($slug, 1, 20);
                $bar->advance();
            }

            $bar->finish();
            $this->newLine();

            $this->info('✅ Cache warm-up hadits selesai!');
            return 0;
        } catch (\Throwable $e) {
            $this->error('❌ Cache warm-up gagal: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Check hadith cache status
     */
    protected function checkStatus(): int
    {
        $this->info('=== Status Cache Hadits ===');
        $cacheStore = config('cache.default');
        $this->line("Driver Cache Default: <comment>{$cacheStore}</comment>");

        try {
            $store = Cache::getStore();

            if ($store instanceof RedisStore) {
                $redis = $store->connection();
                $cachePrefix = $store->getPrefix();

                $keys = $redis->keys($cachePrefix . 'hadits:*');
                $totalKeys = count($keys);

                $this->info("✅ Koneksi Redis aktif.");
                $this->line("Total key cache hadits aktif: <comment>{$totalKeys}</comment>");

                if ($totalKeys > 0) {
                    $this->newLine();
                    $this->line('Contoh key cache hadits yang tersimpan:');
                    $sampleKeys = array_slice($keys, 0, 8);
                    foreach ($sampleKeys as $k) {
                        $this->line('  • ' . str_replace($cachePrefix, '', $k));
                    }
                    if ($totalKeys > 8) {
                        $remaining = $totalKeys - 8;
                        $this->line("  ... dan {$remaining} key lainnya");
                    }
                }
            } else {
                $this->line("Store bukan Redis (menggunakan driver: {$cacheStore}).");
            }

            return 0;
        } catch (\Throwable $e) {
            $this->error('❌ Gagal memeriksa status cache: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Handle invalid action
     */
    protected function invalidAction(string $action): int
    {
        $this->error("❌ Aksi '{$action}' tidak valid.");
        $this->info('Aksi yang tersedia:');
        $this->line('  • clear    : Bersihkan cache hadits (opsional: --kitab=bukhari)');
        $this->line('  • warm-up  : Bangun ulang cache utama (katalog, dropdown, hal 1)');
        $this->line('  • status   : Tampilkan statistik dan key cache hadits saat ini');
        $this->newLine();
        $this->line('Contoh:');
        $this->line('  php artisan hadits:cache clear');
        $this->line('  php artisan hadits:clear-cache');
        $this->line('  php artisan hadits:cache clear --kitab=bukhari');
        return 1;
    }
}
