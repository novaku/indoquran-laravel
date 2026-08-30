# Template Integrasi Google AdSense IndoQuran (Standar Detik.com)

## 🎯 Ringkasan

Dokumentasi ini adalah template acuan baku untuk penempatan periklanan Google AdSense di platform IndoQuran yang mengadopsi standar portal berita modern (**Detik.com**).

---

## 📦 Komponen AdSense yang Tersedia

| Komponen | Kegunaan & Tipe | Default Slot | Deskripsi |
| :--- | :--- | :--- | :--- |
| `AdSenseLeaderboard.jsx` | **Top Billboard** | `1519827772` | Banner horizontal atas (Zero-CLS, min-h 90px, label `"IKLAN"`). |
| `AdSenseVertical.jsx` | **Sticky Sidebar** | `9021708920` | Skyscraper / medium rectangle di sidebar desktop. |
| `AdSenseInline.jsx` | **In-Article / In-Content** | `1519827772` | Sisipan iklan di tengah alur teks atau paragraf artikel. |
| `AdSenseInFeed.jsx` | **In-Feed Card Grid** | `1519827772` | Unit iklan menyerupai kartu katalog di sela grid item. |
| `AdSenseHorizontal.jsx` | **Break Banner** | `1519827772` | Banner pemisah konten responsif di tengah atau bawah. |

---

## 📋 Pola Integrasi & Template Kode

### 1. Template Top Billboard (`AdSenseLeaderboard`)

Letakkan tepat di atas konten utama atau setelah header halaman:

```jsx
import AdSenseLeaderboard from '../components/AdSenseLeaderboard';

function MyPage() {
    return (
        <div>
            {/* Top Billboard Ad (Detik.com Pattern) */}
            <AdSenseLeaderboard 
                maxWidth="max-w-7xl"
                labelText="IKLAN"
            />

            {/* Konten Halaman */}
        </div>
    );
}
```

---

### 2. Template Layout 2-Kolom dengan Sticky Sidebar (`AdSenseVertical`)

Gunakan untuk halaman berbasis artikel atau halaman berfitur yang memiliki kolom sidebar (8 kolom konten : 4 kolom sidebar):

```jsx
import AdSenseVertical from '../components/AdSenseVertical';

function ContentWithSidebarPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                
                {/* Kolom Konten Utama (8 Kolom) */}
                <main className="lg:col-span-8">
                    {/* Konten utama */}
                </main>

                {/* Kolom Sidebar (4 Kolom) */}
                <aside className="lg:col-span-4 space-y-6">
                    <div className="sticky top-24 space-y-6">
                        {/* Unit Iklan Vertikal Sidebar */}
                        <AdSenseVertical 
                            adSlot="9021708920"
                            labelText="IKLAN"
                            minHeight="300px"
                            isSticky={false}
                        />

                        {/* Widget Rekomendasi / Informasi */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200/90 dark:border-gray-800 shadow-2xs">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">
                                Info Tambahan
                            </h3>
                            {/* Isi widget */}
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    );
}
```

---

### 3. Template In-Feed Native Ads pada Card Grid (`AdSenseInFeed`)

Gunakan di dalam perulangan daftar grid kartu katalog (misal di sela item ke-6):

```jsx
import React from 'react';
import AdSenseInFeed from '../components/AdSenseInFeed';

function ItemGridPage({ items }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, index) => (
                <React.Fragment key={item.id}>
                    {/* Sisipan Iklan In-Feed di Posisi Tertentu */}
                    {index === 5 && (
                        <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 my-2">
                            <AdSenseInFeed 
                                adSlot="1519827772"
                                labelText="IKLAN REKOMENDASI"
                                minHeight="140px"
                            />
                        </div>
                    )}

                    {/* Kartu Item Biasa */}
                    <div className="p-4 rounded-xl bg-white border">
                        {item.title}
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
}
```

---

### 4. Template In-Article Sisipan Konten (`AdSenseInline`)

Gunakan untuk menyisipkan iklan di tengah alur alinea artikel:

