#!/bin/bash

# Performance comparison script
# Compare before/after bundle sizes

echo "📊 Bundle Size Analysis"
echo "====================="

# Check if build directory exists
if [ ! -d "public/build" ]; then
    echo "❌ No build found. Run 'npm run build:optimized' first."
    exit 1
fi

echo "📦 Current Bundle Analysis:"
echo ""

# JavaScript files analysis
echo "🟡 JavaScript Bundles:"
find public/build/assets -name "*.js" -exec du -sh {} \; | sort -hr | head -10

echo ""
echo "🟢 Gzipped sizes (estimated):"
find public/build/assets -name "*.js" -exec sh -c 'gzip -c "$1" | wc -c | awk "{printf \"%.1f KB\t%s\n\", \$1/1024, \"$1\"}"' _ {} \; | sort -nr | head -10

echo ""
echo "🎨 CSS Files:"
find public/build/assets -name "*.css" -exec du -sh {} \;

echo ""
echo "📊 Total Bundle Size:"
du -sh public/build

echo ""
echo "🎯 Performance Recommendations:"

# Check for large chunks
large_js=$(find public/build/assets -name "*.js" -size +200k)
if [ ! -z "$large_js" ]; then
    echo "⚠️  Large JavaScript files found (>200KB):"
    echo "$large_js" | while read file; do
        size=$(du -sh "$file" | cut -f1)
        echo "   - $(basename "$file"): $size"
    done
    echo "   Consider further code splitting"
else
    echo "✅ All JavaScript chunks under 200KB"
fi

# Check total bundle size
total_size=$(du -s public/build | cut -f1)
if [ $total_size -gt 5120 ]; then  # 5MB
    echo "⚠️  Total bundle size is large (>5MB)"
    echo "   Consider removing unused dependencies"
else
    echo "✅ Total bundle size is reasonable"
fi

echo ""
echo "🚀 Quick Commands:"
echo "   npm run performance:mobile  - Test mobile performance"
echo "   npm run performance:quick   - Quick performance audit"
echo "   npm run bundle:analyze      - Detailed bundle analysis"
