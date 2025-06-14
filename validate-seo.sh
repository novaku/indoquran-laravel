#!/bin/bash

# SEO Validation Script for IndoQuran
# Domain: my.indoquran.web.id

echo "🔍 IndoQuran SEO Validation Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 missing${NC}"
        return 1
    fi
}

# Function to check if a string exists in a file
check_string_in_file() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅ $3${NC}"
        return 0
    else
        echo -e "${RED}❌ $3${NC}"
        return 1
    fi
}

echo "📁 Checking SEO Files..."
echo "------------------------"

# Check critical SEO files
check_file "public/robots.txt"
check_file "public/site.webmanifest"
check_file "public/android-chrome-512x512.png"
check_file "public/android-chrome-192x192.png"
check_file "public/apple-touch-icon.png"
check_file "public/favicon.ico"
check_file "public/sw.js"

echo ""
echo "🎯 Checking SEO Components..."
echo "-----------------------------"

# Check React SEO components
check_file "resources/js/react/components/SEOHead.jsx"
check_file "resources/js/react/components/MetaTags.jsx"
check_file "resources/js/react/components/StructuredData.jsx"
check_file "resources/js/react/utils/seoUtils.js"

echo ""
echo "🔧 Checking Laravel SEO Integration..."
echo "--------------------------------------"

# Check Laravel SEO controllers
check_file "app/Http/Controllers/SEOController.php"
check_file "app/Http/Controllers/SitemapController.php"

echo ""
echo "📋 Checking SEO Content..."
echo "-------------------------"

# Check robots.txt content
check_string_in_file "public/robots.txt" "my.indoquran.web.id" "Robots.txt contains correct domain"
check_string_in_file "public/robots.txt" "sitemap.xml" "Robots.txt references sitemap"

# Check manifest content
check_string_in_file "public/site.webmanifest" "IndoQuran" "Manifest contains app name"
check_string_in_file "public/site.webmanifest" "Al-Quran Digital Indonesia" "Manifest contains app description"

# Check main blade template
check_string_in_file "resources/views/react.blade.php" "og:title" "React template has Open Graph tags"
check_string_in_file "resources/views/react.blade.php" "twitter:card" "React template has Twitter Card tags"
check_string_in_file "resources/views/react.blade.php" "application/ld+json" "React template has structured data"

echo ""
echo "🌐 Checking Routes..."
echo "--------------------"

# Test Laravel routes
echo "Testing sitemap route..."
if php artisan route:list --name=sitemap >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Sitemap route registered${NC}"
else
    echo -e "${RED}❌ Sitemap route not found${NC}"
fi

echo ""
echo "📱 Checking PWA Elements..."
echo "--------------------------"

# Check PWA manifest
if [ -f "public/site.webmanifest" ]; then
    if grep -q "start_url" "public/site.webmanifest"; then
        echo -e "${GREEN}✅ PWA manifest has start_url${NC}"
    else
        echo -e "${RED}❌ PWA manifest missing start_url${NC}"
    fi
    
    if grep -q "display.*standalone" "public/site.webmanifest"; then
        echo -e "${GREEN}✅ PWA configured as standalone app${NC}"
    else
        echo -e "${RED}❌ PWA not configured as standalone${NC}"
    fi
fi

# Check service worker
if [ -f "public/sw.js" ]; then
    if grep -q "indoquran" "public/sw.js"; then
        echo -e "${GREEN}✅ Service worker configured for IndoQuran${NC}"
    else
        echo -e "${YELLOW}⚠️  Service worker may need IndoQuran-specific configuration${NC}"
    fi
fi

echo ""
echo "🔒 Checking Security & Performance..."
echo "------------------------------------"

# Check .htaccess for SEO optimizations
if [ -f "public/.htaccess" ]; then
    check_string_in_file "public/.htaccess" "mod_deflate" ".htaccess has gzip compression"
    check_string_in_file "public/.htaccess" "mod_expires" ".htaccess has browser caching"
    check_string_in_file "public/.htaccess" "X-Frame-Options" ".htaccess has security headers"
    check_string_in_file "public/.htaccess" "my.indoquran.web.id" ".htaccess configured for correct domain"
else
    echo -e "${RED}❌ .htaccess file missing${NC}"
fi

echo ""
echo "📊 SEO Component Integration Check..."
echo "------------------------------------"

# Check if SEO components are properly imported in main files
check_string_in_file "resources/js/react/App.jsx" "SEOHead" "App.jsx imports SEOHead component"
check_string_in_file "resources/js/react/App.jsx" "StructuredData" "App.jsx imports StructuredData component"

# Check HomePage SEO integration
if [ -f "resources/js/react/pages/HomePage.jsx" ]; then
    check_string_in_file "resources/js/react/pages/HomePage.jsx" "getHomeSEO" "HomePage uses SEO helper function"
    check_string_in_file "resources/js/react/pages/HomePage.jsx" "SEOHead" "HomePage uses SEOHead component"
fi

echo ""
echo "🎯 Domain-Specific Checks..."
echo "----------------------------"

# Check for correct domain usage throughout the codebase
echo "Checking domain references..."
if grep -r "my.indoquran.web.id" resources/js/react/ >/dev/null 2>&1; then
    echo -e "${GREEN}✅ React components use correct domain${NC}"
else
    echo -e "${YELLOW}⚠️  Check if React components use correct domain${NC}"
fi

if grep -r "my.indoquran.web.id" app/Http/Controllers/ >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Laravel controllers use correct domain${NC}"
else
    echo -e "${YELLOW}⚠️  Check if Laravel controllers use correct domain${NC}"
fi

echo ""
echo "📈 Performance Optimization Check..."
echo "-----------------------------------"

# Check if performance components are in place
check_file "resources/js/react/hooks/usePerformance.js"
check_file "resources/js/react/hooks/useAdvancedPerformanceMonitor.js"
check_file "resources/js/react/hooks/useResourcePreloader.js"

echo ""
echo "🎉 SEO Validation Complete!"
echo "============================"

# Final recommendations
echo ""
echo -e "${YELLOW}📝 Additional SEO Recommendations:${NC}"
echo "1. Test sitemap.xml accessibility: https://my.indoquran.web.id/sitemap.xml"
echo "2. Validate structured data: https://search.google.com/test/rich-results"
echo "3. Test mobile-friendliness: https://search.google.com/test/mobile-friendly"
echo "4. Check page speed: https://pagespeed.web.dev/"
echo "5. Verify in Google Search Console"
echo "6. Test social media sharing previews"
echo ""
echo -e "${GREEN}🚀 Your IndoQuran app is now SEO-optimized for my.indoquran.web.id!${NC}"
