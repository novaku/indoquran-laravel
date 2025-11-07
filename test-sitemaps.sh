#!/bin/bash

# IndoQuran - Sitemap Validation Test
# Tests all sitemaps for Google Search Console compliance

echo "🔍 Testing IndoQuran Sitemaps"
echo "============================="
echo ""

# Check if xmllint is available
if ! command -v xmllint &> /dev/null; then
    echo "⚠️  xmllint not found. Installing via Homebrew..."
    brew install libxml2
fi

SITEMAP_DIR="public"
ERRORS=0

echo "📋 Testing sitemap files..."
echo ""

# Test each sitemap file
for sitemap in "$SITEMAP_DIR"/sitemap*.xml; do
    if [ -f "$sitemap" ]; then
        filename=$(basename "$sitemap")
        echo -n "  Testing $filename... "
        
        # Validate XML structure
        if xmllint --noout "$sitemap" 2>/dev/null; then
            # Check for future dates
            current_date=$(date +%Y-%m-%d)
            future_dates=$(grep -o '<lastmod>[^<]*</lastmod>' "$sitemap" | grep -o '[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}' | while read date; do
                if [[ "$date" > "$current_date" ]]; then
                    echo "$date"
                fi
            done)
            
            if [ -n "$future_dates" ]; then
                echo "❌ FAILED (Future dates found: $future_dates)"
                ERRORS=$((ERRORS + 1))
            else
                # Check file size (should be < 50MB and < 50,000 URLs)
                size=$(stat -f%z "$sitemap" 2>/dev/null || stat -c%s "$sitemap" 2>/dev/null)
                url_count=$(grep -c '<loc>' "$sitemap")
                
                if [ "$size" -gt 52428800 ]; then
                    echo "⚠️  WARNING (File too large: $((size / 1024 / 1024))MB > 50MB)"
                    ERRORS=$((ERRORS + 1))
                elif [ "$url_count" -gt 50000 ]; then
                    echo "⚠️  WARNING (Too many URLs: $url_count > 50,000)"
                    ERRORS=$((ERRORS + 1))
                else
                    echo "✅ PASSED ($url_count URLs, $((size / 1024))KB)"
                fi
            fi
        else
            echo "❌ FAILED (Invalid XML)"
            ERRORS=$((ERRORS + 1))
        fi
    fi
done

echo ""
echo "📊 Testing robots.txt..."
if [ -f "$SITEMAP_DIR/robots.txt" ]; then
    if grep -q "Sitemap: https://indoquran.web.id/sitemap" "$SITEMAP_DIR/robots.txt"; then
        echo "  ✅ Sitemap references found in robots.txt"
    else
        echo "  ❌ No sitemap references in robots.txt"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "  ❌ robots.txt not found"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "🌐 Testing sitemap accessibility..."

# Test if Laravel server is running
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/sitemap.xml | grep -q "200"; then
    echo "  ✅ Local sitemap accessible at http://localhost:8000/sitemap.xml"
else
    echo "  ⚠️  Local server not running or sitemap not accessible"
fi

# Test production sitemap
if curl -s -o /dev/null -w "%{http_code}" https://indoquran.web.id/sitemap.xml | grep -q "200"; then
    echo "  ✅ Production sitemap accessible at https://indoquran.web.id/sitemap.xml"
else
    echo "  ⚠️  Production sitemap not accessible"
fi

echo ""
echo "============================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ All tests passed!"
    echo ""
    echo "Next steps:"
    echo "1. Submit sitemaps to Google Search Console"
    echo "2. Verify sitemap index at: https://indoquran.web.id/sitemap-index.xml"
    echo "3. Monitor indexing status in Search Console"
else
    echo "❌ $ERRORS error(s) found"
    echo ""
    echo "Please fix the errors and run this test again."
fi
echo ""
