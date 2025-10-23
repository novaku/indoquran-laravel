#!/bin/bash

# Quick Fix Script for Production Server
# Run this on your cPanel server via Terminal

echo "=========================================="
echo "🚨 EMERGENCY CSS MIME TYPE FIX"
echo "=========================================="
echo ""
echo "This will update .htaccess files on production"
echo ""

# Backup existing files
echo "📦 Creating backups..."
cp public/.htaccess public/.htaccess.backup-$(date +%Y%m%d-%H%M%S)
[ -f public/build/.htaccess ] && cp public/build/.htaccess public/build/.htaccess.backup-$(date +%Y%m%d-%H%M%S)
[ -f public/build/assets/.htaccess ] && cp public/build/assets/.htaccess public/build/assets/.htaccess.backup-$(date +%Y%m%d-%H%M%S)

echo "✅ Backups created"
echo ""

# Create/update public/build/.htaccess
echo "📝 Creating public/build/.htaccess..."
cat > public/build/.htaccess << 'EOF'
# Apache 2.4.65 cPanel - Vite Build Output Directory

<IfModule mod_mime.c>
    AddType text/css                   .css
    AddType application/javascript     .js
    AddType font/woff2                 .woff2
    AddType font/woff                  .woff
    AddType font/ttf                   .ttf
    AddType font/otf                   .otf
    AddType image/svg+xml              .svg
    AddType image/webp                 .webp
</IfModule>

<IfModule mod_headers.c>
    # Critical MIME type fix for CSS
    <FilesMatch "\.css$">
        ForceType text/css
        Header always set Content-Type "text/css; charset=utf-8"
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    # JavaScript
    <FilesMatch "\.js$">
        ForceType application/javascript
        Header always set Content-Type "application/javascript; charset=utf-8"
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    # Fonts and other assets
    <FilesMatch "\.(woff2|woff|ttf|otf|svg|webp|png|jpg|jpeg|gif)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
</IfModule>

# Deny hidden files
<FilesMatch "^\.">
    <IfModule mod_authz_core.c>
        Require all denied
    </IfModule>
</FilesMatch>
EOF

# Create/update public/build/assets/.htaccess
echo "📝 Creating public/build/assets/.htaccess..."
cat > public/build/assets/.htaccess << 'EOF'
# Apache 2.4.65 cPanel - Vite Assets

<IfModule mod_mime.c>
    AddType text/css                   .css
    AddType application/javascript     .js
    AddType font/woff2                 .woff2
    AddType font/woff                  .woff
    AddType font/ttf                   .ttf
    AddType font/otf                   .otf
    AddType image/svg+xml              .svg
    AddType image/webp                 .webp
    AddType image/png                  .png
    AddType image/jpeg                 .jpg
    AddType image/jpeg                 .jpeg
</IfModule>

<IfModule mod_headers.c>
    # CSS assets - critical MIME type fix
    <FilesMatch "\.css$">
        ForceType text/css
        Header always set Content-Type "text/css; charset=utf-8"
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    # JavaScript assets
    <FilesMatch "\.js$">
        ForceType application/javascript
        Header always set Content-Type "application/javascript; charset=utf-8"
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    # Font files with proper MIME types
    <FilesMatch "\.woff2$">
        Header set Content-Type "font/woff2"
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    <FilesMatch "\.woff$">
        Header set Content-Type "font/woff"
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    <FilesMatch "\.ttf$">
        Header set Content-Type "font/ttf"
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    <FilesMatch "\.otf$">
        Header set Content-Type "font/otf"
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    # Image files
    <FilesMatch "\.(png|jpg|jpeg|webp|svg)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
</IfModule>

# Deny hidden files
<FilesMatch "^\.">
    <IfModule mod_authz_core.c>
        Require all denied
    </IfModule>
</FilesMatch>
EOF

echo "✅ .htaccess files created"
echo ""

# Set proper permissions
echo "🔒 Setting permissions..."
chmod 644 public/.htaccess
chmod 644 public/build/.htaccess 2>/dev/null
chmod 644 public/build/assets/.htaccess 2>/dev/null

echo "✅ Permissions set"
echo ""

echo "=========================================="
echo "✅ FIX APPLIED SUCCESSFULLY"
echo "=========================================="
echo ""
echo "📝 NEXT STEPS:"
echo ""
echo "1. Restart Apache (choose one):"
echo "   • cPanel: Search 'Restart' → Click 'Restart Apache'"
echo "   • Contact support if no restart option available"
echo ""
echo "2. Clear browser cache:"
echo "   • Press: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo ""
echo "3. Test in browser:"
echo "   • Open DevTools (F12)"
echo "   • Reload https://indoquran.web.id"
echo "   • Console should be clean (no red errors)"
echo ""
echo "📁 Backups saved with timestamp"
echo "=========================================="
