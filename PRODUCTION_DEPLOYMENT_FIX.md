# 🚀 Production Deployment Fix for Green Loading Screen

## 📋 Quick Fix Checklist

If you're seeing the green loading screen in production, follow these steps in order:

### ✅ Step 1: Upload Fixed Files

Upload these critical files to your production server:

```bash
# Core files (MUST UPLOAD)
resources/views/react.blade.php
resources/js/react/index.jsx
resources/js/react/hooks/useAuth.jsx
vite.config.js

# Production build assets (MUST UPLOAD)
public/build/
```

### ✅ Step 2: Clear Server Caches

```bash
# Clear all Laravel caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# If using OPcache, restart PHP-FPM
sudo systemctl reload php8.2-fpm
# OR
sudo service php8.2-fpm reload
```

### ✅ Step 3: Verify Assets

```bash
# Check if manifest exists
ls -la public/build/manifest.json

# Check asset files
ls -la public/build/assets/

# Verify permissions
chmod -R 644 public/build/
chmod 755 public/build/
```

### ✅ Step 4: Test API Endpoints

```bash
# Test if the auth endpoint works
curl -H "Accept: application/json" https://yourdomain.com/api/user

# Should return either user data (if authenticated) or 401/403
```

## 🔧 Advanced Troubleshooting

### Browser-Side Checks

1. **Open Developer Tools** (F12)
2. **Check Console tab** for errors
3. **Check Network tab** for:
   - Failed asset requests (404s)
   - CORS errors
   - Timeout errors

### Server-Side Checks

1. **Check error logs:**
   ```bash
   tail -f storage/logs/laravel.log
   tail -f /var/log/nginx/error.log  # For Nginx
   tail -f /var/log/apache2/error.log  # For Apache
   ```

2. **Verify web server configuration:**
   ```bash
   # Nginx - ensure assets are served properly
   location /build/ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   
   # Apache - ensure mod_rewrite is enabled
   a2enmod rewrite
   ```

### Content Security Policy (CSP) Issues

If you have CSP headers, ensure they allow:
```
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
connect-src 'self';
```

## 🛠️ Emergency Manual Fix

If the automated fixes don't work, manually apply these changes:

### 1. Fix vite.config.js

```javascript
// REMOVE this line if it exists:
// 'resources/js/app.js',

// Should only have:
input: ['resources/css/app.css', 'resources/js/react/index.jsx'],
```

### 2. Fix react.blade.php

```php
<!-- REMOVE app.js if it exists: -->
<!-- OLD: @vite(['resources/css/app.css', 'resources/js/app.js', 'resources/js/react/index.jsx']) -->
<!-- NEW: -->
@vite(['resources/css/app.css', 'resources/js/react/index.jsx'])
```

### 3. Rebuild Assets Manually

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Verify build
ls -la public/build/manifest.json
```

## 🔍 Diagnostic Commands

Run these commands to diagnose issues:

```bash
# Check if React app initializes
grep -r "React app initialized" storage/logs/

# Check for JavaScript errors
grep -r "Failed to initialize React" storage/logs/

# Check asset requests
grep -r "GET.*build.*404" /var/log/nginx/access.log

# Check for Alpine.js conflicts
grep -r "Alpine" resources/views/react.blade.php
grep -r "app.js" vite.config.js
```

## 🚨 Common Issues & Solutions

### Issue 1: Assets Not Found (404)

**Symptoms:** Browser console shows 404 errors for /build/assets/ files

**Solution:**
```bash
# Rebuild assets
npm run build

# Check permissions
chmod -R 644 public/build/
chmod 755 public/build/

# Verify web server can access files
curl -I https://yourdomain.com/build/manifest.json
```

### Issue 2: CORS Errors

**Symptoms:** Browser console shows CORS policy errors

**Solution:**
```php
// In config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie', 'build/*'],
'allowed_origins' => ['https://yourdomain.com'],
```

### Issue 3: Authentication Timeout

**Symptoms:** Green screen with "App masih loading..." message

**Solution:**
```bash
# Check if /api/user endpoint responds quickly
time curl -H "Accept: application/json" https://yourdomain.com/api/user

# Should respond within 2-3 seconds
```

### Issue 4: JavaScript Framework Conflict

**Symptoms:** React never initializes, Alpine.js conflicts

**Solution:**
```bash
# Remove Alpine.js completely from React view
sed -i.bak 's/resources\/js\/app.js, //' resources/views/react.blade.php
sed -i.bak 's/resources\/js\/app.js, //' vite.config.js
```

## 📊 Performance Optimization

After fixing the green screen, optimize performance:

```bash
# Enable gzip compression in Nginx
gzip on;
gzip_types text/css application/javascript text/javascript;

# Enable browser caching for assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Enable HTTP/2 if available
listen 443 ssl http2;
```

## 🎯 Prevention Checklist

To prevent future green screen issues:

- [ ] Never load both Alpine.js and React in the same view
- [ ] Always test production builds before deployment
- [ ] Monitor JavaScript console for errors
- [ ] Use timeout protection for API calls
- [ ] Implement proper error boundaries in React
- [ ] Keep browser cache invalidation in mind
- [ ] Use automated deployment scripts

## 📞 Support

If you're still experiencing issues:

1. **Check the diagnostic script results**
2. **Share browser console errors**
3. **Share server log entries**
4. **Test in incognito mode**
5. **Try different browsers**

---

**🚀 This guide covers the complete fix for the green loading screen issue that occurs when Alpine.js and React conflict in production environments.**
