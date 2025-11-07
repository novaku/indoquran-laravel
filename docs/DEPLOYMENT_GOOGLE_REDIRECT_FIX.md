# Deployment Guide - Google Redirect Validation Fix

## Overview
This guide covers deploying the fix for Google Search Console's "Halaman dengan pengalihan" (Page with redirect) validation failure.

## Pre-Deployment Checklist

- [ ] Review all modified files
- [ ] Test locally (see Testing section)
- [ ] Backup production database
- [ ] Backup `.htaccess` file
- [ ] Verify production domain configuration
- [ ] Schedule deployment during low-traffic period

## Modified Files

```
app/Http/Middleware/CanonicalUrlRedirect.php
app/Http/Middleware/DomainRedirectMiddleware.php
app/Http/Controllers/SitemapController.php
public/.htaccess
```

## Deployment Steps

### Step 1: Local Testing (MANDATORY)

```bash
# 1. Start development server
./dev-env.sh
# Select option 1: "Start Development (Laravel + Vite)"

# 2. Run redirect header tests
./tests/test-redirect-headers.sh

# 3. Verify robots.txt
curl http://localhost:8000/robots.txt

# Expected output should include:
# Disallow: /*?*utm_source=
# Disallow: /*/

# 4. Test redirect manually
curl -I "http://localhost:8000/surah/1/?utm_source=test"

# Should see:
# HTTP/1.1 301 Moved Permanently
# X-Robots-Tag: noindex, nofollow
# Location: http://localhost:8000/surah/1
```

### Step 2: Build for Production

```bash
# Run production build script
./build-production.sh

# This will:
# - Clear all caches
# - Optimize Laravel configuration
# - Build Vite assets
# - Run image optimization
```

### Step 3: Deploy to Production

```bash
# Option A: Using deployment script
./deploy-production.sh

# Option B: Manual deployment via Git
git add .
git commit -m "fix: Add X-Robots-Tag to redirects to fix Google indexing validation"
git push origin main

# Then on production server:
cd /path/to/indoquran-laravel
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 4: Verify Production Deployment

```bash
# Test production URL with trailing slash
curl -I "https://indoquran.web.id/surah/1/"

# Expected response:
# HTTP/2 301
# x-robots-tag: noindex, nofollow
# location: https://indoquran.web.id/surah/1

# Test production URL with UTM parameter
curl -I "https://indoquran.web.id/?utm_source=facebook"

# Expected response:
# HTTP/2 301
# x-robots-tag: noindex, nofollow
# location: https://indoquran.web.id/

# Verify robots.txt
curl https://indoquran.web.id/robots.txt | grep "Disallow"

# Should see:
# Disallow: /*?*utm_source=
# Disallow: /*/
```

### Step 5: Google Search Console Actions

#### A. Verify URL Inspection

1. Go to: https://search.google.com/search-console
2. Select property: `indoquran.web.id`
3. Click: **URL Inspection** (top bar)
4. Test URL: `https://indoquran.web.id/surah/1/` (with trailing slash)
5. Click: **Test Live URL**
6. Wait for results...
7. Expected: Should show "Page with redirect" or "URL is not on Google"

#### B. Request Validation

1. Go to: **Indexing** → **Pages**
2. Scroll to: **Why pages aren't indexed**
3. Find row: **"Halaman dengan pengalihan"** (Page with redirect)
4. Click on the row to open details
5. Click: **VALIDATE FIX** button
6. Confirm validation request

#### C. Monitor Validation Progress

1. After requesting validation, check status in:
   - **Indexing** → **Pages** → Click on the issue row
   - Look for validation status bar at top
2. States you'll see:
   - **Started** - Validation begun
   - **In progress** - Google is checking URLs
   - **Passed** - All URLs validated successfully ✅
   - **Failed** - Some URLs still have issues ❌

Expected timeline:
- **1-3 days**: Google starts validation
- **1-2 weeks**: Validation completes

## Post-Deployment Monitoring

### Daily Checks (First Week)

```bash
# Check production headers daily
curl -I "https://indoquran.web.id/surah/1/" | grep -i "x-robots-tag"

# Should return:
# x-robots-tag: noindex, nofollow
```

### Weekly Checks (First Month)

1. **Google Search Console - Coverage Report**
   - Go to: **Indexing** → **Pages**
   - Monitor: "Not indexed" count (should decrease)
   - Monitor: "Indexed" count (should stay stable or increase)

2. **Indexed Pages Count**
   - Search Google: `site:indoquran.web.id`
   - Note the count
   - Should NOT see URLs with trailing slashes or UTM parameters

3. **Organic Traffic**
   - Go to: **Performance** → **Search results**
   - Monitor clicks and impressions
   - Should remain stable or improve

### Monthly Checks

1. **robots.txt Effectiveness**
   ```bash
   # Check Google's crawl stats
   # Go to: Search Console → Settings → Crawl stats
   # Look for: Reduced crawl rate on parameterized URLs
   ```

