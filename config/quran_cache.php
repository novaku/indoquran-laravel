<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Quran Cache Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains cache-specific settings for the Quran application.
    | You can adjust cache TTL and other cache-related settings here.
    |
    */

    // Cache TTL (Time To Live) in seconds
    'ttl' => [
        'quran_data' => env('QURAN_CACHE_TTL', 86400), // 24 hours for Quran data
        'search_results' => env('SEARCH_CACHE_TTL', 3600), // 1 hour for search results
        'user_preferences' => env('USER_CACHE_TTL', 7200), // 2 hours for user preferences
    ],

    // Cache key prefixes
    'prefixes' => [
        'surahs' => 'quran:surahs',
        'surah' => 'quran:surah:',
        'ayahs' => 'quran:ayahs:',
        'ayah' => 'quran:ayah:',
        'search' => 'quran:search:',
        'user_bookmarks' => 'user:bookmarks:',
        'user_reading_progress' => 'user:progress:',
    ],

    // Enable/disable cache warming on application boot
    'warm_on_boot' => env('QURAN_WARM_CACHE_ON_BOOT', false),

    // Popular surahs to preload during cache warming
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

    // Maximum number of search results to cache
    'max_search_results' => env('MAX_SEARCH_CACHE_RESULTS', 50),

    // Enable detailed cache logging
    'detailed_logging' => env('CACHE_DETAILED_LOGGING', false),

];
