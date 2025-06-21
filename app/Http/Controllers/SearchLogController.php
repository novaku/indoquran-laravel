<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SearchTerm;
use Illuminate\Support\Facades\Auth;

class SearchLogController extends Controller
{
    /**
     * Log search term ke database (tanpa user_id)
     */
    public function logSearch(Request $request)
    {
        $request->validate([
            'term' => 'required|string|max:255',
        ]);

        $term = $request->input('term');
        $userIp = $request->ip();

        // Record search term tanpa user_id
        $searchTerm = SearchTerm::recordSearch($term, $userIp);

        return response()->json([
            'status' => 'success',
            'message' => 'Search term logged successfully',
            'data' => $searchTerm
        ]);
    }

    /**
     * Mendapatkan popular searches
     */
    public function getPopularSearches(Request $request)
    {
        $limit = $request->input('limit', 6);
        $popularSearches = SearchTerm::getPopularSearches($limit);

        return response()->json([
            'status' => 'success',
            'data' => $popularSearches
        ]);
    }

    /**
     * Mendapatkan search history berdasarkan IP (mengganti user history)
     */
    public function getSearchHistoryByIp(Request $request)
    {
        $limit = $request->input('limit', 10);
        $userIp = $request->ip();

        $searchHistory = SearchTerm::forIp($userIp)
                                  ->orderBy('updated_at', 'desc')
                                  ->limit($limit)
                                  ->get(['term', 'search_count', 'updated_at']);

        return response()->json([
            'status' => 'success',
            'data' => $searchHistory
        ]);
    }
}
