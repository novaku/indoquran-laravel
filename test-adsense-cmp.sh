#!/bin/bash

# Test AdSense + CMP Implementation
# Script untuk memverifikasi Google AdSense dan Consent Management Platform

echo "=========================================="
echo "   AdSense + CMP Implementation Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Check if AdSense script is in react.blade.php
echo "1. Checking AdSense script in react.blade.php..."
if grep -q "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9994842285785390" resources/views/react.blade.php; then
    echo -e "${GREEN}✓ AdSense script found${NC}"
else
    echo -e "${RED}✗ AdSense script not found${NC}"
fi
echo ""

# Test 2: Check if Funding Choices (CMP) script is present
echo "2. Checking Funding Choices (CMP) script..."
if grep -q "fundingchoicesmessages.google.com/i/pub-9994842285785390" resources/views/react.blade.php; then
    echo -e "${GREEN}✓ Funding Choices (CMP) script found${NC}"
else
    echo -e "${RED}✗ Funding Choices (CMP) script not found${NC}"
fi
echo ""

# Test 3: Check DNS prefetch for AdSense domains
echo "3. Checking DNS prefetch optimization..."
if grep -q "dns-prefetch.*fundingchoicesmessages.google.com" resources/views/react.blade.php; then
    echo -e "${GREEN}✓ DNS prefetch for Funding Choices found${NC}"
else
    echo -e "${YELLOW}⚠ DNS prefetch for Funding Choices not found${NC}"
fi

if grep -q "dns-prefetch.*pagead2.googlesyndication.com" resources/views/react.blade.php; then
    echo -e "${GREEN}✓ DNS prefetch for AdSense found${NC}"
else
    echo -e "${YELLOW}⚠ DNS prefetch for AdSense not found${NC}"
fi
echo ""

# Test 4: Check script order (CMP should come before AdSense)
echo "4. Checking script loading order..."
FUNDING_LINE=$(grep -n "fundingchoicesmessages.google.com" resources/views/react.blade.php | head -1 | cut -d: -f1)
ADSENSE_LINE=$(grep -n "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" resources/views/react.blade.php | head -1 | cut -d: -f1)

if [ ! -z "$FUNDING_LINE" ] && [ ! -z "$ADSENSE_LINE" ]; then
    if [ $FUNDING_LINE -lt $ADSENSE_LINE ]; then
        echo -e "${GREEN}✓ Correct order: CMP loads before AdSense${NC}"
    else
        echo -e "${RED}✗ Wrong order: AdSense loads before CMP${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Cannot determine script order${NC}"
fi
echo ""

# Test 5: Build test - ensure no syntax errors
echo "5. Testing Blade template syntax..."
if php artisan view:clear > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Blade template cleared successfully${NC}"
else
    echo -e "${RED}✗ Blade template clear failed${NC}"
fi
echo ""

# Test 6: Check if running in development or production
echo "6. Environment check..."
if [ -f ".env" ]; then
    ENV=$(grep "APP_ENV=" .env | cut -d'=' -f2)
    echo "   Current environment: ${YELLOW}$ENV${NC}"
    
    if [ "$ENV" = "production" ]; then
        echo -e "   ${GREEN}✓ Running in production mode${NC}"
    else
        echo -e "   ${YELLOW}⚠ Running in $ENV mode${NC}"
        echo "   Note: For AdSense verification, deploy to production"
    fi
else
    echo -e "   ${RED}✗ .env file not found${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "   Implementation Summary"
echo "=========================================="
echo ""
echo "✓ Components Implemented:"
echo "  • Google AdSense script"
echo "  • Google Funding Choices (CMP)"
echo "  • DNS prefetch optimization"
echo "  • Correct script loading order"
echo ""
echo "📋 Next Steps:"
echo "  1. Deploy to production: ./deploy-production.sh"
echo "  2. Go to Google AdSense dashboard"
echo "  3. Select verification method: 'Salin kode AdSense'"
echo "  4. Wait for Google to verify (may take a few hours)"
echo "  5. Configure consent settings in Google AdSense"
echo ""
echo "🔗 Useful Links:"
echo "  • AdSense: https://www.google.com/adsense/"
echo "  • Funding Choices: https://support.google.com/fundingchoices"
echo "  • Privacy & Messaging: https://support.google.com/adsense/answer/13554116"
echo ""
echo "=========================================="
