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
use Illuminate\Support\Str;
use Illuminate\View\View;

class SEOController extends Controller
{
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
        if (preg_match('/^(?:al-?quran|alquran)-halaman-(\d+)$/i', $path, $matches)) {
            $pageNumber = (int) $matches[1];
            if ($pageNumber >= 1 && $pageNumber <= 604) {
                return redirect(url('/halaman/' . $pageNumber), 301);
            }
        }

        if (preg_match('/^juz-(\d+)-arab-saja$/i', $path, $matches)) {
            $juzNumber = (int) $matches[1];
            if ($juzNumber >= 1 && $juzNumber <= 30) {
                return redirect(url('/juz/' . $juzNumber), 301);
            }
        }

        // Redirect legacy query-based ayah URL to canonical route in a single hop.
        // Example: /ayat.php?surat=23&ayat=102 -> /surah/23/102
        if (strcasecmp($path, 'ayat.php') === 0) {
            $surahNumber = (int) $request->query('surat', 0);
            $ayahNumber = (int) $request->query('ayat', 0);

            if ($surahNumber >= 1 && $surahNumber <= 114 && $ayahNumber >= 1) {
                $surah = Surah::query()->select('number', 'total_ayahs')->where('number', $surahNumber)->first();

                if ($surah && $ayahNumber <= (int) ($surah->total_ayahs ?? 0)) {
                    return redirect(url('/surah/' . $surahNumber . '/' . $ayahNumber), 301);
                }
            }

            // Invalid legacy URL parameters should not be indexed.
            return response('Gone', 410);
        }

