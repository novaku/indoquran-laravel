# Redis Cache Implementation for QuranCacheService

## Overview

The QuranCacheService has been enhanced to use Redis cache for improved performance. This implementation provides efficient caching of Quran data with configurable TTL settings and cache management features.

## Features

### 1. Comprehensive Caching
- **Surahs**: All surahs are cached with a configurable TTL
- **Individual Surah**: Each surah is cached separately for quick access
- **Ayahs**: All ayahs for each surah are cached together
- **Individual Ayah**: Specific ayahs can be cached and retrieved quickly
- **Search Results**: Search queries are cached to improve search performance

### 2. Configuration-Based Settings
Cache settings are managed through `config/quran_cache.php`:

```php
// Cache TTL settings
'ttl' => [
    'quran_data' => 86400,      // 24 hours for Quran data
    'search_results' => 3600,   // 1 hour for search results
    'user_preferences' => 7200, // 2 hours for user preferences
],

// Cache key prefixes
'prefixes' => [
    'surahs' => 'quran:surahs',
    'surah' => 'quran:surah:',
    'ayahs' => 'quran:ayahs:',
    'ayah' => 'quran:ayah:',
    'search' => 'quran:search:',
],

// Popular surahs for cache warming
'popular_surahs' => [1, 2, 18, 36, 55, 67, 112, 113, 114],
```

### 3. Cache Management Commands
Use the Artisan command to manage cache:

```bash
# Clear all Quran cache
php artisan quran:cache clear

# Warm up cache with popular data
php artisan quran:cache warm-up

# Check cache status
php artisan quran:cache status
```

### 4. Cache Management Methods

#### Clear Cache Operations
```php
// Clear all Quran-related cache
$service->clearCache();

// Clear specific surah cache
$service->clearSurahCache(1);

// Clear specific ayah cache
$service->clearAyahCache(1, 1);

// Clear search cache only
$service->clearSearchCache();
```

#### Cache Warming
```php
// Warm up cache with popular surahs
$service->warmUpCache();
```

## Usage Examples

### Basic Usage
```php
use App\Services\QuranCacheService;

$quranService = app(QuranCacheService::class);

// Get all surahs (cached)
$surahs = $quranService->getAllSurahs();

// Get specific surah (cached)
$surah = $quranService->getSurah(1);

// Get surah ayahs (cached)
$ayahs = $quranService->getSurahAyahs(1);

// Get specific ayah (cached)
$ayah = $quranService->getAyah(1, 1);

// Search ayahs (cached)
$results = $quranService->searchAyahs('Allah', 20);
```

### Using the QuranCacheable Trait
```php
use App\Traits\QuranCacheable;

class QuranController extends Controller
{
    use QuranCacheable;
    
    public function index()
    {
        $surahs = $this->getCachedSurahs();
        return view('quran.index', compact('surahs'));
    }
    
    public function show($surahNumber)
    {
        $surah = $this->getCachedSurah($surahNumber);
        $ayahs = $this->getCachedSurahAyahs($surahNumber);
        return view('quran.show', compact('surah', 'ayahs'));
    }
}
```

## Cache Keys Structure

The cache uses a hierarchical key structure:

- `quran:surahs` - All surahs list
- `quran:surah:{number}` - Individual surah data
- `quran:ayahs:{surah_number}` - All ayahs for a surah
- `quran:ayah:{surah_number}:{ayah_number}` - Individual ayah
- `quran:search:{hash}` - Search results (hash of query + limit)

## Performance Benefits

1. **Reduced Database Queries**: Frequently accessed data is served from Redis
2. **Faster Response Times**: Redis in-memory storage provides sub-millisecond access
3. **Scalability**: Reduces database load, allowing for more concurrent users
4. **Search Optimization**: Common search queries are cached for instant results

## Configuration Options

### Environment Variables
Add these to your `.env` file:

```env
# Cache configuration
CACHE_STORE=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Quran cache specific settings
QURAN_CACHE_TTL=86400
SEARCH_CACHE_TTL=3600
QURAN_WARM_CACHE_ON_BOOT=false
CACHE_DETAILED_LOGGING=false
MAX_SEARCH_CACHE_RESULTS=50
```

### Redis Connection
Ensure Redis is properly configured in `config/database.php`:

```php
'redis' => [
    'client' => env('REDIS_CLIENT', 'predis'),
    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
    ],
    'default' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_DB', '0'),
    ],
    'cache' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_CACHE_DB', '1'),
    ],
],
```

## Best Practices

1. **Cache Warming**: Use the warm-up command during deployment to preload popular data
2. **Cache Invalidation**: Clear specific caches when data is updated
3. **Monitoring**: Use the status command to monitor cache usage
4. **TTL Settings**: Adjust TTL based on your application's needs
5. **Memory Management**: Monitor Redis memory usage and adjust accordingly

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check Redis server is running
   - Verify connection settings in `.env`
   - Test with `redis-cli ping`

2. **Cache Not Working**
   - Verify `CACHE_STORE=redis` in `.env`
   - Check Redis configuration
   - Run `php artisan quran:cache status`

3. **Memory Issues**
   - Monitor Redis memory usage
   - Adjust TTL settings
   - Consider Redis memory optimization

### Debug Commands
```bash
# Check cache status
php artisan quran:cache status

# Test Redis connection
redis-cli ping

# Monitor Redis
redis-cli monitor

# Check cache keys
redis-cli keys "*quran*"
```

## Migration from Previous Version

The service maintains backward compatibility. The previous direct database calls have been replaced with cached versions that automatically fallback to database queries if cache is unavailable.

No changes are required in existing code that uses the QuranCacheService.
