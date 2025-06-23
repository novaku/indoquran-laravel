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
  title: 'Penanda Ayat Favorit - IndoQuran',
  description: 'Kelola dan akses penanda ayat Al-Quran favorit Anda. Simpan ayat-ayat penting untuk dibaca kembali dengan mudah di IndoQuran.',
  keywords: 'penanda quran, ayat favorit, simpan ayat, al quran penanda, indoquran penanda',
  canonicalUrl: 'https://my.indoquran.web.id/penanda',
  pageType: 'bookmarks'
});

export const getProfileSEO = () => ({
  title: 'Profil Pengguna - IndoQuran',
  description: 'Kelola profil dan pengaturan akun IndoQuran Anda. Atur preferensi bacaan, audio, dan personalisasi pengalaman Al-Quran digital Anda.',
  keywords: 'profil indoquran, pengaturan akun, preferensi quran, akun pengguna',
  canonicalUrl: 'https://my.indoquran.web.id/profil',
  noindex: true, // Private page
  pageType: 'profile'
});

// Helper for About page SEO
export const getAboutSEO = () => ({
  title: 'Tentang IndoQuran - Platform Al-Quran Digital Indonesia',
  description: 'Pelajari lebih lanjut tentang IndoQuran, platform Al-Quran digital terdepan di Indonesia. Misi kami adalah memudahkan umat Islam dalam membaca dan mempelajari Al-Quran secara online.',
  keywords: 'tentang indoquran, al quran digital indonesia, platform quran, teknologi islam, aplikasi quran',
  canonicalUrl: 'https://my.indoquran.web.id/tentang',
  ogType: 'website',
  pageType: 'about'
});

// Helper for Contact page SEO
export const getContactSEO = () => ({
  title: 'Kontak Kami - IndoQuran',
  description: 'Hubungi tim IndoQuran untuk pertanyaan, saran, atau masukan mengenai platform Al-Quran digital kami. Kami siap membantu Anda.',
  keywords: 'kontak indoquran, hubungi kami, customer service, dukungan teknis',
  canonicalUrl: 'https://my.indoquran.web.id/kontak',
  ogType: 'website',
  pageType: 'contact'
});

// Helper for Donation page SEO
export const getDonationSEO = () => ({
  title: 'Donasi - Dukung IndoQuran',
  description: 'Dukung pengembangan IndoQuran dengan berdonasi. Kontribusi Anda membantu kami menyediakan platform Al-Quran digital yang lebih baik untuk umat Islam Indonesia.',
  keywords: 'donasi indoquran, donasi platform islam, dukung pengembangan, kontribusi, sedekah jariyah',
  canonicalUrl: 'https://my.indoquran.web.id/donasi',
  ogType: 'website',
  pageType: 'donation'
});

// Helper for Privacy page SEO
export const getPrivacySEO = () => ({
  title: 'Kebijakan Privasi - IndoQuran',
  description: 'Baca kebijakan privasi IndoQuran. Kami berkomitmen melindungi data pribadi dan privasi pengguna platform Al-Quran digital kami.',
  keywords: 'kebijakan privasi, privacy policy, perlindungan data, keamanan data',
  canonicalUrl: 'https://my.indoquran.web.id/kebijakan',
  ogType: 'website',
  pageType: 'privacy'
});

// Helper for Juz page SEO
export const getJuzSEO = (juzNumber) => ({
  title: `Juz ${juzNumber} - Teks Arab Al-Quran - IndoQuran`,
  description: `Baca Juz ${juzNumber} Al-Quran dengan teks Arab lengkap. Para ${juzNumber} Al-Quran tersedia untuk dibaca dan dipelajari. Platform Al-Quran digital terlengkap di Indonesia.`,
  keywords: `juz ${juzNumber}, para ${juzNumber}, al quran juz ${juzNumber}, teks arab juz ${juzNumber}, quran digital, al quran indonesia`,
  canonicalUrl: `https://my.indoquran.web.id/juz/${juzNumber}`,
  ogType: 'article',
  structuredDataType: 'juz',
  structuredData: {
    juzNumber: juzNumber,
    title: `Juz ${juzNumber}`,
    description: `Juz ${juzNumber} Al-Quran dengan teks Arab lengkap`
  },
  pageType: 'juz'
});

// Helper for Juz List page SEO
export const getJuzListSEO = () => ({
  title: 'Daftar Juz Al-Quran - Teks Arab - IndoQuran',
  description: 'Akses semua Juz (Para) Al-Quran dengan teks Arab lengkap. 30 Juz Al-Quran tersedia untuk dibaca dan dipelajari. Platform Al-Quran digital terlengkap di Indonesia.',
  keywords: 'juz al quran, para al quran, daftar juz, teks arab al quran, al quran digital, quran indonesia, juz lengkap',
  canonicalUrl: 'https://my.indoquran.web.id/juz',
  ogType: 'website',
  pageType: 'juz-list'
});

