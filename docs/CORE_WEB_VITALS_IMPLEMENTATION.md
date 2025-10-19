# 🎯 Core Web Vitals - Implementasi Google Search Console

## 📋 Overview

Dokumen ini menjelaskan implementasi Core Web Vitals sesuai dengan standar Google Search Console untuk IndoQuran.

**Referensi:** [Google Search Console - Core Web Vitals](https://support.google.com/webmasters/answer/9205520?hl=id)

---

## 🎯 Core Web Vitals (3 Metrik Utama)

Google mengukur pengalaman pengguna dengan 3 metrik utama:

### 1. LCP (Largest Contentful Paint)
**Definisi:** Waktu untuk merender elemen konten terbesar yang terlihat di viewport.

**Threshold:**
- ✅ **Good:** ≤ 2.5 detik
- ⚠️ **Needs Improvement:** ≤ 4 detik
- ❌ **Poor:** > 4 detik

**Cara Mengoptimalkan:**
- Preload gambar kritis
- Optimasi font loading dengan `font-display: swap`
- Compress dan lazy load gambar
- Gunakan CDN untuk aset statis

### 2. INP (Interaction to Next Paint)
**Definisi:** Mengukur responsivitas halaman terhadap interaksi pengguna (klik, tap, keyboard).

> ⚠️ **Penting:** INP menggantikan FID (First Input Delay) sejak Maret 2024

**Threshold:**
- ✅ **Good:** ≤ 200 milidetik
- ⚠️ **Needs Improvement:** ≤ 500 milidetik
- ❌ **Poor:** > 500 milidetik

**Cara Mengoptimalkan:**
- Kurangi blocking JavaScript
- Code splitting dan lazy loading
- Defer non-critical scripts
- Optimasi event handlers

### 3. CLS (Cumulative Layout Shift)
**Definisi:** Mengukur stabilitas visual - jumlah pergeseran layout tidak terduga.

**Threshold:**
- ✅ **Good:** ≤ 0.1
- ⚠️ **Needs Improvement:** ≤ 0.25
- ❌ **Poor:** > 0.25

**Cara Mengoptimalkan:**
- Set dimensi eksplisit untuk gambar dan iframe
- Reserve space untuk dynamic content
- Avoid inserting content above existing content
- Optimasi font loading

---

## 📊 Cara Kerja Pelaporan

### 75th Percentile Rule
Google menggunakan **nilai pada 75% kunjungan** untuk menentukan status:
- Jika 75% kunjungan memiliki LCP ≤ 2.5s, status = **Good**
- Jika 75% kunjungan memiliki LCP ≤ 4s, status = **Needs Improvement**
- Jika lebih dari 25% kunjungan > 4s, status = **Poor**

### Status Grup URL
Status grup ditentukan oleh metrik terburuk:
- URL dengan CLS **Poor** dan LCP **Good** = Status **Poor**
- URL dengan ketiga metrik **Good** = Status **Good**

---

## 🛠️ Implementasi di IndoQuran

### 1. Frontend Monitoring

#### File: `resources/js/react/utils/coreWebVitalsReporter.js`
```javascript
import { initCoreWebVitalsReporting } from './react/utils/coreWebVitalsReporter';

// Initialize monitoring
initCoreWebVitalsReporting({
    sendToGA: true,        // Send to Google Analytics 4
    sendToCustom: true,    // Send to custom endpoint
    reportAllChanges: false // Report final values only
});
```

#### File: `resources/js/react/hooks/useAdvancedPerformanceMonitor.js`
Hook untuk monitoring real-time dengan INP support:
```javascript
const { getMetrics } = useAdvancedPerformanceMonitor({
    trackLCP: true,
    trackINP: true,  // INP replaces FID
    trackCLS: true,
    trackTTFB: true,
    onMetric: (metric) => {
        console.log(`${metric.name}: ${metric.value} (${metric.rating})`);
    }
});
```

#### File: `public/performance-monitor.js`
Standalone monitoring untuk semua halaman (non-React):
- Menggunakan PerformanceObserver API
- Tracking LCP, INP, CLS secara otomatis
- Mengirim data ke endpoint backend

### 2. Backend API

#### Endpoint: `POST /api/web-vitals`
Menerima data Core Web Vitals dari frontend:
```json
{
    "metric_name": "LCP",
    "metric_value": 2345,
    "metric_rating": "good",
    "metric_delta": 123,
    "metric_id": "v3-1234567890123",
    "url": "https://indoquran.web.id/surah/1",
    "device_info": {
        "viewport_width": 1920,
        "viewport_height": 1080,
        "connection": {
            "effective_type": "4g",
            "downlink": 10
        }
    }
}
```

#### Endpoint: `GET /api/web-vitals/stats`
Mendapatkan statistik agregat:
```json
{
    "success": true,
    "data": {
        "LCP": {
            "count": 1234,
            "p50": 2100,
            "p75": 2450,
            "p90": 3200,
            "p95": 3800,
            "ratings": {
                "good": 1000,
                "needs_improvement": 200,
                "poor": 34
            }
        }
    }
}
```

#### Endpoint: `GET /api/web-vitals/url?url=/surah/1`
Mendapatkan statistik per URL:
```json
{
    "success": true,
    "url": "/surah/1",
    "data": {
        "LCP": {
            "count": 456,
            "p75": 2300,
            "current_rating": "good"
        }
    }
}
```

---

## 📈 Monitoring di Google Search Console

### Langkah Setup:

1. **Verifikasi Properti**
   - Buka [Google Search Console](https://search.google.com/search-console)
   - Tambahkan properti `https://indoquran.web.id`
   - Verifikasi ownership

2. **Akses Laporan Core Web Vitals**
   - Navigasi ke: **Experience > Core Web Vitals**
   - Pilih platform: **Mobile** atau **Desktop**
   - Lihat status: **Good**, **Needs Improvement**, atau **Poor**

3. **Analisis Data**
   - Data diambil dari **Chrome User Experience Report (CrUX)**
   - Minimal jumlah data diperlukan untuk tampil di laporan
   - Data diupdate setiap hari
   - Menggunakan nilai **75th percentile**

4. **Validasi Perbaikan**
   - Klik **Mulai Pelacakan** setelah fix masalah
   - Google akan monitoring selama **28 hari**
   - Jika tidak ada masalah, status = **Lulus**
   - Jika masih ada masalah, status = **Gagal**

### Tips Monitoring:

✅ **Do:**
- Monitor secara teratur (mingguan)
- Fokus pada grup URL dengan status Poor
- Test dengan [PageSpeed Insights](https://pagespeed.web.dev/)
- Monitor per-device (mobile vs desktop)
- Track perubahan setelah deployment

❌ **Don't:**
- Jangan hanya fokus pada 1 URL
- Jangan ignore "Needs Improvement" status
- Jangan lupa validate perbaikan
- Jangan abaikan mobile performance

---

## 🔧 Debugging & Testing

### 1. Browser DevTools
```javascript
// Di console, jalankan:
window.getCoreWebVitalsSummary()

// Output:
{
    LCP: { current: 2345, p75: 2400, rating: "good", sampleSize: 50 },
    INP: { current: 180, p75: 195, rating: "good", sampleSize: 50 },
    CLS: { current: 0.05, p75: 0.08, rating: "good", sampleSize: 50 }
}
```

### 2. Performance Panel
1. Buka DevTools > Performance
2. Record page load
3. Cek **Experience** section untuk CLS
4. Cek **Timings** untuk LCP, FCP

### 3. Lighthouse
```bash
# Run Lighthouse audit
npx lighthouse https://indoquran.web.id --view

# Focus on Core Web Vitals
npx lighthouse https://indoquran.web.id \
  --only-categories=performance \
  --view
```

### 4. PageSpeed Insights API
```bash
# Check URL performance
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://indoquran.web.id&category=PERFORMANCE"
```

### 5. Web Vitals Extension
Install: [Web Vitals Chrome Extension](https://chrome.google.com/webstore/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma)
- Real-time monitoring saat browsing
- Overlay metrics di halaman
- Export data untuk analisis

---

## 📊 Google Analytics 4 Integration

### Setup GA4 Event Tracking:

1. **Install GA4**
```html
<!-- Add to layout head -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

2. **Events Automatically Sent**
Sistem otomatis mengirim events dengan format:
```javascript
gtag('event', 'LCP', {
    event_category: 'Web Vitals',
    event_label: 'v3-1234567890123',
    value: 2345,
    metric_rating: 'good',
    non_interaction: true
});
```

3. **View in GA4**
   - Navigate to: **Reports > Engagement > Events**
   - Filter by: `event_name = LCP|INP|CLS`
   - Create custom report untuk Core Web Vitals

---

## 🚀 Best Practices

### Performance Optimization Checklist:

#### LCP Optimization:
- [ ] Preload critical images
- [ ] Use WebP format untuk gambar
- [ ] Implement lazy loading
- [ ] Enable CDN caching
- [ ] Optimize server response time (TTFB < 600ms)

#### INP Optimization:
- [ ] Code splitting untuk JavaScript
- [ ] Defer non-critical scripts
- [ ] Optimize event handlers
- [ ] Reduce main thread work
- [ ] Use web workers untuk heavy tasks

#### CLS Optimization:
- [ ] Set width/height untuk semua images
- [ ] Reserve space untuk dynamic content
- [ ] Use `font-display: swap`
- [ ] Avoid layout shifts during font loading
- [ ] Use CSS containment (`contain: layout`)

---

## 📱 Mobile vs Desktop

### Mobile Considerations:
- Slower networks (3G, 4G)
- Less powerful CPU
- Smaller viewport
- Touch interactions (INP)

### Desktop Considerations:
- Faster networks
- More powerful CPU
- Larger viewport
- Mouse/keyboard interactions

**Important:** Google menggunakan threshold yang **sama** untuk mobile dan desktop!

---

## 🔄 Update History

### v3.0.0 - INP Implementation (2024)
- ✅ Replaced FID with INP
- ✅ Updated thresholds per Google standards
- ✅ Implemented 75th percentile reporting
- ✅ Added GA4 integration
- ✅ Backend API untuk data collection

### v2.0.0 - Initial Implementation (2023)
- FID, LCP, CLS monitoring
- Basic Google Analytics integration

---

## 📚 Resources

### Official Documentation:
- [Google Search Console - Core Web Vitals](https://support.google.com/webmasters/answer/9205520)
- [Web.dev - Core Web Vitals](https://web.dev/vitals/)
- [Chrome User Experience Report](https://developers.google.com/web/tools/chrome-user-experience-report/)

### Tools:
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals Extension](https://chrome.google.com/webstore/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

### Libraries:
- [web-vitals](https://github.com/GoogleChrome/web-vitals) - Official Google library
- [PerformanceObserver API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)

---

## 🆘 Troubleshooting

### Problem: "No data available" di Search Console
**Solution:**
- Site baru butuh waktu beberapa hari untuk data muncul
- Minimum traffic diperlukan untuk CrUX data
- Check di [CrUX Dashboard](https://developers.google.com/web/tools/chrome-user-experience-report/)

### Problem: CLS terlalu tinggi
**Solution:**
- Cek images tanpa dimensions
- Cek dynamic content insertion
- Cek font loading strategy
- Use Chrome DevTools > Performance > Experience

### Problem: INP terlalu tinggi
**Solution:**
- Profile JavaScript dengan DevTools
- Check long tasks (>50ms)
- Optimize event handlers
- Use requestIdleCallback untuk non-critical work

### Problem: LCP terlalu lambat
**Solution:**
- Identify LCP element dengan Lighthouse
- Preload critical resources
- Optimize server response time
- Use CDN untuk static assets

---

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Check dokumentasi di `/docs`
2. Review code di `/resources/js/react/utils/coreWebVitalsReporter.js`
3. Test dengan PageSpeed Insights
4. Contact development team

---

**Last Updated:** October 19, 2025
**Version:** 3.0.0
**Status:** ✅ Production Ready
