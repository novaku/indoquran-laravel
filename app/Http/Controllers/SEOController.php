<?php

namespace App\Http\Controllers;

use App\Models\Surah;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
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
        $allowedQueryParams = ['q', 'page', 'sort', 'reciter']; // Only these params are relevant for content
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
        
        // Default SEO values
        $seoData = [
            'metaTitle' => 'IndoQuran - Al-Quran Digital Indonesia',
            'metaDescription' => 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia, fitur bookmark, pencarian ayat, dan audio murottal berkualitas tinggi.',
            'metaKeywords' => 'al quran indonesia, quran online, al quran digital, baca quran, terjemahan quran, murottal, quran indonesia, ayat al quran, surah quran, indoquran',
            'canonicalUrl' => url($request->path() === '/' ? '/' : $request->path()),
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
                    
                    if ($ayahNumber) {
                        // Specific ayah SEO
                        $seoData = array_merge($seoData, [
                            'metaTitle' => "Surah {$surah->name_latin} Ayat {$ayahNumber} - Terjemahan Indonesia - IndoQuran",
                            'metaDescription' => "Baca Surah {$surah->name_latin} ayat {$ayahNumber} lengkap dengan terjemahan bahasa Indonesia, audio murottal, dan tafsir. Pelajari makna dan kandungan ayat dalam Al-Quran.",
                            'metaKeywords' => "Surah {$surah->name_latin} ayat {$ayahNumber}, {$surah->name_arabic}, terjemahan ayat {$ayahNumber}, murottal ayat, quran ayat, al quran indonesia",
                            'canonicalUrl' => url("/surah/{$surahNumber}/{$ayahNumber}"),
                            'ogType' => 'article'
                        ]);
                    } else {
                        // Surah page SEO - OPTIMIZED using Surah model methods
                        $seoData = array_merge($seoData, [
                            'metaTitle' => $surah->getSeoTitle(),
                            'metaDescription' => $surah->getSeoDescription(),
                            'metaKeywords' => $surah->getSeoKeywords(),
                            'canonicalUrl' => url("/surah/{$surahNumber}"),
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
                    'canonicalUrl' => url("/cari?q=" . urlencode($query))
                ]);
            } else {
                $seoData = array_merge($seoData, [
                    'metaTitle' => 'Pencarian Al-Quran - Cari Ayat & Terjemahan | IndoQuran',
                    'metaDescription' => '🔍 Cari ayat dalam Al-Quran dengan mudah dan cepat ✅ Pencarian Teks Arab ✅ Pencarian Terjemahan Indonesia ✅ Hasil Akurat. Temukan ayat yang Anda butuhkan sekarang!',
                    'metaKeywords' => 'cari ayat quran, pencarian al quran, search quran, al quran digital, cari terjemahan quran, pencarian ayat',
                    'canonicalUrl' => url('/cari')
                ]);
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'juz') {
            // Juz page SEO
            if (isset($segments[1]) && is_numeric($segments[1])) {
                $juzNumber = (int) $segments[1];
                // Specific Juz SEO
                $seoData = array_merge($seoData, [
                    'metaTitle' => "Juz {$juzNumber} Arab Saja - Teks Arab Al-Quran Lengkap | IndoQuran",
                    'metaDescription' => "Baca Juz {$juzNumber} Arab saja dengan teks Arab Al-Quran lengkap. Para {$juzNumber} tersedia dengan navigasi per ayat, audio murottal, dan tampilan nyaman untuk tilawah harian.",
                    'metaKeywords' => "juz {$juzNumber}, juz {$juzNumber} arab saja, para {$juzNumber}, al quran juz {$juzNumber}, teks arab juz {$juzNumber}, quran digital, al quran indonesia",
                    'canonicalUrl' => url("/juz/{$juzNumber}"),
                    'ogType' => 'article'
                ]);
            } else {
                // Juz list page SEO
                $seoData = array_merge($seoData, [
                    'metaTitle' => 'Daftar Juz Al-Quran - Teks Arab - IndoQuran',
                    'metaDescription' => 'Akses semua Juz (Para) Al-Quran dengan teks Arab lengkap. 30 Juz Al-Quran tersedia untuk dibaca dan dipelajari. Platform Al-Quran digital terlengkap di Indonesia.',
                    'metaKeywords' => 'juz al quran, para al quran, daftar juz, teks arab al quran, al quran digital, quran indonesia, juz lengkap',
                    'canonicalUrl' => url('/juz')
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
                'canonicalUrl' => url('/penanda')
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'profil') {
            // Profile page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Profil Pengguna - IndoQuran',
                'metaDescription' => 'Kelola profil dan pengaturan akun IndoQuran Anda.',
                'metaKeywords' => 'profil indoquran, pengaturan akun, pengguna',
                'canonicalUrl' => url('/profil')
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'masuk') {
            // Login page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Masuk - IndoQuran',
                'metaDescription' => 'Masuk ke akun IndoQuran Anda untuk mengakses fitur penanda dan sinkronisasi bacaan.',
                'metaKeywords' => 'masuk indoquran, login, akun pengguna',
                'canonicalUrl' => url('/masuk')
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'daftar') {
            // Register page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Daftar Akun - IndoQuran',
                'metaDescription' => 'Buat akun IndoQuran untuk menyimpan penanda ayat dan sinkronisasi progres bacaan Anda.',
                'metaKeywords' => 'daftar indoquran, buat akun, registrasi pengguna',
                'canonicalUrl' => url('/daftar')
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
            // Prayer page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Doa Bersama - Komunitas Doa Muslim - IndoQuran',
                'metaDescription' => 'Bergabunglah dengan komunitas doa Muslim di IndoQuran. Buat dan bagikan doa, beri dukungan kepada sesama Muslim, serta temukan kekuatan dalam doa bersama.',
                'metaKeywords' => 'doa bersama, komunitas doa, doa muslim, doa islam, permintaan doa, dukungan doa, indoquran doa',
                'canonicalUrl' => url('/doa-bersama')
            ]);
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
                // Specific page SEO
                $seoData = array_merge($seoData, [
                    'metaTitle' => "Al Quran Halaman {$pageNumber} - Teks Arab & Audio | IndoQuran",
                    'metaDescription' => "Baca Al-Quran halaman {$pageNumber} dengan teks Arab jelas, navigasi cepat antar halaman, dan audio murottal per ayat. Cocok untuk tilawah, murajaah, dan hafalan harian.",
                    'metaKeywords' => "halaman {$pageNumber}, al quran halaman {$pageNumber}, alquran halaman {$pageNumber}, quran halaman {$pageNumber}, teks arab halaman {$pageNumber}, quran digital, al quran indonesia",
                    'canonicalUrl' => url("/halaman/{$pageNumber}"),
                    'ogType' => 'article'
                ]);
            } else {
                // Page list SEO
                $seoData = array_merge($seoData, [
                    'metaTitle' => 'Daftar Halaman Al-Quran - Teks Arab - IndoQuran',
                    'metaDescription' => 'Akses semua halaman Al-Quran dengan teks Arab lengkap. 604 halaman Al-Quran tersedia untuk dibaca dan dipelajari. Platform Al-Quran digital terlengkap di Indonesia.',
                    'metaKeywords' => 'halaman al quran, daftar halaman, teks arab al quran, al quran digital, quran indonesia, halaman lengkap',
                    'canonicalUrl' => url('/halaman')
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
        elseif (isset($segments[0]) && $segments[0] === 'admin') {
            // Admin panel SEO (minimal for security)
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Admin Panel - IndoQuran',
                'metaDescription' => 'Panel administrasi IndoQuran untuk pengelolaan sistem.',
                'metaKeywords' => 'admin, panel administrasi, indoquran',
                'canonicalUrl' => url('/admin'),
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
        }
        elseif (isset($segments[0]) && $segments[0] === 'juz' && isset($segments[1]) && is_numeric($segments[1])) {
            $juzNumber = (int) $segments[1];
            $reactData['currentJuz'] = [
                'number' => $juzNumber,
                'title' => "Juz {$juzNumber} Arab Saja",
                'description' => "Halaman ini berisi teks Arab Al-Quran untuk Juz {$juzNumber} dengan navigasi cepat per ayat dan dukungan audio murottal."
            ];
        }
        elseif (isset($segments[0]) && $segments[0] === 'halaman' && isset($segments[1]) && is_numeric($segments[1])) {
            $pageNumber = (int) $segments[1];
            $reactData['currentPage'] = [
                'number' => $pageNumber,
                'title' => "Al Quran Halaman {$pageNumber}",
                'description' => "Akses Al-Quran halaman {$pageNumber} dengan teks Arab jelas untuk bacaan harian, murajaah, dan hafalan."
            ];
        }

        return view('react', array_merge($seoData, ['reactData' => $reactData]));
    }
}