// Helper for Page (Halaman) SEO
export const getPageSEO = (pageNumber) => ({
  title: `Halaman ${pageNumber} - Al-Quran Digital - IndoQuran`,
  description: `Baca Halaman ${pageNumber} Al-Quran dengan teks Arab lengkap. Navigasi mudah antar halaman Al-Quran di platform digital terlengkap Indonesia.`,
  keywords: `halaman ${pageNumber}, al quran halaman ${pageNumber}, teks arab halaman ${pageNumber}, quran digital, al quran indonesia`,
  canonicalUrl: `https://my.indoquran.web.id/halaman/${pageNumber}`,
  ogType: 'article',
  structuredDataType: 'page',
  structuredData: {
    pageNumber: pageNumber,
    title: `Halaman ${pageNumber}`,
    description: `Halaman ${pageNumber} Al-Quran dengan teks Arab lengkap`
  },
  pageType: 'page'
});

// Helper for Page List SEO
export const getPageListSEO = () => ({
  title: 'Daftar Halaman Al-Quran - Teks Arab - IndoQuran',
  description: 'Akses semua halaman Al-Quran dengan teks Arab lengkap. 604 halaman Al-Quran tersedia untuk dibaca dan dipelajari. Platform Al-Quran digital terlengkap di Indonesia.',
  keywords: 'halaman al quran, daftar halaman, teks arab al quran, al quran digital, quran indonesia, halaman lengkap',
  canonicalUrl: 'https://my.indoquran.web.id/halaman',
  ogType: 'website',
  pageType: 'page-list'
});

// Helper for Tafsir Maudhui page SEO
export const getTafsirMaudhuiSEO = () => ({
  title: 'Tafsir Maudhui - Topik-topik dalam Al-Quran | IndoQuran',
  description: 'Jelajahi topik-topik penting dalam Al-Quran melalui pendekatan tafsir maudhui. Temukan ayat-ayat Al-Quran berdasarkan tema seperti akidah, ibadah, akhlak, muamalah, dan banyak lagi.',
  keywords: 'tafsir maudhui, topik quran, tema al quran, tafsir tematik, akidah islam, ibadah islam, akhlak islam, muamalah islam, indoquran',
  canonicalUrl: 'https://my.indoquran.web.id/tafsir-maudhui',
  ogType: 'article',
  structuredDataType: 'tafsir',
  pageType: 'tafsir-maudhui'
});

// Helper for Prayer Together (Doa Bersama) page SEO
export const getPrayerTogetherSEO = () => ({
  title: 'Doa Bersama - Komunitas Doa Muslim - IndoQuran',
  description: 'Bergabunglah dengan komunitas doa Muslim di IndoQuran. Buat dan bagikan doa, beri dukungan kepada sesama Muslim, serta temukan kekuatan dalam doa bersama.',
  keywords: 'doa bersama, komunitas doa, doa muslim, doa islam, permintaan doa, dukungan doa, indoquran doa',
  canonicalUrl: 'https://my.indoquran.web.id/doa-bersama',
  ogType: 'website',
  pageType: 'prayer-together'
});

// Helper for Riwayat Versi page SEO
export const getRiwayatVersiSEO = () => ({
  title: 'Riwayat Versi - IndoQuran',
  description: 'Catatan lengkap perubahan dan pembaruan versi platform Al-Quran digital IndoQuran. Lihat perkembangan fitur, perbaikan, dan peningkatan dari waktu ke waktu.',
  keywords: 'indoquran update, changelog, version history, riwayat versi, pembaruan aplikasi, fitur baru',
  canonicalUrl: 'https://my.indoquran.web.id/riwayat-versi',
  ogType: 'website',
  pageType: 'riwayat-versi'
});

// Helper for Surah List page SEO
export const getSurahListSEO = () => ({
  title: 'Daftar Surah Al-Quran - 114 Surah Lengkap - IndoQuran',
  description: 'Akses semua 114 Surah Al-Quran dengan terjemahan bahasa Indonesia, audio murottal, dan tafsir lengkap. Platform Al-Quran digital terlengkap di Indonesia.',
  keywords: 'daftar surah al quran, 114 surah quran, surah al quran lengkap, terjemahan surah, murottal surah, al quran digital indonesia',
  canonicalUrl: 'https://my.indoquran.web.id/surah',
  ogType: 'website',
  structuredDataType: 'surahList',
  pageType: 'surah-list',
  additionalMeta: {
    'application-name': 'IndoQuran Surah List',
    'revisit-after': '7 days'
  }
});

export default SEOHead;