```jsx
import AdSenseInline from '../components/AdSenseInline';

function ArticleContent({ htmlContent }) {
    const paragraphs = htmlContent.split('</p>');
    
    if (paragraphs.length <= 2) {
        return (
            <div className="space-y-6">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                <AdSenseInline labelText="IKLAN" />
            </div>
        );
    }

    const firstHalf = paragraphs.slice(0, 2).join('</p>') + (paragraphs[1] ? '</p>' : '');
    const secondHalf = paragraphs.slice(2).join('</p>');

    return (
        <div className="space-y-6">
            <div dangerouslySetInnerHTML={{ __html: firstHalf }} />
            <AdSenseInline labelText="IKLAN" />
            <div dangerouslySetInnerHTML={{ __html: secondHalf }} />
        </div>
    );
}
```

---

## 📊 Status Integrasi di Seluruh Halaman (100% Selesai)

| Halaman | Billboard Top | In-Feed / In-Article | Sticky Sidebar | Break Banner |
| :--- | :---: | :---: | :---: | :---: |
| **Beranda** (`QuranHomePage.jsx`) | ✅ | — | ✅ (`9021708920`) | ✅ |
| **Detail Artikel** (`ArticleDetailPage.jsx`) | ✅ | ✅ (`AdSenseInline`) | ✅ (`9021708920`) | ✅ |
| **Daftar Artikel** (`ArticlesPage.jsx`) | ✅ | ✅ (`AdSenseInFeed`) | — | — |
| **Detail Surah** (`SurahDetailPage.jsx`) | ✅ | ✅ (`AdSenseInline`) | — | ✅ |
| **Daftar Surah** (`SurahListPage.jsx`) | ✅ | ✅ (`AdSenseInFeed`) | — | — |
| **Detail Halaman Mushaf** (`PageDetailPage.jsx`) | ✅ | — | — | ✅ |
| **Daftar Halaman Mushaf** (`PageListPage.jsx`) | ✅ | — | — | — |
| **Juz Player** (`JuzPage.jsx`) | ✅ | — | — | ✅ |
| **Indeks 30 Juz** (`JuzIndexPage.jsx`) | ✅ | ✅ (`AdSenseInFeed`) | — | — |
| **Tafsir Tematik** (`TafsirMaudhuiPage.jsx`) | ✅ | — | — | ✅ |
| **Doa Bersama** (`PrayerPage.jsx`) | ✅ | ✅ (`AdSenseInline`) | — | — |
| **Detail Doa** (`PrayerDetailPage.jsx`) | ✅ | ✅ (`AdSenseInline`) | ✅ (`9021708920`) | — |
| **Asmaul Husna** (`AsmaulHusnaPage.jsx`) | ✅ | ✅ (`AdSenseInFeed`) | — | — |
| **Pencarian Al-Quran** (`QuranSearchPage.jsx`) | ✅ | ✅ (`AdSenseInFeed`) | — | — |
| **Riwayat Versi** (`RiwayatVersiPage.jsx`) | ✅ | ✅ (`AdSenseInline`) | — | — |
| **Statistik Komunitas** (`StatistikPage.jsx`) | ✅ | — | — | — |
| **Tentang Proyek** (`AboutProjectPage.jsx`) | ✅ | — | — | ✅ |
| **Kebijakan Privasi** (`PrivacyPage.jsx`) | ✅ | — | — | — |
| **Hubungi Kami** (`ContactSupportPage.jsx`) | ✅ | — | — | — |
| **Donasi & Infaq** (`DonationSupportPage.jsx`) | ✅ | — | — | — |
| **Keuntungan Member** (`MemberBenefitsPage.jsx`) | ✅ | — | — | — |
| **Penanda / Bookmark** (`UserBookmarksPage.jsx`) | ✅ | — | — | — |
| **SEO Landing Page** (`SEOLandingPage.jsx`) | ✅ | — | — | — |
| **AMP Surah** (`surah.blade.php`) | ✅ | ✅ (`9021708920`) | — | ✅ (`9021708920`) |

---

## ⚡ Panduan Kepatuhan & Performa

1. **Zero-CLS**: Seluruh unit iklan memiliki reserved `minHeight` (`min-h-[90px]`, `min-h-[250px]`, `min-h-[280px]`) sehingga layout tidak bergeser saat iklan dimuat secara asinkron.
2. **Kepatuhan Kebijakan**: Halaman login, register, ganti password, dashboard admin, dan halaman 404 **dilarang dipasangi iklan**.
3. **Pemberian Label Transparan**: Semua unit menampilkan teks `"IKLAN"` atau `"IKLAN REKOMENDASI"`.
