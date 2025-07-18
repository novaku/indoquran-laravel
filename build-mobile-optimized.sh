#!/bin/bash

# Enhanced Production Build Script for Mobile Performance v2.0
# This script optimizes the build for mobile PageSpeed performance

echo "🚀 Starting enhanced mobile performance build v2.0..."

# Set production environment
export NODE_ENV=production
export VITE_MOBILE_OPTIMIZED=true

# Clean previous builds more thoroughly
echo "🧹 Cleaning previous builds..."
rm -rf public/build
rm -rf node_modules/.vite
rm -rf node_modules/.cache
rm -rf storage/app/cache/*

# Install dependencies if needed with clean cache
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci --production=false --cache-max=0
else
    echo "📦 Refreshing dependencies..."
    npm ci --production=false --prefer-offline
fi

# Pre-build optimizations
echo "⚡ Running pre-build optimizations..."

# Clear Laravel caches
echo "🧹 Clearing Laravel caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize images for mobile with better compression
echo "🖼️  Optimizing images for mobile..."
if command -v cwebp >/dev/null 2>&1; then
    # Convert images to WebP with mobile-optimized settings
    find public -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | while read img; do
        webp_file="${img%.*}.webp"
        if [ ! -f "$webp_file" ] || [ "$img" -nt "$webp_file" ]; then
            # Use higher compression for mobile
            cwebp -q 75 -m 6 -pass 10 "$img" -o "$webp_file"
            echo "✅ Converted $img to WebP (mobile optimized)"
        fi
    done
    
    # Also optimize existing WebP files
    find public -name "*.webp" -size +200k | while read img; do
        cwebp -q 70 -m 6 -pass 10 "$img" -o "${img}.tmp" && mv "${img}.tmp" "$img"
        echo "✅ Re-optimized large WebP: $img"
    done
else
    echo "⚠️  cwebp not found, skipping WebP optimization"
fi

# Optimize SVG files
if command -v svgo >/dev/null 2>&1; then
    echo "🎨 Optimizing SVG files..."
    find public -name "*.svg" -exec svgo {} \;
else
    echo "⚠️  svgo not found, skipping SVG optimization"
fi

# Build with Vite optimizations
echo "🏗️  Building with Vite optimizations..."
npm run build

# Post-build optimizations
echo "📈 Running post-build optimizations..."

# Compress CSS and JS files
if command -v gzip >/dev/null 2>&1; then
    echo "🗜️  Creating gzip compressed files..."
    find public/build -name "*.css" -o -name "*.js" | while read file; do
        gzip -9 -k "$file"
        echo "✅ Compressed $file"
    done
fi

# Create Brotli compressed files if available
if command -v brotli >/dev/null 2>&1; then
    echo "🗜️  Creating Brotli compressed files..."
    find public/build -name "*.css" -o -name "*.js" | while read file; do
        brotli -q 11 -k "$file"
        echo "✅ Brotli compressed $file"
    done
fi

# Generate critical CSS
echo "🎨 Generating critical CSS..."
cat > public/critical.css << 'EOF'
/* Critical CSS for mobile performance */
*{box-sizing:border-box}
body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-display:swap;line-height:1.6;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeSpeed}
.loading-screen{position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;display:flex;align-items:center;justify-content:center;z-index:9999;contain:layout style paint}
.loader{width:40px;height:40px;border:3px solid #f3f4f6;border-top:3px solid #22c55e;border-radius:50%;animation:spin 1s linear infinite;will-change:transform}
@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
.header-placeholder{height:64px;background:#fff}
.main-content{min-height:calc(100vh - 64px);contain:layout}
@media (max-width:768px){.header-placeholder{height:56px}.main-content{min-height:calc(100vh - 56px)}}
EOF

# Optimize manifest.json for mobile
echo "📱 Optimizing PWA manifest for mobile..."
cat > public/manifest.json << 'EOF'
{
  "name": "IndoQuran - Al-Quran Digital Indonesia",
  "short_name": "IndoQuran",
  "description": "Platform Al-Quran Digital terlengkap di Indonesia",
  "start_url": "/?utm_source=pwa",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#22c55e",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["education", "lifestyle", "books"],
  "lang": "id",
  "scope": "/",
  "prefer_related_applications": false
}
EOF

# Generate service worker registration script
echo "👷 Generating optimized service worker registration..."
cat > public/sw-register.js << 'EOF'
// Optimized Service Worker Registration for Mobile
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-mobile.js', {
      scope: '/',
      updateViaCache: 'none'
    }).then(registration => {
      console.log('SW: Registered successfully');
      
      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute
      
    }).catch(error => {
      console.log('SW: Registration failed');
    });
  });
  
  // Handle service worker updates
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}
EOF

# Calculate bundle sizes
echo "📊 Bundle size analysis:"
if [ -d "public/build/assets" ]; then
    echo "CSS files:"
    find public/build/assets -name "*.css" -exec ls -lh {} \; | awk '{print $5 " " $9}'
    echo ""
    echo "JS files:"
    find public/build/assets -name "*.js" -exec ls -lh {} \; | awk '{print $5 " " $9}'
    echo ""
    
    # Calculate total sizes
    css_size=$(find public/build/assets -name "*.css" -exec cat {} \; | wc -c)
    js_size=$(find public/build/assets -name "*.js" -exec cat {} \; | wc -c)
    
    echo "📈 Total bundle sizes:"
    echo "CSS: $(echo $css_size | awk '{printf "%.1f KB", $1/1024}')"
    echo "JS: $(echo $js_size | awk '{printf "%.1f KB", $1/1024}')"
    echo "Total: $(echo $(($css_size + $js_size)) | awk '{printf "%.1f KB", $1/1024}')"
fi

# Performance recommendations
echo ""
echo "📱 Mobile Performance Recommendations:"
echo "✅ Use WebP images with fallbacks"
echo "✅ Enable gzip/brotli compression on server"
echo "✅ Implement proper cache headers"
echo "✅ Use a CDN for static assets"
echo "✅ Monitor Core Web Vitals in production"

# Test if build was successful
if [ -d "public/build/assets" ] && [ $(find public/build/assets -name "*.js" | wc -l) -gt 0 ] && [ $(find public/build/assets -name "*.css" | wc -l) -gt 0 ]; then
    echo ""
    echo "✅ Mobile-optimized build completed successfully!"
    echo "🚀 Ready for deployment with enhanced mobile performance"
    echo ""
    echo "📋 Built files:"
    echo "   CSS: $(find public/build/assets -name "*.css" | wc -l) files"
    echo "   JS: $(find public/build/assets -name "*.js" | wc -l) files" 
    echo "   Compressed: $(find public/build/assets -name "*.gz" | wc -l) gzip files"
    echo "   WebP images: $(find public -name "*.webp" | wc -l) files"
else
    echo ""
    echo "❌ Build failed - please check the errors above"
    exit 1
fi
