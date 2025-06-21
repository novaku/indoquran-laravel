<?php

namespace App\Http\Controllers;

use App\Models\Surah;
use Illuminate\Http\Request;
use Illuminate\View\View;

class SEOController extends Controller
{
    /**
     * Handle dynamic SEO for React app
     * This controller provides SEO data to the React blade template
     */
    public function handleReactRoute(Request $request): View
    {
        $path = $request->path();
        $segments = explode('/', $path);
        
        // Default SEO values
        $seoData = [
            'metaTitle' => 'IndoQuran - Al-Quran Digital Indonesia',
            'metaDescription' => 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia, fitur bookmark, pencarian ayat, dan audio murottal berkualitas tinggi.',
            'metaKeywords' => 'al quran indonesia, quran online, al quran digital, baca quran, terjemahan quran, murottal, quran indonesia, ayat al quran, surah quran, indoquran',
            'canonicalUrl' => url($request->getRequestUri()),
            'ogImage' => url('/android-chrome-512x512.png'),
            'ogType' => 'website'
        ];

        // Handle different routes
        if ($path === '/' || $path === '') {
            // Homepage SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'IndoQuran - Al-Quran Digital Indonesia',
                'metaDescription' => 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia, fitur bookmark, pencarian ayat, dan audio murottal berkualitas tinggi.',
                'metaKeywords' => 'al quran indonesia, quran online, al quran digital, baca quran, terjemahan quran, murottal, quran indonesia, ayat al quran, surah quran, indoquran',
                'canonicalUrl' => url('/')
            ]);
        } 
        elseif (isset($segments[0]) && $segments[0] === 'surah') {
            // Surah page SEO
            if (isset($segments[1]) && is_numeric($segments[1])) {
                $surahNumber = (int) $segments[1];
                $surah = Surah::where('number', $surahNumber)->first();
                
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
                        // Surah page SEO
                        $seoData = array_merge($seoData, [
                            'metaTitle' => "Surah {$surah->name_latin} ({$surah->name_arabic}) - Terjemahan Indonesia - IndoQuran",
                            'metaDescription' => "Baca dan dengarkan Surah {$surah->name_latin} lengkap dengan terjemahan bahasa Indonesia. Surah ke-{$surah->number} dalam Al-Quran yang terdiri dari {$surah->total_ayahs} ayat. Audio murottal berkualitas tinggi tersedia.",
                            'metaKeywords' => "Surah {$surah->name_latin}, {$surah->name_arabic}, al quran surah {$surah->number}, terjemahan surah {$surah->name_latin}, murottal {$surah->name_latin}, quran indonesia",
                            'canonicalUrl' => url("/surah/{$surahNumber}"),
                            'ogType' => 'article'
                        ]);
                    }
                }
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'search') {
            // Search page SEO
            $query = $request->get('q', '');
            if ($query) {
                $seoData = array_merge($seoData, [
                    'metaTitle' => "Hasil Pencarian \"{$query}\" - Al-Quran Digital - IndoQuran",
                    'metaDescription' => "Hasil pencarian Al-Quran untuk \"{$query}\". Temukan ayat dan surah yang sesuai dengan pencarian Anda dalam Al-Quran dengan terjemahan bahasa Indonesia.",
                    'metaKeywords' => "pencarian quran, cari ayat, {$query}, al quran indonesia, pencarian al quran, search al quran",
                    'canonicalUrl' => url("/search?q=" . urlencode($query))
                ]);
            } else {
                $seoData = array_merge($seoData, [
                    'metaTitle' => 'Pencarian Al-Quran - Cari Ayat dalam Al-Quran - IndoQuran',
                    'metaDescription' => 'Cari ayat dalam Al-Quran berdasarkan terjemahan Bahasa Indonesia dengan mudah dan cepat. Fitur pencarian canggih untuk menemukan ayat yang Anda butuhkan.',
                    'metaKeywords' => 'cari ayat quran, pencarian al quran, search al quran, al quran digital, cari terjemahan quran',
                    'canonicalUrl' => url('/search')
                ]);
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'juz') {
            // Juz page SEO
            if (isset($segments[1]) && is_numeric($segments[1])) {
                $juzNumber = (int) $segments[1];
                // Specific Juz SEO
                $seoData = array_merge($seoData, [
                    'metaTitle' => "Juz {$juzNumber} - Teks Arab Al-Quran - IndoQuran",
                    'metaDescription' => "Baca Juz {$juzNumber} Al-Quran dengan teks Arab lengkap. Para {$juzNumber} Al-Quran tersedia untuk dibaca dan dipelajari. Platform Al-Quran digital terlengkap di Indonesia.",
                    'metaKeywords' => "juz {$juzNumber}, para {$juzNumber}, al quran juz {$juzNumber}, teks arab juz {$juzNumber}, quran digital, al quran indonesia",
                    'canonicalUrl' => url("/juz/{$juzNumber}"),
                    'ogType' => 'article'
                ]);
            } else {
                // Juz list page SEO
                $seoData = array_merge($seoData, [
                    'metaTitle' => 'Daftar Juz Al-Quran - Teks Arab - IndoQuran',
                    'metaDescription' => 'Akses semua Juz (Para) Al-Quran dengan teks Arab lengkap. 30 Juz Al-Quran tersedia untuk dibaca dan dipelajari. Platform Al-Quran digital terlengkap di Indonesia.',
                    'metaKeywords' => 'juz al quran, para al quran, daftar juz, teks arab al quran, al quran digital, quran indonesia, juz lengkap',
                    'canonicalUrl' => 'https://my.indoquran.web.id/juz'
                ]);
            }
        }
        elseif (isset($segments[0]) && $segments[0] === 'about') {
            // About page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Tentang IndoQuran - Platform Al-Quran Digital Indonesia',
                'metaDescription' => 'Pelajari lebih lanjut tentang IndoQuran, platform Al-Quran digital terdepan di Indonesia. Misi kami adalah memudahkan umat Islam dalam membaca dan mempelajari Al-Quran secara online.',
                'metaKeywords' => 'tentang indoquran, al quran digital indonesia, platform quran, teknologi islam, aplikasi quran',
                'canonicalUrl' => 'https://my.indoquran.web.id/about'
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'contact') {
            // Contact page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Kontak Kami - IndoQuran',
                'metaDescription' => 'Hubungi tim IndoQuran untuk pertanyaan, saran, atau masukan mengenai platform Al-Quran digital kami. Kami siap membantu Anda.',
                'metaKeywords' => 'kontak indoquran, hubungi kami, customer service, dukungan teknis',
                'canonicalUrl' => 'https://my.indoquran.web.id/contact'
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'penanda') {
            // Bookmarks page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Penanda Ayat Favorit - IndoQuran',
                'metaDescription' => 'Kelola dan akses penanda ayat Al-Quran favorit Anda. Simpan ayat-ayat penting untuk dibaca kembali dengan mudah di IndoQuran.',
                'metaKeywords' => 'penanda quran, ayat favorit, simpan ayat, al quran penanda, indoquran penanda',
                'canonicalUrl' => 'https://my.indoquran.web.id/penanda'
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'profil') {
            // Profile page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Profil Pengguna - IndoQuran',
                'metaDescription' => 'Kelola profil dan pengaturan akun IndoQuran Anda.',
                'metaKeywords' => 'profil indoquran, pengaturan akun, pengguna',
                'canonicalUrl' => 'https://my.indoquran.web.id/profil'
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'masuk') {
            // Login page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Masuk - IndoQuran',
                'metaDescription' => 'Masuk ke akun IndoQuran Anda untuk mengakses fitur penanda dan sinkronisasi bacaan.',
                'metaKeywords' => 'masuk indoquran, login, akun pengguna',
                'canonicalUrl' => 'https://my.indoquran.web.id/masuk'
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'daftar') {
            // Register page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Daftar Akun - IndoQuran',
                'metaDescription' => 'Buat akun IndoQuran untuk menyimpan penanda ayat dan sinkronisasi progres bacaan Anda.',
                'metaKeywords' => 'daftar indoquran, buat akun, registrasi pengguna',
                'canonicalUrl' => 'https://my.indoquran.web.id/daftar'
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
                'canonicalUrl' => 'https://my.indoquran.web.id/doa-bersama'
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'kebijakan') {
            // Privacy page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Kebijakan Privasi - IndoQuran',
                'metaDescription' => 'Baca kebijakan privasi IndoQuran. Kami berkomitmen melindungi data pribadi dan privasi pengguna platform Al-Quran digital kami.',
                'metaKeywords' => 'kebijakan privasi, privacy policy, perlindungan data, keamanan data',
                'canonicalUrl' => 'https://my.indoquran.web.id/kebijakan'
            ]);
        }

        return view('react', $seoData);
    }
}
