<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Surah;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sitemap:generate {--production : Generate for production environment}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate the sitemap.xml file for the website';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Generating sitemap...');
        
        $sitemap = $this->generateSitemap();
        
        File::put(public_path('sitemap.xml'), $sitemap);
        
        $this->info('Sitemap generated successfully at ' . public_path('sitemap.xml'));
        
        return 0;
    }
    
    /**
     * Generate the sitemap content
     *
     * @return string
     */
    protected function generateSitemap()
    {
        $isProduction = $this->option('production');
        $baseUrl = $isProduction 
            ? 'https://indoquran.web.id' 
            : ((app()->environment('production') && !app()->environment(['local', 'development', 'testing'])) 
                ? 'https://indoquran.web.id' 
                : config('app.url'));
            
        $this->info("Using base URL: {$baseUrl}");
        
        $lastMod = Carbon::now()->format('Y-m-d');
        
        // Start XML
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
        
        // Add static pages with appropriate frequencies and priorities
        $staticPages = [
            '' => ['priority' => '1.0', 'changefreq' => 'daily'],                    // Homepage
            'cari' => ['priority' => '0.8', 'changefreq' => 'weekly'],              // Search page
            'surah' => ['priority' => '0.9', 'changefreq' => 'weekly'],       // Surah list page
            'daftar-lengkap' => ['priority' => '0.9', 'changefreq' => 'weekly'],    // Surah list page (alias)
            'juz' => ['priority' => '0.8', 'changefreq' => 'weekly'],               // Juz index page
            'halaman' => ['priority' => '0.8', 'changefreq' => 'weekly'],           // Page index page
            'asmaul-husna' => ['priority' => '0.7', 'changefreq' => 'monthly'],     // Asmaul Husna page
            'tafsir-maudhui' => ['priority' => '0.7', 'changefreq' => 'monthly'],   // Tafsir Maudhui page
            'doa-bersama' => ['priority' => '0.6', 'changefreq' => 'weekly'],       // Prayer together page
            'tentang' => ['priority' => '0.6', 'changefreq' => 'monthly'],          // About page
            'kontak' => ['priority' => '0.5', 'changefreq' => 'monthly'],           // Contact page
            'donasi' => ['priority' => '0.4', 'changefreq' => 'monthly'],           // Donation page
            'riwayat-versi' => ['priority' => '0.4', 'changefreq' => 'monthly'],    // Version history page
            'kebijakan' => ['priority' => '0.3', 'changefreq' => 'yearly'],         // Privacy page
        ];
        
        foreach ($staticPages as $path => $config) {
            $xml .= $this->createUrlEntry(
                $baseUrl . ($path ? '/' . $path : ''),
                $lastMod,
                $config['changefreq'],
                $config['priority']
            );
        }
        
        // Add surah pages (all 114 primary surah pages)
        $surahs = Surah::select('number', 'updated_at')->get();
        $this->info("Adding {$surahs->count()} surah pages...");
        
        foreach ($surahs as $surah) {
            $xml .= $this->createUrlEntry(
                $baseUrl . '/surah/' . $surah->number,
                $surah->updated_at ? $surah->updated_at->format('Y-m-d') : $lastMod,
                'weekly',
                '0.9'
            );
        }
        
        // Add Juz pages (30 Juz)
        for ($juz = 1; $juz <= 30; $juz++) {
            $xml .= $this->createUrlEntry(
                $baseUrl . '/juz/' . $juz,
                $lastMod,
                'weekly',
                '0.8'
            );
        }
        
        // Add page-based navigation (604 pages in Mushaf)
        for ($page = 1; $page <= 604; $page++) {
            $xml .= $this->createUrlEntry(
                $baseUrl . '/halaman/' . $page,
                $lastMod,
                'weekly',
                '0.7'
            );
        }
        
        // Close XML
        $xml .= '</urlset>';
        
        $this->info('Sitemap generation completed!');
        return $xml;
    }
    
    /**
     * Create a URL entry for the sitemap
     *
     * @param string $loc
     * @param string $lastmod
     * @param string $changefreq
     * @param string $priority
     * @return string
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
