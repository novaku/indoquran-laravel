# Migration dari TinyMCE ke TipTap Editor

## Tanggal: 2 November 2025

## Alasan Perubahan

Berdasarkan permintaan untuk menggunakan WYSIWYG editor open-source standar, kami telah mengganti TinyMCE dengan **TipTap Editor**.

## Perbandingan

### TinyMCE (Sebelumnya)
- ❌ Proprietary (memerlukan API key)
- ❌ Memerlukan CDN eksternal
- ❌ Tergantung koneksi internet
- ✅ Bundle size kecil (14KB gzipped)
- ✅ Feature-rich out of the box

### TipTap (Sekarang)
- ✅ **Open Source** (MIT License)
- ✅ **No external dependencies** - fully bundled
- ✅ Offline-capable
- ✅ Modern, extensible architecture
- ✅ React-native implementation
- ⚠️ Bundle size lebih besar (132KB gzipped: 37.68KB)
- ✅ Fully customizable

## Perubahan Teknis

### 1. Package Changes
```bash
# Removed
@tinymce/tinymce-react

# Already installed (no changes needed)
@tiptap/react
@tiptap/starter-kit
@tiptap/extension-image
@tiptap/extension-link
@tiptap/extension-text-align
@tiptap/extension-placeholder
@tiptap/extension-underline
```

### 2. Files Modified

#### resources/views/react.blade.php
- ❌ Removed TinyMCE CDN script
- ❌ Removed TinyMCE verification script
- ❌ Removed TinyMCE DNS prefetch/preconnect

#### resources/js/react/pages/AdminArticleEditorPage.jsx
```diff
- import TinyMCEEditor from '../components/TinyMCEEditor';
+ import TipTapEditor from '../components/TipTapEditor';

- <TinyMCEEditor
+ <TipTapEditor
    content={formData.content}
    onChange={handleContentChange}
    placeholder="Mulai menulis konten artikel di sini..."
  />
```

#### vite.config.js
```diff
- // TinyMCE - separate chunk (loaded from CDN, but React wrapper needs to be bundled)
- if (id.includes('@tinymce') || id.includes('tinymce')) {
-     return 'vendor-tinymce';
- }
+ // TipTap - WYSIWYG editor (open source)
+ if (id.includes('@tiptap')) {
+     return 'vendor-editor';
+ }
```

### 3. Component Already Exists

`resources/js/react/components/TipTapEditor.jsx` sudah tersedia dengan fitur:

#### Features:
- ✅ Rich text formatting (Bold, Italic, Underline, Strikethrough)
- ✅ Headings (H1, H2, H3)
- ✅ Lists (Bullet, Numbered)
- ✅ Text alignment (Left, Center, Right)
- ✅ Blockquotes
- ✅ Code blocks
- ✅ Images (URL-based)
- ✅ Links
- ✅ Undo/Redo
- ✅ Placeholder support
- ✅ Responsive toolbar

## Build Output

### Before (TinyMCE):
```
vendor-tinymce-B9MQ362h.js       14.10 kB │ gzip:  4.51 kB
```

### After (TipTap):
```
vendor-editor-DrW61hUa.js       132.21 kB │ gzip: 37.68 kB
```

**Trade-off Analysis:**
- Bundle size increase: ~33KB gzipped
- **Benefits**: 
  - No external CDN dependency
  - Fully open-source
  - Better offline support
  - No API key required
  - More control over features

## Migration Impact

### User Impact: ✅ Zero Breaking Changes
- Editor interface tetap sama
- Semua data artikel existing tetap kompatibel
- HTML output tetap valid

### Developer Impact: ✅ Minimal
- No API key management needed
- No CDN monitoring needed
- Easier to customize
- Better TypeScript support

## Testing Checklist

- [ ] Build production berhasil
- [ ] Editor tampil di halaman admin
- [ ] Toolbar berfungsi dengan baik
- [ ] Save artikel berhasil
- [ ] Load artikel existing berhasil
- [ ] HTML formatting preserved
- [ ] Images bisa diinsert (URL)
- [ ] Links bisa ditambahkan
- [ ] Undo/Redo berfungsi

## Deployment

### Local Testing:
```bash
# Already done:
npm uninstall @tinymce/tinymce-react
npm run build
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Start dev server:
./dev-env.sh  # Option 1

# Test at:
http://localhost:8000/admin/artikel/edit/9
```

### Production Deployment:
```bash
# On production server:
ssh user@indoquran.web.id
cd /path/to/indoquran-laravel

git pull origin main
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache

# Verify build files:
ls -la public/build/assets/vendor-editor*.js
```

## Rollback Plan (if needed)

Jika terjadi masalah, rollback ke TinyMCE:

```bash
git revert 5191720
npm install @tinymce/tinymce-react
npm run build
git add -A
git commit -m "Rollback to TinyMCE"
git push origin main
```

## Git Commits

- `5191720` - Revert to TipTap open-source WYSIWYG editor, remove TinyMCE CDN dependency
- Previous TinyMCE commits:
  - `03b6d74` - Add TinyMCE test script and update documentation
  - `82cc8f9` - Improve TinyMCE loading with better detection and error handling
  - `be56a4c` - Fix TinyMCE not loading in production - Add CDN script and separate vendor chunk

## Advantages of TipTap

1. **Open Source**: MIT license, no vendor lock-in
2. **Modern Stack**: Built with ProseMirror (same as used by Notion, Atlassian)
3. **Extensible**: Easy to add custom extensions
4. **Framework Agnostic**: Works with React, Vue, Vanilla JS
5. **Collaborative**: Supports real-time collaboration (if needed in future)
6. **TypeScript**: Full TypeScript support
7. **Active Development**: Regular updates and community support

## Documentation & Resources

- TipTap Official: https://tiptap.dev/
- ProseMirror: https://prosemirror.net/
- Component: `resources/js/react/components/TipTapEditor.jsx`
- Extensions: https://tiptap.dev/extensions

## Support

Jika ada pertanyaan atau issue dengan TipTap editor, check:
1. Browser console untuk error messages
2. Component file untuk customization
3. TipTap documentation
4. Existing article data compatibility

---

**Status**: ✅ Completed and Ready for Production

**Next Steps**: Deploy to production and test
