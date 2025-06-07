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
php artisan config:clear
php artisan config:cache
php artisan route:clear
php artisan route:cache
php artisan view:clear
php artisan view:cache

# Migrate database if needed
log_message "Running database migrations..."
php artisan migrate --force

# Set proper permissions
log_message "Setting permissions..."
find storage bootstrap/cache -type d -exec chmod 775 {} \;
find storage bootstrap/cache -type f -exec chmod 664 {} \;

# Copy production .htaccess
log_message "Setting up production .htaccess..."
if [ -f public/.htaccess.production ]; then
    cp public/.htaccess.production public/.htaccess
    log_message "Copied production .htaccess"
else
    log_error "public/.htaccess.production file not found!"
    log_warning "The application may not work correctly without proper .htaccess configuration"
fi

# Verify the build directory exists
log_message "Checking build directory..."
if [ -d public/build ]; then
    log_message "Build directory found"
else
    log_error "public/build directory not found!"
    log_warning "Frontend assets must be built locally and uploaded to the server first"
    log_warning "Run build-for-production.sh on your local machine before deploying"
fi

# Clear OPcache if available
log_message "Clearing OPcache..."
php -r "if(function_exists('opcache_reset')) { opcache_reset(); echo 'OPcache cleared'; } else { echo 'OPcache not available'; }"

# Verify the URL structure
log_message "Verifying URL structure..."
if [ -f test-production-urls.sh ]; then
    log_message "Running URL verification test..."
    ./test-production-urls.sh
else
    log_warning "test-production-urls.sh not found. Skipping URL verification."
fi

log_message "Deployment completed successfully!"
log_message "Your IndoQuran application should now be running with all assets correctly prefixed with /public in production."
