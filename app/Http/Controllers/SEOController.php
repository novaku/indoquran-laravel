<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Ayah;
use App\Models\Prayer;
use App\Models\Surah;
use App\Models\TafsirMaudhuiTopic;
use App\Services\SEOService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\View\View;

class SEOController extends Controller
{
    /**
     * Safely remember cache with automatic fallback to query if Redis/cache fails.
     */
    protected static function rememberSafe(string $key, int $ttl, \Closure $callback)
    {
        try {
            return Cache::remember($key, $ttl, $callback);
        } catch (\Throwable $e) {
            Log::warning("SEOController cache failed for [{$key}], falling back to direct query: " . $e->getMessage());
            return $callback();
        }
    }

    /**
     * Get all 114 surahs keyed by number from Redis cache
     */
    public static function getAllSurahsKeyed(): \Illuminate\Support\Collection
    {
        return self::rememberSafe('all_surahs_keyed_collection', 86400 * 30, function () {
            return Surah::query()->orderBy('number', 'asc')->get()->keyBy('number');
        });
    }

    /**
     * Get a specific surah by number from Redis cache
     */
    protected function getCachedSurah(int $number): ?Surah
    {
        if ($number < 1 || $number > 114) {
            return null;
        }
        $surahs = self::getAllSurahsKeyed();
        return $surahs->get($number);
    }

    /**
     * Get cached single ayah by surah & ayah number
     */
    protected function getCachedAyah(int $surahNumber, int $ayahNumber): ?Ayah
    {
        return self::rememberSafe("seo_ayah_{$surahNumber}_{$ayahNumber}", 86400 * 7, function () use ($surahNumber, $ayahNumber) {
            return Ayah::query()
                ->select('surah_number', 'ayah_number', 'text_arabic', 'text_latin', 'text_indonesian', 'juz', 'page')
                ->where('surah_number', $surahNumber)
                ->where('ayah_number', $ayahNumber)
                ->first();
        });
    }

    /**
     * Get cached Tafsir Maudhui topic with verses
     */
    protected function getCachedTafsirTopic(string $slug): ?TafsirMaudhuiTopic
    {
        return self::rememberSafe("seo_tafsir_topic_{$slug}", 86400, function () use ($slug) {
            return TafsirMaudhuiTopic::query()
                ->where('slug', $slug)
                ->where('is_active', true)
                ->with(['verses' => function ($query) {
                    $query->ordered();
                }])
                ->first();
        });
    }

    /**
     * Get cached Article with author and tags
     */
    protected function getCachedArticle(string $slug): ?Article
    {
        return self::rememberSafe("seo_article_model_{$slug}", 3600, function () use ($slug) {
            return Article::query()
                ->with(['author:id,name', 'tags'])
                ->where('slug', $slug)
                ->published()
                ->first();
        });
    }

    /**
     * Get cached related articles
     */
    protected function getCachedRelatedArticles(int $excludeId): \Illuminate\Database\Eloquent\Collection
    {
        return self::rememberSafe("seo_article_related_{$excludeId}", 3600, function () use ($excludeId) {
            return Article::query()
                ->with(['author:id,name', 'tags'])
                ->where('id', '!=', $excludeId)
                ->published()
                ->latest('published_at')
                ->limit(3)
                ->get();
        });
    }

