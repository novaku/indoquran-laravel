# Fix: "Crawled - currently not indexed" (Di-crawl - saat ini tidak diindeks)

## Problem Description

Google Search Console menunjukkan ~4,500 halaman dengan status "Crawled - currently not indexed". URL yang terkena dampak terutama adalah:

- `/surah/X/Y` - Halaman ayat individual (contoh: `/surah/8/58`, `/surah/17/38`)
- `/statistik` - Halaman statistik

**Referensi Google:** https://support.google.com/webmasters/answer/7440203

## Root Cause Analysis

### Masalah Utama:

1. **Duplicate/Thin Content**: Halaman ayat individual (`/surah/X/Y`) memiliki struktur yang sangat mirip dengan halaman surah parent (`/surah/X`). Google menganggap ini sebagai konten duplikat atau tipis.

2. **Canonical URL tidak tepat**: Setiap halaman ayat memiliki canonical ke dirinya sendiri, padahal seharusnya meng-canonical ke halaman surah parent untuk konsolidasi sinyal ranking.

3. **Kurangnya Konten Unik**: Halaman ayat tidak memiliki cukup konten unik (structured data spesifik, meta description dengan konten ayat, dll).

4. **Missing Structured Data**: Tidak ada Quote schema atau structured data khusus untuk representasi konten ayat.

## Solution Implementation

### 1. Canonical URL Strategy (Critical Fix)

**Sebelum:**
```
/surah/8/58 → canonical: /surah/8/58 (self-canonical)
```

**Sesudah:**
```
/surah/8/58 → canonical: /surah/8#ayat-58 (canonical ke parent dengan fragment)
```

Ini mengkonsolidasikan semua sinyal ranking ke halaman surah parent, menghindari dilusi.

### 2. SEO Function Baru: `generateAyahSEOData()`

Lokasi: `resources/js/react/utils/seoUtils.js`

```javascript
export const generateAyahSEOData = (surah, ayahNumber, currentAyah = null) => {
  // Canonical ke parent surah
  const canonicalUrl = `https://indoquran.web.id/surah/${surahNumber}#ayat-${ayahNumber}`;
  
  // Title unik dengan konten ayat
  const title = `${surahName} Ayat ${ayahNumber} - Terjemahan, Tafsir & Audio | IndoQuran`;
  
  // Description dengan preview terjemahan
  const description = `"${translationPreview}" - Baca ${surahName} ayat ${ayahNumber}...`;
  
  // Structured data: Quote, Article, BreadcrumbList, AudioObject
  return { title, description, canonicalUrl, structuredData, ... };
};
```

### 3. Conditional SEO di SurahDetailPage

Lokasi: `resources/js/react/pages/SurahDetailPage.jsx`

```jsx
{ayahNumber ? (
  // SEO untuk halaman ayat individual - canonical ke parent surah
  <SEOHead {...generateAyahSEOData(surah, currentAyahNumber, currentAyah)} />
) : (
  // SEO untuk halaman surah lengkap - SEO standar
  <SEOHead {...getPageSEOData('surah', surah)} />
)}
```

### 4. Structured Data Khusus Ayat

Untuk halaman ayat, kita menambahkan:

- **Quotation Schema**: Representasi ayat sebagai kutipan dari Al-Quran
- **Article Schema**: Dengan `isPartOf` yang menunjuk ke surah parent
- **BreadcrumbList**: 4 level navigasi (Beranda → Surah → Surah X → Ayat Y)
- **AudioObject**: Link ke audio murottal per ayat

### 5. Halaman Statistik

Ditambahkan SEO yang lebih baik dengan:
- Canonical URL yang tepat
- Structured data (WebPage, DataCatalog, BreadcrumbList)
- Meta description yang lebih deskriptif

## Files Modified

1. **`resources/js/react/utils/seoUtils.js`**
   - Added `generateAyahSEOData()` function
   - Added case 'statistik' in `getPageSEOData()`

2. **`resources/js/react/pages/SurahDetailPage.jsx`**
   - Updated import to include `generateAyahSEOData`
   - Added conditional SEO rendering based on `ayahNumber`

3. **`resources/js/react/pages/StatistikPage.jsx`**
   - Updated to use `getPageSEOData('statistik')`
   - Added structured data

## Expected Results

Setelah Google melakukan re-crawl (2-4 minggu):

1. **Halaman ayat individual** akan dikonsolidasikan ke halaman surah parent
2. **Sinyal ranking** akan terfokus pada halaman surah utama
3. **Crawl budget** lebih efisien karena Google tidak perlu mengindex ribuan halaman ayat terpisah
4. **Halaman statistik** akan terindex dengan metadata yang lebih baik

## Monitoring

1. **Google Search Console** → Coverage → "Crawled - currently not indexed"
   - Monitor penurunan jumlah URL terkena dampak

2. **URL Inspection Tool**
   - Test URL individual seperti `/surah/8/58` untuk melihat canonical yang terdeteksi

3. **Rich Results Test**
   - Verify structured data (Quote, BreadcrumbList) terparse dengan benar

## Timeline

- **Week 1-2**: Google re-crawl halaman yang diupdate
- **Week 2-4**: Penurunan signifikan pada "Crawled - not indexed" count
- **Week 4+**: Stabilisasi dengan sebagian besar halaman ayat dikonsolidasikan

## Alternative Approaches (Not Implemented)

1. **noindex pada halaman ayat**: Tidak dipilih karena tetap ingin halaman bisa diakses langsung dari share link
2. **Redirect 301 ke surah parent**: Tidak dipilih karena menghilangkan kemampuan deep linking ke ayat spesifik
3. **Pagination dengan rel="prev/next"**: Tidak sesuai karena ini bukan konten paginated

## References

- [Google: Crawled - currently not indexed](https://support.google.com/webmasters/answer/7440203)
- [Google: Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/canonicalization)
- [Schema.org: Quotation](https://schema.org/Quotation)
- [Google: Duplicate Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content/duplicate-content)

---

**Date:** December 23, 2025  
**Version:** 2.12.0  
**Author:** IndoQuran Development Team
