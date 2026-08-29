<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TafsirMaudhuiTopic;
use Illuminate\Support\Facades\Cache;

class TafsirMaudhuiController extends Controller
{
    /**
     * Display the tafsir maudhui page
     * Note: This returns the main React app container, actual routing handled client-side
     */
    public function index()
    {
        // Return the main SPA container - React Router handles the actual page
        return view('react');
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
            'tafsir_maudhui_api_topics',
            'tafsir_maudhui_popular_topics'
        ];

        foreach ($keys as $key) {
            Cache::forget($key);
        }

        // Clear search cache with pattern
        Cache::flush(); // Note: This clears all cache. In production, you might want to be more selective.

        return response()->json(['message' => 'Cache cleared successfully']);
    }

    /**
     * Get popular/featured tafsir maudhui topics with Redis caching
     */
    public function popular(): \Illuminate\Http\JsonResponse
    {
        try {
            $cacheKey = 'tafsir_maudhui_popular_topics';
            $cacheTtl = 86400; // 24 hours

            $popularTopics = [
                'keluarga' => '👨‍👩‍👧',
                'tauhid' => '✨',
                'sabar' => '🕊️',
                'syukur' => '🌿',
                'doa' => '🤲',
                'akhlak' => '💎',
                'ilmu' => '📚',
                'hari-akhir' => '⏳',
                'al-quran' => '📖',
                'zakat' => '🤝',
                'ibadah' => '🌙',
                'iman' => '⭐',
                'tawakal' => '🌱',
                'persaudaraan' => '👥',
                'pemaafan' => '🤍',
                'pendidikan' => '🎓',
                'hukum' => '⚖️',
                'rezeki' => '💰',
                'shalat' => '🕌',
                'kematian' => '⌛',
                'hari-kiamat' => '⚡',
                'surga' => '🌸',
                'neraka' => '🔥',
                'puasa' => '🌙',
                'haji' => '🕋',
                'pernikahan' => '💍',
                'keadilan' => '⚖️',
                'taubat' => '🌧️',
                'hidayah' => '🌟',
            ];

            $topics = Cache::remember($cacheKey, $cacheTtl, function () use ($popularTopics) {
                $popularSlugs = array_keys($popularTopics);

                $fetched = TafsirMaudhuiTopic::active()
                    ->withCount('verses')
                    ->get();

                $sorted = $fetched->sortBy(function ($topic) use ($popularSlugs) {
                    $index = array_search($topic->slug, $popularSlugs);
                    return $index !== false ? $index : (1000 - $topic->verses_count);
                })->take(10);

                return $sorted->map(function ($topic) use ($popularTopics) {
                    return [
                        'topic' => $topic->topic,
                        'label' => $topic->topic,
                        'slug' => $topic->slug,
                        'description' => $topic->description,
                        'verses_count' => $topic->verses_count,
                        'icon' => $popularTopics[$topic->slug] ?? '📖',
                    ];
                })->values()->toArray();
            });

            return response()->json([
                'status' => 'success',
                'data' => $topics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch popular tafsir topics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get count of tafsir maudhui topics for statistics
     */
    public function count(): \Illuminate\Http\JsonResponse
    {
        try {
            $count = TafsirMaudhuiTopic::active()->count();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'count' => $count
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get tafsir maudhui count',
                'data' => ['count' => 0]
            ], 500);
        }
    }

    /**
     * Get a random tafsir maudhui topic
     */
    public function random(): \Illuminate\Http\JsonResponse
    {
        try {
            $topic = TafsirMaudhuiTopic::active()
                ->with(['verses' => function ($query) {
                    $query->ordered();
                }])
                ->inRandomOrder()
                ->first();

            if (!$topic) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No tafsir maudhui topics available'
                ], 404);
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

            return response()->json([
                'status' => 'success',
                'data' => $topicData
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch random tafsir maudhui',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}

