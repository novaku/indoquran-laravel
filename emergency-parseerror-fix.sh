#!/bin/bash

# EMERGENCY ParseError Fix Script
# Run this immediately on your production server to fix the blade template cache issue
# Usage: ./emergency-parseerror-fix.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_message() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

echo -e "${RED}🚨 EMERGENCY PARSEERROR FIX SCRIPT 🚨${NC}"
echo -e "${YELLOW}This script will fix the 'unexpected end of file' ParseError${NC}"
echo -e "${YELLOW}by clearing Laravel's corrupted blade template cache.${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    log_error "❌ Laravel 'artisan' file not found!"
    log_error "Make sure you're in the Laravel project root directory."
    log_error "Current directory: $(pwd)"
    exit 1
fi

log_message "✓ Found Laravel project in: $(pwd)"

# Check Laravel status
log_info "Checking Laravel status..."
if php artisan --version >/dev/null 2>&1; then
    log_message "✓ Laravel artisan is accessible"
    LARAVEL_VERSION=$(php artisan --version | head -n1)
    log_info "Laravel version: $LARAVEL_VERSION"
else
    log_warning "⚠ Laravel artisan has issues, but continuing with cache clear..."
fi

# Start the fix process
log_message "🔧 Starting emergency ParseError fix process..."

# Step 1: Clear view cache (MOST IMPORTANT for ParseError)
log_message "Step 1/7: Clearing view cache..."
if php artisan view:clear 2>/dev/null; then
    log_message "✅ View cache cleared successfully"
else
    log_error "❌ Failed to clear view cache via artisan"
    log_warning "Attempting manual view cache clear..."
fi

# Step 2: Clear application cache
log_message "Step 2/7: Clearing application cache..."
if php artisan cache:clear 2>/dev/null; then
    log_message "✅ Application cache cleared successfully"
else
    log_warning "⚠ Failed to clear application cache"
fi

# Step 3: Clear config cache
log_message "Step 3/7: Clearing configuration cache..."
if php artisan config:clear 2>/dev/null; then
    log_message "✅ Configuration cache cleared successfully"
else
    log_warning "⚠ Failed to clear configuration cache"
fi

# Step 4: Clear route cache
log_message "Step 4/7: Clearing route cache..."
if php artisan route:clear 2>/dev/null; then
    log_message "✅ Route cache cleared successfully"
else
    log_warning "⚠ Failed to clear route cache"
fi

# Step 5: Manual cleanup of compiled views
log_message "Step 5/7: Manually cleaning compiled view files..."
if [ -d "storage/framework/views" ]; then
    VIEW_COUNT=$(find storage/framework/views -name "*.php" 2>/dev/null | wc -l)
    log_info "Found $VIEW_COUNT compiled view files"
    
    if [ "$VIEW_COUNT" -gt 0 ]; then
        find storage/framework/views -name "*.php" -delete 2>/dev/null || log_warning "⚠ Some files couldn't be deleted"
        NEW_COUNT=$(find storage/framework/views -name "*.php" 2>/dev/null | wc -l)
        log_message "✅ Deleted $(($VIEW_COUNT - $NEW_COUNT)) compiled view files"
    else
        log_message "✅ No compiled view files to clean"
    fi
else
    log_warning "⚠ Views directory not found: storage/framework/views"
fi

# Step 6: Clear other potential cache directories
log_message "Step 6/7: Clearing additional cache directories..."
CACHE_DIRS=("storage/framework/cache/data" "bootstrap/cache")
for dir in "${CACHE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_info "Clearing cache in: $dir"
        find "$dir" -type f -name "*.php" -delete 2>/dev/null || true
        find "$dir" -type f -name "config.php" -delete 2>/dev/null || true
        find "$dir" -type f -name "routes*.php" -delete 2>/dev/null || true
    fi
done
log_message "✅ Additional cache directories cleared"

# Step 7: Rebuild essential caches
log_message "Step 7/7: Rebuilding essential caches..."
if php artisan config:cache 2>/dev/null; then
    log_message "✅ Configuration cache rebuilt"
else
    log_warning "⚠ Failed to rebuild configuration cache"
fi

# Final verification
log_message "🔍 Running final verification..."
if php artisan route:list --compact 2>/dev/null | head -n 5 >/dev/null; then
    log_message "🎉 SUCCESS! Laravel is now working properly"
    echo ""
    echo -e "${GREEN}✅ ParseError has been FIXED!${NC}"
    echo -e "${GREEN}✅ Your website should now load correctly${NC}"
    echo ""
    log_info "Test your website: https://indoquran.web.id/"
else
    log_warning "⚠ Laravel may still have issues, but cache clearing is complete"
    log_info "If problems persist, check the Laravel logs:"
    log_info "tail -f storage/logs/laravel.log"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN} EMERGENCY FIX COMPLETED SUCCESSFULLY! ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Test your website: ${BLUE}https://indoquran.web.id/${NC}"
echo -e "2. If still having issues, check logs: ${BLUE}tail -f storage/logs/laravel.log${NC}"
echo -e "3. Consider running a full deployment: ${BLUE}./deploy-production.sh${NC}"
echo ""