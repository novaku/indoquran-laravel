# Template Penambahan AdSense Sidebar ke Halaman

## 🎯 Quick Reference

Untuk menambahkan sidebar dengan iklan ke halaman yang sudah ada, ikuti template di bawah ini.

## 📋 Template Sidebar dengan Iklan

### 1. Import AdSenseVertical (✅ SUDAH DILAKUKAN)

Import sudah ditambahkan ke semua file berikut:
- ✅ ArticlesPage.jsx
- ✅ ArticleDetailPage.jsx  
- ✅ AsmaulHusnaPage.jsx
- ✅ TafsirMaudhuiPage.jsx
- ✅ QuranSearchPage.jsx
- ✅ AboutProjectPage.jsx
- ✅ PrivacyPage.jsx
- ✅ PrayerPage.jsx
- ✅ JuzIndexPage.jsx
- ✅ JuzPage.jsx
- ✅ SurahListPage.jsx
- ✅ SurahDetailPage.jsx (import only)
- ✅ QuranHomePage.jsx

### 2. Ubah Layout Menjadi Grid

**SEBELUM:**
```jsx
<PageContent size="xl">
    <Card>
        {/* Konten utama */}
    </Card>
</PageContent>
```

**SESUDAH:**
```jsx
<PageContent size="xl">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content - 8 kolom */}
        <div className="lg:col-span-8">
            <Card>
                {/* Konten utama */}
            </Card>
        </div>

        {/* Sidebar - 4 kolom */}
        <aside className="lg:col-span-4">
            <div className="sticky top-4 space-y-6">
                {/* Iklan Vertikal */}
                <Card padding="none">
                    <div className="text-xs text-center text-gray-400 py-2 border-b border-gray-100">
                        Iklan
                    </div>
                    <AdSenseVertical
                        adSlot="9427110099"
                        className="min-h-[600px]"
                    />
                </Card>

                {/* Info Box (Optional) */}
                <Card>
                    <h3 className="font-semibold text-gray-900 mb-3">Info</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        {/* Custom content */}
                    </div>
                </Card>
            </div>
        </aside>
    </div>
</PageContent>
```

### 3. Untuk Halaman Tanpa PageContent

**SEBELUM:**
```jsx
<div className="max-w-5xl mx-auto px-4 py-8">
    <div className="space-y-6">
        {/* Konten */}
    </div>
</div>
```

**SESUDAH:**
```jsx
<div className="max-w-7xl mx-auto px-4 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <main className="lg:col-span-8">
            <div className="space-y-6">
                {/* Konten */}
            </div>
        </main>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
            <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="text-xs text-center text-gray-400 py-2 border-b border-gray-100">
                        Iklan
                    </div>
                    <AdSenseVertical
                        adSlot="9427110099"
                        className="min-h-[600px]"
                    />
                </div>
            </div>
        </aside>
    </div>
</div>
```

## 📝 Halaman yang Sudah Diintegrasikan

### ✅ Fully Integrated (dengan sidebar)
1. **QuranHomePage.jsx** - Sidebar dengan 2 iklan + info box
2. **SurahListPage.jsx** - Sidebar dengan iklan + info Al-Quran

### 🔧 Import Added (perlu layout integration)
3. **JuzPage.jsx** - Import ✅ | Layout ⏳
4. **ArticlesPage.jsx** - Import ✅ | Layout ⏳
5. **ArticleDetailPage.jsx** - Import ✅ | Layout ⏳
6. **AsmaulHusnaPage.jsx** - Import ✅ | Layout ⏳
7. **TafsirMaudhuiPage.jsx** - Import ✅ | Layout ⏳
8. **QuranSearchPage.jsx** - Import ✅ | Layout ⏳
9. **AboutProjectPage.jsx** - Import ✅ | Layout ⏳
10. **PrivacyPage.jsx** - Import ✅ | Layout ⏳
11. **PrayerPage.jsx** - Import ✅ | Layout ⏳
12. **JuzIndexPage.jsx** - Import ✅ | Layout ⏳

## 🎨 Variasi Info Box untuk Sidebar

### Untuk Halaman Artikel
```jsx
<Card>
    <h3 className="font-semibold text-gray-900 mb-3">Artikel Terbaru</h3>
    <div className="space-y-2 text-sm">
        {/* List artikel */}
    </div>
</Card>
```

### Untuk Halaman Asmaul Husna
```jsx
<Card>
    <h3 className="font-semibold text-gray-900 mb-3">Tentang Asmaul Husna</h3>
    <div className="space-y-2 text-sm text-gray-600">
        <p>⭐ 99 Nama Allah SWT</p>
        <p>📖 Lengkap dengan arti</p>
        <p>🎧 Audio dalam bahasa Arab</p>
    </div>
</Card>
```

### Untuk Halaman Tafsir
```jsx
<Card>
    <h3 className="font-semibold text-gray-900 mb-3">Tafsir Tematik</h3>
    <div className="space-y-2 text-sm text-gray-600">
        <p>📚 Tafsir berdasarkan tema</p>
        <p>🔍 Mudah dipahami</p>
        <p>💡 Penjelasan lengkap</p>
    </div>
</Card>
```

## ⚡ Quick Implementation Checklist

Untuk setiap halaman:

- [ ] Import AdSenseVertical (DONE via script)
- [ ] Cari wrapper div/PageContent
- [ ] Ubah max-w dari `5xl` ke `7xl` (jika ada)
- [ ] Wrap content dalam grid 12 kolom
- [ ] Main content gunakan `lg:col-span-8`
- [ ] Tambahkan sidebar `lg:col-span-4`
- [ ] Add sticky positioning pada sidebar
- [ ] Add AdSenseVertical component
- [ ] (Optional) Add info box
- [ ] Test responsive di mobile dan desktop

## 🚀 Priority Order

Berdasarkan traffic dan importance:

1. ✅ **QuranHomePage** - DONE
2. ✅ **SurahListPage** - DONE  
3. ⏳ **SurahDetailPage** - Complex, needs careful integration
4. ⏳ **ArticleDetailPage** - High traffic potential
5. ⏳ **QuranSearchPage** - High engagement
6. ⏳ **ArticlesPage** - Medium traffic
7. ⏳ **AsmaulHusnaPage** - Popular feature
8. ⏳ **TafsirMaudhuiPage** - Educational content
9. ⏳ **JuzPage** - Reading feature
10. ⏳ **JuzIndexPage** - Navigation
11. ⏳ **PrayerPage** - Utility page
12. ⏳ **AboutProjectPage** - Info page
13. ⏳ **PrivacyPage** - Legal page

## 💡 Tips & Best Practices

### Mobile Experience
- Sidebar otomatis hidden di mobile dengan `lg:col-span-4`
- Konten tetap full-width di mobile
- User mobile tidak terganggu dengan iklan

### Performance
- `sticky top-4` untuk sidebar agar iklan tetap terlihat
- `min-h-[600px]` untuk iklan vertikal optimal
- Lazy loading sudah di-handle oleh AdSenseVertical component

### Ad Density
- 1-2 iklan per halaman (SAFE)
- Jangan lebih dari 3 unit per halaman
- Pastikan konten lebih dominan dari iklan

### Testing
```bash
# Run development server
./dev-env.sh

# Access pages:
# http://localhost:8000/surah
# http://localhost:8000/artikel
# http://localhost:8000/asmaul-husna
# etc.

# Note: Ads won't show in development
# Deploy to production to see actual ads
```

---

**Status:** Import added to all priority pages ✅  
**Next:** Manual layout integration for each page ⏳  
**ETA:** Can be done incrementally, high-priority pages first
