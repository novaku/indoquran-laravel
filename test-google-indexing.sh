#!/bin/bash

# Script untuk testing masalah "Di-crawl - saat ini tidak diindeks"
# Menguji berbagai aspek yang mempengaruhi indexing Google

echo "=========================================="
echo "IndoQuran - Google Indexing Test Suite"
echo "Testing untuk masalah 'Di-crawl - saat ini tidak diindeks'"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test URLs
BASE_URL="https://indoquran.web.id"
TEST_URLS=(
    "$BASE_URL"
    "$BASE_URL/surah/1"
    "$BASE_URL/semua-surah"
    "$BASE_URL/juz"
    "$BASE_URL/cari"
)

echo "Test 1: Checking robots.txt blocking"
echo "======================================="
echo ""
curl -s "$BASE_URL/robots.txt" | grep -E "Disallow:|Allow:" | head -20
echo ""
echo -e "${GREEN}✓ Robots.txt check completed${NC}"
echo ""

echo "Test 2: Checking canonical URLs"
echo "======================================="
echo ""
for url in "${TEST_URLs[@]}"; do
    echo "Testing: $url"
    canonical=$(curl -sL "$url" | grep -oP '(?<=<link rel="canonical" href=")[^"]+' | head -1)
    if [ -z "$canonical" ]; then
        echo -e "${RED}✗ No canonical tag found${NC}"
    else
        echo -e "${GREEN}✓ Canonical: $canonical${NC}"
    fi
    echo ""
done

echo "Test 3: Checking meta robots tags"
echo "======================================="
echo ""
for url in "${TEST_URLs[@]}"; do
    echo "Testing: $url"
    robots_tag=$(curl -sL "$url" | grep -oP '(?<=<meta name="robots" content=")[^"]+' | head -1)
    if [ -z "$robots_tag" ]; then
        echo -e "${YELLOW}⚠ No robots meta tag found${NC}"
    else
        if echo "$robots_tag" | grep -q "noindex"; then
            echo -e "${RED}✗ Contains noindex: $robots_tag${NC}"
        else
            echo -e "${GREEN}✓ Robots: $robots_tag${NC}"
        fi
    fi
    echo ""
done

echo "Test 4: Checking structured data (JSON-LD)"
echo "======================================="
echo ""
for url in "${TEST_URLs[@]}"; do
    echo "Testing: $url"
    has_jsonld=$(curl -sL "$url" | grep -c 'application/ld+json')
    if [ "$has_jsonld" -gt 0 ]; then
        echo -e "${GREEN}✓ Found $has_jsonld JSON-LD structured data blocks${NC}"
    else
        echo -e "${YELLOW}⚠ No JSON-LD structured data found${NC}"
    fi
    echo ""
done

echo "Test 5: Checking noscript content"
echo "======================================="
echo ""
homepage_content=$(curl -sL "$BASE_URL" | grep -oP '(?<=<noscript>).*?(?=</noscript>)' | wc -c)
if [ "$homepage_content" -gt 500 ]; then
    echo -e "${GREEN}✓ Noscript content found (${homepage_content} characters)${NC}"
else
    echo -e "${YELLOW}⚠ Noscript content might be too short (${homepage_content} characters)${NC}"
fi
echo ""

echo "Test 6: Checking response headers"
echo "======================================="
echo ""
for url in "${TEST_URLs[@]}"; do
    echo "Testing: $url"
    status=$(curl -sL -o /dev/null -w '%{http_code}' "$url")
    content_type=$(curl -sL -I "$url" 2>/dev/null | grep -i "content-type" | head -1)
    
    if [ "$status" == "200" ]; then
        echo -e "${GREEN}✓ Status: $status${NC}"
    else
        echo -e "${RED}✗ Status: $status${NC}"
    fi
    echo "  $content_type"
    echo ""
done

echo "Test 7: Checking sitemap.xml"
echo "======================================="
echo ""
sitemap_urls=$(curl -sL "$BASE_URL/sitemap.xml" | grep -c "<loc>")
echo "URLs in sitemap.xml: $sitemap_urls"
if [ "$sitemap_urls" -gt 100 ]; then
    echo -e "${GREEN}✓ Sitemap contains good number of URLs${NC}"
else
    echo -e "${YELLOW}⚠ Sitemap might need more URLs${NC}"
fi
echo ""

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""
echo "✅ Tests completed!"
echo ""
echo "Next Steps:"
echo "1. Submit sitemap to Google Search Console"
echo "2. Request indexing for important pages using URL Inspection Tool"
echo "3. Monitor indexing status in Search Console over next 2 weeks"
echo "4. Check for any crawl errors in Coverage report"
echo ""
echo "Google Search Console:"
echo "https://search.google.com/search-console"
echo ""
echo "URL Inspection Tool:"
echo "https://search.google.com/search-console/inspect?resource_id=sc-domain:indoquran.web.id"
echo ""
