
<?php

return [

    /*

    |--------------------------------------------------------------------------

    | Cache Time-To-Live (TTL) Settings

    |--------------------------------------------------------------------------

    |

    | Define cache duration in seconds for different types of Quran data.

    |

    */

    'ttl' => [

        'quran_data' => env('QURAN_CACHE_TTL', 86400), // 24 hours

        'search_results' => env('SEARCH_CACHE_TTL', 3600), // 1 hour

        'user_preferences' => env('USER_CACHE_TTL', 7200), // 2 hours

    ],



    /*

    |--------------------------------------------------------------------------

    | Cache Key Prefixes

    |--------------------------------------------------------------------------

    |

    | Prefixes for different types of cached data.

    |

    */

    'prefixes' => [

        'surahs' => 'quran:surahs',

        'surah' => 'quran:surah:',

        'ayahs' => 'quran:ayahs:',

        'ayah' => 'quran:ayah:',

        'search' => 'quran:search:',

        'user_bookmarks' => 'user:bookmarks:',

        'user_reading_progress' => 'user:progress:',

    ],



    /*

    |--------------------------------------------------------------------------

    | Popular Surahs for Cache Warm-up

    |--------------------------------------------------------------------------

    |

    | Surah numbers to preload when warming up the cache.

    |

    */

    'popular_surahs' => [

        1,   // Al-Fatiha

        2,   // Al-Baqarah

        18,  // Al-Kahf

        36,  // Yasin

        55,  // Ar-Rahman

        67,  // Al-Mulk

        112, // Al-Ikhlas

        113, // Al-Falaq

        114, // An-Nas

    ],



    /*

    |--------------------------------------------------------------------------

    | Search Configuration

    |--------------------------------------------------------------------------

    */

    'max_search_results' => env('MAX_SEARCH_RESULTS', 50),



    /*

    |--------------------------------------------------------------------------

    | Cache Warm-up on Boot

    |--------------------------------------------------------------------------

    */

    'warm_cache_on_boot' => env('QURAN_WARM_CACHE_ON_BOOT', false),



    /*
    |--------------------------------------------------------------------------
    | Detailed Logging
    |--------------------------------------------------------------------------
    |
    | Enable detailed logging for cache operations (useful for debugging).
    |
    */
    'detailed_logging' => (bool) env('QURAN_CACHE_DETAILED_LOGGING', false),
];

