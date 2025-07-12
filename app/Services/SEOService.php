<?php

namespace App\Services;

use App\Models\Surah;

/**
 * SEO Service for comprehensive search engine optimization
 * Optimized for Indonesian Quran search terms and Google ranking
 */
class SEOService
{
    // All 114 Surah names for comprehensive SEO coverage
    public const ALL_SURAH_NAMES = [
        'al-fatihah', 'al-baqarah', 'ali-imran', 'an-nisa', 'al-maidah', 'al-anam', 'al-araf', 'al-anfal',
        'at-taubah', 'yunus', 'hud', 'yusuf', 'ar-rad', 'ibrahim', 'al-hijr', 'an-nahl', 'al-isra', 'al-kahf',
        'maryam', 'taha', 'al-anbiya', 'al-hajj', 'al-muminun', 'an-nur', 'al-furqan', 'ash-shuara', 'an-naml',
        'al-qasas', 'al-ankabut', 'ar-rum', 'luqman', 'as-sajdah', 'al-ahzab', 'saba', 'fatir', 'yasin', 'as-saffat',
        'sad', 'az-zumar', 'ghafir', 'fussilat', 'ash-shura', 'az-zukhruf', 'ad-dukhan', 'al-jathiyah', 'al-ahqaf',
        'muhammad', 'al-fath', 'al-hujurat', 'qaf', 'adh-dhariyat', 'at-tur', 'an-najm', 'al-qamar', 'ar-rahman',
        'al-waqiah', 'al-hadid', 'al-mujadilah', 'al-hashr', 'al-mumtahanah', 'as-saff', 'al-jumuah', 'al-munafiqun',
        'at-taghabun', 'at-talaq', 'at-tahrim', 'al-mulk', 'al-qalam', 'al-haqqah', 'al-maarij', 'nuh', 'al-jinn',
        'al-muzzammil', 'al-muddaththir', 'al-qiyamah', 'al-insan', 'al-mursalat', 'an-naba', 'an-naziat', 'abasa',
        'at-takwir', 'al-infitar', 'al-mutaffifin', 'al-inshiqaq', 'al-buruj', 'at-tariq', 'al-ala', 'al-ghashiyah',
        'al-fajr', 'al-balad', 'ash-shams', 'al-lail', 'ad-duha', 'ash-sharh', 'at-tin', 'al-alaq', 'al-qadr', 'al-bayyinah',
        'az-zalzalah', 'al-adiyat', 'al-qariah', 'at-takathur', 'al-asr', 'al-humazah', 'al-fil', 'quraish', 'al-maun',
        'al-kawthar', 'al-kafirun', 'an-nasr', 'al-masad', 'al-ikhlas', 'al-falaq', 'an-nas'
    ];

    // High-traffic Indonesian Quran search terms
    public const HIGH_TRAFFIC_SEARCH_TERMS = [
        'al quran indonesia', 'quran indonesia', 'quran digital', 'al quran online', 'quran online indonesia',
        'al quran digital', 'al-quran indonesia', 'al-quran online', 'quran indonesia', 'quran terjemahan indonesia',
        'quran web', 'quranweb', 'my quran indonesia', 'indonesia quran', 'alquran indonesia', 'quran.com indonesia',
        'qur an indonesia', 'al qur an online', 'al qur an indonesia', 'koran indonesia', 'quran web'
    ];

    // User-requested specific search terms for optimization
    public const USER_REQUESTED_TERMS = [
        'surat ibrahim', 'an naml', 'surah ibrahim', 'ar rum', 'surah an naml', 'surat at tariq', 'al anfal',
        'surat as saffat', 'at thoriq', 'at tariq', 'surat ar rum', 'surat al-qasas', 'surah al qasas', 'surah at tariq',
        'as saffat', 'al mu minun', 'at thariq', 'surah as-saffat', 'surah al-qasas', 'al qasas', 'surah ke 76',
        'surat saba', 'as saaffat', 'surat shad', 'al muminun', 'al mulk 21-30', 'surat ke 27', 'surat al qasas',
        'surat ke 52', 'surat ar-rum', 'surat an-naml', 'surah tentang lebah', 'taha', 'surat annaml', 'quran 93 7',
        'arti surah an naml', 'al mursalat', 'surat yunus ayat 4', 'at tur', 'surah lebah', 'surat ke 30',
        'surat maryam ayat 34', 'ar rum artinya', 'surah saad', 'surah 86', 'al isra surat ke berapa', 'al infitar',
        'yunus 91', 'surah at toriq', 'surat al torik', 'surah as saff', 'at tarik', 'ar rum ayat 3',
        'surah al humazah termasuk golongan surah', 'surat ke 23', 'as saff', 'surat ar rum ayat 23',
        'al mulk ayat 20-30', 'surat 61', 'surat al mulk ayat 20-30', 'ibrahim surat', 'surat sad ayat 35',
        'surat alinsan', 'surah 30', 'quran surat 30', 'qs 27', 'ayat an naml', 'surah al fatih', 'al quran juz 23',
        'surah sulaiman juz berapa', 'fussilat', 'surat ke 28 dalam al quran', 'annaziat', 'surat al balad diturunkan di kota'
    ];

