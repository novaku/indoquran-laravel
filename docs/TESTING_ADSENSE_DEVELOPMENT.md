# Testing AdSense Implementation - Development Environment

## Testing Checklist (Sebelum Deploy Production)

### ✅ 1. Server & Build Status
- [x] Build production berhasil tanpa error
- [x] Laravel development server running di port 8000
- [x] Aplikasi bisa diakses di http://localhost:8000

### ✅ 2. Script Integration Verification
- [x] Google Funding Choices script loaded
  ```html
  <script async src="https://fundingchoicesmessages.google.com/i/pub-9994842285785390?ers=1">
  ```
- [x] Google AdSense script loaded
  ```html
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9994842285785390">
  ```
- [x] DNS prefetch untuk fundingchoicesmessages.google.com
- [x] DNS prefetch untuk pagead2.googlesyndication.com

### 🔍 3. Page-by-Page Testing

#### Halaman dengan Sidebar Lengkap (Full Implementation)
- [ ] **QuranHomePage** (/)
  - [ ] Sidebar terlihat di desktop (≥1024px)
  - [ ] 2 unit iklan muncul di sidebar
  - [ ] Sidebar hidden di mobile (<1024px)
  - [ ] Tidak ada JavaScript error di console
  - [ ] Info boxes tetap terlihat
  
- [ ] **SurahListPage** (/surah)
  - [ ] Sidebar terlihat di desktop
  - [ ] 1 unit iklan muncul di sidebar
  - [ ] Statistik Al-Quran terlihat di bawah iklan
  - [ ] Search functionality tetap bekerja
  - [ ] Grid layout tidak broken

#### Halaman dengan Import Only (Belum Sidebar)
- [ ] **ArticlesPage** (/artikel)
  - [ ] Halaman load tanpa error
  - [ ] Layout normal (belum ada sidebar)
  - [ ] No console errors
  
- [ ] **ArticleDetailPage** (/artikel/{slug})
  - [ ] Halaman load tanpa error
  - [ ] Konten artikel normal
  
- [ ] **AsmaulHusnaPage** (/asmaul-husna)
  - [ ] Halaman load tanpa error
  - [ ] Daftar Asmaul Husna normal
  
- [ ] **TafsirMaudhuiPage** (/tafsir-maudhuhi)
  - [ ] Halaman load tanpa error
  - [ ] Daftar tafsir normal
  
- [ ] **QuranSearchPage** (/cari)
  - [ ] Halaman load tanpa error
  - [ ] Search functionality bekerja
  
- [ ] **AboutProjectPage** (/tentang)
  - [ ] Halaman load tanpa error
  - [ ] Content terlihat lengkap
  
- [ ] **PrivacyPage** (/privasi)
  - [ ] Halaman load tanpa error
  - [ ] Privacy policy lengkap
  
- [ ] **PrayerPage** (/shalat)
  - [ ] Halaman load tanpa error
  - [ ] Prayer times functionality
  
- [ ] **JuzPage** (/juz/{number})
  - [ ] Halaman load tanpa error
  - [ ] Ayah list normal
  
- [ ] **JuzIndexPage** (/juz)
  - [ ] Halaman load tanpa error
  - [ ] Daftar 30 juz terlihat
  
- [ ] **SurahDetailPage** (/surah/{number})
  - [ ] Halaman load tanpa error (CRITICAL - 2447 baris)
  - [ ] Audio player bekerja
  - [ ] Ayah navigation normal
  - [ ] Bookmark functionality

### 4. Responsive Testing
- [ ] Desktop (≥1024px)
  - [ ] Sidebar visible dengan grid 8/4
  - [ ] Ad placeholders terlihat (gray boxes)
  - [ ] Sticky behavior bekerja saat scroll
  
- [ ] Tablet (768px - 1023px)
  - [ ] Sidebar hidden (lg:col-span-4 tidak aktif)
  - [ ] Content full-width
  
- [ ] Mobile (<768px)
  - [ ] Sidebar completely hidden
  - [ ] Content full-width
  - [ ] No horizontal scroll

### 5. Browser Console Check
- [ ] No JavaScript errors
- [ ] AdSense script loaded successfully
- [ ] CMP script loaded successfully
- [ ] No CORS errors
- [ ] No 404 errors untuk ads.txt

