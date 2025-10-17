# 🚀 Production Deployment Workflow

## 📋 Overview

Production server **TIDAK memiliki Node.js/npm**. Semua frontend assets harus di-build di mesin lokal, lalu di-commit ke git dan di-pull di server production.

---

## ⚠️ PENTING!

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  SERVER PRODUCTION TIDAK MEMILIKI NODE.JS/NPM          │
│                                                             │
│  ✅ DO:   Build assets di local → Commit → Push            │
│  ❌ DON'T: Jangan run npm di production server            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Deployment Workflow

### **Step 1: Development & Testing (Local Machine)**

```bash
# 1. Buat perubahan code
vim resources/js/react/components/MyComponent.jsx

# 2. Test di local
npm run dev

# 3. Test di browser
# http://localhost:8000
```

---

### **Step 2: Build Assets (Local Machine)**

```bash
# Option A: Manual build
npm run build

# Option B: Using build script (recommended)
./build-production.sh

# Verify build files created
ls -lh public/build/
ls -lh public/build/assets/
```

**Expected output:**
```
public/build/
├── manifest.json          # Vite manifest file
└── assets/
    ├── app-[hash].js      # Main application JS
    ├── app-[hash].css     # Main application CSS
    ├── vendor-[hash].js   # Vendor chunk (libraries)
    └── ... other chunks
```

---

### **Step 3: Commit & Push (Local Machine)**

```bash
# 1. Add build files to git
git add public/build

# 2. Add your code changes
git add resources/js/
git add app/
# ... other changed files

# 3. Commit with descriptive message
git commit -m "Add new feature X with production build"

# atau untuk SEO optimization:
git commit -m "SEO optimization: backend API + production build"

# 4. Push to GitHub
git push origin main
```

---

### **Step 4: Deploy to Production (Production Server)**

```bash
# 1. SSH ke production server
ssh user@indoquran.web.id

# 2. Navigate to app directory
cd ~/public_html

# 3. Run deployment script
./deploy-production.sh
```

**Script akan otomatis:**
- ✅ Pull latest code dari git
- ✅ Install/update PHP dependencies (Composer)
- ✅ Run database migrations
- ✅ Clear Laravel caches
- ✅ Optimize Laravel configs
- ✅ Verify build assets exist
- ✅ Set proper permissions
- ✅ Test cache connections

---

## 📝 Deployment Script Details

### `/deploy-production.sh` melakukan:

#### 1. Environment Verification
```bash
# Check production environment
✓ Verify APP_ENV=production in .env
✓ Confirm Node.js/npm NOT installed (correct for production)
✓ Check Laravel is running without errors
```

#### 2. Git Pull
```bash
# Pull latest code including pre-built assets
git pull origin main
```

#### 3. PHP Dependencies
```bash
# Install Composer packages (production optimized)
composer install --no-dev --optimize-autoloader --no-interaction
```

#### 4. Database Migrations
```bash
# Run any pending migrations
php artisan migrate --force
```

#### 5. Cache Optimization
```bash
# Clear all caches
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches (optimized)
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Quran-specific cache
php artisan quran:cache clear
php artisan quran:cache warm-up
```

#### 6. Build Assets Verification
```bash
# Verify build directory exists
✓ Check public/build/ directory
✓ Check public/build/manifest.json
✓ Check public/build/assets/ has files
✓ Verify vendor chunk files present
✓ Protect vendor files from deletion (chmod 444)
```

#### 7. Permissions
```bash
# Set proper permissions
chmod 775 storage bootstrap/cache -R
chmod 664 storage bootstrap/cache files -R
```

---

## 🛠️ Troubleshooting

### Issue 1: "Vite manifest.json not found"

**Cause:** Build files tidak ada di repository

**Solution:**
```bash
# On LOCAL machine:
cd ~/Documents/GitHub/indoquran-laravel
npm run build
git add public/build
git commit -m "Add missing build files"
git push origin main

# On PRODUCTION server:
git pull origin main
./deploy-production.sh
```

---

### Issue 2: "Build directory not found"

**Cause:** Folder `public/build/` belum di-commit

**Solution:**
```bash
# On LOCAL machine:
npm install          # Install dependencies first
npm run build        # Build assets
ls public/build/     # Verify files exist

git add public/build
git commit -m "Add production build files"
git push origin main

# On PRODUCTION server:
git pull origin main
./deploy-production.sh
```

---

### Issue 3: "Vendor chunk files missing"

**Cause:** Build tidak complete atau ada script yang menghapus files

**Solution:**
```bash
# On LOCAL machine:
rm -rf public/build          # Clean old build
npm run build                # Fresh build
ls -lh public/build/assets/  # Verify vendor*.js exists

git add public/build
git commit -m "Rebuild vendor chunks"
git push origin main

# On PRODUCTION server:
git pull origin main
./deploy-production.sh
```

---

### Issue 4: "Node.js/npm detected on production server"

**Cause:** Node.js terinstall di server (unusual untuk shared hosting)

**Action:**
- Script akan warning tapi tetap lanjut
- Pastikan TIDAK run `npm install` atau `npm run build` di server
- Semua build HARUS dari local machine

---

### Issue 5: Cache tidak working

