<?php

namespace App\Services;

use App\Models\Ayah;
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
        'al quran digital', 'al-quran indonesia', 'al-quran online', 'quran terjemahan indonesia',
        'quran web', 'quranweb', 'quranindo', 'quran indo', 'indonesia quran', 'alquran indonesia', 'quran.com indonesia',
        'qur an indonesia', 'al qur an online', 'al qur an indonesia', 'koran indonesia', 'alquran online',
        'baca al quran online', 'tadarus alquran online', 'alquran per juz', 'al quran per halaman',
        '30 juz berapa halaman', '1 juz berapa halaman', 'juz al quran'
    ];

    // User-requested specific search terms for optimization (from Google Search Console)
    public const USER_REQUESTED_TERMS = [
        // Juz queries
        'juz 15 arab saja', '30 juz berapa halaman', 'juz 15', 'juz 15 surah apa', 'quran juz 15', 'al quran juz 15',
        'juz 15 surat apa', 'juz 15 lengkap', 'juz 15 al quran', 'juz 15 quran', 'bacaan al quran juz 15', 'al quran juz 15 arab',
        'juz 2 berapa halaman', 'juz 1 berapa halaman', '1 juz berapa halaman', 'satu juz berapa halaman', 'juz 20 halaman berapa',
        'juz 3 halaman berapa', 'juz adalah', 'apa itu juz', 'apa yang dimaksud juz dalam al quran', 'urutan juz 1 sampai 30',
        'pembagian juz dalam al quran', 'letak juz dalam al quran', 'tanda juz dalam al quran', 'jumlah juz dalam al quran',
        'berapa juz dalam al quran', 'ada berapa juz dalam al quran', 'angka juz 1 sampai 30', 'juz alquran', 'alquran per juz',
        'juz 1 sampai 30', 'juz al-quran', 'urutan juz 1 sampai 30 arab', 'urutan juz 1 sampai 30 arab dan latin',

        // Halaman queries
        'al quran halaman 295', 'al quran halaman 116', 'al quran halaman 347', 'al quran halaman 577', 'al quran halaman 90',
        'al quran halaman 166', 'al quran halaman 76', 'al quran halaman 86', 'al quran halaman 143', 'al quran halaman 204',
        'al quran halaman 208', 'al quran halaman 277', 'al quran halaman 293', 'al quran halaman 109', 'al quran halaman 55',
        'al quran halaman 128', 'al quran halaman 572', 'al quran halaman 219', 'al quran halaman 126', 'al quran halaman 589',
        'al quran halaman 67', 'al quran halaman 52', 'al quran halaman 87', 'alquran halaman 566', 'al quran halaman 119',
        'al quran halaman 139', 'al quran halaman 584', 'al quran halaman 65', 'al quran halaman 434', 'al quran halaman 205',
        'al quran halaman 282', 'al quran halaman 104', 'halaman al quran', 'quran per halaman', 'al quran per halaman',
        'al quran online per halaman', 'quran perhalaman', 'al-qur\'an online per halaman', 'berapa halaman alquran',
        'jumlah halaman alquran', 'alquran ada berapa halaman', 'ada berapa halaman dalam al quran', 'al baqarah halaman 19',
        'al quran muka surat 19', 'al quran muka surat 277', 'al quran muka surat 276', 'al quran muka surat 437',
        'al quran muka surat 121', 'al quran muka surat 27', 'al quran muka surat 74', 'alquran muka surat 19',

        // Surah & Ayat queries
        'surat ibrahim ayat 9', 'arti surat ibrahim ayat 9', 'ibrahim ayat 9', 'surat ibrahim ayat 9 dan artinya',
        'surat ibrahim 9', 'q.s ibrahim ayat 9', 'surat ibrahim ayat 14 9', 'ibrahim 14 9', 'qs ibrahim 14 9',
        'surat ibrahim ayat 9 latin', 'arti ibrahim ayat 9', 'arti q.s ibrahim ayat 9', 'ibrahim ayat 21', 'surah ibrahim 21',
        'surat ibrahim', 'surah ibrahim', 'surat ibrahim berapa ayat', 'surat ibrahim lengkap', 'ibrahim surat', 'ibrahim juz berapa',

        'az zumar ayat 9', 'az zumar ayat 9 dan artinya', 'surat az zumar ayat 9 latin', 'arti surat az-zumar ayat 9',
        'az zumar ayat 9 menjelaskan tentang', 'kandungan surat az zumar ayat 9', 'surat az-zumar ayat 9', 'az zumar 9',
        'az-zumar ayat 9 latin', 'surah az zumar ayat 9', 'surah al zumar ayat 9',

        'qs al hajj ayat 27', 'al hajj 27', 'surat al hajj ayat 27', 'surah al hajj 27 28', 'surat al hajj ayat 27 28 latin',
        'surat al hajj ayat 27 untuk dagang arab', 'wa adzin finnasi', 'wa adzdzin finnaasi bil hajji', 'al hajj ayat 54',
        'al hajj 54', 'surat al hajj ayat 54', 'surat al hajj ayat 66', 'al hajj 25', 'surah al hajj ayat 25',

        'surah al fath ayat 28', 'al fath 28', 'al fath ayat 28', 'surat al fath ayat 28 29', 'alfath 28',
        'surat al fath ayat 28 29 latin', 'surah al fath ayat 28-29', 'al fath ayat 11',

        'intan surullah yansurkum', 'surat muhammad ayat 7', 'qs muhammad ayat 7', 'muhammad 7', 'muhammad ayat 7',
        'barang siapa menolong agama allah', 'intansurullaha yansurkum wayusabbit aqdamakum', 'intansurullah yansurkum',
        'qs. muhammad ayat 7', 'surah muhammad ayat 7', 'intanshurullah yanshurkum',

        'surat an naba ayat 30', 'an naba ayat 30', 'an naba ayat 23', 'an naba 38', 'surat an naba ayat 38',
        'al baqarah ayat 270', 'al baqarah 270', 'al baqarah ayat 122', 'al baqarah ayat 260', 'al baqarah ayat 31',
        'surah al baqarah ayat 31', 'qs al baqarah ayat 31', 'al baqarah 31', 'surah al baqarah ayat 260',
        'surah al baqarah ayat 234', 'surah al baqarah ayat 276', 'al baqarah 295', 'al baqarah 253',

        'surah ali imran ayat 64', 'al imran ayat 64', 'ali imran 64', 'surat ali imran ayat 64 dan artinya',
        'surat ali imran ayat 64 beserta artinya', 'ali imran 145', 'ali imran ayat 145', 'ali imran 79',
        'ali imran ayat 79', 'ali imron 53',

        'surat yunus ayat 40', 'yunus 40', 'qs yunus 40', 'surah yunus ayat 58', 'tafsir surat yunus ayat 58',
        'surat yunus 58', 'yunus 58', 'surat yunus 41', 'yunus ayat 40', 'yunus ayat 58', 'yunus 41 42',

        'surah al luqman ayat 14', 'luqman ayat 14', 'al luqman ayat 14', 'qs luqman ayat 14',
        'surat al luqman ayat 14 latin dan artinya', 'luqman 14 15', 'surat luqman ayat 20', 'luqman ayat 20',
        'surat al luqman beserta artinya', 'luqman 20',

        'surat 52', 'surat ke 52', 'surah 52', 'surat ke 38', 'surah ke 38', 'shad 26', 'shad ayat 26', 'qs. shad ayat 26',
        'surat shad ayat 26', 'as shad 26', 'shad 75',

        'surat ke 104', 'surat al humazah ayat 1', 'al humazah ayat 1',
        'surat ke 105', 'surah al fil dan artinya', 'terjemahan surat al fil', 'alam taro kaifa',
        'surah alam taro kaifafa', 'alam taro kaifafa ala rabbuka', 'al fiil ayat 1',

        'surat ke 36', 'surat 36', 'yasin ayat 30', 'surat yasin ayat 30', 'yasin ayat 21', 'yasin ayat 57',
        'surat ke 79', 'surat ke 63', 'surat 76', 'surat al insan', 'al insan', 'al insan ayat 1', 'arti surat al insan',

        'wadkhuli jannati', 'wad khuli jannati', 'al fajr 30', 'al fajr ayat 30',
        'quran 9 40', 'quran 9:40', 'at taubah 9 40', 'surah at taubah ayat 40', 'at taubah ayat 21', 'at taubah ayat 31',

        'al maidah ayat 55', 'al maidah 15', 'al maidah 116', 'al maidah ayat 116', 'al maidah 55', 'surat al maidah ayat 15',
        'al maidah ayat 73',

        'surat as saffat', 'as saffat', 'as saaffat', 'as saffat surat ke berapa', 'surat shaffat', 'qs as saffat',
        'surah as-saffat', 'surah ash shaffat', 'ayat as saffat', 'saffat 27',

        'surat ar rahman ayat 15', 'ar rahman ayat 15', 'ar rahman ayat 7', 'ar rahman 15', 'ar rahman ayat 4',
        'ar rahman surah ke berapa',

        'an nahl 1', 'surat an nahl ayat 1', 'an nahl ayat 69', 'an nahl 69',
        'an nisa 144', 'an nisa ayat 144', 'al anfal 61', 'al anbiya 105', 'al anbiya ayat 105',
        'fussilat 11', 'fussilat ayat 11', 'al mutaffifin ayat 16', 'al mu\'minun ayat 14', 'al mu\'minun ayat 1-11',
        'al mu\'minun ayat 1 11 arab', 'al mukminun 14', 'ghafir', 'surat ghafir ayat 8', 'ghafir artinya',

        'at tahrim', 'surat at tahrim', 'at tahrim ayat 3', 'at tin ayat 5', 'surat at tin ayat 5',
        'al mulk ayat 8', 'al mulk ayat 27', 'al mulk ayat 3', 'al mulk ayat 22',
        'at talaq ayat 12', 'at talaq ayat 7', 'at thalaq ayat 12', 'at thalaq ayat 7',

        // Brand & Portal queries
        'quranindo', 'quran indo', 'quranweb', 'quranwbe', 'indoquran', 'web al quran',
        'al quran digital online', 'al quran digital per halaman', 'bacaan alquran online',
        'tadarus al quran juz 1 sampai 30', 'daftar 114 surat dalam al-quran'
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
     * Generate FAQPage structured data for Homepage
     */
    public static function generateHomeFaqStructuredData(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => [
                [
                    '@type' => 'Question',
                    'name' => 'Bagaimana cara membaca Al-Quran online di IndoQuran?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Anda dapat langsung memilih surah dari daftar 114 surah, membaca per juz (1-30), atau per halaman mushaf (1-604). Setiap ayat dilengkapi dengan teks Arab berharakat jelas, transliterasi latin, dan terjemahan bahasa Indonesia.'
                    ]
                ],
                [
                    '@type' => 'Question',
                    'name' => 'Apakah terjemahan Al-Quran di IndoQuran bersumber dari Kemenag?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Ya, terjemahan Al-Quran di IndoQuran mengacu pada terjemahan resmi standar Kementerian Agama Republik Indonesia (Kemenag) sehingga valid dan mudah dipahami.'
                    ]
                ],
                [
                    '@type' => 'Question',
                    'name' => 'Apakah tersedia audio murottal Al-Quran?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Ya, IndoQuran menyediakan audio murottal berkualitas tinggi per ayat dan per surah dari qari terkemuka seperti Mishary Rashid Alafasy, Abdurrahman As-Sudais, dan lainnya.'
                    ]
                ],
                [
                    '@type' => 'Question',
                    'name' => 'Kitab hadits apa saja yang dapat dibaca di IndoQuran?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'IndoQuran menyediakan 7 kitab hadits shahih nabawi: Shahih Bukhari, Shahih Muslim, Sunan Abu Daud, Sunan Tirmidzi, Sunan An-Nasa\'i, Sunan Ibnu Majah, dan Musnad Ahmad lengkap teks Arab dan terjemahan Indonesia.'
                    ]
                ],
                [
                    '@type' => 'Question',
                    'name' => 'Apakah IndoQuran gratis dan bisa diakses lewat HP?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Ya, IndoQuran 100% gratis dan didesain responsif untuk pengguna smartphone (Android & iPhone) serta desktop tanpa perlu mengunduh aplikasi berat.'
                    ]
                ]
            ]
        ];
    }

    /**
     * Generate FAQPage structured data for Surah pages
     */
    public static function generateSurahFaqStructuredData(Surah $surah): array
    {
        $revelation = strtolower((string) ($surah->revelation_place ?? '')) === 'madinah' ? 'Madinah (Madaniyah)' : 'Makkah (Makkiyah)';
        $meaning = $surah->name_indonesian ?? $surah->name_latin;
        $faqInfo = method_exists($surah, 'getFaqInfo') ? $surah->getFaqInfo() : [];

        $questions = [
            [
                '@type' => 'Question',
                'name' => "Berapa jumlah ayat Surah {$surah->name_latin} dan di mana diturunkan?",
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => "Surah {$surah->name_latin} terdiri dari {$surah->total_ayahs} ayat dan merupakan surah ke-{$surah->number} dalam Al-Quran yang diturunkan di kota {$revelation}."
                ]
            ],
            [
                '@type' => 'Question',
                'name' => "Apa arti dari nama Surah {$surah->name_latin}?",
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => "Nama Surah {$surah->name_latin} ({$surah->name_arabic}) memiliki arti \"{$meaning}\"."
                ]
            ],
            [
                '@type' => 'Question',
                'name' => "Apa tema utama dan kandungan Surah {$surah->name_latin}?",
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => !empty($faqInfo['theme'])
                        ? "Tema utama Surah {$surah->name_latin} adalah {$faqInfo['theme']}."
                        : ($surah->description_short ?? "Surah {$surah->name_latin} memuat petunjuk keimanan, hukum, serta peringatan dari Allah SWT untuk seluruh umat manusia.")
                ]
            ]
        ];

        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => $questions
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

    /**
     * Get 30 Juz reference metadata (pages, verses, surah spans)
     */
    public static function getJuzMetadata(?int $juzNumber = null): array
    {
        static $cachedJuzData = null;
        if ($cachedJuzData === null) {
            $path = database_path('seeders/juz_metadata.json');
            if (file_exists($path)) {
                $cachedJuzData = json_decode(file_get_contents($path), true) ?: [];
            } else {
                $cachedJuzData = [];
            }
        }

        if ($juzNumber !== null) {
            return $cachedJuzData[$juzNumber] ?? [];
        }

        return $cachedJuzData;
    }

    /**
     * Generate structured data (Article + FAQPage) for Juz pages
     */
    public static function generateJuzStructuredData(int $juzNumber, array $juzMeta): array
    {
        $baseUrl = config('app.url');
        $minPage = $juzMeta['min_page'] ?? 1;
        $maxPage = $juzMeta['max_page'] ?? 20;
        $totalPages = $juzMeta['total_pages'] ?? 20;
        $totalAyahs = $juzMeta['total_ayahs'] ?? 0;
        $surahsSummary = $juzMeta['surahs_summary'] ?? '';
        $surahNames = $juzMeta['surah_names'] ?? '';

        $title = $juzNumber === 30 
            ? "Juz 30 (Juz Amma) Lengkap Teks Arab, Latin & Terjemahan"
            : "Juz {$juzNumber} Al Quran ({$surahNames}) - Teks Arab, Latin & Terjemahan";

        $description = "Baca Al-Quran Juz {$juzNumber} memuat {$surahsSummary}. Terdiri dari {$totalPages} halaman (halaman {$minPage}-{$maxPage}) dan {$totalAyahs} ayat dengan teks Arab berharakat, transliterasi latin, terjemahan bahasa Indonesia, dan audio murottal merdu di IndoQuran.";

        return [
            [
                '@context' => 'https://schema.org',
                '@type' => 'Article',
                'headline' => $title,
                'description' => $description,
                'author' => [
                    '@type' => 'Organization',
                    'name' => 'IndoQuran',
                    'url' => $baseUrl
                ],
                'publisher' => [
                    '@type' => 'Organization',
                    'name' => 'IndoQuran',
                    'logo' => [
                        '@type' => 'ImageObject',
                        'url' => "{$baseUrl}/android-chrome-512x512.png"
                    ]
                ],
                'datePublished' => '2025-01-01T00:00:00Z',
                'dateModified' => now()->toISOString(),
                'mainEntityOfPage' => [
                    '@type' => 'WebPage',
                    '@id' => "{$baseUrl}/juz/{$juzNumber}"
                ],
                'inLanguage' => ['id', 'ar']
            ],
            [
                '@context' => 'https://schema.org',
                '@type' => 'FAQPage',
                'mainEntity' => [
                    [
                        '@type' => 'Question',
                        'name' => "Juz {$juzNumber} Al-Quran surah apa saja?",
                        'acceptedAnswer' => [
                            '@type' => 'Answer',
                            'text' => "Juz {$juzNumber} memuat {$surahsSummary}."
                        ]
                    ],
                    [
                        '@type' => 'Question',
                        'name' => "Juz {$juzNumber} berapa halaman dan dari halaman berapa sampai berapa?",
                        'acceptedAnswer' => [
                            '@type' => 'Answer',
                            'text' => "Juz {$juzNumber} terdiri dari {$totalPages} halaman, dimulai dari halaman {$minPage} sampai halaman {$maxPage} pada mushaf standar Madinah dan standar Kementerian Agama RI (Kemenag)."
                        ]
                    ],
                    [
                        '@type' => 'Question',
                        'name' => "Berapa jumlah ayat dalam Juz {$juzNumber}?",
                        'acceptedAnswer' => [
                            '@type' => 'Answer',
                            'text' => "Juz {$juzNumber} memuat total {$totalAyahs} ayat lengkap dengan teks Arab berharakat, transliterasi latin, terjemahan bahasa Indonesia, serta audio murottal per ayat."
                        ]
                    ]
                ]
            ]
        ];
    }

    /**
     * Generate FAQPage structured data for Juz index page (/juz)
     */
    public static function generateJuzIndexStructuredData(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => [
                [
                    '@type' => 'Question',
                    'name' => '30 juz berapa halaman?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Al-Quran 30 juz terdiri dari 604 halaman pada mushaf standar Madinah (Rasm Utsmani) dan mushaf standar Kementerian Agama Republik Indonesia (Kemenag RI). Rata-rata setiap juz terdiri dari 20 halaman.'
                    ]
                ],
                [
                    '@type' => 'Question',
                    'name' => '1 juz berapa halaman dalam Al-Quran?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Pada mushaf standar 604 halaman, rata-rata 1 juz terdiri dari 20 halaman (10 lembar bolak-balik), kecuali Juz 1 yang terdiri dari 21 halaman dan Juz 30 yang terdiri dari 23 halaman.'
                    ]
                ],
                [
                    '@type' => 'Question',
                    'name' => 'Ada berapa juz dan surah dalam Al-Quran?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Al-Quran terdiri dari 30 Juz, 114 Surah, dan 6.236 Ayat. Setiap juz memiliki pembagian yang memudahkan pembaca untuk mengkhatamkan Al-Quran dalam satu bulan (30 hari).'
                    ]
                ],
                [
                    '@type' => 'Question',
                    'name' => 'Apa itu juz dalam Al-Quran?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Juz (bahasa Arab: جزء, jamak: أجزاء ajzā\') secara harfiah berarti bagian. Dalam Al-Quran, juz adalah pembagian mushaf menjadi 30 bagian yang hampir sama panjangnya untuk memudahkan jadwal tilawah harian.'
                    ]
                ],
                [
                    '@type' => 'Question',
                    'name' => 'Bagaimana urutan pembagian juz 1 sampai 30 di IndoQuran?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'IndoQuran menyediakan navigasi lengkap 30 juz Al-Quran dari Juz 1 (Al-Fatihah & Al-Baqarah) hingga Juz 30 (Juz Amma), lengkap teks Arab berharakat, latin, arti terjemahan, dan audio murottal.'
                    ]
                ]
            ]
        ];
    }

    /**
     * Generate FAQPage structured data for Halaman pages (/halaman/{number})
     */
    public static function generateHalamanStructuredData(int $pageNumber, array $pageInfo): array
    {
        $juzNumber = $pageInfo['juz'] ?? 1;
        $summary = $pageInfo['summary'] ?? '';

        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => [
                [
                    '@type' => 'Question',
                    'name' => "Al-Quran Halaman {$pageNumber} (muka surat {$pageNumber}) memuat surah apa saja?",
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => "Halaman {$pageNumber} memuat " . ($summary ?: "ayat-ayat suci Al-Quran") . " yang terletak pada Juz {$juzNumber}."
                    ]
                ],
                [
                    '@type' => 'Question',
                    'name' => "Halaman {$pageNumber} Al-Quran berada di Juz berapa?",
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => "Halaman {$pageNumber} Al-Quran termasuk dalam bagian Juz {$juzNumber} pada mushaf standar Madinah dan standar Kemenag RI."
                    ]
                ],
                [
                    '@type' => 'Question',
                    'name' => "Berapa total halaman dalam Al-Quran?",
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => "Mushaf Al-Quran standar rasm Utsmani Madinah dan standar Kementerian Agama RI terdiri dari total 604 halaman yang terbagi ke dalam 30 juz."
                    ]
                ]
            ]
        ];
    }

    /**
     * Generate FAQPage structured data for Halaman index page (/halaman)
     */
    public static function generateHalamanIndexStructuredData(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => [
                [
                    '@type' => 'Question',
                    'name' => 'Berapa halaman Al-Quran 30 juz?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Mushaf Al-Quran standar Madinah dan standar Kemenag RI memiliki 604 halaman. Setiap halaman diawali dan diakhiri dengan ayat yang pas (rasm Utsmani mushaf pojok).'
                    ]
                ],
                [
                    '@type' => 'Question',
                    'name' => 'Berapa jumlah lembar dalam Al-Quran?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Karena 1 lembar memiliki 2 halaman (bolak-balik), maka mushaf Al-Quran 604 halaman terdiri dari kurang lebih 302 lembar kertas.'
                    ]
                ],
                [
                    '@type' => 'Question',
                    'name' => 'Bagaimana cara membaca Al-Quran per halaman di IndoQuran?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Anda dapat memilih langsung halaman 1 sampai 604 di IndoQuran. Setiap halaman menyajikan ayat lengkap berurutan dengan teks Arab berharakat, transliterasi latin, terjemahan Indonesia, serta pemutar audio murottal.'
                    ]
                ]
            ]
        ];
    }

    /**
     * Generate structured data (Article + FAQPage) for specific Ayah pages
     */
    public static function generateAyahStructuredData(Surah $surah, Ayah $ayah): array
    {
        $baseUrl = config('app.url');
        $surahNumber = $surah->number;
        $ayahNumber = $ayah->ayah_number;
        $headline = "Surat {$surah->name_latin} Ayat {$ayahNumber} (QS {$surahNumber}:{$ayahNumber}) - Teks Arab, Latin & Arti";

        return [
            [
                '@context' => 'https://schema.org',
                '@type' => 'Article',
                'headline' => $headline,
                'description' => "Baca Surat {$surah->name_latin} Ayat {$ayahNumber} lengkap teks Arab berharakat, transliterasi latin, terjemahan bahasa Indonesia, audio murottal, Juz {$ayah->juz} Halaman {$ayah->page}.",
                'author' => [
                    '@type' => 'Organization',
                    'name' => 'IndoQuran',
                    'url' => $baseUrl
                ],
                'publisher' => [
                    '@type' => 'Organization',
                    'name' => 'IndoQuran',
                    'logo' => [
                        '@type' => 'ImageObject',
                        'url' => "{$baseUrl}/android-chrome-512x512.png"
                    ]
                ],
                'datePublished' => '2025-01-01T00:00:00Z',
                'dateModified' => now()->toISOString(),
                'mainEntityOfPage' => [
                    '@type' => 'WebPage',
                    '@id' => "{$baseUrl}/surah/{$surahNumber}/{$ayahNumber}"
                ],
                'inLanguage' => ['id', 'ar']
            ],
            [
                '@context' => 'https://schema.org',
                '@type' => 'FAQPage',
                'mainEntity' => [
                    [
                        '@type' => 'Question',
                        'name' => "Bagaimana bacaan teks Arab dan latin Surat {$surah->name_latin} Ayat {$ayahNumber}?",
                        'acceptedAnswer' => [
                            '@type' => 'Answer',
                            'text' => "Teks Arab: {$ayah->text_arabic}\n\nTransliterasi latin: {$ayah->text_latin}"
                        ]
                    ],
                    [
                        '@type' => 'Question',
                        'name' => "Apa arti terjemahan Surat {$surah->name_latin} Ayat {$ayahNumber}?",
                        'acceptedAnswer' => [
                            '@type' => 'Answer',
                            'text' => "Artinya: \"{$ayah->text_indonesian}\" (QS. {$surah->name_latin}: {$ayahNumber}). Terjemahan standar resmi Kementerian Agama Republik Indonesia (Kemenag)."
                        ]
                    ],
                    [
                        '@type' => 'Question',
                        'name' => "Surat {$surah->name_latin} Ayat {$ayahNumber} terdapat di Juz dan Halaman berapa?",
                        'acceptedAnswer' => [
                            '@type' => 'Answer',
                            'text' => "Surat {$surah->name_latin} ayat {$ayahNumber} terdapat pada Juz {$ayah->juz} dan Halaman {$ayah->page} mushaf Al-Quran."
                        ]
                    ]
                ]
            ]
        ];
    }
}

