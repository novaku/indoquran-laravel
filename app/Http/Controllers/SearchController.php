<?php

namespace App\Http\Controllers;

use App\Models\Ayah;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Search for ayahs based on Indonesian text.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function search(Request $request)
    {
        $query = $request->input('q');
        
        if (empty($query)) {
            return view('search.index');
        }
        
        // Using the custom scope we defined in Ayah model
        $resultsQuery = Ayah::query()->with('surah');
        $resultsQuery->searchIndonesianText($query);
        
        $results = $resultsQuery->paginate(20)
                               ->appends(['q' => $query]);
        
        return view('search.results', compact('results', 'query'));
    }
    
    /**
     * API search for ayahs based on Indonesian text.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiSearch(Request $request)
    {
        $query = $request->input('q');
        $perPage = (int)$request->input('per_page', 10); // Default to 10 items per page, respect the client preference
        $page = (int)$request->input('page', 1); // Get current page
        
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
                               ->appends(['q' => $query, 'per_page' => $perPage]);
        
        // Format the response in a consistent way
        return response()->json([
            'status' => 'success',
            'message' => 'Search results found',
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
