# TinyMCE Integration Guide

## Mendapatkan API Key TinyMCE

TinyMCE Editor sekarang digunakan untuk editor artikel di halaman admin. Untuk menggunakan TinyMCE dengan semua fitur premium, Anda perlu mendapatkan API key gratis dari TinyMCE.

### Langkah-langkah:

1. **Daftar Akun TinyMCE** (GRATIS)
   - Kunjungi: https://www.tiny.cloud/auth/signup/
   - Daftar menggunakan email Anda
   - Verifikasi email Anda

2. **Dapatkan API Key**
   - Login ke dashboard: https://www.tiny.cloud/my-account/dashboard/
   - Buka menu "API Key Management"
   - Copy API key Anda (format: `xxxxx-xxxxx-xxxxx-xxxxx-xxxxx`)

3. **Masukkan API Key**
   - Buka file: `resources/js/react/components/TinyMCEEditor.jsx`
   - Cari baris: `apiKey="your-api-key-here"`
   - Ganti dengan API key Anda: `apiKey="xxxxx-xxxxx-xxxxx-xxxxx-xxxxx"`

### Alternatif: Self-Hosted (Tanpa API Key)

Jika Anda ingin menggunakan TinyMCE tanpa registrasi:

1. Download TinyMCE:
   ```bash
   npm install tinymce
   ```

2. Update `TinyMCEEditor.jsx`:
   ```javascript
   // Import TinyMCE
   import tinymce from 'tinymce/tinymce';
   import 'tinymce/themes/silver';
   import 'tinymce/icons/default';
   
   // Import plugins
   import 'tinymce/plugins/advlist';
   import 'tinymce/plugins/autolink';
   // ... import plugin lainnya
   ```

3. Hapus atau komentari baris `apiKey`:
   ```javascript
   <Editor
     // apiKey="your-api-key-here" // Hapus atau komentari baris ini
     ...
   />
   ```

### Fitur TinyMCE yang Tersedia

- ✅ Rich text formatting (bold, italic, underline, strikethrough)
- ✅ Headings (H1-H6)
- ✅ Lists (ordered & unordered)
- ✅ Text alignment
- ✅ Links & media embedding
- ✅ Image upload dengan drag & drop
- ✅ Tables
- ✅ Code blocks dengan syntax highlighting
- ✅ Emoticons
- ✅ Character & word count
- ✅ Search & replace
- ✅ Fullscreen mode
- ✅ Preview
- ✅ Auto-save (setiap 30 detik)
- ✅ Mobile responsive

### Bahasa Indonesia

TinyMCE sudah dikonfigurasi untuk menggunakan bahasa Indonesia. Jika ingin mengubah ke bahasa lain, edit file `TinyMCEEditor.jsx`:

```javascript
init={{
  language: 'en', // Ubah dari 'id_ID' ke 'en' untuk English
  ...
}}
```

### Upload Gambar

Upload gambar sudah terintegrasi dengan endpoint Laravel:
- Endpoint: `/api/admin/articles/upload-image`
- Max size: 2MB
- Format: JPG, PNG, WebP
- Auto CSRF token handling

### Troubleshooting

**Problem: "This domain is not registered with TinyMCE Cloud"**
- Solusi: Pastikan API key sudah dimasukkan dengan benar

**Problem: Editor tidak muncul**
- Check console browser untuk error
- Pastikan npm packages sudah terinstall: `npm install`
- Clear cache: `npm run build`

**Problem: Upload gambar gagal**
- Check CSRF token
- Check endpoint `/api/admin/articles/upload-image` berfungsi
- Check storage permissions: `php artisan storage:link`

### Update dari TipTap ke TinyMCE

Perubahan yang dilakukan:
1. ✅ Install package: `@tinymce/tinymce-react`
2. ✅ Buat component baru: `TinyMCEEditor.jsx`
3. ✅ Update `AdminArticleEditorPage.jsx` untuk menggunakan TinyMCE
4. ⚠️ TipTap packages masih ada di `package.json` (bisa dihapus jika tidak digunakan)

### Menghapus TipTap (Opsional)

Jika Anda yakin tidak akan menggunakan TipTap lagi:

```bash
npm uninstall @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-text-align @tiptap/extension-underline @tiptap/extension-placeholder
```

Hapus file: `resources/js/react/components/TipTapEditor.jsx`

---

**Dokumentasi lengkap TinyMCE:** https://www.tiny.cloud/docs/
**React integration:** https://www.tiny.cloud/docs/tinymce/latest/react-ref/