**Redis cache:**
```bash
# Check Redis status
~/redis/status-redis.sh

# Start Redis if stopped
~/redis/start-redis.sh

# Test connection
php -r "try { \$r = new Redis(); \$r->connect('/home/indoqura/tmp/redis.sock'); echo \$r->ping() ? 'OK' : 'FAIL'; } catch(Exception \$e) { echo 'ERROR: ' . \$e->getMessage(); }"

# Re-run deployment to warm cache
./deploy-production.sh
```

**Database cache:**
```bash
# Ensure cache table exists
php artisan cache:table
php artisan migrate

# Test cache
php artisan tinker
>>> Cache::put('test', 'value', 60);
>>> Cache::get('test');
```

---

## 📊 Post-Deployment Checks

### 1. Verify Application is Running

```bash
# Check Laravel status
php artisan about

# List routes
php artisan route:list

# Check cache status
php artisan quran:cache status
```

### 2. Test Frontend

Visit your website:
- Homepage: `https://indoquran.web.id/`
- Surah page: `https://indoquran.web.id/surah/1`
- Check browser console for errors (F12)

### 3. Monitor Logs

```bash
# Live log monitoring
tail -f storage/logs/laravel.log

# Check for errors
grep ERROR storage/logs/laravel.log

# Check last 50 lines
tail -50 storage/logs/laravel.log
```

### 4. Test API Endpoints

```bash
# Test SEO API
curl https://indoquran.web.id/api/seo/popular-surahs

# Test Surah API
curl https://indoquran.web.id/api/surahs/1

# Test health check
curl https://indoquran.web.id/
```

---

## 🎯 Best Practices

### ✅ DO:

1. **Always build locally**
   ```bash
   npm run build  # On local machine
   ```

2. **Commit build files**
   ```bash
   git add public/build
   git commit -m "Update build"
   ```

3. **Test locally first**
   ```bash
   npm run dev
   # Test thoroughly before building for production
   ```

4. **Use descriptive commit messages**
   ```bash
   git commit -m "Add SEO optimization: FAQ schema + popular surahs API"
   ```

5. **Verify build before pushing**
   ```bash
   ls -lh public/build/assets/
   # Should see app*.js, vendor*.js, app*.css
   ```

### ❌ DON'T:

1. **Don't run npm on production server**
   ```bash
   # ❌ WRONG (on production):
   ssh production
   npm install  # This will FAIL - no npm on server!
   ```

2. **Don't delete build files**
   ```bash
   # ❌ WRONG:
   rm -rf public/build  # Don't delete without rebuilding!
   ```

3. **Don't push without building**
   ```bash
   # ❌ WRONG:
   git add resources/js/
   git commit -m "Update component"
   git push
   # Missing: npm run build!
   ```

4. **Don't commit node_modules**
   ```bash
   # ❌ WRONG:
   git add node_modules/  # Too large, not needed in production
   ```

5. **Don't skip testing**
   ```bash
   # ❌ WRONG:
   # Make changes → Build → Push
   # Missing: Test locally first!
   ```

---

## 📚 Related Scripts

### `/build-production.sh`
Build script untuk local machine dengan optimizations:
- Tree-shaking untuk remove unused code
- Minification untuk smaller files
- Vendor chunking untuk better caching
- Source maps (disabled untuk production)

```bash
# Usage:
./build-production.sh
```

### `/build-optimized.sh`
Alternative build dengan extra optimizations:
- Additional compression
- Image optimization
- CSS purging

```bash
# Usage:
./build-optimized.sh
```

### `/deploy-production.sh`
Deployment script untuk production server:
- NO npm/node commands
- Only PHP operations
- Verifies build assets exist

```bash
# Usage (on production server):
./deploy-production.sh
```

---

## 🔄 Quick Reference

### Typical Deployment Flow:

```bash
# ============================================
# LOCAL MACHINE
# ============================================

# 1. Make changes
vim resources/js/react/components/MyComponent.jsx

# 2. Test locally
npm run dev
# Test in browser

# 3. Build for production
npm run build

# 4. Verify build
ls -lh public/build/assets/

# 5. Commit & push
git add .
git commit -m "Add feature X with production build"
git push origin main

# ============================================
# PRODUCTION SERVER
# ============================================

# 6. SSH to server
ssh user@indoquran.web.id

# 7. Deploy
cd ~/public_html
./deploy-production.sh

# 8. Verify
curl https://indoquran.web.id/
tail -f storage/logs/laravel.log
```

---

## 📞 Support

### Deployment Issues:
1. Check logs: `storage/logs/laravel.log`
2. Review deployment script output
3. Verify build files: `ls public/build/`
4. Test API endpoints: `curl https://indoquran.web.id/api/seo/popular-surahs`

### Build Issues:
1. Clear local cache: `rm -rf node_modules/.vite`
2. Reinstall deps: `npm clean-install`
3. Fresh build: `rm -rf public/build && npm run build`

### Cache Issues:
1. Clear all caches: `php artisan cache:clear && php artisan config:clear`
2. Check Redis: `~/redis/status-redis.sh`
3. Re-warm cache: `php artisan quran:cache warm-up`

---

## 🎉 Summary

**Golden Rule:**
```
🏠 LOCAL MACHINE  → Build assets (npm run build)
📦 GIT REPOSITORY → Store build files
🚀 PRODUCTION     → Pull & deploy (./deploy-production.sh)
```

**Never run npm on production server!**

---

**Last Updated:** October 17, 2025
**Production Server:** indoquran.web.id (No Node.js/npm)
**Build Environment:** Local machine (macOS/Linux with npm)
