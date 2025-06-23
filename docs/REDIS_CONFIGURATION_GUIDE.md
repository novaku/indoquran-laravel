# Laravel Redis Configuration Guide for IndoQuran

This guide explains how to configure and test Redis with Laravel using Unix socket connections, based on the test file `test-redis.php`.

## Configuration

### 1. Environment Variables

Your `.env` file has been updated with the Redis socket configuration:

```env
CACHE_STORE=redis
CACHE_DRIVER=redis
REDIS_CLIENT=predis
REDIS_SOCKET=/home/indoqura/tmp/redis.sock
```

**Note:** This configuration uses only the Unix socket connection, which is more secure and often faster than TCP connections.

### 2. Laravel Configuration

The Redis configuration in `config/database.php` has been simplified to use only socket connections:

```php
'redis' => [
    'client' => env('REDIS_CLIENT', 'predis'),
    'default' => [
        'socket' => env('REDIS_SOCKET'),
        'database' => env('REDIS_DB', '0'),
    ],
    'cache' => [
        'socket' => env('REDIS_SOCKET'),
        'database' => env('REDIS_CACHE_DB', '1'),
    ],
],
```

## Testing Redis Connection

### 1. Command Line Test (Raw PHP)

Run the basic Redis test:
```bash
php test-redis.php
```

### 2. Laravel Artisan Command

Use the custom Artisan command for comprehensive testing:
```bash
# Basic test
php artisan redis:test

# Detailed test with performance metrics
php artisan redis:test --detailed
```

### 3. Web Interface Test

Visit the test route (only available in development):
```
http://your-domain.com/test-redis
```

This returns a JSON response with test results.

### 4. Laravel Tinker

Test Redis interactively:
```bash
php artisan tinker
```

Then run:
```php
// Test basic Redis
Redis::ping()
Redis::set('test', 'Hello IndoQuran')
Redis::get('test')

// Test Laravel Cache (uses Redis)
Cache::put('laravel_test', 'Laravel Cache Test', 60)
Cache::get('laravel_test')

// Run the complete test class
require_once 'test-laravel-redis.php';
LaravelRedisTest::runTests()
```

## Using Redis in Your Laravel Application

### 1. Direct Redis Usage

```php
use Illuminate\Support\Facades\Redis;

// Basic operations
Redis::set('user:1:name', 'Ahmad');
$userName = Redis::get('user:1:name');

// Hash operations (for user data)
Redis::hset('user:1', 'name', 'Ahmad');
Redis::hset('user:1', 'email', 'ahmad@indoquran.com');
$userData = Redis::hgetall('user:1');

// List operations (for queues or notifications)
Redis::lpush('notifications:user:1', json_encode(['message' => 'New verse available']));
$notification = Redis::rpop('notifications:user:1');

// Set operations (for tags or categories)
Redis::sadd('user:1:bookmarks', 'quran:1:1', 'quran:2:255', 'quran:18:10');
$bookmarks = Redis::smembers('user:1:bookmarks');
```

### 2. Laravel Cache (Recommended)

```php
use Illuminate\Support\Facades\Cache;

// Store Quran verses with TTL
Cache::put('quran:verse:2:255', [
    'arabic' => 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    'translation' => 'Allah - there is no deity except Him...',
    'surah' => 'Al-Baqarah',
    'verse' => 255
], 3600); // 1 hour

// Retrieve cached verse
$verse = Cache::get('quran:verse:2:255');

// Cache with callback (fetch from database if not cached)
$popularVerses = Cache::remember('popular_verses', 1800, function () {
    return DB::table('verses')->where('popular', true)->get();
});

// Cache tags (for organized cache management)
Cache::tags(['quran', 'verses'])->put('surah:1', $surahData, 3600);
Cache::tags(['quran', 'tafsir'])->put('tafsir:1:1', $tafsirData, 3600);

// Clear cache by tags
Cache::tags(['quran'])->flush(); // Clear all Quran-related cache
```

