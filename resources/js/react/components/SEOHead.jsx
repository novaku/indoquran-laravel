import React, { useEffect } from 'react';

// Helper function to update or create meta tag in <head>
const updateMetaTag = (selector, attribute, value) => {
  if (typeof document === 'undefined' || value === undefined || value === null) return;
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    const nameMatch = selector.match(/name="([^"]+)"/);
    const propMatch = selector.match(/property="([^"]+)"/);
    if (nameMatch) {
      element.setAttribute('name', nameMatch[1]);
    } else if (propMatch) {
      element.setAttribute('property', propMatch[1]);
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
};

// Helper function to update structured data in <head>
const updateStructuredDataInHead = (data) => {
  if (typeof document === 'undefined' || !data) return;
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"][data-react-meta="true"]');
  existingScripts.forEach(el => el.remove());

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-react-meta', 'true');
  const jsonContent = Array.isArray(data) ? data : [data];
  script.textContent = JSON.stringify(jsonContent);
  document.head.appendChild(script);
};

/**
 * SEOHead component - combines MetaTags and StructuredData for comprehensive SEO
 * Optimized for IndoQuran website with domain indoquran.web.id
 */
function SEOHead({
  title,
  description,
  keywords,
  canonicalUrl,
  ampHtmlUrl,
  ogImage,
  ogType = 'website',
  author = 'IndoQuran',
  structuredDataType,
  structuredData,
  pageType,
  // Additional SEO props
  noindex = false,
  nofollow = false,
  additionalMeta = [],
  robots,
  viewport,
  themeColor,
  appleTouchIcon,
  manifestUrl,
  openGraph = {},
  twitter = {}
}) {
  const baseUrl = 'https://indoquran.web.id';
  
  // Default SEO values (updated for canonical URL consistency and dynamic tab titles)
  const seoDefaults = {
    title: title || 'IndoQuran - Al-Quran Digital Indonesia | Baca & Dengar Al-Quran Online',
    description: description || 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia, fitur bookmark, pencarian ayat, audio murottal berkualitas tinggi, dan tafsir lengkap.',
    keywords: keywords || 'al quran indonesia, quran online, al quran digital, baca quran, terjemahan quran, murottal, quran indonesia, ayat al quran, surah quran, tafsir quran, hafalan quran, indoquran, quran dengan tajwid',
    canonicalUrl: canonicalUrl || (typeof window !== 'undefined' ? 
      baseUrl + window.location.pathname + window.location.search : baseUrl),
    ogImage: ogImage || `${baseUrl}/android-chrome-512x512.png`,
    author: author,
    robots: robots || (noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'),
    viewport: viewport || 'width=device-width, initial-scale=1.0',
    themeColor: themeColor || '#2563eb'
  };

  // Dynamically update document title and head metadata in the browser
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (seoDefaults.title) {
      document.title = seoDefaults.title;
    }

    if (seoDefaults.description) {
      updateMetaTag('meta[name="description"]', 'content', seoDefaults.description);
      updateMetaTag('meta[property="og:description"]', 'content', seoDefaults.description);
      updateMetaTag('meta[property="twitter:description"]', 'content', seoDefaults.description);
    }

    if (seoDefaults.keywords) {
      updateMetaTag('meta[name="keywords"]', 'content', seoDefaults.keywords);
    }

    if (seoDefaults.author) {
      updateMetaTag('meta[name="author"]', 'content', seoDefaults.author);
    }

    if (seoDefaults.title) {
      updateMetaTag('meta[property="og:title"]', 'content', seoDefaults.title);
      updateMetaTag('meta[property="twitter:title"]', 'content', seoDefaults.title);
    }

    if (seoDefaults.robots) {
      updateMetaTag('meta[name="robots"]', 'content', seoDefaults.robots);
    }

    if (seoDefaults.ogImage) {
      updateMetaTag('meta[property="og:image"]', 'content', seoDefaults.ogImage);
      updateMetaTag('meta[property="twitter:image"]', 'content', seoDefaults.ogImage);
    }

    if (ogType) {
      updateMetaTag('meta[property="og:type"]', 'content', ogType);
    }

    if (structuredData) {
      updateStructuredDataInHead(structuredData);
    }
  }, [
    seoDefaults.title,
    seoDefaults.description,
    seoDefaults.keywords,
    seoDefaults.canonicalUrl,
    seoDefaults.ogImage,
    seoDefaults.robots,
    seoDefaults.author,
    ogType,
    structuredData
  ]);

  return null;
}