    /**
     * Handle dynamic SEO for React app
     * This controller provides SEO data to the React blade template
     * 
     * Fixed for Google Search Console issues:
     * 1. Proper redirect handling (301 permanent)
     * 2. Canonical URL consistency (NO duplicate content)
     * 3. Proper noindex/follow strategy for different page types
     * 4. Query parameter normalization
     */
    public function handleReactRoute(Request $request): View|Response|RedirectResponse
    {
        $path = $request->path();
        $segments = explode('/', $path);

        // Redirect keyword-slug variants to canonical pages (301) to consolidate ranking signals.
        if (preg_match('/^(?:al-?quran|alquran)?-?(?:halaman|hal|muka-surat|ms|page)-(\d+)(?:-al-?quran|-quran)?$/i', $path, $matches)) {
            $pageNumber = (int) $matches[1];
            if ($pageNumber >= 1 && $pageNumber <= 604) {
                return redirect(url('/halaman/' . $pageNumber), 301);
            }
        }

        if (preg_match('/^(?:al-?quran-?|bacaan-)?juz-(\d+)(?:-arab-saja|-arab-dan-latin|-lengkap|-quran|-al-?quran)?$/i', $path, $matches)) {
            $juzNumber = (int) $matches[1];
            if ($juzNumber >= 1 && $juzNumber <= 30) {
                return redirect(url('/juz/' . $juzNumber), 301);
            }
        }

        if (preg_match('/^(?:al-?quran-)?(?:surah|surat)-(\d+)$/i', $path, $matches)) {
            $surahNumber = (int) $matches[1];
            if ($surahNumber >= 1 && $surahNumber <= 114) {
                return redirect(url('/surah/' . $surahNumber), 301);
            }
        }

        if (preg_match('/^(?:al-?quran-)?(?:surah|surat)-(\d+)-ayat-(\d+)$/i', $path, $matches)) {
            $surahNumber = (int) $matches[1];
            $ayahNumber = (int) $matches[2];
            if ($surahNumber >= 1 && $surahNumber <= 114 && $ayahNumber >= 1) {
                return redirect(url('/surah/' . $surahNumber . '/' . $ayahNumber), 301);
            }
        }

        // Redirect legacy query-based ayah URL to canonical route in a single hop.
        // Example: /ayat.php?surat=23&ayat=102 -> /surah/23/102
        if (strcasecmp($path, 'ayat.php') === 0) {
            $surahNumber = (int) $request->query('surat', 0);
            $ayahNumber = (int) $request->query('ayat', 0);

            if ($surahNumber >= 1 && $surahNumber <= 114 && $ayahNumber >= 1) {
                $surah = $this->getCachedSurah($surahNumber);

                if ($surah && $ayahNumber <= (int) ($surah->total_ayahs ?? 0)) {
                    return redirect(url('/surah/' . $surahNumber . '/' . $ayahNumber), 301);
                }
            }

            // Invalid legacy URL parameters should not be indexed.
            return response('Gone', 410);
        }

        // Redirect legacy ayah URLs to canonical route to consolidate indexing signals.
        // Example: /quran/viewAyat/279 -> /surah/{surah}/{ayah}
        // Also handles trailing punctuation (e.g. /quran/viewAyat/1264,) from external links/crawlers
        if (preg_match('/^quran\/viewAyat\/(\d+)[\s,\.;:]*$/i', $path, $matches)) {
            $legacyAyahId = (int) $matches[1];
            $legacyAyah = Ayah::query()
                ->select('surah_number', 'ayah_number')
                ->find($legacyAyahId);

            if ($legacyAyah && $legacyAyah->surah_number && $legacyAyah->ayah_number) {
                return redirect(url('/surah/' . $legacyAyah->surah_number . '/' . $legacyAyah->ayah_number), 301);
            }

            // URL existed in old version but cannot be mapped anymore -> redirect to /surah
            return redirect(url('/surah'), 301);
        }
        
        // Redirect legacy English routes to Indonesian (301 Permanent Redirect)
        if (isset($segments[0])) {
            $redirectPaths = [
                'pages' => 'halaman',
                'search' => 'cari',
                'about' => 'tentang',
                'contact' => 'kontak',
                'privacy' => 'kebijakan',
                'terms' => 'syarat-ketentuan',
                'terms-of-service' => 'syarat-ketentuan',
                'tos' => 'syarat-ketentuan',
                'ketentuan' => 'syarat-ketentuan'

            ];
            
            if (array_key_exists($segments[0], $redirectPaths)) {
                 $newPath = $redirectPaths[$segments[0]];
                 
                 // Handle remaining segments (e.g. pages/1 -> halaman/1)
                 if (count($segments) > 1) {
                     $newPath .= '/' . implode('/', array_slice($segments, 1));
                 }
                 
                 // Handle query strings (e.g. search?q=foo -> cari?q=foo)
                 $queryString = $request->getQueryString();
                 $target = url('/' . $newPath . ($queryString ? '?' . $queryString : ''));
                 
                 // Use 301 permanent redirect for SEO
                 return redirect($target, 301);
            }
        }
        
        // CANONICAL URL NORMALIZATION - Fix duplicate content issue
        // Remove trailing slashes and normalize query parameters
        $canonicalPath = rtrim($path, '/');
        if ($canonicalPath !== $path && $path !== '/') {
            // Redirect paths with trailing slashes to non-trailing versions
            $target = url($canonicalPath);
            if ($request->getQueryString()) {
                $target .= '?' . $request->getQueryString();
            }
            return redirect($target, 301);
        }

        // Redirect paths with trailing punctuation (e.g. from external links ending with comma or period)
        if (preg_match('/[,\.;:]+$/', $path)) {
            $cleanedPunctuationPath = rtrim($path, ',.;:');
            if ($cleanedPunctuationPath !== '') {
                $target = url($cleanedPunctuationPath);
                if ($request->getQueryString()) {
                    $target .= '?' . $request->getQueryString();
                }
                return redirect($target, 301);
            }
        }
        
        // Remove unwanted query parameters for canonical URL consistency
        $allowedQueryParams = ['q', 'page', 'sort', 'reciter', 'tag', 'tab', 'doa', 'category', 'kategori', 'view', 'nomor', 'search', 'kitab']; // Only these params are relevant for content
        $queryString = $request->getQueryString();
        
        if ($queryString) {
            parse_str($queryString, $params);
            $filteredParams = array_intersect_key($params, array_flip($allowedQueryParams));
            
            // If there are extra params, redirect to clean URL
            if (count($filteredParams) !== count($params)) {
                ksort($filteredParams); // Sort for consistency
                $newQueryString = http_build_query($filteredParams);
                $target = url($path);
                if ($newQueryString) {
                    $target .= '?' . $newQueryString;
                }
                return redirect($target, 301);
            }
        }
        
        // Check for invalid routes that should return 404
        $isInvalidRoute = false;
        
        // Check invalid surah numbers
        if (isset($segments[0]) && $segments[0] === 'surah') {
            if (isset($segments[1])) {
                if (!is_numeric($segments[1])) {
                    $isInvalidRoute = true;
                } else {
                    $surahNumber = (int) $segments[1];
                    $surah = $this->getCachedSurah($surahNumber);
                    if (!$surah) {
                        $isInvalidRoute = true;
                    } elseif (isset($segments[2])) {
                        // Verify ayah number is valid for this surah
                        if (!is_numeric($segments[2])) {
                            $isInvalidRoute = true;
                        } else {
                            $ayahNumber = (int) $segments[2];
                            $maxAyah = (int) ($surah->total_ayahs ?? 0);

                            if ($ayahNumber < 1 || ($maxAyah > 0 && $ayahNumber > $maxAyah)) {
                                $isInvalidRoute = true;
                            }
                        }
                    }
                }
            }
        }
        
        // Check invalid juz numbers
        if (isset($segments[0]) && $segments[0] === 'juz') {
            if (isset($segments[1])) {
                if (!is_numeric($segments[1])) {
                    $isInvalidRoute = true;
                } else {
                    $juzNumber = (int) $segments[1];
                    if ($juzNumber < 1 || $juzNumber > 30) {
                        $isInvalidRoute = true;
                    }
                }
            }
        }
        
        // Check invalid page numbers
        if (isset($segments[0]) && $segments[0] === 'halaman') {
            if (isset($segments[1])) {
                if (!is_numeric($segments[1])) {
                    $isInvalidRoute = true;
                } else {
                    $pageNumber = (int) $segments[1];
                    if ($pageNumber < 1 || $pageNumber > 604) {
                        $isInvalidRoute = true;
                    }
                }
            }
        }

        // Check invalid tafsir-maudhui slugs
        if (isset($segments[0]) && $segments[0] === 'tafsir-maudhui' && isset($segments[1])) {
            $slug = trim((string) $segments[1]);

            if ($slug === '' || !preg_match('/^[a-z0-9\-]+$/', $slug)) {
                $isInvalidRoute = true;
            } else {
                $cachedTafsirTopic = $this->getCachedTafsirTopic($slug);
                if (!$cachedTafsirTopic) {
                    $isInvalidRoute = true;
                }
            }
        }

        // Guard against extra path segments that create soft-404 style URLs.
        if (isset($segments[0])) {
            if ($segments[0] === 'surah' && count($segments) > 3) {
                $isInvalidRoute = true;
            }

            if (in_array($segments[0], ['juz', 'halaman', 'cari'], true) && count($segments) > 2) {
                $isInvalidRoute = true;
            }

            if ($segments[0] === 'tafsir-maudhui' && count($segments) > 2) {
                $isInvalidRoute = true;
            }

            // Single segment pages cannot have sub-paths (prevents soft 404 for /tentang/xyz, /asmaul-husna/1, etc.)
            $singleSegmentRoutes = [
                'tentang', 'kontak', 'donasi', 'kebijakan', 'syarat-ketentuan',
                'riwayat-versi', 'member', 'keuntungan-member', 'statistik',
                'daftar-lengkap', 'asmaul-husna', 'masuk', 'daftar', 'profil', 'penanda'
            ];
            if (in_array($segments[0], $singleSegmentRoutes, true) && count($segments) > 1) {
                $isInvalidRoute = true;
            }

            // Doa Bersama route validation
            if ($segments[0] === 'doa-bersama') {
                if (count($segments) > 2) {
                    $isInvalidRoute = true;
                } elseif (count($segments) === 2) {
                    if (!is_numeric($segments[1])) {
                        $isInvalidRoute = true;
                    } else {
                        $prayer = \App\Models\Prayer::find($segments[1]);
                        if (!$prayer) {
                            $isInvalidRoute = true;
                        }
                    }
                }
            }

            // Hadits route validation
            if ($segments[0] === 'hadits') {
                if (count($segments) > 3) {
                    $isInvalidRoute = true;
                } elseif (count($segments) === 2 && $segments[1] === 'tentang') {
                    // /hadits/tentang without topic redirects to /hadits
                    return redirect(url('/hadits'), 301);
                } elseif (count($segments) === 3 && $segments[1] === 'tentang') {
                    // /hadits/tentang/{topic} is a valid topic landing page
                    $topicSlug = trim($segments[2]);
                    if (empty($topicSlug) || strlen($topicSlug) > 100) {
                        $isInvalidRoute = true;
                    }
                } elseif (count($segments) >= 2) {
                    $rawKitabSlug = rtrim($segments[1], ',.;:');
                    $catalog = \App\Http\Controllers\HaditsController::getKitabCatalog();
                    $resolved = \App\Http\Controllers\HaditsController::resolveKitabSlug($rawKitabSlug);

                    if (!$resolved || !isset($catalog[$resolved])) {
                        // Check if it is a deprecated kitab previously indexed (e.g. musnad_syafii, riyadhus_shalihin, muwatho_malik, musnad_darimi)
                        if (\App\Http\Controllers\HaditsController::isDeprecatedKitab($rawKitabSlug)) {
                            return redirect(url('/hadits'), 301);
                        }

                        $isInvalidRoute = true;
                    } else {
                        // If alias used (e.g. /hadits/bukhari or /hadits/shahih-bukhari), redirect 301 to canonical
                        if ($rawKitabSlug !== $resolved) {
                            $targetUrl = '/hadits/' . $resolved;
                            if (isset($segments[2])) {
                                $cleanNomor = (int) rtrim($segments[2], ',.;:');
                                $targetUrl .= '/' . $cleanNomor;
                            }
                            if ($request->getQueryString()) {
                                $targetUrl .= '?' . $request->getQueryString();
                            }
                            return redirect(url($targetUrl), 301);
                        }

                        if (count($segments) === 3) {
                            $cleanNomorStr = rtrim($segments[2], ',.;:');
                            if (!is_numeric($cleanNomorStr)) {
                                $isInvalidRoute = true;
                            } else {
                                $nomor = (int) $cleanNomorStr;
                                $maxNomor = $catalog[$resolved]['total'] ?? 0;
                                if ($nomor < 1) {
                                    $isInvalidRoute = true;
                                } elseif ($maxNomor > 0 && $nomor > $maxNomor) {
                                    // Previously generated sitemaps indexed hadith numbers up to 26,363 for Musnad Ahmad.
                                    // Redirect out-of-range hadith numbers to canonical book page with 301
                                    return redirect(url('/hadits/' . $resolved), 301);
                                }
                            }
                        }
                    }
                }
            }

            // Article route validation
            if ($segments[0] === 'artikel') {
                if (count($segments) > 2) {
                    $isInvalidRoute = true;
                } elseif (count($segments) === 2) {
                    $slug = trim((string) $segments[1]);

                    // Redirect legacy /artikel/tag-{tagSlug} to /artikel?tag={tagSlug}
                    if (str_starts_with($slug, 'tag-')) {
                        $tagSlug = substr($slug, 4);
                        return redirect(url('/artikel?tag=' . $tagSlug), 301);
                    }

                    if ($slug === '') {
                        $isInvalidRoute = true;
                    } else {
                        $cachedArticle = $this->getCachedArticle($slug);
                        if (!$cachedArticle) {
                            $isInvalidRoute = true;
                        }
                    }
                }
            }

            // Legacy namespace should not be indexable unless explicitly redirected above.
            if ($segments[0] === 'quran') {
                $isInvalidRoute = true;
            }

            // Whitelist of all valid top-level route segments.
            // Any unknown segment (e.g. /urdb/, /xyz/, etc.) is an immediate hard 404
            // to prevent soft-404 responses that waste Google's crawl budget.
            $knownSegments = [
                // Core Quran content
                'surah', 'juz', 'halaman', 'cari',
                // Features
                'tafsir-maudhui', 'asmaul-husna', 'doa-bersama', 'hadits',
                // Static / info pages
                'tentang', 'kontak', 'donasi', 'kebijakan', 'syarat-ketentuan',
                'riwayat-versi', 'member', 'keuntungan-member',
                'statistik', 'daftar-lengkap',
                // Auth & user
                'masuk', 'daftar', 'profil', 'penanda',
                'reset-password', 'password',
                // Admin
                'admin',
                // Articles
                'artikel',
                // Legacy redirects handled above but segment still valid
                'pages', 'search', 'about', 'contact', 'privacy', 'terms', 'terms-of-service', 'tos', 'ketentuan',
                'version-history', 'donation', 'bookmark', 'profile', 'auth',

                // Homepage (empty string / root is handled before this block)
            ];

            if ($segments[0] !== '' && !in_array($segments[0], $knownSegments, true)) {
                $isInvalidRoute = true;
            }
        }
        
        // Default SEO values
        $seoData = [
            'metaTitle' => 'IndoQuran - Al-Quran Digital Indonesia',
            'metaDescription' => 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia, fitur bookmark, pencarian ayat, dan audio murottal berkualitas tinggi.',
            'metaKeywords' => 'al quran indonesia, quran online, al quran digital, baca quran, terjemahan quran, murottal, quran indonesia, ayat al quran, surah quran, indoquran',
            'canonicalUrl' => url($request->path() === '/' ? '/' : $request->path()),
            'robots' => 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
            'ogImage' => url('/android-chrome-512x512.png'),
            'ogType' => 'website'
        ];

        // Handle different routes
        if ($path === '/' || $path === '') {
            $siteNavigationStructuredData = [
                '@context' => 'https://schema.org',
                '@graph' => [
                    [
                        '@type' => 'SiteNavigationElement',
                        'name' => 'Al-Quran Digital Indonesia',
                        'description' => 'Baca 114 Surah Al-Quran lengkap dengan teks Arab, terjemahan Indonesia, dan audio murottal.',
                        'url' => 'https://indoquran.web.id/surah'
                    ],
                    [
                        '@type' => 'SiteNavigationElement',
                        'name' => 'Hadits Shahih Online',
                        'description' => 'Koleksi 7 kitab hadits shahih nabawi: Bukhari, Muslim, Abu Daud, Tirmidzi, An-Nasa\'i, Ibnu Majah, dan Musnad Ahmad.',
                        'url' => 'https://indoquran.web.id/hadits'
                    ],
                    [
                        '@type' => 'SiteNavigationElement',
                        'name' => 'Hadits Shahih Bukhari',
                        'description' => 'Baca 7.563 hadits Shahih Bukhari lengkap teks Arab dan terjemahan Indonesia.',
                        'url' => 'https://indoquran.web.id/hadits/shahih_bukhari'
                    ],
                    [
                        '@type' => 'SiteNavigationElement',
                        'name' => 'Hadits Shahih Muslim',
                        'description' => 'Baca 3.033 hadits Shahih Muslim lengkap 57 kitab dengan teks Arab dan terjemahan Indonesia.',
                        'url' => 'https://indoquran.web.id/hadits/shahih_muslim'
                    ],
                    [
                        '@type' => 'SiteNavigationElement',
                        'name' => 'Juz 30 (Juz Amma)',
                        'description' => 'Baca Al-Quran Juz 30 lengkap teks Arab berharakat jelas dan audio murottal.',
                        'url' => 'https://indoquran.web.id/juz/30'
                    ],
                    [
                        '@type' => 'SiteNavigationElement',
                        'name' => 'Tafsir Maudhui',
                        'description' => 'Kajian tafsir tematik Al-Quran berdasarkan tema-tema kehidupan dan keislaman.',
                        'url' => 'https://indoquran.web.id/tafsir-maudhui'
                    ],
                    [
                        '@type' => 'SiteNavigationElement',
                        'name' => '99 Asmaul Husna',
                        'description' => '99 Nama-nama indah Allah SWT lengkap dengan teks Arab, latin, arti, dan maknanya.',
                        'url' => 'https://indoquran.web.id/asmaul-husna'
                    ],
                    [
                        '@type' => 'SiteNavigationElement',
                        'name' => 'Kumpulan Doa Pilihan',
                        'description' => 'Kumpulan doa-doa pilihan dari Al-Quran dan As-Sunnah.',
                        'url' => 'https://indoquran.web.id/doa-bersama'
                    ],
                ]
            ];

            // Homepage SEO - OPTIMIZED for Google SERP & CTR
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Al Quran Online Indonesia - Baca Al-Quran Digital 30 Juz & Hadits | IndoQuran',
                'metaDescription' => 'Baca Al-Quran online 30 juz lengkap dengan teks Arab berharakat, transliterasi latin, terjemahan Indonesia standar Kemenag, audio murottal merdu, tafsir, dan 7 kitab hadits shahih nabawi di IndoQuran.',
                'metaKeywords' => 'al quran online, alquran online, quran online, al quran indonesia, al quran digital, baca quran online, terjemahan quran indonesia, murottal quran, quran indonesia, ayat al quran, surah quran, hadits shahih, juz amma, tafsir quran, indoquran, quran digital 30 juz, quranindo, quran indo, qur\'an indonesia, alquran per juz, baca al quran online, tadarus alquran online, al quran web, quran online indonesia',
                'canonicalUrl' => url('/'),
                'siteNavigationStructuredData' => $siteNavigationStructuredData,
                'customStructuredData' => SEOService::generateHomeFaqStructuredData()
            ]);
        } 
        elseif (isset($segments[0]) && $segments[0] === 'surah') {
            // Surah page SEO
            if (isset($segments[1]) && is_numeric($segments[1])) {
                $surahNumber = (int) $segments[1];
                $surah = $this->getCachedSurah($surahNumber);
                
                if ($surah) {
                    $ayahNumber = isset($segments[2]) && is_numeric($segments[2]) ? (int) $segments[2] : null;

                    $breadcrumbStructuredData = [
                        '@context' => 'https://schema.org',
                        '@type' => 'BreadcrumbList',
                        'itemListElement' => [
                            [
                                '@type' => 'ListItem',
                                'position' => 1,
                                'name' => 'Beranda',
                                'item' => 'https://indoquran.web.id'
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 2,
                                'name' => 'Daftar Surah',
                                'item' => 'https://indoquran.web.id/surah'
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 3,
                                'name' => "Surah {$surah->name_latin}",
                                'item' => "https://indoquran.web.id/surah/{$surahNumber}"
                            ]
                        ]
                    ];
                    
                    if ($ayahNumber) {
                        $ayah = $this->getCachedAyah($surahNumber, $ayahNumber);

                        $cleanArabic = trim(preg_replace('/\s+/', ' ', strip_tags($ayah?->text_arabic ?? '')));
                        $cleanLatin = trim(preg_replace('/\s+/', ' ', strip_tags($ayah?->text_latin ?? '')));
                        $cleanIndo = trim(preg_replace('/\s+/', ' ', strip_tags($ayah?->text_indonesian ?? '')));

                        $shortArabic = Str::limit($cleanArabic, 60);
                        $shortIndo = Str::limit($cleanIndo, 80);

                        $metaTitle = "Surat {$surah->name_latin} Ayat {$ayahNumber} (QS {$surah->number}:{$ayahNumber}) - Teks Arab, Latin & Arti | IndoQuran";
                        $metaDescription = $ayah 
                            ? "Baca Surat {$surah->name_latin} Ayat {$ayahNumber} (QS {$surah->number}:{$ayahNumber}): {$shortArabic}. Artinya: \"{$shortIndo}\". Teks latin, audio murottal, Juz {$ayah->juz} Halaman {$ayah->page} di IndoQuran."
                            : "Baca Surah {$surah->name_latin} ayat {$ayahNumber} lengkap dengan terjemahan bahasa Indonesia, audio murottal, dan tafsir di IndoQuran.";
                        $metaKeywords = "surat {$surah->name_latin} ayat {$ayahNumber}, surah {$surah->name_latin} ayat {$ayahNumber}, qs {$surah->number} ayat {$ayahNumber}, qs {$surah->name_latin} ayat {$ayahNumber}, {$surah->name_latin} {$ayahNumber}, arti surat {$surah->name_latin} ayat {$ayahNumber}, {$surah->name_latin} ayat {$ayahNumber} dan artinya, {$surah->name_latin} ayat {$ayahNumber} latin, tafsir {$surah->name_latin} ayat {$ayahNumber}, ayat {$ayahNumber}";

                        $ayahBreadcrumbs = [
                            '@context' => 'https://schema.org',
                            '@type' => 'BreadcrumbList',
                            'itemListElement' => [
                                [
                                    '@type' => 'ListItem',
                                    'position' => 1,
                                    'name' => 'Beranda',
                                    'item' => 'https://indoquran.web.id'
                                ],
                                [
                                    '@type' => 'ListItem',
                                    'position' => 2,
                                    'name' => 'Daftar Surah',
                                    'item' => 'https://indoquran.web.id/surah'
                                ],
                                [
                                    '@type' => 'ListItem',
                                    'position' => 3,
                                    'name' => "Surah {$surah->name_latin}",
                                    'item' => "https://indoquran.web.id/surah/{$surahNumber}"
                                ],
                                [
                                    '@type' => 'ListItem',
                                    'position' => 4,
                                    'name' => "Ayat {$ayahNumber}",
                                    'item' => "https://indoquran.web.id/surah/{$surahNumber}/{$ayahNumber}"
                                ]
                            ]
                        ];

                        $customStructuredData = $ayah ? SEOService::generateAyahStructuredData($surah, $ayah) : null;

                        $seoData = array_merge($seoData, [
                            'metaTitle' => $metaTitle,
                            'metaDescription' => $metaDescription,
                            'metaKeywords' => $metaKeywords,
                            'canonicalUrl' => url("/surah/{$surahNumber}/{$ayahNumber}"),
                            'breadcrumbStructuredData' => $ayahBreadcrumbs,
                            'customStructuredData' => $customStructuredData,
                            'ogType' => 'article'
                        ]);
                    } else {
                        // Surah page SEO - OPTIMIZED using Surah model methods and rich schemas
                        $locationMeta = SEOService::getSurahLocationMetadata($surahNumber);
                        $surahFaq = SEOService::generateSurahFaqStructuredData($surah, $locationMeta);
                        $surahSchemas = SEOService::generateSurahStructuredData($surah);
                        $customStructuredData = array_merge($surahSchemas, [$surahFaq]);

                        $extraSurahKeywords = '';
                        if (!empty($locationMeta['min_juz'])) {
                            $extraSurahKeywords .= ", {$surah->name_latin} juz {$locationMeta['min_juz']}, {$surah->name_latin} juz berapa, {$surah->name_latin} ada berapa juz";
                        }
                        if (!empty($locationMeta['min_page'])) {
                            $extraSurahKeywords .= ", {$surah->name_latin} halaman {$locationMeta['min_page']}, {$surah->name_latin} halaman berapa";
                        }
                        if ($surahNumber === 42) {
                            $extraSurahKeywords .= ", ha mim ain sin qaf, ha mim ain sin qaf surat apa, حم عسق";
                        }
                        if ($surahNumber === 23) {
                            $extraSurahKeywords .= ", khalqan artinya, al mu'minun ayat 14";
                        }

                        $seoData = array_merge($seoData, [
                            'metaTitle' => $surah->getSeoTitle(),
                            'metaDescription' => $surah->getSeoDescription(),
                            'metaKeywords' => $surah->getSeoKeywords() . $extraSurahKeywords,
                            'canonicalUrl' => url("/surah/{$surahNumber}"),
                            'breadcrumbStructuredData' => $breadcrumbStructuredData,
                            'customStructuredData' => $customStructuredData,
                            'ogType' => 'article'
                        ]);
                    }
                }
            } else {
                // Surah Index (/surah) - Dedicated SEO for all 114 Surahs & meanings
                $breadcrumbStructuredData = [
                    '@context' => 'https://schema.org',
                    '@type' => 'BreadcrumbList',
                    'itemListElement' => [
                        [
                            '@type' => 'ListItem',
                            'position' => 1,
                            'name' => 'Beranda',
                            'item' => 'https://indoquran.web.id'
                        ],
                        [
                            '@type' => 'ListItem',
                            'position' => 2,
                            'name' => 'Daftar 114 Surah Al-Quran',
                            'item' => 'https://indoquran.web.id/surah'
                        ]
                    ]
                ];

                $seoData = array_merge($seoData, [
                    'metaTitle' => 'Daftar 114 Nama Surah Al-Quran & Artinya Lengkap (Daftar Isi) | IndoQuran',
                    'metaDescription' => 'Daftar lengkap 114 nama-nama surah dalam Al-Quran dan artinya dari Al-Fatihah hingga An-Nas (6.236 ayat, 30 juz, 604 halaman). Lengkap teks Arab, latin, terjemahan Kemenag, dan audio murottal.',
                    'metaKeywords' => 'nama nama surah dalam al quran, nama nama surah dan artinya, nama nama surat al quran, nama surat dan artinya, daftar isi alquran, daftar surat alquran, al quran terdiri dari berapa surah, 114 surah al quran, bacaan surat al quran',
                    'canonicalUrl' => url('/surah'),
                    'breadcrumbStructuredData' => $breadcrumbStructuredData,
                    'customStructuredData' => SEOService::generateSurahIndexStructuredData(),
                    'ogType' => 'website'
                ]);
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'cari') {
            // Search page SEO - OPTIMIZED
            $query = $request->get('q', '');
            if ($query) {
                $seoData = array_merge($seoData, [
                    'metaTitle' => "Hasil Pencarian \"{$query}\" - Al-Quran Digital | IndoQuran",
                    'metaDescription' => "🔍 Hasil pencarian Al-Quran untuk \"{$query}\". Temukan ayat dan surah yang sesuai dengan mudah. Platform pencarian Al-Quran terlengkap dengan terjemahan Indonesia.",
                    'metaKeywords' => "pencarian quran, cari ayat, {$query}, al quran indonesia, pencarian al quran, search quran, cari al quran",
                    // Canonicalize all internal search result URLs to a single endpoint.
                    // This prevents canonical fragmentation from user-generated queries.
                    'canonicalUrl' => url('/cari'),
                    'robots' => 'noindex, follow'
                ]);
            } else {
                $seoData = array_merge($seoData, [
                    'metaTitle' => 'Pencarian Al-Quran - Cari Ayat & Terjemahan | IndoQuran',
                    'metaDescription' => '🔍 Cari ayat dalam Al-Quran dengan mudah dan cepat ✅ Pencarian Teks Arab ✅ Pencarian Terjemahan Indonesia ✅ Hasil Akurat. Temukan ayat yang Anda butuhkan sekarang!',
                    'metaKeywords' => 'cari ayat quran, pencarian al quran, search quran, al quran digital, cari terjemahan quran, pencarian ayat',
                    'canonicalUrl' => url('/cari'),
                    'robots' => 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
                ]);
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'daftar-lengkap') {
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Daftar Lengkap Al-Quran Indonesia - Semua Surah, Ayat & Pencarian | IndoQuran',
                'metaDescription' => 'Temukan semua surah Al-Quran dengan terjemahan Indonesia. Daftar lengkap 114 surah, pencarian ayat, audio murottal, dan fitur pembelajaran Al-Quran digital terlengkap di Indonesia.',
                'metaKeywords' => 'al quran indonesia, daftar surah lengkap, semua surah al quran, 114 surah, surah al quran terjemahan, quran digital indonesia, al quran online lengkap, murottal semua surah, ayat al quran indonesia, pencarian al quran, indoquran lengkap',
                'canonicalUrl' => url('/daftar-lengkap'),
                'ogType' => 'website'
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'juz') {
            // Juz page SEO
            if (isset($segments[1]) && is_numeric($segments[1])) {
                $juzNumber = (int) $segments[1];
                $breadcrumbStructuredData = [
                    '@context' => 'https://schema.org',
                    '@type' => 'BreadcrumbList',
                    'itemListElement' => [
                        [
                            '@type' => 'ListItem',
                            'position' => 1,
                            'name' => 'Beranda',
                            'item' => 'https://indoquran.web.id'
                        ],
                        [
                            '@type' => 'ListItem',
                            'position' => 2,
                            'name' => 'Daftar Juz',
                            'item' => 'https://indoquran.web.id/juz'
                        ],
                        [
                            '@type' => 'ListItem',
                            'position' => 3,
                            'name' => "Juz {$juzNumber}",
                            'item' => "https://indoquran.web.id/juz/{$juzNumber}"
                        ]
                    ]
                ];

                // Specific Juz SEO
                $juzMeta = SEOService::getJuzMetadata($juzNumber);
                $customStructuredData = SEOService::generateJuzStructuredData($juzNumber, $juzMeta);

                if ($juzNumber === 30) {
                    $seoData = array_merge($seoData, [
                        'metaTitle' => 'Juz 30 (Juz Amma) Lengkap Teks Arab, Latin & Terjemahan | IndoQuran',
                        'metaDescription' => 'Baca Al-Quran Juz 30 (Juz Amma) lengkap dari Surah An-Naba sampai An-Nas. Teks Arab berharakat jelas, transliterasi latin, terjemahan Indonesia, dan audio murottal merdu di IndoQuran.',
                        'metaKeywords' => 'juz 30, juz amma, juz amma lengkap, baca juz 30, al quran juz 30, juz 30 berapa halaman, juz 30 surat apa, surat juz amma, juz 30 online, murottal juz amma, indoquran',
                        'canonicalUrl' => url('/juz/30'),
                        'breadcrumbStructuredData' => $breadcrumbStructuredData,
                        'customStructuredData' => $customStructuredData,
                        'ogType' => 'article'
                    ]);
                } else {
                    $surahsSummary = $juzMeta['surahs_summary'] ?? '';
                    $surahNames = $juzMeta['surah_names'] ?? '';
                    $minPage = $juzMeta['min_page'] ?? 1;
                    $maxPage = $juzMeta['max_page'] ?? 20;
                    $totalPages = $juzMeta['total_pages'] ?? 20;
                    $totalAyahs = $juzMeta['total_ayahs'] ?? 0;
                    $lembarCount = (int) ceil($totalPages / 2);

                    $extraJuzDesc = $juzNumber === 1
                        ? " Mencakup 2 surat (Al-Fatihah & Al-Baqarah ayat 1-141), 148 ayat."
                        : "";

                    $seoData = array_merge($seoData, [
                        'metaTitle' => "Juz {$juzNumber} Al Quran ({$surahNames}) Lengkap - {$totalPages} Halaman & Terjemahan | IndoQuran",
                        'metaDescription' => "Baca Al-Quran Juz {$juzNumber} lengkap memuat {$surahsSummary} (halaman {$minPage}-{$maxPage}, total {$totalPages} halaman / {$lembarCount} lembar, {$totalAyahs} ayat).{$extraJuzDesc} Teks Arab saja, latin, terjemahan Indonesia & murottal.",
                        'metaKeywords' => "juz {$juzNumber}, juz {$juzNumber} lengkap, juz {$juzNumber} arab saja, juz {$juzNumber} arab dan latin, juz {$juzNumber} surah apa, juz {$juzNumber} surat apa, juz {$juzNumber} berapa halaman, juz {$juzNumber} halaman berapa, {$juzNumber} juz of quran, al quran juz {$juzNumber}, quran juz {$juzNumber}, bacaan juz {$juzNumber}, halaman {$minPage}-{$maxPage}, " . strtolower($surahNames),
                        'canonicalUrl' => url("/juz/{$juzNumber}"),
                        'breadcrumbStructuredData' => $breadcrumbStructuredData,
                        'customStructuredData' => $customStructuredData,
                        'ogType' => 'article'
                    ]);
                }
            } else {
                $breadcrumbStructuredData = [
                    '@context' => 'https://schema.org',
                    '@type' => 'BreadcrumbList',
                    'itemListElement' => [
                        [
                            '@type' => 'ListItem',
                            'position' => 1,
                            'name' => 'Beranda',
                            'item' => 'https://indoquran.web.id'
                        ],
                        [
                            '@type' => 'ListItem',
                            'position' => 2,
                            'name' => 'Daftar Juz',
                            'item' => 'https://indoquran.web.id/juz'
                        ]
                    ]
                ];

                // Juz list page SEO
                $seoData = array_merge($seoData, [
                    'metaTitle' => 'Daftar 30 Juz Al-Quran Lengkap (1 Juz Berapa Halaman & Urutan Surat) | IndoQuran',
                    'metaDescription' => 'Daftar lengkap Al-Quran Juz 1 sampai 30: pembagian surat, rentang halaman (604 halaman / 302 lembar), 1 juz berapa halaman (~20 halaman), 2 juz berapa lembar, 5 juz berapa halaman & surat, serta cara melihat juz dalam Al-Quran.',
                    'metaKeywords' => '30 juz berapa halaman, 1 juz berapa halaman, 2 juz berapa lembar, 5 juz berapa halaman, 5 juz berapa surat, juz 1 sampai 10, juz 1 sampai 30, juz 1 sampai 30 surat apa saja, daftar juz al quran, pembagian juz dalam al quran, cara melihat juz di al quran, cara mengetahui juz dalam al quran, juz dalam bahasa arab, apa itu juz, alquran per juz',
                    'canonicalUrl' => url('/juz'),
                    'breadcrumbStructuredData' => $breadcrumbStructuredData,
                    'customStructuredData' => SEOService::generateJuzIndexStructuredData()
                ]);
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'tentang') {
            // About page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Tentang IndoQuran - Platform Al-Quran Digital Indonesia',
                'metaDescription' => 'Pelajari lebih lanjut tentang IndoQuran, platform Al-Quran digital terdepan di Indonesia. Misi kami adalah memudahkan umat Islam dalam membaca dan mempelajari Al-Quran secara online.',
                'metaKeywords' => 'tentang indoquran, al quran digital indonesia, platform quran, teknologi islam, aplikasi quran',
                'canonicalUrl' => url('/tentang')
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'kontak') {
            // Contact page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Kontak Kami - IndoQuran',
                'metaDescription' => 'Hubungi tim IndoQuran untuk pertanyaan, saran, atau masukan mengenai platform Al-Quran digital kami. Kami siap membantu Anda.',
                'metaKeywords' => 'kontak indoquran, hubungi kami, customer service, dukungan teknis',
                'canonicalUrl' => url('/kontak')
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'donasi') {
            // Donation page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Donasi - Dukung IndoQuran',
                'metaDescription' => 'Dukung pengembangan IndoQuran dengan berdonasi. Kontribusi Anda membantu kami menyediakan platform Al-Quran digital yang lebih baik untuk umat Islam Indonesia.',
                'metaKeywords' => 'donasi indoquran, donasi platform islam, dukung pengembangan, kontribusi, sedekah jariyah',
                'canonicalUrl' => url('/donasi')
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'penanda') {
            // Bookmarks page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Penanda Ayat Favorit - IndoQuran',
                'metaDescription' => 'Kelola dan akses penanda ayat Al-Quran favorit Anda. Simpan ayat-ayat penting untuk dibaca kembali dengan mudah di IndoQuran.',
                'metaKeywords' => 'penanda quran, ayat favorit, simpan ayat, al quran penanda, indoquran penanda',
                'canonicalUrl' => url('/penanda'),
                'robots' => 'noindex, nofollow'
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'profil') {
            // Profile page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Profil Pengguna - IndoQuran',
                'metaDescription' => 'Kelola profil dan pengaturan akun IndoQuran Anda.',
                'metaKeywords' => 'profil indoquran, pengaturan akun, pengguna',
                'canonicalUrl' => url('/profil'),
                'robots' => 'noindex, nofollow'
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'masuk') {
            // Login page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Masuk - IndoQuran',
                'metaDescription' => 'Masuk ke akun IndoQuran Anda untuk mengakses fitur penanda dan sinkronisasi bacaan.',
                'metaKeywords' => 'masuk indoquran, login, akun pengguna',
                'canonicalUrl' => url('/masuk'),
                'robots' => 'noindex, nofollow'
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'daftar') {
            // Register page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Daftar Akun - IndoQuran',
                'metaDescription' => 'Buat akun IndoQuran untuk menyimpan penanda ayat dan sinkronisasi progres bacaan Anda.',
                'metaKeywords' => 'daftar indoquran, buat akun, registrasi pengguna',
                'canonicalUrl' => url('/daftar'),
                'robots' => 'noindex, nofollow'
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'tafsir-maudhui') {
            // Tafsir Maudhui page SEO
            if (isset($segments[1])) {
                $slug = trim((string) $segments[1]);
                $topic = $cachedTafsirTopic ?? $this->getCachedTafsirTopic($slug);

                if ($topic) {
                    $descSnippet = Str::limit(strip_tags($topic->description ?: ''), 155);
                    $breadcrumbStructuredData = [
                        '@context' => 'https://schema.org',
                        '@type' => 'BreadcrumbList',
                        'itemListElement' => [
                            [
                                '@type' => 'ListItem',
                                'position' => 1,
                                'name' => 'Beranda',
                                'item' => 'https://indoquran.web.id'
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 2,
                                'name' => 'Tafsir Maudhui',
                                'item' => 'https://indoquran.web.id/tafsir-maudhui'
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 3,
                                'name' => $topic->topic,
                                'item' => (app()->environment('production') && !app()->environment(['local', 'development', 'testing']))
                                    ? "https://indoquran.web.id/tafsir-maudhui/{$topic->slug}"
                                    : url("/tafsir-maudhui/{$topic->slug}")
                            ]
                        ]
                    ];

                    $canonicalUrl = (app()->environment('production') && !app()->environment(['local', 'development', 'testing']))
                        ? "https://indoquran.web.id/tafsir-maudhui/{$topic->slug}"
                        : url("/tafsir-maudhui/{$topic->slug}");

                    // Load verses with actual Arabic/Latin/Indonesian text for rich SSR + FAQ schema
                    $tafsirVerses = self::rememberSafe("seo_tafsir_verses_{$topic->slug}", 86400, function () use ($topic) {
                        $versePairs = $topic->verses->take(20);
                        $result = [];
                        foreach ($versePairs as $pair) {
                            $ayahRow = Ayah::query()
                                ->select('surah_number', 'ayah_number', 'text_arabic', 'text_latin', 'text_indonesian', 'juz', 'page')
                                ->where('surah_number', $pair->surah_number)
                                ->where('ayah_number', $pair->ayah_number)
                                ->first();
                            $surahObj = $this->getCachedSurah((int) $pair->surah_number);
                            if ($ayahRow) {
                                $result[] = [
                                    'surah_number' => (int) $pair->surah_number,
                                    'ayah_number' => (int) $pair->ayah_number,
                                    'surah_name' => $surahObj?->name_latin ?? ("Surah {$pair->surah_number}"),
                                    'surah_arabic' => $surahObj?->name_arabic ?? '',
                                    'text_arabic' => $ayahRow->text_arabic,
                                    'text_latin' => $ayahRow->text_latin,
                                    'text_indonesian' => $ayahRow->text_indonesian,
                                    'juz' => $ayahRow->juz,
                                    'page' => $ayahRow->page,
                                ];
                            }
                        }
                        return $result;
                    });

                    // Map popular GSC query synonyms to matching topic slugs
                    $synonymExtras = '';
                    $slugLower = strtolower($topic->slug);
                    if (str_contains($slugLower, 'khamar')) {
                        $synonymExtras = ', dalil tentang khamr, dalil tentang miras, minuman keras dalam alquran';
                    } elseif (str_contains($slugLower, 'menepati-janji')) {
                        $synonymExtras = ', arti memenuhi janji, manfaat memenuhi janji, mengapa janji harus ditepati, memenuhi janji dalam islam';
                    } elseif (str_contains($slugLower, 'kesehatan')) {
                        $synonymExtras = ', ayat alquran tentang nikmat sehat, dalil menjaga kesehatan';
                    } elseif (str_contains($slugLower, 'riba')) {
                        $synonymExtras = ', ayat riba, ayat tentang riba, alquran tentang riba';
                    } elseif (str_contains($slugLower, 'akhirat')) {
                        $synonymExtras = ', akhirat adalah, kehidupan akhirat dalam alquran';
                    } elseif (str_contains($slugLower, 'ashabul-kahfi')) {
                        $synonymExtras = ', arti ashabul kahfi, kisah ashabul kahfi dalam al quran';
                    } elseif (str_contains($slugLower, 'munafik')) {
                        $synonymExtras = ', al quran tentang orang munafik, ciri orang munafik dalam alquran';
                    } elseif (str_contains($slugLower, 'toleransi')) {
                        $synonymExtras = ', ayat tentang toleransi, dalil tentang toleransi';
                    } elseif (str_contains($slugLower, 'syukur')) {
                        $synonymExtras = ', dalil tentang bersyukur, dalil tentang syukur, hikmah bersyukur kepada allah';
                    } elseif (str_contains($slugLower, 'pernikahan')) {
                        $synonymExtras = ', dalil pernikahan, ayat alquran tentang pernikahan';
                    } elseif (str_contains($slugLower, 'khilafah')) {
                        $synonymExtras = ', contoh khilafah, konsep khilafah dalam alquran';
                    }

                    $metaKeywords = "tafsir maudhui {$topic->topic}, ayat tentang {$topic->topic}, dalil {$topic->topic}, dalil al quran {$topic->topic}, al quran {$topic->topic}{$synonymExtras}, indoquran";
                    $tafsirStructuredData = SEOService::generateTafsirTopicStructuredData($topic, $canonicalUrl, $tafsirVerses, $metaKeywords);

                    $seoData = array_merge($seoData, [
                        'metaTitle' => "Dalil & Ayat Al-Quran: {$topic->topic} (Tafsir Maudhui) | IndoQuran",
                        'metaDescription' => $descSnippet ?: "Kumpulan dalil dan ayat Al-Quran tentang {$topic->topic} lengkap dengan teks Arab, transliterasi latin, dan terjemahan bahasa Indonesia Kemenag di IndoQuran.",
                        'metaKeywords' => $metaKeywords,
                        'canonicalUrl' => $canonicalUrl,
                        'breadcrumbStructuredData' => $breadcrumbStructuredData,
                        'customStructuredData' => $tafsirStructuredData,
                        'ogType' => 'article'
                    ]);
                } else {
                    $isInvalidRoute = true;
                }
            } else {
                $breadcrumbStructuredData = [
                    '@context' => 'https://schema.org',
                    '@type' => 'BreadcrumbList',
                    'itemListElement' => [
                        [
                            '@type' => 'ListItem',
                            'position' => 1,
                            'name' => 'Beranda',
                            'item' => 'https://indoquran.web.id'
                        ],
                        [
                            '@type' => 'ListItem',
                            'position' => 2,
                            'name' => 'Tafsir Maudhui',
                            'item' => 'https://indoquran.web.id/tafsir-maudhui'
                        ]
                    ]
                ];

                $seoData = array_merge($seoData, [
                    'metaTitle' => 'Tafsir Maudhui - Kumpulan Dalil & Ayat Al-Quran Berdasarkan Tema | IndoQuran',
                    'metaDescription' => 'Temukan dalil Al-Quran dan ayat-ayat pilihan berdasarkan tema kehidupan: akidah, ibadah, syukur, toleransi, riba, pernikahan, khamr, akhlak, akhirat, dan 300+ topik tafsir maudhui di IndoQuran.',
                    'metaKeywords' => 'tafsir maudhui, dalil al quran, dalil alquran, cari ayat al quran, ayat tentang toleransi, ayat riba, dalil pernikahan, dalil tentang bersyukur, dalil tentang khamr, akhirat adalah, memenuhi janji',
                    'canonicalUrl' => url('/tafsir-maudhui'),
                    'breadcrumbStructuredData' => $breadcrumbStructuredData,
                    'ogType' => 'article'
                ]);
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'doa-bersama') {
            if ($request->filled('doa') && is_numeric($request->doa)) {
                $selectedPrayer = \App\Models\SelectedPrayer::find($request->doa);
                if ($selectedPrayer) {
                    $transSnippet = Str::limit($selectedPrayer->translation, 140);
                    $seoData = array_merge($seoData, [
                        'metaTitle' => "{$selectedPrayer->title} - Doa Pilihan | IndoQuran",
                        'metaDescription' => "{$selectedPrayer->title}: \"{$transSnippet}\" - Baca doa lengkap dengan teks Arab berharakat, transliterasi Latin, terjemahan Indonesia, dan sumber riwayat di IndoQuran.",
                        'metaKeywords' => "doa pilihan, {$selectedPrayer->title}, doa al quran, doa hadits, doa islam, doa bersamaindoquran",
                        'canonicalUrl' => url('/doa-bersama?doa=' . $selectedPrayer->id),
                        'ogType' => 'article'
                    ]);
                } else {
                    return redirect(url('/doa-bersama'), 301);
                }
            } elseif (isset($segments[1]) && is_numeric($segments[1])) {
                $prayer = Prayer::with('user')->find($segments[1]);
                if ($prayer) {
                    $authorName = $prayer->is_anonymous ? 'Hamba Allah' : ($prayer->user->name ?? 'Saudara Seiman');
                    $contentSnippet = Str::limit($prayer->content, 140);
                    $titleSnippet = Str::limit($prayer->title ?: $prayer->content, 50);

                    $seoData = array_merge($seoData, [
                        'metaTitle' => "Doa dari {$authorName}: \"{$titleSnippet}\" - Doa Bersama | IndoQuran",
                        'metaDescription' => "\"{$contentSnippet}\" - Mari bersama-sama mengaminkan doa dari {$authorName} di komunitas Doa Bersama IndoQuran.",
                        'metaKeywords' => "doa bersama, doa {$authorName}, doa islam, amin doa, komunitas muslim indoquran",
                        'canonicalUrl' => url('/doa-bersama/' . $prayer->id),
                        'ogType' => 'article'
                    ]);
                } else {
                    $isInvalidRoute = true;
                }
            } else {
                // Prayer page SEO (Default Doa Pilihan)
                $seoData = array_merge($seoData, [
                    'metaTitle' => "Koleksi Doa-Doa Pilihan Al-Qur'an & Sunnah Lengkap | IndoQuran",
                    'metaDescription' => "Koleksi lengkap doa-doa pilihan otentik dari Al-Qur'an dan As-Sunnah lengkap dengan teks Arab berharakat, transliterasi Latin, dan terjemahan Indonesia.",
                    'metaKeywords' => 'doa bersama, doa pilihan, doa al quran, doa hadits, doa islam, indoquran doa',
                    'canonicalUrl' => url('/doa-bersama')
                ]);
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'asmaul-husna') {
            // Asmaul Husna page SEO - Optimized for 99 Asmaul Husna & typo variants
            $asmaulFaq = [
                '@context' => 'https://schema.org',
                '@type' => 'FAQPage',
                'mainEntity' => [
                    [
                        '@type' => 'Question',
                        'name' => 'Apa arti dan jumlah Asmaul Husna?',
                        'acceptedAnswer' => [
                            '@type' => 'Answer',
                            'text' => 'Asmaul Husna adalah 99 nama-nama Allah SWT yang paling indah dan mulia, mencerminkan sifat-sifat kesempurnaan-Nya yang terdapat di dalam Al-Quran dan Hadits.'
                        ]
                    ],
                    [
                        '@type' => 'Question',
                        'name' => 'Bagaimana urutan 99 Asmaul Husna beserta artinya?',
                        'acceptedAnswer' => [
                            '@type' => 'Answer',
                            'text' => 'Urutan 99 Asmaul Husna dimulai dari Ar-Rahman (Yang Maha Pengasih), Ar-Rahim (Yang Maha Penyayang), Al-Malik (Yang Maha Merajai) hingga As-Sabur (Yang Maha Sabar). Seluruh teks Arab, latin, arti Indonesia, dan ayat Al-Quran terkait tersedia lengkap di IndoQuran.'
                        ]
                    ]
                ]
            ];

            $seoData = array_merge($seoData, [
                'metaTitle' => '99 Asmaul Husna Lengkap - Teks Arab, Latin, Arti & Makna | IndoQuran',
                'metaDescription' => '📿 99 Asmaul Husna Lengkap ✅ Teks Arab & Latin ✅ Arti Bahasa Indonesia ✅ Dalil Ayat Al-Quran ✅ Penjelasan Makna. Pelajari nama-nama indah Allah SWT untuk dzikir dan doa. Baca online GRATIS!',
                'metaKeywords' => '99 asmaul husna, asmaul husna, asmahulsna, asmaul husna lengkap, nama allah swt, asmaul husna arab latin, asmaul husna dan artinya, dzikir asmaul husna, nama indah allah, asma allah husna',
                'canonicalUrl' => url('/asmaul-husna'),
                'customStructuredData' => $asmaulFaq
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'hadits') {
            // Hadits SEO - Enhanced for Google Rich Sitelinks
            $catalog = \App\Http\Controllers\HaditsController::getKitabCatalog();
            if (count($segments) === 1) {
                $query = trim((string) $request->get('q', ''));
                $kitabParam = trim((string) $request->get('kitab', 'all'));
                if ($query !== '') {
                    $kitabLabel = ($kitabParam !== 'all' && isset($catalog[$kitabParam])) ? $catalog[$kitabParam]['name'] : 'Seluruh Hadits';
                    $seoData = array_merge($seoData, [
                        'metaTitle' => "Pencarian Hadits \"{$query}\" ({$kitabLabel}) - Koleksi Hadits Nabawi | IndoQuran",
                        'metaDescription' => "Hasil pencarian hadits untuk kata kunci \"{$query}\" pada {$kitabLabel}. Teks hadits lengkap bahasa Arab dan terjemahan bahasa Indonesia di IndoQuran.",
                        'metaKeywords' => "cari hadits {$query}, pencarian hadits, hadits {$query}, {$kitabLabel}, hadits shahih, kutubut tisah, indoquran",
                        'canonicalUrl' => url('/hadits'),
                        'robots' => 'noindex, follow'
                    ]);
                } else {
                    $breadcrumbStructuredData = [
                        '@context' => 'https://schema.org',
                        '@type' => 'BreadcrumbList',
                        'itemListElement' => [
                            [
                                '@type' => 'ListItem',
                                'position' => 1,
                                'name' => 'Beranda',
                                'item' => 'https://indoquran.web.id'
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 2,
                                'name' => 'Hadits Shahih Online',
                                'item' => 'https://indoquran.web.id/hadits'
                            ]
                        ]
                    ];

                    $siteNavigationStructuredData = [
                        '@context' => 'https://schema.org',
                        '@graph' => [
                            [
                                '@type' => 'SiteNavigationElement',
                                'name' => 'Hadits Muslim',
                                'description' => 'Baca 3.033 hadits Muslim (Shahih Muslim) lengkap 57 kitab.',
                                'url' => 'https://indoquran.web.id/hadits/shahih_muslim'
                            ],
                            [
                                '@type' => 'SiteNavigationElement',
                                'name' => 'Hadits Bukhari',
                                'description' => 'Teks Arab, terjemahan Indonesia, dan nomor hadits di Shahih Bukhari.',
                                'url' => 'https://indoquran.web.id/hadits/shahih_bukhari'
                            ],
                            [
                                '@type' => 'SiteNavigationElement',
                                'name' => 'Hadits Nasai',
                                'description' => 'Baca 5.758 hadits Nasa\'i (Sunan An-Nasa\'i) lengkap teks Arab dan terjemahan.',
                                'url' => 'https://indoquran.web.id/hadits/sunan_nasai'
                            ],
                            [
                                '@type' => 'SiteNavigationElement',
                                'name' => 'Hadits Abu Daud',
                                'description' => 'Baca 5.274 hadits Sunan Abu Daud lengkap teks Arab dan terjemahan.',
                                'url' => 'https://indoquran.web.id/hadits/sunan_abu_daud'
                            ],
                            [
                                '@type' => 'SiteNavigationElement',
                                'name' => 'Hadits Tentang Takdir',
                                'description' => 'Kumpulan hadits shahih tentang takdir dan ketetapan Allah SWT.',
                                'url' => 'https://indoquran.web.id/hadits/tentang/takdir'
                            ],
                            [
                                '@type' => 'SiteNavigationElement',
                                'name' => 'Hadits Tentang Shalat',
                                'description' => 'Kumpulan hadits tentang shalat, bacaan, dan tata caranya.',
                                'url' => 'https://indoquran.web.id/hadits/tentang/shalat'
                            ],
                            [
                                '@type' => 'SiteNavigationElement',
                                'name' => 'Hadits Tentang Iddah',
                                'description' => 'Kumpulan hadits tentang iddah. Baca teks Arab dan terjemahan.',
                                'url' => 'https://indoquran.web.id/hadits/tentang/iddah'
                            ],
                            [
                                '@type' => 'SiteNavigationElement',
                                'name' => 'Hadits Tentang Matahari',
                                'description' => 'Kumpulan hadits tentang matahari dan fenomena alam.',
                                'url' => 'https://indoquran.web.id/hadits/tentang/matahari'
                            ],
                            [
                                '@type' => 'SiteNavigationElement',
                                'name' => 'Hadits Tentang Jenazah',
                                'description' => 'Kumpulan hadits tentang jenazah, takziah, dan pengurusannya.',
                                'url' => 'https://indoquran.web.id/hadits/tentang/jenazah'
                            ],
                        ]
                    ];

                    $collectionStructuredData = [
                        '@context' => 'https://schema.org',
                        '@type' => 'CollectionPage',
                        'name' => 'Hadits Shahih Online | Cari Hadis Bukhari & Muslim - IndoQuran',
                        'description' => 'Baca dan cari hadits shahih online (Bukhari, Muslim, dan kutub lainnya). Teks Arab, terjemahan Indonesia, dan nomor hadits lengkap di IndoQuran.',
                        'url' => 'https://indoquran.web.id/hadits',
                        'mainEntity' => [
                            '@type' => 'ItemList',
                            'numberOfItems' => 7,
                            'itemListElement' => array_values(array_map(function ($k, $idx) {
                                return [
                                    '@type' => 'ListItem',
                                    'position' => $idx + 1,
                                    'name' => 'Hadits ' . $k['name'],
                                    'description' => $k['description'],
                                    'url' => 'https://indoquran.web.id/hadits/' . $k['slug']
                                ];
                            }, $catalog, array_keys(array_values($catalog))))
                        ]
                    ];

                    $seoData = array_merge($seoData, [
                        'metaTitle' => 'Hadits Shahih Online | Cari Hadis Bukhari & Muslim - IndoQuran',
                        'metaDescription' => 'Baca dan cari hadits shahih online (Bukhari, Muslim, dan kutub lainnya). Teks Arab, terjemahan Indonesia, dan nomor hadits lengkap di IndoQuran.',
                        'metaKeywords' => 'hadits, hadits shahih, shahih bukhari, shahih muslim, cari hadits, sunan abu daud, kutubus sittah, musnad ahmad, hadits nabi, hadits online indonesia',
                        'canonicalUrl' => url('/hadits'),
                        'breadcrumbStructuredData' => $breadcrumbStructuredData,
                        'siteNavigationStructuredData' => $siteNavigationStructuredData,
                        'customStructuredData' => $collectionStructuredData
                    ]);
                }
            } elseif (count($segments) === 3 && $segments[1] === 'tentang') {
                $topicSlug = $segments[2];
                $topicName = ucwords(str_replace(['-', '_'], ' ', $topicSlug));
                $isKhamrTopic = in_array(strtolower($topicSlug), ['khamr', 'khamar', 'minuman-keras'], true);
                $displayTopicTitle = $isKhamrTopic ? 'Khamr / Khamar & Minuman Keras (Miras)' : $topicName;

                $breadcrumbStructuredData = [
                    '@context' => 'https://schema.org',
                    '@type' => 'BreadcrumbList',
                    'itemListElement' => [
                        [
                            '@type' => 'ListItem',
                            'position' => 1,
                            'name' => 'Beranda',
                            'item' => 'https://indoquran.web.id'
                        ],
                        [
                            '@type' => 'ListItem',
                            'position' => 2,
                            'name' => 'Hadits Shahih',
                            'item' => 'https://indoquran.web.id/hadits'
                        ],
                        [
                            '@type' => 'ListItem',
                            'position' => 3,
                            'name' => 'Hadits tentang ' . $displayTopicTitle,
                            'item' => 'https://indoquran.web.id/hadits/tentang/' . $topicSlug
                        ]
                    ]
                ];

                $extraTopicKeywords = $isKhamrTopic
                    ? ', hadis tentang khamar, hadits tentang khamr, hadits minuman keras, dalil tentang khamr, dalil tentang miras'
                    : '';

                $seoData = array_merge($seoData, [
                    'metaTitle' => "Hadits tentang {$displayTopicTitle} (Shahih Bukhari & Muslim) | IndoQuran",
                    'metaDescription' => "Kumpulan hadits shahih tentang " . strtolower($displayTopicTitle) . " dari Shahih Bukhari, Shahih Muslim, dan Kutubus Sittah. Baca teks Arab berharakat dan terjemahan Indonesia di IndoQuran.",
                    'metaKeywords' => "hadits tentang {$topicName}, hadis tentang {$topicName}, hadits {$topicName}, kumpulan hadits {$topicName}, hadits shahih {$topicName}{$extraTopicKeywords}",
                    'canonicalUrl' => url('/hadits/tentang/' . $topicSlug),
                    'breadcrumbStructuredData' => $breadcrumbStructuredData
                ]);
            } elseif (count($segments) === 2 && isset($catalog[$segments[1]])) {
                $kitab = $catalog[$segments[1]];

                // Descriptive snippets matching Google sitelink descriptions
                $kitabDesc = "Baca {$kitab['total']} hadits {$kitab['name']} ({$kitab['arab']}) lengkap. Teks Arab berharakat, nomor hadits, dan terjemahan bahasa Indonesia di IndoQuran.";
                if ($kitab['slug'] === 'shahih_muslim') {
                    $kitabDesc = "Baca 3.033 hadits Muslim (Shahih Muslim) lengkap - 57 kitab. Teks Arab, terjemahan Indonesia, dan nomor hadits di IndoQuran.";
                } elseif ($kitab['slug'] === 'shahih_bukhari') {
                    $kitabDesc = "Baca 7.563 hadits Bukhari (Shahih Bukhari) lengkap. Teks Arab, terjemahan Indonesia, dan nomor hadits di IndoQuran.";
                } elseif ($kitab['slug'] === 'sunan_nasai') {
                    $kitabDesc = "Baca 5.758 hadits Nasa'i (Sunan An-Nasa'i) lengkap. Teks Arab, terjemahan Indonesia, dan nomor hadits di IndoQuran.";
                } elseif ($kitab['slug'] === 'sunan_abu_daud') {
                    $kitabDesc = "Baca 5.274 hadits Sunan Abu Daud lengkap. Teks Arab, terjemahan Indonesia, dan nomor hadits di IndoQuran.";
                }

                $breadcrumbStructuredData = [
                    '@context' => 'https://schema.org',
                    '@type' => 'BreadcrumbList',
                    'itemListElement' => [
                        [
                            '@type' => 'ListItem',
                            'position' => 1,
                            'name' => 'Beranda',
                            'item' => 'https://indoquran.web.id'
                        ],
                        [
                            '@type' => 'ListItem',
                            'position' => 2,
                            'name' => 'Hadits Shahih',
                            'item' => 'https://indoquran.web.id/hadits'
                        ],
                        [
                            '@type' => 'ListItem',
                            'position' => 3,
                            'name' => 'Hadits ' . $kitab['name'],
                            'item' => 'https://indoquran.web.id/hadits/' . $segments[1]
                        ]
                    ]
                ];

                $bookStructuredData = [
                    '@context' => 'https://schema.org',
                    '@type' => 'Book',
                    'name' => $kitab['name'],
                    'alternateName' => $kitab['arab'],
                    'author' => [
                        '@type' => 'Person',
                        'name' => $kitab['author']
                    ],
                    'inLanguage' => ['ar', 'id'],
                    'url' => 'https://indoquran.web.id/hadits/' . $segments[1],
                    'description' => $kitab['description'],
                    'numberOfItems' => $kitab['total']
                ];

                $metaTitle = "Hadits {$kitab['name']} Online - IndoQuran";
                $kategoriQuery = $request->query('kategori');
                if (!empty($kategoriQuery)) {
                    $cleanCat = trim(str_replace(['-', '_'], ' ', $kategoriQuery));
                    $metaTitle = "Hadits {$kitab['name']}: " . ucwords($cleanCat) . " - IndoQuran";
                    $kitabDesc = "Baca kumpulan hadits {$kitab['name']} bab " . ucwords($cleanCat) . " lengkap teks Arab berharakat dan terjemahan bahasa Indonesia di IndoQuran.";
                }

                $seoData = array_merge($seoData, [
                    'metaTitle' => $metaTitle,
                    'metaDescription' => $kitabDesc,
                    'metaKeywords' => "{$kitab['name']}, hadits {$kitab['name']}, {$kitab['arab']}, baca hadits online, kutubus sittah, terjemah hadits" . (!empty($kategoriQuery) ? ", hadits {$kategoriQuery}" : ""),
                    'canonicalUrl' => url('/hadits/' . $segments[1]),
                    'breadcrumbStructuredData' => $breadcrumbStructuredData,
                    'customStructuredData' => $bookStructuredData
                ]);
            } elseif (count($segments) === 3 && isset($catalog[$segments[1]])) {
                $kitab = $catalog[$segments[1]];
                $nomor = (int) $segments[2];

                $haditsCache = app(\App\Services\HaditsCacheService::class);
                $detail = $haditsCache->getHaditsDetail($segments[1], $nomor);

                if ($detail && isset($detail['hadits'])) {
                    $haditsItem = $detail['hadits'];
                    $cleanIndo = trim(preg_replace('/\s+/', ' ', strip_tags($haditsItem->indonesia ?? '')));
                    $indoSnippet = !empty($cleanIndo) ? Str::limit($cleanIndo, 140, '...') : '';
                    $kategoriText = !empty($haditsItem->kategori) ? " ({$haditsItem->kategori})" : '';

                    $metaTitle = "Hadits {$kitab['name']} No. {$nomor}{$kategoriText} - Teks Arab & Terjemahan | IndoQuran";
                    $metaDescription = !empty($indoSnippet)
                        ? "Hadits {$kitab['name']} No. {$nomor}: \"{$indoSnippet}\" Baca teks Arab berharakat, sanad, dan arti bahasa Indonesia di IndoQuran."
                        : "Baca Hadits {$kitab['name']} Nomor {$nomor} lengkap dengan teks Arab berharakat dan terjemahan bahasa Indonesia di IndoQuran.";

                    $breadcrumbStructuredData = [
                        '@context' => 'https://schema.org',
                        '@type' => 'BreadcrumbList',
                        'itemListElement' => [
                            [
                                '@type' => 'ListItem',
                                'position' => 1,
                                'name' => 'Beranda',
                                'item' => 'https://indoquran.web.id'
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 2,
                                'name' => 'Hadits Shahih',
                                'item' => 'https://indoquran.web.id/hadits'
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 3,
                                'name' => 'Hadits ' . $kitab['name'],
                                'item' => 'https://indoquran.web.id/hadits/' . $segments[1]
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 4,
                                'name' => "Hadits No. {$nomor}",
                                'item' => 'https://indoquran.web.id/hadits/' . $segments[1] . '/' . $nomor
                            ]
                        ]
                    ];

                    $articleStructuredData = [
                        '@context' => 'https://schema.org',
                        '@type' => 'Article',
                        'headline' => "Hadits {$kitab['name']} Nomor {$nomor}" . (!empty($haditsItem->kategori) ? " - Bab {$haditsItem->kategori}" : ""),
                        'description' => $metaDescription,
                        'inLanguage' => ['ar', 'id'],
                        'mainEntityOfPage' => [
                            '@type' => 'WebPage',
                            '@id' => 'https://indoquran.web.id/hadits/' . $segments[1] . '/' . $nomor
                        ],
                        'author' => [
                            '@type' => 'Person',
                            'name' => $kitab['author'] ?? 'Perawi Hadits'
                        ],
                        'publisher' => [
                            '@type' => 'Organization',
                            'name' => 'IndoQuran',
                            'url' => 'https://indoquran.web.id',
                            'logo' => [
                                '@type' => 'ImageObject',
                                'url' => 'https://indoquran.web.id/android-chrome-512x512.png'
                            ]
                        ]
                    ];

                    // Fetch up to 4 related hadiths in the same category for rich internal links
                    $relatedHadiths = [];
                    if (!empty($haditsItem->kategori) && !empty($kitab['table'])) {
                        $table = $kitab['table'];
                        if (\Illuminate\Support\Facades\Schema::hasTable($table)) {
                            $hasNo = \Illuminate\Support\Facades\Schema::hasColumn($table, 'no');
                            $noCol = $hasNo ? 'no' : 'id';
                            $relatedRows = \Illuminate\Support\Facades\DB::table($table)
                                ->where('kategori', $haditsItem->kategori)
                                ->where($noCol, '!=', $nomor)
                                ->select($noCol . ' as no', 'kategori', 'indonesia')
                                ->limit(4)
                                ->get();
                            foreach ($relatedRows as $relRow) {
                                $relatedHadiths[] = [
                                    'no' => $relRow->no,
                                    'kategori' => $relRow->kategori,
                                    'snippet' => Str::limit(trim(preg_replace('/\s+/', ' ', strip_tags($relRow->indonesia ?? ''))), 80, '...')
                                ];
                            }
                        }
                    }

                    $canonicalUrl = (app()->environment('production') && !app()->environment(['local', 'development', 'testing']))
                        ? 'https://indoquran.web.id/hadits/' . $segments[1] . '/' . $nomor
                        : url('/hadits/' . $segments[1] . '/' . $nomor);

                    $seoData = array_merge($seoData, [
                        'metaTitle' => $metaTitle,
                        'metaDescription' => $metaDescription,
                        'metaKeywords' => "hadits {$kitab['name']} {$nomor}, hadits no {$nomor}, {$kitab['name']}" . (!empty($haditsItem->kategori) ? ", hadits {$haditsItem->kategori}" : "") . ", teks hadits, terjemah hadits",
                        'canonicalUrl' => $canonicalUrl,
                        'breadcrumbStructuredData' => $breadcrumbStructuredData,
                        'customStructuredData' => SEOService::generateHaditsStructuredData($kitab, $haditsItem, $nomor)
                    ]);

                    $cachedHaditsDetail = [
                        'kitab' => $kitab,
                        'hadits' => $haditsItem,
                        'navigation' => $detail['navigation'] ?? [],
                        'related' => $relatedHadiths
                    ];
                } else {
                    $isInvalidRoute = true;
                }
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'member') {
            // Member benefits page SEO - NEW
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Keuntungan Member IndoQuran - Fitur Premium Gratis | IndoQuran',
                'metaDescription' => '🌟 Daftar GRATIS & Nikmati Fitur Premium ✅ Simpan Bookmark Unlimited ✅ Sinkronisasi Multi-Device ✅ Catatan Pribadi ✅ Riwayat Bacaan. Tingkatkan pengalaman belajar Al-Quran Anda!',
                'metaKeywords' => 'member indoquran, fitur premium, bookmark quran, sinkronisasi bacaan, catatan quran, daftar gratis',
                'canonicalUrl' => url('/member')
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'kebijakan') {
            // Privacy page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Kebijakan Privasi - IndoQuran',
                'metaDescription' => 'Baca kebijakan privasi IndoQuran. Kami berkomitmen melindungi data pribadi dan privasi pengguna platform Al-Quran digital kami.',
                'metaKeywords' => 'kebijakan privasi, privacy policy, perlindungan data, keamanan data',
                'canonicalUrl' => url('/kebijakan')
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'syarat-ketentuan') {
            // Terms of Service page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Syarat dan Ketentuan Layanan - IndoQuran',
                'metaDescription' => 'Baca syarat dan ketentuan layanan IndoQuran. Informasi hak, kewajiban, akun, otentikasi Google, dan aturan pemanfaatan platform Al-Quran digital.',
                'metaKeywords' => 'syarat dan ketentuan, terms of service, ketentuan layanan indoquran, aturan penggunaan, google oauth',
                'canonicalUrl' => url('/syarat-ketentuan')
            ]);
        }

        elseif (isset($segments[0]) && $segments[0] === 'halaman') {
            // Page detail SEO
            if (isset($segments[1]) && is_numeric($segments[1])) {
                $pageNumber = (int) $segments[1];

                // Fetch cached page ayahs to build rich, unique meta title and description (include juz & page!)
                $pageAyahs = self::rememberSafe("seo_page_ayahs_{$pageNumber}", 86400, function () use ($pageNumber) {
                    return Ayah::query()
                        ->select('surah_number', 'ayah_number', 'text_arabic', 'text_latin', 'text_indonesian', 'juz', 'page')
                        ->with('surah:number,name_latin,name_indonesian,name_arabic')
                        ->where('page', $pageNumber)
                        ->orderBy('surah_number')
                        ->orderBy('ayah_number')
                        ->get();
                });

                $surahNames = $pageAyahs->pluck('surah.name_latin')->filter()->unique()->values();
                $surahLabel = $surahNames->isNotEmpty() ? 'Surah ' . $surahNames->implode(', ') : '';

                $surahSpanTexts = $pageAyahs->groupBy('surah_number')->map(function ($grp) {
                    $first = $grp->first();
                    $last = $grp->last();
                    $name = $first?->surah?->name_latin;
                    if (!$name) return null;
                    return "{$name} ayat {$first->ayah_number}-{$last->ayah_number}";
                })->filter()->values();
                $surahSpanSummary = $surahSpanTexts->isNotEmpty() ? $surahSpanTexts->implode(', ') : '';

                $juzNum = $pageAyahs->first()?->juz ?? 1;
                $lembarNum = (int) ceil($pageNumber / 2);
                $arabicNum = SEOService::toArabicNumerals($pageNumber);
                $lastPageSuffix = $pageNumber === 604 ? ' (Halaman Terakhir Al-Quran)' : '';

                $metaTitle = "Al Quran Halaman {$pageNumber}" . ($surahSpanSummary ? " ({$surahSpanSummary})" : "") . " Juz {$juzNum}{$lastPageSuffix} | IndoQuran";
                $metaDescription = "Baca Al-Quran Halaman {$pageNumber} (Muka Surat {$pageNumber} / Page {$pageNumber} / Tulisan Arab {$arabicNum}) Juz {$juzNum} Lembar ke-{$lembarNum}" . ($surahSpanSummary ? " memuat {$surahSpanSummary}" : "") . "{$lastPageSuffix} dengan teks Arab jelas, transliterasi latin, terjemahan Indonesia Kemenag, dan audio murottal.";
                $metaKeywords = "al quran halaman {$pageNumber}, alquran halaman {$pageNumber}, alquran hal {$pageNumber}, halaman {$pageNumber} al quran, al quran ms {$pageNumber}, al quran muka surat {$pageNumber}, page {$pageNumber} quran, {$pageNumber} tulisan arab, {$pageNumber} arabic number, al quran per halaman, quran online per halaman, lembar ke {$lembarNum}, " . strtolower($surahSpanSummary ? $surahSpanSummary . ', ' : '') . "quran digital indonesia";

                $breadcrumbStructuredData = [
                    '@context' => 'https://schema.org',
                    '@type' => 'BreadcrumbList',
                    'itemListElement' => [
                        [
                            '@type' => 'ListItem',
                            'position' => 1,
                            'name' => 'Beranda',
                            'item' => 'https://indoquran.web.id'
                        ],
                        [
                            '@type' => 'ListItem',
                            'position' => 2,
                            'name' => 'Daftar Halaman',
                            'item' => 'https://indoquran.web.id/halaman'
                        ],
                        [
                            '@type' => 'ListItem',
                            'position' => 3,
                            'name' => "Halaman {$pageNumber}",
                            'item' => "https://indoquran.web.id/halaman/{$pageNumber}"
                        ]
                    ]
                ];

                // Specific page SEO
                $seoData = array_merge($seoData, [
                    'metaTitle' => $metaTitle,
                    'metaDescription' => $metaDescription,
                    'metaKeywords' => $metaKeywords,
                    'canonicalUrl' => url("/halaman/{$pageNumber}"),
                    'breadcrumbStructuredData' => $breadcrumbStructuredData,
                    'customStructuredData' => SEOService::generateHalamanStructuredData($pageNumber, ['juz' => $juzNum, 'summary' => $surahSpanSummary]),
                    'ogType' => 'article'
                ]);
            } else {
                $breadcrumbStructuredData = [
                    '@context' => 'https://schema.org',
                    '@type' => 'BreadcrumbList',
                    'itemListElement' => [
                        [
                            '@type' => 'ListItem',
                            'position' => 1,
                            'name' => 'Beranda',
                            'item' => 'https://indoquran.web.id'
                        ],
                        [
                            '@type' => 'ListItem',
                            'position' => 2,
                            'name' => 'Daftar Halaman',
                            'item' => 'https://indoquran.web.id/halaman'
                        ]
                    ]
                ];

                // Page list SEO
                $seoData = array_merge($seoData, [
                    'metaTitle' => 'Daftar 604 Halaman Al-Quran Online Per Halaman (302 Lembar) | IndoQuran',
                    'metaDescription' => 'Baca Al-Quran online per halaman lengkap 604 halaman (302 lembar) Mushaf Madinah & Kemenag RI, dari halaman 1 hingga halaman terakhir 604. Teks Arab, latin, terjemahan Indonesia & gambar mushaf.',
                    'metaKeywords' => 'al quran halaman, al quran per halaman, al quran perhalaman, al quran online per halaman, al quran online per halaman dan terjemahan, quran online per halaman, ada berapa halaman dalam al quran, alquran ada berapa halaman, jumlah halaman al quran, lembar alquran, al quran lembaran, halaman terakhir al quran',
                    'canonicalUrl' => url('/halaman'),
                    'breadcrumbStructuredData' => $breadcrumbStructuredData,
                    'customStructuredData' => SEOService::generateHalamanIndexStructuredData()
                ]);
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'riwayat-versi') {
            // Riwayat Versi page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Riwayat Versi - IndoQuran',
                'metaDescription' => 'Catatan lengkap perubahan dan pembaruan versi platform Al-Quran digital IndoQuran. Lihat perkembangan fitur, perbaikan, dan peningkatan dari waktu ke waktu.',
                'metaKeywords' => 'indoquran update, changelog, version history, riwayat versi, pembaruan aplikasi, fitur baru',
                'canonicalUrl' => url('/riwayat-versi')
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'artikel') {
            // Article SEO handling
            if (isset($segments[1])) {
                $slug = (string) $segments[1];
                $article = $cachedArticle ?? $this->getCachedArticle($slug);
                if ($article) {
                    $rawDescription = strip_tags($article->excerpt ?: $article->content);
                    $articleDescription = Str::limit(html_entity_decode($rawDescription, ENT_QUOTES | ENT_HTML5, 'UTF-8'), 160);
                    $tagNames = $article->tags ? $article->tags->pluck('name')->toArray() : [];
                    $tagsString = !empty($tagNames) ? implode(', ', $tagNames) : '';
                    $metaKeywords = "artikel islam, {$article->title}, kajian quran, " . ($tagsString ? "{$tagsString}, " : "") . "indoquran";
                    $canonicalUrl = "https://indoquran.web.id/artikel/{$slug}";
                    $ogImage = $article->featured_image_url ?: url('/android-chrome-512x512.png');

                    // Schema.org Article Structured Data (JSON-LD)
                    $articleStructuredData = [
                        '@context' => 'https://schema.org',
                        '@type' => 'Article',
                        'mainEntityOfPage' => [
                            '@type' => 'WebPage',
                            '@id' => $canonicalUrl
                        ],
                        'headline' => $article->title,
                        'description' => $articleDescription,
                        'image' => [
                            $ogImage
                        ],
                        'datePublished' => $article->published_at ? $article->published_at->toIso8601String() : $article->created_at->toIso8601String(),
                        'dateModified' => $article->updated_at ? $article->updated_at->toIso8601String() : ($article->published_at ? $article->published_at->toIso8601String() : now()->toIso8601String()),
                        'author' => [
                            '@type' => 'Person',
                            'name' => $article->author ? $article->author->name : 'Redaksi IndoQuran',
                            'url' => 'https://indoquran.web.id'
                        ],
                        'publisher' => [
                            '@type' => 'Organization',
                            'name' => 'IndoQuran',
                            'url' => 'https://indoquran.web.id',
                            'logo' => [
                                '@type' => 'ImageObject',
                                'url' => 'https://indoquran.web.id/android-chrome-512x512.png',
                                'width' => 512,
                                'height' => 512
                            ]
                        ],
                        'inLanguage' => 'id-ID',
                        'articleSection' => 'Kajian Al-Quran & Islam',
                        'keywords' => $metaKeywords
                    ];

                    // Schema.org BreadcrumbList Structured Data
                    $breadcrumbStructuredData = [
                        '@context' => 'https://schema.org',
                        '@type' => 'BreadcrumbList',
                        'itemListElement' => [
                            [
                                '@type' => 'ListItem',
                                'position' => 1,
                                'name' => 'Beranda',
                                'item' => 'https://indoquran.web.id'
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 2,
                                'name' => 'Artikel',
                                'item' => 'https://indoquran.web.id/artikel'
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 3,
                                'name' => $article->title,
                                'item' => $canonicalUrl
                            ]
                        ]
                    ];

                    $articleOpenGraphMeta = [
                        'published_time' => $article->published_at ? $article->published_at->toIso8601String() : null,
                        'modified_time' => $article->updated_at ? $article->updated_at->toIso8601String() : null,
                        'author' => $article->author ? $article->author->name : 'IndoQuran',
                        'section' => 'Kajian Al-Quran & Islam',
                        'tags' => $tagNames,
                    ];

                    $seoData = array_merge($seoData, [
                        'metaTitle' => "{$article->title} | IndoQuran",
                        'metaDescription' => $articleDescription,
                        'metaKeywords' => $metaKeywords,
                        'canonicalUrl' => $canonicalUrl,
                        'ogImage' => $ogImage,
                        'ogType' => 'article',
                        'articleOpenGraphMeta' => $articleOpenGraphMeta,
                        'articleStructuredData' => $articleStructuredData,
                        'breadcrumbStructuredData' => $breadcrumbStructuredData,
                        'robots' => 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
                    ]);
                }
            } else {
                // Listing page /artikel
                $hasFilter = $request->hasAny(['tag', 'search', 'page']);
                $tag = $request->get('tag', '');
                $search = $request->get('search', '');

                $breadcrumbStructuredData = [
                    '@context' => 'https://schema.org',
                    '@type' => 'BreadcrumbList',
                    'itemListElement' => [
                        [
                            '@type' => 'ListItem',
                            'position' => 1,
                            'name' => 'Beranda',
                            'item' => 'https://indoquran.web.id'
                        ],
                        [
                            '@type' => 'ListItem',
                            'position' => 2,
                            'name' => 'Artikel',
                            'item' => 'https://indoquran.web.id/artikel'
                        ]
                    ]
                ];

                if ($tag) {
                    $seoData = array_merge($seoData, [
                        'metaTitle' => "Artikel Tag #{$tag} - IndoQuran",
                        'metaDescription' => "Kumpulan artikel islami dan kajian Al-Quran dengan topik #{$tag} di IndoQuran.",
                        'metaKeywords' => "artikel {$tag}, kajian {$tag}, artikel islam, indoquran",
                        'canonicalUrl' => 'https://indoquran.web.id/artikel',
                        'breadcrumbStructuredData' => $breadcrumbStructuredData,
                        'robots' => 'noindex, follow'
                    ]);
                } elseif ($search) {
                    $seoData = array_merge($seoData, [
                        'metaTitle' => "Hasil Pencarian Artikel \"{$search}\" - IndoQuran",
                        'metaDescription' => "Kumpulan artikel islami yang sesuai dengan pencarian \"{$search}\" di IndoQuran.",
                        'metaKeywords' => "cari artikel, {$search}, artikel islam, indoquran",
                        'canonicalUrl' => 'https://indoquran.web.id/artikel',
                        'breadcrumbStructuredData' => $breadcrumbStructuredData,
                        'robots' => 'noindex, follow'
                    ]);
                } elseif ($hasFilter) {
                    $seoData = array_merge($seoData, [
                        'metaTitle' => 'Artikel Islami & Kajian Al-Quran | IndoQuran',
                        'metaDescription' => 'Kumpulan artikel islami, kajian Al-Quran, tafsir, dan pengetahuan agama Islam untuk memperdalam keimanan Anda.',
                        'metaKeywords' => 'artikel islam, artikel islami, kajian quran, pengetahuan agama, tafsir, bacaan islam, indoquran',
                        'canonicalUrl' => 'https://indoquran.web.id/artikel',
                        'breadcrumbStructuredData' => $breadcrumbStructuredData,
                        'robots' => 'noindex, follow'
                    ]);
                } else {
                    $seoData = array_merge($seoData, [
                        'metaTitle' => 'Artikel Islami - Kajian Al-Quran & Pengetahuan Islam | IndoQuran',
                        'metaDescription' => 'Kumpulan artikel islami, kajian Al-Quran, tafsir, dan pengetahuan agama Islam untuk memperdalam keimanan Anda. Baca dan pelajari artikel religi terpercaya.',
                        'metaKeywords' => 'artikel islam, artikel islami, kajian quran, pengetahuan agama, tafsir, bacaan islam, indoquran',
                        'canonicalUrl' => 'https://indoquran.web.id/artikel',
                        'breadcrumbStructuredData' => $breadcrumbStructuredData,
                        'robots' => 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
                    ]);
                }
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'admin') {
            // Admin panel SEO (minimal for security)
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Admin Panel - IndoQuran',
                'metaDescription' => 'Panel administrasi IndoQuran untuk pengelolaan sistem.',
                'metaKeywords' => 'admin, panel administrasi, indoquran',
                'canonicalUrl' => url('/admin'),
                'robots' => 'noindex, nofollow',
                'ogType' => 'website'
            ]);
        }

        // If invalid route detected, set proper 404 SEO and status code
        if ($isInvalidRoute) {
            $seoData = [
                'metaTitle' => '404 - Halaman Tidak Ditemukan | IndoQuran',
                'metaDescription' => 'Maaf, halaman yang Anda cari tidak ditemukan. Kembali ke beranda IndoQuran untuk mengakses Al-Quran Digital Indonesia.',
                'metaKeywords' => '404, halaman tidak ditemukan, error, indoquran',
                'canonicalUrl' => url($request->getRequestUri()),
                'robots' => 'noindex, nofollow',
                'ogImage' => url('/android-chrome-512x512.png'),
                'ogType' => 'website'
            ];
            
            return response()->view('react', $seoData, 404);
        }

        // Prepare data for Server-Side Rendering (SSR) to solve "Crawled - currently not indexed"
        $reactData = [];

        // Fetch data based on route
        if ($path === '/' || $path === '' || $path === 'daftar-lengkap' || $path === 'surah') {
            // Homepage, Daftar Lengkap, & Surah Index: Fetch all surahs for SEO list
            $allSurahsList = self::rememberSafe('seo_surah_list_v2', 86400, function () {
                return Surah::query()->orderBy('number', 'asc')
                    ->select('number', 'name_latin', 'name_indonesian', 'name_arabic', 'total_ayahs', 'revelation_place')
                    ->get();
            });

            if ($path === 'surah') {
                $reactData['surahIndex'] = $allSurahsList;
            } elseif ($path === 'daftar-lengkap') {
                $reactData['daftarLengkap'] = [
                    'surahs' => $allSurahsList,
                    'juzList' => SEOService::getJuzMetadata(),
                ];
            } else {
                $reactData['surahs'] = $allSurahsList;
            }
        } 
        elseif (isset($segments[0]) && $segments[0] === 'surah' && isset($segments[1]) && is_numeric($segments[1])) {
            // Surah Detail: Fetch specific surah info
            $surahNumber = (int) $segments[1];
            $reactData['currentSurah'] = $surah ?? $this->getCachedSurah($surahNumber);

            if ($reactData['currentSurah']) {
                $reactData['surahLocation'] = $locationMeta ?? SEOService::getSurahLocationMetadata($surahNumber);
                $isAyahPage = isset($segments[2]) && is_numeric($segments[2]);

                if (!$isAyahPage) {
                    // Pre-render preview of surah ayahs only for main surah page so Googlebot gets full text
                    $reactData['surahAyahs'] = self::rememberSafe("seo_surah_ayahs_{$surahNumber}", 86400, function () use ($surahNumber) {
                        return Ayah::query()
                            ->select('surah_number', 'ayah_number', 'text_arabic', 'text_latin', 'text_indonesian')
                            ->where('surah_number', $surahNumber)
                            ->orderBy('ayah_number')
                            ->limit(30)
                            ->get();
                    });
                } else {
                    $ayahNumber = (int) $segments[2];
                    $reactData['currentAyah'] = $ayah ?? $this->getCachedAyah($surahNumber, $ayahNumber);

                    if ($reactData['currentAyah']) {
                        $reactData['ayahNavigation'] = [
                            'prev' => $ayahNumber > 1 ? $ayahNumber - 1 : null,
                            'next' => $ayahNumber < (int) $reactData['currentSurah']->total_ayahs ? $ayahNumber + 1 : null,
                        ];
                    }
                }
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'juz') {
            if (isset($segments[1]) && is_numeric($segments[1])) {
                $juzNumber = (int) $segments[1];
                $juzMeta = SEOService::getJuzMetadata($juzNumber);
                $juzAyahs = self::rememberSafe("seo_juz_ayahs_{$juzNumber}", 86400, function () use ($juzNumber) {
                    return Ayah::query()
                        ->select('surah_number', 'ayah_number', 'text_arabic', 'text_latin', 'text_indonesian', 'juz', 'page')
                        ->with('surah:number,name_latin,name_indonesian,name_arabic')
                        ->where('juz', $juzNumber)
                        ->orderBy('surah_number')
                        ->orderBy('ayah_number')
                        ->limit(20)
                        ->get();
                });

                $surahNames = $juzMeta['surah_names'] ?? "Juz {$juzNumber}";
                $surahsSummary = $juzMeta['surahs_summary'] ?? '';
                $minPage = $juzMeta['min_page'] ?? 1;
                $maxPage = $juzMeta['max_page'] ?? 20;
                $totalPages = $juzMeta['total_pages'] ?? 20;
                $totalAyahs = $juzMeta['total_ayahs'] ?? 0;

                $reactData['currentJuz'] = [
                    'number' => $juzNumber,
                    'title' => "Juz {$juzNumber} Al-Quran - {$surahNames}",
                    'description' => "Juz {$juzNumber} memuat {$surahsSummary}. Terdiri dari {$totalPages} halaman (halaman {$minPage} sampai {$maxPage}) dengan total {$totalAyahs} ayat.",
                    'metadata' => $juzMeta,
                    'ayahs' => $juzAyahs,
                    'has_ssr_content' => true,
                ];
            } else {
                $reactData['juzList'] = SEOService::getJuzMetadata();
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'halaman') {
            if (isset($segments[1]) && is_numeric($segments[1])) {
                $pageNumber = (int) $segments[1];
                // Fetch ALL ayahs for this page (no arbitrary limit) to ensure 100% complete content for Googlebot
                $pageAyahs = self::rememberSafe("seo_page_ayahs_{$pageNumber}", 86400, function () use ($pageNumber) {
                    return Ayah::query()
                        ->select('surah_number', 'ayah_number', 'text_arabic', 'text_latin', 'text_indonesian', 'juz', 'page')
                        ->with('surah:number,name_latin,name_indonesian,name_arabic')
                        ->where('page', $pageNumber)
                        ->orderBy('surah_number')
                        ->orderBy('ayah_number')
                        ->get();
                });

                $surahSpans = $pageAyahs
                    ->groupBy('surah_number')
                    ->map(function ($ayahsBySurah) {
                        $firstAyah = $ayahsBySurah->first();
                        $lastAyah = $ayahsBySurah->last();
                        $surah = $firstAyah?->surah;

                        if (!$surah) {
                            return null;
                        }

                        return [
                            'surah_number' => (int) $surah->number,
                            'surah_name_latin' => $surah->name_latin,
                            'surah_name_arabic' => $surah->name_arabic,
                            'from_ayah' => (int) $firstAyah->ayah_number,
                            'to_ayah' => (int) $lastAyah->ayah_number,
                        ];
                    })
                    ->filter()
                    ->values();

                $surahNames = $pageAyahs->pluck('surah.name_latin')->filter()->unique()->values();
                $surahLabel = $surahNames->isNotEmpty() ? 'Surah ' . $surahNames->implode(', ') : '';

                $surahSpanTexts = $pageAyahs->groupBy('surah_number')->map(function ($grp) {
                    $first = $grp->first();
                    $last = $grp->last();
                    $name = $first?->surah?->name_latin;
                    if (!$name) return null;
                    return "{$name} ayat {$first->ayah_number}-{$last->ayah_number}";
                })->filter()->values();
                $surahSpanSummary = $surahSpanTexts->isNotEmpty() ? $surahSpanTexts->implode(', ') : '';
                $juzNum = $pageAyahs->first()?->juz ?? 1;

                $reactData['currentPage'] = [
                    'number' => $pageNumber,
                    'arabic_number' => SEOService::toArabicNumerals($pageNumber),
                    'lembar' => (int) ceil($pageNumber / 2),
                    'juz_number' => $juzNum,
                    'title' => "Al Quran Halaman {$pageNumber}" . ($surahLabel ? " ({$surahLabel})" : "") . " - Juz {$juzNum}",
                    'description' => "Baca Al-Quran Halaman {$pageNumber} (Muka Surat {$pageNumber}) Juz {$juzNum}" . ($surahSpanSummary ? " memuat {$surahSpanSummary}" : "") . " dengan teks Arab jelas, terjemahan bahasa Indonesia, dan audio murottal per ayat.",
                    'ayah_previews' => $pageAyahs,
                    'surah_spans' => $surahSpans,
                    'has_ssr_content' => $pageAyahs->isNotEmpty(),
                ];
            } else {
                $reactData['halamanList'] = [
                    'total_pages' => 604,
                    'total_juz' => 30,
                    'total_surahs' => 114,
                    'juz_metadata' => SEOService::getJuzMetadata(),
                ];
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'artikel') {
            if (isset($segments[1])) {
                $slug = (string) $segments[1];
                $article = $cachedArticle ?? $this->getCachedArticle($slug);
                if ($article) {
                    $reactData['currentArticle'] = $article;
                    $reactData['relatedArticles'] = $this->getCachedRelatedArticles($article->id);
                }
            } else {
                $reactData['articles'] = self::rememberSafe('seo_articles_list_home', 600, function () {
                    return Article::query()
                        ->with(['author:id,name', 'tags'])
                        ->published()
                        ->latest('published_at')
                        ->limit(14)
                        ->get();
                });
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'tafsir-maudhui') {
            if (isset($segments[1])) {
                $slug = trim((string) $segments[1]);
                $reactData['currentTafsirTopic'] = $cachedTafsirTopic ?? $this->getCachedTafsirTopic($slug);
                $reactData['currentTafsirVerses'] = $tafsirVerses ?? [];
            } else {
                $reactData['tafsirTopics'] = self::rememberSafe('seo_tafsir_topics_list', 3600, function () {
                    return TafsirMaudhuiTopic::query()
                        ->active()
                        ->ordered()
                        ->withCount('verses')
                        ->select('id', 'topic', 'slug', 'description')
                        ->get();
                });
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'asmaul-husna') {
            $reactData['asmaulHusna'] = self::rememberSafe('seo_asmaul_husna_list', 86400, function () {
                return \App\Models\AsmaulHusnaName::query()
                    ->active()
                    ->ordered()
                    ->select('original_id', 'arabic', 'latin', 'meaning', 'description')
                    ->get();
            });
        }
        elseif (isset($segments[0]) && $segments[0] === 'hadits') {
            $catalog = \App\Http\Controllers\HaditsController::getKitabCatalog();
            $popularTopics = [
                ['slug' => 'takdir', 'name' => 'Takdir'],
                ['slug' => 'shalat', 'name' => 'Shalat'],
                ['slug' => 'jenazah', 'name' => 'Jenazah'],
                ['slug' => 'iddah', 'name' => 'Iddah'],
                ['slug' => 'matahari', 'name' => 'Matahari'],
                ['slug' => 'wudhu', 'name' => 'Wudhu'],
                ['slug' => 'puasa', 'name' => 'Puasa'],
                ['slug' => 'zakat', 'name' => 'Zakat & Sedekah'],
                ['slug' => 'sabar', 'name' => 'Sabar'],
                ['slug' => 'taubat', 'name' => 'Taubat'],
                ['slug' => 'ilmu', 'name' => 'Menuntut Ilmu'],
                ['slug' => 'nikah', 'name' => 'Pernikahan'],
                ['slug' => 'rezeki', 'name' => 'Rezeki'],
                ['slug' => 'doa', 'name' => 'Doa & Dzikir'],
                ['slug' => 'khamr', 'name' => 'Khamr & Minuman Keras'],
                ['slug' => 'riba', 'name' => 'Riba'],
                ['slug' => 'syukur', 'name' => 'Syukur'],
                ['slug' => 'toleransi', 'name' => 'Toleransi'],
            ];

            if (count($segments) === 1 && empty($request->get('q'))) {
                $haditsCache = app(\App\Services\HaditsCacheService::class);
                $reactData['haditsHub'] = [
                    'kitabs' => array_values($catalog),
                    'topics' => $popularTopics,
                    'featured' => $haditsCache->getFeaturedHadits(),
                ];
            } elseif (count($segments) === 3 && $segments[1] === 'tentang') {
                $topicSlug = $segments[2];
                $topicName = ucwords(str_replace(['-', '_'], ' ', $topicSlug));
                $synonyms = SEOService::getHaditsTopicSynonyms($topicSlug);

                $topicHadiths = self::rememberSafe("seo_hadits_topic_v2_{$topicSlug}", 86400, function () use ($synonyms) {
                    $results = [];
                    $applySynonyms = function ($q) use ($synonyms) {
                        foreach ($synonyms as $term) {
                            $q->orWhere('indonesia', 'like', "%{$term}%")
                              ->orWhere('kategori', 'like', "%{$term}%");
                        }
                    };

                    // Search in Bukhari first
                    if (\Illuminate\Support\Facades\Schema::hasTable('hadits_shahih_al_bukhari')) {
                        $bukhariRows = \Illuminate\Support\Facades\DB::table('hadits_shahih_al_bukhari')
                            ->where($applySynonyms)
                            ->select('no', 'kitab', 'kategori', 'arab', 'indonesia')
                            ->limit(8)
                            ->get();

                        foreach ($bukhariRows as $row) {
                            $results[] = [
                                'no' => $row->no,
                                'kitab_slug' => 'shahih_bukhari',
                                'kitab_name' => 'Shahih Bukhari',
                                'kategori' => $row->kategori,
                                'arab' => $row->arab,
                                'indonesia' => $row->indonesia
                            ];
                        }
                    }

                    // Search in Muslim second
                    if (\Illuminate\Support\Facades\Schema::hasTable('hadits_shahih_muslim')) {
                        $muslimRows = \Illuminate\Support\Facades\DB::table('hadits_shahih_muslim')
                            ->where($applySynonyms)
                            ->select('no', 'kitab', 'kategori', 'arab', 'indonesia')
                            ->limit(7)
                            ->get();

                        foreach ($muslimRows as $row) {
                            $results[] = [
                                'no' => $row->no,
                                'kitab_slug' => 'shahih_muslim',
                                'kitab_name' => 'Shahih Muslim',
                                'kategori' => $row->kategori,
                                'arab' => $row->arab,
                                'indonesia' => $row->indonesia
                            ];
                        }
                    }

                    return $results;
                });

                $seoData['customStructuredData'] = SEOService::generateHaditsTopicStructuredData($topicSlug, $topicName, $topicHadiths);

                $reactData['haditsTopic'] = [
                    'topic' => $topicName,
                    'slug' => $topicSlug,
                    'hadiths' => $topicHadiths
                ];
            } elseif (count($segments) === 2 && isset($catalog[$segments[1]])) {
                $kitab = $catalog[$segments[1]];
                $haditsCache = app(\App\Services\HaditsCacheService::class);
                $kitabData = $haditsCache->getKitabHadits($segments[1], 1, 15);

                $reactData['haditsKitab'] = [
                    'kitab' => $kitab,
                    'hadiths' => $kitabData['data'] ?? []
                ];
            } elseif (count($segments) === 3 && isset($catalog[$segments[1]])) {
                if (isset($cachedHaditsDetail)) {
                    $reactData['haditsDetail'] = $cachedHaditsDetail;
                } else {
                    $kitab = $catalog[$segments[1]];
                    $nomor = (int) $segments[2];
                    $haditsCache = app(\App\Services\HaditsCacheService::class);
                    $detail = $haditsCache->getHaditsDetail($segments[1], $nomor);

                    if ($detail && isset($detail['hadits'])) {
                        $reactData['haditsDetail'] = [
                            'kitab' => $kitab,
                            'hadits' => $detail['hadits'],
                            'navigation' => $detail['navigation'] ?? []
                        ];
                    }
                }
            }
        }

        return view('react', array_merge($seoData, ['reactData' => $reactData]));
    }
}