### 3. Session Storage

Your sessions can also use Redis (configure in `config/session.php`):

```php
'driver' => env('SESSION_DRIVER', 'redis'),
```

### 4. Queue Processing

Configure queues to use Redis (in `config/queue.php`):

```php
'connections' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => 'default',
        'retry_after' => 90,
    ],
],
```

## Performance Best Practices

### 1. Use Appropriate Data Types

- **Strings**: Simple key-value storage
- **Hashes**: Structured data (user profiles, verse metadata)
- **Lists**: Queues, notifications, recent items
- **Sets**: Unique collections (bookmarks, tags)
- **Sorted Sets**: Leaderboards, ranking

### 2. Set Appropriate TTL

```php
// Short-term cache (search results)
Cache::put('search:' . md5($query), $results, 300); // 5 minutes

// Medium-term cache (verse translations)
Cache::put('verse:translation:' . $verseId, $translation, 3600); // 1 hour

// Long-term cache (static content)
Cache::put('app:settings', $settings, 86400); // 24 hours
```

### 3. Use Cache Tags for Organization

```php
// Organize by feature
Cache::tags(['quran', 'search'])->put($key, $value, $ttl);
Cache::tags(['user', 'preferences'])->put($key, $value, $ttl);
Cache::tags(['admin', 'statistics'])->put($key, $value, $ttl);

// Clear specific feature cache
Cache::tags(['search'])->flush();
```

## Monitoring and Debugging

### 1. Redis Commands

```bash
# Connect to Redis via socket (if you have redis-cli)
redis-cli -s /home/indoqura/tmp/redis.sock

# Monitor Redis commands in real-time
redis-cli -s /home/indoqura/tmp/redis.sock monitor

# Get Redis information
redis-cli -s /home/indoqura/tmp/redis.sock info
```

### 2. Laravel Debugging

```php
// Enable query logging for Redis (in development)
Redis::enableEvents();

// Log Redis operations
Redis::listen(function ($command, $parameters) {
    Log::info('Redis Command', [
        'command' => $command,
        'parameters' => $parameters
    ]);
});
```

### 3. Performance Monitoring

```php
// Monitor cache hit ratio
$info = Redis::info();
$hits = $info['keyspace_hits'] ?? 0;
$misses = $info['keyspace_misses'] ?? 0;
$hitRatio = $hits / ($hits + $misses) * 100;

Log::info('Cache Performance', [
    'hit_ratio' => $hitRatio,
    'total_commands' => $info['total_commands_processed'] ?? 0,
    'used_memory' => $info['used_memory_human'] ?? 'Unknown'
]);
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if Redis server is running
   - Verify socket file exists: `ls -la /home/indoqura/tmp/redis.sock`
   - Check file permissions

2. **Permission Denied**
   - Ensure web server has access to socket file
   - Check socket file permissions: `chmod 666 /home/indoqura/tmp/redis.sock`

3. **Extension Not Loaded**
   - Install PHP Redis extension: `pecl install redis`
   - Add to php.ini: `extension=redis.so`

4. **Performance Issues**
   - Monitor memory usage: `Redis::info()['used_memory_human']`
   - Set appropriate TTL values
   - Use cache tags for organized cleanup

### Testing Checklist

- [ ] Basic Redis connection works
- [ ] Laravel Cache operations work
- [ ] Performance is acceptable
- [ ] Error handling is in place
- [ ] Monitoring/logging is configured
- [ ] Production configuration is secure

## Files Created/Modified

1. `test-redis.php` - Raw PHP Redis test
2. `test-laravel-redis.php` - Laravel-specific Redis test class
3. `app/Console/Commands/TestRedisConnection.php` - Artisan command
4. `routes/web.php` - Added test route
5. `.env` - Updated Redis configuration
6. This documentation file

Use these tools to ensure Redis is working properly in your IndoQuran Laravel application.
