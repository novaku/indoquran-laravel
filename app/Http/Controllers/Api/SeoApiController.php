<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Surah;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API Controller for SEO-related data
 * Provides SEO metadata for React components
 */
class SeoApiController extends Controller
{
    /**
     * Get popular surahs for homepage
     * Based on Google Search Console data (Oct 2025)
     */
    public function getPopularSurahs(): JsonResponse
    {
        $popularSurahNumbers = [96, 1, 2, 18, 36, 55, 56, 67];
        
        $surahs = Surah::whereIn('number', $popularSurahNumbers)
            ->orderByRaw('FIELD(number, ' . implode(',', $popularSurahNumbers) . ')')
            ->get()
            ->map(function ($surah) {
                return [
                    'id' => $surah->number,
                    'number' => $surah->number,
                    'name' => $surah->name_latin,
                    'nameArabic' => $surah->name_arabic,
                    'nameIndonesian' => $surah->name_indonesian,
                    'totalAyahs' => $surah->total_ayahs,
                    'revelationPlace' => $surah->revelation_place,
                    'description' => $this->getPopularSurahDescription($surah->number),
                    'icon' => $this->getPopularSurahIcon($surah->number),
                    'seoTitle' => $surah->getSeoTitle(),
                    'seoDescription' => $surah->getSeoDescription(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $surahs
        ]);
    }

    /**
     * Get FAQ data for a specific surah
     */
    public function getSurahFaq(int $surahNumber): JsonResponse
    {
        $surah = Surah::where('number', $surahNumber)->first();

        if (!$surah) {
            return response()->json([
                'success' => false,
                'message' => 'Surah not found'
            ], 404);
        }

        $faqs = $this->generateSurahFaqs($surah);

        return response()->json([
            'success' => true,
            'data' => [
                'surah' => [
                    'number' => $surah->number,
                    'name' => $surah->name_latin,
                    'nameArabic' => $surah->name_arabic,
                ],
                'faqs' => $faqs
            ]
        ]);
    }

    /**
     * Get SEO metadata for a specific page
     */
    public function getPageSeo(Request $request): JsonResponse
    {
        $pageType = $request->input('type', 'home');
        $pageId = $request->input('id');

        $seoData = match($pageType) {
            'home' => $this->getHomeSeo(),
            'surah' => $this->getSurahSeo($pageId),
            'search' => $this->getSearchSeo($request->input('query')),
            'asmaul-husna' => $this->getAsmaulHusnaSeo(),
            default => $this->getDefaultSeo(),
        };

        return response()->json([
            'success' => true,
            'data' => $seoData
        ]);
    }

    /**
     * Get search trends from Google Search Console
     * (This would be populated with real GSC API data)
     */
    public function getSearchTrends(): JsonResponse
    {
        // Based on actual Google Search Console data from Oct 2025
        $trends = [
            'top_queries' => [
                ['query' => 'al quran online', 'clicks' => 1, 'impressions' => 11, 'ctr' => 9.09, 'position' => 53.09],
                ['query' => 'quran online', 'clicks' => 1, 'impressions' => 9, 'ctr' => 11.11, 'position' => 53.78],
                ['query' => 'al quran indonesia', 'clicks' => 1, 'impressions' => 8, 'ctr' => 12.5, 'position' => 52.38],
                ['query' => 'surah al alaq', 'clicks' => 0, 'impressions' => 46, 'ctr' => 0, 'position' => 55.35],
                ['query' => 'surat al alaq', 'clicks' => 0, 'impressions' => 24, 'ctr' => 0, 'position' => 56.33],
            ],
            'opportunity_queries' => [
                ['query' => 'surah al alaq', 'impressions' => 46, 'position' => 55.35, 'potential' => 'high'],
                ['query' => 'surat al alaq', 'impressions' => 24, 'position' => 56.33, 'potential' => 'high'],
                ['query' => 'al alaq', 'impressions' => 24, 'position' => 58.79, 'potential' => 'medium'],
            ],
            'summary' => [
                'total_clicks' => 5,
                'total_impressions' => 713,
                'average_ctr' => 0.7,
                'average_position' => 60,
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $trends,
            'updated_at' => '2025-10-17'
        ]);
    }

    /**
     * Private helper methods
     */
    private function getPopularSurahDescription(int $number): string
    {
        return match($number) {
            96 => 'Wahyu Pertama Turun',
            1 => 'Pembukaan Al-Quran',
            2 => 'Surah Terpanjang',
            18 => 'Dibaca Setiap Jumat',
            36 => 'Jantung Al-Quran',
            55 => 'Penuh Keajaiban',
            56 => 'Penolak Kemiskinan',
            67 => 'Penyelamat dari Kubur',
            default => 'Surah Populer'
        };
    }

    private function getPopularSurahIcon(int $number): string
    {
        return match($number) {
            96 => '📖',
            1 => '🤲',
            2 => '📚',
            18 => '🕌',
            36 => '❤️',
            55 => '✨',
            56 => '💎',
            67 => '🛡️',
            default => '📿'
        };
    }

    private function generateSurahFaqs(Surah $surah): array
    {
        $faqs = [];
        
        // Standard FAQs for all surahs
        $faqs[] = [
            'question' => "Surat {$surah->name_latin} berapa ayat?",
            'answer' => "Surat {$surah->name_latin} terdiri dari <strong>{$surah->total_ayahs} ayat</strong>. Merupakan surah ke-{$surah->number} dalam Al-Quran dan termasuk golongan surah <strong>" . ($surah->revelation_place === 'Mekah' ? 'Makkiyah (diturunkan di Mekah)' : 'Madaniyah (diturunkan di Madinah)') . "</strong>."
        ];

        $faqs[] = [
            'question' => "Surat {$surah->name_latin} urutan ke berapa?",
            'answer' => "Surat {$surah->name_latin} adalah surah <strong>ke-{$surah->number}</strong> dalam urutan mushaf Al-Quran, dari total 114 surah."
        ];

        $faqs[] = [
            'question' => "Surat {$surah->name_latin} diturunkan di mana?",
            'answer' => "Surat {$surah->name_latin} diturunkan di <strong>" . ($surah->revelation_place ?? 'Mekah') . "</strong>."
        ];

        // Special FAQs for specific surahs
        $specialFaqs = [
            96 => [
                'question' => 'Mengapa Surat Al Alaq penting?',
                'answer' => 'Surat Al Alaq sangat penting karena merupakan <strong>wahyu pertama</strong> yang diturunkan kepada Nabi Muhammad SAW. Lima ayat pertama dari surah ini adalah ayat pertama yang diterima Rasulullah di Gua Hira. Surah ini menekankan pentingnya <strong>membaca dan menuntut ilmu</strong> dalam Islam.'
            ],
            36 => [
                'question' => 'Mengapa Surat Yasin disebut jantung Al-Quran?',
                'answer' => 'Surat Yasin disebut <strong>"Qalbul Quran" (Jantung Al-Quran)</strong> berdasarkan hadits Nabi Muhammad SAW. Surat ini memiliki keutamaan luar biasa dan sering dibaca untuk berbagai keperluan spiritual, termasuk untuk orang yang meninggal dunia.'
            ],
            2 => [
                'question' => 'Mengapa Surat Al Baqarah paling panjang?',
                'answer' => "Surat Al Baqarah adalah <strong>surah terpanjang</strong> dalam Al-Quran dengan {$surah->total_ayahs} ayat. Panjangnya karena memuat berbagai tema penting: hukum Islam, kisah para nabi, akidah, ibadah, dan muamalah. Surat ini juga mengandung <strong>Ayat Kursi</strong> yang sangat mulia."
            ],
            18 => [
                'question' => 'Kapan waktu terbaik membaca Surat Al Kahfi?',
                'answer' => 'Waktu terbaik membaca Surat Al Kahfi adalah pada <strong>hari Jumat</strong>. Dalam hadits disebutkan bahwa barangsiapa membaca Surat Al Kahfi pada hari Jumat, akan diberi cahaya antara dua Jumat dan akan dilindungi dari fitnah Dajjal.'
            ],
        ];

        if (isset($specialFaqs[$surah->number])) {
            $faqs[] = $specialFaqs[$surah->number];
        }

        return $faqs;
    }

    private function getHomeSeo(): array
    {
        return [
            'title' => 'Al-Quran Online Indonesia - Baca, Dengar & Terjemahan Gratis | IndoQuran',
            'description' => '✅ Al-Quran Digital GRATIS ✅ Teks Arab & Terjemahan ✅ Audio Murottal HD ✅ Tafsir Lengkap ✅ Bookmark Ayat. Platform Al-Quran online terpercaya untuk belajar Islam. 114 Surah lengkap dengan fitur pencarian ayat.',
            'keywords' => 'al quran online, quran online, al quran indonesia, al quran digital, baca quran online, terjemahan quran indonesia, murottal quran, alquran online',
            'canonicalUrl' => url('/')
        ];
    }

    private function getSurahSeo($surahNumber): array
    {
        $surah = Surah::where('number', $surahNumber)->first();
        
        if (!$surah) {
            return $this->getDefaultSeo();
        }

        return [
            'title' => $surah->getSeoTitle(),
            'description' => $surah->getSeoDescription(),
            'keywords' => $surah->getSeoKeywords(),
            'canonicalUrl' => url("/surah/{$surahNumber}")
        ];
    }

    private function getSearchSeo($query = null): array
    {
        if ($query) {
            return [
                'title' => "Hasil Pencarian \"{$query}\" - Al-Quran Digital | IndoQuran",
                'description' => "🔍 Hasil pencarian Al-Quran untuk \"{$query}\". Temukan ayat dan surah yang sesuai dengan mudah.",
                'keywords' => "pencarian quran, cari ayat, {$query}",
                'canonicalUrl' => url("/cari?q=" . rawurlencode($query))
            ];
        }

        return [
            'title' => 'Pencarian Al-Quran - Cari Ayat & Terjemahan | IndoQuran',
            'description' => '🔍 Cari ayat dalam Al-Quran dengan mudah dan cepat ✅ Pencarian Teks Arab ✅ Pencarian Terjemahan Indonesia.',
            'keywords' => 'cari ayat quran, pencarian al quran, search quran',
            'canonicalUrl' => url('/cari')
        ];
    }

    private function getAsmaulHusnaSeo(): array
    {
        return [
            'title' => '99 Asmaul Husna - Nama-nama Indah Allah SWT Lengkap | IndoQuran',
            'description' => '📿 99 Asmaul Husna Lengkap ✅ Teks Arab & Latin ✅ Arti Indonesia ✅ Audio MP3 ✅ Penjelasan Makna.',
            'keywords' => '99 asmaul husna, nama allah swt, asmaul husna lengkap',
            'canonicalUrl' => url('/asmaul-husna')
        ];
    }

    private function getDefaultSeo(): array
    {
        return [
            'title' => 'IndoQuran - Al-Quran Digital Indonesia',
            'description' => 'Platform Al-Quran Digital terlengkap di Indonesia.',
            'keywords' => 'al quran indonesia, quran online',
            'canonicalUrl' => url('/')
        ];
    }
}
