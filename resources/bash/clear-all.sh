#!/bin/bash

# Clear All Caches Script for IndoQuran Laravel Application
# This script clears all types of caches and resets the application state
# Use this for troubleshooting or when you want a completely fresh start

# Enable strict error handling
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display status messages
log_message() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to display error messages
log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# Function to display warning messages
log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Function to display info messages
log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

echo "=========================================="
echo "   IndoQuran Clear All Caches Script"
echo "=========================================="
echo ""

log_message "Starting comprehensive cache clearing process..."

# 1. Clear Laravel Application Caches
log_message "Clearing Laravel application caches..."

log_info "Clearing configuration cache..."
php artisan config:clear 2>/dev/null || log_warning "Failed to clear config cache"

log_info "Clearing route cache..."
php artisan route:clear 2>/dev/null || log_warning "Failed to clear route cache"

log_info "Clearing view cache..."
php artisan view:clear 2>/dev/null || log_warning "Failed to clear view cache"

log_info "Clearing compiled services cache..."
php artisan clear-compiled 2>/dev/null || log_warning "Failed to clear compiled cache"

log_info "Clearing application cache..."
php artisan cache:clear 2>/dev/null || log_warning "Failed to clear application cache"

log_info "Clearing event cache..."
php artisan event:clear 2>/dev/null || log_warning "Failed to clear event cache"

# 2. Clear Quran Custom Caches
log_message "Clearing Quran-specific caches..."

if php artisan list | grep -q "quran:cache"; then
    log_info "Clearing Quran cache..."
    php artisan quran:cache clear 2>/dev/null || log_warning "Failed to clear Quran cache"
else
    log_warning "Quran cache commands not available"
fi

# 3. Clear Storage and Log Files
log_message "Clearing storage files..."

log_info "Clearing framework cache files..."
if [ -d storage/framework/cache ]; then
    find storage/framework/cache -type f -name "*.php" -delete 2>/dev/null || true
    log_info "✓ Framework cache files cleared"
fi

log_info "Clearing framework views..."
if [ -d storage/framework/views ]; then
    find storage/framework/views -type f -name "*.php" -delete 2>/dev/null || true
    log_info "✓ Framework view files cleared"
fi

log_info "Clearing framework sessions..."
if [ -d storage/framework/sessions ]; then
    find storage/framework/sessions -type f -delete 2>/dev/null || true
    log_info "✓ Framework session files cleared"
fi

log_info "Clearing logs (keeping latest)..."
if [ -d storage/logs ]; then
    # Keep only the most recent log file
    find storage/logs -name "*.log" -type f -mtime +1 -delete 2>/dev/null || true
    log_info "✓ Old log files cleared"
fi

# 4. Clear Redis Cache (if available)
log_message "Clearing Redis cache..."

# Check if Redis is configured
if grep -q "CACHE_STORE=redis" .env 2>/dev/null; then
    log_info "Redis cache configured, attempting to clear..."
    
    # Test Redis connection and clear if available
    cat > test_and_clear_redis.php << 'EOF'
<?php
try {
    require_once 'vendor/autoload.php';
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
    
    $redisSocket = $_ENV['REDIS_SOCKET'] ?? null;
    $redisHost = $_ENV['REDIS_HOST'] ?? '127.0.0.1';
    $redisPort = $_ENV['REDIS_PORT'] ?? 6379;
    
    $redis = new Redis();
    $connected = false;
    
    // Try socket connection first
    if ($redisSocket && file_exists($redisSocket)) {
        $connected = $redis->connect($redisSocket);
        $connection_type = "socket: $redisSocket";
    } else {
        // Fall back to TCP
        $connected = $redis->connect($redisHost, $redisPort, 2);
        $connection_type = "TCP: $redisHost:$redisPort";
    }
    
    if ($connected && ($redis->ping() === true || $redis->ping() === 'PONG')) {
        // Clear all Redis databases
        $redis->flushAll();
        echo "SUCCESS:$connection_type:CLEARED";
        exit(0);
    } else {
        echo "FAILED:$connection_type:NOT_RESPONDING";
        exit(1);
    }
} catch (Exception $e) {
    echo "ERROR:" . $e->getMessage();
    exit(1);
}
EOF
    
    redis_result=$(php test_and_clear_redis.php 2>/dev/null || echo "SCRIPT_FAILED")
    rm -f test_and_clear_redis.php
    
    if [[ "$redis_result" == SUCCESS:* ]]; then
        connection_info=$(echo "$redis_result" | cut -d':' -f2-)
        log_info "✓ Redis cache cleared successfully ($connection_info)"
    else
        log_warning "⚠ Redis cache could not be cleared: $redis_result"
        log_warning "Redis may not be running or accessible"
    fi
