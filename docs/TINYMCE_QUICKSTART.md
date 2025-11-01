# 🎯 Quick Start Guide - TinyMCE Editor

## ✅ Status Instalasi
- [x] Package TinyMCE terinstal
- [x] Component TinyMCE dibuat
- [x] Admin Article Editor diupdate
- [x] Build berhasil
- [ ] **API Key belum dimasukkan** ⚠️

## 🚀 Cara Menggunakan (3 Langkah Mudah)

### Langkah 1: Daftar di TinyMCE Cloud (GRATIS) ☁️

1. Buka: **https://www.tiny.cloud/auth/signup/**
2. Isi form registrasi dengan email Anda
3. Verifikasi email yang masuk
4. Login ke akun Anda

⏱️ Waktu: ~2 menit

---

### Langkah 2: Dapatkan API Key 🔑

1. Setelah login, buka: **https://www.tiny.cloud/my-account/dashboard/**
2. Klik menu **"API Key Management"** di sidebar
3. Copy API key Anda (format: `xxxxx-xxxxx-xxxxx-xxxxx-xxxxx`)

**Contoh API key:**
```
7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p
```

⏱️ Waktu: ~1 menit

---

### Langkah 3: Masukkan API Key ke Aplikasi 💻

1. Buka file: 
   ```
   resources/js/react/config/tinymce.config.js
   ```

2. Cari baris ini:
   ```javascript
   apiKey: 'your-api-key-here',
   ```

3. Ganti dengan API key Anda:
   ```javascript
   apiKey: '7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p',  // Ganti dengan API key Anda
   ```

4. Save file (Ctrl+S atau Cmd+S)

5. Rebuild aplikasi:
   ```bash
   npm run build
   # atau untuk development:
   npm run dev
   ```

⏱️ Waktu: ~1 menit + build time

---

## 🎉 Selesai! Editor Siap Digunakan

Setelah 3 langkah di atas, Anda bisa:
1. Login ke admin panel: `http://localhost:8000/admin`
2. Buat atau edit artikel
3. Nikmati editor TinyMCE yang powerful! 🚀

---

## 🌟 Fitur yang Bisa Anda Gunakan

### Text Formatting
- **Bold** (Ctrl+B)
- *Italic* (Ctrl+I)
- <u>Underline</u> (Ctrl+U)
- ~~Strikethrough~~
- Text colors & highlights

### Structure
- # Headings (H1-H6)
- Lists (ordered/unordered)
- Blockquotes
- Horizontal lines
- Text alignment

### Media
- 📷 **Image upload** (drag & drop supported!)
- 🔗 Links
- 📺 Video embed (YouTube, Vimeo)
- 📊 Tables

### Advanced
- 💾 Auto-save (every 30s)
- 🔍 Search & replace
- 📱 Mobile responsive
- 🌍 Bahasa Indonesia interface
- 🎨 Code syntax highlighting
- 😀 Emoticons
- 📝 Word count
- 👁️ Preview mode
- 🖥️ Fullscreen mode

---

## 💡 Tips Penggunaan

### Upload Gambar (3 Cara)
1. **Drag & Drop**: Seret gambar dari file explorer ke editor
2. **Paste**: Copy gambar (Ctrl+C) dan paste (Ctrl+V) di editor
3. **Button**: Klik icon 🖼️ di toolbar

### Keyboard Shortcuts
```
Ctrl+B     = Bold
Ctrl+I     = Italic
Ctrl+U     = Underline
Ctrl+K     = Insert link
Ctrl+Z     = Undo
Ctrl+Y     = Redo
Ctrl+C     = Copy
Ctrl+V     = Paste
Ctrl+X     = Cut
F11        = Fullscreen
```

### Auto-save
- Editor auto-save setiap 30 detik
- Data tersimpan di browser (localStorage)
- Jika browser crash, data bisa di-restore

### Mobile Editing
- Toolbar otomatis simplified di mobile
- Touch-friendly interface
- Semua fitur penting tetap tersedia

---

## ❓ FAQ

### Q: Apakah TinyMCE gratis?
**A:** Ya! Free tier TinyMCE cukup untuk kebanyakan project. Premium features optional.

### Q: Apakah harus selalu online?
**A:** TinyMCE loaded dari CDN, jadi perlu internet untuk pertama kali. Tapi ada opsi self-hosted jika mau offline.

### Q: Apakah data aman?
**A:** Ya, data artikel tersimpan di database Laravel Anda. TinyMCE hanya editor di frontend.

### Q: Bisa pakai bahasa lain?
**A:** Bisa! Edit file `tinymce.config.js`, ubah `language: 'id_ID'` ke `language: 'en'` untuk English.

### Q: Ukuran maksimal upload gambar?
**A:** Default 2MB. Bisa diubah di `tinymce.config.js` dan Laravel config.

### Q: TipTap masih bisa dipakai?
**A:** Ya! TipTap component masih ada. Tinggal ganti import di `AdminArticleEditorPage.jsx`.

---

## 🐛 Troubleshooting

### Problem: "This domain is not registered"
✅ **Solusi**: Pastikan API key sudah diisi dengan benar

### Problem: Editor tidak muncul
✅ **Solusi**: 
```bash
npm run build
# Clear browser cache: Ctrl+Shift+R
```

### Problem: Upload gambar gagal
✅ **Solusi**:
```bash
php artisan storage:link
php artisan cache:clear
```

### Problem: Build error
✅ **Solusi**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📞 Bantuan Lebih Lanjut

- **Dokumentasi lengkap**: Baca file `TINYMCE_SETUP.md`
- **Migration info**: Baca file `TINYMCE_MIGRATION.md`
- **TinyMCE Docs**: https://www.tiny.cloud/docs/
- **Support**: support@tiny.cloud (untuk TinyMCE issues)

---

## 🎯 Checklist

Sebelum mulai menggunakan, pastikan:
- [ ] Sudah daftar akun TinyMCE
- [ ] Sudah dapat API key
- [ ] Sudah masukkan API key ke `tinymce.config.js`
- [ ] Sudah run `npm run build`
- [ ] Sudah clear browser cache
- [ ] Sudah test di browser

**Total waktu setup: ~5 menit** ⏱️

---

**Happy editing! 🎉**
