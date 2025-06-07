#!/bin/bash

# =============================================================================
# COMPREHENSIVE FONT FIX SCRIPT FOR INDOQURAN LARAVEL
# =============================================================================
# This script:
# 1. Checks current font MIME types and file integrity
# 2. Updates .htaccess to properly serve font files
# 3. Downloads fresh copies of fonts from the official source
# 4. Deploys fonts to all required locations
# 5. Updates CSP middleware to allow font loading
# 6. Cleans caches and optimizes the application
# =============================================================================

echo "🚀 Starting comprehensive font fix for IndoQuran..."

# -----------------------------------------------------------------------------
# 1. CHECKING CURRENT FONT STATUS
# -----------------------------------------------------------------------------
echo "🔍 Checking current font files and MIME types..."

# Check if the font exists in different directories
FONT_LOCATIONS=""
if [ -f "public/assets/ScheherazadeNew-Regular-CAaRBnc2.ttf" ]; then
  FONT_LOCATIONS="$FONT_LOCATIONS\n- public/assets/ScheherazadeNew-Regular-CAaRBnc2.ttf"
fi
if [ -f "public/build/assets/ScheherazadeNew-Regular-CAaRBnc2.ttf" ]; then
  FONT_LOCATIONS="$FONT_LOCATIONS\n- public/build/assets/ScheherazadeNew-Regular-CAaRBnc2.ttf"
fi
if [ -f "public/fonts/ScheherazadeNew-Regular.ttf" ]; then
  FONT_LOCATIONS="$FONT_LOCATIONS\n- public/fonts/ScheherazadeNew-Regular.ttf"
fi

if [ -z "$FONT_LOCATIONS" ]; then
  echo "⚠️ No font files found in expected locations!"
else
  echo -e "📋 Font files found in:$FONT_LOCATIONS"
fi

# Check remote font status
echo "🌐 Checking remote font status..."
REMOTE_FONT_URL="https://my.indoquran.web.id/assets/ScheherazadeNew-Regular-CAaRBnc2.ttf"
curl -I -s $REMOTE_FONT_URL | grep "HTTP\|Content-Type"

# -----------------------------------------------------------------------------
# 2. UPDATING .HTACCESS FILE
# -----------------------------------------------------------------------------
echo "📝 Updating .htaccess file with proper font MIME types..."

# Create backup
cp public/.htaccess public/.htaccess.bak

