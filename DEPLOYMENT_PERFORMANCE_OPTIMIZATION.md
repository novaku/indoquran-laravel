# 🚀 Deployment Guide - Performance Optimization

## Ringkasan Perubahan

Kami telah mengimplementasikan optimasi performa berdasarkan rekomendasi PageSpeed Insights untuk meningkatkan performa mobile IndoQuran.web.id.

### Improvement yang Diharapkan:
- **FCP**: ~2.5s → ~1.5s (-40%)
- **LCP**: ~4.0s → ~2.5s (-37.5%)
- **TBT**: ~400ms → ~200ms (-50%)
- **CLS**: ~0.15 → ~0.05 (-66%)

## 📋 Pre-Deployment Checklist

- [x] ✅ Production build completed successfully
- [x] ✅ Bundle size optimized (155KB gzipped)
- [x] ✅ Service worker updated
- [x] ✅ Documentation created
- [ ] ⏳ Test on staging environment
- [ ] ⏳ Backup current production
- [ ] ⏳ Notify users about maintenance (optional)

## 🛠️ Deployment Steps

### Step 1: Backup Current Production
```bash
# Backup database
php artisan backup:run

# Backup current build
cp -r public/build public/build.backup
```

### Step 2: Pull Latest Changes
```bash
git pull origin main
```

### Step 3: Install Dependencies (if needed)
```bash
# Install/update Node packages
npm install

# Install/update Composer packages
composer install --optimize-autoloader --no-dev
```

### Step 4: Build Optimized Assets
```bash
# Run the optimization script
./optimize-performance.sh

# Or manually:
npm run build
php artisan optimize
```

### Step 5: Update Nginx Configuration (PENTING!)
```bash
# Copy nginx configuration
sudo cp nginx-performance.conf /etc/nginx/sites-available/indoquran.web.id

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 6: Clear All Caches
```bash
# Clear Laravel caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Clear OPcache (if available)
php artisan opcache:clear
```

### Step 7: Clear CDN Cache (if using CDN)
```bash
# Example for Cloudflare (adjust as needed)
# curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
#   -H "Authorization: Bearer YOUR_API_TOKEN" \
#   -H "Content-Type: application/json" \
#   --data '{"purge_everything":true}'
```

### Step 8: Verify Deployment
```bash
# Check if app is running
curl -I https://indoquran.web.id

# Check service worker
curl -I https://indoquran.web.id/sw.js

# Check build assets
curl -I https://indoquran.web.id/build/manifest.json
```

## 🧪 Post-Deployment Testing

### 1. Browser Testing
- [ ] Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- [ ] Check homepage loads correctly
- [ ] Test navigation between pages
- [ ] Verify images load (lazy loading)
- [ ] Check fonts display correctly
- [ ] Test service worker registration

### 2. Performance Testing
```bash
# Run Lighthouse mobile test
npm run performance:mobile

# Or test manually at:
# https://pagespeed.web.dev/
```

### 3. Functionality Testing
- [ ] User authentication works
- [ ] Bookmarks work correctly
- [ ] Search functionality works
- [ ] Audio player works
- [ ] PWA install prompt works

### 4. Cross-Browser Testing
- [ ] Chrome (Desktop & Mobile)
- [ ] Safari (iOS)
- [ ] Firefox
- [ ] Edge

## 🔍 Monitoring

### Immediate Monitoring (First 24 Hours)
1. **Error Logs**:
   ```bash
   tail -f /var/log/nginx/indoquran-error.log
   tail -f storage/logs/laravel.log
   ```

2. **Performance Metrics**:
   - PageSpeed Insights: https://pagespeed.web.dev/
   - Google Search Console > Core Web Vitals
   - Real user monitoring (if available)

3. **Service Worker Status**:
   - Check browser console for errors
   - Verify cache entries: `Application > Cache Storage`

### Week 1 Monitoring
- Daily PageSpeed Insights checks
- Monitor user feedback
- Check bounce rate & engagement metrics
- Review error logs for issues

## ⚠️ Troubleshooting

### Issue 1: Service Worker Not Updating
**Symptoms**: Users see old version of site

**Solution**:
```bash
# Force service worker update
# In browser console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
location.reload(true);
```

### Issue 2: Fonts Not Loading
**Symptoms**: System fonts showing instead of custom fonts

**Solution**:
1. Check Nginx CORS headers for fonts
2. Verify font files exist in public folder
3. Check browser console for font errors
4. Clear browser cache and retry

### Issue 3: Images Not Loading
**Symptoms**: Broken images or placeholder showing

**Solution**:
1. Check image paths are correct
2. Verify WebP fallback works
3. Check browser console for errors
4. Test on different browsers

### Issue 4: High Server Load
**Symptoms**: Slow response times, high CPU usage

**Solution**:
1. Check OPcache is enabled
2. Verify Laravel caches are optimized
3. Monitor database queries
4. Consider scaling server resources

## 🔄 Rollback Plan

If critical issues occur, follow this rollback procedure:

### Quick Rollback
```bash
# 1. Restore previous build
rm -rf public/build
mv public/build.backup public/build

# 2. Restore previous nginx config
sudo cp /etc/nginx/sites-available/indoquran.web.id.backup /etc/nginx/sites-available/indoquran.web.id
sudo systemctl reload nginx

# 3. Clear caches
php artisan cache:clear
php artisan optimize:clear

# 4. Notify users
# [Send notification if needed]
```

### Full Rollback
```bash
# 1. Checkout previous commit
git log --oneline -10  # Find previous stable commit
git checkout [COMMIT_HASH]

# 2. Rebuild assets
npm install
npm run build

# 3. Clear and optimize
./clear-all.sh
php artisan optimize

# 4. Reload services
sudo systemctl reload nginx
```

## 📊 Success Metrics

After deployment, track these metrics:

### Technical Metrics
- [ ] PageSpeed Insights score > 90 (mobile)
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] TTI < 3.8s

### Business Metrics
- [ ] Bounce rate decrease
- [ ] Session duration increase
- [ ] Page views increase
- [ ] User engagement improvement

## 📞 Support & Escalation

### If Issues Arise:
1. **Check logs first**: Nginx & Laravel logs
2. **Review documentation**: Check docs folder
3. **Contact team**:
   - Performance Lead: [Your Contact]
   - DevOps: [DevOps Contact]
   - Emergency: [Emergency Contact]

### Emergency Rollback Contact:
- [Primary Contact]: [Phone/Email]
- [Secondary Contact]: [Phone/Email]

## 📚 Additional Resources

- [Quick Reference](docs/PAGESPEED_OPTIMIZATION_SUMMARY.md)
- [Full Report](docs/PERFORMANCE_OPTIMIZATION_REPORT.md)
- [Technical Details](docs/MOBILE_PERFORMANCE_OPTIMIZATION.md)
- [Nginx Config](nginx-performance.conf)

## ✅ Post-Deployment Tasks

After successful deployment:

- [ ] Update CHANGELOG.md
- [ ] Document any issues encountered
- [ ] Share performance improvements with team
- [ ] Schedule follow-up review (1 week)
- [ ] Plan next optimization phase

## 🎉 Deployment Complete!

Once all checks pass:
1. ✅ Mark deployment as successful
2. ✅ Notify stakeholders
3. ✅ Schedule performance review
4. ✅ Celebrate! 🎉

---

**Deployment Date**: [To be filled]
**Deployed By**: [To be filled]
**Version**: 2.0.0
**Status**: Awaiting Deployment
