#!/bin/bash

# Quick fix for Vite manifest error
# This script will build the assets and prepare them for immediate deployment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

log_message() {
    echo -e "${GREEN}[QUICK FIX]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_message "Running quick fix for Vite manifest error..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Please run this from the project root."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    log_message "Installing dependencies..."
    npm ci
fi

# Build the assets
log_message "Building production assets..."
npm run build

# Check if build succeeded
if [ -f "public/build/manifest.json" ]; then
    log_message "✓ Build completed successfully!"
    log_message "✓ Manifest file created"
    
    # Show what needs to be deployed
    log_message ""
    log_message "IMMEDIATE DEPLOYMENT STEPS:"
    log_message "1. Upload the entire public/build/ directory to your server"
    log_message "2. Or commit and push these files, then pull on server:"
    echo "   git add public/build/"
    echo "   git commit -m 'Fix: Add Vite build files to resolve manifest error'"
    echo "   git push origin main"
    log_message ""
    log_message "3. On your server, run:"
    echo "   git pull origin main"
    echo "   php artisan config:clear"
    echo "   php artisan view:clear"
    
    log_message ""
    log_message "The Vite manifest error should be resolved after these steps."
else
    log_error "Build failed - manifest.json not created"
    log_error "Please check the build output above for errors"
    exit 1
fi
