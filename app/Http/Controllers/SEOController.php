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
            'canonicalUrl' => 'https://my.indoquran.web.id' . $request->getRequestUri(),
            'ogImage' => 'https://my.indoquran.web.id/android-chrome-512x512.png',
            'ogType' => 'website'
        ];

        // Handle different routes
        if ($path === '/' || $path === '') {
            // Homepage SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'IndoQuran - Al-Quran Digital Indonesia',
                'metaDescription' => 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia, fitur bookmark, pencarian ayat, dan audio murottal berkualitas tinggi.',
                'metaKeywords' => 'al quran indonesia, quran online, al quran digital, baca quran, terjemahan quran, murottal, quran indonesia, ayat al quran, surah quran, indoquran',
                'canonicalUrl' => 'https://my.indoquran.web.id'
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
                            'canonicalUrl' => "https://my.indoquran.web.id/surah/{$surahNumber}/{$ayahNumber}",
                            'ogType' => 'article'
                        ]);
                    } else {
                        // Surah page SEO
                        $seoData = array_merge($seoData, [
                            'metaTitle' => "Surah {$surah->name_latin} ({$surah->name_arabic}) - Terjemahan Indonesia - IndoQuran",
                            'metaDescription' => "Baca dan dengarkan Surah {$surah->name_latin} lengkap dengan terjemahan bahasa Indonesia. Surah ke-{$surah->number} dalam Al-Quran yang terdiri dari {$surah->total_ayahs} ayat. Audio murottal berkualitas tinggi tersedia.",
                            'metaKeywords' => "Surah {$surah->name_latin}, {$surah->name_arabic}, al quran surah {$surah->number}, terjemahan surah {$surah->name_latin}, murottal {$surah->name_latin}, quran indonesia",
                            'canonicalUrl' => "https://my.indoquran.web.id/surah/{$surahNumber}",
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
                    'canonicalUrl' => "https://my.indoquran.web.id/search?q=" . urlencode($query)
                ]);
            } else {
                $seoData = array_merge($seoData, [
                    'metaTitle' => 'Pencarian Al-Quran - Cari Ayat dalam Al-Quran - IndoQuran',
                    'metaDescription' => 'Cari ayat dalam Al-Quran berdasarkan terjemahan Bahasa Indonesia dengan mudah dan cepat. Fitur pencarian canggih untuk menemukan ayat yang Anda butuhkan.',
                    'metaKeywords' => 'cari ayat quran, pencarian al quran, search al quran, al quran digital, cari terjemahan quran',
                    'canonicalUrl' => 'https://my.indoquran.web.id/search'
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
        elseif (isset($segments[0]) && $segments[0] === 'bookmarks') {
            // Bookmarks page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Bookmark Ayat Favorit - IndoQuran',
                'metaDescription' => 'Kelola dan akses bookmark ayat Al-Quran favorit Anda. Simpan ayat-ayat penting untuk dibaca kembali dengan mudah di IndoQuran.',
                'metaKeywords' => 'bookmark quran, ayat favorit, simpan ayat, al quran bookmark, indoquran bookmark',
                'canonicalUrl' => 'https://my.indoquran.web.id/bookmarks'
            ]);
        }
        elseif (isset($segments[0]) && $segments[0] === 'privacy') {
            // Privacy page SEO
            $seoData = array_merge($seoData, [
                'metaTitle' => 'Kebijakan Privasi - IndoQuran',
                'metaDescription' => 'Baca kebijakan privasi IndoQuran. Kami berkomitmen melindungi data pribadi dan privasi pengguna platform Al-Quran digital kami.',
                'metaKeywords' => 'kebijakan privasi, privacy policy, perlindungan data, keamanan data',
                'canonicalUrl' => 'https://my.indoquran.web.id/privacy'
            ]);
        }

        return view('react', $seoData);
    }
}
