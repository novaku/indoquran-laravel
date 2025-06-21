<?php

namespace App\Services;

use App\Models\Ayah;
use App\Models\Surah;
use Illuminate\Support\Collection;

class QuranCacheService
{
    /**
     * Get all surahs, direct database call (cache disabled)
     *
     * @return Collection
     */
    public function getAllSurahs(): Collection
    {
        return Surah::orderBy('number')->get();
    }

    /**
     * Get a specific surah by number, direct database call (cache disabled)
     *
     * @param int $number
     * @return Surah|null
     */
    public function getSurah(int $number): ?Surah
    {
        return Surah::where('number', $number)->first();
    }

    /**
     * Get all ayahs for a surah, direct database call (cache disabled)
     *
     * @param int $surahNumber
     * @return Collection
     */
    public function getSurahAyahs(int $surahNumber): Collection
    {
        return Ayah::where('surah_number', $surahNumber)
            ->orderBy('ayah_number')
            ->get();
    }

    /**
     * Get a specific ayah, direct database call (cache disabled)
     *
     * @param int|string $surahNumber
     * @param int|string $ayahNumber
     * @return Ayah|null
     */
    public function getAyah($surahNumber, $ayahNumber): ?Ayah
    {
        // Convert parameters to integers
        $surahNumber = (int) $surahNumber;
        $ayahNumber = (int) $ayahNumber;
        
        \Log::info('QuranCacheService::getAyah', ['surah' => $surahNumber, 'ayah' => $ayahNumber]);
        
        $ayah = Ayah::where('surah_number', $surahNumber)
            ->where('ayah_number', $ayahNumber)
            ->first();
            
        if (!$ayah) {
            \Log::warning('Ayah not found in database', ['surah' => $surahNumber, 'ayah' => $ayahNumber]);
        }
        
        return $ayah;
    }

    /**
     * Search ayahs by Indonesian text, direct database call (cache disabled)
     *
     * @param string $query
     * @param int $limit
     * @return Collection
     */
    public function searchAyahs(string $query, int $limit = 20): Collection
    {
        return Ayah::where('text_indonesian', 'like', "%{$query}%")
            ->orderBy('surah_number')
            ->orderBy('ayah_number')
            ->limit($limit)
            ->get();
    }

    /**
     * Clear all Quran-related cache (no-op since cache is disabled)
     */
    public function clearCache(): void
    {
        // Cache is disabled, so no cache to clear
        \Log::info('Cache clearing requested, but cache is disabled');
    }
}
