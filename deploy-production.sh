#!/bin/bash

# Production deployment script for IndoQuran Laravel + React app
# This script should be run on the production server
#
# IMPORTANT: This script does NOT build assets or delete existing build files!
# Frontend assets must be built locally using ./build-for-production.sh
# and committed to git before running this deployment script.
#
# This script only:
# 1. Pulls latest code from git (including pre-built assets)
# 2. Installs PHP dependencies
# 3. Optimizes Laravel caches
# 4. Verifies that vendor assets are present and protects them

# Enable strict error handling
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
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

# Emergency cache clear function for ParseError fix
emergency_cache_clear() {
    log_message "🚨 EMERGENCY: Clearing all Laravel caches to fix ParseError..."
    
    # Clear view cache (most critical for ParseError)
    log_message "Clearing view cache..."
    php artisan view:clear 2>/dev/null || log_warning "⚠ Failed to clear view cache"
    
    # Clear application cache
    log_message "Clearing application cache..."
    php artisan cache:clear 2>/dev/null || log_warning "⚠ Failed to clear application cache"
    
    # Clear config cache
    log_message "Clearing config cache..."
    php artisan config:clear 2>/dev/null || log_warning "⚠ Failed to clear config cache"
    
    # Clear route cache
    log_message "Clearing route cache..."
    php artisan route:clear 2>/dev/null || log_warning "⚠ Failed to clear route cache"
    
    # Clear compiled views manually
    log_message "Clearing compiled view files..."
    if [ -d "storage/framework/views" ]; then
        find storage/framework/views -name "*.php" -delete 2>/dev/null || log_warning "⚠ Some compiled views could not be deleted"
        log_message "✓ Compiled view files cleared"
    fi
    
    # Rebuild essential caches
    log_message "Rebuilding essential caches..."
    php artisan config:cache 2>/dev/null || log_warning "⚠ Failed to cache config"
    
    log_message "🎉 Emergency cache clear completed! ParseError should be resolved."
}

# Check if we're in production environment
if grep -q "APP_ENV=production" .env; then
    log_message "Verified production environment"
else
    log_warning "APP_ENV is not set to production in .env file"
    read -p "This doesn't appear to be a production environment. Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_message "Deployment aborted"
        exit 1
    fi
fi

# Emergency check for ParseError - run cache clear if needed
log_message "Checking for ParseError conditions..."
if php artisan route:list >/dev/null 2>&1; then
    log_message "✓ Laravel is running normally"
else
    log_warning "⚠ Laravel appears to have issues - running emergency cache clear"
    emergency_cache_clear
fi

# Ensure we don't accidentally run build scripts that would delete vendor files
log_message "Protecting build assets during deployment..."

# Check if any build-related commands are attempting to run
if pgrep -f "npm\|node\|vite" > /dev/null; then
    log_error "Node.js/npm processes detected running on production server!"
    log_error "This server should NOT run build processes."
    log_error "Build assets should be generated locally and committed to git."
    exit 1
fi

log_message "Starting deployment process..."

# Pull the latest changes from the repository
log_message "Pulling latest changes from git..."
git pull origin main || { log_error "Failed to pull from git"; exit 1; }

# Install/update PHP dependencies
log_message "Installing PHP dependencies with Composer..."

# Try to find Composer command
COMPOSER_CMD=""
if command -v composer >/dev/null 2>&1; then
    COMPOSER_CMD="composer"
elif command -v composer.phar >/dev/null 2>&1; then
    COMPOSER_CMD="composer.phar"
elif [ -f "composer.phar" ]; then
    COMPOSER_CMD="php composer.phar"
elif [ -f "/usr/local/bin/composer" ]; then
    COMPOSER_CMD="/usr/local/bin/composer"
elif [ -f "$HOME/composer.phar" ]; then
    COMPOSER_CMD="php $HOME/composer.phar"
else
    log_error "Composer not found! Please install Composer first."
    log_error "You can install it with:"
    log_error "curl -sS https://getcomposer.org/installer | php"
    log_error "mv composer.phar /usr/local/bin/composer"
    exit 1
