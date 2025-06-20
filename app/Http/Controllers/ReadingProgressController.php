<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\UserReadingProgress;
use App\Models\Surah;
use App\Models\Ayah;

class ReadingProgressController extends Controller
{
    /**
     * Get the current user's reading progress.
     */
    public function getProgress(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $progress = UserReadingProgress::where('user_id', $user->id)
                                      ->with(['surah', 'ayah'])
                                      ->first();

        if (!$progress) {
            return response()->json([
                'status' => 'success',
                'data' => null,
                'message' => 'No reading progress found'
            ]);
        }

        // Get the specific ayah with full details
        $ayah = Ayah::where('surah_number', $progress->surah_number)
                   ->where('ayah_number', $progress->ayah_number)
                   ->first();

        // Get surah details
        $surah = Surah::where('number', $progress->surah_number)->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'surah_number' => $progress->surah_number,
                'ayah_number' => $progress->ayah_number,
                'last_read_at' => $progress->last_read_at,
                'surah' => $surah ? [
                    'number' => $surah->number,
                    'name_indonesian' => $surah->name_indonesian,
                    'name_arabic' => $surah->name_arabic,
                    'name_latin' => $surah->name_latin,
                    'name_english' => $surah->name_latin, // For compatibility
                    'verses_count' => $surah->total_ayahs,
                    'revelation_place' => ucfirst($surah->revelation_place),
                ] : null,
                'ayah' => $ayah ? [
                    'id' => $ayah->id,
                    'number' => $ayah->ayah_number,
                    'text_arabic' => $ayah->text_arabic,
                    'text_indonesian' => $ayah->text_indonesian,
                    'text_latin' => $ayah->text_latin,
                ] : null,
            ]
        ]);
    }

    /**
     * Update the user's reading progress.
     */
    public function updateProgress(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $request->validate([
            'surah_number' => 'required|integer|min:1|max:114',
            'ayah_number' => 'required|integer|min:1',
        ]);

        $surahNumber = $request->surah_number;
        $ayahNumber = $request->ayah_number;

        // Validate that the surah exists
        $surah = Surah::where('number', $surahNumber)->first();
        if (!$surah) {
            return response()->json([
                'status' => 'error',
                'message' => 'Surah not found'
            ], 404);
        }

        // Validate that the ayah exists within the surah
        if ($ayahNumber > $surah->total_ayahs) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ayah number exceeds surah length'
            ], 400);
        }

        // Validate that the ayah exists in the database
        $ayah = Ayah::where('surah_number', $surahNumber)
                   ->where('ayah_number', $ayahNumber)
                   ->first();

        if (!$ayah) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ayah not found in database'
            ], 404);
        }

        // Update or create reading progress
        $progress = UserReadingProgress::updateOrCreate(
            ['user_id' => $user->id],
            [
                'surah_number' => $surahNumber,
                'ayah_number' => $ayahNumber,
                'last_read_at' => now(),
            ]
        );

        return response()->json([
            'status' => 'success',
            'data' => [
                'surah_number' => $progress->surah_number,
                'ayah_number' => $progress->ayah_number,
                'last_read_at' => $progress->last_read_at,
            ],
            'message' => 'Reading progress updated successfully'
        ]);
    }

    /**
     * Get reading statistics for the user.
     */
    public function getStats(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $progress = UserReadingProgress::where('user_id', $user->id)->first();
        
        if (!$progress) {
            return response()->json([
                'status' => 'success',
                'data' => [
                    'progress_percentage' => 0,
                    'total_surahs' => 114,
                    'total_ayahs' => 6236, // Total ayahs in Quran
                    'ayahs_read' => 0,
                    'current_surah' => null,
                    'last_read_days_ago' => null,
                ]
            ]);
        }

        // Calculate total ayahs read (rough estimation)
        $totalAyahsRead = 0;
        
        // Count all ayahs from completed surahs
        if ($progress->surah_number > 1) {
            $completedSurahs = Surah::where('number', '<', $progress->surah_number)->get();
            $totalAyahsRead = $completedSurahs->sum('total_ayahs');
        }
        
        // Add ayahs from current surah
        $totalAyahsRead += $progress->ayah_number;

        $progressPercentage = ($totalAyahsRead / 6236) * 100;

        $lastReadDaysAgo = $progress->last_read_at->diffInDays(now());

        return response()->json([
            'status' => 'success',
            'data' => [
                'progress_percentage' => round($progressPercentage, 2),
                'total_surahs' => 114,
                'total_ayahs' => 6236,
                'ayahs_read' => $totalAyahsRead,
                'current_surah' => $progress->surah_number,
                'current_ayah' => $progress->ayah_number,
                'last_read_days_ago' => $lastReadDaysAgo,
                'last_read_at' => $progress->last_read_at,
            ]
        ]);
    }
}