// Helper functions for common page types
export const getHomeSEO = () => ({
  title: 'Al-Quran Online Indonesia - Baca, Dengar & Terjemahan Gratis | IndoQuran',
  description: '✅ Al-Quran Digital GRATIS ✅ Teks Arab & Terjemahan ✅ Audio Murottal HD ✅ Tafsir Lengkap ✅ Bookmark Ayat. Platform Al-Quran online terpercaya untuk belajar Islam. 114 Surah lengkap dengan fitur pencarian ayat.',
  keywords: 'al quran online, quran online, al quran indonesia, al quran digital, baca quran online, terjemahan quran indonesia, murottal quran, quran indonesia, ayat al quran, surah quran, indoquran, quran digital gratis, alquran online, quran digital terlengkap',
  canonicalUrl: 'https://indoquran.web.id',
  structuredDataType: 'website',
  pageType: 'home',
  additionalMeta: {
    'application-name': 'IndoQuran',
    'revisit-after': '3 days'
  }
});

export const getSurahSEO = (surah) => {
  // Generate optimized title based on popular search patterns
  const surahVariations = surah.name_latin.toLowerCase().replace(/[- ]/g, '');
  const isSurahAlaq = surah.number === 96;
  const isSurahBaqarah = surah.number === 2;
  const isSurahYasin = surah.number === 36;
  
  let optimizedTitle, optimizedDescription;
  
  if (isSurahAlaq) {
    optimizedTitle = `Surat Al Alaq Arab, Latin & Arti - Lengkap ${surah.total_ayahs} Ayat | IndoQuran`;
    optimizedDescription = `📖 Surat Al Alaq Lengkap ${surah.total_ayahs} Ayat ✅ Teks Arab & Latin ✅ Arti Per Ayat ✅ Audio MP3 ✅ Tafsir. Surah ke-${surah.number}, diturunkan di ${surah.revelation_place || 'Mekah'}. Surah pertama turun (wahyu pertama). Baca online GRATIS!`;
  } else if (isSurahBaqarah) {
    optimizedTitle = `Surat Al Baqarah - ${surah.total_ayahs} Ayat Teks Arab & Terjemahan | IndoQuran`;
    optimizedDescription = `📖 Surat Al Baqarah Lengkap ${surah.total_ayahs} Ayat (Surah Terpanjang) ✅ Teks Arab ✅ Terjemahan Indonesia ✅ Audio Murottal ✅ Tafsir. Surah ke-${surah.number} Al-Quran. Baca & dengar online GRATIS!`;
  } else if (isSurahYasin) {
    optimizedTitle = `Surat Yasin Arab Latin & Artinya - ${surah.total_ayahs} Ayat Lengkap | IndoQuran`;
    optimizedDescription = `📖 Surat Yasin Lengkap ${surah.total_ayahs} Ayat ✅ Arab & Latin ✅ Terjemahan Indonesia ✅ Audio Murottal ✅ Tafsir. Jantung Al-Quran, dibaca untuk orang yang meninggal. Baca online GRATIS!`;
  } else {
    optimizedTitle = `Surat ${surah.name_latin} Arab Latin & Arti - ${surah.total_ayahs} Ayat | IndoQuran`;
    optimizedDescription = `📖 Surat ${surah.name_latin} (${surah.name_arabic}) Lengkap ${surah.total_ayahs} Ayat ✅ Teks Arab & Latin ✅ Terjemahan Indonesia ✅ Audio Murottal ✅ Tafsir. Surah ke-${surah.number}, ${surah.revelation_place || 'Mekah/Madinah'}. Baca online GRATIS!`;
  }
  
  return {
    title: optimizedTitle,
    description: optimizedDescription,
    keywords: `surat ${surah.name_latin.toLowerCase()}, surah ${surah.name_latin.toLowerCase()}, ${surah.name_latin.toLowerCase()} arab latin, ${surah.name_latin.toLowerCase()} artinya, ${surah.name_latin.toLowerCase()} terjemahan, ${surah.name_latin.toLowerCase()} audio, ${surah.name_arabic}, al quran surah ${surah.number}, quran surat ${surah.name_latin.toLowerCase()}, tafsir ${surah.name_latin.toLowerCase()}, ${surah.revelation_place || 'makkiyah'}`,
    canonicalUrl: `https://indoquran.web.id/surah/${surah.number}`,
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
      'article:tag': `Surat ${surah.name_latin}, Al-Quran, terjemahan, ${surah.total_ayahs} ayat`
    }
  };
};

