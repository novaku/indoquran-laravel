# Panduan Implementasi Google AdSense Vertikal di IndoQuran

## 📋 Overview

Dokumentasi ini menjelaskan cara menggunakan komponen `AdSenseVertical` untuk menampilkan iklan Google AdSense vertikal di berbagai halaman IndoQuran.

## 🎯 Komponen AdSenseVertical

### Lokasi File
```
resources/js/react/components/AdSenseVertical.jsx
```

### Props yang Tersedia

| Prop | Type | Default | Deskripsi |
|------|------|---------|-----------|
| `adSlot` | string | `'9427110099'` | ID slot iklan dari Google AdSense |
| `adClient` | string | `'ca-pub-9994842285785390'` | Publisher ID Google AdSense |
| `adFormat` | string | `'autorelaxed'` | Format iklan (`'auto'`, `'autorelaxed'`, `'rectangle'`, dll) |
| `fullWidth` | boolean | `true` | Responsive full-width |
| `style` | object | `{}` | Custom CSS styles |
| `className` | string | `''` | Custom CSS classes |

### Contoh Penggunaan Dasar

```jsx
import AdSenseVertical from '../components/AdSenseVertical';

function MyPage() {
    return (
        <div>
            <AdSenseVertical 
                adSlot="9427110099"
                adFormat="autorelaxed"
                fullWidth={true}
            />
        </div>
    );
}
```

## 📐 Layout Patterns

### Pattern 1: Sidebar Layout (Recommended untuk Desktop)

Gunakan untuk halaman dengan konten utama di kiri dan sidebar di kanan.

```jsx
<div className="max-w-7xl mx-auto px-4 py-12">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content - 8 kolom */}
        <main className="lg:col-span-8">
            {/* Konten utama di sini */}
        </main>

        {/* Sidebar - 4 kolom */}
        <aside className="lg:col-span-4">
            <div className="sticky top-4 space-y-6">
                {/* Iklan Vertikal */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="text-xs text-center text-gray-400 py-2 border-b border-gray-100">
                        Iklan
                    </div>
                    <AdSenseVertical
                        adSlot="9427110099"
                        className="min-h-[600px]"
                    />
                </div>

                {/* Widget lain */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    {/* Informasi tambahan */}
                </div>
            </div>
        </aside>
    </div>
</div>
```

### Pattern 2: In-Content Placement

Untuk menempatkan iklan di antara konten.

```jsx
<div className="space-y-8">
    {/* Konten bagian 1 */}
    <div>...</div>

    {/* Iklan In-Content */}
    <div className="my-8">
        <div className="text-xs text-center text-gray-400 mb-2">
            Iklan
        </div>
        <AdSenseVertical
            adSlot="9427110099"
            adFormat="autorelaxed"
            className="min-h-[250px]"
        />
    </div>

    {/* Konten bagian 2 */}
    <div>...</div>
</div>
```

### Pattern 3: Multiple Ads in Sidebar

Untuk sidebar dengan beberapa unit iklan (hati-hati dengan ad density).

```jsx
<aside className="lg:col-span-4">
    <div className="sticky top-4 space-y-6">
        {/* Iklan #1 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="text-xs text-center text-gray-400 py-2 border-b">
                Iklan
            </div>
            <AdSenseVertical
                adSlot="9427110099"
                className="min-h-[600px]"
            />
        </div>

        {/* Widget atau konten */}
        <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold mb-3">Informasi</h3>
            {/* ... */}
        </div>

        {/* Iklan #2 (opsional) */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="text-xs text-center text-gray-400 py-2 border-b">
                Iklan
            </div>
            <AdSenseVertical
                adSlot="9427110099"
                className="min-h-[300px]"
            />
        </div>
    </div>
</aside>
```

## 🎨 Styling Best Practices

### Styling Container

```jsx
<div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
    <div className="text-xs text-center text-gray-400 py-2 border-b border-gray-100 bg-gray-50">
        Iklan
    </div>
    <AdSenseVertical
        adSlot="9427110099"
        className="min-h-[600px]"
    />
</div>
```

### Custom Styling dengan Props

```jsx
<AdSenseVertical
    adSlot="9427110099"
    style={{
        minHeight: '600px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px'
    }}
    className="my-custom-class"
/>
```

## 📱 Responsive Considerations

### Hide on Mobile (Recommended untuk Sidebar Ads)

```jsx
<aside className="hidden lg:block lg:col-span-4">
    {/* Iklan hanya tampil di desktop */}
    <AdSenseVertical />
</aside>
```

### Different Layouts for Mobile/Desktop

