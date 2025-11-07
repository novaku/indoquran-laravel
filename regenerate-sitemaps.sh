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

# Generate main sitemap index
echo "  → Generating sitemap-index.xml..."
curl -s "$BASE_URL/sitemap-index.xml" > public/sitemap-index.xml

# Generate main sitemap
echo "  → Generating sitemap-main.xml..."
curl -s "$BASE_URL/sitemap-main.xml" > public/sitemap-main.xml

# Generate surah group sitemaps (6 groups of ~20 surahs each)
for i in {1..6}; do
    echo "  → Generating sitemap-surahs-$i.xml..."
    curl -s "$BASE_URL/sitemap-surahs-$i.xml" > "public/sitemap-surahs-$i.xml"
done

# Generate juz sitemap
echo "  → Generating sitemap-juz.xml..."
curl -s "$BASE_URL/sitemap-juz.xml" > public/sitemap-juz.xml

# Generate main sitemap.xml (full)
echo "  → Generating sitemap.xml..."
curl -s "$BASE_URL/sitemap.xml" > public/sitemap.xml

echo ""
echo "✅ Sitemap regeneration complete!"
echo ""
echo "📊 Summary:"
echo "  - Main index: sitemap-index.xml"
echo "  - Main pages: sitemap-main.xml"
echo "  - Surah groups: sitemap-surahs-{1-6}.xml"
echo "  - Juz pages: sitemap-juz.xml"
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