export const getAyahSEO = (surah, ayahNumber, ayahText, translation) => ({
  title: `${surah.name_latin} Ayat ${ayahNumber} - Terjemahan dan Audio - IndoQuran`,
  description: `Baca ${surah.name_latin} ayat ${ayahNumber} dengan terjemahan bahasa Indonesia: "${translation?.substring(0, 150)}...". Lengkap dengan audio murottal dan tafsir.`,
  keywords: `${surah.name_latin} ayat ${ayahNumber}, terjemahan ayat ${ayahNumber}, ${surah.name_arabic}, quran ayat, murottal ayat`,
  canonicalUrl: `https://indoquran.web.id/surah/${surah.number}`,
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
  canonicalUrl: 'https://indoquran.web.id/cari',
  noindex: true,
  robots: 'noindex, follow',
  structuredDataType: 'SearchResults',
  structuredData: { query, results },
  pageType: 'search'
});

export const getBookmarksSEO = () => ({
  title: 'Penanda Ayat Favorit - IndoQuran',
  description: 'Kelola dan akses penanda ayat Al-Quran favorit Anda. Simpan ayat-ayat penting untuk dibaca kembali dengan mudah di IndoQuran.',
  keywords: 'penanda quran, ayat favorit, simpan ayat, al quran penanda, indoquran penanda',
  canonicalUrl: 'https://indoquran.web.id/penanda',
  pageType: 'bookmarks'
});

export const getProfileSEO = () => ({
  title: 'Profil Pengguna - IndoQuran',
  description: 'Kelola profil dan pengaturan akun IndoQuran Anda. Atur preferensi bacaan, audio, dan personalisasi pengalaman Al-Quran digital Anda.',
  keywords: 'profil indoquran, pengaturan akun, preferensi quran, akun pengguna',
  canonicalUrl: 'https://indoquran.web.id/profil',
  noindex: true, // Private page
  pageType: 'profile'
});

// Helper for About page SEO
export const getAboutSEO = () => ({
  title: 'Tentang IndoQuran - Platform Al-Quran Digital Indonesia',
  description: 'Pelajari lebih lanjut tentang IndoQuran, platform Al-Quran digital terdepan di Indonesia. Misi kami adalah memudahkan umat Islam dalam membaca dan mempelajari Al-Quran secara online.',
  keywords: 'tentang indoquran, al quran digital indonesia, platform quran, teknologi islam, aplikasi quran',
  canonicalUrl: 'https://indoquran.web.id/tentang',
  ogType: 'website',
  pageType: 'about'
});