2. **Validation Status**
   - Check if "Halaman dengan pengalihan" issue is resolved
   - Verify no new redirect issues appeared

## Troubleshooting

### Problem 1: X-Robots-Tag Header Not Appearing

**Symptoms:**
```bash
curl -I "https://indoquran.web.id/surah/1/"
# No X-Robots-Tag header in response
```

**Solution A: Check Laravel Cache**
```bash
ssh user@production-server
cd /path/to/indoquran-laravel
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

**Solution B: Check .htaccess Upload**
```bash
# Verify .htaccess was uploaded correctly
cat public/.htaccess | grep "X-Robots-Tag"

# Should show:
# Header always set X-Robots-Tag "noindex, nofollow" env=NOINDEX
```

**Solution C: Check Apache mod_headers**
```bash
# Verify mod_headers is enabled
apachectl -M | grep headers

# Should show:
# headers_module (shared)
```

### Problem 2: Validation Still Failing After 2 Weeks

**Solution A: Request URL Removal**
1. Go to: Search Console → **Removals**
2. Click: **New request**
3. Enter URL pattern: `https://indoquran.web.id/*?utm_*`
4. Select: **Remove all URLs with this prefix**
5. Submit request

**Solution B: Check for New Redirect Sources**
```bash
# Check server logs for redirect patterns
tail -f /var/log/apache2/access.log | grep "301"

# Look for:
# - New tracking parameters
# - Unexpected redirect patterns
```

**Solution C: Verify sitemap.xml**
```bash
curl https://indoquran.web.id/sitemap.xml

# Verify NO URLs have:
# - Trailing slashes
# - UTM parameters
# - Other tracking parameters
```

### Problem 3: robots.txt Not Working

**Symptoms:**
- Google still crawling URLs with tracking parameters

**Solution A: Test robots.txt in Google**
1. Go to: Search Console → **Settings** → **robots.txt**
2. Test URL: `https://indoquran.web.id/surah/1?utm_source=test`
3. Should show: **Blocked**

**Solution B: Regenerate robots.txt**
```bash
# Force regenerate robots.txt
curl https://indoquran.web.id/robots.txt > /tmp/robots-new.txt
cat /tmp/robots-new.txt

# Verify content is correct
```

### Problem 4: Organic Traffic Dropped

**Immediate Action:**
1. Check Google Analytics for traffic patterns
2. Verify canonical URLs are still indexed:
   ```bash
   # Search Google
   site:indoquran.web.id/surah/1
   ```
3. If canonical URLs missing, check sitemap submission

**Rollback Plan (if needed):**
```bash
# Revert changes
git revert HEAD
git push origin main

# Redeploy
./deploy-production.sh
```

## Success Criteria

### Week 1
- ✅ X-Robots-Tag header appears on all redirect responses
- ✅ robots.txt updated with new rules
- ✅ Google Search Console shows validation "In progress"

### Week 2-3
- ✅ Validation status changes to "Passed"
- ✅ "Halaman dengan pengalihan" issue count decreases
- ✅ No new redirect issues appear

### Month 1
- ✅ "Halaman dengan pengalihan" issue fully resolved (count = 0)
- ✅ Organic traffic stable or improved
- ✅ Crawl budget more efficient (fewer wasted crawls)

## Rollback Instructions

### If Critical Issues Occur

1. **Immediate Rollback via Git**
   ```bash
   cd /path/to/indoquran-laravel
   git log --oneline -n 5  # Find commit hash before fix
   git revert <commit-hash>
   git push origin main
   ```

2. **Manual Rollback - .htaccess**
   ```bash
   # Remove these lines from public/.htaccess:
   # RewriteRule ^ %1 [L,R=301,E=NOINDEX:1]
   # Header always set X-Robots-Tag "noindex, nofollow" env=NOINDEX
   
   # Replace with:
   # RewriteRule ^ %1 [L,R=301]
   ```

3. **Manual Rollback - Middleware**
   ```bash
   # In app/Http/Middleware/CanonicalUrlRedirect.php
   # Remove: ->header('X-Robots-Tag', 'noindex, nofollow')
   
   # In app/Http/Middleware/DomainRedirectMiddleware.php
   # Remove: ->header('X-Robots-Tag', 'noindex, nofollow')
   ```

4. **Clear Caches**
   ```bash
   php artisan config:clear
   php artisan route:clear
   php artisan cache:clear
   ```

## Support & Documentation

- **Main Documentation**: `docs/GOOGLE_REDIRECT_VALIDATION_FIX.md`
- **Test Script**: `tests/test-redirect-headers.sh`
- **Google Help**: https://support.google.com/webmasters/answer/7440203#page_with_redirect

## Contact & Escalation

If issues persist after following this guide:

1. Review server logs: `/var/log/apache2/error.log`
2. Check Laravel logs: `storage/logs/laravel.log`
3. Verify Apache configuration
4. Contact hosting provider if mod_headers issues persist

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Validation Requested**: _______________  
**Status**: ⬜ Pending ⬜ In Progress ⬜ Completed ✅
