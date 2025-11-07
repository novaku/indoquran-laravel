#!/bin/bash

# Google Search Console - 404 Validation Test Script
# Tests all implemented fixes for 404 error handling
# Author: IndoQuran Development Team
# Date: November 7, 2025

echo "=================================================="
echo "  Google Search Console - 404 Validation Tests"
echo "=================================================="
echo ""

# Configuration
BASE_URL="${1:-http://localhost:8000}"
PRODUCTION_URL="https://indoquran.web.id"

echo "Testing Base URL: $BASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test HTTP status code
test_http_status() {
    local url="$1"
    local expected_status="$2"
    local description="$3"
    
    echo -ne "${BLUE}Testing:${NC} $description ... "
    
    # Get HTTP status code
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $status)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected HTTP $expected_status, got HTTP $status)"
        ((TESTS_FAILED++))
    fi
}

# Function to test redirect with X-Robots-Tag
test_redirect_with_noindex() {
    local url="$1"
    local description="$2"
    
    echo -ne "${BLUE}Testing:${NC} $description ... "
    
    # Get headers
    headers=$(curl -s -I "$url")
    status=$(echo "$headers" | grep -i "HTTP" | tail -1 | awk '{print $2}')
    xrobots=$(echo "$headers" | grep -i "X-Robots-Tag" | grep -i "noindex")
    
    if [ "$status" = "301" ] || [ "$status" = "302" ]; then
        if [ -n "$xrobots" ]; then
            echo -e "${GREEN}✓ PASS${NC} (HTTP $status + X-Robots-Tag: noindex)"
            ((TESTS_PASSED++))
        else
            echo -e "${YELLOW}⚠ WARNING${NC} (HTTP $status but missing X-Robots-Tag: noindex)"
            ((TESTS_FAILED++))
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (Expected HTTP 301/302, got HTTP $status)"
        ((TESTS_FAILED++))
    fi
}

# Function to test content includes string
test_content_includes() {
    local url="$1"
    local search_string="$2"
    local description="$3"
    
    echo -ne "${BLUE}Testing:${NC} $description ... "
    
    # Get content
    content=$(curl -s "$url")
    
    if echo "$content" | grep -q "$search_string"; then
        echo -e "${GREEN}✓ PASS${NC} (Found: '$search_string')"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Not found: '$search_string')"
        ((TESTS_FAILED++))
    fi
}

echo "========================================="
echo " 1. Testing Invalid Routes (Should 404)"
echo "========================================="
echo ""

test_http_status "$BASE_URL/surah/999" "404" "Invalid surah number (999)"
test_http_status "$BASE_URL/surah/0" "404" "Invalid surah number (0)"
test_http_status "$BASE_URL/surah/-1" "404" "Invalid surah number (-1)"
test_http_status "$BASE_URL/surah/200" "404" "Invalid surah number (200)"

test_http_status "$BASE_URL/juz/0" "404" "Invalid juz number (0)"
test_http_status "$BASE_URL/juz/31" "404" "Invalid juz number (31)"
test_http_status "$BASE_URL/juz/99" "404" "Invalid juz number (99)"

test_http_status "$BASE_URL/halaman/0" "404" "Invalid page number (0)"
test_http_status "$BASE_URL/halaman/605" "404" "Invalid page number (605)"
test_http_status "$BASE_URL/halaman/999" "404" "Invalid page number (999)"

test_http_status "$BASE_URL/invalid-route-xyz" "404" "Non-existent route"
test_http_status "$BASE_URL/random-page-123" "404" "Random invalid page"

echo ""
echo "========================================="
echo " 2. Testing Valid Routes (Should 200)"
echo "========================================="
echo ""

test_http_status "$BASE_URL/" "200" "Homepage"
test_http_status "$BASE_URL/surah/1" "200" "Valid surah (Al-Fatihah)"
test_http_status "$BASE_URL/surah/2" "200" "Valid surah (Al-Baqarah)"
test_http_status "$BASE_URL/surah/114" "200" "Valid surah (An-Nas)"

test_http_status "$BASE_URL/juz/1" "200" "Valid juz (1)"
test_http_status "$BASE_URL/juz/30" "200" "Valid juz (30)"