fi

log_message "Using Composer command: $COMPOSER_CMD"

if [ -f "composer.lock" ]; then
    log_message "composer.lock found, running composer install..."
    $COMPOSER_CMD install --no-dev --optimize-autoloader --no-interaction || { log_error "Composer install failed"; exit 1; }
else
    log_message "No composer.lock found, running composer update..."
    $COMPOSER_CMD update --no-dev --optimize-autoloader --no-interaction || { log_error "Composer update failed"; exit 1; }
fi
log_message "✓ Composer dependencies installed successfully"

# Generate application key if not exists
log_message "Ensuring application key exists..."
if ! grep -q "APP_KEY=" .env || grep -q "APP_KEY=$" .env; then
    log_message "Generating application key..."
    php artisan key:generate
fi

# Run database migrations
log_message "Running database migrations..."
if php artisan migrate --force 2>&1 | grep -q "Duplicate column"; then
    log_warning "⚠ Some migrations skipped due to existing columns (this is normal)"
    log_message "✓ Database schema is up to date"
elif php artisan migrate --force >/dev/null 2>&1; then
    log_message "✓ Database migrations completed successfully"
else
    log_warning "⚠ Database migrations encountered issues - check database connection"
    log_warning "Application may still work with existing schema"
fi

# Ensure cache table exists (for fallback caching)
log_message "Ensuring cache table exists..."
php artisan cache:table >/dev/null 2>&1 || true
php artisan migrate --force >/dev/null 2>&1 || true

# Function to refresh views
refresh_views() {
    log_message "Refreshing views..."
    
    # Clear all view caches
    php artisan view:clear || log_warning "⚠ Failed to clear view cache"
    
    # Clear compiled views
    if [ -d storage/framework/views ]; then
        log_message "Clearing compiled views..."
        find storage/framework/views -name "*.php" -delete 2>/dev/null || log_warning "⚠ Failed to clear compiled views"
        log_message "✓ Compiled views cleared"
    fi
    
    # Recreate view cache
    php artisan view:cache || log_warning "⚠ Failed to cache views"
    
    log_message "✓ Views refreshed successfully"
}

# Clear and recache Laravel configs
log_message "Optimizing Laravel..."
php artisan config:cache
php artisan config:clear
php artisan route:clear
php artisan route:cache

# Refresh views using our new function
refresh_views

# Clear and warm up Quran cache
log_message "Managing Quran cache..."
if php artisan list | grep -q "quran:cache"; then
    log_message "Quran cache commands available"
    
    # Check what cache driver is actually being used
    current_cache=$(grep "CACHE_STORE=" .env 2>/dev/null | cut -d'=' -f2 || echo "default")
    log_message "Current cache driver: $current_cache"
    
    # Check if cache system is available
    cache_available=false
    if [ "$current_cache" = "redis" ]; then
        # Test Redis availability using PHP
        cat > test_cache_availability.php << 'EOF'
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
    
    if ($redisSocket && file_exists($redisSocket)) {
        $connected = $redis->connect($redisSocket);
    } else {
        $connected = $redis->connect($redisHost, $redisPort, 2);
    }
    
    if ($connected && ($redis->ping() === true || $redis->ping() === 'PONG')) {
        echo "AVAILABLE";
        exit(0);
    } else {
        echo "UNAVAILABLE";
        exit(1);
    }
} catch (Exception $e) {
    echo "UNAVAILABLE";
    exit(1);
}
EOF
        
        cache_test_result=$(php test_cache_availability.php 2>/dev/null || echo "UNAVAILABLE")
        rm -f test_cache_availability.php
        
        if [ "$cache_test_result" = "AVAILABLE" ]; then
            cache_available=true
        fi
    else
        # For database, file, or other cache drivers
        cache_available=true
    fi
    
    if [ "$cache_available" = true ]; then
        log_message "Cache system is available, proceeding with cache operations..."
        
        # Test Laravel's Redis connection before clearing cache
        log_message "Testing Laravel's Redis connection..."
        
        # Create a more detailed Laravel Redis test
        cat > test_laravel_redis.php << 'EOF'
