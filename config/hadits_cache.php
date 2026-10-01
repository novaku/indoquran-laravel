<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Hadits Cache Time-To-Live (TTL) Settings (in seconds)
    |--------------------------------------------------------------------------
    |
    | Define cache duration in seconds for different types of Hadits data.
    | Hadits texts are canonical and immutable, allowing long cache lifetimes.
    |
    */
    'ttl' => [
        'catalog' => env('HADITS_CATALOG_CACHE_TTL', 2592000), // 30 days
        'detail' => env('HADITS_DETAIL_CACHE_TTL', 2592000),   // 30 days (canonical text)
        'kitab_page' => env('HADITS_PAGE_CACHE_TTL', 2592000), // 30 days
        'search' => env('HADITS_SEARCH_CACHE_TTL', 604800),    // 7 days
        'featured' => env('HADITS_FEATURED_CACHE_TTL', 86400), // 24 hours
        'random' => env('HADITS_RANDOM_CACHE_TTL', 3600),      // 1 hour
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Key Prefixes
    |--------------------------------------------------------------------------
    */
    'prefixes' => [
        'catalog' => 'hadits:catalog:',
        'detail' => 'hadits:detail:',
        'kitab' => 'hadits:kitab:',
        'search' => 'hadits:search:',
        'featured' => 'hadits:featured:',
        'random' => 'hadits:random:',
    ],

    /*
    |--------------------------------------------------------------------------
    | Detailed Logging
    |--------------------------------------------------------------------------
    */
    'detailed_logging' => env('HADITS_CACHE_LOGGING', false),
];
