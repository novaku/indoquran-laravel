# Panduan Implementasi Google AdSense Vertikal di IndoQuran

## 📋 Ringkasan

Dokumentasi ini menjelaskan konfigurasi dan penggunaan komponen iklan vertikal/sidebar Google AdSense (`AdSenseVertical`) serta unit AMP di seluruh kode aplikasi IndoQuran. Format penempatan ini mengadopsi standar portal berita modern (**Detik.com**) dengan frame minimalis, label `"IKLAN"`, pencegahan pergeseran tata letak (Zero-CLS), dan dukungan mode gelap (*Dark Mode*).

---

## 🎯 Konfigurasi Iklan Vertikal Resmi

### 1. Snippet Standar Web (React SPA)

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9994842285785390"
     crossorigin="anonymous"></script>
<!-- iklan-vertikal -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-9994842285785390"
     data-ad-slot="9021708920"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

### 2. Snippet AMP (Accelerated Mobile Pages)

```html
<amp-ad width="100vw" height="320"
     type="adsense"
     data-ad-client="ca-pub-9994842285785390"
     data-ad-slot="9021708920"
     data-auto-format="rspv"
     data-full-width="">
  <div overflow=""></div>
</amp-ad>
```

---

## 🧩 Komponen `AdSenseVertical`

### Lokasi File
```
resources/js/react/components/AdSenseVertical.jsx
```

### Props yang Tersedia

| Prop | Type | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `adSlot` | `string` | `'9021708920'` | ID slot unit iklan vertikal dari Google AdSense |
| `adClient` | `string` | `'ca-pub-9994842285785390'` | Publisher ID Google AdSense |
| `adFormat` | `string` | `'auto'` | Format responsive iklan (`'auto'`, `'rectangle'`, dll) |
| `showLabel` | `boolean` | `true` | Menampilkan label penanda `"IKLAN"` |
| `labelText` | `string` | `'IKLAN'` | Teks label penanda unit iklan |
| `isSticky` | `boolean` | `false` | Menempel pada posisi sticky saat scroll di desktop |
| `minHeight` | `string` | `'250px'` | Tinggi minimum wadah iklan untuk Zero-CLS |
| `className` | `string` | `''` | Custom kelas CSS Tailwind tambahan |
| `style` | `object` | `{}` | Inline CSS styles tambahan |

---

## 📐 Contoh Penggunaan & Layout Patterns

### Pattern 1: Sidebar Sticky 2-Kolom (Standar Detik.com pada Desktop)

Digunakan pada halaman detail artikel ([ArticleDetailPage.jsx](file:///Users/novaherdi/Documents/GitHub/indoquran-laravel/resources/js/react/pages/ArticleDetailPage.jsx)), beranda ([QuranHomePage.jsx](file:///Users/novaherdi/Documents/GitHub/indoquran-laravel/resources/js/react/pages/QuranHomePage.jsx)), dan detail doa ([PrayerDetailPage.jsx](file:///Users/novaherdi/Documents/GitHub/indoquran-laravel/resources/js/react/pages/PrayerDetailPage.jsx)):

```jsx
import React from 'react';
import AdSenseVertical from '../components/AdSenseVertical';

function ArticlePageLayout() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                {/* Kolom Konten Utama (8 Kolom di Layar Besar) */}
                <main className="lg:col-span-8">
                    {/* Isi konten artikel atau ayat */}
                </main>

                {/* Kolom Sidebar (4 Kolom di Layar Besar) */}
                <aside className="lg:col-span-4 space-y-6">
                    <div className="sticky top-24 space-y-6">
                        {/* Unit Iklan Vertikal Sidebar */}
                        <AdSenseVertical 
                            adSlot="9021708920"
                            labelText="IKLAN"
                            minHeight="300px"
                            isSticky={false}
                        />

                        {/* Widget Rekomendasi / Baca Juga */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200/90 dark:border-gray-800 shadow-2xs">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">
                                Baca Juga
                            </h3>
                            {/* Daftar artikel terkait */}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
```

### Pattern 2: Template Blade AMP

Penerapan pada template AMP Laravel Blade ([resources/views/amp/surah.blade.php](file:///Users/novaherdi/Documents/GitHub/indoquran-laravel/resources/views/amp/surah.blade.php)):

```blade
<div class="ad-container" style="margin: 1.5rem 0; text-align: center; border-top: 1px solid #f3f4f6; border-bottom: 1px solid #f3f4f6; padding: 12px 0;">
    <div style="font-size: 9px; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px; letter-spacing: 1.5px; font-weight: bold;">
        IKLAN REKOMENDASI
    </div>
    <amp-ad width="100vw" height="320"
        type="adsense"
        data-ad-client="ca-pub-9994842285785390"
        data-ad-slot="9021708920"
        data-auto-format="rspv"
        data-full-width="">
        <div overflow=""></div>
    </amp-ad>
</div>
```

---

## 🎨 Best Practices & Kepatuhan Kebijakan

1. **Zero Cumulative Layout Shift (Zero-CLS)**:
   - Setiap container `AdSenseVertical` membungkus unit iklan dengan `min-height` tetap (misal `minHeight="280px"` atau `"300px"`) agar tidak terjadi pergeseran konten mendadak saat skrip AdSense selesai merender elemen iframe.
2. **SPA Safe Push Lifecycle**:
   - Komponen memeriksa `isPushedRef` dan atribut `data-adsbygoogle-status` sebelum memanggil `window.adsbygoogle.push({})` untuk mencegah kesalahan duplikasi push saat navigasi halaman SPA React.
3. **Pemberian Label Transparan**:
   - Menampilkan label `"IKLAN"` atau `"IKLAN REKOMENDASI"` dengan styling subtil di bagian atas unit frame.
4. **Dukungan Dark Mode**:
   - Frame otomatis menyesuaikan warna latar (`bg-white` ke `dark:bg-gray-900`) dan border (`border-gray-200/80` ke `dark:border-gray-800`).

---

## 📌 Status Integrasi di IndoQuran

- ✅ **QuranHomePage.jsx**: Sidebar utama beranda (`adSlot="9021708920"`).
- ✅ **ArticleDetailPage.jsx**: Sidebar sticky detail artikel (`adSlot="9021708920"`).
- ✅ **PrayerDetailPage.jsx**: Sidebar detail doa bersama (`adSlot="9021708920"`).
- ✅ **resources/views/amp/surah.blade.php**: In-between ayat dan bottom ad unit (`data-ad-slot="9021708920"`).

---

**Terakhir Diperbarui:** 30 Agustus 2026  
**Versi Komponen:** 2.21.0  
**Slot ID Vertikal:** `9021708920`  
**Publisher ID:** `ca-pub-9994842285785390`
