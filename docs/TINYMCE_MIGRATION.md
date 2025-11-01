# Perubahan Editor: TipTap → TinyMCE

## ✅ Perubahan Selesai Dilakukan

### 1. Package Installation
- **Installed**: `@tinymce/tinymce-react` (TinyMCE React component)
- **Retained**: TipTap packages masih ada di `package.json` (bisa dihapus jika tidak diperlukan)

### 2. File Baru yang Dibuat
1. **`resources/js/react/components/TinyMCEEditor.jsx`**
   - Component wrapper untuk TinyMCE editor
   - Terintegrasi dengan upload image Laravel
   - Auto-save setiap 30 detik
   - Bahasa Indonesia default
   - Mobile responsive

2. **`resources/js/react/config/tinymce.config.js`**
   - Konfigurasi terpusat untuk TinyMCE
   - API key management
   - Settings untuk image upload
   - Language & height settings

3. **`TINYMCE_SETUP.md`**
   - Panduan lengkap setup TinyMCE
   - Cara mendapatkan API key gratis
   - Troubleshooting guide
   - Alternatif self-hosted

### 3. File yang Dimodifikasi
1. **`resources/js/react/pages/AdminArticleEditorPage.jsx`**
   - Import: `TipTapEditor` → `TinyMCEEditor`
   - Component usage: `<TipTapEditor>` → `<TinyMCEEditor>`
   - Props tetap sama (backward compatible)

2. **`package.json`**
   - Ditambahkan dependency: `@tinymce/tinymce-react`

### 4. Build Status
✅ **Build BERHASIL** (23.86s)
- Semua assets ter-compile dengan baik
- Tidak ada error atau warning
- Bundle size tetap optimal

## 🎯 Langkah Selanjutnya (PENTING!)

### 1. Dapatkan API Key TinyMCE (GRATIS)
```
1. Daftar: https://www.tiny.cloud/auth/signup/
2. Verifikasi email
3. Login ke dashboard: https://www.tiny.cloud/my-account/dashboard/
4. Copy API key Anda
```

### 2. Masukkan API Key
Buka file: `resources/js/react/config/tinymce.config.js`

Ganti baris ini:
```javascript
apiKey: 'your-api-key-here',
```

Dengan API key Anda:
```javascript
apiKey: 'xxxxx-xxxxx-xxxxx-xxxxx-xxxxx',
```

### 3. Rebuild (Setelah Memasukkan API Key)
```bash
npm run build
# atau untuk development
npm run dev
```

## 🚀 Fitur TinyMCE yang Tersedia

### Text Formatting
- ✅ Bold, Italic, Underline, Strikethrough
- ✅ Headings (H1-H6)
- ✅ Text color & background color
- ✅ Font size & family

### Content Structure
- ✅ Ordered & unordered lists
- ✅ Indentation (indent/outdent)
- ✅ Text alignment (left, center, right, justify)
- ✅ Blockquotes
- ✅ Horizontal rules

### Rich Media
- ✅ Image upload dengan drag & drop
- ✅ Link insertion
- ✅ Media embedding (YouTube, Vimeo, etc.)
- ✅ Tables dengan border & styling

### Advanced Features
- ✅ Code blocks dengan syntax highlighting (10+ bahasa)
- ✅ Emoticons
- ✅ Special characters
- ✅ Search & replace
- ✅ Character & word count
- ✅ Preview mode
- ✅ Fullscreen mode

### Auto Features
- ✅ Auto-save (setiap 30 detik)
- ✅ Auto-restore (jika browser crash)
- ✅ Auto-link detection
- ✅ Smart paste (dari Word/Excel)

### Indonesian Support
- ✅ Interface dalam Bahasa Indonesia
- ✅ Toolbar tooltips dalam bahasa Indonesia
- ✅ Error messages dalam bahasa Indonesia

## 📊 Perbandingan: TipTap vs TinyMCE

| Feature | TipTap | TinyMCE |
|---------|--------|---------|
| **Setup Complexity** | Medium | Easy (cloud-based) |
| **Bundle Size** | Smaller | Larger (loaded from CDN) |
| **Features** | Basic | Comprehensive |
| **Plugins** | Limited | 50+ plugins |
| **UI/UX** | Custom | Professional |
| **Documentation** | Good | Excellent |
| **Commercial Support** | Paid | Free tier available |
| **Image Upload** | Manual implementation | Built-in |
| **Auto-save** | Manual | Built-in |
| **Mobile Support** | Basic | Full responsive |
| **Accessibility** | Good | Excellent (WCAG compliant) |

## 🔧 Maintenance

### Untuk Update TinyMCE
```bash
npm update @tinymce/tinymce-react
npm run build
```

### Untuk Kembali ke TipTap (Jika Diperlukan)
1. Restore `AdminArticleEditorPage.jsx`:
   ```javascript
   import TipTapEditor from '../components/TipTapEditor';
   // ...
   <TipTapEditor content={...} onChange={...} />
   ```

2. Rebuild:
   ```bash
   npm run build
   ```

## 🐛 Troubleshooting

### Error: "This domain is not registered"
**Penyebab**: API key belum dimasukkan atau salah
**Solusi**: Pastikan API key sudah benar di `tinymce.config.js`

### Error: "Failed to load TinyMCE"
**Penyebab**: Koneksi internet atau CDN bermasalah
**Solusi**: Cek koneksi internet, atau gunakan self-hosted mode

### Editor Tidak Muncul
**Penyebab**: Build belum dijalankan atau cache browser
**Solusi**:
```bash
npm run build
# Clear browser cache: Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)
```

### Upload Gambar Gagal
**Penyebab**: CSRF token atau endpoint bermasalah
**Solusi**:
```bash
# Check storage link
php artisan storage:link

# Check CSRF endpoint
curl http://localhost:8000/admin/csrf-token

# Clear cache
php artisan cache:clear
```

## 📚 Dokumentasi

- **TinyMCE Docs**: https://www.tiny.cloud/docs/
- **React Integration**: https://www.tiny.cloud/docs/tinymce/latest/react-ref/
- **Plugins**: https://www.tiny.cloud/docs/tinymce/latest/plugins/
- **API Reference**: https://www.tiny.cloud/docs/tinymce/latest/apis/

## ✨ Tips & Tricks

1. **Keyboard Shortcuts**:
   - `Ctrl+B`: Bold
   - `Ctrl+I`: Italic
   - `Ctrl+U`: Underline
   - `Ctrl+Z`: Undo
   - `Ctrl+Y`: Redo
   - `Ctrl+K`: Insert link
   - `F11`: Fullscreen

2. **Image Upload**:
   - Drag & drop gambar langsung ke editor
   - Paste gambar dari clipboard
   - Click toolbar icon untuk browse file

3. **Auto-save**:
   - Editor auto-save setiap 30 detik
   - Data tersimpan di browser localStorage
   - Auto-restore jika browser crash

4. **Mobile Editing**:
   - Toolbar otomatis simplified di mobile
   - Touch-friendly interface
   - Responsive preview

---

**Status**: ✅ READY TO USE (Setelah API key dimasukkan)
**Date**: November 1, 2025
**Version**: TinyMCE 6.x (via CDN)
