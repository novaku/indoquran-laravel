<?php

namespace App\Services;

use App\Models\Ayah;
use App\Models\Surah;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class QuranCacheService
{
    /**
     * Get cache TTL from configuration
     */
    private function getCacheTtl(string $type = 'quran_data'): int
    {
        return config("quran_cache.ttl.{$type}", 86400);
    }
    
    /**
     * Get cache key prefix from configuration
     */
    private function getCachePrefix(string $type): string
    {
        return config("quran_cache.prefixes.{$type}", "quran:{$type}:");
    }

    /**
     * Get all surahs with Redis caching
     *
     * @return Collection
     */
    public function getAllSurahs(): Collection
    {
        $cacheKey = $this->getCachePrefix('surahs');
        
        return Cache::remember($cacheKey, $this->getCacheTtl(), function () {
            if (config('quran_cache.detailed_logging', false)) {
                \Log::info('QuranCacheService: Fetching all surahs from database');
            }
            return Surah::orderBy('number')->get();
        });
    }

    /**
     * Get a specific surah by number with Redis caching
     *
     * @param int $number
     * @return Surah|null
     */
    public function getSurah(int $number): ?Surah
    {
        $cacheKey = $this->getCachePrefix('surah') . $number;
        
        return Cache::remember($cacheKey, $this->getCacheTtl(), function () use ($number) {
            if (config('quran_cache.detailed_logging', false)) {
                \Log::info('QuranCacheService: Fetching surah from database', ['surah_number' => $number]);
            }
            return Surah::where('number', $number)->first();
        });
    }

    /**
     * Get all ayahs for a surah with Redis caching
     *
     * @param int $surahNumber
     * @return Collection
     */
    public function getSurahAyahs(int $surahNumber): Collection
    {
        $cacheKey = $this->getCachePrefix('ayahs') . $surahNumber;
        
        return Cache::remember($cacheKey, $this->getCacheTtl(), function () use ($surahNumber) {
            if (config('quran_cache.detailed_logging', false)) {
                \Log::info('QuranCacheService: Fetching surah ayahs from database', ['surah_number' => $surahNumber]);
            }
            return Ayah::where('surah_number', $surahNumber)
                ->orderBy('ayah_number')
                ->get();
        });
    }

    /**
     * Get a specific ayah with Redis caching
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
        
        $cacheKey = $this->getCachePrefix('ayah') . $surahNumber . ':' . $ayahNumber;
        
        return Cache::remember($cacheKey, $this->getCacheTtl(), function () use ($surahNumber, $ayahNumber) {
            if (config('quran_cache.detailed_logging', false)) {
                \Log::info('QuranCacheService: Fetching ayah from database', ['surah' => $surahNumber, 'ayah' => $ayahNumber]);
            }
            
            $ayah = Ayah::where('surah_number', $surahNumber)
                ->where('ayah_number', $ayahNumber)
                ->first();
                
            if (!$ayah) {
                \Log::warning('Ayah not found in database', ['surah' => $surahNumber, 'ayah' => $ayahNumber]);
            }
            
            return $ayah;
        });
    }

    /**
     * Search ayahs by Indonesian text with Redis caching
     *
     * @param string $query
     * @param int $limit
     * @return Collection
     */
    public function searchAyahs(string $query, int $limit = 20): Collection
    {
        // Limit the search results to prevent excessive caching
        $maxLimit = config('quran_cache.max_search_results', 50);
        $limit = min($limit, $maxLimit);
        
        // Create cache key based on query and limit
        $cacheKey = $this->getCachePrefix('search') . md5($query . '_' . $limit);
        
        return Cache::remember($cacheKey, $this->getCacheTtl('search_results'), function () use ($query, $limit) {
            if (config('quran_cache.detailed_logging', false)) {
                \Log::info('QuranCacheService: Searching ayahs in database', ['query' => $query, 'limit' => $limit]);
            }
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
        $prefixes = [
            $this->getCachePrefix('surahs'),
            $this->getCachePrefix('surah') . '*',
            $this->getCachePrefix('ayahs') . '*',
            $this->getCachePrefix('ayah') . '*',
            $this->getCachePrefix('search') . '*'
        ];
        
        foreach ($prefixes as $pattern) {
            if (str_contains($pattern, '*')) {
                // For wildcard patterns, we need to get all matching keys and delete them
                $this->clearCacheByPattern($pattern);
            } else {
                // For exact keys, just forget them
                Cache::forget($pattern);
            }
        }
        
        \Log::info('All Quran cache cleared');
    }
    
    /**
     * Clear cache by pattern (for Redis)
     *
     * @param string $pattern
     */
    private function clearCacheByPattern(string $pattern): void
    {
        try {
            // Get Redis instance
            $redis = Cache::getRedis();
            
            // Get cache prefix from config
            $prefix = config('cache.prefix');
            $fullPattern = $prefix . $pattern;
            
            // Get all keys matching the pattern
            $keys = $redis->keys($fullPattern);
            
            if (!empty($keys)) {
                // Delete all matching keys
                $redis->del($keys);
                \Log::info('Cleared cache keys by pattern', ['pattern' => $pattern, 'count' => count($keys)]);
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to clear cache by pattern', ['pattern' => $pattern, 'error' => $e->getMessage()]);
            // Fallback: try to clear individual cache entries if we can't use Redis directly
        }
    }
    
    /**
     * Clear specific surah cache
     *
     * @param int $surahNumber
     */
    public function clearSurahCache(int $surahNumber): void
    {
        Cache::forget($this->getCachePrefix('surah') . $surahNumber);
        Cache::forget($this->getCachePrefix('ayahs') . $surahNumber);
        
        // Clear individual ayah caches for this surah
        $this->clearCacheByPattern($this->getCachePrefix('ayah') . $surahNumber . ':*');
        
        \Log::info('Cleared cache for surah', ['surah_number' => $surahNumber]);
    }
    
    /**
     * Clear specific ayah cache
     *
     * @param int $surahNumber
     * @param int $ayahNumber
     */
    public function clearAyahCache(int $surahNumber, int $ayahNumber): void
    {
        $cacheKey = $this->getCachePrefix('ayah') . $surahNumber . ':' . $ayahNumber;
        Cache::forget($cacheKey);
        
        \Log::info('Cleared cache for ayah', ['surah' => $surahNumber, 'ayah' => $ayahNumber]);
    }
    
    /**
     * Clear search cache
     */
    public function clearSearchCache(): void
    {
        $this->clearCacheByPattern($this->getCachePrefix('search') . '*');
        \Log::info('Cleared all search cache');
    }
    
    /**
     * Warm up cache by preloading frequently accessed data
     */
    public function warmUpCache(): void
    {
        \Log::info('Starting cache warm-up');
        
        // Preload all surahs
        $this->getAllSurahs();
        
        // Preload popular surahs from configuration
        $popularSurahs = config('quran_cache.popular_surahs', [1, 2, 18, 36, 55, 67, 112, 113, 114]);
        
        foreach ($popularSurahs as $surahNumber) {
            $this->getSurah($surahNumber);
            $this->getSurahAyahs($surahNumber);
        }
        
        \Log::info('Cache warm-up completed');
    }
}
