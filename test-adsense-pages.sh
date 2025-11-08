#!/bin/bash

# Test AdSense Implementation - Quick Page Load Test
# Tests all pages to ensure they load without 500 errors

echo "========================================="
echo "Testing AdSense Implementation"
echo "========================================="
echo ""

BASE_URL="http://localhost:8000"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_page() {
    local path=$1
    local name=$2
    
    # Test HTTP status
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")
    
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✅ $name${NC} ($path) - HTTP $status"
        
        # Check if AdSense script is present
        if curl -s "$BASE_URL$path" | grep -q "adsbygoogle"; then
            echo -e "   ${GREEN}└─ AdSense script detected${NC}"
        fi
        
        # Check if CMP script is present
        if curl -s "$BASE_URL$path" | grep -q "fundingchoices"; then
            echo -e "   ${GREEN}└─ CMP script detected${NC}"
        fi
        
        return 0
    else
        echo -e "${RED}❌ $name${NC} ($path) - HTTP $status"
        return 1
    fi
}

echo "Testing Pages with Full Sidebar Implementation:"
echo "-----------------------------------------------"
test_page "/" "QuranHomePage"
test_page "/surah" "SurahListPage"
echo ""

echo "Testing Pages with Import Only:"
echo "-----------------------------------------------"
test_page "/artikel" "ArticlesPage"
test_page "/asmaul-husna" "AsmaulHusnaPage"
test_page "/tafsir-maudhuhi" "TafsirMaudhuiPage"
test_page "/cari" "QuranSearchPage"
test_page "/tentang" "AboutProjectPage"
test_page "/privasi" "PrivacyPage"
test_page "/shalat" "PrayerPage"
test_page "/juz" "JuzIndexPage"
echo ""

echo "Testing Critical Complex Page:"
echo "-----------------------------------------------"
test_page "/surah/1" "SurahDetailPage (Al-Fatiha)"
echo ""

echo "Testing Static Files:"
echo "-----------------------------------------------"
# Test ads.txt
ads_status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/ads.txt")
if [ "$ads_status" = "200" ]; then
    echo -e "${GREEN}✅ ads.txt${NC} - HTTP $ads_status"
    echo "   Content:"
    curl -s "$BASE_URL/ads.txt" | sed 's/^/   /'
else
    echo -e "${RED}❌ ads.txt${NC} - HTTP $ads_status"
fi
echo ""

echo "Testing AdSense Component Import:"
echo "-----------------------------------------------"
# Check if AdSenseVertical component exists in build
if [ -f "public/build/assets/AdSenseVertical"*.js ]; then
    echo -e "${GREEN}✅ AdSenseVertical component built${NC}"
    ls -lh public/build/assets/AdSenseVertical*.js | awk '{print "   Size: " $5}'
else
    echo -e "${YELLOW}⚠️  AdSenseVertical chunk not found (might be bundled)${NC}"
fi
echo ""

echo "========================================="
echo "Testing Summary"
echo "========================================="
echo ""
echo -e "${YELLOW}Note:${NC} Ads will NOT display in development environment"
echo -e "Expected: Gray placeholders or empty ad containers"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "1. Open http://localhost:8000 in browser"
echo "2. Open DevTools (F12)"
echo "3. Check Console for errors"
echo "4. Verify sidebar visible on desktop (≥1024px)"
echo "5. Test responsive (resize to <1024px)"
echo ""
echo "For detailed testing checklist, see:"
echo "TESTING_ADSENSE_DEVELOPMENT.md"
