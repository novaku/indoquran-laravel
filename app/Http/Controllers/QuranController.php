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
     * Get random surahs for popular section
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getRandomSurahs(Request $request): JsonResponse
    {
        $count = $request->query('count', 6); // Default 6 surahs
        $count = min(max((int)$count, 1), 20); // Limit between 1-20
        
        $allSurahs = $this->quranCache->getAllSurahs()->toArray();
        
        if (empty($allSurahs)) {
            return response()->json([
                'status' => 'error',
                'message' => 'No surahs available'
            ], 404);
        }
        
        // Mix of popular surahs and random ones
        $popularSurahs = [1, 2, 18, 36, 55, 67, 112, 113, 114]; // Al-Fatihah, Al-Baqarah, Al-Kahf, Ya-Sin, Ar-Rahman, Al-Mulk, Al-Ikhlas, Al-Falaq, An-Nas
        $randomSurahs = [];
        
        // First, try to include some popular surahs
        $popularAvailable = array_filter($allSurahs, function($surah) use ($popularSurahs) {
            return in_array($surah['number'], $popularSurahs);
        });
        
        // Shuffle and take some popular ones
        $popularAvailable = array_values($popularAvailable);
        shuffle($popularAvailable);
        $selectedCount = min(ceil($count * 0.6), count($popularAvailable)); // 60% popular surahs
        $randomSurahs = array_slice($popularAvailable, 0, $selectedCount);
        
        // Fill the rest with random surahs
        $remaining = $count - count($randomSurahs);
        if ($remaining > 0) {
            $otherSurahs = array_filter($allSurahs, function($surah) use ($randomSurahs) {
                return !in_array($surah['number'], array_column($randomSurahs, 'number'));
            });
            
            $otherSurahs = array_values($otherSurahs);
            shuffle($otherSurahs);
            $randomSurahs = array_merge($randomSurahs, array_slice($otherSurahs, 0, $remaining));
        }
        
        // Shuffle the final result
        shuffle($randomSurahs);
        
        return response()->json([
            'status' => 'success',
            'data' => $randomSurahs
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
     * Search for ayahs based on Indonesian text.
     * 
     * Search is performed as an AND operation between words.
     * For example, a search for "anak allah" will find ayahs that contain both "anak" AND "allah".
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function searchAyahs(Request $request): JsonResponse
    {
        $query = $request->input('q');
        $perPage = (int)$request->input('per_page', 10);
        $page = (int)$request->input('page', 1);
        $revelationPlace = $request->input('revelation_place');
        
        // Validate per_page to reasonable limits
        $perPage = max(1, min($perPage, 50)); // Between 1 and 50
        
        if (!$query) {
            return response()->json([
                'status' => 'error',
                'message' => 'Search query is required',
                'pagination' => [
                    'total' => 0,
                    'per_page' => $perPage,
                    'current_page' => $page,
                    'last_page' => 0,
                    'from' => 0,
                    'to' => 0
                ]
            ], 400);
        }
        
        // Build the search query using Indonesian text
        $searchQuery = Ayah::with('surah:number,name_indonesian,name_arabic,name_latin,revelation_place');
        $searchQuery->searchIndonesianText($query);
        
        // Add revelation place filter if provided
        if ($revelationPlace && in_array($revelationPlace, ['makkah', 'madinah'])) {
            $searchQuery->whereHas('surah', function ($query) use ($revelationPlace) {
                $query->where('revelation_place', $revelationPlace);
            });
        }
        
        // Add ordering for consistent pagination
        $searchQuery->orderBy('surah_number')->orderBy('ayah_number');
        
        // Apply pagination with proper appending of query parameters for pagination links
        $paginatedResults = $searchQuery->paginate($perPage, ['*'], 'page', $page)
                                     ->appends($request->only(['q', 'per_page', 'revelation_place']));
        
        return response()->json([
            'status' => 'success',
            'query' => [
                'text' => $query,
                'revelation_place' => $revelationPlace,
                'search_mode' => 'AND' // Indicating that search uses AND between terms
            ],
            'data' => $paginatedResults->items(),
            'pagination' => [
                'total' => $paginatedResults->total(),
                'per_page' => $paginatedResults->perPage(),
                'current_page' => $paginatedResults->currentPage(),
                'last_page' => $paginatedResults->lastPage(),
                'from' => $paginatedResults->firstItem() ?: 0,
                'to' => $paginatedResults->lastItem() ?: 0
            ]
        ]);
    }

    /**
     * Get all available Juz numbers
     * 
     * @return JsonResponse
     */
    public function getAllJuz(): JsonResponse
    {
        // Get distinct juz numbers from ayahs table
        $juzNumbers = Ayah::select('juz')
            ->distinct()
            ->orderBy('juz')
            ->pluck('juz')
            ->filter() // Remove null values
            ->values();
        
        return response()->json([
            'status' => 'success',
            'data' => $juzNumbers
        ]);
    }

    /**
     * Get ayahs for a specific Juz
     * 
     * @param string|int $juzNumber
     * @return JsonResponse
     */
    public function getJuz($juzNumber): JsonResponse
    {
        // Validate juz number
        if (!is_numeric($juzNumber)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid juz number format'
            ], 400);
        }
        
        $juzNum = (int) $juzNumber;
        
        // Verify that the juz number is in valid range (1-30)
        if ($juzNum < 1 || $juzNum > 30) {
            return response()->json([
                'status' => 'error',
                'message' => 'Juz number must be between 1 and 30'
            ], 400);
        }
        
        // Get all ayahs for this juz with surah information
        $ayahs = Ayah::where('juz', $juzNum)
            ->with('surah:number,name_indonesian,name_arabic,name_latin')
            ->orderBy('surah_number')
            ->orderBy('ayah_number')
            ->get();
        
        if ($ayahs->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Juz not found'
            ], 404);
        }
        
        // Group ayahs by surah for better organization
        $groupedAyahs = $ayahs->groupBy('surah_number');
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'juz_number' => $juzNum,
                'total_ayahs' => $ayahs->count(),
                'surahs' => $groupedAyahs->map(function ($surahAyahs) {
                    $firstAyah = $surahAyahs->first();
                    return [
                        'surah' => $firstAyah->surah,
                        'ayahs' => $surahAyahs->values()
                    ];
                })->values()
            ]
        ]);
    }

    /**
     * Get ayahs for a specific Page
     * 
     * @param string|int $pageNumber
     * @return JsonResponse
     */
    public function getPage($pageNumber): JsonResponse
    {
        // Validate page number
        if (!is_numeric($pageNumber)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid page number format'
            ], 400);
        }
        
        $pageNum = (int) $pageNumber;
        
        // Verify that the page number is in valid range (1-604 for standard Mushaf)
        if ($pageNum < 1 || $pageNum > 604) {
            return response()->json([
                'status' => 'error',
                'message' => 'Page number must be between 1 and 604'
            ], 400);
        }
        
        // Get all ayahs for this page with surah information
        $ayahs = Ayah::where('page', $pageNum)
            ->with('surah:number,name_indonesian,name_arabic,name_latin')
            ->orderBy('surah_number')
            ->orderBy('ayah_number')
            ->get();
        
        if ($ayahs->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Page not found'
            ], 404);
        }
        
        // Group ayahs by surah for better organization
        $groupedAyahs = $ayahs->groupBy('surah_number');
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'page_number' => $pageNum,
                'total_ayahs' => $ayahs->count(),
                'surahs' => $groupedAyahs->map(function ($surahAyahs) {
                    $firstAyah = $surahAyahs->first();
                    return [
                        'surah' => $firstAyah->surah,
                        'ayahs' => $surahAyahs->values()
                    ];
                })->values()
            ]
        ]);
    }

    /**
     * Get all available Page numbers
     * 
     * @return JsonResponse
     */
    public function getAllPages(): JsonResponse
    {
        // Get distinct page numbers from ayahs table
        $pageNumbers = Ayah::select('page')
            ->distinct()
            ->orderBy('page')
            ->pluck('page')
            ->filter() // Remove null values
            ->values();
        
        return response()->json([
            'status' => 'success',
            'data' => $pageNumbers
        ]);
    }
}
