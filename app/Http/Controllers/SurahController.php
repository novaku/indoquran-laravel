<?php

namespace App\Http\Controllers;

use App\Models\Surah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SurahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cacheKey = 'surahs.all';
        $cacheDuration = 60 * 24; // 1 day in minutes

        // Use cache in production, direct DB in local
        $surahs = app()->environment('production')
            ? Cache::remember($cacheKey, $cacheDuration, function () {
                return Surah::orderBy('number', 'asc')->get();
            })
            : Surah::orderBy('number', 'asc')->get();

        if (request()->wantsJson()) {
            return response()->json($surahs);
        }

        return view('surahs.index', compact('surahs'));
    }

    /**
     * Display the specified resource.
     */
    public function show(string $number)
    {
        $cacheKey = 'surah.' . $number;
        $cacheDuration = 60 * 24; // 1 day in minutes

        // Use cache in production, direct DB in local
        $surah = app()->environment('production')
            ? Cache::remember($cacheKey, $cacheDuration, function () use ($number) {
                return Surah::with('ayahs')->where('number', $number)->firstOrFail();
            })
            : Surah::with('ayahs')->where('number', $number)->firstOrFail();

        // Make sure the ayahs collection is populated
        if (!$surah->relationLoaded('ayahs')) {
            $surah->load('ayahs');
        }

        // Verify that ayahs are loaded and match the total_ayahs value
        if ($surah->ayahs->count() != $surah->total_ayahs) {
            // Log or debug this discrepancy if needed
            // For now, just ensure we have the correct count displayed
            $actualCount = $surah->ayahs->count();
            if ($actualCount > 0) {
                $surah->total_ayahs = $actualCount;
            }
        }

        if (request()->wantsJson()) {
            return response()->json($surah);
        }

        return view('surahs.show', compact('surah'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
