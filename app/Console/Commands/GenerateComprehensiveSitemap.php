<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Surah;
use App\Http\Controllers\HaditsController;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;

class GenerateComprehensiveSitemap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sitemap:generate-comprehensive {--production : Generate for production environment}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate comprehensive sitemap files optimized for Google crawling';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Generating comprehensive sitemap files...');
        
        $isProduction = $this->option('production');
        $baseUrl = $isProduction 
            ? 'https://indoquran.web.id' 
            : ((app()->environment('production') && !app()->environment(['local', 'development', 'testing'])) 
                ? 'https://indoquran.web.id' 
                : config('app.url'));
        
        $this->info("Base URL: {$baseUrl}");
        
        // Generate main sitemap.xml (all primary canonical URLs)
        $this->generateMainSitemap($baseUrl);
        
        // Generate sitemap index
        $this->generateSitemapIndex($baseUrl);
        
        // Generate individual modular sitemap files
        $this->generateMainContentSitemap($baseUrl);
        $this->generateArtikelSitemap($baseUrl);
        $this->generateJuzSitemap($baseUrl);
        $this->generateHalamanSitemap($baseUrl);
        $this->generateHaditsSitemaps($baseUrl);
        
        // Cleanup any obsolete surah group sitemaps
        $this->cleanupLegacySitemaps();

        // Update robots.txt
        $this->updateRobotsTxt($baseUrl);
        
        $this->info('✅ Comprehensive sitemap generation completed!');
        
        return 0;
    }
    
    /**
     * Generate main sitemap.xml (containing all canonical indexable URLs)
     */
    protected function generateMainSitemap($baseUrl)
    {
        $this->info('Generating main sitemap.xml...');
        
        $currentDate = Carbon::now()->format('Y-m-d');
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
        
        // Static pages
        $staticPages = [
            '' => ['priority' => '1.0', 'changefreq' => 'daily'],
            'cari' => ['priority' => '0.8', 'changefreq' => 'weekly'],
            'surah' => ['priority' => '0.9', 'changefreq' => 'weekly'],
            'daftar-lengkap' => ['priority' => '0.9', 'changefreq' => 'weekly'],
            'juz' => ['priority' => '0.8', 'changefreq' => 'weekly'],
            'halaman' => ['priority' => '0.8', 'changefreq' => 'weekly'],
            'asmaul-husna' => ['priority' => '0.7', 'changefreq' => 'monthly'],
            'tafsir-maudhui' => ['priority' => '0.7', 'changefreq' => 'monthly'],
            'doa-bersama' => ['priority' => '0.6', 'changefreq' => 'weekly'],
            'tentang' => ['priority' => '0.6', 'changefreq' => 'monthly'],
            'kontak' => ['priority' => '0.5', 'changefreq' => 'monthly'],
            'donasi' => ['priority' => '0.4', 'changefreq' => 'monthly'],
            'riwayat-versi' => ['priority' => '0.4', 'changefreq' => 'monthly'],
            'kebijakan' => ['priority' => '0.3', 'changefreq' => 'yearly'],
            'syarat-ketentuan' => ['priority' => '0.3', 'changefreq' => 'yearly'],
            'artikel' => ['priority' => '0.85', 'changefreq' => 'daily'],
            'hadits' => ['priority' => '0.9', 'changefreq' => 'weekly'],
        ];
        
        foreach ($staticPages as $path => $config) {
            $xml .= $this->createUrlEntry(
                $baseUrl . ($path ? '/' . $path : ''),
                $currentDate,
                $config['changefreq'],
                $config['priority']
            );
        }
        
        // Add all 114 surah overview pages
        $surahs = Surah::select('number', 'updated_at')->get();
        foreach ($surahs as $surah) {
            $xml .= $this->createUrlEntry(
                $baseUrl . '/surah/' . $surah->number,
                $surah->updated_at ? $surah->updated_at->format('Y-m-d') : $currentDate,
                'weekly',
                '0.9'
            );
        }

        // Add 30 Juz pages
        for ($juz = 1; $juz <= 30; $juz++) {
            $xml .= $this->createUrlEntry(
                $baseUrl . '/juz/' . $juz,
                $currentDate,
                'weekly',
                '0.8'
            );
        }

        // Add 604 Mushaf pages
        for ($page = 1; $page <= 604; $page++) {
            $xml .= $this->createUrlEntry(
                $baseUrl . '/halaman/' . $page,
                $currentDate,
                'weekly',
                '0.7'
            );
        }

        // Add 7 Hadits book pages
        foreach (HaditsController::getKitabCatalog() as $slug => $kitab) {
            $xml .= $this->createUrlEntry(
                $baseUrl . '/hadits/' . $slug,
                $currentDate,
                'monthly',
                '0.85'
            );
        }
        
        $xml .= '</urlset>';
        File::put(public_path('sitemap.xml'), $xml);
        $this->info('✓ Main sitemap.xml generated');
    }
    
    /**
     * Generate sitemap index file
     */
    protected function generateSitemapIndex($baseUrl)
    {
        $this->info('Generating sitemap index...');
        
        $currentDate = Carbon::now()->format('Y-m-d\TH:i:s\Z');
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
        
        // Main content sitemap (static pages + 114 surahs)
        $xml .= $this->createSitemapEntry($baseUrl . '/sitemap-main.xml', $currentDate);

        // Artikel sitemap (all published articles)
        $xml .= $this->createSitemapEntry($baseUrl . '/sitemap-artikel.xml', $currentDate);
        
        // Juz sitemap (30 Juz)
        $xml .= $this->createSitemapEntry($baseUrl . '/sitemap-juz.xml', $currentDate);

        // Halaman sitemap (604 Mushaf pages)
        $xml .= $this->createSitemapEntry($baseUrl . '/sitemap-halaman.xml', $currentDate);

        // Hadits main sitemap (hub + 7 books)
        $xml .= $this->createSitemapEntry($baseUrl . '/sitemap-hadits-main.xml', $currentDate);

        // Hadits topic landing pages sitemap
        $xml .= $this->createSitemapEntry($baseUrl . '/sitemap-hadits-topik.xml', $currentDate);

        // Hadits book sitemaps (all 7 books)
        foreach (HaditsController::getKitabCatalog() as $slug => $kitab) {
            $xml .= $this->createSitemapEntry($baseUrl . '/sitemap-hadits-' . $slug . '.xml', $currentDate);
        }
        
        $xml .= '</sitemapindex>';
        File::put(public_path('sitemap-index.xml'), $xml);
        $this->info('✓ Sitemap index generated');
    }
    
    /**
     * Generate Artikel sitemap
     */
    protected function generateArtikelSitemap($baseUrl)
    {
        $this->info('Generating Artikel sitemap...');
        
        $currentDate = Carbon::now()->format('Y-m-d');
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
        
        $xml .= $this->createUrlEntry(
            $baseUrl . '/artikel',
            $currentDate,
            'daily',
            '0.9'
        );

        try {
            $articles = \App\Models\Article::published()->select('slug', 'updated_at')->get();
            foreach ($articles as $article) {
                $xml .= $this->createUrlEntry(
                    $baseUrl . '/artikel/' . $article->slug,
                    $article->updated_at ? $article->updated_at->format('Y-m-d') : $currentDate,
                    'weekly',
                    '0.85'
                );
            }
        } catch (\Throwable $e) {
            // Ignore if table not available
        }
        
        $xml .= '</urlset>';
        File::put(public_path('sitemap-artikel.xml'), $xml);
        $this->info('✓ Artikel sitemap generated');
    }
    
    /**
     * Generate main content sitemap
     */
    protected function generateMainContentSitemap($baseUrl)
    {
        $this->info('Generating main content sitemap...');
        
        $currentDate = Carbon::now()->format('Y-m-d');
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
        
        // Static pages
        $staticPages = [
            '' => ['priority' => '1.0', 'changefreq' => 'daily'],
            'cari' => ['priority' => '0.8', 'changefreq' => 'weekly'],
            'surah' => ['priority' => '0.9', 'changefreq' => 'weekly'],
            'daftar-lengkap' => ['priority' => '0.9', 'changefreq' => 'weekly'],
            'juz' => ['priority' => '0.8', 'changefreq' => 'weekly'],
            'halaman' => ['priority' => '0.8', 'changefreq' => 'weekly'],
            'asmaul-husna' => ['priority' => '0.7', 'changefreq' => 'monthly'],
            'tafsir-maudhui' => ['priority' => '0.7', 'changefreq' => 'monthly'],
            'doa-bersama' => ['priority' => '0.6', 'changefreq' => 'weekly'],
            'tentang' => ['priority' => '0.6', 'changefreq' => 'monthly'],
            'kontak' => ['priority' => '0.5', 'changefreq' => 'monthly'],
            'donasi' => ['priority' => '0.4', 'changefreq' => 'monthly'],
            'riwayat-versi' => ['priority' => '0.4', 'changefreq' => 'monthly'],
            'kebijakan' => ['priority' => '0.3', 'changefreq' => 'yearly'],
            'syarat-ketentuan' => ['priority' => '0.3', 'changefreq' => 'yearly'],
            'artikel' => ['priority' => '0.85', 'changefreq' => 'daily'],
            'hadits' => ['priority' => '0.9', 'changefreq' => 'weekly'],
        ];
        
        foreach ($staticPages as $path => $config) {
            $xml .= $this->createUrlEntry(
                $baseUrl . ($path ? '/' . $path : ''),
                $currentDate,
                $config['changefreq'],
                $config['priority']
            );
        }
        
        // All surah overview pages
        $surahs = Surah::select('number', 'updated_at')->get();
        foreach ($surahs as $surah) {
            $xml .= $this->createUrlEntry(
                $baseUrl . '/surah/' . $surah->number,
                $surah->updated_at ? $surah->updated_at->format('Y-m-d') : $currentDate,
                'weekly',
                '0.9'
            );
        }

        // Add 7 Hadits book pages
        foreach (HaditsController::getKitabCatalog() as $slug => $kitab) {
            $xml .= $this->createUrlEntry(
                $baseUrl . '/hadits/' . $slug,
                $currentDate,
                'monthly',
                '0.85'
            );
        }
        
        $xml .= '</urlset>';
        File::put(public_path('sitemap-main.xml'), $xml);
        $this->info('✓ Main content sitemap generated');
    }
    
    /**
     * Generate Juz sitemap
     */
    protected function generateJuzSitemap($baseUrl)
    {
        $this->info('Generating Juz sitemap...');
        
        $currentDate = Carbon::now()->format('Y-m-d');
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
        
        // Add all 30 Juz pages
        for ($juz = 1; $juz <= 30; $juz++) {
            $xml .= $this->createUrlEntry(
                $baseUrl . '/juz/' . $juz,
                $currentDate,
                'weekly',
                '0.8'
            );
        }
        
        $xml .= '</urlset>';
        File::put(public_path('sitemap-juz.xml'), $xml);
        $this->info('✓ Juz sitemap generated');
    }

    /**
     * Generate Halaman sitemap
     */
    protected function generateHalamanSitemap($baseUrl)
    {
        $this->info('Generating Halaman sitemap...');
        
        $currentDate = Carbon::now()->format('Y-m-d');
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
        
        // Add all 604 Mushaf pages
        for ($page = 1; $page <= 604; $page++) {
            $xml .= $this->createUrlEntry(
                $baseUrl . '/halaman/' . $page,
                $currentDate,
                'weekly',
                '0.7'
            );
        }
        
        $xml .= '</urlset>';
        File::put(public_path('sitemap-halaman.xml'), $xml);
        $this->info('✓ Halaman sitemap generated');
    }

    /**
     * Generate Hadits sitemaps (index, main hub, and 7 individual book sitemaps)
     */
    protected function generateHaditsSitemaps($baseUrl)
    {
        $this->info('Generating Hadits sitemaps...');
        $currentDate = Carbon::now()->format('Y-m-d');
        $isoDate = Carbon::now()->format('Y-m-d\TH:i:s\Z');
        $catalog = HaditsController::getKitabCatalog();

        // 1. Generate sitemap-hadits-main.xml (hub + 7 book pages)
        $mainXml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $mainXml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
        $mainXml .= $this->createUrlEntry($baseUrl . '/hadits', $currentDate, 'weekly', '0.9');

        foreach ($catalog as $slug => $kitab) {
            $mainXml .= $this->createUrlEntry($baseUrl . '/hadits/' . $slug, $currentDate, 'monthly', '0.85');
        }
        $mainXml .= '</urlset>';
        File::put(public_path('sitemap-hadits-main.xml'), $mainXml);
        $this->info('✓ sitemap-hadits-main.xml generated');

        // 2. Generate individual sitemaps for each of the 7 books
        foreach ($catalog as $slug => $kitab) {
            $isKutubusSittah = in_array($slug, [
                'shahih_bukhari', 'shahih_muslim', 'sunan_abu_daud',
                'sunan_tirmidzi', 'sunan_nasai', 'sunan_ibnu_majah'
            ], true);
            $priority = $isKutubusSittah ? '0.75' : '0.70';

            $numbers = [];
            $table = $kitab['table'] ?? null;
            if ($table && \Illuminate\Support\Facades\Schema::hasTable($table)) {
                $hasNo = \Illuminate\Support\Facades\Schema::hasColumn($table, 'no');
                $col = $hasNo ? 'no' : 'id';
                $numbers = \Illuminate\Support\Facades\DB::table($table)->orderBy($col, 'asc')->pluck($col)->all();
            }

            if (empty($numbers)) {
                $total = $kitab['total'];
                $numbers = range(1, $total);
            }

            $bookXml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
            $bookXml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

            foreach ($numbers as $num) {
                $bookXml .= $this->createUrlEntry($baseUrl . '/hadits/' . $slug . '/' . $num, $currentDate, 'monthly', $priority);
            }

            $bookXml .= '</urlset>';
            File::put(public_path("sitemap-hadits-{$slug}.xml"), $bookXml);
            $count = count($numbers);
            $this->info("✓ sitemap-hadits-{$slug}.xml generated ({$count} hadits)");
        }

        // 3. Generate sitemap-hadits-topik.xml (High-traffic thematic topic landing pages)
        $topics = [
            'takdir', 'shalat', 'jenazah', 'iddah', 'matahari', 'wudhu',
            'puasa', 'zakat', 'sabar', 'taubat', 'ilmu', 'nikah',
            'rezeki', 'doa', 'akhlak', 'surga', 'neraka', 'silaturahmi',
            'kematian', 'riba'
        ];
        $topicXml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $topicXml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
        foreach ($topics as $topic) {
            $topicXml .= $this->createUrlEntry($baseUrl . '/hadits/tentang/' . $topic, $currentDate, 'weekly', '0.8');
        }
        $topicXml .= '</urlset>';
        File::put(public_path('sitemap-hadits-topik.xml'), $topicXml);
        $this->info('✓ sitemap-hadits-topik.xml generated (20 high-intent topics)');

        // 4. Generate dedicated sitemap-hadits.xml (Hadits Sitemap Index)
        $indexXml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $indexXml .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
        $indexXml .= $this->createSitemapEntry($baseUrl . '/sitemap-hadits-main.xml', $isoDate);
        $indexXml .= $this->createSitemapEntry($baseUrl . '/sitemap-hadits-topik.xml', $isoDate);

        foreach ($catalog as $slug => $kitab) {
            $indexXml .= $this->createSitemapEntry($baseUrl . "/sitemap-hadits-{$slug}.xml", $isoDate);
        }

        $indexXml .= '</sitemapindex>';
        File::put(public_path('sitemap-hadits.xml'), $indexXml);
        $this->info('✓ sitemap-hadits.xml (Hadits Sitemap Index) generated');
    }

    /**
     * Clean up legacy surah group and obsolete hadits book XML files from public directory
     */
    protected function cleanupLegacySitemaps()
    {
        // 1. Delete legacy bloated surah group sitemaps
        $files = File::glob(public_path('sitemap-surahs-*.xml'));
        foreach ($files as $file) {
            File::delete($file);
            $this->info('✓ Deleted legacy bloated sitemap: ' . basename($file));
        }

        // 2. Delete obsolete hadits book sitemaps not in current catalog
        $validSlugs = array_keys(HaditsController::getKitabCatalog());
        $haditsFiles = File::glob(public_path('sitemap-hadits-*.xml'));
        foreach ($haditsFiles as $file) {
            $filename = basename($file);
            if ($filename === 'sitemap-hadits-main.xml' || $filename === 'sitemap-hadits-topik.xml') {
                continue;
            }
            $slug = preg_replace('/^sitemap-hadits-(.+)\.xml$/', '$1', $filename);
            if (!in_array($slug, $validSlugs, true)) {
                File::delete($file);
                $this->info('✓ Deleted obsolete hadits sitemap: ' . $filename);
            }
        }
    }
    
    /**
     * Update robots.txt with sitemap references
     */
    protected function updateRobotsTxt($baseUrl)
    {
        $this->info('Updating robots.txt...');
        
        $robotsTxt = "User-agent: *\nAllow: /\n\n";
        $robotsTxt .= "# Disallow private and account pages\n";
        $robotsTxt .= "Disallow: /auth/\n";
        $robotsTxt .= "Disallow: /profile\n";
        $robotsTxt .= "Disallow: /profil\n";
        $robotsTxt .= "Disallow: /bookmarks\n";
        $robotsTxt .= "Disallow: /penanda\n";
        $robotsTxt .= "Disallow: /masuk\n";
        $robotsTxt .= "Disallow: /daftar\n";
        $robotsTxt .= "Disallow: /login\n";
        $robotsTxt .= "Disallow: /register\n";
        $robotsTxt .= "Disallow: /logout\n";
        $robotsTxt .= "Disallow: /api/\n";
        $robotsTxt .= "Disallow: /admin/\n";
        $robotsTxt .= "Disallow: /dashboard/\n\n";
        $robotsTxt .= "# Disallow search and filter URLs\n";
        $robotsTxt .= "Disallow: /cari?\n";
        $robotsTxt .= "Disallow: /cari/*\n";
        $robotsTxt .= "Disallow: /search\n";
        $robotsTxt .= "Disallow: /search?\n";
        $robotsTxt .= "Disallow: /*?*tag=\n";
        $robotsTxt .= "Disallow: /*?*search=\n";
        $robotsTxt .= "Disallow: /artikel?*\n\n";
        $robotsTxt .= "# Allow important pages\n";
        $robotsTxt .= "Allow: /cari$\n";
        $robotsTxt .= "Allow: /surah\n";
        $robotsTxt .= "Allow: /surah/\n";
        $robotsTxt .= "Allow: /daftar-lengkap\n";
        $robotsTxt .= "Allow: /juz\n";
        $robotsTxt .= "Allow: /juz/\n";
        $robotsTxt .= "Allow: /halaman\n";
        $robotsTxt .= "Allow: /halaman/\n";
        $robotsTxt .= "Allow: /artikel$\n";
        $robotsTxt .= "Allow: /artikel/\n";
        $robotsTxt .= "Allow: /asmaul-husna\n";
        $robotsTxt .= "Allow: /tafsir-maudhui\n";
        $robotsTxt .= "Allow: /doa-bersama\n";
        $robotsTxt .= "Allow: /tentang\n";
        $robotsTxt .= "Allow: /kontak\n";
        $robotsTxt .= "Allow: /donasi\n";
        $robotsTxt .= "Allow: /riwayat-versi\n";
        $robotsTxt .= "Allow: /kebijakan\n";
        $robotsTxt .= "Allow: /hadits\n";
        $robotsTxt .= "Allow: /hadits/\n";
        $robotsTxt .= "Allow: /hadits/tentang/\n";
        $robotsTxt .= "Allow: /amp/\n\n";
        $robotsTxt .= "# Crawl delay for respectful crawling\n";
        $robotsTxt .= "Crawl-delay: 1\n\n";
        $robotsTxt .= "# Sitemaps\n";
        $robotsTxt .= "Sitemap: {$baseUrl}/sitemap.xml\n";
        $robotsTxt .= "Sitemap: {$baseUrl}/sitemap-index.xml\n";
        $robotsTxt .= "Sitemap: {$baseUrl}/sitemap-main.xml\n";
        $robotsTxt .= "Sitemap: {$baseUrl}/sitemap-artikel.xml\n";
        $robotsTxt .= "Sitemap: {$baseUrl}/sitemap-hadits.xml\n";
        $robotsTxt .= "Sitemap: {$baseUrl}/sitemap-hadits-topik.xml\n\n";
        $robotsTxt .= "# Googlebot specific\n";
        $robotsTxt .= "User-agent: Googlebot\n";
        $robotsTxt .= "Allow: /\n";
        $robotsTxt .= "Allow: /cari$\n";
        $robotsTxt .= "Disallow: /cari?\n";
        $robotsTxt .= "Disallow: /cari/*\n";
        $robotsTxt .= "Disallow: /search\n";
        $robotsTxt .= "Disallow: /search?\n";
        $robotsTxt .= "Disallow: /api/\n";
        $robotsTxt .= "Disallow: /admin/\n";
        $robotsTxt .= "Crawl-delay: 0.5\n\n";
        $robotsTxt .= "User-agent: Googlebot-Image\n";
        $robotsTxt .= "Allow: /images/\n";
        $robotsTxt .= "Allow: /storage/\n";
        $robotsTxt .= "Allow: /android-chrome-*.png\n";
        $robotsTxt .= "Allow: /apple-touch-icon.png\n";
        $robotsTxt .= "Allow: /favicon.ico\n\n";
        $robotsTxt .= "User-agent: Bingbot\n";
        $robotsTxt .= "Allow: /\n";
        $robotsTxt .= "Crawl-delay: 1\n\n";
        $robotsTxt .= "User-agent: Slurp\n";
        $robotsTxt .= "Allow: /\n";
        $robotsTxt .= "Crawl-delay: 1\n";
        
        File::put(public_path('robots.txt'), $robotsTxt);
        $this->info('✓ robots.txt updated');
    }
    
    /**
     * Create a sitemap entry for the sitemap index
     */
    protected function createSitemapEntry($loc, $lastmod)
    {
        return "  <sitemap>\n" .
            "    <loc>{$loc}</loc>\n" .
            "    <lastmod>{$lastmod}</lastmod>\n" .
            "  </sitemap>\n";
    }
    
    /**
     * Create a URL entry for the sitemap
     */
    protected function createUrlEntry($loc, $lastmod, $changefreq, $priority)
    {
        return "  <url>\n" .
            "    <loc>{$loc}</loc>\n" .
            "    <lastmod>{$lastmod}</lastmod>\n" .
            "    <changefreq>{$changefreq}</changefreq>\n" .
            "    <priority>{$priority}</priority>\n" .
            "  </url>\n";
    }
}
