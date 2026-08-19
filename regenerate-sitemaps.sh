#!/bin/bash

# IndoQuran - Regenerate All Sitemaps
# This script regenerates all sitemap files by calling the Laravel routes

echo "🗺️  Regenerating IndoQuran Sitemaps..."
echo "========================================"

BASE_URL="https://indoquran.web.id"
if [ "$1" == "local" ]; then
    BASE_URL="http://localhost:8000"
    echo "Using LOCAL environment: $BASE_URL"
else
    echo "Using PRODUCTION environment: $BASE_URL"
fi

# Create backup directory
BACKUP_DIR="public/sitemaps-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo ""
echo "📦 Backing up existing sitemaps..."
cp public/sitemap*.xml "$BACKUP_DIR/" 2>/dev/null || echo "No existing sitemaps to backup"

echo ""
echo "🔄 Generating new sitemaps..."

# Generate all sitemaps using artisan
echo "  → Generating all production sitemaps..."
if [ "$1" == "local" ]; then
    php artisan sitemap:generate-comprehensive
else
    php artisan sitemap:generate-comprehensive --production
fi

echo ""
echo "✅ Sitemap regeneration complete!"
echo ""
echo "📊 Summary:"
echo "  - Main index: sitemap-index.xml"
echo "  - Main pages: sitemap-main.xml (114 Surahs + static pages)"
echo "  - Juz pages: sitemap-juz.xml (30 Juz)"
echo "  - Halaman pages: sitemap-halaman.xml (604 Mushaf pages)"
echo "  - Full sitemap: sitemap.xml"
echo ""
echo "🔍 Backup saved to: $BACKUP_DIR"
echo ""
echo "🌐 Submit to Google Search Console:"
echo "  https://search.google.com/search-console"
echo ""
echo "📝 Verify sitemaps:"
ls -lh public/sitemap*.xml
echo ""
echo "Done! ✨"
