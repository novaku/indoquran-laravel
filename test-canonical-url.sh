#!/bin/bash

# Test Canonical URL Consistency
# Memeriksa apakah canonical URL sudah konsisten di semua halaman
# Reference: https://developers.google.com/search/docs/crawling-indexing/canonicalization

echo "🔍 Testing Canonical URL Implementation for IndoQuran"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test URLs
BASE_URL="http://localhost:5173"
PRODUCTION_URL="https://indoquran.web.id"

# Function to test canonical URL
test_canonical() {
    local url=$1
    local expected_canonical=$2
    local page_name=$3
    
    echo "Testing: $page_name"
    echo "URL: $url"
    
    # Fetch the page and extract canonical URL
    canonical=$(curl -s "$url" | grep -o '<link rel="canonical"[^>]*' | grep -o 'href="[^"]*"' | cut -d'"' -f2)
    
    if [ -z "$canonical" ]; then
        echo -e "${RED}❌ FAIL: No canonical tag found${NC}"
        echo ""
        return 1
    fi
    
    if [ "$canonical" = "$expected_canonical" ]; then
        echo -e "${GREEN}✅ PASS: Canonical URL is correct${NC}"
        echo "   Found: $canonical"
    else
        echo -e "${RED}❌ FAIL: Canonical URL mismatch${NC}"
        echo "   Expected: $expected_canonical"
        echo "   Found: $canonical"
    fi
    
    echo ""
    return 0
}

# Function to check for duplicate canonical tags
check_duplicate_canonical() {
    local url=$1
    local page_name=$2
    
    echo "Checking for duplicates: $page_name"
    
    # Count canonical tags
    count=$(curl -s "$url" | grep -c 'rel="canonical"')
    
    if [ "$count" -eq 1 ]; then
        echo -e "${GREEN}✅ PASS: Only one canonical tag found${NC}"
    elif [ "$count" -gt 1 ]; then
        echo -e "${RED}❌ FAIL: Multiple canonical tags found ($count)${NC}"
        echo "   This will confuse Google!"
    else
        echo -e "${YELLOW}⚠️  WARNING: No canonical tag found${NC}"
    fi
    
    echo ""
}

# Function to test URL normalization
test_url_normalization() {
    local base_url=$1
    local path=$2
    local expected_canonical=$3
    
    echo "Testing URL normalization for: $path"
    
    # Test with trailing slash
    test_canonical "${base_url}${path}/" "$expected_canonical" "With trailing slash"
    
    # Test without trailing slash
    test_canonical "${base_url}${path}" "$expected_canonical" "Without trailing slash"
    
    # Test with query params (should be removed if not content-changing)
    test_canonical "${base_url}${path}?utm_source=test&utm_medium=test" "$expected_canonical" "With tracking params"
}

echo "Testing in Development (localhost:5173)"
echo "========================================"
echo ""

# Test homepage
test_canonical "$BASE_URL/" "$BASE_URL/" "Homepage"
check_duplicate_canonical "$BASE_URL/" "Homepage"

# Test surah pages
test_canonical "$BASE_URL/surah/1" "$BASE_URL/surah/1" "Surah Al-Fatihah"
check_duplicate_canonical "$BASE_URL/surah/1" "Surah Al-Fatihah"

# Test search page (query param should be kept)
test_canonical "$BASE_URL/cari?q=allah" "$BASE_URL/cari?q=allah" "Search with query"
check_duplicate_canonical "$BASE_URL/cari?q=allah" "Search"

# Test static pages
test_canonical "$BASE_URL/tentang" "$BASE_URL/tentang" "About page"
test_canonical "$BASE_URL/tafsir-maudhui" "$BASE_URL/tafsir-maudhui" "Tafsir Maudhui"
test_canonical "$BASE_URL/asmaul-husna" "$BASE_URL/asmaul-husna" "Asmaul Husna"

echo ""
echo "Testing URL Normalization"
echo "========================="
echo ""

# Test normalization for common pages
test_url_normalization "$BASE_URL" "/surah/2" "$BASE_URL/surah/2"

echo ""
echo "=================================================="
echo "Testing Complete!"
echo ""
echo "📋 Summary:"
echo "  - Canonical tags should always use HTTPS"
echo "  - Canonical tags should use production domain (indoquran.web.id)"
echo "  - Trailing slashes should be removed (except root /)"
echo "  - Only content-changing query params should be kept (q, page, etc.)"
echo "  - Tracking params (utm_*, fbclid, etc.) should be removed"
echo "  - There should be exactly ONE canonical tag per page"
echo ""
echo "🔗 Google Guidelines:"
echo "  https://developers.google.com/search/docs/crawling-indexing/canonicalization"
echo ""

# Instructions for production testing
echo "To test in production:"
echo "  1. Build production: npm run build"
echo "  2. Deploy to server"
echo "  3. Test with: curl -s https://indoquran.web.id | grep canonical"
echo "  4. Check Google Search Console for canonical issues"
echo ""
