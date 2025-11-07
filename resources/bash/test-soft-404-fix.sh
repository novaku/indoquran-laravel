#!/bin/bash

# Test script for Soft 404 Fix Implementation
# This script tests various URLs to ensure proper HTTP status codes are returned

echo "=============================================="
echo "IndoQuran - Soft 404 Fix Test"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL (change this if testing locally)
BASE_URL="http://localhost:8000"

# Counter for passed/failed tests
PASSED=0
FAILED=0

# Function to test a URL
test_url() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Testing: $description... "
    
    # Get HTTP status code
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" == "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $status)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected HTTP $expected_status, got HTTP $status)"
        ((FAILED++))
    fi
}

echo "Testing VALID routes (should return HTTP 200):"
echo "----------------------------------------------"
test_url "$BASE_URL/" "200" "Homepage"
test_url "$BASE_URL/surah" "200" "Surah list page"
test_url "$BASE_URL/surah/1" "200" "Surah 1 (Al-Fatihah)"
test_url "$BASE_URL/surah/2" "200" "Surah 2 (Al-Baqarah)"
test_url "$BASE_URL/surah/114" "200" "Surah 114 (An-Nas)"
test_url "$BASE_URL/juz/1" "200" "Juz 1"
test_url "$BASE_URL/juz/30" "200" "Juz 30"
test_url "$BASE_URL/halaman/1" "200" "Halaman 1"
test_url "$BASE_URL/halaman/604" "200" "Halaman 604"
test_url "$BASE_URL/cari" "200" "Search page"
test_url "$BASE_URL/tentang" "200" "About page"

echo ""
echo "Testing INVALID routes (should return HTTP 404):"
echo "------------------------------------------------"
test_url "$BASE_URL/surah/0" "404" "Invalid surah number (0)"
test_url "$BASE_URL/surah/115" "404" "Invalid surah number (115)"
test_url "$BASE_URL/surah/999" "404" "Invalid surah number (999)"
test_url "$BASE_URL/juz/0" "404" "Invalid juz number (0)"
test_url "$BASE_URL/juz/31" "404" "Invalid juz number (31)"
test_url "$BASE_URL/juz/99" "404" "Invalid juz number (99)"
test_url "$BASE_URL/halaman/0" "404" "Invalid halaman number (0)"
test_url "$BASE_URL/halaman/605" "404" "Invalid halaman number (605)"
test_url "$BASE_URL/halaman/999" "404" "Invalid halaman number (999)"
test_url "$BASE_URL/random-invalid-page" "404" "Random non-existent page"
test_url "$BASE_URL/this-does-not-exist" "404" "Another non-existent page"
test_url "$BASE_URL/wp-admin" "404" "Attack pattern (wp-admin)"
test_url "$BASE_URL/wp-login.php" "404" "Attack pattern (wp-login)"

echo ""
echo "=============================================="
echo "Test Results Summary"
echo "=============================================="
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Soft 404 fix is working correctly.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the implementation.${NC}"
    exit 1
fi