// Helper for Contact page SEO
export const getContactSEO = () => ({
  title: 'Kontak Kami - IndoQuran',
  description: 'Hubungi tim IndoQuran untuk pertanyaan, saran, atau masukan mengenai platform Al-Quran digital kami. Kami siap membantu Anda.',
  keywords: 'kontak indoquran, hubungi kami, customer service, dukungan teknis',
  canonicalUrl: 'https://indoquran.web.id/kontak',
  ogType: 'website',
  pageType: 'contact'
});

// Helper for Donation page SEO
export const getDonationSEO = () => ({
  title: 'Donasi - Dukung IndoQuran',
  description: 'Dukung pengembangan IndoQuran dengan berdonasi. Kontribusi Anda membantu kami menyediakan platform Al-Quran digital yang lebih baik untuk umat Islam Indonesia.',
  keywords: 'donasi indoquran, donasi platform islam, dukung pengembangan, kontribusi, sedekah jariyah',
  canonicalUrl: 'https://indoquran.web.id/donasi',
  ogType: 'website',
  pageType: 'donation'
});

// Helper for Privacy page SEO
export const getPrivacySEO = () => ({
  title: 'Kebijakan Privasi - IndoQuran',
  description: 'Baca kebijakan privasi IndoQuran. Kami berkomitmen melindungi data pribadi dan privasi pengguna platform Al-Quran digital kami.',
  keywords: 'kebijakan privasi, privacy policy, perlindungan data, keamanan data',
  canonicalUrl: 'https://indoquran.web.id/kebijakan',
  ogType: 'website',
  pageType: 'privacy'
});

// Helper for Juz page SEO
export const getJuzSEO = (juzNumber) => ({
  title: `Juz ${juzNumber} - Teks Arab Al-Quran - IndoQuran`,
  description: `Baca Juz ${juzNumber} Al-Quran dengan teks Arab lengkap. Para ${juzNumber} Al-Quran tersedia untuk dibaca dan dipelajari. Platform Al-Quran digital terlengkap di Indonesia.`,
  keywords: `juz ${juzNumber}, para ${juzNumber}, al quran juz ${juzNumber}, teks arab juz ${juzNumber}, quran digital, al quran indonesia`,
  canonicalUrl: `https://indoquran.web.id/juz/${juzNumber}`,
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
  canonicalUrl: 'https://indoquran.web.id/juz',
  ogType: 'website',
  pageType: 'juz-list'
});

// Helper for Page (Halaman) SEO
export const getPageSEO = (pageNumber) => ({
  title: `Halaman ${pageNumber} - Al-Quran Digital - IndoQuran`,
  description: `Baca Halaman ${pageNumber} Al-Quran dengan teks Arab lengkap. Navigasi mudah antar halaman Al-Quran di platform digital terlengkap Indonesia.`,
  keywords: `halaman ${pageNumber}, al quran halaman ${pageNumber}, teks arab halaman ${pageNumber}, quran digital, al quran indonesia`,
  canonicalUrl: `https://indoquran.web.id/halaman/${pageNumber}`,
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
  canonicalUrl: 'https://indoquran.web.id/halaman',
  ogType: 'website',
  pageType: 'page-list'
});

// Helper for Tafsir Maudhui page SEO
export const getTafsirMaudhuiSEO = () => ({
  title: 'Tafsir Maudhui - Topik-topik dalam Al-Quran | IndoQuran',
  description: 'Jelajahi topik-topik penting dalam Al-Quran melalui pendekatan tafsir maudhui. Temukan ayat-ayat Al-Quran berdasarkan tema seperti akidah, ibadah, akhlak, muamalah, dan banyak lagi.',
  keywords: 'tafsir maudhui, topik quran, tema al quran, tafsir tematik, akidah islam, ibadah islam, akhlak islam, muamalah islam, indoquran',
  canonicalUrl: 'https://indoquran.web.id/tafsir-maudhui',
  ogType: 'article',
  structuredDataType: 'tafsir',
  pageType: 'tafsir-maudhui'
});