test_http_status "$BASE_URL/halaman/1" "200" "Valid page (1)"
test_http_status "$BASE_URL/halaman/604" "200" "Valid page (604)"

test_http_status "$BASE_URL/cari" "200" "Search page"
test_http_status "$BASE_URL/tentang" "200" "About page"

echo ""
echo "========================================="
echo " 3. Testing Redirects (Should 301 + noindex)"
echo "========================================="
echo ""

# Note: These tests work best on production with proper .htaccess
# On local dev, some might not trigger due to Vite dev server

test_redirect_with_noindex "$BASE_URL/surah/1/" "Trailing slash redirect"
test_redirect_with_noindex "$BASE_URL/cari/" "Search page trailing slash"

# Query parameter redirects (if implemented)
# test_redirect_with_noindex "$BASE_URL/surah/1?utm_source=test" "UTM parameter redirect"

echo ""
echo "========================================="
echo " 4. Testing NotFoundPage Content"
echo "========================================="
echo ""

test_content_includes "$BASE_URL/surah/999" "404" "404 page shows 404 status"
test_content_includes "$BASE_URL/surah/999" "Halaman Tidak Ditemukan" "404 page shows Indonesian text"
test_content_includes "$BASE_URL/invalid-route" "Beranda" "404 page has homepage link"

echo ""
echo "========================================="
echo " 5. Testing robots.txt Configuration"
echo "========================================="
echo ""

test_content_includes "$BASE_URL/robots.txt" "Disallow: /masuk" "robots.txt blocks /masuk"
test_content_includes "$BASE_URL/robots.txt" "Disallow: /api/" "robots.txt blocks /api/"
test_content_includes "$BASE_URL/robots.txt" "Disallow: /*?*utm_source=" "robots.txt blocks UTM params"
test_content_includes "$BASE_URL/robots.txt" "Disallow: /*/" "robots.txt blocks trailing slashes"
test_content_includes "$BASE_URL/robots.txt" "Sitemap:" "robots.txt includes sitemap URL"

echo ""
echo "========================================="
echo " 6. Testing Sitemap Validity"
echo "========================================="
echo ""

test_content_includes "$BASE_URL/sitemap.xml" "<urlset" "Sitemap is valid XML"
test_content_includes "$BASE_URL/sitemap.xml" "/surah/1" "Sitemap includes valid surah"
test_content_includes "$BASE_URL/sitemap.xml" "<loc>$BASE_URL</loc>" "Sitemap includes homepage"

# Verify sitemap does NOT include invalid URLs
echo -ne "${BLUE}Testing:${NC} Sitemap excludes invalid URLs ... "
sitemap_content=$(curl -s "$BASE_URL/sitemap.xml")
if echo "$sitemap_content" | grep -q "/surah/999"; then
    echo -e "${RED}✗ FAIL${NC} (Found invalid URL in sitemap)"
    ((TESTS_FAILED++))
else
    echo -e "${GREEN}✓ PASS${NC} (No invalid URLs found)"
    ((TESTS_PASSED++))
fi

echo ""
echo "========================================="
echo " 7. Testing Security Patterns (Should 404)"
echo "========================================="
echo ""

test_http_status "$BASE_URL/wp-admin" "404" "WordPress admin path blocked"
test_http_status "$BASE_URL/.env" "404" ".env file not accessible"
test_http_status "$BASE_URL/phpmyadmin" "404" "phpMyAdmin path blocked"
test_http_status "$BASE_URL/config/database.php" "404" "Config files not accessible"

echo ""
echo "=================================================="
echo "                  TEST SUMMARY"
echo "=================================================="
echo ""
echo -e "${GREEN}Passed:${NC} $TESTS_PASSED tests"
echo -e "${RED}Failed:${NC} $TESTS_FAILED tests"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Deploy to production if not already done"
    echo "2. Access Google Search Console"
    echo "3. Navigate to Pages > 404 errors"
    echo "4. Click 'VALIDATE FIX' button"
    echo "5. Monitor validation progress (14-30 days)"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review the errors above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "1. Clear Laravel cache: php artisan cache:clear"
    echo "2. Restart development server"
    echo "3. Check middleware registration in bootstrap/app.php"
    echo "4. Verify .htaccess configuration (production only)"
    echo ""
    exit 1
fi
