# SEO Utils Documentation

## Overview
Comprehensive SEO utility functions for IndoQuran platform to improve search engine optimization and visibility.

## Features

### 1. Sitemap Generation
- **generateSitemap()** - Basic XML sitemap
- **generateEnhancedSitemap()** - Advanced sitemap with images
- **generateNewsSitemap()** - News-specific sitemap for time-sensitive content

### 2. Meta Tags & Social Media
- **generateOpenGraphTags()** - Facebook Open Graph tags
- **generateTwitterCardTags()** - Twitter Card meta tags
- **getPageSEOData()** - Complete SEO data for any page type

### 3. Structured Data (JSON-LD)
- **generateStructuredData()** - Rich snippets for search engines
- **generateBreadcrumbStructuredData()** - Breadcrumb navigation
- **generateFAQStructuredData()** - FAQ schema markup

### 4. Content Optimization
- **generateOptimalTitle()** - SEO-friendly titles with length optimization
- **generateOptimalMetaDescription()** - Meta descriptions with optimal length
- **cleanKeywords()** - Keyword validation and cleaning

### 5. Technical SEO
- **generateRobotsTxt()** - Search engine crawling instructions
- **generateCanonicalUrl()** - Canonical URL generation
- **generateHreflangTags()** - International SEO tags
- **generateSecurityHeaders()** - Security headers for SEO
- **shouldIndexPage()** - Page indexing logic

### 6. Performance
- **preloadCriticalResources()** - Critical resource preloading

## Supported Page Types

1. **home** - Homepage (`/`)
2. **surah** - Individual Surah pages (`/surah/:number`)
3. **search** - Search results (`/cari`)
4. **doa-bersama** - Prayer together feature (`/doa-bersama`)
5. **tafsir-maudhui** - Thematic tafsir (`/tafsir-maudhui`)
6. **about** - About page (`/tentang`)
7. **contact** - Contact page (`/kontak`)
8. **donation** - Donation page (`/donasi`)
9. **privacy** - Privacy policy (`/kebijakan`)
10. **bookmarks** - User bookmarks (`/penanda` - protected)

## Supported Routes and Pages

### Static Pages
- `/` - Homepage
- `/cari` - Search page  
- `/surah` - Surah list page
- `/juz` - Juz list page
- `/halaman` - Page list page
- `/doa-bersama` - Prayer together page
- `/tafsir-maudhui` - Thematic commentary page
- `/tentang` - About page
- `/kontak` - Contact page
- `/donasi` - Donation page
- `/kebijakan` - Privacy policy page
- `/riwayat-versi` - Version history page (Indonesian)

### Dynamic Pages
- `/surah/{number}` - Individual surah pages (1-114)
- `/surah/{number}/{ayah}` - Specific ayah pages
- `/juz/{number}` - Individual juz pages (1-30)
- `/halaman/{number}` - Individual page numbers (1-604)

## Usage Examples

```javascript
import seoUtils from './seoUtils';

// Get complete SEO data for a page
const seoData = seoUtils.getPageSEOData('surah', {
  name_latin: 'Al-Fatihah',
  name_arabic: 'الفاتحة',
  number: 1,
  total_ayahs: 7
});

// Generate sitemap
const sitemap = seoUtils.generateSitemap(surahsArray);

// Generate structured data
const structuredData = seoUtils.generateStructuredData('home');
```

## SEO Best Practices Implemented

1. ✅ Optimal title lengths (under 60 characters)
2. ✅ Meta descriptions (under 160 characters)
3. ✅ Structured data for rich snippets
4. ✅ Open Graph and Twitter Cards
5. ✅ Canonical URLs
6. ✅ Hreflang for internationalization
7. ✅ Image optimization in sitemaps
8. ✅ Security headers
9. ✅ Critical resource preloading
10. ✅ Robots.txt optimization

## Latest Updates (2025-06-23)

- Added 6 new page types (tafsir, prayer-times, etc.)
- Enhanced sitemap with image support
- Added news sitemap generation
- Improved structured data coverage
- Added security headers
- Optimized content length functions
- Added breadcrumb and FAQ schema support

## Version History Page

The version history page has been renamed to use Indonesian translation:

### Current Implementation:
- **URL**: `/riwayat-versi` (Indonesian)
- **Component**: `RiwayatVersiPage.jsx`
- **SEO Helper**: `getRiwayatVersiSEO()`

### Backward Compatibility:
- The old `/version-history` URL automatically redirects to `/riwayat-versi`
- All navigation links updated to use the Indonesian URL
- SEO metadata and structured data use the new Indonesian URL

### SEO Configuration:
```javascript
export const getRiwayatVersiSEO = () => ({
  title: 'Riwayat Versi - IndoQuran',
  description: 'Catatan lengkap perubahan dan pembaruan versi platform Al-Quran digital IndoQuran...',
  keywords: 'indoquran update, changelog, version history, riwayat versi, pembaruan aplikasi',
  canonicalUrl: 'https://my.indoquran.web.id/riwayat-versi',
  ogType: 'website',
  pageType: 'riwayat-versi'
});
```
