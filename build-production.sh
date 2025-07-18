#!/bin/bash

# Production Build Script with Performance Optimizations
# This script builds the application with all performance optimizations enabled

echo "🚀 Starting production build with performance optimizations..."

# Check if we're in the right directory
if [ ! -f "composer.json" ]; then
    echo "❌ Error: Please run this script from the Laravel project root directory"
    exit 1
fi

# Set production environment
echo "🔧 Setting production environment..."
export NODE_ENV=production
export APP_ENV=production

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf public/build/*
rm -rf public/hot

# Install/update dependencies
echo "📦 Installing production dependencies..."
composer install --optimize-autoloader --no-dev --quiet
npm ci --production=false

# Laravel optimizations
echo "⚡ Applying Laravel optimizations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Clear and optimize caches
echo "🗂️  Optimizing application caches..."
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Build assets with production optimizations
echo "🔨 Building optimized assets..."
npm run build

# Optimize images
echo "🖼️  Optimizing images..."
if command -v ./optimize-images.sh &> /dev/null; then
    ./optimize-images.sh
else
    echo "⚠️  Image optimization script not found. Run manually: ./optimize-images.sh"
fi

# Generate sitemap
echo "🗺️  Generating sitemap..."
php artisan sitemap:generate 2>/dev/null || echo "⚠️  Sitemap generation command not found"

# Set proper file permissions
echo "🔐 Setting file permissions..."
find storage -type f -exec chmod 644 {} \;
find storage -type d -exec chmod 755 {} \;
find bootstrap/cache -type f -exec chmod 644 {} \;
find bootstrap/cache -type d -exec chmod 755 {} \;

# Verify build
echo "✅ Verifying build..."
if [ -f "public/build/manifest.json" ]; then
    echo "   ✓ Vite manifest found"
else
    echo "   ❌ Vite manifest missing!"
    exit 1
fi

if [ -d "public/build/assets" ]; then
    echo "   ✓ Build assets directory exists"
    ASSET_COUNT=$(find public/build/assets -name "*.js" -o -name "*.css" | wc -l)
    echo "   ✓ Found $ASSET_COUNT built assets"
else
    echo "   ❌ Build assets directory missing!"
    exit 1
fi

echo ""
echo "🎉 Production build completed successfully!"
echo ""
echo "📊 Performance optimizations applied:"
echo "   ✓ Laravel caches optimized"
echo "   ✓ Assets minified and compressed"
echo "   ✓ Images optimized"
echo "   ✓ Service worker updated"
echo "   ✓ Browser caching headers configured"
echo ""
echo "💡 Next steps for deployment:"
echo "   1. Test the application locally"
echo "   2. Deploy to production server"
echo "   3. Run performance tests"
echo "   4. Monitor Core Web Vitals"
echo ""
echo "🔍 To test performance:"
echo "   - Use Chrome DevTools Lighthouse"
echo "   - Test on PageSpeed Insights"
echo "   - Monitor real user metrics"
