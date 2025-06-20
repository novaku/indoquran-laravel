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
    protected $signature = 'sitemap:generate';

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
        // Use production URL if in production, otherwise use configured URL
        $baseUrl = app()->environment('production') 
            ? 'https://my.indoquran.web.id' 
            : config('app.url');
            
        $this->info("Using base URL: {$baseUrl}");
        
        $lastMod = Carbon::now()->toIso8601String();
        
        // Start XML
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
        
        // Add static pages with appropriate frequencies and priorities
        $staticPages = [
            '' => ['priority' => '1.0', 'changefreq' => 'daily'],                 // Homepage
            'cari' => ['priority' => '0.8', 'changefreq' => 'weekly'],          // Search page
            'tentang' => ['priority' => '0.6', 'changefreq' => 'monthly'],          // About page
            'kontak' => ['priority' => '0.5', 'changefreq' => 'monthly'],        // Contact page
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
        
        // Add surah pages
        $surahs = Surah::select('number', 'total_ayahs', 'updated_at')->get();
        $this->info("Adding {$surahs->count()} surah pages...");
        
        foreach ($surahs as $surah) {
            // Main surah page
            $xml .= $this->createUrlEntry(
                $baseUrl . '/surah/' . $surah->number,
                $surah->updated_at ? $surah->updated_at->toIso8601String() : $lastMod,
                'weekly',
                '0.9'
            );
            
            // Individual ayah pages (with lower priority to avoid overwhelming sitemap)
            $ayahCount = $surah->total_ayahs ?? 0;
            if ($ayahCount > 0) {
                for ($i = 1; $i <= $ayahCount; $i++) {
                    $xml .= $this->createUrlEntry(
                        $baseUrl . '/surah/' . $surah->number . '/' . $i,
                        $surah->updated_at ? $surah->updated_at->toIso8601String() : $lastMod,
                        'monthly',
                        '0.7'
                    );
                }
            }
        }
        
        // Add Juz pages (if they exist in your application)
        for ($juz = 1; $juz <= 30; $juz++) {
            $xml .= $this->createUrlEntry(
                $baseUrl . '/juz/' . $juz,
                $lastMod,
                'monthly',
                '0.8'
            );
        }
        
        // Add page-based navigation (if it exists)
        for ($page = 1; $page <= 604; $page++) {
            $xml .= $this->createUrlEntry(
                $baseUrl . '/pages/' . $page,
                $lastMod,
                'monthly',
                '0.6'
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
