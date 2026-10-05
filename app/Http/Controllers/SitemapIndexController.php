<?php

namespace App\Http\Controllers;

use App\Models\Surah;
use App\Http\Controllers\HaditsController;
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
        $baseUrl = (app()->environment('production') && !app()->environment(['local', 'development', 'testing']))
            ? 'https://indoquran.web.id' 
            : config('app.url');
            
        $currentDate = now()->toIso8601String();
        
        // Generate sitemap index XML
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        
        // Main sitemap (static pages and 114 surahs)
        $xml .= $this->createSitemapEntry(
            $baseUrl . '/sitemap-main.xml',
            $currentDate
        );
        
        // Juz sitemap (30 juz pages)
        $xml .= $this->createSitemapEntry(
            $baseUrl . '/sitemap-juz.xml',
            $currentDate
        );

        // Halaman sitemap (604 mushaf pages)
        $xml .= $this->createSitemapEntry(
            $baseUrl . '/sitemap-halaman.xml',
            $currentDate
        );

        // Artikel sitemap (all published articles)
        $xml .= $this->createSitemapEntry(
            $baseUrl . '/sitemap-artikel.xml',
            $currentDate
        );

        // Hadits main sitemap (hub and 7 books)
        $xml .= $this->createSitemapEntry(
            $baseUrl . '/sitemap-hadits-main.xml',
            $currentDate
        );

        // Hadits topics sitemap
        $xml .= $this->createSitemapEntry(
            $baseUrl . '/sitemap-hadits-topik.xml',
            $currentDate
        );

        // Hadits individual book sitemaps (all 7 books)
        foreach (HaditsController::getKitabCatalog() as $slug => $kitab) {
            $xml .= $this->createSitemapEntry(
                $baseUrl . '/sitemap-hadits-' . $slug . '.xml',
                $currentDate
            );
        }
        
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
        $baseUrl = (app()->environment('production') && !app()->environment(['local', 'development', 'testing']))
            ? 'https://indoquran.web.id' 
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
                'url' => $baseUrl . '/cari',
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.8'
            ],
            [
                'url' => $baseUrl . '/surah',
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.9'
            ],
            [
                'url' => $baseUrl . '/daftar-lengkap',
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.9'
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
                'priority' => '0.8'
            ],
            [
                'url' => $baseUrl . '/asmaul-husna',
                'lastmod' => $currentDate,
                'changefreq' => 'monthly',
                'priority' => '0.7'
            ],
            [
                'url' => $baseUrl . '/tafsir-maudhui',
                'lastmod' => $currentDate,
                'changefreq' => 'monthly',
                'priority' => '0.7'
            ],
            [
                'url' => $baseUrl . '/doa-bersama',
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.6'
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
                'priority' => '0.4'
            ],
            [
                'url' => $baseUrl . '/artikel',
                'lastmod' => $currentDate,
                'changefreq' => 'daily',
                'priority' => '0.85'
            ],
            [
                'url' => $baseUrl . '/riwayat-versi',
                'lastmod' => $currentDate,
                'changefreq' => 'monthly',
                'priority' => '0.4'
            ],
            [
                'url' => $baseUrl . '/kebijakan',
                'lastmod' => $currentDate,
                'changefreq' => 'yearly',
                'priority' => '0.3'
            ],
            [
                'url' => $baseUrl . '/syarat-ketentuan',
                'lastmod' => $currentDate,
                'changefreq' => 'yearly',
                'priority' => '0.3'
            ],
            [
                'url' => $baseUrl . '/hadits',
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.9'
            ]
        ];

        
        // Add surah overview pages (all 114 surahs)
        foreach ($surahs as $surah) {
            $pages[] = [
                'url' => $baseUrl . '/surah/' . $surah->number,
                'lastmod' => $surah->updated_at ? $surah->updated_at->format('Y-m-d') : $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.9'
            ];
        }

        // Add 7 Hadits book pages
        foreach (HaditsController::getKitabCatalog() as $slug => $kitab) {
            $pages[] = [
                'url' => $baseUrl . '/hadits/' . $slug,
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.85'
            ];
        }

        // Add published articles
        try {
            $articles = \App\Models\Article::published()->select('slug', 'updated_at')->get();
            foreach ($articles as $article) {
                $pages[] = [
                    'url' => $baseUrl . '/artikel/' . $article->slug,
                    'lastmod' => $article->updated_at ? $article->updated_at->format('Y-m-d') : $currentDate,
                    'changefreq' => 'weekly',
                    'priority' => '0.8'
                ];
            }
        } catch (\Throwable $e) {
            // Ignore if table not available
        }

        // Add active tafsir maudhui topics
        try {
            $topics = \App\Models\TafsirMaudhuiTopic::active()->select('slug', 'updated_at')->get();
            foreach ($topics as $topic) {
                $pages[] = [
                    'url' => $baseUrl . '/tafsir-maudhui/' . $topic->slug,
                    'lastmod' => $topic->updated_at ? $topic->updated_at->format('Y-m-d') : $currentDate,
                    'changefreq' => 'monthly',
                    'priority' => '0.75'
                ];
            }
        } catch (\Throwable $e) {
            // Ignore if table not available
        }
        
        return $this->generateSitemapXml($pages);
    }
    
    /**
     * Generate sitemap for Juz pages
     */
    public function juzSitemap()
    {
        $baseUrl = (app()->environment('production') && !app()->environment(['local', 'development', 'testing']))
            ? 'https://indoquran.web.id' 
            : config('app.url');
            
        $currentDate = now()->format('Y-m-d');
        
        $pages = [];
        
        // Add all 30 Juz pages
        for ($juz = 1; $juz <= 30; $juz++) {
            $pages[] = [
                'url' => $baseUrl . '/juz/' . $juz,
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.8'
            ];
        }
        
        return $this->generateSitemapXml($pages);
    }

    /**
     * Generate sitemap for Halaman (Mushaf) pages
     */
    public function halamanSitemap()
    {
        $baseUrl = (app()->environment('production') && !app()->environment(['local', 'development', 'testing']))
            ? 'https://indoquran.web.id' 
            : config('app.url');
            
        $currentDate = now()->format('Y-m-d');
        
        $pages = [];
        
        // Add all 604 pages in Mushaf
        for ($page = 1; $page <= 604; $page++) {
            $pages[] = [
                'url' => $baseUrl . '/halaman/' . $page,
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.7'
            ];
        }
        
        return $this->generateSitemapXml($pages);
    }

    /**
     * Generate sitemap for Article pages
     */
    public function artikelSitemap()
    {
        $baseUrl = (app()->environment('production') && !app()->environment(['local', 'development', 'testing']))
            ? 'https://indoquran.web.id' 
            : config('app.url');
            
        $currentDate = now()->format('Y-m-d');
        
        $pages = [
            [
                'url' => $baseUrl . '/artikel',
                'lastmod' => $currentDate,
                'changefreq' => 'daily',
                'priority' => '0.9'
            ]
        ];

        try {
            $articles = \App\Models\Article::published()->select('slug', 'updated_at')->get();
            foreach ($articles as $article) {
                $pages[] = [
                    'url' => $baseUrl . '/artikel/' . $article->slug,
                    'lastmod' => $article->updated_at ? $article->updated_at->format('Y-m-d') : $currentDate,
                    'changefreq' => 'weekly',
                    'priority' => '0.85'
                ];
            }
        } catch (\Throwable $e) {
            // Ignore if table not available
        }
        
        return $this->generateSitemapXml($pages);
    }

    /**
     * Backward compatibility fallback for legacy surah group sitemaps
     */
    public function surahGroupSitemap($groupNumber)
    {
        return $this->mainSitemap();
    }
    
    /**
     * Generate dedicated XML sitemap index for Hadits
     * Points to hadits-main.xml and all 7 individual book sitemaps
     */
    public function haditsIndex()
    {
        $baseUrl = (app()->environment('production') && !app()->environment(['local', 'development', 'testing']))
            ? 'https://indoquran.web.id' 
            : config('app.url');
            
        $currentDate = now()->toIso8601String();
        
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        
        // Main hadits sitemap (hub + 7 books)
        $xml .= $this->createSitemapEntry(
            $baseUrl . '/sitemap-hadits-main.xml',
            $currentDate
        );

        // Hadits topics sitemap
        $xml .= $this->createSitemapEntry(
            $baseUrl . '/sitemap-hadits-topik.xml',
            $currentDate
        );
        
        // Sitemaps for each of the 7 books
        foreach (HaditsController::getKitabCatalog() as $slug => $kitab) {
            $xml .= $this->createSitemapEntry(
                $baseUrl . '/sitemap-hadits-' . $slug . '.xml',
                $currentDate
            );
        }
        
        $xml .= '</sitemapindex>';
        
        return response($xml, 200, [
            'Content-Type' => 'application/xml',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    /**
     * Generate sitemap for Hadits main hub and 7 book pages
     */
    public function haditsMainSitemap()
    {
        $baseUrl = (app()->environment('production') && !app()->environment(['local', 'development', 'testing']))
            ? 'https://indoquran.web.id' 
            : config('app.url');
            
        $currentDate = now()->format('Y-m-d');
        
        $pages = [
            [
                'url' => $baseUrl . '/hadits',
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.9'
            ]
        ];
        
        foreach (HaditsController::getKitabCatalog() as $slug => $kitab) {
            $pages[] = [
                'url' => $baseUrl . '/hadits/' . $slug,
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.85'
            ];
        }
        
        return $this->generateSitemapXml($pages);
    }

    /**
     * Generate sitemap for individual Hadits book (all hadiths in this book)
     */
    public function haditsKitabSitemap(string $kitab)
    {
        $resolved = HaditsController::resolveKitabSlug($kitab);
        if (!$resolved) {
            abort(404, 'Kitab Hadits tidak ditemukan');
        }
        
        $catalog = HaditsController::getKitabCatalog();
        $kitabInfo = $catalog[$resolved] ?? null;
        if (!$kitabInfo) {
            abort(404, 'Kitab Hadits tidak ditemukan');
        }
        
        $baseUrl = (app()->environment('production') && !app()->environment(['local', 'development', 'testing']))
            ? 'https://indoquran.web.id' 
            : config('app.url');
            
        $currentDate = now()->format('Y-m-d');

        // Prioritize Kutubus Sittah slightly higher
        $isKutubusSittah = in_array($resolved, [
            'shahih_bukhari', 'shahih_muslim', 'sunan_abu_daud',
            'sunan_tirmidzi', 'sunan_nasai', 'sunan_ibnu_majah'
        ], true);
        $priority = $isKutubusSittah ? '0.75' : '0.70';
        
        $table = $kitabInfo['table'] ?? null;
        $numbers = [];
        if ($table && \Illuminate\Support\Facades\Schema::hasTable($table)) {
            $hasNo = \Illuminate\Support\Facades\Schema::hasColumn($table, 'no');
            $col = $hasNo ? 'no' : 'id';
            $numbers = \Illuminate\Support\Facades\DB::table($table)->orderBy($col, 'asc')->pluck($col)->all();
        }

        if (empty($numbers)) {
            $total = $kitabInfo['total'] ?? 0;
            $numbers = range(1, $total);
        }

        $pages = [];
        foreach ($numbers as $num) {
            $pages[] = [
                'url' => $baseUrl . '/hadits/' . $resolved . '/' . $num,
                'lastmod' => $currentDate,
                'changefreq' => 'monthly',
                'priority' => $priority
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
     * Generate sitemap for popular thematic Hadith topic landing pages
     */
    public function haditsTopikSitemap(): Response
    {
        $baseUrl = (app()->environment('production') && !app()->environment(['local', 'development', 'testing']))
            ? 'https://indoquran.web.id' 
            : config('app.url');

        $topics = [
            'takdir', 'shalat', 'jenazah', 'iddah', 'matahari', 'wudhu',
            'puasa', 'zakat', 'sabar', 'taubat', 'ilmu', 'nikah',
            'rezeki', 'doa', 'akhlak', 'surga', 'neraka', 'silaturahmi',
            'kematian', 'riba'
        ];

        $pages = [];
        $currentDate = now()->toIso8601String();

        foreach ($topics as $topic) {
            $pages[] = [
                'url' => $baseUrl . '/hadits/tentang/' . $topic,
                'lastmod' => $currentDate,
                'changefreq' => 'weekly',
                'priority' => '0.8'
            ];
        }

        return $this->generateSitemapXml($pages);
    }
    
    /**
     * Generate the XML structure for sitemap
     */
    private function generateSitemapXml(array $pages): Response
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
