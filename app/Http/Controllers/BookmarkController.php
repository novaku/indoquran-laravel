<?php

namespace App\Http\Controllers;

use App\Models\Ayah;
use App\Models\UserAyahBookmark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookmarkController extends Controller
{
    /**
     * Get user's bookmarks with optional filtering
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $favoritesOnly = $request->query('favorites_only', false);
        
        // Start with the base query
        $query = $user->bookmarkedAyahs()
                     ->with(['surah:number,name_indonesian,name_arabic'])
                     ->orderBy('surah_number', 'asc')
                     ->orderBy('ayah_number', 'asc');
        
        if ($favoritesOnly) {
            $query->wherePivot('is_favorite', true);
        }
        
        // Get the results
        $bookmarks = $query->get();
        
        // Sort the collection by surah_number and ayah_number
        $sortedBookmarks = $bookmarks->sortBy([
            ['surah_number', 'asc'],
            ['ayah_number', 'asc']
        ])->values();
        
        return response()->json([
            'status' => 'success',
            'data' => $sortedBookmarks
        ]);
    }

    /**
     * Toggle bookmark for an ayah
     */
    public function toggle(Request $request, $ayahId)
    {
        $user = Auth::user();
        
        // Validate that the ayah exists
        $ayah = Ayah::findOrFail($ayahId);
        
        $bookmark = UserAyahBookmark::where('user_id', $user->id)
                                  ->where('ayah_id', $ayahId)
                                  ->first();
        
        if ($bookmark) {
            // Remove bookmark
            $bookmark->delete();
            $isBookmarked = false;
            $isFavorite = false;
        } else {
            // Add bookmark
            $bookmark = UserAyahBookmark::create([
                'user_id' => $user->id,
                'ayah_id' => $ayahId,
                'is_favorite' => false
            ]);
            $isBookmarked = true;
            $isFavorite = false;
        }
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'is_bookmarked' => $isBookmarked,
                'is_favorite' => $isFavorite,
                'ayah_id' => $ayahId
            ]
        ]);
    }

    /**
     * Toggle favorite status for a bookmarked ayah
     */
    public function toggleFavorite(Request $request, $ayahId)
    {
        $user = Auth::user();
        
        // Validate that the ayah exists
        $ayah = Ayah::findOrFail($ayahId);
        
        $bookmark = UserAyahBookmark::where('user_id', $user->id)
                                  ->where('ayah_id', $ayahId)
                                  ->first();
        
        if (!$bookmark) {
            // Create bookmark if it doesn't exist and mark as favorite
            $bookmark = UserAyahBookmark::create([
                'user_id' => $user->id,
                'ayah_id' => $ayahId,
                'is_favorite' => true
            ]);
            $isFavorite = true;
            $isBookmarked = true;
        } else {
            // Toggle favorite status
            $bookmark->is_favorite = !$bookmark->is_favorite;
            $bookmark->save();
            $isFavorite = $bookmark->is_favorite;
            $isBookmarked = true;
        }
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'is_bookmarked' => $isBookmarked,
                'is_favorite' => $isFavorite,
                'ayah_id' => $ayahId
            ]
        ]);
    }

    /**
     * Update notes for a bookmark
     */
    public function updateNotes(Request $request, $ayahId)
    {
        $user = Auth::user();
        
        $request->validate([
            'notes' => 'nullable|string|max:1000'
        ]);
        
        $bookmark = UserAyahBookmark::where('user_id', $user->id)
                                  ->where('ayah_id', $ayahId)
                                  ->firstOrFail();
        
        $bookmark->notes = $request->notes;
        $bookmark->save();
        
        return response()->json([
            'status' => 'success',
            'data' => $bookmark
        ]);
    }

    /**
     * Get bookmark status for multiple ayahs
     */
    public function getStatus(Request $request)
    {
        $user = Auth::user();
        $ayahIds = $request->query('ayah_ids', []);
        
        if (!is_array($ayahIds)) {
            $ayahIds = explode(',', $ayahIds);
        }
        
        $bookmarks = UserAyahBookmark::where('user_id', $user->id)
                                   ->whereIn('ayah_id', $ayahIds)
                                   ->get()
                                   ->keyBy('ayah_id');
        
        $statuses = [];
        foreach ($ayahIds as $ayahId) {
            $bookmark = $bookmarks->get($ayahId);
            $statuses[$ayahId] = [
                'is_bookmarked' => $bookmark !== null,
                'is_favorite' => $bookmark ? $bookmark->is_favorite : false,
                'notes' => $bookmark ? $bookmark->notes : null
            ];
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $statuses
        ]);
    }

    /**
     * Toggle bookmark for an ayah using surah and ayah numbers
     */
    public function toggleByNumbers(Request $request, $surahNumber, $ayahNumber)
    {
        $user = Auth::user();
        
        // Find the ayah by surah and ayah numbers
        $ayah = Ayah::where('surah_number', $surahNumber)
                   ->where('ayah_number', $ayahNumber)
                   ->first();
        
        if (!$ayah) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ayah not found'
            ], 404);
        }
        
        $bookmark = UserAyahBookmark::where('user_id', $user->id)
                                  ->where('ayah_id', $ayah->id)
                                  ->first();
        
        if ($bookmark) {
            // Remove bookmark
            $bookmark->delete();
            $isBookmarked = false;
            $isFavorite = false;
        } else {
            // Add bookmark
            $bookmark = UserAyahBookmark::create([
                'user_id' => $user->id,
                'ayah_id' => $ayah->id,
                'is_favorite' => false
            ]);
            $isBookmarked = true;
            $isFavorite = false;
        }
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'is_bookmarked' => $isBookmarked,
                'is_favorite' => $isFavorite,
                'ayah_id' => $ayah->id,
                'surah_number' => $surahNumber,
                'ayah_number' => $ayahNumber
            ]
        ]);
    }
}
