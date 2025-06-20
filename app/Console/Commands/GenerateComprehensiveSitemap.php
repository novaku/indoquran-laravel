<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Surah;
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
        $baseUrl = $isProduction ? 'https://my.indoquran.web.id' : config('app.url');
        
        $this->info("Base URL: {$baseUrl}");
        
        // Generate main sitemap.xml (lightweight version for backward compatibility)
        $this->generateMainSitemap($baseUrl);
        
        // Generate sitemap index
        $this->generateSitemapIndex($baseUrl);
        
        // Generate individual sitemap files
        $this->generateMainContentSitemap($baseUrl);
        $this->generateSurahSitemaps($baseUrl);
        $this->generateJuzSitemap($baseUrl);
        
        // Update robots.txt
        $this->updateRobotsTxt($baseUrl);
        
        $this->info('✅ Comprehensive sitemap generation completed!');
        
        return 0;
    }
    
    /**
     * Generate main sitemap.xml (backward compatible)
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
            'tentang' => ['priority' => '0.6', 'changefreq' => 'monthly'],
            'kontak' => ['priority' => '0.5', 'changefreq' => 'monthly'],
            'kebijakan' => ['priority' => '0.3', 'changefreq' => 'yearly'],
        ];
        
        foreach ($staticPages as $path => $config) {
            $xml .= $this->createUrlEntry(
                $baseUrl . ($path ? '/' . $path : ''),
                $currentDate,
                $config['changefreq'],
                $config['priority']
            );
        }
        
        // Add top surahs only (to keep file size manageable)
        $surahs = Surah::select('number', 'updated_at')->limit(20)->get();
        foreach ($surahs as $surah) {
            $xml .= $this->createUrlEntry(
                $baseUrl . '/surah/' . $surah->number,
                $surah->updated_at ? $surah->updated_at->format('Y-m-d') : $currentDate,
                'weekly',
                '0.9'
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
        
        // Main content sitemap
        $xml .= $this->createSitemapEntry($baseUrl . '/sitemap-main.xml', $currentDate);
        
        // Surah group sitemaps
        $surahCount = Surah::count();
        $groupCount = ceil($surahCount / 20);
        
        for ($i = 1; $i <= $groupCount; $i++) {
            $xml .= $this->createSitemapEntry($baseUrl . '/sitemap-surahs-' . $i . '.xml', $currentDate);
        }
        
        // Juz sitemap
        $xml .= $this->createSitemapEntry($baseUrl . '/sitemap-juz.xml', $currentDate);
        
        $xml .= '</sitemapindex>';
        File::put(public_path('sitemap-index.xml'), $xml);
        $this->info('✓ Sitemap index generated');
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
            'tentang' => ['priority' => '0.6', 'changefreq' => 'monthly'],
            'kontak' => ['priority' => '0.5', 'changefreq' => 'monthly'],
            'kebijakan' => ['priority' => '0.3', 'changefreq' => 'yearly'],
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
        
        $xml .= '</urlset>';
        File::put(public_path('sitemap-main.xml'), $xml);
        $this->info('✓ Main content sitemap generated');
    }
    
    /**
     * Generate surah-specific sitemaps with ayahs
     */
    protected function generateSurahSitemaps($baseUrl)
    {
        $this->info('Generating surah group sitemaps...');
        
        $surahs = Surah::select('number', 'total_ayahs', 'updated_at')->get();
        $groups = $surahs->chunk(20);
        
        foreach ($groups as $index => $group) {
            $groupNumber = $index + 1;
            $this->info("  - Generating group {$groupNumber}...");
            
            $currentDate = Carbon::now()->format('Y-m-d');
            $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
            $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
            
            foreach ($group as $surah) {
                $ayahCount = $surah->total_ayahs ?? 0;
                $lastmod = $surah->updated_at ? $surah->updated_at->format('Y-m-d') : $currentDate;
                
                // Limit ayahs per surah to avoid huge files
                $maxAyahs = min($ayahCount, 100);
                
                for ($i = 1; $i <= $maxAyahs; $i++) {
                    $xml .= $this->createUrlEntry(
                        $baseUrl . '/surah/' . $surah->number . '/' . $i,
                        $lastmod,
                        'monthly',
                        '0.7'
                    );
                }
            }
            
            $xml .= '</urlset>';
            File::put(public_path("sitemap-surahs-{$groupNumber}.xml"), $xml);
        }
        
        $this->info('✓ Surah group sitemaps generated');
    }
    
    /**
     * Generate Juz and page sitemaps
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
                'monthly',
                '0.8'
            );
        }
        
        // Add Mushaf page navigation (sample pages to avoid overwhelming)
        $samplePages = [1, 2, 3, 4, 5, 10, 20, 30, 50, 100, 200, 300, 400, 500, 600, 604];
        foreach ($samplePages as $page) {
            $xml .= $this->createUrlEntry(
                $baseUrl . '/pages/' . $page,
                $currentDate,
                'monthly',
                '0.6'
            );
        }
        
        $xml .= '</urlset>';
        File::put(public_path('sitemap-juz.xml'), $xml);
        $this->info('✓ Juz sitemap generated');
    }
    
    /**
     * Update robots.txt with sitemap references
     */
    protected function updateRobotsTxt($baseUrl)
    {
        $this->info('Updating robots.txt...');
        
        $robotsTxt = "User-agent: *\nAllow: /\n\n";
        $robotsTxt .= "# Disallow private pages\n";
        $robotsTxt .= "Disallow: /auth/\n";
        $robotsTxt .= "Disallow: /profile\n";
        $robotsTxt .= "Disallow: /bookmarks\n";
        $robotsTxt .= "Disallow: /api/\n";
        $robotsTxt .= "Disallow: /admin/\n\n";
        $robotsTxt .= "# Allow important pages\n";
        $robotsTxt .= "Allow: /cari\n";
        $robotsTxt .= "Allow: /surah/\n";
        $robotsTxt .= "Allow: /juz/\n";
        $robotsTxt .= "Allow: /halaman/\n";
        $robotsTxt .= "Allow: /tentang\n";
        $robotsTxt .= "Allow: /kontak\n";
        $robotsTxt .= "Allow: /kebijakan\n\n";
        $robotsTxt .= "# Crawl delay for respectful crawling\n";
        $robotsTxt .= "Crawl-delay: 1\n\n";
        $robotsTxt .= "# Sitemaps\n";
        $robotsTxt .= "Sitemap: {$baseUrl}/sitemap.xml\n";
        $robotsTxt .= "Sitemap: {$baseUrl}/sitemap-index.xml\n\n";
        $robotsTxt .= "# Additional guidelines for major search engines\n";
        $robotsTxt .= "User-agent: Googlebot\n";
        $robotsTxt .= "Allow: /\n";
        $robotsTxt .= "Crawl-delay: 1\n\n";
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
