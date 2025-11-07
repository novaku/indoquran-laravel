#!/bin/bash

# IndoQuran - Deploy Sitemap Fixes to Production
# This script deploys the sitemap fixes to the production server

echo "🚀 Deploying Sitemap Fixes to Production"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Error: Not in Laravel project directory"
    exit 1
fi

echo "📋 Pre-deployment Checklist:"
echo "  1. All sitemap dates updated? $(grep -q '2025-11-07' public/sitemap.xml && echo '✅ Yes' || echo '❌ No')"
echo "  2. Sitemap validation test passed? (Run ./test-sitemaps.sh to verify)"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo "🔧 Preparing deployment..."

# Step 1: Commit changes to git
echo "  → Committing changes to git..."
git add public/sitemap*.xml
git add public/robots.txt
git add app/Http/Controllers/SitemapIndexController.php
git add regenerate-sitemaps.sh
git add test-sitemaps.sh
git add docs/SITEMAP_VALIDATION_FIX.md

git commit -m "fix: Update sitemaps for Google Search Console validation

- Updated all sitemap dates to 2025-11-07 (current date)
- Fixed date format in SitemapIndexController to use ISO 8601
- Updated robots.txt with proper sitemap references
- Added regenerate-sitemaps.sh automation script
- Added test-sitemaps.sh validation script
- Created comprehensive documentation in SITEMAP_VALIDATION_FIX.md

Fixes Google Search Console 'Di-crawl - saat ini tidak diindeks' issue
caused by outdated/future dates in sitemaps.

Total URLs indexed: ~5,467 across 10 sitemap files
- sitemap-index.xml (index of 8 sitemaps)
- sitemap-main.xml (128 URLs)
- sitemap-surahs-{1-6}.xml (6 files, ~5,288 URLs total)
- sitemap-juz.xml (51 URLs)
- sitemap.xml (full sitemap fallback)"

echo ""
echo "  ✅ Changes committed to git"

# Step 2: Push to repository
echo ""
echo "  → Pushing to GitHub..."
git push origin main

echo ""
echo "  ✅ Pushed to GitHub"

# Step 3: Deploy to production server (if using cPanel or SSH)
echo ""
echo "📤 Deployment Options:"
echo ""
echo "Option 1: Manual cPanel Deployment"
echo "  1. Go to cPanel File Manager"
echo "  2. Navigate to public_html"
echo "  3. Upload updated sitemap files from /public/"
echo "  4. Upload updated SitemapIndexController.php"
echo "  5. Clear cache in Laravel"
echo ""
echo "Option 2: SSH Deployment (Automated)"
echo "  Run: ssh user@indoquran.web.id 'cd public_html && git pull && php artisan config:clear && php artisan cache:clear'"
echo ""
echo "Option 3: FTP Deployment"
echo "  Use FileZilla or similar to upload:"
echo "  - public/sitemap*.xml (10 files)"
echo "  - public/robots.txt"
echo "  - app/Http/Controllers/SitemapIndexController.php"
echo ""

read -p "Deploy via SSH? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter SSH connection string (user@server): " ssh_connection
    
    echo ""
    echo "  → Connecting to production server..."
    
    # Deploy via SSH (adjust path as needed)
    ssh "$ssh_connection" << 'ENDSSH'
cd public_html || cd htdocs || cd www
echo "Connected to production server"
echo ""

# Pull latest changes
echo "Pulling latest changes from git..."
git pull origin main

# Clear Laravel caches
echo "Clearing Laravel caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Verify sitemaps
echo ""
echo "Verifying sitemaps..."
ls -lh public/sitemap*.xml | head -5

echo ""
echo "✅ Deployment complete!"
ENDSSH

    echo ""
    echo "  ✅ SSH deployment complete"
else
    echo ""
    echo "  ℹ️  Manual deployment required"
fi

echo ""
echo "========================================="
echo "✅ Deployment Process Complete!"
echo ""
echo "📋 Post-Deployment Tasks:"
echo ""
echo "1. Verify sitemaps are accessible:"
echo "   → https://indoquran.web.id/sitemap.xml"
echo "   → https://indoquran.web.id/sitemap-index.xml"
echo ""
echo "2. Test with Google's Sitemap Tester:"
echo "   → https://www.xml-sitemaps.com/validate-xml-sitemap.html"
echo ""
echo "3. Submit to Google Search Console:"
echo "   → https://search.google.com/search-console"
echo "   → Sitemaps section"
echo "   → Add: https://indoquran.web.id/sitemap-index.xml"
echo ""
echo "4. Monitor indexing status (24-48 hours):"
echo "   → Coverage report"
echo "   → Index status"
echo ""
echo "5. Optional: Run regenerate-sitemaps.sh monthly"
echo "   → Set up cron job for automation"
echo ""
echo "Done! 🎉"
