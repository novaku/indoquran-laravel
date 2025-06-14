import React from 'react';
import MetaTags from './MetaTags';
import StructuredData from './StructuredData';

/**
 * SEOHead component - combines MetaTags and StructuredData for comprehensive SEO
 * Optimized for IndoQuran website with domain my.indoquran.web.id
 */
function SEOHead({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  author = 'IndoQuran',
  structuredDataType,
  structuredData,
  pageType,
  // Additional SEO props
  noindex = false,
  nofollow = false,
  additionalMeta = {}
}) {
  const baseUrl = 'https://my.indoquran.web.id';
  
  // Default SEO values
  const seoDefaults = {
    title: title || 'IndoQuran - Al-Quran Digital Indonesia',
    description: description || 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia, fitur bookmark, pencarian ayat, dan audio murottal berkualitas tinggi.',
    keywords: keywords || 'al quran indonesia, quran online, al quran digital, baca quran, terjemahan quran, murottal, quran indonesia, ayat al quran, surah quran, tafsir quran, hafalan quran, indoquran',
    canonicalUrl: canonicalUrl || window.location.href,
    ogImage: ogImage || `${baseUrl}/android-chrome-512x512.png`,
    author: author
  };

  // Generate robots meta content
  const robotsContent = () => {
    let robots = [];
    if (noindex) robots.push('noindex');
    else robots.push('index');
    
    if (nofollow) robots.push('nofollow');
    else robots.push('follow');
    
    robots.push('max-snippet:-1', 'max-image-preview:large', 'max-video-preview:-1');
    return robots.join(', ');
  };

  return (
    <>
      <MetaTags
        title={seoDefaults.title}
        description={seoDefaults.description}
        keywords={seoDefaults.keywords}
        canonicalUrl={seoDefaults.canonicalUrl}
        ogImage={seoDefaults.ogImage}
        ogType={ogType}
        author={seoDefaults.author}
        structuredData={structuredData}
      />
      
      {structuredDataType && (
        <StructuredData
          type={structuredDataType}
          data={structuredData}
          pageType={pageType}
        />
      )}
      
      {/* Additional meta tags for robots */}
      <meta name="robots" content={robotsContent()} />
      
      {/* Additional custom meta tags */}
      {Object.entries(additionalMeta).map(([name, content]) => (
        <meta key={name} name={name} content={content} />
      ))}
    </>
  );
}

// Helper functions for common page types
export const getHomeSEO = () => ({
  title: 'IndoQuran - Al-Quran Digital Indonesia',
  description: 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia, fitur bookmark, pencarian ayat, dan audio murottal berkualitas tinggi.',
  keywords: 'al quran indonesia, quran online, al quran digital, baca quran, terjemahan quran, murottal, quran indonesia, ayat al quran, surah quran, indoquran',
  canonicalUrl: 'https://my.indoquran.web.id',
  structuredDataType: 'website',
  pageType: 'home'
});

export const getSurahSEO = (surah) => ({
  title: `Surah ${surah.name_latin} (${surah.name_arabic}) - IndoQuran`,
  description: `Baca dan dengarkan Surah ${surah.name_latin} lengkap dengan terjemahan bahasa Indonesia. Surah ke-${surah.number} dalam Al-Quran yang terdiri dari ${surah.total_ayahs} ayat. Audio murottal berkualitas tinggi tersedia.`,
  keywords: `Surah ${surah.name_latin}, ${surah.name_arabic}, al quran surah ${surah.number}, terjemahan surah ${surah.name_latin}, murottal ${surah.name_latin}, quran indonesia`,
  canonicalUrl: `https://my.indoquran.web.id/surah/${surah.number}`,
  ogType: 'article',
  structuredDataType: 'surah',
  structuredData: surah,
  pageType: 'surah'
});

export const getAyahSEO = (surah, ayahNumber, ayahText, translation) => ({
  title: `${surah.name_latin} Ayat ${ayahNumber} - Terjemahan dan Audio - IndoQuran`,
  description: `Baca ${surah.name_latin} ayat ${ayahNumber} dengan terjemahan bahasa Indonesia: "${translation?.substring(0, 150)}...". Lengkap dengan audio murottal dan tafsir.`,
  keywords: `${surah.name_latin} ayat ${ayahNumber}, terjemahan ayat ${ayahNumber}, ${surah.name_arabic}, quran ayat, murottal ayat`,
  canonicalUrl: `https://my.indoquran.web.id/surah/${surah.number}/${ayahNumber}`,
  ogType: 'article',
  structuredDataType: 'ayah',
  structuredData: {
    surahName: surah.name_latin,
    surahNumber: surah.number,
    ayahNumber: ayahNumber,
    arabicText: ayahText,
    translation: translation
  },
  pageType: 'ayah'
});

export const getSearchSEO = (query, results = []) => ({
  title: `Hasil Pencarian "${query}" - IndoQuran`,
  description: `Hasil pencarian Al-Quran untuk "${query}". Ditemukan ${results.length} ayat yang sesuai dengan pencarian Anda. Cari ayat, surah, dan terjemahan dalam Al-Quran.`,
  keywords: `pencarian quran, cari ayat, ${query}, al quran indonesia, pencarian al quran`,
  canonicalUrl: `https://my.indoquran.web.id/search?q=${encodeURIComponent(query)}`,
  structuredDataType: 'SearchResults',
  structuredData: { query, results },
  pageType: 'search'
});

export const getBookmarksSEO = () => ({
  title: 'Bookmark Ayat Favorit - IndoQuran',
  description: 'Kelola dan akses bookmark ayat Al-Quran favorit Anda. Simpan ayat-ayat penting untuk dibaca kembali dengan mudah di IndoQuran.',
  keywords: 'bookmark quran, ayat favorit, simpan ayat, al quran bookmark, indoquran bookmark',
  canonicalUrl: 'https://my.indoquran.web.id/bookmarks',
  pageType: 'bookmarks'
});

export const getProfileSEO = () => ({
  title: 'Profil Pengguna - IndoQuran',
  description: 'Kelola profil dan pengaturan akun IndoQuran Anda. Atur preferensi bacaan, audio, dan personalisasi pengalaman Al-Quran digital Anda.',
  keywords: 'profil indoquran, pengaturan akun, preferensi quran, akun pengguna',
  canonicalUrl: 'https://my.indoquran.web.id/profile',
  noindex: true, // Private page
  pageType: 'profile'
});

export default SEOHead;
