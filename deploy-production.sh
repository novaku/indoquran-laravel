#!/bin/bash

# Production deployment script for IndoQuran Laravel + React app
# This script should be run on the production server

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

log_message "Starting deployment process..."

# Pull the latest changes from the repository
log_message "Pulling latest changes from git..."
git pull origin main || { log_error "Failed to pull from git"; exit 1; }

# Install PHP dependencies
log_message "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader || { log_error "Failed to install PHP dependencies"; exit 1; }

# Clear and recache Laravel configs
log_message "Optimizing Laravel..."
php artisan config:cache
php artisan config:clear
php artisan route:clear
php artisan route:cache
php artisan view:clear
php artisan view:cache

# Set proper permissions
log_message "Setting permissions..."
find storage bootstrap/cache -type d -exec chmod 775 {} \;
find storage bootstrap/cache -type f -exec chmod 664 {} \;

# Verify the build directory exists
log_message "Checking build directory..."
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
        if [ $asset_count -gt 0 ]; then
            log_message "✓ Found $asset_count asset files"
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

log_message "Deployment completed successfully!"
log_message "Your IndoQuran application should now be running with all assets correctly prefixed with /public in production."
