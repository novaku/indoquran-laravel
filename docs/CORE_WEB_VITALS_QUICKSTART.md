# 🚀 Core Web Vitals - Quick Start Guide

## Setup Cepat (5 Menit)

### 1. Install Dependencies
```bash
npm install web-vitals@4
```

### 2. Verify Files Created
✅ `resources/js/react/utils/coreWebVitalsReporter.js`
✅ `app/Http/Controllers/Api/CoreWebVitalsController.php`
✅ `routes/api.php` (updated)
✅ `resources/js/app.js` (updated)

### 3. Build Assets
```bash
npm run build
# or for development
npm run dev
```

### 4. Test Implementation

#### A. Browser Console Test
1. Buka website: `https://indoquran.web.id`
2. Buka DevTools (F12)
3. Ketik di Console:
```javascript
window.getCoreWebVitalsSummary()
```

Expected output:
```javascript
{
  LCP: { current: 2345, p75: 2400, rating: "good", sampleSize: 10 },
  INP: { current: 180, p75: 195, rating: "good", sampleSize: 10 },
  CLS: { current: 0.05, p75: 0.08, rating: "good", sampleSize: 10 }
}
```

#### B. API Test
```bash
# Check stats (after some data collected)
curl https://indoquran.web.id/api/web-vitals/stats

# Check specific URL
curl https://indoquran.web.id/api/web-vitals/url?url=/surah/1
```

### 5. Setup Google Analytics 4 (Optional)

1. **Get GA4 Measurement ID**
   - Go to: https://analytics.google.com
   - Create property or use existing
   - Get your `G-XXXXXXXXXX` ID

2. **Add to Layout**
   Edit: `resources/views/layouts/app.blade.php`
   
   Add before `</head>`:
   ```html
   <!-- Google Analytics 4 -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

3. **Verify Events in GA4**
   - Wait 24-48 hours for data
   - Go to: Reports > Engagement > Events
   - Look for: `LCP`, `INP`, `CLS` events

### 6. Monitor in Google Search Console

1. **Add Property**
   - Go to: https://search.google.com/search-console
   - Add: `https://indoquran.web.id`
   - Verify ownership

2. **View Core Web Vitals Report**
   - Navigate to: **Experience > Core Web Vitals**
   - Select: **Mobile** or **Desktop**
   - Wait 1-2 weeks for initial data

3. **Validate Improvements**
   - Make fixes if needed
   - Click: **Mulai Pelacakan**
   - Wait 28 days for validation

---

## 🎯 Target Metrics

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** | ≤ 2.5s | ≤ 4s | > 4s |
| **INP** | ≤ 200ms | ≤ 500ms | > 500ms |
| **CLS** | ≤ 0.1 | ≤ 0.25 | > 0.25 |

---

## 🛠️ Troubleshooting

### Metrics not showing in console?
```bash
# Clear cache and rebuild
npm run build
php artisan cache:clear
php artisan config:clear
```

### No data in API?
- Wait for users to visit site
- Check browser console for errors
- Verify API routes: `php artisan route:list | grep web-vitals`

### GA4 events not showing?
- Wait 24-48 hours
- Check GA4 Measurement ID is correct
- Verify gtag script is loaded in browser

---

## 📚 Full Documentation

Read: `docs/CORE_WEB_VITALS_IMPLEMENTATION.md`

---

## ✅ Success Criteria

After implementation, you should see:
- ✅ Metrics in browser console
- ✅ Data in `/api/web-vitals/stats` endpoint
- ✅ Events in Google Analytics 4 (after 24-48h)
- ✅ Data in Google Search Console (after 1-2 weeks)

---

**Questions?** Check full documentation or contact dev team.