```jsx
{/* Mobile - In-content */}
<div className="lg:hidden my-6">
    <AdSenseVertical
        adFormat="autorelaxed"
        className="min-h-[250px]"
    />
</div>

{/* Desktop - Sidebar */}
<aside className="hidden lg:block lg:col-span-4">
    <AdSenseVertical
        adFormat="autorelaxed"
        className="min-h-[600px]"
    />
</aside>
```

## ⚠️ Google AdSense Policy Guidelines

### 1. Ad Density (Kepadatan Iklan)
- **Maximum:** 3 unit iklan per halaman untuk konten pendek
- **Recommended:** 1-2 unit iklan per layar viewport
- **Jangan:** Tempatkan terlalu banyak iklan yang mengalahkan konten

### 2. Ad Placement (Penempatan Iklan)
- ✅ **Allowed:** Sidebar, in-content (setelah beberapa paragraf), footer
- ❌ **Not Allowed:** Di atas fold tanpa konten, menghalangi navigasi, popup
- ⚠️ **Careful:** Jangan tempatkan terlalu dekat dengan elemen interaktif

### 3. User Experience
- Iklan harus diberi label "Iklan" atau "Advertisement"
- Jangan manipulasi user untuk klik iklan
- Jangan tempatkan iklan yang mengganggu pembacaan
- Pastikan konten tetap menjadi fokus utama

### 4. Content Requirements
- Konten harus original dan berkualitas
- Minimal 300 kata per halaman
- Konten harus informatif dan bernilai

## 🔧 Troubleshooting

### Iklan Tidak Muncul

1. **Check AdSense Script Loading**
```javascript
// Di browser console
console.log(window.adsbygoogle);
// Should not be undefined
```

2. **Check Ad Unit ID**
- Pastikan `adSlot` sesuai dengan yang di AdSense dashboard
- Format: `'9427110099'` (string, bukan number)

3. **Check Publisher ID**
- Pastikan `adClient` benar: `'ca-pub-9994842285785390'`

4. **Ads.txt File**
```bash
curl https://indoquran.web.id/ads.txt
# Should return: google.com, pub-9994842285785390, DIRECT, f08c47fec0942fa0
```

### Iklan Tampil Tapi Kosong

Ini normal dan bisa disebabkan oleh:
- Google masih menganalisa konten
- Tidak ada advertiser yang cocok
- User menggunakan Ad Blocker
- Testing di localhost (ads tidak muncul di development)

### Performance Issues

```jsx
// Use lazy loading untuk iklan di bawah fold
import { lazy, Suspense } from 'react';

const AdSenseVertical = lazy(() => import('../components/AdSenseVertical'));

function MyPage() {
    return (
        <Suspense fallback={<div className="h-[600px] bg-gray-100 animate-pulse" />}>
            <AdSenseVertical />
        </Suspense>
    );
}
```

## 📊 Monitoring & Optimization

### 1. Track Ad Performance
- Monitor di Google AdSense dashboard
- Check CTR (Click-Through Rate)
- Monitor RPM (Revenue Per Mille)
- Analyze user behavior dengan Google Analytics

### 2. A/B Testing Placements
- Test different ad positions
- Compare revenue between layouts
- Monitor user engagement metrics

### 3. Optimize for Mobile
- Use responsive ad units
- Test on different screen sizes
- Monitor mobile vs desktop performance

## 📝 Halaman yang Sudah Diintegrasikan

### ✅ QuranHomePage
- Sidebar layout dengan 2 unit iklan vertikal
- Sticky positioning untuk desktop
- Hidden pada mobile

### ⏳ Pending Integration
- SurahDetailPage (complex layout)
- JuzPage
- HalamanPage
- ArtikelPage
- TafsirMaudhuiPage

## 🚀 Next Steps

1. **Test di Production**
```bash
./deploy-production.sh
```

2. **Monitor AdSense Dashboard**
- Wait 24-48 hours untuk ads approval
- Check ad serving status
- Monitor earnings

3. **Optimize Based on Data**
- Review performance metrics
- Adjust ad placements
- Test different ad formats

## 📚 Resources

- [Google AdSense Help](https://support.google.com/adsense)
- [Ad Placement Policies](https://support.google.com/adsense/answer/1346295)
- [Better Ads Standards](https://www.betterads.org/standards/)
- [AdSense Program Policies](https://support.google.com/adsense/answer/48182)

---

**Last Updated:** November 8, 2025  
**Component Version:** 1.0.0  
**AdSense Publisher ID:** ca-pub-9994842285785390
