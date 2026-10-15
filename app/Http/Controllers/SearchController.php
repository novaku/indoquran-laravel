<?php

namespace App\Http\Controllers;

use App\Models\Ayah;
use App\Services\SurahSearchService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

class SearchController extends Controller
{
    protected SurahSearchService $surahSearchService;

    public function __construct(SurahSearchService $surahSearchService)
    {
        $this->surahSearchService = $surahSearchService;
    }
    /**
     * Search for ayahs based on Indonesian text.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Contracts\View\View
     */
    public function search(Request $request): View
    {
        $query = $request->input('q');
        $exact = $request->boolean('exact');
        
        if (empty($query)) {
            return view('search.index');
        }
        
        // Using the custom scope we defined in Ayah model
        $resultsQuery = Ayah::query()->with('surah');
        $resultsQuery->searchIndonesianText($query);

        $results = $resultsQuery->paginate(20)
            ->appends(['q' => $query, 'exact' => $exact ? '1' : '0']);
        
        return view('search.results', compact('results', 'query'));
    }
    
    /**
     * API search for ayahs based on Indonesian text.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiSearch(Request $request): JsonResponse
    {
        $query = $request->input('q');
        $perPage = (int)$request->input('per_page', 10); // Default to 10 items per page, respect the client preference
        $page = (int)$request->input('page', 1); // Get current page
        $exact = $request->boolean('exact');
        
        // Validate per_page to reasonable limits
        $perPage = max(1, min($perPage, 50)); // Between 1 and 50
        
        if (empty($query)) {
            return response()->json([
                'status' => 'error',
                'message' => 'No search query provided',
                'data' => [],
                'pagination' => [
                    'total' => 0,
                    'per_page' => $perPage,
                    'current_page' => $page,
                    'last_page' => 0,
                    'from' => 0,
                    'to' => 0
                ]
            ]);
        }
        
        // Using the custom scope we defined in Ayah model
        $resultsQuery = Ayah::query()->with('surah');
        $resultsQuery->searchIndonesianText($query);
        
        // Add ordering for consistent pagination results
        $resultsQuery->orderBy('surah_number')->orderBy('ayah_number');
        
        $results = $resultsQuery->paginate($perPage, ['*'], 'page', $page)
            ->appends(['q' => $query, 'per_page' => $perPage, 'exact' => $exact ? '1' : '0']);
        
        $surahMatches = $this->surahSearchService->search($query);

        // Format the response in a consistent way
        return response()->json([
            'status' => 'success',
            'message' => 'Search results found',
            'query' => [
                'text' => $query,
                'exact' => $exact,
                'search_mode' => $exact ? 'EXACT' : 'AND'
            ],
            'surah_matches' => $surahMatches,
            'data' => $results->items(),
            'pagination' => [
                'total' => $results->total(),
                'per_page' => $results->perPage(),
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'from' => $results->firstItem() ?: 0,
                'to' => $results->lastItem() ?: 0
            ]
        ]);
    }
}
