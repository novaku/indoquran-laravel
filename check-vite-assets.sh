#!/bin/bash

# Server-side Vite asset checker for production servers without Node.js
# This script runs on the production server to check if assets are properly deployed

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_message() {
    echo -e "${GREEN}[ASSET CHECK]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_message "Checking Vite assets on production server..."
log_info "Note: This server does not have Node.js/npm - assets must be built locally"

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    log_error "Laravel artisan file not found. Please run this from the Laravel project root."
    exit 1
fi

# Initialize status
has_errors=false

# Check build directory
if [ -d "public/build" ]; then
    log_message "✓ Build directory exists"
    
    # Check manifest.json
    if [ -f "public/build/manifest.json" ]; then
        log_message "✓ Vite manifest.json found"
        
        # Show manifest info
        manifest_size=$(du -h public/build/manifest.json | cut -f1)
        log_info "Manifest file size: $manifest_size"
    else
        log_error "✗ Vite manifest.json missing"
        has_errors=true
    fi
    
    # Check assets directory
    if [ -d "public/build/assets" ]; then
        asset_count=$(find public/build/assets -type f | wc -l)
        if [ $asset_count -gt 0 ]; then
            log_message "✓ Found $asset_count asset files"
            
            # Show total assets size
            assets_size=$(du -sh public/build/assets | cut -f1)
            log_info "Total assets size: $assets_size"
            
            # Show asset types
            css_count=$(find public/build/assets -name "*.css" | wc -l)
            js_count=$(find public/build/assets -name "*.js" | wc -l)
            font_count=$(find public/build/assets -name "*.ttf" -o -name "*.woff" -o -name "*.woff2" | wc -l)
            
            log_info "Asset breakdown: $css_count CSS, $js_count JS, $font_count fonts"
        else
            log_error "✗ Assets directory is empty"
            has_errors=true
        fi
    else
        log_error "✗ Assets directory missing"
        has_errors=true
    fi
    
    # Show build directory size
    build_size=$(du -sh public/build | cut -f1)
    log_info "Total build directory size: $build_size"
    
else
    log_error "✗ Build directory missing"
    has_errors=true
fi

# Check Laravel cache status
log_message "Checking Laravel configuration..."

# Check if config is cached
if [ -f "bootstrap/cache/config.php" ]; then
    log_info "Config cache exists"
else
    log_warning "Config not cached (this is usually fine for development)"
fi

# Check if views are cached
if [ -d "storage/framework/views" ] && [ "$(ls -A storage/framework/views)" ]; then
    view_count=$(ls storage/framework/views/*.php 2>/dev/null | wc -l)
    log_info "Found $view_count cached view files"
else
    log_info "No cached views found"
fi

# Final status
echo ""
if [ "$has_errors" = true ]; then
    log_error "ASSET DEPLOYMENT ISSUES DETECTED"
    echo ""
    log_warning "The Vite manifest error will occur because assets are missing."
    log_warning ""
    log_warning "SOLUTION (run on your LOCAL machine):"
    log_warning "1. cd /path/to/your/local/project"
    log_warning "2. ./build-for-production.sh"
    log_warning "3. git add public/build/"
    log_warning "4. git commit -m 'Add production build assets'"
    log_warning "5. git push origin main"
    log_warning ""
    log_warning "THEN on this server:"
    log_warning "1. git pull origin main"
    log_warning "2. php artisan config:clear"
    log_warning "3. php artisan view:clear"
    log_warning "4. Run this script again to verify"
    
    exit 1
else
    log_message "✓ ALL ASSETS ARE PROPERLY DEPLOYED"
    log_message "Vite manifest error should be resolved"
    echo ""
    log_info "Optional: Clear Laravel caches for good measure:"
    echo "  php artisan config:clear"
    echo "  php artisan view:clear"
    echo "  php artisan route:clear"
fi
