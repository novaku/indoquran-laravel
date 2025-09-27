#!/bin/bash

# Quick fix script for production ParseError
# This script clears the Laravel caches that are causing the Blade template parsing issue

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

log_message() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log_message "🚀 Starting production cache clearing to fix ParseError..."

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    log_error "artisan file not found. Make sure you're in the Laravel project root directory."
    exit 1
fi

# Clear view cache (most important for ParseError fix)
log_message "Clearing view cache..."
php artisan view:clear || log_error "Failed to clear view cache"
log_message "✓ View cache cleared"

# Clear application cache
log_message "Clearing application cache..."
php artisan cache:clear || log_error "Failed to clear application cache"
log_message "✓ Application cache cleared"

# Clear config cache
log_message "Clearing config cache..."
php artisan config:clear || log_error "Failed to clear config cache"
log_message "✓ Config cache cleared"

# Clear route cache
log_message "Clearing route cache..."
php artisan route:clear || log_error "Failed to clear route cache"
log_message "✓ Route cache cleared"

# Clear compiled views from storage
log_message "Clearing compiled view files..."
if [ -d "storage/framework/views" ]; then
    find storage/framework/views -name "*.php" -delete 2>/dev/null || log_warning "⚠ Some compiled views could not be deleted"
    log_message "✓ Compiled view files cleared"
else
    log_warning "⚠ Views directory not found"
fi

# Rebuild caches for optimal performance
log_message "Rebuilding caches..."
php artisan config:cache || log_warning "⚠ Failed to cache config"
php artisan route:cache || log_warning "⚠ Failed to cache routes"
php artisan view:cache || log_warning "⚠ Failed to cache views"
log_message "✓ Caches rebuilt"

log_message "🎉 Cache clearing completed! The ParseError should now be resolved."
log_message "Please test your website: https://indoquran.web.id/"

echo
log_message "If the issue persists, please check the Laravel logs for more details:"
log_message "tail -f storage/logs/laravel.log"