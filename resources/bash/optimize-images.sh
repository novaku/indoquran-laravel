#!/bin/bash

# Image Optimization Script for IndoQuran
# This script optimizes images for better mobile performance

echo "🖼️  Starting image optimization for mobile performance..."

# Check if required tools are installed
command -v cwebp >/dev/null 2>&1 || { echo "❌ cwebp is required but not installed. Install it with: brew install webp"; exit 1; }
command -v optipng >/dev/null 2>&1 || { echo "❌ optipng is required but not installed. Install it with: brew install optipng"; exit 1; }
command -v jpegoptim >/dev/null 2>&1 || { echo "❌ jpegoptim is required but not installed. Install it with: brew install jpegoptim"; exit 1; }

# Navigate to public directory
cd public

echo "📁 Optimizing PNG files..."
# Optimize PNG files
find . -name "*.png" -exec optipng -o7 {} \;

echo "📁 Optimizing JPEG files..."
# Optimize JPEG files
find . -name "*.jpg" -exec jpegoptim --max=85 --strip-all {} \;
find . -name "*.jpeg" -exec jpegoptim --max=85 --strip-all {} \;

echo "📁 Converting images to WebP format..."
# Convert images to WebP for better compression
find . -name "*.png" -exec sh -c 'cwebp -q 85 "$1" -o "${1%.png}.webp"' _ {} \;
find . -name "*.jpg" -exec sh -c 'cwebp -q 85 "$1" -o "${1%.jpg}.webp"' _ {} \;
find . -name "*.jpeg" -exec sh -c 'cwebp -q 85 "$1" -o "${1%.jpeg}.webp"' _ {} \;

echo "✅ Image optimization completed!"
echo "📊 Summary:"
echo "   - PNG files optimized with optipng"
echo "   - JPEG files optimized with jpegoptim (max quality: 85%)"
echo "   - WebP versions created for better mobile performance"
echo ""
echo "💡 Next steps:"
echo "   - Update your React components to use WebP images with fallbacks"
echo "   - Consider implementing lazy loading for images"
echo "   - Use responsive images with different sizes for different screen sizes"