// Helper for Prayer Together (Doa Bersama) page SEO
export const getPrayerTogetherSEO = () => ({
  title: 'Doa Bersama - Komunitas Doa Muslim - IndoQuran',
  description: 'Bergabunglah dengan komunitas doa Muslim di IndoQuran. Buat dan bagikan doa, beri dukungan kepada sesama Muslim, serta temukan kekuatan dalam doa bersama.',
  keywords: 'doa bersama, komunitas doa, doa muslim, doa islam, permintaan doa, dukungan doa, indoquran doa',
  canonicalUrl: 'https://indoquran.web.id/doa-bersama',
  ogType: 'website',
  pageType: 'prayer-together'
});

// Helper for Riwayat Versi page SEO
export const getRiwayatVersiSEO = () => ({
  title: 'Riwayat Versi - IndoQuran',
  description: 'Catatan lengkap perubahan dan pembaruan versi platform Al-Quran digital IndoQuran. Lihat perkembangan fitur, perbaikan, dan peningkatan dari waktu ke waktu.',
  keywords: 'indoquran update, changelog, version history, riwayat versi, pembaruan aplikasi, fitur baru',
  canonicalUrl: 'https://indoquran.web.id/riwayat-versi',
  ogType: 'website',
  pageType: 'riwayat-versi'
});

// Helper for Surah List page SEO
export const getSurahListSEO = () => ({
  title: 'Daftar Surah Al-Quran - 114 Surah Lengkap - IndoQuran',
  description: 'Akses semua 114 Surah Al-Quran dengan terjemahan bahasa Indonesia, audio murottal, dan tafsir lengkap. Platform Al-Quran digital terlengkap di Indonesia.',
  keywords: 'daftar surah al quran, 114 surah quran, surah al quran lengkap, terjemahan surah, murottal surah, al quran digital indonesia',
  canonicalUrl: 'https://indoquran.web.id/surah',
  ogType: 'website',
  structuredDataType: 'surahList',
  pageType: 'surah-list',
  additionalMeta: {
    'application-name': 'IndoQuran Surah List',
    'revisit-after': '7 days'
  }
});