        // Redirect legacy ayah URLs to canonical route to consolidate indexing signals.
        // Example: /quran/viewAyat/279 -> /surah/{surah}/{ayah}
        if (preg_match('/^quran\/viewAyat\/(\d+)$/i', $path, $matches)) {
            $legacyAyahId = (int) $matches[1];
            $legacyAyah = Ayah::query()
                ->select('surah_number', 'ayah_number')
                ->find($legacyAyahId);

            if ($legacyAyah && $legacyAyah->surah_number && $legacyAyah->ayah_number) {
                return redirect(url('/surah/' . $legacyAyah->surah_number . '/' . $legacyAyah->ayah_number), 301);
            }

            // URL existed in old version but cannot be mapped anymore.
            return response('Gone', 410);
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
        
        // Remove unwanted query parameters for canonical URL consistency
        $allowedQueryParams = ['q', 'page', 'sort', 'reciter', 'tag', 'tab', 'doa', 'category', 'search', 'kitab']; // Only these params are relevant for content
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
        if (isset($segments[0]) && $segments[0] === 'surah' && isset($segments[1]) && is_numeric($segments[1])) {
            $surahNumber = (int) $segments[1];
            if ($surahNumber < 1 || $surahNumber > 114) {
                $isInvalidRoute = true;
            } else {
                // Verify surah exists in database
                $surah = Surah::query()->where('number', $surahNumber)->first();
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
                        } else {
                            $ayahExists = Ayah::query()
                                ->where('surah_number', $surahNumber)
                                ->where('ayah_number', $ayahNumber)
                                ->exists();

                            if (!$ayahExists) {
                                $isInvalidRoute = true;
                            }
                        }
                    }
                }
            }
        }
        
        // Check invalid juz numbers
        if (isset($segments[0]) && $segments[0] === 'juz' && isset($segments[1]) && is_numeric($segments[1])) {
            $juzNumber = (int) $segments[1];
            if ($juzNumber < 1 || $juzNumber > 30) {
                $isInvalidRoute = true;
            }
        }
        
        // Check invalid page numbers
        if (isset($segments[0]) && $segments[0] === 'halaman' && isset($segments[1]) && is_numeric($segments[1])) {
            $pageNumber = (int) $segments[1];
            if ($pageNumber < 1 || $pageNumber > 604) {
                $isInvalidRoute = true;
            }
        }

        // Check invalid tafsir-maudhui slugs
        if (isset($segments[0]) && $segments[0] === 'tafsir-maudhui' && isset($segments[1])) {
            $slug = trim((string) $segments[1]);

            if ($slug === '' || !preg_match('/^[a-z0-9\-]+$/', $slug)) {
                $isInvalidRoute = true;
            } else {
                $topicExists = TafsirMaudhuiTopic::query()
                    ->where('slug', $slug)
                    ->where('is_active', true)
                    ->exists();

                if (!$topicExists) {
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
                    $kitabSlug = $segments[1];
                    $catalog = \App\Http\Controllers\HaditsController::getKitabCatalog();
                    $resolved = \App\Http\Controllers\HaditsController::resolveKitabSlug($kitabSlug);

                    if (!$resolved || !isset($catalog[$resolved])) {
                        $isInvalidRoute = true;
                    } else {
                        // If alias used (e.g. /hadits/bukhari or /hadits/shahih-bukhari), redirect 301 to canonical
                        if ($kitabSlug !== $resolved) {
                            $targetUrl = '/hadits/' . $resolved;
                            if (isset($segments[2])) {
                                $targetUrl .= '/' . (int) $segments[2];
                            }
                            return redirect(url($targetUrl), 301);
                        }

                        if (count($segments) === 3) {
                            $nomor = (int) $segments[2];
                            $maxNomor = $catalog[$resolved]['total'] ?? 0;
                            if ($nomor < 1 || ($maxNomor > 0 && $nomor > $maxNomor)) {
                                $isInvalidRoute = true;
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
                        $articleExists = Article::query()
                            ->where('slug', $slug)
                            ->published()
                            ->exists();
                        if (!$articleExists) {
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
                'metaKeywords' => 'al quran online, alquran online, quran online, al quran indonesia, al quran digital, baca quran online, terjemahan quran indonesia, murottal quran, quran indonesia, ayat al quran, surah quran, hadits shahih, juz amma, tafsir quran, indoquran, quran digital 30 juz',
                'canonicalUrl' => url('/'),
                'siteNavigationStructuredData' => $siteNavigationStructuredData,
                'customStructuredData' => SEOService::generateHomeFaqStructuredData()
            ]);
        } 
        elseif (isset($segments[0]) && $segments[0] === 'surah') {
            // Surah page SEO
            if (isset($segments[1]) && is_numeric($segments[1])) {
                $surahNumber = (int) $segments[1];
                $surah = Surah::query()->where('number', $surahNumber)->first();
                
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
                        // Specific ayah SEO - Point canonical to parent surah to consolidate ranking signals and avoid thin-content indexing rejection
                        $seoData = array_merge($seoData, [
                            'metaTitle' => "Surah {$surah->name_latin} Ayat {$ayahNumber} - Terjemahan Indonesia - IndoQuran",
                            'metaDescription' => "Baca Surah {$surah->name_latin} ayat {$ayahNumber} lengkap dengan terjemahan bahasa Indonesia, audio murottal, dan tafsir. Pelajari makna dan kandungan ayat dalam Al-Quran.",
                            'metaKeywords' => "Surah {$surah->name_latin} ayat {$ayahNumber}, {$surah->name_arabic}, terjemahan ayat {$ayahNumber}, murottal ayat, quran ayat, al quran indonesia",
                            'canonicalUrl' => url("/surah/{$surahNumber}"),
                            'breadcrumbStructuredData' => $breadcrumbStructuredData,
                            'ogType' => 'article'
                        ]);
                    } else {
                        // Surah page SEO - OPTIMIZED using Surah model methods and rich schemas
                        $surahFaq = SEOService::generateSurahFaqStructuredData($surah);
                        $surahSchemas = SEOService::generateSurahStructuredData($surah);
                        $customStructuredData = array_merge($surahSchemas, [$surahFaq]);

                        $seoData = array_merge($seoData, [
                            'metaTitle' => $surah->getSeoTitle(),
                            'metaDescription' => $surah->getSeoDescription(),
                            'metaKeywords' => $surah->getSeoKeywords(),
                            'canonicalUrl' => url("/surah/{$surahNumber}"),
                            'breadcrumbStructuredData' => $breadcrumbStructuredData,
                            'customStructuredData' => $customStructuredData,
                            'ogType' => 'article'
                        ]);
                    }
                }
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
                if ($juzNumber === 30) {
                    $seoData = array_merge($seoData, [
                        'metaTitle' => 'Juz 30 (Juz Amma) Lengkap Teks Arab, Latin & Terjemahan | IndoQuran',
                        'metaDescription' => 'Baca Al-Quran Juz 30 (Juz Amma) lengkap dari Surah An-Naba sampai An-Nas. Teks Arab berharakat jelas, transliterasi latin, terjemahan Indonesia, dan audio murottal merdu di IndoQuran.',
                        'metaKeywords' => 'juz 30, juz amma, juz amma lengkap, baca juz 30, al quran juz 30, juz amma arab latin terjemahan, surat juz amma, juz 30 online, murottal juz amma, indoquran',
                        'canonicalUrl' => url('/juz/30'),
                        'breadcrumbStructuredData' => $breadcrumbStructuredData,
                        'ogType' => 'article'
                    ]);
                } else {
                    $seoData = array_merge($seoData, [
                        'metaTitle' => "Juz {$juzNumber} Arab Saja - Teks Arab Al-Quran Lengkap | IndoQuran",
                        'metaDescription' => "Baca Juz {$juzNumber} Arab saja dengan teks Arab Al-Quran lengkap. Para {$juzNumber} tersedia dengan navigasi per ayat, audio murottal, dan tampilan nyaman untuk tilawah harian.",
                        'metaKeywords' => "juz {$juzNumber}, juz {$juzNumber} arab saja, para {$juzNumber}, al quran juz {$juzNumber}, teks arab juz {$juzNumber}, quran digital, al quran indonesia",
                        'canonicalUrl' => url("/juz/{$juzNumber}"),
                        'breadcrumbStructuredData' => $breadcrumbStructuredData,
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
                    'metaTitle' => 'Daftar Juz Al-Quran - Teks Arab - IndoQuran',
                    'metaDescription' => 'Akses semua Juz (Para) Al-Quran dengan teks Arab lengkap. 30 Juz Al-Quran tersedia untuk dibaca dan dipelajari. Platform Al-Quran digital terlengkap di Indonesia.',
                    'metaKeywords' => 'juz al quran, para al quran, daftar juz, teks arab al quran, al quran digital, quran indonesia, juz lengkap',
                    'canonicalUrl' => url('/juz'),
                    'breadcrumbStructuredData' => $breadcrumbStructuredData
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
                $topic = TafsirMaudhuiTopic::query()
                    ->where('slug', $slug)
                    ->where('is_active', true)
                    ->first();

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
                                'item' => url("/tafsir-maudhui/{$topic->slug}")
                            ]
                        ]
                    ];

                    $seoData = array_merge($seoData, [
                        'metaTitle' => "Tafsir Maudhui: {$topic->topic} - Ayat & Penjelasan Al-Quran | IndoQuran",
                        'metaDescription' => $descSnippet ?: "Kumpulan ayat Al-Quran dan penjelasan tematik mengenai {$topic->topic} dalam Tafsir Maudhui IndoQuran.",
                        'metaKeywords' => "tafsir maudhui {$topic->topic}, ayat tentang {$topic->topic}, dalil {$topic->topic}, al quran {$topic->topic}, indoquran",
                        'canonicalUrl' => url("/tafsir-maudhui/{$topic->slug}"),
                        'breadcrumbStructuredData' => $breadcrumbStructuredData,
                        'ogType' => 'article'
                    ]);
                } else {
                    $seoData = array_merge($seoData, [
                        'metaTitle' => 'Tafsir Maudhui - Topik-topik dalam Al-Quran | IndoQuran',
                        'metaDescription' => 'Jelajahi topik-topik penting dalam Al-Quran melalui pendekatan tafsir maudhui. Temukan ayat-ayat Al-Quran berdasarkan tema seperti akidah, ibadah, akhlak, muamalah, dan banyak lagi.',
                        'metaKeywords' => 'tafsir maudhui, topik quran, tema al quran, tafsir tematik, akidah islam, ibadah islam, akhlak islam, muamalah islam, indoquran',
                        'canonicalUrl' => url('/tafsir-maudhui'),
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
                            'name' => 'Tafsir Maudhui',
                            'item' => 'https://indoquran.web.id/tafsir-maudhui'
                        ]
                    ]
                ];

                $seoData = array_merge($seoData, [
                    'metaTitle' => 'Tafsir Maudhui - Topik-topik dalam Al-Quran | IndoQuran',
                    'metaDescription' => 'Jelajahi topik-topik penting dalam Al-Quran melalui pendekatan tafsir maudhui. Temukan ayat-ayat Al-Quran berdasarkan tema seperti akidah, ibadah, akhlak, muamalah, dan banyak lagi.',
                    'metaKeywords' => 'tafsir maudhui, topik quran, tema al quran, tafsir tematik, akidah islam, ibadah islam, akhlak islam, muamalah islam, indoquran',
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
                    $seoData = array_merge($seoData, [
                        'metaTitle' => "Koleksi Doa-Doa Pilihan Al-Qur'an & Sunnah Lengkap | IndoQuran",
                        'metaDescription' => "Koleksi lengkap doa-doa pilihan otentik dari Al-Qur'an dan As-Sunnah lengkap dengan teks Arab berharakat, transliterasi Latin, dan terjemahan Indonesia.",
                        'metaKeywords' => 'doa bersama, doa pilihan, doa al quran, doa hadits, doa islam, indoquran doa',
                        'canonicalUrl' => url('/doa-bersama')
                    ]);
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
                    $seoData = array_merge($seoData, [
                        'metaTitle' => 'Doa Bersama - Komunitas Doa Muslim - IndoQuran',
                        'metaDescription' => 'Bergabunglah dengan komunitas doa Muslim di IndoQuran. Buat dan bagikan doa, beri dukungan kepada sesama Muslim, serta temukan kekuatan dalam doa bersama.',
                        'metaKeywords' => 'doa bersama, komunitas doa, doa muslim, doa islam, permintaan doa, dukungan doa, indoquran doa',
                        'canonicalUrl' => url('/doa-bersama')
                    ]);
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
            // Asmaul Husna page SEO - NEW (Based on search queries)
            $seoData = array_merge($seoData, [
                'metaTitle' => '99 Asmaul Husna - Nama-nama Indah Allah SWT Lengkap | IndoQuran',
                'metaDescription' => '📿 99 Asmaul Husna Lengkap ✅ Teks Arab & Latin ✅ Arti Indonesia ✅ Audio MP3 ✅ Penjelasan Makna. Pelajari nama-nama indah Allah SWT dengan dzikir dan doa. Baca online GRATIS!',
                'metaKeywords' => '99 asmaul husna, asmaul husna lengkap, nama allah swt, asmaul husna arab latin, asmaul husna dan artinya, dzikir asmaul husna, audio asmaul husna, nama indah allah, asma allah husna',
                'canonicalUrl' => url('/asmaul-husna')
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
                            'name' => 'Hadits tentang ' . $topicName,
                            'item' => 'https://indoquran.web.id/hadits/tentang/' . $topicSlug
                        ]
                    ]
                ];

                $seoData = array_merge($seoData, [
                    'metaTitle' => "Hadits tentang {$topicName} - IndoQuran",
                    'metaDescription' => "Kumpulan hadits tentang {$topicSlug}. Baca teks Arab dan terjemahan hadits shahih di IndoQuran.",
                    'metaKeywords' => "hadits tentang {$topicSlug}, hadits {$topicSlug}, kumpulan hadits {$topicSlug}, hadits shahih {$topicSlug}",
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

                $seoData = array_merge($seoData, [
                    'metaTitle' => "Hadits {$kitab['name']} Online - IndoQuran",
                    'metaDescription' => $kitabDesc,
                    'metaKeywords' => "{$kitab['name']}, hadits {$kitab['name']}, {$kitab['arab']}, baca hadits online, kutubus sittah, terjemah hadits",
                    'canonicalUrl' => url('/hadits/' . $segments[1]),
                    'breadcrumbStructuredData' => $breadcrumbStructuredData,
                    'customStructuredData' => $bookStructuredData
                ]);
            } elseif (count($segments) === 3 && isset($catalog[$segments[1]])) {
                $kitab = $catalog[$segments[1]];
                $nomor = (int) $segments[2];

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

                $seoData = array_merge($seoData, [
                    'metaTitle' => "Hadits {$kitab['name']} No. {$nomor} - Teks Arab & Terjemahan | IndoQuran",
                    'metaDescription' => "Baca Hadits {$kitab['name']} Nomor {$nomor} lengkap dengan teks Arab berharakat dan terjemahan bahasa Indonesia di IndoQuran.",
                    'metaKeywords' => "hadits {$kitab['name']} {$nomor}, hadits no {$nomor}, {$kitab['name']}, teks hadits, terjemah hadits",
                    'canonicalUrl' => url('/hadits/' . $segments[1] . '/' . $nomor),
                    'breadcrumbStructuredData' => $breadcrumbStructuredData
                ]);
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

                // Fetch cached page ayahs to build rich, unique meta title and description
                $pageAyahs = \Illuminate\Support\Facades\Cache::remember("seo_page_ayahs_{$pageNumber}", 86400, function () use ($pageNumber) {
                    return Ayah::query()
                        ->select('surah_number', 'ayah_number', 'text_arabic', 'text_latin', 'text_indonesian')
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

                $metaTitle = "Al Quran Halaman {$pageNumber}" . ($surahLabel ? " ({$surahLabel})" : "") . " - Teks Arab & Terjemahan | IndoQuran";
                $metaDescription = "Baca Al-Quran Halaman {$pageNumber}" . ($surahSpanSummary ? " memuat {$surahSpanSummary}" : "") . " dengan teks Arab jelas, terjemahan bahasa Indonesia, dan audio murottal per ayat.";
                $metaKeywords = "halaman {$pageNumber}, al quran halaman {$pageNumber}, " . strtolower($surahLabel ? $surahLabel . ', ' : '') . "teks arab halaman {$pageNumber}, mushaf madinah halaman {$pageNumber}, quran digital indonesia";

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
                    'metaTitle' => 'Daftar Halaman Al-Quran - Teks Arab - IndoQuran',
                    'metaDescription' => 'Akses semua halaman Al-Quran dengan teks Arab lengkap. 604 halaman Al-Quran tersedia untuk dibaca dan dipelajari. Platform Al-Quran digital terlengkap di Indonesia.',
                    'metaKeywords' => 'halaman al quran, daftar halaman, teks arab al quran, al quran digital, quran indonesia, halaman lengkap',
                    'canonicalUrl' => url('/halaman'),
                    'breadcrumbStructuredData' => $breadcrumbStructuredData
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
                $article = Article::query()->with(['author', 'tags'])->where('slug', $slug)->published()->first();
                if ($article) {
                    $articleDescription = Str::limit(strip_tags($article->excerpt ?: $article->content), 160);
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
        if ($path === '/' || $path === '') {
            // Homepage: Fetch all surahs for SEO list
            $reactData['surahs'] = \Illuminate\Support\Facades\Cache::remember('seo_surah_list', 86400, function () {
                return Surah::query()->orderBy('number', 'asc')
                    ->select('number', 'name_latin', 'name_indonesian', 'name_arabic', 'total_ayahs')
                    ->get();
            });
        } 
        elseif (isset($segments[0]) && $segments[0] === 'surah' && isset($segments[1]) && is_numeric($segments[1])) {
            // Surah Detail: Fetch specific surah info
            $surahNumber = (int) $segments[1];
            $reactData['currentSurah'] = Surah::query()->where('number', $surahNumber)->first();

            if ($reactData['currentSurah']) {
                // Pre-render preview of surah ayahs so Googlebot gets rich, full text content immediately
                $reactData['surahAyahs'] = \Illuminate\Support\Facades\Cache::remember("seo_surah_ayahs_{$surahNumber}", 86400, function () use ($surahNumber) {
                    return Ayah::query()
                        ->select('surah_number', 'ayah_number', 'text_arabic', 'text_latin', 'text_indonesian')
                        ->where('surah_number', $surahNumber)
                        ->orderBy('ayah_number')
                        ->limit(30)
                        ->get();
                });

                if (isset($segments[2]) && is_numeric($segments[2])) {
                    $ayahNumber = (int) $segments[2];

                    $reactData['currentAyah'] = Ayah::query()
                        ->select('surah_number', 'ayah_number', 'text_arabic', 'text_latin', 'text_indonesian')
                        ->where('surah_number', $surahNumber)
                        ->where('ayah_number', $ayahNumber)
                        ->first();

                    if ($reactData['currentAyah']) {
                        $reactData['ayahNavigation'] = [
                            'prev' => $ayahNumber > 1 ? $ayahNumber - 1 : null,
                            'next' => $ayahNumber < (int) $reactData['currentSurah']->total_ayahs ? $ayahNumber + 1 : null,
                        ];
                    }
                }
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'juz' && isset($segments[1]) && is_numeric($segments[1])) {
            $juzNumber = (int) $segments[1];
            $juzAyahs = \Illuminate\Support\Facades\Cache::remember("seo_juz_ayahs_{$juzNumber}", 86400, function () use ($juzNumber) {
                return Ayah::query()
                    ->select('surah_number', 'ayah_number', 'text_arabic', 'text_latin', 'text_indonesian', 'juz')
                    ->with('surah:number,name_latin,name_indonesian,name_arabic')
                    ->where('juz', $juzNumber)
                    ->orderBy('surah_number')
                    ->orderBy('ayah_number')
                    ->limit(15)
                    ->get();
            });

            $reactData['currentJuz'] = [
                'number' => $juzNumber,
                'title' => "Juz {$juzNumber} Arab Saja - Teks Arab Al-Quran Lengkap",
                'description' => "Halaman ini berisi teks Arab Al-Quran untuk Juz {$juzNumber} dengan navigasi cepat per ayat dan dukungan audio murottal.",
                'ayahs' => $juzAyahs,
                'has_ssr_content' => $juzAyahs->isNotEmpty(),
            ];
        }
        elseif (isset($segments[0]) && $segments[0] === 'halaman' && isset($segments[1]) && is_numeric($segments[1])) {
            $pageNumber = (int) $segments[1];
            // Fetch ALL ayahs for this page (no arbitrary limit) to ensure 100% complete content for Googlebot
            $pageAyahs = \Illuminate\Support\Facades\Cache::remember("seo_page_ayahs_{$pageNumber}", 86400, function () use ($pageNumber) {
                return Ayah::query()
                    ->select('surah_number', 'ayah_number', 'text_arabic', 'text_latin', 'text_indonesian')
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

            $reactData['currentPage'] = [
                'number' => $pageNumber,
                'title' => "Al Quran Halaman {$pageNumber}" . ($surahLabel ? " ({$surahLabel})" : ""),
                'description' => "Baca Al-Quran Halaman {$pageNumber}" . ($surahSpanSummary ? " memuat {$surahSpanSummary}" : "") . " dengan teks Arab jelas, terjemahan bahasa Indonesia, dan audio murottal per ayat.",
                'ayah_previews' => $pageAyahs,
                'surah_spans' => $surahSpans,
                'has_ssr_content' => $pageAyahs->isNotEmpty(),
            ];
        }
        elseif (isset($segments[0]) && $segments[0] === 'artikel') {
            if (isset($segments[1])) {
                $slug = (string) $segments[1];
                $article = Article::query()->with(['author', 'tags'])->where('slug', $slug)->published()->first();
                if ($article) {
                    $reactData['currentArticle'] = $article;
                    $reactData['relatedArticles'] = Article::query()
                        ->with(['author', 'tags'])
                        ->published()
                        ->where('id', '!=', $article->id)
                        ->latest('published_at')
                        ->limit(3)
                        ->get();
                }
            } else {
                $reactData['articles'] = Article::query()
                    ->with(['author', 'tags'])
                    ->published()
                    ->latest('published_at')
                    ->limit(12)
                    ->get();
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'tafsir-maudhui') {
            if (isset($segments[1])) {
                $slug = trim((string) $segments[1]);
                $reactData['currentTafsirTopic'] = TafsirMaudhuiTopic::query()
                    ->with('verses')
                    ->where('slug', $slug)
                    ->where('is_active', true)
                    ->first();
            }
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

                $topicHadiths = \Illuminate\Support\Facades\Cache::remember("seo_hadits_topic_{$topicSlug}", 86400, function () use ($topicSlug) {
                    $results = [];
                    // Search in Bukhari first
                    $bukhariRows = \Illuminate\Support\Facades\DB::table('hadits_shahih_al_bukhari')
                        ->where(function ($q) use ($topicSlug) {
                            $q->where('indonesia', 'like', "%{$topicSlug}%")
                              ->orWhere('kategori', 'like', "%{$topicSlug}%");
                        })
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

                    // Search in Muslim second
                    $muslimRows = \Illuminate\Support\Facades\DB::table('hadits_shahih_muslim')
                        ->where(function ($q) use ($topicSlug) {
                            $q->where('indonesia', 'like', "%{$topicSlug}%")
                              ->orWhere('kategori', 'like', "%{$topicSlug}%");
                        })
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

                    return $results;
                });

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

        return view('react', array_merge($seoData, ['reactData' => $reactData]));
    }
}
