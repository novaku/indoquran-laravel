# TinyMCE Production Fix - Dokumentasi

## Masalah
TinyMCE editor tidak tampil di halaman production:
- URL: https://indoquran.web.id/admin/artikel/edit/9
- Penyebab: TinyMCE tidak di-load dari CDN dan tidak ter-bundle dengan benar

## Solusi yang Diterapkan

### 1. Menambahkan TinyMCE CDN Script
**File:** `resources/views/react.blade.php`

Menambahkan script tag untuk load TinyMCE dari CDN Tiny.cloud:

```html
<!-- TinyMCE - Load from CDN for admin pages -->
<script src="https://cdn.tiny.cloud/1/x0f851mmzistj4au9egox5t5zqbwtxeuftlpfwseltrr7t0x/tinymce/7/tinymce.min.js" referrerpolicy="origin"></script>
```

Script ini di-load sebelum Vite assets, memastikan TinyMCE tersedia saat React component di-mount.

### 2. Update Vite Configuration
**File:** `vite.config.js`

Menambahkan manual chunk untuk TinyMCE di bagian `build.rollupOptions.output.manualChunks`:

```javascript
// TinyMCE - separate chunk (loaded from CDN, but React wrapper needs to be bundled)
if (id.includes('@tinymce') || id.includes('tinymce')) {
    return 'vendor-tinymce';
}
```

Ini memastikan `@tinymce/tinymce-react` wrapper di-bundle dengan benar sebagai chunk terpisah untuk optimasi loading.

## Files yang Diubah

1. **resources/views/react.blade.php** - Menambah CDN script tag
2. **vite.config.js** - Menambah manual chunk untuk TinyMCE
3. **public/build/** - Build artifacts baru dengan vendor-tinymce chunk

## Build Result

Setelah build (`npm run build`), file baru dibuat:
- `public/build/assets/vendor-tinymce-B9MQ362h.js` (14.10 kB │ gzip: 4.51 kB)
- `public/build/assets/AdminArticleEditorPage-HW9BWL16.js` (diupdate)

## Deployment ke Production

### Langkah-langkah:

1. **Sudah dilakukan di Local:**
   - ✅ Build production assets: `npm run build`
   - ✅ Commit changes ke git
   - ✅ Push ke repository: `git push origin main`

2. **Di Production Server:**

```bash
# 1. SSH ke server production
ssh user@indoquran.web.id

# 2. Navigate ke project directory
cd /path/to/indoquran-laravel

# 3. Pull latest changes (termasuk built assets)
git pull origin main

# 4. Clear Laravel caches
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear

# 5. Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Verify build files exist
ls -la public/build/assets/vendor-tinymce*.js
ls -la public/build/assets/AdminArticleEditorPage*.js

# 7. Set proper permissions (if needed)
chmod -R 755 public/build/
```

### Deployment Script Otomatis (Recommended):

```bash
# Di server production, jalankan:
./deploy-production.sh
```

Script ini akan otomatis:
- Pull latest code dari git
- Install PHP dependencies jika ada perubahan
- Run migrations jika ada
- Clear dan optimize semua caches
- Verify build assets
- Set permissions

## Verifikasi

Setelah deployment, test di browser:

1. Buka https://indoquran.web.id/admin/artikel/edit/9
2. TinyMCE editor seharusnya tampil dengan toolbar lengkap
3. Test upload gambar di editor
4. Test save artikel

### Troubleshooting

Jika TinyMCE masih tidak tampil:

1. **Check Browser Console:**
   ```
   F12 → Console → Lihat error messages
   ```

2. **Verify CDN Script Loaded:**
   ```javascript
   // Di browser console:
   console.log(typeof tinymce);
   // Should output: "object"
   ```

3. **Check Network Tab:**
   - Pastikan `tinymce.min.js` dari CDN ter-load (status 200)
   - Pastikan `vendor-tinymce-B9MQ362h.js` ter-load dari build

4. **Clear Browser Cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) atau `Cmd+Shift+R` (Mac)
   - Atau clear browser cache completely

5. **Re-deploy dengan Force:**
   ```bash
   # Di server production
   rm -rf public/build/*
   git pull origin main --force
   php artisan cache:clear
   php artisan config:clear
   ```

## Technical Details

### Mengapa CDN Script Diperlukan?

`@tinymce/tinymce-react` adalah wrapper React yang memerlukan TinyMCE core library. Ada dua pilihan:

1. **Install `tinymce` npm package** - Menambah ~1MB ke bundle size
2. **Load dari CDN** - 0 bytes di bundle, load dari Tiny.cloud CDN ✅

Kami memilih option 2 untuk performa optimal.

### API Key

API Key yang digunakan: `x0f851mmzistj4au9egox5t5zqbwtxeuftlpfwseltrr7t0x`

- API key ini gratis dari Tiny.cloud
- Sudah dikonfigurasi di `resources/js/react/config/tinymce.config.js`
- Tidak perlu diubah kecuali mau upgrade plan

### Performance Impact

**Sebelum:**
- TinyMCE tidak load sama sekali ❌
- Editor page broken

**Sesudah:**
- TinyMCE CDN: ~400KB (cached across all users)
- Vendor chunk: 14.10 KB (gzipped: 4.51 KB)
- Total overhead: Minimal, CDN ter-cache dengan baik ✅

## Git Commit

```
Commit: be56a4c
Message: Fix TinyMCE not loading in production - Add CDN script and separate vendor chunk
Date: 2025-11-01
```

## Related Files

- `resources/js/react/components/TinyMCEEditor.jsx` - TinyMCE React component
- `resources/js/react/config/tinymce.config.js` - TinyMCE configuration
- `resources/js/react/pages/AdminArticleEditorPage.jsx` - Article editor page

## Contact

Jika masih ada issue setelah deployment, hubungi developer atau check:
- Laravel logs: `storage/logs/laravel.log`
- Browser console errors
- Network tab di DevTools
