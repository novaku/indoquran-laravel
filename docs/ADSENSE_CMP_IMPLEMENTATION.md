# Google AdSense + CMP Implementation

## 📋 Overview
Implementasi Google AdSense dengan Consent Management Platform (CMP) yang disertifikasi Google untuk IndoQuran, mengikuti rekomendasi terbaik dari Google untuk kepatuhan terhadap GDPR, ePrivacy Directive, CCPA, dan regulasi privasi lainnya.

## ✅ Komponen yang Diimplementasikan

### 1. Google Funding Choices (CMP)
```html
<!-- Google Funding Choices (Consent Management Platform) -->
<script async src="https://fundingchoicesmessages.google.com/i/pub-9994842285785390?ers=1" nonce="FUNDING_CHOICES_NONCE"></script>
<script nonce="FUNDING_CHOICES_NONCE">
(function() {
  function signalGooglefcPresent() {
    if (!window.frames['googlefcPresent']) {
      if (document.body) {
        const iframe = document.createElement('iframe');
        iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;';
        iframe.style.display = 'none';
        iframe.name = 'googlefcPresent';
        document.body.appendChild(iframe);
      } else {
        setTimeout(signalGooglefcPresent, 0);
      }
    }
  }
  signalGooglefcPresent();
})();
</script>
```

**Fungsi:**
- Menampilkan pesan consent kepada pengguna dari EEA, UK, dan Swiss
- Mengelola pilihan privasi pengguna
- Terintegrasi otomatis dengan Google AdSense
- Bersertifikasi Google dan memenuhi standar TCF v2.2

### 2. Google AdSense
```html
<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9994842285785390"
     crossorigin="anonymous"></script>
```

**Publisher ID:** ca-pub-9994842285785390

### 3. DNS Prefetch Optimization
```html
<link rel="dns-prefetch" href="//fundingchoicesmessages.google.com">
<link rel="dns-prefetch" href="//pagead2.googlesyndication.com">
```

**Manfaat:**
- Mempercepat loading script consent dan AdSense
- Mengurangi latency DNS lookup
- Meningkatkan performa Core Web Vitals

## 🎯 Fitur Utama

### Consent Management
- ✅ **GDPR Compliant**: Memenuhi persyaratan General Data Protection Regulation (EU)
- ✅ **ePrivacy Directive**: Sesuai dengan ePrivacy Directive (EU Cookie Law)
- ✅ **CCPA Compliant**: Memenuhi California Consumer Privacy Act
- ✅ **TCF v2.2**: Menggunakan Transparency & Consent Framework versi 2.2
- ✅ **Auto-detection**: Otomatis mendeteksi lokasi pengguna dan menampilkan pesan yang sesuai

### Performance Optimization
- ⚡ **Async Loading**: Script dimuat secara asynchronous untuk tidak memblokir rendering
- ⚡ **DNS Prefetch**: Pre-resolve DNS untuk domain Google sebelum request aktual
- ⚡ **Correct Order**: CMP dimuat sebelum AdSense untuk memastikan consent ditangani dengan benar
- ⚡ **Minimal Impact**: Implementasi ringan yang tidak mengorbankan performa website

## 📍 Lokasi File

**Template HTML:**
- `resources/views/react.blade.php` (baris 52-65, 120-127)

**Test Script:**
- `test-adsense-cmp.sh` - Script untuk verifikasi implementasi

## 🚀 Deployment

### Langkah-langkah Deploy

1. **Commit Changes**
```bash
git add resources/views/react.blade.php test-adsense-cmp.sh
git commit -m "feat: implement Google AdSense with CMP for GDPR compliance"
git push origin main
```

2. **Deploy to Production**
```bash
./deploy-production.sh
```

