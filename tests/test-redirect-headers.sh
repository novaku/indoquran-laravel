#!/bin/bash

# Test script untuk memverifikasi X-Robots-Tag header pada redirect URLs
# Script ini menguji apakah redirects mengembalikan header X-Robots-Tag: noindex

echo "=========================================="
echo "IndoQuran - Redirect Header Test"
echo "Testing X-Robots-Tag implementation"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test redirect with header
test_redirect() {
    local url=$1
    local description=$2
    
    echo -e "${YELLOW}Testing:${NC} $description"
    echo -e "URL: $url"
    
    # Get HTTP response headers
    response=$(curl -sI "$url")
    
    # Check for 301 redirect
    if echo "$response" | grep -q "301 Moved Permanently"; then
        echo -e "${GREEN}✓${NC} 301 Redirect found"
    else
        echo -e "${RED}✗${NC} No 301 redirect (might be OK if URL is canonical)"
    fi
    
    # Check for X-Robots-Tag header
    if echo "$response" | grep -qi "X-Robots-Tag.*noindex"; then
        echo -e "${GREEN}✓${NC} X-Robots-Tag: noindex header present"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} X-Robots-Tag header MISSING"
        ((FAILED++))
    fi
    
    # Show Location header
    location=$(echo "$response" | grep -i "Location:" | sed 's/Location: //i' | tr -d '\r\n')
    if [ -n "$location" ]; then
        echo -e "${GREEN}→${NC} Redirects to: $location"
    fi
    
    echo ""
}

# Base URL - change this for production testing
BASE_URL="http://localhost:8000"

echo "Base URL: $BASE_URL"
echo ""

# Test 1: Trailing slash redirect
test_redirect "${BASE_URL}/surah/1/" "Trailing slash on Surah page"

# Test 2: UTM parameter redirect
test_redirect "${BASE_URL}/surah/1?utm_source=facebook" "URL with utm_source parameter"

# Test 3: Multiple UTM parameters
test_redirect "${BASE_URL}/?utm_source=google&utm_medium=cpc&utm_campaign=ramadan" "Homepage with multiple UTM parameters"

# Test 4: Facebook click ID
test_redirect "${BASE_URL}/surah/2?fbclid=IwAR123456" "URL with Facebook click ID"

# Test 5: Google click ID
test_redirect "${BASE_URL}/juz/1?gclid=abc123xyz" "URL with Google click ID"

# Test 6: Tracking parameter combination
test_redirect "${BASE_URL}/surah/3?ref=twitter&utm_source=social" "URL with ref and utm_source"

# Test 7: Trailing slash + parameters
test_redirect "${BASE_URL}/surah/4/?utm_medium=email" "Trailing slash + UTM parameter"

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo "The X-Robots-Tag header is properly implemented."
    exit 0
else
    echo -e "${RED}✗ Some tests failed!${NC}"
    echo "Please check the middleware implementation."
    exit 1
fi
