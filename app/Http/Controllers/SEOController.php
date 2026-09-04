<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Ayah;
use App\Models\Prayer;
use App\Models\Surah;
use App\Models\TafsirMaudhuiTopic;
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
                'privacy' => 'kebijakan'
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
        $allowedQueryParams = ['q', 'page', 'sort', 'reciter', 'tag', 'tab', 'doa', 'category', 'search']; // Only these params are relevant for content
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

            // Article route validation
            if ($segments[0] === 'artikel') {
                if (count($segments) > 2) {
                    $isInvalidRoute = true;
                } elseif (count($segments) === 2) {
                    $slug = trim((string) $segments[1]);
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
                'tafsir-maudhui', 'asmaul-husna', 'doa-bersama',
                // Static / info pages
                'tentang', 'kontak', 'donasi', 'kebijakan',
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
                'pages', 'search', 'about', 'contact', 'privacy',
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
            // Homepage SEO - OPTIMIZED for CTR (Based on Google Search Console data Oct 2025)
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Al-Quran Online Indonesia - Baca, Dengar & Terjemahan Gratis | IndoQuran',
                'metaDescription' => '✅ Al-Quran Digital GRATIS ✅ Teks Arab & Terjemahan ✅ Audio Murottal HD ✅ Tafsir Lengkap ✅ Bookmark Ayat. Platform Al-Quran online terpercaya untuk belajar Islam. 114 Surah lengkap dengan fitur pencarian ayat.',
                'metaKeywords' => 'al quran online, alquran online, quran online, al quran indonesia, al quran digital, baca quran online, terjemahan quran indonesia, murottal quran, quran indonesia, ayat al quran, surah quran, indoquran, indo quran, quran web, quran digital gratis, quran digital terlengkap',
                'canonicalUrl' => url('/')
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
                        // Surah page SEO - OPTIMIZED using Surah model methods
                        $seoData = array_merge($seoData, [
                            'metaTitle' => $surah->getSeoTitle(),
                            'metaDescription' => $surah->getSeoDescription(),
                            'metaKeywords' => $surah->getSeoKeywords(),
                            'canonicalUrl' => url("/surah/{$surahNumber}"),
                            'breadcrumbStructuredData' => $breadcrumbStructuredData,
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
                $seoData = array_merge($seoData, [
                    'metaTitle' => "Juz {$juzNumber} Arab Saja - Teks Arab Al-Quran Lengkap | IndoQuran",
                    'metaDescription' => "Baca Juz {$juzNumber} Arab saja dengan teks Arab Al-Quran lengkap. Para {$juzNumber} tersedia dengan navigasi per ayat, audio murottal, dan tampilan nyaman untuk tilawah harian.",
                    'metaKeywords' => "juz {$juzNumber}, juz {$juzNumber} arab saja, para {$juzNumber}, al quran juz {$juzNumber}, teks arab juz {$juzNumber}, quran digital, al quran indonesia",
                    'canonicalUrl' => url("/juz/{$juzNumber}"),
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
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Tafsir Maudhui - Topik-topik dalam Al-Quran | IndoQuran',
                'metaDescription' => 'Jelajahi topik-topik penting dalam Al-Quran melalui pendekatan tafsir maudhui. Temukan ayat-ayat Al-Quran berdasarkan tema seperti akidah, ibadah, akhlak, muamalah, dan banyak lagi.',
                'metaKeywords' => 'tafsir maudhui, topik quran, tema al quran, tafsir tematik, akidah islam, ibadah islam, akhlak islam, muamalah islam, indoquran',
                'canonicalUrl' => url('/tafsir-maudhui'),
                'ogType' => 'article'
            ]);
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

        return view('react', array_merge($seoData, ['reactData' => $reactData]));
    }
}
