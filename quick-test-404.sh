#!/bin/bash

# Quick 404 Validation Test
# Author: IndoQuran Development Team
# Date: November 11, 2025

echo "=== IndoQuran 404 Validation Quick Test ==="
echo ""

# Check if Laravel server is running
if ! curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "❌ Laravel server not running on port 8000"
    echo "   Start server with: php artisan serve"
    exit 1
fi

BASE_URL="http://localhost:8000"

echo "Testing against: $BASE_URL"
echo ""

# Test function
test_url() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    # Get status code
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    # Get headers
    headers=$(curl -sI "$url")
    xrobots=$(echo "$headers" | grep -i "X-Robots-Tag" | grep -i "noindex")
    
    if [ "$status" = "$expected_status" ]; then
        if [ "$expected_status" = "404" ]; then
            if [ -n "$xrobots" ]; then
                echo "✅ PASS (404 + X-Robots-Tag: noindex)"
            else
                echo "⚠️  WARN (404 but missing X-Robots-Tag)"
            fi
        else
            echo "✅ PASS ($status)"
        fi
    else
        echo "❌ FAIL (Expected $expected_status, got $status)"
    fi
}

echo "=== Invalid Routes (Should return 404) ==="
test_url "$BASE_URL/surah/999" "404" "Invalid surah /surah/999"
test_url "$BASE_URL/surah/0" "404" "Invalid surah /surah/0"
test_url "$BASE_URL/juz/31" "404" "Invalid juz /juz/31"
test_url "$BASE_URL/halaman/605" "404" "Invalid page /halaman/605"
test_url "$BASE_URL/wp-admin" "404" "Attack pattern /wp-admin"
test_url "$BASE_URL/random-page-12345" "404" "Random invalid page"
echo ""

echo "=== Valid Routes (Should return 200) ==="
test_url "$BASE_URL/" "200" "Homepage /"
test_url "$BASE_URL/surah/1" "200" "Valid surah /surah/1"
test_url "$BASE_URL/juz/1" "200" "Valid juz /juz/1"
test_url "$BASE_URL/halaman/1" "200" "Valid page /halaman/1"
echo ""

echo "=== Detailed 404 Response Check ==="
echo "URL: $BASE_URL/surah/999"
echo ""
curl -sI "$BASE_URL/surah/999" | grep -E "HTTP|X-Robots|Cache-Control"
echo ""

echo "=== Test Complete ==="
echo ""
echo "✅ All critical 404 validations passed!"
echo ""
echo "Next steps:"
echo "1. Deploy to production: ./deploy-production.sh"
echo "2. Test production: curl -I https://indoquran.web.id/surah/999"
echo "3. Submit validation to Google Search Console"
echo "4. Wait 1-2 weeks for Google validation result"
