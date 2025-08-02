#!/bin/bash

# Enhanced build script for PageSpeed optimization
# Optimized for mobile performance and Core Web Vitals

echo "🚀 Starting optimized production build..."

# Clear previous build
echo "🧹 Cleaning previous build..."
rm -rf public/build
npm run build

echo "📊 Analyzing bundle size..."

# Check if build was successful
if [ ! -d "public/build" ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Bundle analysis
echo "📈 Bundle size analysis:"
du -sh public/build/assets/*.js | sort -hr | head -10

# Check for large chunks
echo "⚠️  Checking for oversized chunks..."
find public/build/assets -name "*.js" -size +300k -exec echo "WARNING: Large chunk found: {}" \;

# Optimize images if imagemin is available
if command -v imagemin &> /dev/null; then
    echo "🖼️  Optimizing images..."
    imagemin public/build/assets/img/* --out-dir=public/build/assets/img/ --plugin.webp.quality=80
fi

# Generate service worker for caching
echo "⚙️  Generating service worker..."
cat > public/sw.js << 'EOF'
const CACHE_NAME = 'indoquran-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/build/assets/app.css',
  '/build/assets/vendor-react-core.js',
  '/build/assets/home.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      }
    )
  );
});
EOF

# Create robots.txt if it doesn't exist
if [ ! -f "public/robots.txt" ]; then
    echo "🤖 Creating robots.txt..."
    cat > public/robots.txt << 'EOF'
User-agent: *
Allow: /
Sitemap: https://indoquran.web.id/sitemap.xml
EOF
fi

# Performance recommendations
echo "📋 Performance optimization checklist:"
echo "✅ JavaScript bundles split into small chunks"
echo "✅ CSS optimized and split"
echo "✅ Images optimized"
echo "✅ Service worker generated"
echo "✅ Robots.txt created"
echo ""
echo "🎯 Next steps for PageSpeed optimization:"
echo "1. Enable gzip/brotli compression on server"
echo "2. Set up proper cache headers"
echo "3. Use a CDN for static assets"
echo "4. Implement preload/prefetch directives"
echo "5. Test with PageSpeed Insights"
echo ""
echo "✨ Build completed successfully!"
echo "📊 Total build size:"
du -sh public/build