// Helper for Asmaul Husna page SEO
export const getAsmaulHusnaSEO = (totalNames = 99, filteredCount = null) => ({
  title: '99 Asmaul Husna - Nama-nama Indah Allah SWT Lengkap dengan Makna | IndoQuran',
  description: 'Pelajari dan renungkan 99 Asmaul Husna (nama-nama indah Allah SWT) dengan makna mendalam, audio pronunciation, ayat Al-Quran terkait, dan penjelasan lengkap dalam bahasa Indonesia. Dekatkan diri kepada Allah melalui pemahaman sifat-sifat mulia-Nya.',
  keywords: '99 asmaul husna, nama allah, nama indah allah, sifat allah, asmaul husna lengkap, makna asmaul husna, audio asmaul husna, doa asmaul husna, kaligrafi arab, al husna, nama allah 99, dzikir asmaul husna, islam, spiritualitas, indoquran',
  canonicalUrl: 'https://indoquran.web.id/asmaul-husna',
  ogType: 'article',
  ogImage: 'https://indoquran.web.id/images/asmaul-husna-cover.jpg',
  structuredDataType: 'asmaulHusna',
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': '99 Asmaul Husna - Nama-nama Indah Allah SWT',
    'description': 'Koleksi lengkap 99 Asmaul Husna dengan makna, penjelasan, dan ayat Al-Quran terkait',
    'author': {
      '@type': 'Organization',
      'name': 'IndoQuran',
      'url': 'https://indoquran.web.id'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'IndoQuran',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://indoquran.web.id/android-chrome-512x512.png'
      }
    },
    'datePublished': '2025-01-01T00:00:00Z',
    'dateModified': new Date().toISOString(),
    'mainEntityOfPage': 'https://indoquran.web.id/asmaul-husna',
    'image': 'https://indoquran.web.id/images/asmaul-husna-cover.jpg',
    'articleSection': 'Islamic Education',
    'wordCount': 2500,
    'about': [
      {
        '@type': 'Thing',
        'name': 'Asmaul Husna',
        'description': '99 nama indah Allah SWT dalam Islam'
      },
      {
        '@type': 'Thing',
        'name': 'Islamic Names of God',
        'description': 'Beautiful names and attributes of Allah in Islam'
      }
    ],
    'mentions': [
      {
        '@type': 'Thing',
        'name': 'Al-Quran',
        'description': 'Holy book of Islam containing verses about Allah\'s names'
      },
      {
        '@type': 'Thing',
        'name': 'Islamic Prayer',
        'description': 'Du\'a and dhikr using Allah\'s beautiful names'
      }
    ]
  },
  pageType: 'asmaul-husna',
  additionalMeta: {
    'application-name': 'IndoQuran Asmaul Husna',
    'revisit-after': '30 days',
    'article:published_time': '2025-01-01T00:00:00Z',
    'article:modified_time': new Date().toISOString(),
    'article:section': 'Islamic Education',
    'article:tag': 'Asmaul Husna, Allah Names, Islamic Education, Spirituality',
    'dc.title': '99 Asmaul Husna - Nama-nama Indah Allah SWT',
    'dc.creator': 'IndoQuran',
    'dc.subject': 'Islamic Education, Allah Names, Asmaul Husna',
    'dc.description': 'Comprehensive collection of 99 beautiful names of Allah with meanings and explanations',
    'dc.language': 'id-ID',
    'geo.region': 'ID',
    'geo.country': 'Indonesia'
  },
  openGraph: {
    'og:title': '99 Asmaul Husna - Nama-nama Indah Allah SWT | IndoQuran',
    'og:description': 'Pelajari 99 Asmaul Husna dengan makna mendalam, audio, dan ayat Al-Quran terkait. Dekatkan diri kepada Allah melalui nama-nama indah-Nya.',
    'og:image': 'https://indoquran.web.id/images/asmaul-husna-cover.jpg',
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': '99 Asmaul Husna - Kaligrafi Arab Nama-nama Allah',
    'og:locale': 'id_ID',
    'og:site_name': 'IndoQuran'
  },
  twitter: {
    'twitter:card': 'summary_large_image',
    'twitter:title': '99 Asmaul Husna - Nama-nama Indah Allah SWT',
    'twitter:description': 'Pelajari 99 Asmaul Husna dengan makna mendalam, audio, dan ayat Al-Quran terkait.',
    'twitter:image': 'https://indoquran.web.id/images/asmaul-husna-cover.jpg',
    'twitter:image:alt': '99 Asmaul Husna - Kaligrafi Arab'
  }
});

// Helper for individual Asmaul Husna name SEO (for detail pages if needed)
export const getAsmaulHusnaNameSEO = (name) => ({
  title: `${name.latin} (${name.arabic}) - Makna: ${name.meaning} | 99 Asmaul Husna | IndoQuran`,
  description: `Pelajari makna mendalam dari nama Allah "${name.latin}" (${name.arabic}) yang berarti "${name.meaning}". ${name.description ? name.description.substring(0, 120) + '...' : 'Temukan penjelasan lengkap, ayat Al-Quran terkait, dan hikmah spiritual dari nama indah Allah ini.'}`,
  keywords: `${name.latin}, ${name.arabic}, ${name.meaning}, asmaul husna ${name.latin}, makna ${name.latin}, nama allah ${name.latin}, sifat allah, 99 nama allah`,
  canonicalUrl: `https://indoquran.web.id/asmaul-husna/${name.id}`,
  ogType: 'article',
  structuredDataType: 'asmaulHusnaName',
  structuredData: {
    name: name.latin,
    arabic: name.arabic,
    meaning: name.meaning,
    description: name.description,
    number: name.id
  },
  pageType: 'asmaul-husna-name'
});

export default SEOHead;
