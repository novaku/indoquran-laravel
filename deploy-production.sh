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

# Install PHP dependencies
log_message "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader || { log_error "Failed to install PHP dependencies"; exit 1; }

# Generate application key if not exists
log_message "Ensuring application key exists..."
if ! grep -q "APP_KEY=" .env || grep -q "APP_KEY=$" .env; then
    log_message "Generating application key..."
    php artisan key:generate
fi

# Run database migrations
log_message "Running database migrations..."
php artisan migrate --force || { log_warning "Database migrations failed - check database connection"; }

# Ensure cache table exists (for fallback caching)
log_message "Ensuring cache table exists..."
php artisan cache:table >/dev/null 2>&1 || true
php artisan migrate --force >/dev/null 2>&1 || true

# Clear and recache Laravel configs
log_message "Optimizing Laravel..."
php artisan config:cache
php artisan config:clear
php artisan route:clear
php artisan route:cache
php artisan view:clear
php artisan view:cache

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

# Verify Redis cache status
log_message "Verifying Redis cache status..."
if php artisan quran:cache status >/dev/null 2>&1; then
    log_message "✓ Redis cache is working properly"
else
    log_warning "⚠ Redis cache verification failed - check Redis connection"
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
log_message "Your IndoQuran application should now be running with all assets correctly prefixed with /public in production."
log_message "Redis cache has been cleared and warmed up for optimal performance."
log_message ""
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
