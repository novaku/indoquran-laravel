#!/bin/bash

# Quick Fix Deploy Script untuk Google Indexing Issue
# Jalankan setelah semua perubahan selesai

echo "=========================================="
echo "IndoQuran - Deploy Google Indexing Fix"
echo "=========================================="
echo ""

# Check if in correct directory
if [ ! -f "artisan" ]; then
    echo "❌ Error: Harus dijalankan dari root directory Laravel"
    exit 1
fi

echo "📋 Langkah 1: Verify changes..."
echo ""

# Check robots.txt
if grep -q "Disallow: /\*/" public/robots.txt; then
    echo "❌ ERROR: robots.txt masih memblokir /*/"
    echo "   Silakan fix manual: hapus baris 'Disallow: /*/'"
    exit 1
else
    echo "✅ robots.txt - Trailing slash blocking removed"
fi

# Check canonical tag in Blade
if grep -q 'rel="canonical"' resources/views/react.blade.php; then
    echo "✅ Blade template - Canonical tag exists"
else
    echo "❌ WARNING: Canonical tag not found in Blade template"
fi

# Check JSON-LD
if grep -q 'application/ld+json' resources/views/react.blade.php; then
    echo "✅ Blade template - Structured data (JSON-LD) exists"
else
    echo "❌ WARNING: JSON-LD structured data not found"
fi

# Check noscript
if grep -q '<noscript>' resources/views/react.blade.php; then
    echo "✅ Blade template - Noscript content exists"
else
    echo "❌ WARNING: Noscript content not found"
fi

echo ""
echo "📋 Langkah 2: Clear caches..."
echo ""

php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

echo "✅ Caches cleared"
echo ""

echo "📋 Langkah 3: Build production assets..."
echo ""

if [ -f "./build-production.sh" ]; then
    ./build-production.sh
else
    npm run build
fi

echo ""
echo "✅ Production build completed"
echo ""

echo "=========================================="
echo "✅ Deploy preparation completed!"
echo "=========================================="
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Deploy to production server:"
echo "   ./deploy-production.sh"
echo ""
echo "2. Test dengan script:"
echo "   ./test-google-indexing.sh"
echo ""
echo "3. Submit di Google Search Console:"
echo "   - URL Inspection Tool: Test & Request Indexing"
echo "   - Submit sitemap: sitemap-index.xml"
echo "   - Start validation untuk 'Di-crawl - saat ini tidak diindeks'"
echo ""
echo "4. Monitor progress di Search Console"
echo "   https://search.google.com/search-console"
echo ""
echo "📖 Dokumentasi lengkap: docs/GOOGLE_INDEXING_FIX.md"
echo ""
