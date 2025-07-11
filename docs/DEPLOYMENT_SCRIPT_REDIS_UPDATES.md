# Deployment Script Updates for Redis Cache Integration

## Summary of Changes

The `deploy-production.sh` script has been updated to include Redis cache management for the newly implemented QuranCacheService. Here are the key changes:

### 1. Redis Configuration Check (Early Validation)
```bash
# Check Redis configuration
log_message "Checking Redis configuration..."
if grep -q "CACHE_STORE=redis" .env; then
    log_message "✓ Redis cache store configured"
    # Test Redis connection
    if redis-cli ping >/dev/null 2>&1; then
        log_message "✓ Redis server is responding"
    else
        log_warning "⚠ Redis server is not responding - cache will fall back to database"
        log_warning "Consider starting Redis service: sudo systemctl start redis"
    fi
else
    log_warning "⚠ CACHE_STORE is not set to redis - using alternative cache driver"
    log_warning "For optimal performance, set CACHE_STORE=redis in .env"
fi
```

### 2. Application Key Generation
```bash
# Generate application key if not exists
log_message "Ensuring application key exists..."
if ! grep -q "APP_KEY=" .env || grep -q "APP_KEY=$" .env; then
    log_message "Generating application key..."
    php artisan key:generate
fi
```

### 3. Database Migration and Cache Table Setup
```bash
# Run database migrations
log_message "Running database migrations..."
php artisan migrate --force || { log_warning "Database migrations failed - check database connection"; }

# Ensure cache table exists (for fallback caching)
log_message "Ensuring cache table exists..."
php artisan cache:table >/dev/null 2>&1 || true
php artisan migrate --force >/dev/null 2>&1 || true
```

### 4. Quran Cache Management
```bash
# Clear and warm up Quran cache
log_message "Managing Quran cache..."
if php artisan list | grep -q "quran:cache"; then
    log_message "Quran cache commands available"
    if php artisan quran:cache clear; then
        log_message "✓ Quran cache cleared successfully"
    else
        log_warning "⚠ Failed to clear Quran cache"
    fi
    
    if php artisan quran:cache warm-up; then
        log_message "✓ Quran cache warmed up successfully"
    else
        log_warning "⚠ Failed to warm up Quran cache"
    fi
else
    log_warning "⚠ Quran cache commands not available yet"
    log_warning "Cache will be populated on first request"
fi
```

### 5. Redis Cache Status Verification
```bash
# Verify Redis cache status
log_message "Verifying Redis cache status..."
if php artisan quran:cache status >/dev/null 2>&1; then
    log_message "✓ Redis cache is working properly"
else
    log_warning "⚠ Redis cache verification failed - check Redis connection"
    log_warning "Application will still work but may have slower performance"
fi
```

### 6. Enhanced Post-Deployment Information
```bash
log_message "Post-deployment information:"
log_message "- Cache status: php artisan quran:cache status"
log_message "- Clear cache: php artisan quran:cache clear"
log_message "- Warm cache: php artisan quran:cache warm-up"
log_message "- Check logs: tail -f storage/logs/laravel.log"
log_message ""
log_message "If you encounter cache issues:"
log_message "1. Check Redis service: sudo systemctl status redis"
log_message "2. Restart Redis: sudo systemctl restart redis"
log_message "3. Check Redis connection: redis-cli ping"
log_message "4. Verify .env CACHE_STORE=redis setting"
```

## Benefits of These Changes

### 1. **Proactive Error Prevention**
- Early Redis configuration validation
- Database migration checks
- Graceful fallback handling

### 2. **Automated Cache Management**
- Automatic cache clearing on deployment
- Cache warming for immediate performance
- Status verification to ensure cache is working

### 3. **Better Error Handling**
- Non-blocking cache operations with warning messages
- Fallback mechanisms if Redis is unavailable
- Clear troubleshooting guidance

### 4. **Production Readiness**
- Application key generation if missing
- Database table creation for cache fallback
- Comprehensive status reporting

### 5. **Operational Support**
- Clear post-deployment instructions
- Troubleshooting commands for common issues
- Performance optimization guidance

## Deployment Flow

The updated deployment process now follows this sequence:

1. **Environment Validation** - Check production environment and Redis configuration
2. **Code Update** - Pull latest code from git
3. **Dependency Installation** - Install PHP dependencies
4. **Application Setup** - Generate keys, run migrations
5. **Laravel Optimization** - Cache configs, routes, views
6. **Cache Management** - Clear and warm up Quran cache
7. **Asset Verification** - Ensure frontend assets are present
8. **Final Validation** - Verify cache status and critical components
9. **Completion Report** - Provide status and troubleshooting information

## Error Handling Strategy

The script now handles various scenarios gracefully:

- **Redis Unavailable**: Warns but continues deployment
- **Cache Commands Missing**: Warns and explains cache will populate on demand
- **Migration Failures**: Warns but doesn't halt deployment
- **Asset Issues**: Continues to provide clear resolution steps

This ensures the deployment succeeds even in non-ideal conditions while providing clear guidance for optimization.
