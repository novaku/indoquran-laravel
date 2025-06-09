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
     * @param string|int $number
     * @return JsonResponse
     */
    public function getSurah($number): JsonResponse
    {
        // First check if the parameter is actually a valid number
        if (!is_numeric($number)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid surah number format'
            ], 400);
        }
        
        // Convert $number to integer to handle string input from routes
        $surahNumber = (int) $number;
        
        // Verify that the surah number is in valid range (1-114)
        if ($surahNumber < 1 || $surahNumber > 114) {
            return response()->json([
                'status' => 'error',
                'message' => 'Surah number must be between 1 and 114'
            ], 400);
        }
        
        $surah = $this->quranCache->getSurah($surahNumber);
        
        if (!$surah) {
            return response()->json([
                'status' => 'error',
                'message' => 'Surah not found'
            ], 404);
        }
        
        $ayahs = $this->quranCache->getSurahAyahs($surahNumber);
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'surah' => $surah,
                'ayahs' => $ayahs
            ]
        ]);
    }

    /**
     * Get surah metadata only (without ayahs)
     * 
     * @param string|int $number
     * @return JsonResponse
     */
    public function getSurahMetadata($number): JsonResponse
    {
        // First check if the parameter is actually a valid number
        if (!is_numeric($number)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid surah number format'
            ], 400);
        }
        
        // Convert $number to integer to handle string input from routes
        $surahNumber = (int) $number;
        
        // Verify that the surah number is in valid range (1-114)
        if ($surahNumber < 1 || $surahNumber > 114) {
            return response()->json([
                'status' => 'error',
                'message' => 'Surah number must be between 1 and 114'
            ], 400);
        }
        
        $surah = $this->quranCache->getSurah($surahNumber);
        
        if (!$surah) {
            return response()->json([
                'status' => 'error',
                'message' => 'Surah not found'
            ], 404);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $surah
        ]);
    }

    /**
     * Get a specific ayah
     * 
     * @param string|int $surahNumber
     * @param string|int $ayahNumber
     * @return JsonResponse
     */
    public function getAyah($surahNumber, $ayahNumber): JsonResponse
    {
        // Validate surah number
        if (!is_numeric($surahNumber)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid surah number format'
            ], 400);
        }
        
        // Validate ayah number
        if (!is_numeric($ayahNumber)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid ayah number format'
            ], 400);
        }
        
        // Convert parameters to integers to handle string input from routes
        $surahNum = (int) $surahNumber;
        $ayahNum = (int) $ayahNumber;
        
        // Verify that the surah number is in valid range (1-114)
        if ($surahNum < 1 || $surahNum > 114) {
            return response()->json([
                'status' => 'error',
                'message' => 'Surah number must be between 1 and 114'
            ], 400);
        }
        
        $ayah = $this->quranCache->getAyah($surahNum, $ayahNum);
        
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
