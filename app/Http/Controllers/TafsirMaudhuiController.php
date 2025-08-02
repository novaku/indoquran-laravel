<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TafsirMaudhuiTopic;
use Illuminate\Support\Facades\Cache;

class TafsirMaudhuiController extends Controller
{
    /**
     * Display the tafsir maudhui page
     */
    public function index()
    {
        // Get all active topics with their verses from database
        $topics = Cache::remember('tafsir_maudhui_all_topics', 3600, function () {
            return TafsirMaudhuiTopic::active()
                ->ordered()
                ->with(['verses' => function ($query) {
                    $query->ordered();
                }])
                ->get()
                ->map(function ($topic) {
                    return [
                        'topic' => $topic->topic,
                        'description' => $topic->description,
                        'verses' => $topic->verses->map(function ($verse) {
                            return [
                                'surah' => $verse->surah_number,
                                'ayah' => $verse->ayah_number
                            ];
                        })->toArray()
                    ];
                })
                ->toArray();
        });

        $tafsirData = ['topics' => $topics];
        
        // SEO data for this page
        $seoData = [
            'metaTitle' => 'Tafsir Maudhui - Topik-topik dalam Al-Quran | IndoQuran',
            'metaDescription' => 'Jelajahi topik-topik penting dalam Al-Quran melalui pendekatan tafsir maudhui. Temukan ayat-ayat Al-Quran berdasarkan tema seperti akidah, ibadah, akhlak, muamalah, dan banyak lagi.',
            'metaKeywords' => 'tafsir maudhui, topik quran, tema al quran, tafsir tematik, akidah islam, ibadah islam, akhlak islam, muamalah islam, indoquran',
            'canonicalUrl' => url('/tafsir-maudhui'),
            'ogImage' => url('/android-chrome-512x512.png'),
            'ogType' => 'website'
        ];
        
        return view('tafsir-maudhui', compact('tafsirData', 'seoData'));
    }
    
    /**
     * Get tafsir data as JSON API
     */
    public function api()
    {
        try {
            // Get all active topics with their verses from database with caching
            $topics = Cache::remember('tafsir_maudhui_api_topics', 3600, function () {
                return TafsirMaudhuiTopic::active()
                    ->ordered()
                    ->with(['verses' => function ($query) {
                        $query->ordered();
                    }])
                    ->get()
                    ->map(function ($topic) {
                        return [
                            'topic' => $topic->topic,
                            'description' => $topic->description,
                            'slug' => $topic->slug,
                            'verses' => $topic->verses->map(function ($verse) {
                                return [
                                    'surah' => $verse->surah_number,
                                    'ayah' => $verse->ayah_number
                                ];
                            })->toArray()
                        ];
                    })
                    ->toArray();
            });

            return response()->json(['topics' => $topics]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch tafsir data',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
    
    /**
     * Search topics by keyword
     */
    public function search(Request $request)
    {
        $keyword = $request->get('q', '');
        
        if (empty($keyword)) {
            return response()->json(['topics' => [], 'total' => 0]);
        }

        try {
            // Search in database with caching
            $cacheKey = 'tafsir_maudhui_search_' . md5($keyword);
            
            $results = Cache::remember($cacheKey, 1800, function () use ($keyword) {
                return TafsirMaudhuiTopic::active()
                    ->search($keyword)
                    ->ordered()
                    ->with(['verses' => function ($query) {
                        $query->ordered();
                    }])
                    ->get()
                    ->map(function ($topic) {
                        return [
                            'topic' => $topic->topic,
                            'description' => $topic->description,
                            'slug' => $topic->slug,
                            'verses' => $topic->verses->map(function ($verse) {
                                return [
                                    'surah' => $verse->surah_number,
                                    'ayah' => $verse->ayah_number
                                ];
                            })->toArray()
                        ];
                    })
                    ->toArray();
            });

            return response()->json([
                'topics' => $results,
                'total' => count($results)
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Search failed',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get single topic by slug
     */
    public function show($slug)
    {
        try {
            $topic = Cache::remember("tafsir_maudhui_topic_{$slug}", 3600, function () use ($slug) {
                return TafsirMaudhuiTopic::active()
                    ->where('slug', $slug)
                    ->with(['verses' => function ($query) {
                        $query->ordered();
                    }])
                    ->first();
            });

            if (!$topic) {
                return response()->json(['error' => 'Topic not found'], 404);
            }

            $topicData = [
                'topic' => $topic->topic,
                'description' => $topic->description,
                'slug' => $topic->slug,
                'verses' => $topic->verses->map(function ($verse) {
                    return [
                        'surah' => $verse->surah_number,
                        'ayah' => $verse->ayah_number
                    ];
                })->toArray()
            ];

            return response()->json($topicData);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch topic',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Clear cache (for admin use)
     */
    public function clearCache()
    {
        $keys = [
            'tafsir_maudhui_all_topics',
            'tafsir_maudhui_api_topics'
        ];

        foreach ($keys as $key) {
            Cache::forget($key);
        }

        // Clear search cache with pattern
        Cache::flush(); // Note: This clears all cache. In production, you might want to be more selective.

        return response()->json(['message' => 'Cache cleared successfully']);
    }
}
