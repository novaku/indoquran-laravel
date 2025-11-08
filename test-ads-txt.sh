#!/bin/bash

# Test ads.txt Accessibility
# Script untuk memverifikasi file ads.txt dapat diakses dengan benar

echo "=========================================="
echo "     ads.txt Accessibility Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Domain to test
DOMAIN="https://indoquran.web.id"
LOCAL_DOMAIN="http://localhost:8000"

# Test 1: Check if local file exists
echo "1. Checking local file existence..."
if [ -f "public/ads.txt" ]; then
    echo -e "${GREEN}✓ File public/ads.txt exists${NC}"
    echo "   Content:"
    cat public/ads.txt | sed 's/^/   /'
else
    echo -e "${RED}✗ File public/ads.txt not found${NC}"
fi
echo ""

# Test 2: Check file content format
echo "2. Validating ads.txt format..."
if [ -f "public/ads.txt" ]; then
    if grep -q "google.com, pub-9994842285785390, DIRECT" public/ads.txt; then
        echo -e "${GREEN}✓ Correct Google AdSense entry found${NC}"
    else
        echo -e "${RED}✗ Google AdSense entry missing or incorrect${NC}"
    fi
    
    if grep -q "f08c47fec0942fa0" public/ads.txt; then
        echo -e "${GREEN}✓ Correct relationship identifier found${NC}"
    else
        echo -e "${YELLOW}⚠ Relationship identifier missing${NC}"
    fi
else
    echo -e "${RED}✗ Cannot validate - file not found${NC}"
fi
echo ""

# Test 3: Check .htaccess configuration
echo "3. Checking .htaccess configuration..."
if grep -q "ads\.txt" public/.htaccess; then
    echo -e "${GREEN}✓ ads.txt rule found in .htaccess${NC}"
else
    echo -e "${YELLOW}⚠ No explicit ads.txt rule in .htaccess${NC}"
fi

if grep -q "AddType text/plain.*\.txt" public/.htaccess; then
    echo -e "${GREEN}✓ MIME type for .txt files configured${NC}"
else
    echo -e "${YELLOW}⚠ MIME type for .txt not explicitly set${NC}"
fi
echo ""

# Test 4: Test local accessibility (if server is running)
echo "4. Testing local accessibility..."
if command -v curl &> /dev/null; then
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$LOCAL_DOMAIN/ads.txt" 2>/dev/null)
    if [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}✓ Local ads.txt accessible (HTTP $RESPONSE)${NC}"
        echo "   Fetching content from $LOCAL_DOMAIN/ads.txt:"
        curl -s "$LOCAL_DOMAIN/ads.txt" 2>/dev/null | sed 's/^/   /'
    elif [ "$RESPONSE" = "000" ]; then
        echo -e "${YELLOW}⚠ Local server not running${NC}"
        echo "   Start server with: ./dev-env.sh"
    else
        echo -e "${RED}✗ Local ads.txt returned HTTP $RESPONSE${NC}"
    fi
else
    echo -e "${YELLOW}⚠ curl not available - skipping local test${NC}"
fi
echo ""

# Test 5: Test production accessibility
echo "5. Testing production accessibility..."
if command -v curl &> /dev/null; then
    echo "   Checking: $DOMAIN/ads.txt"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/ads.txt" 2>/dev/null)
    
    if [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}✓ Production ads.txt accessible (HTTP $RESPONSE)${NC}"
        echo "   Content from production:"
        curl -s "$DOMAIN/ads.txt" 2>/dev/null | sed 's/^/   /'
        echo ""
        
        # Validate content matches local
        PROD_CONTENT=$(curl -s "$DOMAIN/ads.txt" 2>/dev/null)
        LOCAL_CONTENT=$(cat public/ads.txt 2>/dev/null)
        
        if [ "$PROD_CONTENT" = "$LOCAL_CONTENT" ]; then
            echo -e "${GREEN}✓ Production content matches local file${NC}"
        else
            echo -e "${YELLOW}⚠ Production content differs from local file${NC}"
            echo "   This is normal if you haven't deployed yet"
        fi
    else
        echo -e "${RED}✗ Production ads.txt returned HTTP $RESPONSE${NC}"
        echo "   This is expected if you haven't deployed yet"
        echo "   Deploy with: ./deploy-production.sh"
    fi
else
    echo -e "${YELLOW}⚠ curl not available - skipping production test${NC}"
fi
echo ""

# Test 6: Validate with Google's ads.txt validator
echo "6. Google ads.txt validation..."
echo "   Manual validation required:"
echo "   1. Visit: https://adstxt.guru/check"
echo "   2. Enter domain: indoquran.web.id"
echo "   3. Or check Google AdSense dashboard"
echo ""

# Summary
echo "=========================================="
echo "   Summary & Next Steps"
echo "=========================================="
echo ""

if [ -f "public/ads.txt" ]; then
    echo "✓ File Status: ${GREEN}OK${NC}"
else
    echo "✗ File Status: ${RED}NOT FOUND${NC}"
fi

echo ""
echo "📋 Deployment Checklist:"
echo "  1. ✓ Create ads.txt file"
echo "  2. ✓ Configure .htaccess"
echo "  3. ✓ Commit to repository"
echo "  4. ⚠ Deploy to production server"
echo "  5. ⚠ Verify at: $DOMAIN/ads.txt"
echo "  6. ⚠ Check Google AdSense dashboard"
echo ""
echo "🔗 Useful Links:"
echo "  • Production URL: $DOMAIN/ads.txt"
echo "  • AdSense Status: https://www.google.com/adsense/"
echo "  • Validator: https://adstxt.guru/check"
echo "  • IAB Spec: https://iabtechlab.com/ads-txt/"
echo ""
echo "⏱ Note: Google may take 24-48 hours to verify ads.txt"
echo "=========================================="