### 6. Performance Check
- [ ] Page load time normal (<3 detik)
- [ ] No excessive re-renders
- [ ] Lazy loading components bekerja
- [ ] No memory leaks

### 7. AdSense Placeholder Behavior
**Note:** Di development environment, iklan TIDAK akan muncul karena:
1. Domain localhost tidak terdaftar di Google AdSense
2. Belum ada approval dari Google
3. CMP consent belum disetup untuk localhost

**Expected Behavior:**
- Gray box placeholders untuk ad units (dari CSS `min-h-[600px] bg-gray-100`)
- No console errors terkait adsbygoogle
- Script tetap loaded (verifikasi di Network tab)

### 8. Git Status
- [x] All changes committed
- [x] Pushed to repository
- [x] No uncommitted files

## Testing Instructions

### Manual Testing Steps

1. **Open Browser DevTools**
   ```
   Cmd+Option+I (Mac) / F12 (Windows)
   ```

2. **Test Homepage**
   ```
   http://localhost:8000
   ```
   - Check sidebar visible (desktop view)
   - Check 2 ad placeholders
   - Resize browser to mobile (<1024px)
   - Verify sidebar hidden

3. **Test SurahListPage**
   ```
   http://localhost:8000/surah
   ```
   - Check sidebar with 1 ad
   - Check Al-Quran statistics box
   - Test search functionality

4. **Test Import-Only Pages**
   Kunjungi setiap halaman dari list di atas:
   - Check no errors
   - Verify normal layout
   - Check console untuk errors

5. **Console Verification**
   ```javascript
   // Di browser console, cek:
   typeof window.adsbygoogle // should be 'object' or 'undefined' (OK)
   // No errors like "adsbygoogle.push is not a function"
   ```

6. **Network Tab Check**
   - Filter: `fundingchoices` - should see request
   - Filter: `adsbygoogle` - should see request
   - Check `/ads.txt` - HTTP 200

## Expected Results

### ✅ Success Criteria
1. All pages load without errors
2. Sidebar visible di halaman QuranHomePage dan SurahListPage (desktop only)
3. Ad placeholders terlihat (gray boxes)
4. Responsive behavior bekerja (sidebar hidden di mobile)
5. No JavaScript errors di console
6. All import statements tidak menyebabkan build errors

### ⚠️ Expected Limitations
1. **Ads tidak muncul** - Normal karena:
   - Localhost tidak terdaftar di AdSense
   - Belum ada approval dari Google
   - Development environment

2. **CMP popup tidak muncul** - Normal karena:
   - Localhost bukan production domain
   - Consent management hanya aktif di production

3. **Ad placeholders only** - Akan terlihat gray boxes saja

### 🔴 Red Flags (STOP & FIX)
1. Console errors mentioning `adsbygoogle`
2. Build errors
3. 404 errors untuk `ads.txt`
4. Layout broken (sidebar overlap content)
5. Infinite loops atau excessive re-renders
6. White screen of death (WSOD)

## Next Steps After Testing

### If All Tests Pass ✅
1. Deploy to production dengan `./deploy-production.sh`
2. Verify ads.txt di production: https://indoquran.web.id/ads.txt
3. Wait 24-48 hours untuk Google crawl
4. Monitor AdSense dashboard untuk approval

### If Issues Found 🔴
1. Document error messages
2. Check browser console
3. Check Laravel logs: `storage/logs/laravel.log`
4. Fix issues sebelum deploy
5. Re-test after fixes

## Production Deployment Checklist

- [ ] All development tests passed
- [ ] No console errors
- [ ] Build successful
- [ ] Git committed and pushed
- [ ] Run `./deploy-production.sh`
- [ ] Verify production domain
- [ ] Check ads.txt accessible
- [ ] Submit to Google AdSense untuk review

## Contact & Support

Jika menemukan issues:
1. Check `ADSENSE_INTEGRATION_TEMPLATE.md` untuk guidance
2. Review component implementation di `AdSenseVertical.jsx`
3. Check Laravel logs
4. Test di incognito mode untuk rule out cache issues

---

**Created:** 2025-01-XX
**Status:** Development Testing
**Next Step:** Manual browser testing