    /**
     * Generate comprehensive SEO keywords for Surah pages
     */
    public static function generateSurahKeywords(Surah $surah): string
    {
        $keywords = [
            // Primary keywords
            "surah {$surah->name_latin}",
            "surat {$surah->name_latin}",
            $surah->name_latin,
            "surah ke {$surah->number}",
            "surat ke {$surah->number}",
            "qs {$surah->number}",
            
            // Arabic variations
            $surah->name_arabic,
            "surat {$surah->name_arabic}",
            
            // Common search patterns
            "{$surah->name_latin} artinya",
            "arti surah {$surah->name_latin}",
            "surat {$surah->name_latin} terjemahan",
            "surah {$surah->name_latin} indonesia",
            "{$surah->name_latin} ayat",
            "surat {$surah->name_latin} ayat",
            
            // Audio/murottal keywords
            "murottal {$surah->name_latin}",
            "audio {$surah->name_latin}",
            "tilawah {$surah->name_latin}",
            
            // Context keywords
            "{$surah->name_latin} juz berapa",
            "surat {$surah->name_latin} surat ke berapa",
            "{$surah->name_latin} diturunkan di",
            "{$surah->name_latin} berapa ayat",
        ];

        // Add ayah count if available
        if ($surah->total_ayahs) {
            $keywords[] = "{$surah->name_latin} {$surah->total_ayahs} ayat";
            $keywords[] = "surat {$surah->name_latin} {$surah->total_ayahs} ayat";
        }

        // Add high-traffic terms
        $keywords = array_merge($keywords, self::HIGH_TRAFFIC_SEARCH_TERMS);

        // Add matching user-requested terms
        $matchingTerms = array_filter(self::USER_REQUESTED_TERMS, function($term) use ($surah) {
            return str_contains(strtolower($term), strtolower($surah->name_latin)) || 
                   str_contains($term, (string)$surah->number) ||
                   str_contains($term, "ke {$surah->number}") ||
                   str_contains($term, "surat {$surah->number}") ||
                   str_contains($term, "surah {$surah->number}");
        });

        $keywords = array_merge($keywords, $matchingTerms);

        // Remove duplicates and clean
        $uniqueKeywords = array_unique(array_map('strtolower', $keywords));
        
        return implode(', ', array_slice($uniqueKeywords, 0, 20)); // Limit to 20 keywords
    }

    /**
     * Generate comprehensive home page keywords
     */
    public static function generateHomeKeywords(): string
    {
        $keywords = array_merge(
            self::HIGH_TRAFFIC_SEARCH_TERMS,
            array_map(fn($name) => "surah {$name}", self::ALL_SURAH_NAMES),
            array_map(fn($name) => "surat {$name}", self::ALL_SURAH_NAMES),
            [
                // General Quran terms
                'al quran 30 juz', 'al quran 114 surah', 'mushaf indonesia', 'quran mushaf utsmani',
                'baca quran online', 'hafalan quran', 'menghafal al quran', 'tilawah quran',
                'murottal quran', 'qori quran indonesia', 'tadarus quran', 'khatam quran',
                
                // Indonesian Islamic terms
                'islam indonesia', 'muslim indonesia', 'kitab suci umat islam', 'wahyu allah',
                'firman allah', 'kalamullah', 'al kitab', 'furqan',
                
                // Technology terms
                'aplikasi quran', 'software quran', 'platform quran digital',
                'website quran indonesia', 'situs al quran', 'portal islam indonesia'
            ]
        );

        $uniqueKeywords = array_unique(array_map('strtolower', $keywords));
        return implode(', ', array_slice($uniqueKeywords, 0, 25));
    }

