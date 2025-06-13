<?php

namespace App\Http\Controllers;

use App\Models\Surah;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SitemapIndexController extends Controller
{
    /**
     * Generate XML sitemap index for the application
     * This creates a sitemap index that points to individual sitemap files
     */
    public function index()
    {
        // Use production URL if in production, otherwise use configured URL
        $baseUrl = app()->environment('production') 
            ? 'https://my.indoquran.web.id' 
            : config('app.url');
            
        $currentDate = now()->format('Y-m-d\TH:i:s\Z');
        
        // Generate sitemap index XML
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        
        // Main sitemap (static pages and surah overview)
        $xml .= $this->createSitemapEntry(
            $baseUrl . '/sitemap-main.xml',
            $currentDate
        );
        
        // Surah-specific sitemaps (grouped to avoid too many files)
        $surahs = Surah::select('number')->get();
        $surahGroups = $surahs->chunk(20); // 20 surahs per sitemap
        
        foreach ($surahGroups as $index => $group) {
            $xml .= $this->createSitemapEntry(
                $baseUrl . '/sitemap-surahs-' . ($index + 1) . '.xml',
                $currentDate
            );
        }
        
        // Juz sitemap
        $xml .= $this->createSitemapEntry(
            $baseUrl . '/sitemap-juz.xml',
            $currentDate
        );
        
        $xml .= '</sitemapindex>';
        
        return response($xml, 200, [
            'Content-Type' => 'application/xml',
            'Cache-Control' => 'public, max-age=86400', // Cache for 24 hours
        ]);
    }
    
    /**
     * Generate main sitemap (static pages and surah overview)
     */
    public function mainSitemap()
    {
        $baseUrl = app()->environment('production') 
            ? 'https://my.indoquran.web.id' 
            : config('app.url');
            
        $currentDate = now()->format('Y-m-d');
        
        // Get all surahs for overview pages
        $surahs = Surah::select('number', 'updated_at')->get();
        
        // Static pages
        $pages = [
            [
                'url' => $baseUrl,
                'lastmod' => $currentDate,
                'changefreq' => 'daily',
                'priority' => '1.0'
            ],
            [
                'url' => $baseUrl . '/search',
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.8'
            ],
            [
                'url' => $baseUrl . '/about',
                'lastmod' => $currentDate,
                'changefreq' => 'monthly',
                'priority' => '0.6'
            ],
            [
                'url' => $baseUrl . '/contact',
                'lastmod' => $currentDate,
                'changefreq' => 'monthly',
                'priority' => '0.5'
            ],
            [
                'url' => $baseUrl . '/privacy',
                'lastmod' => $currentDate,
                'changefreq' => 'yearly',
                'priority' => '0.3'
            ]
        ];
        
        // Add surah overview pages (without individual ayahs)
        foreach ($surahs as $surah) {
            $pages[] = [
                'url' => $baseUrl . '/surah/' . $surah->number,
                'lastmod' => $surah->updated_at ? $surah->updated_at->format('Y-m-d') : $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.9'
            ];
        }
        
        return $this->generateSitemapXml($pages);
    }
    
    /**
     * Generate sitemap for specific group of surahs with their ayahs
     */
    public function surahGroupSitemap($groupNumber)
    {
        $baseUrl = app()->environment('production') 
            ? 'https://my.indoquran.web.id' 
            : config('app.url');
            
        $currentDate = now()->format('Y-m-d');
        
        // Get surahs for this group (20 surahs per group)
        $offset = ($groupNumber - 1) * 20;
        $surahs = Surah::select('number', 'total_ayahs', 'updated_at')
            ->offset($offset)
            ->limit(20)
            ->get();
        
        $pages = [];
        
        // Add individual ayah pages for each surah in this group
        foreach ($surahs as $surah) {
            $ayahCount = $surah->total_ayahs ?? 0;
            for ($i = 1; $i <= $ayahCount; $i++) {
                $pages[] = [
                    'url' => $baseUrl . '/surah/' . $surah->number . '/' . $i,
                    'lastmod' => $surah->updated_at ? $surah->updated_at->format('Y-m-d') : $currentDate,
                    'changefreq' => 'monthly',
                    'priority' => '0.7'
                ];
            }
        }
        
        return $this->generateSitemapXml($pages);
    }
    
    /**
     * Generate sitemap for Juz pages
     */
    public function juzSitemap()
    {
        $baseUrl = app()->environment('production') 
            ? 'https://my.indoquran.web.id' 
            : config('app.url');
            
        $currentDate = now()->format('Y-m-d');
        
        $pages = [];
        
        // Add all 30 Juz pages
        for ($juz = 1; $juz <= 30; $juz++) {
            $pages[] = [
                'url' => $baseUrl . '/juz/' . $juz,
                'lastmod' => $currentDate,
                'changefreq' => 'monthly',
                'priority' => '0.8'
            ];
        }
        
        // Add page-based navigation (604 pages in Mushaf)
        for ($page = 1; $page <= 604; $page++) {
            $pages[] = [
                'url' => $baseUrl . '/pages/' . $page,
                'lastmod' => $currentDate,
                'changefreq' => 'monthly',
                'priority' => '0.6'
            ];
        }
        
        return $this->generateSitemapXml($pages);
    }
    
    /**
     * Create a sitemap entry for the sitemap index
     */
    private function createSitemapEntry(string $loc, string $lastmod): string
    {
        return "  <sitemap>\n" .
            "    <loc>{$loc}</loc>\n" .
            "    <lastmod>{$lastmod}</lastmod>\n" .
            "  </sitemap>\n";
    }
    
    /**
     * Generate the XML structure for sitemap
     */
    private function generateSitemapXml(array $pages): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        
        foreach ($pages as $page) {
            $xml .= '  <url>' . "\n";
            $xml .= '    <loc>' . htmlspecialchars($page['url']) . '</loc>' . "\n";
            $xml .= '    <lastmod>' . $page['lastmod'] . '</lastmod>' . "\n";
            $xml .= '    <changefreq>' . $page['changefreq'] . '</changefreq>' . "\n";
            $xml .= '    <priority>' . $page['priority'] . '</priority>' . "\n";
            $xml .= '  </url>' . "\n";
        }
        
        $xml .= '</urlset>';
        
        return response($xml, 200, [
            'Content-Type' => 'application/xml',
            'Cache-Control' => 'public, max-age=86400', // Cache for 24 hours
        ]);
    }
}
