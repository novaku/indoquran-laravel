<?php

namespace App\Http\Controllers;

use App\Models\Ayah;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Search for ayahs based on Indonesian or English text.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function search(Request $request)
    {
        $query = $request->input('q');
        $language = $request->input('lang', 'indonesian'); // Default to Indonesian
        
        if (empty($query)) {
            return view('search.index');
        }
        
        // Using the custom scope we defined in Ayah model
        $resultsQuery = Ayah::query()->with('surah');
        
        if ($language === 'english') {
            $resultsQuery->searchEnglishText($query);
        } else {
            $resultsQuery->searchIndonesianText($query);
        }
        
        $results = $resultsQuery->paginate(20)
                               ->appends(['q' => $query, 'lang' => $language]);
        
        return view('search.results', compact('results', 'query', 'language'));
    }
    
    /**
     * API search for ayahs based on Indonesian or English text.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiSearch(Request $request)
    {
        $query = $request->input('q');
        $language = $request->input('lang', 'indonesian'); // Default to Indonesian
        
        if (empty($query)) {
            return response()->json([
                'data' => [],
                'message' => 'No search query provided'
            ]);
        }
        
        // Using the custom scope we defined in Ayah model
        $resultsQuery = Ayah::query()->with('surah');
        
        if ($language === 'english') {
            $resultsQuery->searchEnglishText($query);
        } else {
            $resultsQuery->searchIndonesianText($query);
        }
        
        $results = $resultsQuery->paginate(20)
                               ->appends(['q' => $query, 'lang' => $language]);
        
        return response()->json($results);
    }
}
