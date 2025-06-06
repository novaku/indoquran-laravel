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
     * @param string|int $surahNumber
     * @param string|int $ayahNumber
     * @return JsonResponse
     */
    public function getAyah($surahNumber, $ayahNumber): JsonResponse
    {
        // Convert parameters to integers
        $surahNumber = (int) $surahNumber;
        $ayahNumber = (int) $ayahNumber;
        
        // For debugging
        \Log::info('Fetching ayah', ['surah' => $surahNumber, 'ayah' => $ayahNumber]);
        
        $ayah = $this->quranCache->getAyah($surahNumber, $ayahNumber);
        
        if (!$ayah) {
            \Log::warning('Ayah not found', ['surah' => $surahNumber, 'ayah' => $ayahNumber]);
            return response()->json([
                'status' => 'error',
                'message' => 'Ayah not found'
            ], 404);
        }
        
        // Get user-specific bookmark data if user is authenticated
        $bookmarkData = null;
        if (auth()->check()) {
            $user = auth()->user();
            $bookmark = $user->ayahBookmarks()->where('ayah_id', $ayah->id)->first();
            if ($bookmark) {
                $bookmarkData = [
                    'is_bookmarked' => true,
                    'is_favorite' => $bookmark->is_favorite,
                    'notes' => $bookmark->notes,
                    'created_at' => $bookmark->created_at
                ];
            }
        }
        
        // Get the surah info to provide context
        $surah = $this->quranCache->getSurah($surahNumber);
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'ayah' => $ayah,
                'surah' => $surah ? [
                    'number' => $surah->number,
                    'name_arabic' => $surah->name_arabic,
                    'name_latin' => $surah->name_latin,
                    'name_indonesian' => $surah->name_indonesian,
                    'total_ayahs' => $surah->total_ayahs
                ] : null,
                'bookmark' => $bookmarkData,
                'prev' => $ayahNumber > 1 ? [
                    'surah_number' => $surahNumber,
                    'ayah_number' => $ayahNumber - 1
                ] : null,
                'next' => $surah && $ayahNumber < $surah->total_ayahs ? [
                    'surah_number' => $surahNumber,
                    'ayah_number' => $ayahNumber + 1
                ] : ($surah && $ayahNumber == $surah->total_ayahs ? [
                    'surah_number' => $surahNumber + 1,
                    'ayah_number' => 1
                ] : null)
            ]
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
        
        // Get all results without pagination
        $results = $searchQuery->get();
        
        return response()->json([
            'status' => 'success',
            'query' => $query,
            'data' => $results,
            'total' => $results->count()
        ]);
    }
}
