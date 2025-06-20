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
  
  // Default SEO values (updated June 2025)
  const seoDefaults = {
    title: title || 'IndoQuran - Al-Quran Digital Indonesia | Baca & Dengar Al-Quran Online',
    description: description || 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia, fitur bookmark, pencarian ayat, audio murottal berkualitas tinggi, dan tafsir lengkap.',
    keywords: keywords || 'al quran indonesia, quran online, al quran digital, baca quran, terjemahan quran, murottal, quran indonesia, ayat al quran, surah quran, tafsir quran, hafalan quran, indoquran, quran dengan tajwid',
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
    
    // Add additional directives for better crawling efficiency
    robots.push('noarchive', 'notranslate');
    
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
  title: 'IndoQuran - Al-Quran Digital Indonesia | Baca & Dengar Al-Quran Online',
  description: 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia, fitur bookmark, pencarian ayat, audio murottal berkualitas tinggi, dan tafsir lengkap.',
  keywords: 'al quran indonesia, quran online, al quran digital, baca quran, terjemahan quran, murottal, quran indonesia, ayat al quran, surah quran, indoquran, quran digital terlengkap, quran dengan tajwid',
  canonicalUrl: 'https://my.indoquran.web.id',
  structuredDataType: 'website',
  pageType: 'home',
  additionalMeta: {
    'apple-mobile-web-app-capable': 'yes',
    'application-name': 'IndoQuran',
    'revisit-after': '7 days'
  }
});

export const getSurahSEO = (surah) => ({
  title: `Surah ${surah.name_latin} (${surah.name_arabic}) - Terjemahan & Audio | IndoQuran`,
  description: `Baca dan dengarkan Surah ${surah.name_latin} (${surah.name_arabic}) lengkap dengan terjemahan bahasa Indonesia dan tafsir. Surah ke-${surah.number} dalam Al-Quran yang terdiri dari ${surah.total_ayahs} ayat. Audio murottal berkualitas tinggi tersedia dengan berbagai qari.`,
  keywords: `Surah ${surah.name_latin}, ${surah.name_arabic}, al quran surah ${surah.number}, terjemahan surah ${surah.name_latin}, murottal ${surah.name_latin}, quran indonesia, tafsir surah ${surah.name_latin}, ${surah.revelation_place || 'Mekah/Madinah'}`,
  canonicalUrl: `https://my.indoquran.web.id/surah/${surah.number}`,
  ogType: 'article',
  structuredDataType: 'surah',
  structuredData: {
    ...surah,
    dateModified: new Date().toISOString(),
    datePublished: "2025-06-15T00:00:00Z"
  },
  pageType: 'surah',
  additionalMeta: {
    'article:published_time': '2025-06-15T00:00:00Z',
    'article:modified_time': new Date().toISOString(),
    'article:section': 'Surah',
    'article:tag': `Surah ${surah.name_latin}, Al-Quran, terjemahan`
  }
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
  canonicalUrl: `https://my.indoquran.web.id/cari?q=${encodeURIComponent(query)}`,
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

// Helper for Prayer Times page SEO
export const getPrayerTimesSEO = (location = 'Indonesia') => ({
  title: `Jadwal Sholat ${location} - Waktu Sholat Akurat | IndoQuran`,
  description: `Jadwal waktu sholat akurat untuk ${location}. Dapatkan waktu Subuh, Dzuhur, Ashar, Maghrib dan Isya yang tepat. Dilengkapi dengan arah kiblat dan notifikasi adzan.`,
  keywords: `jadwal sholat ${location}, waktu sholat, jadwal sholat digital, adzan, kiblat, waktu subuh, waktu dzuhur, waktu ashar, waktu maghrib, waktu isya`,
  canonicalUrl: `https://my.indoquran.web.id/prayer-times/${encodeURIComponent(location.toLowerCase())}`,
  ogType: 'website',
  structuredDataType: 'PrayerTime',
  structuredData: {
    title: `Jadwal Sholat ${location}`,
    description: `Jadwal waktu sholat akurat untuk ${location}`,
    date: new Date().toISOString().split('T')[0],
    location: location,
    region: location
  },
  pageType: 'prayer-times',
  additionalMeta: {
    'application-name': 'IndoQuran Prayer Times',
    'revisit-after': '1 day'
  }
});

// Helper for FAQ page SEO
export const getFAQSEO = () => ({
  title: 'Pertanyaan Umum (FAQ) - IndoQuran | Al-Quran Digital Indonesia',
  description: 'Temukan jawaban dari pertanyaan umum tentang IndoQuran, cara menggunakan fitur-fitur Al-Quran Digital, dan informasi lainnya.',
  keywords: 'faq indoquran, pertanyaan umum al quran digital, bantuan indoquran, indoquran help, cara menggunakan indoquran',
  canonicalUrl: 'https://my.indoquran.web.id/faq',
  ogType: 'website',
  structuredDataType: 'FAQ',
  structuredData: {
    questions: [
      {
        question: 'Apa itu IndoQuran?',
        answer: 'IndoQuran adalah platform Al-Quran Digital terlengkap di Indonesia. Menyediakan Al-Quran dengan terjemahan bahasa Indonesia, fitur bookmark, pencarian ayat, dan audio murottal berkualitas tinggi.'
      },
      {
        question: 'Apakah IndoQuran gratis?',
        answer: 'Ya, IndoQuran dapat diakses secara gratis tanpa biaya. Kami berkomitmen untuk menyediakan akses Al-Quran untuk semua umat Muslim di Indonesia.'
      },
      {
        question: 'Apakah saya bisa menggunakan IndoQuran secara offline?',
        answer: 'Ya, IndoQuran memiliki fitur Progressive Web App (PWA) yang memungkinkan Anda mengakses platform secara offline setelah Anda membukanya untuk pertama kali.'
      },
      {
        question: 'Bagaimana cara mendengarkan murottal di IndoQuran?',
        answer: 'Pada halaman surah, Anda dapat menekan tombol play pada ayat yang ingin didengarkan, atau menggunakan fitur play all untuk mendengarkan seluruh surah.'
      },
      {
        question: 'Bagaimana cara menggunakan fitur bookmark?',
        answer: 'Anda dapat menyimpan ayat favorit dengan menekan ikon bookmark di samping ayat. Bookmarks dapat diakses melalui menu profil Anda.'
      }
    ]
  },
  pageType: 'faq'
});

export default SEOHead;
