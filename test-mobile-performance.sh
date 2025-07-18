#!/bin/bash

# Performance Testing Script for Mobile Optimizations
# Quick validation of performance improvements

echo "🧪 Running mobile performance validation tests..."
echo "=============================================="

# Check if required tools are available
echo "🔧 Checking required tools..."
echo ""

# Function to check command availability
check_command() {
    if command -v $1 >/dev/null 2>&1; then
        echo "✅ $1 is available"
        return 0
    else
        echo "❌ $1 is not available"
        return 1
    fi
}

# Check tools
check_command "curl"
check_command "gzip"
NODE_AVAILABLE=0
check_command "node" && NODE_AVAILABLE=1

echo ""
echo "📁 Checking build output..."
echo "============================="

# Check if build exists
if [ -d "public/build" ]; then
    echo "✅ Build directory exists"
    
    # Check critical files
    css_file=$(find public/build/assets -name "*.css" | head -1)
    if [ -n "$css_file" ] && [ -f "$css_file" ]; then
        css_size=$(wc -c < "$css_file")
        echo "✅ CSS file found ($(echo $css_size | awk '{printf "%.1f KB", $1/1024}'))"
    else
        echo "❌ CSS file not found"
    fi
    
    js_file=$(find public/build/assets -name "index-*.js" | head -1)
    if [ -n "$js_file" ] && [ -f "$js_file" ]; then
        js_size=$(wc -c < "$js_file")
        echo "✅ Main JS file found ($(echo $js_size | awk '{printf "%.1f KB", $1/1024}'))"
    else
        echo "❌ Main JS file not found"
    fi
    
    # Check for compressed files
    css_gz_count=$(find public/build -name "*.css.gz" | wc -l)
    js_gz_count=$(find public/build -name "*.js.gz" | wc -l)
    
    if [ $css_gz_count -gt 0 ] && [ $js_gz_count -gt 0 ]; then
        echo "✅ Gzip compressed files found"
    else
        echo "⚠️  Gzip compressed files not found (run build script)"
    fi
    
else
    echo "❌ Build directory not found - please run build first"
    echo "   Run: npm run build or ./build-mobile-optimized.sh"
    exit 1
fi

echo ""
echo "🖼️  Checking image optimizations..."
echo "=================================="

# Check for WebP images
webp_count=$(find public -name "*.webp" | wc -l)
if [ $webp_count -gt 0 ]; then
    echo "✅ WebP images found ($webp_count files)"
else
    echo "⚠️  No WebP images found (run image optimization)"
fi

# Check for large images
large_images=$(find public -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" | while read img; do
    size=$(wc -c < "$img")
    if [ $size -gt 1048576 ]; then # > 1MB
        echo "$img ($(echo $size | awk '{printf "%.1f MB", $1/1024/1024}'))"
    fi
done)

if [ -n "$large_images" ]; then
    echo "⚠️  Large images found (consider optimization):"
    echo "$large_images"
else
    echo "✅ No large images found"
fi

echo ""
echo "📦 Checking service worker..."
echo "============================="

if [ -f "public/sw-mobile.js" ]; then
    echo "✅ Mobile service worker found"
    
    # Check version
    version=$(grep "CACHE_NAME = " public/sw-mobile.js | head -1)
    echo "📋 $version"
else
    echo "❌ Mobile service worker not found"
fi

if [ -f "public/sw-register.js" ]; then
    echo "✅ Service worker registration script found"
else
    echo "⚠️  Service worker registration script not found"
fi

echo ""
echo "🎨 Checking critical CSS..."
echo "=========================="

if [ -f "public/critical.css" ]; then
    critical_size=$(wc -c < "public/critical.css")
    echo "✅ Critical CSS found ($(echo $critical_size | awk '{printf "%.1f KB", $1/1024}'))"
    
    # Check if critical CSS is within budget (14KB)
    if [ $critical_size -lt 14336 ]; then
        echo "✅ Critical CSS within budget (<14KB)"
    else
        echo "⚠️  Critical CSS exceeds budget (>14KB)"
    fi
else
    echo "⚠️  Critical CSS not found (run build script)"
fi

echo ""
echo "📱 Checking PWA manifest..."
echo "=========================="

if [ -f "public/manifest.json" ]; then
    echo "✅ PWA manifest found"
    
    # Check if manifest is optimized for mobile
    if grep -q "portrait-primary" public/manifest.json; then
        echo "✅ Mobile orientation set"
    else
        echo "⚠️  Mobile orientation not optimized"
    fi
    
    if grep -q "utm_source=pwa" public/manifest.json; then
        echo "✅ PWA analytics tracking configured"
    else
        echo "⚠️  PWA analytics tracking not configured"
    fi
