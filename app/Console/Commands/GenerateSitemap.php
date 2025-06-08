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
        $baseUrl = config('app.url');
        $lastMod = Carbon::now()->toIso8601String();
        
        // Start XML
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
        
        // Add static pages
        $staticPages = [
            '' => '1.0',                 // Homepage
            'search' => '0.8',           // Search page
            'about' => '0.7',            // About page
            'contact' => '0.7',          // Contact page
            'privacy' => '0.6',          // Privacy page
        ];
        
        foreach ($staticPages as $path => $priority) {
            $xml .= $this->createUrlEntry(
                $baseUrl . ($path ? '/' . $path : ''),
                $lastMod,
                'weekly',
                $priority
            );
        }
        
        // Add surah pages
        $surahs = Surah::select('number', 'updated_at')->get();
        
        foreach ($surahs as $surah) {
            $xml .= $this->createUrlEntry(
                $baseUrl . '/surah/' . $surah->number,
                $surah->updated_at->toIso8601String(),
                'monthly',
                '0.9'
            );
            
            // Add ayah pages for this surah - these have lower priority
            $ayahCount = $surah->total_ayahs ?? 0;
            for ($i = 1; $i <= $ayahCount; $i++) {
                $xml .= $this->createUrlEntry(
                    $baseUrl . '/surah/' . $surah->number . '/' . $i,
                    $surah->updated_at->toIso8601String(),
                    'monthly',
                    '0.7'
                );
            }
        }
        
        // Close XML
        $xml .= '</urlset>';
        
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
