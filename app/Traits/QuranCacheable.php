<?php

namespace App\Traits;

use App\Services\QuranCacheService;

trait QuranCacheable
{
    protected ?QuranCacheService $quranCacheService = null;

    /**
     * Get the QuranCacheService instance
     */
    protected function getQuranCacheService(): QuranCacheService
    {
        if ($this->quranCacheService === null) {
            $this->quranCacheService = app(QuranCacheService::class);
        }
        
        return $this->quranCacheService;
    }

    /**
     * Get all surahs with caching
     */
    protected function getCachedSurahs()
    {
        return $this->getQuranCacheService()->getAllSurahs();
    }

    /**
     * Get a specific surah with caching
     */
    protected function getCachedSurah(int $number)
    {
        return $this->getQuranCacheService()->getSurah($number);
    }

    /**
     * Get surah ayahs with caching
     */
    protected function getCachedSurahAyahs(int $surahNumber)
    {
        return $this->getQuranCacheService()->getSurahAyahs($surahNumber);
    }

    /**
     * Get a specific ayah with caching
     */
    protected function getCachedAyah($surahNumber, $ayahNumber)
    {
        return $this->getQuranCacheService()->getAyah($surahNumber, $ayahNumber);
    }

    /**
     * Search ayahs with caching
     */
    protected function getCachedSearchResults(string $query, int $limit = 20)
    {
        return $this->getQuranCacheService()->searchAyahs($query, $limit);
    }

    /**
     * Clear cache for a specific surah
     */
    protected function clearSurahCache(int $surahNumber): void
    {
        $this->getQuranCacheService()->clearSurahCache($surahNumber);
    }

    /**
     * Clear cache for a specific ayah
     */
    protected function clearAyahCache(int $surahNumber, int $ayahNumber): void
    {
        $this->getQuranCacheService()->clearAyahCache($surahNumber, $ayahNumber);
    }

    /**
     * Clear all search cache
     */
    protected function clearSearchCache(): void
    {
        $this->getQuranCacheService()->clearSearchCache();
    }
}
