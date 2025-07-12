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
                'url' => $baseUrl . '/cari',
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.85'
            ],
            [
                'url' => $baseUrl . '/surah',
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.95'
            ],
            [
                'url' => $baseUrl . '/juz',
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.8'
            ],
            [
                'url' => $baseUrl . '/halaman',
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.75'
            ],
            [
                'url' => $baseUrl . '/doa-bersama',
                'lastmod' => $currentDate,
                'changefreq' => 'daily',
                'priority' => '0.8'
            ],
            [
                'url' => $baseUrl . '/tafsir-maudhui',
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.8'
            ],
            [
                'url' => $baseUrl . '/tentang',
                'lastmod' => $currentDate,
                'changefreq' => 'monthly',
                'priority' => '0.6'
            ],
            [
                'url' => $baseUrl . '/kontak',
                'lastmod' => $currentDate,
                'changefreq' => 'monthly',
                'priority' => '0.5'
            ],
            [
                'url' => $baseUrl . '/donasi',
                'lastmod' => $currentDate,
                'changefreq' => 'monthly',
                'priority' => '0.5'
            ],
            [
                'url' => $baseUrl . '/kebijakan',
                'lastmod' => $currentDate,
                'changefreq' => 'yearly',
                'priority' => '0.3'
            ],
            [
                'url' => $baseUrl . '/riwayat-versi',
                'lastmod' => $currentDate,
                'changefreq' => 'monthly',
                'priority' => '0.4'
            ],
            [
                'url' => $baseUrl . '/semua-surah',
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.9'
            ],
            [
                'url' => $baseUrl . '/daftar-lengkap',
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.9'
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
    
    /**
     * Generate robots.txt optimized for Indonesian Quran search terms
     */
    public function robots()
    {
        $baseUrl = app()->environment('production') 
            ? 'https://my.indoquran.web.id' 
            : config('app.url');
            
        $robotsTxt = "User-agent: *\n";
        $robotsTxt .= "Allow: /\n\n";
        
        // Optimize crawl budget by disallowing low-value pages
        $robotsTxt .= "# Disallow private and low-value pages\n";
        $robotsTxt .= "Disallow: /masuk\n";
        $robotsTxt .= "Disallow: /daftar\n";
        $robotsTxt .= "Disallow: /profil\n";
        $robotsTxt .= "Disallow: /penanda\n";
        $robotsTxt .= "Disallow: /api/\n";
        $robotsTxt .= "Disallow: /admin/\n";
        $robotsTxt .= "Disallow: /dashboard/\n";
        $robotsTxt .= "Disallow: /login\n";
        $robotsTxt .= "Disallow: /register\n";
        $robotsTxt .= "Disallow: /logout\n";
        $robotsTxt .= "Disallow: /*?*utm_\n";
        $robotsTxt .= "Disallow: /*?*fb_\n";
        $robotsTxt .= "Disallow: /*?*gclid=\n";
        $robotsTxt .= "Disallow: /*?*session=\n";
        $robotsTxt .= "Disallow: /search?*\n";
        $robotsTxt .= "Disallow: /cari?page=\n";
        $robotsTxt .= "Disallow: /*?preview=\n\n";
        
        // Allow high-value content for better indexing
        $robotsTxt .= "# Allow high-value content for Indonesian Quran searches\n";
        $robotsTxt .= "Allow: /cari$\n";
        $robotsTxt .= "Allow: /surah/\n";
        $robotsTxt .= "Allow: /juz/\n";
        $robotsTxt .= "Allow: /halaman/\n";
        $robotsTxt .= "Allow: /doa-bersama\n";
        $robotsTxt .= "Allow: /tafsir-maudhui\n";
        $robotsTxt .= "Allow: /tentang\n";
        $robotsTxt .= "Allow: /kontak\n";
        $robotsTxt .= "Allow: /donasi\n";
        $robotsTxt .= "Allow: /kebijakan\n";
        $robotsTxt .= "Allow: /riwayat-versi\n\n";
        
        // Crawl delay optimized for server performance
        $robotsTxt .= "# Crawl delay optimized for server performance\n";
        $robotsTxt .= "Crawl-delay: 1\n\n";
        
        // Multiple sitemap references for better discovery
        $robotsTxt .= "# Sitemap references for comprehensive indexing\n";
        $robotsTxt .= "Sitemap: {$baseUrl}/sitemap.xml\n";
        $robotsTxt .= "Sitemap: {$baseUrl}/sitemap-index.xml\n";
        $robotsTxt .= "Sitemap: {$baseUrl}/sitemap-main.xml\n\n";
        
        // Google-specific optimizations
        $robotsTxt .= "# Google-specific optimizations for Indonesian content\n";
        $robotsTxt .= "User-agent: Googlebot\n";
        $robotsTxt .= "Allow: /\n";
        $robotsTxt .= "Crawl-delay: 0.5\n\n";
        
        $robotsTxt .= "User-agent: Googlebot-Image\n";
        $robotsTxt .= "Allow: /images/\n";
        $robotsTxt .= "Allow: /android-chrome-*.png\n";
        $robotsTxt .= "Allow: /apple-touch-icon.png\n";
        $robotsTxt .= "Allow: /favicon.ico\n\n";
        
        $robotsTxt .= "User-agent: Googlebot-News\n";
        $robotsTxt .= "Allow: /\n";
        $robotsTxt .= "Disallow: /api/\n\n";
        
        // Bing optimization
        $robotsTxt .= "# Bing optimization\n";
        $robotsTxt .= "User-agent: Bingbot\n";
        $robotsTxt .= "Allow: /\n";
        $robotsTxt .= "Crawl-delay: 1\n\n";
        
        // Other search engines
        $robotsTxt .= "# Other search engines\n";
        $robotsTxt .= "User-agent: Slurp\n";
        $robotsTxt .= "Allow: /\n";
        $robotsTxt .= "Crawl-delay: 2\n\n";
        
        $robotsTxt .= "User-agent: DuckDuckBot\n";
        $robotsTxt .= "Allow: /\n";
        $robotsTxt .= "Crawl-delay: 1\n\n";
        
        // Social media crawlers
        $robotsTxt .= "# Social media crawlers\n";
        $robotsTxt .= "User-agent: facebookexternalhit\n";
        $robotsTxt .= "Allow: /\n\n";
        
        $robotsTxt .= "User-agent: Twitterbot\n";
        $robotsTxt .= "Allow: /\n\n";
        
        $robotsTxt .= "User-agent: LinkedInBot\n";
        $robotsTxt .= "Allow: /\n\n";
        
        // Block unwanted bots to save crawl budget
        $robotsTxt .= "# Block unwanted bots to preserve crawl budget\n";
        $robotsTxt .= "User-agent: AhrefsBot\n";
        $robotsTxt .= "Disallow: /\n\n";
        
        $robotsTxt .= "User-agent: MJ12bot\n";
        $robotsTxt .= "Disallow: /\n\n";
        
        $robotsTxt .= "User-agent: SemrushBot\n";
        $robotsTxt .= "Disallow: /\n";
        
        return response($robotsTxt, 200, [
            'Content-Type' => 'text/plain',
            'Cache-Control' => 'public, max-age=86400', // Cache for 24 hours
        ]);
    }
}
