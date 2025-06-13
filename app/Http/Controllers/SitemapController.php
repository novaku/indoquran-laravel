<?php

namespace App\Http\Controllers;

use App\Models\Surah;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate XML sitemap for the application
     * Optimized for IndoQuran with domain my.indoquran.web.id
     */
    public function index()
    {
        // Use production URL if in production, otherwise use configured URL
        $baseUrl = app()->environment('production') 
            ? 'https://my.indoquran.web.id' 
            : config('app.url');
            
        $currentDate = now()->format('Y-m-d');
        
        // Get all surahs for dynamic URLs
        $surahs = Surah::select('number', 'total_ayahs', 'updated_at')->get();
        
        // Static pages with their priorities and change frequencies
        $staticPages = [
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
        
        // Dynamic surah pages
        $surahPages = $surahs->map(function ($surah) use ($baseUrl) {
            return [
                'url' => $baseUrl . '/surah/' . $surah->number,
                'lastmod' => $surah->updated_at ? $surah->updated_at->format('Y-m-d') : now()->format('Y-m-d'),
                'changefreq' => 'weekly',
                'priority' => '0.9'
            ];
        })->toArray();
        
        // Add Juz pages
        $juzPages = [];
        for ($juz = 1; $juz <= 30; $juz++) {
            $juzPages[] = [
                'url' => $baseUrl . '/juz/' . $juz,
                'lastmod' => $currentDate,
                'changefreq' => 'monthly',
                'priority' => '0.8'
            ];
        }
        
        // Add high-priority individual ayah pages (first 10 surahs for better crawling)
        $popularAyahPages = [];
        foreach ($surahs->take(10) as $surah) {
            $ayahCount = min($surah->total_ayahs ?? 0, 50); // Limit to first 50 ayahs per popular surah
            for ($i = 1; $i <= $ayahCount; $i++) {
                $popularAyahPages[] = [
                    'url' => $baseUrl . '/surah/' . $surah->number . '/' . $i,
                    'lastmod' => $surah->updated_at ? $surah->updated_at->format('Y-m-d') : $currentDate,
                    'changefreq' => 'monthly',
                    'priority' => '0.7'
                ];
            }
        }
        
        $allPages = array_merge($staticPages, $surahPages, $juzPages, $popularAyahPages);
        
        // Generate XML
        $xml = $this->generateSitemapXml($allPages);
        
        return response($xml, 200, [
            'Content-Type' => 'application/xml',
            'Cache-Control' => 'public, max-age=86400', // Cache for 24 hours
        ]);
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
        
        return $xml;
    }
}
