#!/bin/bash

# Production Green Loading Screen Diagnostic Script
# This script helps diagnose and fix the green loading screen issue

echo "🔍 IndoQuran Production Loading Diagnostic"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $2 in
        "success") echo -e "${GREEN}✅ $1${NC}" ;;
        "error") echo -e "${RED}❌ $1${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $1${NC}" ;;
        "info") echo -e "${BLUE}ℹ️  $1${NC}" ;;
        *) echo "$1" ;;
    esac
}

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    print_status "Not in Laravel project root directory" "error"
    exit 1
fi

print_status "Starting diagnostic checks..." "info"
echo ""

# 1. Check Vite configuration
print_status "1. Checking Vite Configuration" "info"
if grep -q "resources/js/app.js" vite.config.js; then
    print_status "❌ Found Alpine.js (app.js) in vite.config.js - THIS CAUSES THE GREEN SCREEN" "error"
    echo "   Fix: Remove 'resources/js/app.js' from the input array in vite.config.js"
else
    print_status "✅ Vite config looks correct (no Alpine.js conflict)" "success"
fi

# 2. Check React blade template
print_status "2. Checking React Blade Template" "info"
if grep -q "resources/js/app.js" resources/views/react.blade.php; then
    print_status "❌ Found Alpine.js (app.js) in react.blade.php - THIS CAUSES THE GREEN SCREEN" "error"
    echo "   Fix: Remove 'resources/js/app.js' from @vite directive in react.blade.php"
else
    print_status "✅ React template looks correct (no Alpine.js conflict)" "success"
fi

# 3. Check if build assets exist
print_status "3. Checking Build Assets" "info"
if [ -d "public/build" ]; then
    if [ -f "public/build/manifest.json" ]; then
        print_status "✅ Build manifest exists" "success"
        ASSET_COUNT=$(find public/build -name "*.js" | wc -l)
        print_status "Found $ASSET_COUNT JavaScript files in build directory" "info"
    else
        print_status "❌ Build manifest missing" "error"
        echo "   Fix: Run 'npm run build' to generate assets"
    fi
else
    print_status "❌ Build directory missing" "error"
    echo "   Fix: Run 'npm run build' to generate assets"
fi

# 4. Check Node.js and npm
print_status "4. Checking Node.js Environment" "info"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js version: $NODE_VERSION" "info"
else
    print_status "❌ Node.js not found" "error"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm version: $NPM_VERSION" "info"
else
    print_status "❌ npm not found" "error"
fi

# 5. Check package.json dependencies
print_status "5. Checking Dependencies" "info"
if [ -f "package.json" ]; then
    if grep -q '"react"' package.json; then
        print_status "✅ React dependency found" "success"
    else
        print_status "❌ React dependency missing" "error"
    fi
    
    if grep -q '"@vitejs/plugin-react"' package.json; then
        print_status "✅ Vite React plugin found" "success"
    else
        print_status "❌ Vite React plugin missing" "error"
    fi
else
    print_status "❌ package.json not found" "error"
fi

# 6. Check Laravel cache
print_status "6. Checking Laravel Cache" "info"
if [ -d "bootstrap/cache" ]; then
    CACHE_FILES=$(find bootstrap/cache -name "*.php" | wc -l)
    if [ $CACHE_FILES -gt 0 ]; then
        print_status "Found $CACHE_FILES cache files" "info"
        print_status "Recommendation: Clear cache with 'php artisan cache:clear'" "warning"
    fi
fi

# 7. Generate automatic fixes
echo ""
print_status "🔧 Automatic Fixes Available" "info"
echo "============================="

# Fix 1: Remove Alpine.js conflicts
print_status "Fix 1: Remove Alpine.js conflicts" "info"
if grep -q "resources/js/app.js" vite.config.js || grep -q "resources/js/app.js" resources/views/react.blade.php; then
    read -p "Do you want to automatically remove Alpine.js conflicts? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Fix vite.config.js
        if grep -q "resources/js/app.js" vite.config.js; then
            sed -i.bak "s/'resources\/js\/app.js', //" vite.config.js
            print_status "✅ Removed app.js from vite.config.js" "success"
        fi
        
        # Fix react.blade.php
        if grep -q "resources/js/app.js" resources/views/react.blade.php; then
            sed -i.bak "s/'resources\/js\/app.js', //" resources/views/react.blade.php
            print_status "✅ Removed app.js from react.blade.php" "success"
        fi
    fi
fi

# Fix 2: Rebuild assets
print_status "Fix 2: Rebuild production assets" "info"
read -p "Do you want to rebuild production assets? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Installing dependencies..." "info"
    npm install
    
    print_status "Building for production..." "info"
    npm run build
    
    if [ $? -eq 0 ]; then
        print_status "✅ Build completed successfully" "success"
    else
        print_status "❌ Build failed" "error"
    fi
fi

# Fix 3: Clear Laravel caches
print_status "Fix 3: Clear Laravel caches" "info"
read -p "Do you want to clear Laravel caches? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    php artisan cache:clear
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    print_status "✅ Laravel caches cleared" "success"
fi

echo ""
print_status "🎯 Summary and Next Steps" "info"
echo "========================="

echo ""
print_status "Common causes of green loading screen:" "info"
echo "1. Alpine.js and React conflict (both trying to control #app element)"
echo "2. Missing or corrupted build assets"
echo "3. JavaScript errors during React initialization"
echo "4. API timeout issues (especially /api/user endpoint)"
echo "5. Browser cache serving old assets"

echo ""
print_status "Manual verification steps:" "info"
echo "1. Open browser Developer Tools (F12)"
echo "2. Check Console tab for JavaScript errors"
echo "3. Check Network tab for failed requests"
echo "4. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)"
echo "5. Test in incognito/private browsing mode"

echo ""
print_status "If the issue persists:" "info"
echo "1. Check server logs for errors"
echo "2. Verify /api/user endpoint is working: curl -H 'Accept: application/json' https://yourdomain.com/api/user"
echo "3. Ensure proper CORS configuration"
echo "4. Check for Content Security Policy (CSP) violations"

echo ""
print_status "Diagnostic completed!" "success"