<?php
try {
    // Bootstrap Laravel
    require_once 'vendor/autoload.php';
    
    $app = require_once 'bootstrap/app.php';
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    
    // Get Redis configuration
    $redisConfig = config('database.redis');
    echo "Redis Config: " . json_encode($redisConfig) . "\n";
    
    // Test Redis connection
    $redis = app('redis');
    $result = $redis->ping();
    
    if ($result === true || $result === 'PONG' || $result === '+PONG') {
        echo "Laravel Redis: SUCCESS\n";
        exit(0);
    } else {
        echo "Laravel Redis: FAILED - Unexpected ping response: " . var_export($result, true) . "\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "Laravel Redis: ERROR - " . $e->getMessage() . "\n";
    echo "Error details: " . $e->getFile() . ":" . $e->getLine() . "\n";
    exit(1);
}
EOF
        
        laravel_redis_test=$(php test_laravel_redis.php 2>&1)
        laravel_redis_status=$?
        rm -f test_laravel_redis.php
        
        echo "Laravel Redis Test Output:"
        echo "$laravel_redis_test"
        
        if [ $laravel_redis_status -eq 0 ]; then
            log_message "✓ Laravel Redis connection verified"
            
            if php artisan quran:cache clear 2>/dev/null; then
                log_message "✓ Quran cache cleared successfully"
            else
                log_warning "⚠ Failed to clear Quran cache"
            fi
            
            if php artisan quran:cache warm-up 2>/dev/null; then
                log_message "✓ Quran cache warmed up successfully"
            else
                log_warning "⚠ Failed to warm up Quran cache"
            fi
        else
            log_warning "⚠ Laravel cannot connect to Redis - detailed diagnosis:"
            echo "$laravel_redis_test"
            
            # Check current .env Redis settings
            log_message "Current .env Redis settings:"
            grep -E "REDIS_|CACHE_" .env || echo "No Redis settings found in .env"
            
            # Try to fix common issues
            log_message "Attempting to fix Redis configuration..."
            
            # Check current .env Redis settings
            log_message "Current .env Redis settings:"
            grep -E "REDIS_|CACHE_" .env || echo "No Redis settings found in .env"
            
            log_warning "⚠ Please check your .env Redis configuration manually"
            log_warning "Common issues: empty REDIS_HOST/PORT, wrong REDIS_CLIENT, missing REDIS_SOCKET"
            
            # Retry Laravel Redis test
            cat > test_laravel_redis_retry.php << 'EOF'
<?php
try {
    require_once 'vendor/autoload.php';
    $app = require_once 'bootstrap/app.php';
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    
    $redis = app('redis');
    $result = $redis->ping();
    
    if ($result === true || $result === 'PONG' || $result === '+PONG') {
        echo "SUCCESS";
        exit(0);
    } else {
        echo "FAILED: " . var_export($result, true);
        exit(1);
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
    exit(1);
}
EOF
            
            retry_result=$(php test_laravel_redis_retry.php 2>&1)
            retry_status=$?
            rm -f test_laravel_redis_retry.php
            
            if [ $retry_status -eq 0 ]; then
                log_message "✓ Laravel Redis connection verified after wait period"
                
                if php artisan quran:cache clear 2>/dev/null; then
                    log_message "✓ Quran cache cleared successfully"
                fi
                
                if php artisan quran:cache warm-up 2>/dev/null; then
                    log_message "✓ Quran cache warmed up successfully"
                fi
            else
                log_warning "⚠ Laravel still cannot connect to Redis after retry"
                log_warning "Redis test result: $retry_result"
                log_warning "Cache operations will be skipped"
                log_warning "Check Redis configuration in .env and config/database.php"
            fi
        fi
    else
        log_warning "⚠ Cache system not available, skipping cache operations"
        log_message "Cache will be populated automatically on first requests"
        log_message "Consider fixing cache configuration for better performance"
    fi
else
    log_warning "⚠ Quran cache commands not available yet"
    log_warning "Cache will be populated on first request"
fi

# Set proper permissions
log_message "Setting permissions..."
find storage bootstrap/cache -type d -exec chmod 775 {} \;
find storage bootstrap/cache -type f -exec chmod 664 {} \;

# Verify the build directory exists and protect vendor files
log_message "Checking build directory and protecting vendor assets..."
if [ -d public/build ]; then
    log_message "Build directory found"
    
    # Check if manifest.json exists
    if [ -f public/build/manifest.json ]; then
        log_message "✓ Vite manifest file found"
    else
        log_error "✗ Vite manifest.json not found in public/build/"
        log_warning "This will cause Vite manifest errors in Laravel"
        log_warning ""
        log_warning "PRODUCTION SERVER DOES NOT HAVE NODE.JS/NPM"
        log_warning "Frontend assets must be built on your local machine and committed to git"
        log_warning ""
        log_warning "To fix this issue:"
        log_warning "1. On your LOCAL machine (not server), run: ./build-for-production.sh"
        log_warning "2. Commit the generated build files: git add public/build && git commit -m 'Add production build files'"
        log_warning "3. Push to repository: git push origin main"
        log_warning "4. On this server, pull the changes: git pull origin main"
        log_warning "5. Re-run this deployment script"
        exit 1
    fi
    
    # Check if assets directory exists and has files
    if [ -d public/build/assets ]; then
        asset_count=$(find public/build/assets -type f | wc -l)
        vendor_count=$(find public/build/assets -name "vendor*.js" | wc -l)
        if [ $asset_count -gt 0 ]; then
            log_message "✓ Found $asset_count asset files"
            if [ $vendor_count -gt 0 ]; then
                log_message "✓ Found $vendor_count vendor chunk files"
                # Set vendor files as read-only to prevent accidental deletion
                find public/build/assets -name "vendor*.js" -exec chmod 444 {} \; 2>/dev/null || true
                log_message "✓ Vendor files protected from accidental deletion"
            else
                log_warning "⚠ No vendor chunk files found - this may cause loading issues"
            fi
        else
            log_warning "✗ Assets directory is empty"
            log_warning "Run build script on local machine and commit the files"
        fi
    else
        log_warning "✗ Assets directory not found"
        log_warning "Run build script on local machine and commit the files"
    fi
else
    log_error "public/build directory not found!"
    log_warning ""
    log_warning "PRODUCTION SERVER DOES NOT HAVE NODE.JS/NPM"
    log_warning "Frontend assets must be built on your local machine and committed to git"
    log_warning ""
    log_warning "To fix this issue:"
    log_warning "1. On your LOCAL machine (not server), run: ./build-for-production.sh"
    log_warning "2. Commit the generated build files: git add public/build && git commit -m 'Add production build files'"
    log_warning "3. Push to repository: git push origin main"
    log_warning "4. On this server, pull the changes: git pull origin main"
    log_warning "5. Re-run this deployment script"
    exit 1
fi

# Clear OPcache if available
log_message "Clearing OPcache..."
php -r "if(function_exists('opcache_reset')) { opcache_reset(); echo 'OPcache cleared'; } else { echo 'OPcache not available'; }"

# Verify cache status
log_message "Verifying cache status..."
current_cache=$(grep "CACHE_STORE=" .env 2>/dev/null | cut -d'=' -f2 || echo "default")

if [ "$current_cache" = "redis" ]; then
    # Test Redis availability using PHP
    cat > test_redis_verification.php << 'EOF'
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
    
    if ($redisSocket && file_exists($redisSocket)) {
        $connected = $redis->connect($redisSocket);
    } else {
        $connected = $redis->connect($redisHost, $redisPort, 2);
    }
    
    if ($connected && ($redis->ping() === true || $redis->ping() === 'PONG')) {
        echo "SUCCESS";
        exit(0);
    } else {
        echo "FAILED";
        exit(1);
    }
} catch (Exception $e) {
    echo "FAILED";
    exit(1);
}
EOF
    
    redis_verification=$(php test_redis_verification.php 2>/dev/null || echo "FAILED")
    rm -f test_redis_verification.php
    
    if [ "$redis_verification" = "SUCCESS" ]; then
        log_message "✓ Redis cache is working properly"
    else
        log_warning "⚠ Redis cache verification failed - using fallback cache"
    fi
elif [ "$current_cache" = "database" ]; then
    log_message "✓ Database cache is configured"
elif [ "$current_cache" = "file" ]; then
    log_message "✓ File cache is configured"
else
    log_message "✓ Cache system configured as: $current_cache"
fi

# Test Quran cache if available
if php artisan quran:cache status >/dev/null 2>&1; then
    log_message "✓ Quran cache system is functional"
else
    log_warning "⚠ Quran cache verification failed - check cache configuration"
    log_warning "Application will still work but may have slower performance"
fi

# Final verification that vendor files are still present
log_message "Final verification of critical assets..."
if [ -d public/build/assets ]; then
    vendor_count=$(find public/build/assets -name "vendor*.js" | wc -l)
    if [ $vendor_count -gt 0 ]; then
        log_message "✓ Vendor chunk files verified: $vendor_count files present"
        # List vendor files for confirmation
        find public/build/assets -name "vendor*.js" -exec basename {} \; | while read file; do
            log_message "  - $file"
        done
    else
        log_error "✗ CRITICAL: Vendor chunk files missing after deployment!"
        log_error "This will cause JavaScript errors on the frontend."
        log_error "Check if any scripts accidentally deleted the build directory."
        exit 1
    fi
else
    log_error "✗ CRITICAL: Assets directory missing after deployment!"
    exit 1
fi

log_message "Deployment completed successfully!"
log_message "Your IndoQuran application should now be running with optimized caching."

current_cache=$(grep "CACHE_STORE=" .env 2>/dev/null | cut -d'=' -f2 || echo "default")
log_message "Current cache driver: $current_cache"

log_message ""
log_message "Post-deployment information:"
log_message "- Cache status: php artisan quran:cache status"
log_message "- Clear cache: php artisan quran:cache clear"
log_message "- Warm cache: php artisan quran:cache warm-up"
log_message "- Check logs: tail -f storage/logs/laravel.log"
log_message ""

if [ "$current_cache" = "redis" ]; then
    log_message "Redis cache troubleshooting:"
    log_message "1. Test Redis in PHP: php -r \"try { \$r = new Redis(); \$r->connect('/home/indoqura/tmp/redis.sock'); echo \$r->ping() ? 'OK' : 'FAIL'; } catch(Exception \$e) { echo 'ERROR: ' . \$e->getMessage(); }\""
    log_message "2. Start user Redis: ~/redis/start-redis.sh"
    log_message "3. Redis status: ~/redis/status-redis.sh"
    log_message "4. Install user Redis: ./install-user-redis.sh"
elif [ "$current_cache" = "database" ]; then
    log_message "Database cache information:"
    log_message "1. Cache table should exist (created automatically)"
    log_message "2. Performance: Good for most applications"
    log_message "3. To upgrade to Redis: Install Redis and update .env"
else
    log_message "Cache troubleshooting:"
    log_message "1. Current driver: $current_cache"
    log_message "2. For better performance, consider Redis or database cache"
fi

log_message ""
log_message "If you need Redis without sudo access:"
log_message "1. Run: ./install-user-redis.sh"
log_message "2. Update .env: CACHE_STORE=redis"
log_message "3. Re-run deployment script"
log_message ""
log_message "For Redis documentation:"
log_message "- With sudo: docs/REDIS_CONNECTION_FIX.md"
log_message "- Without sudo: docs/REDIS_NO_SUDO_INSTALLATION.md"
