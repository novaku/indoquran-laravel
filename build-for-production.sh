#!/bin/bash

# Build script for IndoQuran Laravel + React app (Production)
# This script should be run on your local machine before deploying to production

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

log_message "Starting production build process..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Clean previous build
log_message "Cleaning previous build..."
if [ -d "public/build" ]; then
    rm -rf public/build
    log_info "Previous build directory removed"
fi

# Install dependencies
log_message "Installing Node.js dependencies..."
npm ci || { log_error "Failed to install dependencies"; exit 1; }

# Build for production
log_message "Building assets for production..."
npm run build || { log_error "Build failed"; exit 1; }

# Verify build output
log_message "Verifying build output..."
if [ -f "public/build/manifest.json" ]; then
    log_message "✓ Manifest file created successfully"
else
    log_error "✗ Manifest file not found after build"
    exit 1
fi

# Check if assets directory exists
if [ -d "public/build/assets" ]; then
    asset_count=$(find public/build/assets -type f | wc -l)
    log_message "✓ Assets directory created with $asset_count files"
else
    log_warning "✗ Assets directory not found"
fi

# Display build information
log_info "Build completed successfully!"
log_info "Build artifacts are ready in public/build/"
log_info ""
log_info "Next steps:"
log_info "1. Commit and push the build files to your repository"
log_info "2. Run the deployment script on your production server"
log_info ""
log_info "Files to commit:"
log_info "- public/build/manifest.json"
log_info "- public/build/assets/*"

# Optional: Show build size
if command -v du &> /dev/null; then
    build_size=$(du -sh public/build 2>/dev/null | cut -f1)
    log_info "Total build size: $build_size"
fi

log_message "Production build process completed!"
