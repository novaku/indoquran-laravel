// SEO Configuration for IndoQuran
export const getHomeSEO = () => ({
  title: 'IndoQuran - Al-Quran Digital Indonesia',
  description: 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia.',
  keywords: 'al-quran, quran, indonesia, digital, online, terjemahan, bacaan, surat, ayat',
  canonical: '/',
  openGraph: {
    title: 'IndoQuran - Al-Quran Digital Indonesia',
    description: 'Platform Al-Quran Digital terlengkap di Indonesia',
    image: '/android-chrome-512x512.png',
    url: '/',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IndoQuran - Al-Quran Digital Indonesia',
    description: 'Platform Al-Quran Digital terlengkap di Indonesia',
    image: '/android-chrome-512x512.png'
  },
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'IndoQuran',
    url: '/',
    description: 'Platform Al-Quran Digital terlengkap di Indonesia'
  }
});

export const getSurahSEO = (surah) => ({
  title: `Surat ${surah.name_latin} - ${surah.name_arabic} | IndoQuran`,
  description: `Baca dan dengarkan Surat ${surah.name_latin} (${surah.name_arabic}) dengan terjemahan bahasa Indonesia. ${surah.total_ayahs} ayat.`,
  keywords: `surat ${surah.name_latin}, ${surah.name_arabic}, al-quran, quran indonesia`,
  canonical: `/surah/${surah.number}`,
  openGraph: {
    title: `Surat ${surah.name_latin} - ${surah.name_arabic}`,
    description: `${surah.total_ayahs} ayat dari Surat ${surah.name_latin}`,
    image: '/android-chrome-512x512.png',
    url: `/surah/${surah.number}`,
    type: 'article'
  },
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Surat ${surah.name_latin}`,
    description: `${surah.total_ayahs} ayat dari Surat ${surah.name_latin}`,
    url: `/surah/${surah.number}`
  }
});

export const getSearchSEO = (query) => ({
  title: `Pencarian: "${query}" | IndoQuran`,
  description: `Hasil pencarian untuk "${query}" di Al-Quran. Temukan ayat-ayat yang relevan dengan kata kunci Anda.`,
  keywords: `pencarian quran, ${query}, ayat quran, al-quran`,
  canonical: `/search?q=${encodeURIComponent(query)}`,
  openGraph: {
    title: `Pencarian: "${query}" | IndoQuran`,
    description: `Hasil pencarian untuk "${query}" di Al-Quran`,
    image: '/android-chrome-512x512.png',
    url: `/search?q=${encodeURIComponent(query)}`,
    type: 'website'
  }
});

export const getAyahSEO = (surah, ayahNumber, ayahText) => ({
  title: `${surah.name_latin} Ayat ${ayahNumber} | IndoQuran`,
  description: `Ayat ${ayahNumber} dari Surat ${surah.name_latin}: ${ayahText.substring(0, 150)}...`,
  keywords: `${surah.name_latin} ayat ${ayahNumber}, al-quran, quran indonesia`,
  canonical: `/surah/${surah.number}/${ayahNumber}`,
  openGraph: {
    title: `${surah.name_latin} Ayat ${ayahNumber}`,
    description: ayahText.substring(0, 200),
    image: '/android-chrome-512x512.png',
    url: `/surah/${surah.number}/${ayahNumber}`,
    type: 'article'
  },
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${surah.name_latin} Ayat ${ayahNumber}`,
    description: ayahText.substring(0, 200),
    url: `/surah/${surah.number}/${ayahNumber}`
  }
});

// Default SEO configuration
export const defaultSEO = {
  title: 'IndoQuran - Al-Quran Digital Indonesia',
  description: 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia.',
  keywords: 'al-quran, quran, indonesia, digital, online, terjemahan',
  image: '/android-chrome-512x512.png',
  url: '/',
  type: 'website'
};
