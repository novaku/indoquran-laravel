<?php

namespace App\Services;

use App\Models\Ayah;
use App\Models\Surah;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class QuranCacheService
{
    /**
     * Get cache TTL based on environment
     * 1 second for non-production, 30 days for production
     *
     * @return \DateTimeInterface|\DateInterval|int
     */
    private function getCacheTtl()
    {
        return app()->environment('production') ? now()->addDays(30) : now()->addSecond();
    }

    /**
     * Get all surahs, cached
     *
     * @return Collection
     */
    public function getAllSurahs(): Collection
    {
        return Cache::remember('all_surahs', $this->getCacheTtl(), function () {
            return Surah::orderBy('number')->get();
        });
    }

    /**
     * Get a specific surah by number, cached
     *
     * @param int $number
     * @return Surah|null
     */
    public function getSurah(int $number): ?Surah
    {
        return Cache::remember("surah_{$number}", $this->getCacheTtl(), function () use ($number) {
            return Surah::where('number', $number)->first();
        });
    }

    /**
     * Get all ayahs for a surah, cached
     *
     * @param int $surahNumber
     * @return Collection
     */
    public function getSurahAyahs(int $surahNumber): Collection
    {
        return Cache::remember("surah_{$surahNumber}_ayahs", $this->getCacheTtl(), function () use ($surahNumber) {
            return Ayah::where('surah_number', $surahNumber)
                ->orderBy('ayah_number')
                ->get();
        });
    }

    /**
     * Get a specific ayah, cached
     *
     * @param int $surahNumber
     * @param int $ayahNumber
     * @return Ayah|null
     */
    public function getAyah(int $surahNumber, int $ayahNumber): ?Ayah
    {
        return Cache::remember("ayah_{$surahNumber}_{$ayahNumber}", $this->getCacheTtl(), function () use ($surahNumber, $ayahNumber) {
            return Ayah::where('surah_number', $surahNumber)
                ->where('ayah_number', $ayahNumber)
                ->first();
        });
    }

    /**
     * Search ayahs by Indonesian text, cached briefly 
     * 1 hour for production, 1 second for non-production
     *
     * @param string $query
     * @param int $limit
     * @return Collection
     */
    public function searchAyahs(string $query, int $limit = 20): Collection
    {
        $cacheKey = "search_" . md5($query) . "_{$limit}";
        $searchCacheTtl = app()->environment('production') ? now()->addHour() : now()->addSecond();
        
        return Cache::remember($cacheKey, $searchCacheTtl, function () use ($query, $limit) {
            return Ayah::where('text_indonesian', 'like', "%{$query}%")
                ->orderBy('surah_number')
                ->orderBy('ayah_number')
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Clear all Quran-related cache
     */
    public function clearCache(): void
    {
        Cache::forget('all_surahs');
        
        // Clear individual surah caches
        for ($i = 1; $i <= 114; $i++) {
            Cache::forget("surah_{$i}");
            Cache::forget("surah_{$i}_ayahs");
        }
        
        // Other cache entries will expire naturally
    }
}