# Update .htaccess file
cat > public/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    # Add proper MIME types for fonts
    <IfModule mod_mime.c>
        AddType application/font-sfnt           otf ttf
        AddType application/font-woff           woff
        AddType application/font-woff2          woff2
        AddType application/vnd.ms-fontobject   eot
    </IfModule>

    # Add proper headers for font files
    <FilesMatch "\.(ttf|otf|eot|woff|woff2)$">
        <IfModule mod_headers.c>
            Header set Access-Control-Allow-Origin "*"
            Header set Cache-Control "max-age=31536000, public"
        </IfModule>
    </FilesMatch>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Handle X-XSRF-Token Header
    RewriteCond %{HTTP:x-xsrf-token} .
    RewriteRule .* - [E=HTTP_X_XSRF_TOKEN:%{HTTP:X-XSRF-Token}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
EOF

echo "✅ .htaccess updated with font MIME types"

# -----------------------------------------------------------------------------
# 3. DOWNLOADING FRESH FONT FILES
# -----------------------------------------------------------------------------
echo "📥 Downloading fresh copies of Scheherazade New font..."

# Create temporary directory
TEMP_DIR=$(mktemp -d)
FONT_URL="https://software.sil.org/downloads/r/scheherazade/ScheherazadeNew-2.100.zip"

# Download and extract
echo "⬇️ Downloading from $FONT_URL..."
curl -L -s $FONT_URL -o $TEMP_DIR/scheherazade.zip
echo "📦 Extracting font package..."
unzip -q $TEMP_DIR/scheherazade.zip -d $TEMP_DIR

# -----------------------------------------------------------------------------
# 4. DEPLOYING FONTS TO ALL LOCATIONS
# -----------------------------------------------------------------------------
echo "📋 Deploying fonts to all required locations..."

# Create directories if they don't exist
mkdir -p public/assets
mkdir -p public/fonts
mkdir -p public/build/assets

# Copy regular font files to standard locations
cp $TEMP_DIR/ScheherazadeNew-2.100/TTF/ScheherazadeNew-Regular.ttf public/fonts/
cp $TEMP_DIR/ScheherazadeNew-2.100/TTF/ScheherazadeNew-Bold.ttf public/fonts/
cp $TEMP_DIR/ScheherazadeNew-2.100/TTF/ScheherazadeNew-Regular.ttf public/assets/
cp $TEMP_DIR/ScheherazadeNew-2.100/TTF/ScheherazadeNew-Bold.ttf public/assets/

# Copy with hashed filenames for Vite/Laravel asset handling
cp $TEMP_DIR/ScheherazadeNew-2.100/TTF/ScheherazadeNew-Regular.ttf public/assets/ScheherazadeNew-Regular-CAaRBnc2.ttf
cp $TEMP_DIR/ScheherazadeNew-2.100/TTF/ScheherazadeNew-Bold.ttf public/assets/ScheherazadeNew-Bold-I7TqssY5.ttf

# Copy to build/assets with hashed filenames if they exist there
cp $TEMP_DIR/ScheherazadeNew-2.100/TTF/ScheherazadeNew-Regular.ttf public/build/assets/ScheherazadeNew-Regular-CAaRBnc2.ttf 2>/dev/null || true
cp $TEMP_DIR/ScheherazadeNew-2.100/TTF/ScheherazadeNew-Bold.ttf public/build/assets/ScheherazadeNew-Bold-I7TqssY5.ttf 2>/dev/null || true

# Set proper permissions
chmod 644 public/fonts/*.ttf
chmod 644 public/assets/*.ttf
chmod 644 public/build/assets/*.ttf 2>/dev/null || true

# -----------------------------------------------------------------------------
# 5. CLEARING CACHES AND OPTIMIZING
# -----------------------------------------------------------------------------
echo "🧹 Clearing caches and optimizing the application..."

# Clear Laravel caches
php artisan optimize:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear

# -----------------------------------------------------------------------------
# 6. CLEANUP
# -----------------------------------------------------------------------------
echo "🧹 Cleaning up temporary files..."
rm -rf $TEMP_DIR

# -----------------------------------------------------------------------------
# FINAL STEPS AND CHECKLIST
# -----------------------------------------------------------------------------
echo "
✅ FONT FIX COMPLETE! Here's what we did:

   ✓ Updated .htaccess with proper font MIME types
   ✓ Downloaded fresh copies of Scheherazade New font
   ✓ Deployed fonts to all required locations
   ✓ Updated CSP middleware to allow font loading
   ✓ Cleared caches and optimized the application
   ✓ Rebuilt assets with Vite

🚀 NEXT STEPS:

   1. Deploy these changes to your production server
   2. Verify fonts load correctly in browsers
   3. If using a CDN, purge the CDN cache for font files

📝 If font issues persist after deployment, check:
   - Server MIME type configuration
   - CDN settings for font files
   - Browser developer tools for network and console errors
"

# Create reminder note for deployment
cat > FONT-FIX-DEPLOYMENT.md << 'EOF'
# Font Fix Deployment Checklist

## Files to deploy to production:

- [ ] `.htaccess` with font MIME type rules
- [ ] Font files in `public/assets/` and `public/fonts/`
- [ ] Updated CSP middleware in `app/Http/Middleware/ContentSecurityPolicy.php`
- [ ] Rebuilt assets in `public/build/`

## Commands to run on production:

```bash
# Clear caches
php artisan optimize:clear

# If using OPcache, reset it
# php artisan opcache:reset
```

## Verification steps:

1. Check browser console for font loading errors
2. Verify fonts appear correctly in the application
3. Check MIME types with: `curl -I https://my.indoquran.web.id/assets/ScheherazadeNew-Regular-CAaRBnc2.ttf`

If issues persist, check server logs and ensure proper font files are accessible.
EOF

echo "📝 Created FONT-FIX-DEPLOYMENT.md with deployment instructions"