else
    echo "❌ PWA manifest not found"
fi

echo ""
echo "🚀 Performance Budget Analysis..."
echo "================================"

# Bundle size analysis
if [ -d "public/build/assets" ]; then
    css_file=$(find public/build/assets -name "*.css" | head -1)
    js_file=$(find public/build/assets -name "index-*.js" | head -1)
    
    if [ -n "$css_file" ] && [ -n "$js_file" ]; then
        css_size=$(wc -c < "$css_file")
        js_size=$(wc -c < "$js_file")
        total_size=$((css_size + js_size))
        
        echo "📊 Bundle Sizes:"
        echo "   CSS: $(echo $css_size | awk '{printf "%.1f KB", $1/1024}')"
        echo "   JS:  $(echo $js_size | awk '{printf "%.1f KB", $1/1024}')"
        echo "   Total: $(echo $total_size | awk '{printf "%.1f KB", $1/1024}')"
        
        # Check against mobile budget (250KB)
        mobile_budget=256000
        if [ $total_size -lt $mobile_budget ]; then
            echo "✅ Bundle size within mobile budget (<250KB)"
        else
            echo "⚠️  Bundle size exceeds mobile budget (>250KB)"
            echo "   Consider further optimization"
        fi
    fi
fi

echo ""
echo "🔗 Quick connectivity test..."
echo "============================"

# Test if local server is running
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 | grep -q "200"; then
    echo "✅ Local server is running"
    
    # Test critical resources
    echo "🔍 Testing resource availability:"
    
    # Test main page
    response_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000)
    if [ "$response_code" = "200" ]; then
        echo "   ✅ Main page: $response_code"
    else
        echo "   ❌ Main page: $response_code"
    fi
    
    # Test critical assets
    css_file=$(find public/build/assets -name "*.css" | head -1)
    js_file=$(find public/build/assets -name "index-*.js" | head -1)
    
    for asset in "/manifest.json"; do
        response_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000$asset")
        if [ "$response_code" = "200" ]; then
            echo "   ✅ $asset: $response_code"
        else
            echo "   ❌ $asset: $response_code"
        fi
    done
    
    if [ -n "$css_file" ]; then
        css_path="/build/assets/$(basename "$css_file")"
        response_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000$css_path")
        if [ "$response_code" = "200" ]; then
            echo "   ✅ $css_path: $response_code"
        else
            echo "   ❌ $css_path: $response_code"
        fi
    fi
    
    if [ -n "$js_file" ]; then
        js_path="/build/assets/$(basename "$js_file")"
        response_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000$js_path")
        if [ "$response_code" = "200" ]; then
            echo "   ✅ $js_path: $response_code"
        else
            echo "   ❌ $js_path: $response_code"
        fi
    fi
    
else
    echo "⚠️  Local server not running"
    echo "   Start with: php artisan serve"
fi

echo ""
echo "📋 Performance Optimization Summary"
echo "=================================="

# Count optimizations
optimizations=0
warnings=0

# Check each optimization
css_file_exists=0
js_file_exists=0
[ -n "$(find public/build/assets -name "*.css" | head -1)" ] && css_file_exists=1
[ -n "$(find public/build/assets -name "index-*.js" | head -1)" ] && js_file_exists=1

[ $css_file_exists -eq 1 ] && [ $js_file_exists -eq 1 ] && ((optimizations++))
[ -f "public/critical.css" ] && ((optimizations++))
[ $webp_count -gt 0 ] && ((optimizations++))
[ -f "public/sw-mobile.js" ] && ((optimizations++))
[ -f "public/manifest.json" ] && ((optimizations++))

# Count warnings
[ ! -f "public/sw-register.js" ] && ((warnings++))
[ $css_gz_count -eq 0 ] && ((warnings++))

echo "✅ Optimizations implemented: $optimizations/5"
echo "⚠️  Warnings: $warnings"

if [ $optimizations -ge 4 ] && [ $warnings -le 1 ]; then
    echo ""
    echo "🎉 Mobile performance optimizations look good!"
    echo "Ready for PageSpeed Insights testing"
else
    echo ""
    echo "🔧 Some optimizations may need attention"
    echo "Review warnings above and run build script if needed"
fi

echo ""
echo "🔗 Next Steps:"
echo "============="
echo "1. Run PageSpeed Insights test: https://pagespeed.web.dev/"
echo "2. Test on real mobile devices"
echo "3. Monitor Core Web Vitals in production"
echo "4. Set up performance monitoring"

echo ""
echo "🛠️  Quick Commands:"
echo "=================="
echo "Build optimized: ./build-mobile-optimized.sh"
echo "Start server: php artisan serve"
echo "View site: http://localhost:8000"