else
    cache_store=$(grep "CACHE_STORE=" .env 2>/dev/null | cut -d'=' -f2 || echo "not configured")
    log_info "Redis not configured (current: $cache_store)"
fi

# 5. Clear OPcache (if available)
log_message "Clearing OPcache..."

opcache_result=$(php -r "
if(function_exists('opcache_reset')) { 
    opcache_reset(); 
    echo 'OPcache cleared successfully'; 
} else { 
    echo 'OPcache not available'; 
}" 2>/dev/null || echo "Failed to check OPcache")

log_info "$opcache_result"

# 6. Clear Composer Autoload Cache
log_message "Regenerating Composer autoload..."

composer dump-autoload --optimize 2>/dev/null && log_info "✓ Composer autoload regenerated" || log_warning "Failed to regenerate autoload"

# 7. Clear Browser/CDN Caches (informational)
log_message "Additional cache clearing recommendations..."

log_info "Manual steps you may need to perform:"
log_info "1. Clear browser cache (Ctrl+F5 or Cmd+Shift+R)"
log_info "2. Clear CDN cache if using CloudFlare/similar service"
log_info "3. Clear reverse proxy cache if using Nginx/Apache caching"

# 8. Verify Cache Status
log_message "Verifying cache status..."

# Check current cache configuration
current_cache=$(grep "CACHE_STORE=" .env 2>/dev/null | cut -d'=' -f2 || echo "default")
log_info "Current cache driver: $current_cache"

# Test application cache
log_info "Testing application cache..."
if php artisan tinker --execute="Cache::put('test_key', 'test_value', 60); echo Cache::get('test_key') === 'test_value' ? 'Cache WORKING' : 'Cache FAILED';" 2>/dev/null | grep -q "WORKING"; then
    log_info "✓ Application cache is working"
else
    log_warning "⚠ Application cache test failed"
fi

# Test Quran cache if available
if php artisan list | grep -q "quran:cache"; then
    log_info "Testing Quran cache system..."
    if php artisan quran:cache status >/dev/null 2>&1; then
        log_info "✓ Quran cache system is functional"
    else
        log_warning "⚠ Quran cache system test failed"
    fi
fi

# 9. Optional: Warm up caches
echo ""
read -p "Do you want to warm up caches now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_message "Warming up caches..."
    
    log_info "Caching configuration..."
    php artisan config:cache 2>/dev/null && log_info "✓ Configuration cached" || log_warning "Failed to cache config"
    
    log_info "Caching routes..."
    php artisan route:cache 2>/dev/null && log_info "✓ Routes cached" || log_warning "Failed to cache routes"
    
    log_info "Caching views..."
    php artisan view:cache 2>/dev/null && log_info "✓ Views cached" || log_warning "Failed to cache views"
    
    if php artisan list | grep -q "quran:cache"; then
        log_info "Warming up Quran cache..."
        php artisan quran:cache warm-up 2>/dev/null && log_info "✓ Quran cache warmed up" || log_warning "Failed to warm up Quran cache"
    fi
else
    log_info "Skipping cache warm-up"
    log_info "You can manually warm up caches later with:"
    log_info "  php artisan config:cache"
    log_info "  php artisan route:cache"
    log_info "  php artisan view:cache"
    if php artisan list | grep -q "quran:cache"; then
        log_info "  php artisan quran:cache warm-up"
    fi
fi

echo ""
echo "=========================================="
log_message "Cache clearing completed successfully!"
echo "=========================================="
echo ""

log_info "Summary of cleared caches:"
log_info "✓ Laravel application caches (config, route, view, compiled)"
log_info "✓ Storage files (framework cache, views, sessions)"
log_info "✓ Old log files (kept recent ones)"
if [[ "$redis_result" == SUCCESS:* ]]; then
    log_info "✓ Redis cache"
fi
log_info "✓ OPcache (if available)"
log_info "✓ Composer autoload"

echo ""
log_info "Your application should now have a completely fresh cache state."
log_info "Monitor application performance and logs for any issues."
echo ""

# Show cache status
log_info "Current cache configuration:"
log_info "  Cache Driver: $current_cache"
if [ "$current_cache" = "redis" ]; then
    log_info "  Redis Status: $(echo "$redis_result" | cut -d':' -f1)"
fi

echo ""
log_info "Useful commands for cache management:"
log_info "  Check logs: tail -f storage/logs/laravel.log"
log_info "  Test cache: php artisan tinker --execute=\"Cache::put('test', 'ok'); echo Cache::get('test');\""
if php artisan list | grep -q "quran:cache"; then
    log_info "  Quran cache status: php artisan quran:cache status"
fi
echo ""
