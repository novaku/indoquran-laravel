#!/bin/bash

# PWA Testing and Validation Script for IndoQuran

echo "🔍 Testing PWA functionality for IndoQuran..."

# Check if we're in the right directory
if [ ! -f "public/manifest.json" ]; then
    echo "❌ Error: Please run this script from the Laravel project root directory"
    exit 1
fi

echo ""
echo "📋 PWA Checklist Validation:"
echo "=========================="

# 1. Check manifest.json
echo -n "✓ Checking manifest.json... "
if [ -f "public/manifest.json" ]; then
    echo "✅ Found"
    
    # Validate JSON
    if command -v jq >/dev/null 2>&1; then
        if jq empty public/manifest.json 2>/dev/null; then
            echo "  ✓ Valid JSON format"
        else
            echo "  ❌ Invalid JSON format"
        fi
    else
        echo "  ⚠️  JSON validation skipped (jq not installed)"
    fi
else
    echo "❌ Missing"
fi

# 2. Check service worker
echo -n "✓ Checking service worker... "
if [ -f "public/sw-pwa.js" ]; then
    echo "✅ Found"
else
    echo "❌ Missing"
fi

# 3. Check PWA manager
echo -n "✓ Checking PWA manager... "
if [ -f "public/pwa-manager.js" ]; then
    echo "✅ Found"
else
    echo "❌ Missing"
fi

# 4. Check offline page
echo -n "✓ Checking offline page... "
if [ -f "public/offline.html" ]; then
    echo "✅ Found"
else
    echo "❌ Missing"
fi

# 5. Check icons
echo "✓ Checking PWA icons:"
icons=("favicon.ico" "favicon-16x16.png" "favicon-32x32.png" "apple-touch-icon.png" "android-chrome-192x192.png" "android-chrome-512x512.png")

for icon in "${icons[@]}"; do
    echo -n "  - $icon... "
    if [ -f "public/$icon" ]; then
        echo "✅"
    else
        echo "❌"
    fi
done

echo ""
echo "🧪 PWA Functionality Tests:"
echo "========================="

# Start local server for testing
echo "🚀 Starting local server for PWA testing..."

# Kill any existing server on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Start Laravel server in background
php artisan serve --port=8000 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test if server is running
if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ Local server started successfully"
else
    echo "❌ Failed to start local server"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Test manifest accessibility
echo -n "✓ Testing manifest accessibility... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/manifest.json | grep -q "200"; then
    echo "✅ Accessible"
else
    echo "❌ Not accessible"
fi

# Test service worker accessibility
echo -n "✓ Testing service worker accessibility... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/sw-pwa.js | grep -q "200"; then
    echo "✅ Accessible"
else
    echo "❌ Not accessible"
fi

# Test offline page accessibility
echo -n "✓ Testing offline page accessibility... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/offline.html | grep -q "200"; then
    echo "✅ Accessible"
else
    echo "❌ Not accessible"
fi

# Test icons accessibility
echo "✓ Testing icon accessibility:"
for icon in "${icons[@]}"; do
    echo -n "  - $icon... "
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/$icon | grep -q "200"; then
        echo "✅"
    else
        echo "❌"
    fi
done

echo ""
echo "🔧 PWA Optimization Suggestions:"
echo "==============================="

# Check manifest content
if [ -f "public/manifest.json" ]; then
    if ! grep -q '"start_url".*utm_source=pwa' public/manifest.json; then
        echo "⚠️  Consider adding UTM parameters to start_url for analytics"
    fi
    
    if ! grep -q '"shortcuts"' public/manifest.json; then
        echo "⚠️  Consider adding app shortcuts for better user experience"
    fi
    
    if ! grep -q '"screenshots"' public/manifest.json; then
        echo "⚠️  Consider adding screenshots for app store listings"
    fi
fi

# Check for HTTPS (required for PWA)
echo -n "✓ Checking HTTPS requirement... "
if [ "$APP_ENV" = "production" ]; then
    echo "⚠️  Ensure HTTPS is enabled in production"
else
    echo "ℹ️  HTTPS not required for localhost testing"
fi

echo ""
echo "📊 PWA Performance Analysis:"
echo "============================"

# Check bundle sizes if possible
if [ -d "public/build/assets" ]; then
    echo "📦 Asset bundle sizes:"
    find public/build/assets -name "*.js" -exec basename {} \; -exec du -h {} \; | paste - - | head -5
    echo ""
    find public/build/assets -name "*.css" -exec basename {} \; -exec du -h {} \; | paste - - | head -3
fi

echo ""
echo "🎯 PWA Testing URLs:"
echo "==================="
echo "🌐 Main app: http://localhost:8000"
echo "📱 PWA Manifest: http://localhost:8000/manifest.json"
echo "⚙️  Service Worker: http://localhost:8000/sw-pwa.js"
echo "📴 Offline Page: http://localhost:8000/offline.html"

echo ""
echo "💡 Manual Testing Steps:"
echo "======================="
echo "1. Open Chrome DevTools (F12)"
echo "2. Go to Application tab > Manifest"
echo "3. Verify manifest loads correctly"
echo "4. Go to Application tab > Service Workers"
echo "5. Verify service worker is registered and running"
echo "6. Test 'Add to Home Screen' functionality"
echo "7. Test offline functionality by going offline in DevTools"
echo "8. Use Lighthouse to audit PWA score"

echo ""
echo "🚀 Lighthouse PWA Audit:"
echo "======================="
echo "Run this command for automated PWA testing:"
echo "lighthouse --view --only-categories=pwa http://localhost:8000"

# Cleanup function
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    kill $SERVER_PID 2>/dev/null || true
    echo "✅ Local server stopped"
}

# Set trap to cleanup on script exit
trap cleanup EXIT

echo ""
echo "⏰ Server will run for 60 seconds for manual testing..."
echo "   Press Ctrl+C to stop early"

# Wait for 60 seconds or until interrupted
sleep 60
