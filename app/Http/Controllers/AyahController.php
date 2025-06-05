<?php

namespace App\Http\Controllers;

use App\Models\Ayah;
use App\Models\Surah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AyahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $surahNumber = $request->query('surah');
        $juz = $request->query('juz');
        $page = $request->query('page');

        $query = Ayah::query();

        if ($surahNumber) {
            $query->where('surah_number', $surahNumber);
        }

        if ($juz) {
            $query->where('juz', $juz);
        }

        if ($page) {
            $query->where('page', $page);
        }

        $ayahs = $query->with('surah')->paginate(20);

        return response()->json($ayahs);
    }
    
    /**
     * Get ayahs for a specific surah.
     */
    public function bySurah(string $surahNumber)
    {
        $cacheKey = 'surah.' . $surahNumber . '.ayahs';
        $cacheDuration = 60 * 24; // 1 day in minutes

        // Use cache in production, direct DB in local
        $ayahs = app()->environment('production')
            ? Cache::remember($cacheKey, $cacheDuration, function () use ($surahNumber) {
                return Ayah::where('surah_number', $surahNumber)
                          ->orderBy('ayah_number', 'asc')
                          ->get();
            })
            : Ayah::where('surah_number', $surahNumber)
                  ->orderBy('ayah_number', 'asc')
                  ->get();

        if (request()->wantsJson()) {
            return response()->json($ayahs);
        }

        $surah = Surah::where('number', $surahNumber)->firstOrFail();
        return response()->json([
            'ayahs' => $ayahs,
            'surah' => $surah
        ]);
    }
    
    /**
     * Get ayah by surah number and ayah number.
     */
    public function byPosition(string $surahNumber, string $ayahNumber)
    {
        $ayah = Ayah::where('surah_number', $surahNumber)
                     ->where('ayah_number', $ayahNumber)
                     ->with('surah')
                     ->firstOrFail();

        return response()->json($ayah);
    }
    
    /**
     * Display the specified resource.
     */
    public function show(string $surahNumber, string $ayahNumber)
    {
        $cacheKey = "ayah.{$surahNumber}.{$ayahNumber}";
        $cacheDuration = 60 * 24; // 1 day in minutes

        // Use cache in production, direct DB in local
        $ayah = app()->environment('production')
            ? Cache::remember($cacheKey, $cacheDuration, function () use ($surahNumber, $ayahNumber) {
                return Ayah::where('surah_number', $surahNumber)
                    ->where('ayah_number', $ayahNumber)
                    ->with('surah')
                    ->firstOrFail();
            })
            : Ayah::where('surah_number', $surahNumber)
                ->where('ayah_number', $ayahNumber)
                ->with('surah')
                ->firstOrFail();

        return view('ayahs.show', compact('ayah'));
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