    /**
     * Generate search page keywords
     */
    public static function generateSearchKeywords(string $query = ''): string
    {
        $keywords = [
            // Base search terms
            'pencarian al quran', 'cari ayat quran', 'search quran indonesia',
            'temukan ayat', 'cari surat', 'pencarian surah',
        ];

        // Add query-specific terms if provided
        if (!empty($query)) {
            $keywords = array_merge($keywords, [
                "cari {$query}",
                "pencarian {$query}",
                "{$query} al quran",
                "ayat tentang {$query}",
                "surah tentang {$query}"
            ]);
        }

        // Add high-traffic terms
        $keywords = array_merge($keywords, self::HIGH_TRAFFIC_SEARCH_TERMS);

        // Add search-related user terms
        $searchTerms = array_filter(self::USER_REQUESTED_TERMS, function($term) {
            return str_contains($term, 'cari') || 
                   str_contains($term, 'pencarian') ||
                   str_contains($term, 'search');
        });

        $keywords = array_merge($keywords, $searchTerms);

        $uniqueKeywords = array_unique(array_map('strtolower', $keywords));
        return implode(', ', array_slice($uniqueKeywords, 0, 20));
    }

    /**
     * Generate structured data for Surah pages
     */
    public static function generateSurahStructuredData(Surah $surah): array
    {
        $baseUrl = config('app.url');
        
        return [
            [
                "@context" => "https://schema.org",
                "@type" => "Article",
                "headline" => "Surah {$surah->name_latin} ({$surah->name_arabic}) - Terjemahan & Audio Murottal",
                "description" => "Baca dan dengarkan Surah {$surah->name_latin} lengkap dengan terjemahan bahasa Indonesia dan tafsir. Surah ke-{$surah->number} dalam Al-Quran yang terdiri dari {$surah->total_ayahs} ayat.",
                "author" => [
                    "@type" => "Organization",
                    "name" => "IndoQuran",
                    "url" => $baseUrl
                ],
                "publisher" => [
                    "@type" => "Organization",
                    "name" => "IndoQuran",
                    "logo" => [
                        "@type" => "ImageObject",
                        "url" => "{$baseUrl}/android-chrome-512x512.png"
                    ]
                ],
                "datePublished" => "2025-01-01T00:00:00Z",
                "dateModified" => now()->toISOString(),
                "mainEntityOfPage" => [
                    "@type" => "WebPage",
                    "@id" => "{$baseUrl}/surah/{$surah->number}"
                ],
                "image" => "{$baseUrl}/images/surah-{$surah->number}-social.png",
                "inLanguage" => ["id", "ar"],
                "about" => [
                    "@type" => "Thing",
                    "name" => "Surah {$surah->name_latin}",
                    "description" => $surah->description_short ?? "Surah ke-{$surah->number} dalam Al-Quran"
                ],
                "keywords" => self::generateSurahKeywords($surah)
            ],
            [
                "@context" => "https://schema.org",
                "@type" => "Book",
                "name" => "Surah {$surah->name_latin}",
                "alternateName" => [$surah->name_arabic, "Surat {$surah->name_latin}", "Surah ke-{$surah->number}"],
                "author" => [
                    "@type" => "Person",
                    "name" => "Allah SWT"
                ],
                "inLanguage" => ["ar", "id"],
                "numberOfPages" => ceil(($surah->total_ayahs ?? 0) / 15),
                "bookFormat" => "EBook",
                "genre" => "Religious Text",
                "publisher" => [
                    "@type" => "Organization",
                    "name" => "IndoQuran"
                ],
                "url" => "{$baseUrl}/surah/{$surah->number}",
                "description" => $surah->description_short ?? "Surah ke-{$surah->number} dalam Al-Quran dengan {$surah->total_ayahs} ayat"
            ]
        ];
    }

    /**
     * Generate optimized page title
     */
    public static function generateOptimizedTitle(string $title, int $maxLength = 60): string
    {
        // Ensure title ends with brand name for consistency
        $brandName = ' | IndoQuran';
        $maxTitleLength = $maxLength - strlen($brandName);
        
        if (strlen($title) > $maxTitleLength) {
            $title = substr($title, 0, $maxTitleLength - 3) . '...';
        }
        
        return $title . $brandName;
    }

    /**
     * Generate optimized meta description
     */
    public static function generateOptimizedDescription(string $description, int $maxLength = 160): string
    {
        if (strlen($description) > $maxLength) {
            // Find the last complete sentence within limit
            $truncated = substr($description, 0, $maxLength - 3);
            $lastPeriod = strrpos($truncated, '.');
            
            if ($lastPeriod !== false && $lastPeriod > $maxLength * 0.7) {
                return substr($description, 0, $lastPeriod + 1);
            }
            
            return $truncated . '...';
        }
        
        return $description;
    }
}
