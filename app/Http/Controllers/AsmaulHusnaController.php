<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\AsmaulHusnaName;

class AsmaulHusnaController extends Controller
{
    /**
     * Display the asmaul husna page
     */
    public function index()
    {
        // Get all active names with verses from database
        $asmaulHusnaData = Cache::remember('asmaul_husna_all_names', 3600, function () {
            return AsmaulHusnaName::active()
                ->with('verses')
                ->ordered()
                ->get()
                ->map(function ($name) {
                    return [
                        'id' => $name->original_id,
                        'arabic' => $name->arabic,
                        'latin' => $name->latin,
                        'meaning' => $name->meaning,
                        'description' => $name->description,
                        'verses' => $name->verses->map(function ($verse) {
                            return [
                                'surah' => $verse->surah_number,
                                'ayah' => $verse->ayah_number,
                                'text' => $verse->text
                            ];
                        })->toArray()
                    ];
                })
                ->toArray();
        });

        // SEO data for this page
        $seoData = [
            'metaTitle' => '99 Asmaul Husna - Nama-nama Indah Allah SWT | IndoQuran',
            'metaDescription' => 'Pelajari dan renungkan 99 Asmaul Husna, nama-nama indah Allah SWT dengan makna dan penjelasan lengkap dalam bahasa Indonesia.',
            'metaKeywords' => 'asmaul husna, nama allah, 99 nama allah, sifat allah, islam, doa',
            'canonicalUrl' => url('/asmaul-husna'),
            'ogImage' => url('/android-chrome-512x512.png'),
            'ogType' => 'website'
        ];
        
        return view('asmaul-husna', compact('asmaulHusnaData', 'seoData'));
    }
    
    /**
     * Get asmaul husna data as JSON API
     */
    public function api()
    {
        try {
            $asmaulHusnaData = Cache::remember('asmaul_husna_api_data', 3600, function () {
                return AsmaulHusnaName::active()
                    ->with('verses')
                    ->ordered()
                    ->get()
                    ->map(function ($name) {
                        return [
                            'id' => $name->original_id,
                            'arabic' => $name->arabic,
                            'latin' => $name->latin,
                            'meaning' => $name->meaning,
                            'description' => $name->description,
                            'verses' => $name->verses->map(function ($verse) {
                                return [
                                    'surah' => $verse->surah_number,
                                    'ayah' => $verse->ayah_number,
                                    'text' => $verse->text
                                ];
                            })->toArray()
                        ];
                    })
                    ->toArray();
            });

            return response()->json($asmaulHusnaData);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching Asmaul Husna data',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Search names by keyword
     */
    public function search(Request $request)
    {
        $keyword = $request->get('q', '');
        
        if (empty($keyword)) {
            return response()->json([
                'names' => [],
                'total' => 0
            ]);
        }

        try {
            $cacheKey = 'asmaul_husna_search_' . md5(strtolower($keyword));
            
            $searchResults = Cache::remember($cacheKey, 1800, function () use ($keyword) {
                return AsmaulHusnaName::active()
                    ->with('verses')
                    ->search($keyword)
                    ->ordered()
                    ->get()
                    ->map(function ($name) {
                        return [
                            'id' => $name->original_id,
                            'arabic' => $name->arabic,
                            'latin' => $name->latin,
                            'meaning' => $name->meaning,
                            'description' => $name->description,
                            'verses' => $name->verses->map(function ($verse) {
                                return [
                                    'surah' => $verse->surah_number,
                                    'ayah' => $verse->ayah_number,
                                    'text' => $verse->text
                                ];
                            })->toArray()
                        ];
                    })
                    ->toArray();
            });

            return response()->json([
                'names' => $searchResults,
                'total' => count($searchResults)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error searching Asmaul Husna data',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get single name by slug
     */
    public function show($slug)
    {
        try {
            $cacheKey = 'asmaul_husna_name_' . $slug;
            
            $name = Cache::remember($cacheKey, 3600, function () use ($slug) {
                $name = AsmaulHusnaName::active()
                    ->with('verses')
                    ->where('slug', $slug)
                    ->first();

                if (!$name) {
                    return null;
                }

                return [
                    'id' => $name->original_id,
                    'arabic' => $name->arabic,
                    'latin' => $name->latin,
                    'meaning' => $name->meaning,
                    'description' => $name->description,
                    'verses' => $name->verses->map(function ($verse) {
                        return [
                            'surah' => $verse->surah_number,
                            'ayah' => $verse->ayah_number,
                            'text' => $verse->text
                        ];
                    })->toArray()
                ];
            });

            if (!$name) {
                return response()->json(['error' => 'Name not found'], 404);
            }

            return response()->json($name);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching name data',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Clear asmaul husna cache
     */
    public function clearCache()
    {
        try {
            $cacheKeys = [
                'asmaul_husna_all_names',
                'asmaul_husna_api_data'
            ];

            foreach ($cacheKeys as $key) {
                Cache::forget($key);
            }

            // Clear search cache (pattern-based)
            // Note: This is a simple implementation. For better cache management,
            // consider using cache tags if available in your cache driver
            
            return response()->json([
                'message' => 'Asmaul Husna cache cleared successfully',
                'cleared_keys' => $cacheKeys
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error clearing cache',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
