<?php

namespace App\Http\Controllers;

use App\Models\Ayah;
use App\Models\Surah;
use App\Services\QuranCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuranController extends Controller
{
    protected $quranCache;

    public function __construct(QuranCacheService $quranCache)
    {
        $this->quranCache = $quranCache;
    }

    /**
     * Get all surahs
     * 
     * @return JsonResponse
     */
    public function getAllSurahs(): JsonResponse
    {
        $surahs = $this->quranCache->getAllSurahs();
        return response()->json([
            'status' => 'success',
            'data' => $surahs
        ]);
    }

    /**
     * Get a specific surah with its ayahs
     * 
     * @param int $number
     * @return JsonResponse
     */
    public function getSurah(int $number): JsonResponse
    {
        $surah = $this->quranCache->getSurah($number);
        
        if (!$surah) {
            return response()->json([
                'status' => 'error',
                'message' => 'Surah not found'
            ], 404);
        }
        
        $ayahs = $this->quranCache->getSurahAyahs($number);
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'surah' => $surah,
                'ayahs' => $ayahs
            ]
        ]);
    }

    /**
     * Get a specific ayah
     * 
     * @param int $surahNumber
     * @param int $ayahNumber
     * @return JsonResponse
     */
    public function getAyah(int $surahNumber, int $ayahNumber): JsonResponse
    {
        $ayah = $this->quranCache->getAyah($surahNumber, $ayahNumber);
        
        if (!$ayah) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ayah not found'
            ], 404);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $ayah
        ]);
    }

    /**
     * Search ayahs by Indonesian text
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function searchAyahs(Request $request): JsonResponse
    {
        $query = $request->input('q');
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);
        
        if (!$query) {
            return response()->json([
                'status' => 'error',
                'message' => 'Search query is required'
            ], 400);
        }
        
        // Build the search query for Indonesian text
        $searchQuery = Ayah::with('surah:number,name_indonesian,name_arabic,name_latin')
            ->searchIndonesianText($query);
        
        // Add ordering
        $searchQuery->orderBy('surah_number')->orderBy('ayah_number');
        
        // Paginate results
        $results = $searchQuery->paginate($perPage, ['*'], 'page', $page);
        
        return response()->json([
            'status' => 'success',
            'query' => $query,
            'data' => $results->items(),
            'pagination' => [
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
                'from' => $results->firstItem(),
                'to' => $results->lastItem(),
                'has_more_pages' => $results->hasMorePages()
            ]
        ]);
    }
}