3. **Verifikasi di Google AdSense**
- Login ke [Google AdSense](https://www.google.com/adsense/)
- Pilih "Verifikasi kepemilikan situs"
- Pilih metode: **"Salin kode AdSense"**
- Klik "Verifikasi" atau tunggu deteksi otomatis (biasanya beberapa jam)

4. **Konfigurasi Funding Choices**
- Buka [Google Funding Choices](https://fundingchoices.google.com/)
- Login dengan akun AdSense yang sama
- Pilih "Privacy & messaging"
- Buat pesan consent untuk:
  - GDPR (untuk pengguna EEA)
  - CCPA (untuk pengguna California)
  - ePrivacy (untuk UK)

## 🧪 Testing

### Local Testing
```bash
./test-adsense-cmp.sh
```

**Output yang diharapkan:**
```
✓ AdSense script found
✓ Funding Choices (CMP) script found
✓ DNS prefetch for Funding Choices found
✓ DNS prefetch for AdSense found
✓ Correct order: CMP loads before AdSense
✓ Blade template cleared successfully
```

### Production Testing

1. **Test Consent Dialog (dari EEA/UK)**
   - Gunakan VPN ke lokasi EU
   - Kunjungi https://indoquran.web.id
   - Dialog consent akan muncul untuk pengguna EEA/UK

2. **Test AdSense Integration**
   - Buka browser DevTools → Network
   - Cari request ke `fundingchoicesmessages.google.com`
   - Cari request ke `pagead2.googlesyndication.com`
   - Pastikan kedua script berhasil dimuat

3. **Validate HTML**
   ```bash
   curl -s https://indoquran.web.id | grep -o 'fundingchoicesmessages.google.com'
   curl -s https://indoquran.web.id | grep -o 'pagead2.googlesyndication.com'
   ```

## 📊 Monitoring

### Google AdSense Dashboard
- Monitor approval status
- Check estimated earnings
- Review policy compliance

### Google Funding Choices Dashboard
- Monitor consent rates
- Review user choices (Accept/Reject)
- Track geographic distribution

### Search Console
- Monitor untuk "Ads.txt" warnings
- Check mobile usability
- Review Core Web Vitals impact

## 🔧 Troubleshooting

### Issue: Consent dialog tidak muncul
**Solusi:**
1. Pastikan Anda mengakses dari lokasi yang memerlukan consent (EEA, UK, atau Swiss)
2. Clear browser cache dan cookies
3. Check browser console untuk error
4. Verifikasi script Funding Choices dimuat dengan benar

### Issue: AdSense tidak terdeteksi
**Solusi:**
1. Pastikan kode sudah di-deploy ke production
2. Tunggu 24-48 jam untuk verifikasi otomatis
3. Check bahwa script AdSense ada di view-source HTML
4. Verifikasi tidak ada AdBlocker yang aktif

### Issue: "Ads.txt file not found"
**Solusi:**
1. Buat file `public/ads.txt` dengan content:
```
google.com, pub-9994842285785390, DIRECT, f08c47fec0942fa0
```

2. Deploy dan verifikasi di: https://indoquran.web.id/ads.txt

### Issue: Performance impact
**Solusi:**
1. Script sudah menggunakan `async` attribute
2. DNS prefetch sudah diaktifkan
3. Monitor Core Web Vitals di PageSpeed Insights
4. Jika perlu, delay loading sampai user interaction

## 📚 Referensi

### Google Official Documentation
- [Privacy & Messaging (CMP)](https://support.google.com/adsense/answer/13554116?hl=id)
- [AdSense Verification](https://support.google.com/adsense/answer/9274634?hl=id)
- [Funding Choices Help](https://support.google.com/fundingchoices)
- [TCF v2.2 Specification](https://iabeurope.eu/tcf-2-0/)

### Privacy Regulations
- [GDPR (EU)](https://gdpr.eu/)
- [ePrivacy Directive](https://ec.europa.eu/digital-single-market/en/privacy-and-electronic-communications)
- [CCPA (California)](https://oag.ca.gov/privacy/ccpa)

### Best Practices
- [Google AdSense Best Practices](https://support.google.com/adsense/answer/1346295)
- [Core Web Vitals](https://web.dev/vitals/)
- [Consent Mode v2](https://support.google.com/analytics/answer/9976101)

## 🔐 Security & Privacy

### Data Collection
- CMP mengumpulkan data consent pengguna
- Data disimpan sesuai dengan regulasi privasi
- Pengguna dapat mengubah pilihan consent kapan saja

### Cookie Usage
- Google AdSense menggunakan cookies untuk personalisasi iklan
- Cookies hanya diset setelah user memberikan consent
- Non-personalized ads ditampilkan jika user menolak consent

### GDPR Compliance Checklist
- [x] Consent banner ditampilkan untuk pengguna EEA
- [x] Pengguna dapat memilih accept/reject
- [x] Consent disimpan dan dapat diubah
- [x] Privacy policy link tersedia
- [x] Menggunakan CMP bersertifikasi Google
- [x] TCF v2.2 compliant

## 📝 Changelog

### Version 1.0.0 - November 8, 2025
- ✨ Initial implementation of Google AdSense
- ✨ Integrated Google Funding Choices (CMP)
- ✨ Added DNS prefetch optimization
- ✨ Created test script for validation
- 📚 Added comprehensive documentation

## 🎓 Training Resources

### For Developers
- Pelajari cara kerja CMP: [Funding Choices Documentation](https://support.google.com/fundingchoices)
- Pahami TCF v2.2: [IAB Europe TCF](https://iabeurope.eu/tcf-2-0/)
- Monitor performance: [Web Vitals Guide](https://web.dev/vitals/)

### For Content Team
- AdSense optimization: [AdSense Help Center](https://support.google.com/adsense)
- Ad placement best practices: [Where to place ads](https://support.google.com/adsense/answer/1346295)
- Policy compliance: [AdSense Program Policies](https://support.google.com/adsense/answer/48182)

## 🤝 Support

Jika ada masalah atau pertanyaan:
1. Check troubleshooting section di atas
2. Review Google AdSense Help Center
3. Contact Google AdSense Support
4. Review logs di `storage/logs/laravel.log`

---

**Last Updated:** November 8, 2025  
**Maintained by:** IndoQuran Development Team  
**Contact:** [GitHub Issues](https://github.com/novaku/indoquran-laravel/issues)
