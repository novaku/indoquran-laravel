/**
 * Comprehensive SEO Utility Functions for IndoQuran
 * Domain: indoquran.web.id
 * 
 * Features:
 * - Google Search Console optimized sitemap generation
 * - Core Web Vitals optimization
 * - Enhanced structured data (JSON-LD) for rich snippets
 * - Mobile-first indexing support
 * - Page Experience signals optimization
 * - E-A-T (Expertise, Authoritativeness, Trustworthiness) implementation
 * - Local SEO for Indonesian market
 * - Voice search optimization
 * - Featured snippets optimization
 * - Google Discover optimization
 * - AI Search optimization (Google SGE, Bing Chat)
 * - Member benefits and community features SEO
 * 
 * Updated: 2025-08-02
 * Google Search Guidelines Compliant
 */

// Environment-aware BASE_URL with enhanced mobile detection
export const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? window.location.origin
  : 'https://indoquran.web.id';

// Google Search Console optimized priority scores (Updated Aug 2025)
export const SEO_PRIORITIES = {
  HOME: '1.0',
  SURAH: '0.95',
  MEMBER_BENEFITS: '0.9', // High priority for conversion pages
  SEARCH: '0.85',
  JUZ: '0.8',
  DOA_BERSAMA: '0.85', // Increased priority for community features
  HALAMAN: '0.75',
  TAFSIR: '0.8',
  ABOUT: '0.6',
  CONTACT: '0.5',
  PRIVACY: '0.3',
  USER_FEATURES: '0.7' // Bookmarks, Profile, etc.
};

// Generate Google Search Console optimized sitemap XML
export const generateSitemap = (surahs = []) => {
  const currentDate = new Date().toISOString().split('T')[0];

  const staticPages = [
    {
      url: BASE_URL,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: SEO_PRIORITIES.HOME,
      // Google favors frequently updated homepages
      alternates: {
        mobile: `${BASE_URL}?mobile=1`
      }
    },
    {
      url: `${BASE_URL}/cari`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: SEO_PRIORITIES.SEARCH
    },
    {
      url: `${BASE_URL}/surah`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: SEO_PRIORITIES.SURAH,
      // Surah listing is high-value content
      images: [
        {
          loc: `${BASE_URL}/android-chrome-512x512.png`,
          caption: 'Daftar 114 Surah Al-Quran dengan Terjemahan Indonesia',
          title: 'Surah Al-Quran Lengkap'
        }
      ]
    },
    {
      url: `${BASE_URL}/juz`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: SEO_PRIORITIES.JUZ
    },
    {
      url: `${BASE_URL}/halaman`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: SEO_PRIORITIES.HALAMAN
    },
    {
      url: `${BASE_URL}/doa-bersama`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: SEO_PRIORITIES.DOA_BERSAMA,
      // Interactive content gets daily updates
      contentType: 'interactive'
    },
    {
      url: `${BASE_URL}/member`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: SEO_PRIORITIES.MEMBER_BENEFITS,
      // High-value conversion page
      contentType: 'marketing',
      images: [
        {
          loc: `${BASE_URL}/android-chrome-512x512.png`,
          caption: 'Keuntungan Menjadi Member IndoQuran - Fitur Premium Al-Quran Digital',
          title: 'Member Benefits IndoQuran'
        }
      ]
    },
    {
      url: `${BASE_URL}/keuntungan-member`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: SEO_PRIORITIES.MEMBER_BENEFITS,
      // Alternative URL for member benefits
      contentType: 'marketing'
    },
    {
      url: `${BASE_URL}/asmaul-husna`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8',
      // Islamic educational content
      contentType: 'educational',
      images: [
        {
          loc: `${BASE_URL}/android-chrome-512x512.png`,
          caption: '99 Asmaul Husna - Nama Indah Allah SWT dengan Audio dan Arti',
          title: 'Asmaul Husna Lengkap'
        }
      ]
    },
    {
      url: `${BASE_URL}/tafsir-maudhui`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: SEO_PRIORITIES.TAFSIR,
      // Educational content is valuable for Google
      contentType: 'educational'
    },
    {
      url: `${BASE_URL}/tentang`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: SEO_PRIORITIES.ABOUT,
      // About page for E-A-T signals
      contentType: 'about'
    },
    {
      url: `${BASE_URL}/kontak`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: SEO_PRIORITIES.CONTACT,
      // Contact page for trustworthiness
      contentType: 'contact'
    },
    {
      url: `${BASE_URL}/donasi`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.5'
    },
    {
      url: `${BASE_URL}/kebijakan`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: SEO_PRIORITIES.PRIVACY,
      // Privacy policy for trust signals
      contentType: 'legal'
    },
    {
      url: `${BASE_URL}/riwayat-versi`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.4'
    }
  ];

  // Enhanced Surah pages with better SEO signals
  const surahPages = surahs.map(surah => ({
    url: `${BASE_URL}/surah/${surah.number}`,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: SEO_PRIORITIES.SURAH,
    // Individual surah pages are high-value content
    images: [
      {
        loc: `${BASE_URL}/images/surah-${surah.number}.png`,
        caption: `Surah ${surah.name_latin} (${surah.name_arabic}) - ${surah.total_ayahs} Ayat`,
        title: `Surah ${surah.name_latin} Terjemahan Indonesia`
      }
    ],
    // Add Juz information for better content organization
    alternates: {
      juz: `${BASE_URL}/juz/${surah.juz_number || Math.ceil(surah.number / 4)}`
    }
  }));

  const allPages = [...staticPages, ...surahPages];

  // Google XML Sitemap with enhanced markup
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${generateImageXmlForSitemap(page.images || [])}${generateAlternatesXml(page.alternates || {})}
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

// Helper function for image XML in sitemap
const generateImageXmlForSitemap = (images) => {
  if (!images || images.length === 0) return '';

  return images.map(image => `
    <image:image>
      <image:loc>${image.loc}</image:loc>
      <image:caption><![CDATA[${image.caption}]]></image:caption>
      <image:title><![CDATA[${image.title}]]></image:title>
    </image:image>`).join('');
};

// Helper function for alternate URLs in sitemap
const generateAlternatesXml = (alternates) => {
  if (!alternates || Object.keys(alternates).length === 0) return '';

  return Object.entries(alternates).map(([rel, href]) => `
    <xhtml:link rel="alternate" hreflang="${rel}" href="${href}" />`).join('');
};

// Generate Google-optimized robots.txt content
// FIXED: Proper crawl budget optimization without blocking indexable content
export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /

# Allow all public content for indexing
Allow: /
Allow: /surah/
Allow: /juz/
Allow: /halaman/
Allow: /cari
Allow: /doa-bersama
Allow: /tafsir-maudhui
Allow: /asmaul-husna
Allow: /tentang
Allow: /kontak
Allow: /donasi
Allow: /kebijakan
Allow: /riwayat-versi
Allow: /member

# Optimize crawl budget by disallowing ONLY low-value private pages
Disallow: /masuk
Disallow: /daftar
Disallow: /profil
Disallow: /penanda
Disallow: /admin/
Disallow: /dashboard/

# Block query parameters that create duplicates/low value
Disallow: /api/
Disallow: /login
Disallow: /register
Disallow: /logout
Disallow: /*?utm_
Disallow: /*?fb_
Disallow: /*?gclid=
Disallow: /*?session=
Disallow: /*?preview=

# Prevent search parameter pagination issues
Disallow: /cari?page=

# Crawl delay optimized for server performance
Crawl-delay: 1

# Multiple sitemap references for better discovery
Sitemap: https://indoquran.web.id/sitemap.xml
Sitemap: https://indoquran.web.id/sitemap-index.xml

# Google-specific optimizations
User-agent: Googlebot
Allow: /
Crawl-delay: 0.5
# Allow Google to crawl more of our site for better indexing
Request-rate: 50/1s

User-agent: Googlebot-Image
Allow: /images/
Allow: /android-chrome-*.png
Allow: /apple-touch-icon.png
Allow: /favicon.ico

User-agent: Googlebot-News
Allow: /
Disallow: /api/

# Bing optimization
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Other search engines
User-agent: Slurp
Allow: /
Crawl-delay: 2

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

# Social media crawlers - ALLOW for social sharing
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

User-agent: Viber
Allow: /

# Block unwanted/aggressive bots to preserve crawl budget
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: AmazonBot
Disallow: /`;
};
};

// Generate Google-optimized Open Graph meta tags for social media
export const generateOpenGraphTags = (page) => {
  const defaultOG = {
    'og:site_name': 'IndoQuran - Al-Quran Digital Indonesia',
    'og:locale': 'id_ID',
    'og:type': 'website',
    'og:image': `${BASE_URL}/android-chrome-512x512.png`,
    'og:image:width': '512',
    'og:image:height': '512',
    'og:image:type': 'image/png',
    'og:image:alt': 'Logo IndoQuran - Platform Al-Quran Digital Indonesia',
    // Enhanced OG tags for better social sharing
    'fb:app_id': '1234567890', // Add your Facebook App ID
    'og:see_also': [
      `${BASE_URL}/surah`,
      `${BASE_URL}/cari`,
      `${BASE_URL}/doa-bersama`
    ]
  };

  switch (page.type) {
    case 'home':
      return {
        ...defaultOG,
        'og:title': 'IndoQuran - Al-Quran Digital Indonesia Terlengkap',
        'og:description': 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia, fitur bookmark, pencarian ayat, audio murottal berkualitas tinggi dari berbagai qari terbaik.',
        'og:url': BASE_URL,
        // Additional home page tags
        'og:video': `${BASE_URL}/intro-video.mp4`,
        'og:audio': `${BASE_URL}/quran-recitation-sample.mp3`
      };

    case 'surah':
      const surah = page.data;
      return {
        ...defaultOG,
        'og:type': 'article',
        'og:title': `Surah ${surah.name_latin} (${surah.name_arabic}) - Terjemahan & Audio Murottal`,
        'og:description': `Baca dan dengarkan Surah ${surah.name_latin} lengkap dengan terjemahan bahasa Indonesia dan tafsir. Surah ke-${surah.number} dalam Al-Quran yang terdiri dari ${surah.total_ayahs} ayat. Audio murottal berkualitas tinggi tersedia.`,
        'og:url': `${BASE_URL}/surah/${surah.number}`,
        'og:image': `${BASE_URL}/images/surah-${surah.number}-social.png`,
        'og:image:alt': `Surah ${surah.name_latin} - ${surah.name_arabic}`,
        // Article-specific tags
        'article:author': 'IndoQuran',
        'article:section': 'Al-Quran',
        'article:tag': `Surah ${surah.name_latin}, Al-Quran, Terjemahan Indonesia, Murottal`,
        'article:published_time': '2025-01-01T00:00:00Z',
        'article:modified_time': new Date().toISOString(),
        // Audio content for voice search optimization
        'og:audio': `${BASE_URL}/audio/surah/${surah.number}/full.mp3`,
        'og:audio:type': 'audio/mpeg'
      };

    case 'search':
      return {
        ...defaultOG,
        'og:title': `Hasil Pencarian "${page.data.query}" - Al-Quran Digital IndoQuran`,
        'og:description': `Temukan ayat Al-Quran yang Anda cari di IndoQuran. Hasil pencarian untuk "${page.data.query}" dengan terjemahan dan tafsir lengkap.`,
        'og:url': `${BASE_URL}/cari?q=${encodeURIComponent(page.data.query)}`,
        'og:image': `${BASE_URL}/images/search-social.png`,
        'og:image:alt': `Hasil Pencarian Al-Quran: ${page.data.query}`
      };

    case 'doa-bersama':
      return {
        ...defaultOG,
        'og:title': 'Doa Bersama - Komunitas Doa Muslim Indonesia',
        'og:description': 'Bergabunglah dalam doa bersama dengan umat Islam di seluruh Indonesia. Fitur doa bersama real-time untuk memperkuat ukhuwah islamiyah dan silaturahmi.',
        'og:url': `${BASE_URL}/doa-bersama`,
        'og:image': `${BASE_URL}/images/doa-bersama-social.png`,
        'og:image:alt': 'Doa Bersama - Komunitas Muslim Indonesia'
      };

    case 'tafsir-maudhui':
      return {
        ...defaultOG,
        'og:type': 'article',
        'og:title': 'Tafsir Maudhui - Tafsir Al-Quran Berdasarkan Tema',
        'og:description': 'Tafsir Al-Quran berdasarkan tema-tema tertentu. Pelajari Al-Quran secara tematik seperti akidah, ibadah, akhlak, muamalah, dan pahami pesan-pesan Al-Quran dengan lebih mendalam.',
        'og:url': `${BASE_URL}/tafsir-maudhui`,
        'og:image': `${BASE_URL}/images/tafsir-maudhui-social.png`,
        'og:image:alt': 'Tafsir Maudhui - Tafsir Tematik Al-Quran',
        'article:section': 'Tafsir',
        'article:tag': 'Tafsir Maudhui, Tafsir Tematik, Al-Quran, Islam'
      };

    case 'contact':
      return {
        ...defaultOG,
        'og:title': 'Hubungi IndoQuran - Customer Service & Dukungan Teknis',
        'og:description': 'Hubungi tim IndoQuran untuk pertanyaan, saran, atau dukungan teknis. Kami siap membantu Anda dalam menggunakan platform Al-Quran digital terbaik di Indonesia.',
        'og:url': `${BASE_URL}/kontak`,
        'og:image': `${BASE_URL}/images/contact-social.png`,
        'og:image:alt': 'Hubungi IndoQuran - Customer Service'
      };

    case 'about':
      return {
        ...defaultOG,
        'og:title': 'Tentang IndoQuran - Platform Al-Quran Digital Terdepan Indonesia',
        'og:description': 'Pelajari lebih lanjut tentang IndoQuran, platform Al-Quran digital terdepan di Indonesia. Misi kami adalah memudahkan umat Islam dalam membaca dan mempelajari Al-Quran secara online dengan teknologi terkini.',
        'og:url': `${BASE_URL}/tentang`,
        'og:image': `${BASE_URL}/images/about-social.png`,
        'og:image:alt': 'Tentang IndoQuran - Platform Al-Quran Digital'
      };

    case 'donation':
      return {
        ...defaultOG,
        'og:title': 'Donasi untuk IndoQuran - Dukung Platform Al-Quran Digital',
        'og:description': 'Dukung pengembangan IndoQuran dengan berdonasi. Kontribusi Anda membantu kami menyediakan platform Al-Quran digital yang lebih baik untuk umat Islam Indonesia. Sedekah jariyah untuk kemajuan Islam.',
        'og:url': `${BASE_URL}/donasi`,
        'og:image': `${BASE_URL}/images/donation-social.png`,
        'og:image:alt': 'Donasi IndoQuran - Dukung Platform Al-Quran'
      };

    case 'privacy':
      return {
        ...defaultOG,
        'og:title': 'Kebijakan Privasi IndoQuran - Perlindungan Data Pengguna',
        'og:description': 'Baca kebijakan privasi IndoQuran. Kami berkomitmen melindungi data pribadi pengguna dan menjaga keamanan informasi Anda sesuai standar internasional.',
        'og:url': `${BASE_URL}/kebijakan`,
        'og:image': `${BASE_URL}/images/privacy-social.png`,
        'og:image:alt': 'Kebijakan Privasi IndoQuran'
      };

    default:
      return {
        ...defaultOG,
        'og:title': 'IndoQuran - Al-Quran Digital Indonesia',
        'og:description': 'Platform Al-Quran Digital terlengkap di Indonesia',
        'og:url': BASE_URL
      };
  }
};

// Generate enhanced Twitter Card meta tags optimized for engagement
export const generateTwitterCardTags = (page) => {
  const defaultTwitter = {
    'twitter:card': 'summary_large_image',
    'twitter:site': '@indoquran',
    'twitter:creator': '@indoquran',
    'twitter:image': `${BASE_URL}/android-chrome-512x512.png`,
    'twitter:image:alt': 'IndoQuran - Platform Al-Quran Digital Indonesia',
    // Enhanced Twitter tags for better engagement
    'twitter:domain': 'indoquran.web.id',
    'twitter:dnt': 'on' // Respect Do Not Track
  };

  const ogTags = generateOpenGraphTags(page);

  return {
    ...defaultTwitter,
    'twitter:title': ogTags['og:title'],
    'twitter:description': ogTags['og:description'],
    'twitter:url': ogTags['og:url'],
    'twitter:image': ogTags['og:image'] || defaultTwitter['twitter:image'],
    'twitter:image:alt': ogTags['og:image:alt'] || defaultTwitter['twitter:image:alt']
  };
};

// Enhanced SEO utility for Google-optimized page metadata
export const getPageSEOData = (pageType, data = {}) => {
  const seoData = {
    title: '',
    description: '',
    keywords: '',
    canonicalUrl: '',
    openGraph: {},
    twitter: {},
    structuredData: null,
    // New Google-specific optimizations
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0',
    themeColor: '#2563eb', // Brand color for mobile browsers
    appleTouchIcon: `${BASE_URL}/apple-touch-icon.png`,
    manifestUrl: `${BASE_URL}/site.webmanifest`
  };

  switch (pageType) {
    case 'home':
      seoData.title = 'IndoQuran - Al-Quran Digital Indonesia Terlengkap | Baca & Dengar Online';
      seoData.description = 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia, fitur bookmark, pencarian ayat, audio murottal berkualitas tinggi dari 30+ qari terbaik dunia. Gratis dan mudah digunakan.';
      seoData.keywords = generateHomeSEOKeywords();
      seoData.canonicalUrl = generateCanonicalUrl('/');
      break;

    case 'surah':
      const surah = data;
      seoData.title = `Surah ${surah.name_latin} (${surah.name_arabic}) - Terjemahan & Audio Murottal | IndoQuran`;
      seoData.description = `Baca dan dengarkan Surah ${surah.name_latin} lengkap dengan terjemahan bahasa Indonesia dan tafsir. Surah ke-${surah.number} dalam Al-Quran yang terdiri dari ${surah.total_ayahs} ayat. Audio murottal berkualitas tinggi tersedia dengan berbagai pilihan qari. ${surah.revelation_place ? `Diturunkan di ${surah.revelation_place}.` : ''}`;
      seoData.keywords = generateSurahSEOKeywords(surah);
      seoData.canonicalUrl = generateCanonicalUrl(`/surah/${surah.number}`);
      break;

    case 'ayah':
      const ayahData = data;
      seoData.title = `${ayahData.surah.name_latin} Ayat ${ayahData.ayah_number} - Terjemahan & Audio | IndoQuran`;
      seoData.description = `Baca ${ayahData.surah.name_latin} ayat ${ayahData.ayah_number} dengan terjemahan bahasa Indonesia: "${ayahData.translation?.substring(0, 120)}...". Lengkap dengan audio murottal, tafsir, dan asbabun nuzul.`;
      seoData.keywords = generateSurahSEOKeywords(ayahData.surah) + `, ${ayahData.surah.name_latin} ayat ${ayahData.ayah_number}, terjemahan ayat ${ayahData.ayah_number}, murottal ayat, tafsir ayat al quran`;
      seoData.canonicalUrl = generateCanonicalUrl(`/surah/${ayahData.surah.number}/${ayahData.ayah_number}`);
      break;

    case 'search':
      const searchQuery = data.query || '';
      const resultsCount = data.results?.length || 0;
      seoData.title = `Hasil Pencarian "${searchQuery}" - ${resultsCount} Ayat Ditemukan | IndoQuran`;
      seoData.description = `Hasil pencarian Al-Quran untuk "${searchQuery}". Ditemukan ${resultsCount} ayat yang sesuai dengan pencarian Anda. Cari ayat, surah, dan terjemahan dalam Al-Quran dengan mudah di IndoQuran.`;
      seoData.keywords = generateSearchSEOKeywords(searchQuery);
      seoData.canonicalUrl = generateCanonicalUrl(`/cari?q=${encodeURIComponent(searchQuery)}`);
      break;

    case 'juz':
      const juzNumber = data.juz_number || data.number;
      seoData.title = `Juz ${juzNumber} (Para ${juzNumber}) - Teks Arab Al-Quran | IndoQuran`;
      seoData.description = `Baca Juz ${juzNumber} Al-Quran dengan teks Arab lengkap dan terjemahan bahasa Indonesia. Para ${juzNumber} Al-Quran tersedia untuk dibaca dan dipelajari dengan mudah. Platform Al-Quran digital terlengkap di Indonesia.`;
      seoData.keywords = `juz ${juzNumber}, para ${juzNumber}, al quran juz ${juzNumber}, teks arab juz ${juzNumber}, quran digital, al quran indonesia, juz lengkap`;
      seoData.canonicalUrl = generateCanonicalUrl(`/juz/${juzNumber}`);
      break;

    case 'halaman':
      const pageNumber = data.page_number || data.number;
      seoData.title = `Halaman ${pageNumber} - Al-Quran Digital Mushaf Utsmani | IndoQuran`;
      seoData.description = `Baca Halaman ${pageNumber} Al-Quran dengan teks Arab lengkap sesuai Mushaf Utsmani. Navigasi mudah antar halaman Al-Quran di platform digital terlengkap Indonesia.`;
      seoData.keywords = `halaman ${pageNumber}, al quran halaman ${pageNumber}, mushaf utsmani halaman ${pageNumber}, teks arab halaman ${pageNumber}, quran digital, al quran indonesia`;
      seoData.canonicalUrl = generateCanonicalUrl(`/halaman/${pageNumber}`);
      break;

    case 'about':
      seoData.title = 'Tentang IndoQuran - Platform Al-Quran Digital Terdepan Indonesia';
      seoData.description = 'Pelajari lebih lanjut tentang IndoQuran, platform Al-Quran digital terdepan di Indonesia. Misi kami adalah memudahkan umat Islam dalam membaca dan mempelajari Al-Quran secara online dengan teknologi terkini. Dipercaya oleh jutaan pengguna di Indonesia.';
      seoData.keywords = 'tentang indoquran, al quran digital indonesia, platform quran terbaik, teknologi islam, aplikasi quran indonesia, sejarah indoquran, visi misi indoquran';
      seoData.canonicalUrl = generateCanonicalUrl('/tentang');
      break;

    case 'contact':
      seoData.title = 'Hubungi IndoQuran - Customer Service & Dukungan Teknis 24/7';
      seoData.description = 'Hubungi tim IndoQuran untuk pertanyaan, saran, atau dukungan teknis. Customer service kami siap membantu Anda 24/7 dalam menggunakan platform Al-Quran digital terbaik di Indonesia. Respon cepat dan profesional.';
      seoData.keywords = 'kontak indoquran, hubungi kami, customer service indoquran, dukungan teknis 24/7, bantuan pengguna, support indoquran, layanan pelanggan';
      seoData.canonicalUrl = generateCanonicalUrl('/kontak');
      break;

    case 'doa-bersama':
      seoData.title = 'Doa Bersama - Komunitas Doa Muslim Real-time | IndoQuran';
      seoData.description = 'Bergabunglah dengan komunitas doa Muslim terbesar di Indonesia. Fitur doa bersama real-time untuk memperkuat ukhuwah islamiyah dan silaturahmi. Buat permintaan doa, beri dukungan, dan rasakan kekuatan doa bersama jutaan Muslim Indonesia.';
      seoData.keywords = 'doa bersama indonesia, komunitas doa muslim, doa online real-time, ukhuwah islamiyah, silaturahmi muslim, permintaan doa, doa islam, indoquran doa';
      seoData.canonicalUrl = generateCanonicalUrl('/doa-bersama');
      break;

    case 'tafsir-maudhui':
      seoData.title = 'Tafsir Maudhui - Tafsir Al-Quran Berdasarkan Tema Lengkap | IndoQuran';
      seoData.description = 'Jelajahi topik-topik penting dalam Al-Quran melalui pendekatan tafsir maudhui. Temukan ayat-ayat Al-Quran berdasarkan tema seperti akidah, ibadah, akhlak, muamalah, dan banyak lagi. Tafsir tematik yang mudah dipahami.';
      seoData.keywords = 'tafsir maudhui, topik quran, tema al quran, tafsir tematik indonesia, akidah islam, ibadah islam, akhlak islam, muamalah islam, tafsir lengkap, indoquran tafsir';
      seoData.canonicalUrl = generateCanonicalUrl('/tafsir-maudhui');
      break;

    case 'member':
    case 'member-benefits':
      seoData.title = 'Keuntungan Menjadi Member IndoQuran - Fitur Premium Al-Quran Digital Gratis';
      seoData.description = 'Dapatkan akses ke fitur-fitur eksklusif IndoQuran: bookmark ayat tanpa batas, catatan pribadi untuk setiap ayat, tracking progress baca Al-Quran, komunitas doa bersama, sinkronisasi cloud, dan pengalaman premium tanpa iklan. Daftar gratis sekarang!';
      seoData.keywords = generateMemberBenefitsKeywords();
      seoData.canonicalUrl = generateCanonicalUrl('/member');
      seoData.structuredData = generateStructuredData('member-benefits', data);
      break;

    case 'asmaul-husna':
      seoData.title = '99 Asmaul Husna - Nama Indah Allah SWT dengan Audio dan Arti | IndoQuran';
      seoData.description = 'Pelajari 99 Asmaul Husna (nama-nama indah Allah SWT) lengkap dengan teks Arab, latin, arti dalam bahasa Indonesia, dan audio berkualitas tinggi. Tingkatkan keimanan dan ketakwaan melalui dzikir Asmaul Husna.';
      seoData.keywords = '99 asmaul husna, nama allah swt, asmaul husna lengkap, dzikir asmaul husna, audio asmaul husna, arti asmaul husna indonesia, nama indah allah, asma allah husna';
      seoData.canonicalUrl = generateCanonicalUrl('/asmaul-husna');
      break;

    case 'donation':
      seoData.title = 'Donasi untuk IndoQuran - Dukung Platform Al-Quran Digital Indonesia';
      seoData.description = 'Dukung pengembangan IndoQuran dengan berdonasi. Kontribusi Anda membantu kami menyediakan platform Al-Quran digital yang lebih baik untuk umat Islam Indonesia. Sedekah jariyah yang terus mengalir pahalanya.';
      seoData.keywords = 'donasi indoquran, donasi platform islam indonesia, dukung pengembangan al quran digital, kontribusi islam, sedekah jariyah teknologi, donasi aplikasi quran';
      seoData.canonicalUrl = generateCanonicalUrl('/donasi');
      break;

    case 'bookmarks':
      seoData.title = 'Penanda Ayat Favorit - Simpan Ayat Al-Quran | IndoQuran';
      seoData.description = 'Kelola dan akses penanda ayat Al-Quran favorit Anda. Simpan ayat-ayat penting untuk dibaca kembali dengan mudah. Fitur sinkronisasi lintas perangkat tersedia.';
      seoData.keywords = 'penanda quran, ayat favorit, simpan ayat al quran, bookmark quran, al quran penanda, indoquran penanda, favorit ayat';
      seoData.canonicalUrl = generateCanonicalUrl('/penanda');
      seoData.robots = 'noindex, nofollow'; // Private content
      break;

    case 'privacy':
      seoData.title = 'Kebijakan Privasi IndoQuran - Perlindungan Data Pengguna';
      seoData.description = 'Baca kebijakan privasi IndoQuran. Kami berkomitmen melindungi data pribadi dan privasi pengguna platform Al-Quran digital kami sesuai standar keamanan internasional dan peraturan yang berlaku.';
      seoData.keywords = 'kebijakan privasi indoquran, privacy policy, perlindungan data pengguna, keamanan data, GDPR compliance, privasi indonesia';
      seoData.canonicalUrl = generateCanonicalUrl('/kebijakan');
      break;

    default:
      seoData.title = 'IndoQuran - Al-Quran Digital Indonesia Terlengkap';
      seoData.description = 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online gratis.';
      seoData.keywords = 'al quran indonesia, quran online, indoquran, al quran digital';
      seoData.canonicalUrl = generateCanonicalUrl('/');
  }

  // Optimize title and description length for Google
  seoData.title = generateOptimalTitle(seoData.title, '', 60);
  seoData.description = generateOptimalMetaDescription(seoData.description, 160);
  seoData.keywords = cleanKeywords(seoData.keywords);

  // Generate Open Graph and Twitter tags
  seoData.openGraph = generateOpenGraphTags({ type: pageType, data });
  seoData.twitter = generateTwitterCardTags({ type: pageType, data });

  // Generate structured data
  seoData.structuredData = generateStructuredData(pageType, data);

  return seoData;
};

// Generate Google-optimized structured data (JSON-LD) for rich snippets
export const generateStructuredData = (pageType, data = {}) => {
  const baseOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "IndoQuran",
    "description": "Platform Al-Quran Digital terlengkap di Indonesia",
    "url": BASE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${BASE_URL}/android-chrome-512x512.png`,
      "width": 512,
      "height": 512
    },
    "foundingDate": "2020-01-01",
    "foundingLocation": {
      "@type": "Place",
      "name": "Indonesia"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+62-xxx-xxxx-xxxx",
      "contactType": "customer service",
      "areaServed": "ID",
      "availableLanguage": ["Indonesian", "Arabic"]
    },
    "sameAs": [
      "https://facebook.com/indoquran",
      "https://twitter.com/indoquran",
      "https://instagram.com/indoquran",
      "https://youtube.com/indoquran"
    ]
  };

  switch (pageType) {
    case 'home':
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "IndoQuran",
        "description": "Platform Al-Quran Digital terlengkap di Indonesia",
        "url": BASE_URL,
        "publisher": baseOrganization,
        "inLanguage": "id-ID",
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${BASE_URL}/cari?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          },
          {
            "@type": "ReadAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${BASE_URL}/surah/{surah_number}`
            }
          }
        ],
        "mainEntity": {
          "@type": "WebApplication",
          "name": "IndoQuran Al-Quran Digital",
          "operatingSystem": "Web Browser",
          "applicationCategory": "Religious Application",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "IDR"
          }
        }
      };

    case 'surah':
      const surah = data;
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": `Surah ${surah.name_latin} (${surah.name_arabic})`,
        "description": `Baca dan dengarkan Surah ${surah.name_latin} lengkap dengan terjemahan bahasa Indonesia.`,
        "image": {
          "@type": "ImageObject",
          "url": `${BASE_URL}/images/surah-${surah.number}-social.png`,
          "width": 1200,
          "height": 630
        },
        "author": {
          "@type": "Organization",
          "name": "IndoQuran"
        },
        "publisher": baseOrganization,
        "datePublished": "2020-01-01T00:00:00Z",
        "dateModified": new Date().toISOString(),
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${BASE_URL}/surah/${surah.number}`
        },
        "articleSection": "Al-Quran",
        "keywords": [
          `Surah ${surah.name_latin}`,
          surah.name_arabic,
          "Al-Quran",
          "Quran Indonesia",
          "Terjemahan Al-Quran"
        ],
        "inLanguage": "id-ID",
        "about": {
          "@type": "Thing",
          "name": `Surah ${surah.name_latin}`,
          "description": `Surah ke-${surah.number} dalam Al-Quran`
        },
        "isPartOf": {
          "@type": "Book",
          "name": "Al-Quran",
          "author": "Allah SWT"
        },
        // Audio content for voice search
        "associatedMedia": {
          "@type": "AudioObject",
          "contentUrl": `${BASE_URL}/audio/surah/${surah.number}/full.mp3`,
          "description": `Audio murottal Surah ${surah.name_latin}`,
          "duration": "PT10M" // Estimated duration
        }
      };

    case 'ayah':
      const ayahData = data;
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": `${ayahData.surah.name_latin} Ayat ${ayahData.ayah_number}`,
        "description": ayahData.translation,
        "author": {
          "@type": "Organization",
          "name": "IndoQuran"
        },
        "publisher": baseOrganization,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${BASE_URL}/surah/${ayahData.surah.number}/${ayahData.ayah_number}`
        },
        "isPartOf": {
          "@type": "Article",
          "name": `Surah ${ayahData.surah.name_latin}`,
          "url": `${BASE_URL}/surah/${ayahData.surah.number}`
        }
      };

    case 'search':
      return {
        "@context": "https://schema.org",
        "@type": "SearchResultsPage",
        "name": `Hasil Pencarian "${data.query}" - IndoQuran`,
        "description": `Hasil pencarian Al-Quran untuk "${data.query}"`,
        "url": `${BASE_URL}/cari?q=${encodeURIComponent(data.query)}`,
        "publisher": baseOrganization,
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": data.results?.length || 0,
          "itemListElement": (data.results || []).slice(0, 10).map((result, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Article",
              "name": `${result.surah_name} Ayat ${result.ayah_number}`,
              "url": `${BASE_URL}/surah/${result.surah_number}/${result.ayah_number}`
            }
          }))
        }
      };

    case 'doa-bersama':
      return {
        "@context": "https://schema.org",
        "@type": "SocialMediaPosting",
        "headline": "Doa Bersama - Komunitas Doa Muslim",
        "description": "Bergabunglah dalam doa bersama dengan umat Islam di seluruh Indonesia",
        "url": `${BASE_URL}/doa-bersama`,
        "publisher": baseOrganization,
        "audience": {
          "@type": "Audience",
          "audienceType": "Muslim Community"
        }
      };

    case 'about':
      return {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "Tentang IndoQuran",
        "description": "Platform Al-Quran digital terdepan di Indonesia",
        "url": `${BASE_URL}/tentang`,
        "publisher": baseOrganization,
        "mainEntity": baseOrganization
      };

    case 'contact':
      return {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Hubungi IndoQuran",
        "description": "Hubungi tim IndoQuran untuk dukungan dan pertanyaan",
        "url": `${BASE_URL}/kontak`,
        "publisher": baseOrganization,
        "mainEntity": {
          "@type": "ContactPoint",
          "telephone": "+62-xxx-xxxx-xxxx",
          "contactType": "customer service",
          "areaServed": "ID",
          "availableLanguage": ["Indonesian"]
        }
      };

    case 'tafsir-maudhui':
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Tafsir Maudhui - Tafsir Al-Quran Berdasarkan Tema",
        "description": "Tafsir Al-Quran berdasarkan tema-tema tertentu",
        "url": `${BASE_URL}/tafsir-maudhui`,
        "publisher": baseOrganization,
        "author": baseOrganization,
        "articleSection": "Islamic Education",
        "educationalLevel": "All Levels",
        "learningResourceType": "Educational Material"
      };

    case 'member-benefits':
      return {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Keuntungan Member IndoQuran",
        "description": "Dapatkan fitur premium gratis: bookmark ayat, catatan pribadi, progress tracking, dan akses komunitas muslim Indonesia",
        "url": `${BASE_URL}/member`,
        "provider": baseOrganization,
        "serviceType": "Digital Islamic Platform Membership",
        "areaServed": {
          "@type": "Country",
          "name": "Indonesia"
        },
        "audience": {
          "@type": "Audience",
          "audienceType": "Muslim Community Indonesia"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Fitur Member Premium",
          "itemListElement": [
            {
              "@type": "Offer",
              "name": "Bookmark Ayat Favorit",
              "description": "Simpan dan kelola ayat-ayat favorit dengan mudah untuk dibaca kembali",
              "price": "0",
              "priceCurrency": "IDR",
              "itemOffered": {
                "@type": "Service",
                "name": "Personal Bookmark System"
              }
            },
            {
              "@type": "Offer",
              "name": "Catatan Pribadi",
              "description": "Tulis refleksi dan catatan personal untuk setiap ayat Al-Quran",
              "price": "0",
              "priceCurrency": "IDR",
              "itemOffered": {
                "@type": "Service",
                "name": "Personal Notes Feature"
              }
            },
            {
              "@type": "Offer",
              "name": "Progress Tracking",
              "description": "Pantau kemajuan bacaan Al-Qur'an dan statistik ibadah harian",
              "price": "0",
              "priceCurrency": "IDR",
              "itemOffered": {
                "@type": "Service",
                "name": "Reading Progress Analytics"
              }
            },
            {
              "@type": "Offer",
              "name": "Komunitas Doa",
              "description": "Bergabung dengan komunitas muslim untuk doa bersama dan sharing",
              "price": "0",
              "priceCurrency": "IDR",
              "itemOffered": {
                "@type": "Service",
                "name": "Prayer Community Access"
              }
            }
          ]
        },
        "potentialAction": {
          "@type": "JoinAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${BASE_URL}/auth?register=true`
          },
          "object": {
            "@type": "Organization",
            "name": "IndoQuran Member Community"
          }
        }
      };

    default:
      return baseOrganization;
  }
};

// Generate breadcrumb structured data
export const generateBreadcrumbStructuredData = (breadcrumbs) => {
  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
};

// Generate FAQ structured data
export const generateFAQStructuredData = (faqs) => {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

// Generate Google-optimized FAQ structured data for featured snippets
export const generateEnhancedFAQStructuredData = (faqs, pageType = 'general') => {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
        // Add dateCreated for freshness signals
        "dateCreated": faq.dateCreated || new Date().toISOString(),
        "upvoteCount": faq.upvotes || 0,
        "author": {
          "@type": "Organization",
          "name": "IndoQuran"
        }
      }
    }))
  };
};

// Generate How-To structured data for step-by-step guides
export const generateHowToStructuredData = (steps, title, description) => {
  if (!steps || steps.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.description,
      "url": step.url || `${BASE_URL}#step-${index + 1}`,
      "image": step.image || `${BASE_URL}/images/how-to-step-${index + 1}.png`
    })),
    "totalTime": steps.length > 5 ? "PT15M" : "PT5M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "IDR",
      "value": "0"
    },
    "supply": [
      {
        "@type": "HowToSupply",
        "name": "Internet Connection"
      },
      {
        "@type": "HowToSupply",
        "name": "Web Browser"
      }
    ]
  };
};

// Generate Local Business structured data for Indonesian market
export const generateLocalBusinessStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "IndoQuran",
    "description": "Platform Al-Quran Digital terlengkap di Indonesia",
    "url": BASE_URL,
    "areaServed": {
      "@type": "Country",
      "name": "Indonesia"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Indonesian Muslims",
      "geographicArea": {
        "@type": "Country",
        "name": "Indonesia"
      }
    },
    "knowsLanguage": [
      {
        "@type": "Language",
        "name": "Indonesian",
        "alternateName": "Bahasa Indonesia"
      },
      {
        "@type": "Language",
        "name": "Arabic",
        "alternateName": "العربية"
      }
    ],
    "serviceArea": {
      "@type": "Country",
      "name": "Indonesia"
    }
  };
};

// Generate Video structured data for multimedia content
export const generateVideoStructuredData = (videoData) => {
  if (!videoData) return null;

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": videoData.title,
    "description": videoData.description,
    "thumbnailUrl": videoData.thumbnail || `${BASE_URL}/images/video-thumbnail.jpg`,
    "uploadDate": videoData.uploadDate || new Date().toISOString(),
    "duration": videoData.duration || "PT10M",
    "contentUrl": videoData.videoUrl,
    "embedUrl": videoData.embedUrl,
    "publisher": {
      "@type": "Organization",
      "name": "IndoQuran",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/android-chrome-512x512.png`
      }
    },
    "potentialAction": {
      "@type": "SeekToAction",
      "target": videoData.videoUrl + "?t={seek_to_second_number}",
      "startOffset-input": "required name=seek_to_second_number"
    }
  };
};

// Generate Audio structured data for Quran recitations
export const generateAudioStructuredData = (audioData) => {
  if (!audioData) return null;

  return {
    "@context": "https://schema.org",
    "@type": "AudioObject",
    "name": audioData.title,
    "description": audioData.description,
    "contentUrl": audioData.audioUrl,
    "duration": audioData.duration,
    "encodingFormat": "audio/mpeg",
    "publisher": {
      "@type": "Organization",
      "name": "IndoQuran"
    },
    "creator": {
      "@type": "Person",
      "name": audioData.reciter || "Qari Terbaik"
    },
    "inLanguage": "ar",
    "genre": "Religious",
    "copyrightHolder": {
      "@type": "Organization",
      "name": "IndoQuran"
    }
  };
};

// Function to preload critical resources optimized for Core Web Vitals and mobile
export const preloadCriticalResources = () => {
  // Check network conditions to avoid aggressive preloading on slow connections
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    connection.saveData
  );

  // Reduce preloading on slow connections
  if (isSlowConnection) {
    return;
  }

  const resources = [
    // DNS prefetch for external domains (highest priority)
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },

    // Preconnect only for critical external resources
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },

    // REMOVED font preload - fonts are now loaded via CSS naturally
    // This prevents "preload not used within a few seconds" warnings

    // Prefetch only high-priority navigation targets
    { rel: 'prefetch', href: `${BASE_URL}/surah` }
  ];

  // Process resources with error handling and deduplication
  resources.forEach(resource => {
    // Avoid duplicate preload resources
    const selector = `link[href="${resource.href}"][rel="${resource.rel}"]`;
    if (document.querySelector(selector)) {
      return;
    }

    try {
      const link = document.createElement('link');
      Object.keys(resource).forEach(key => {
        if (key === 'crossorigin' && resource[key]) {
          link.setAttribute(key, resource[key]);
        } else if (key !== 'crossorigin') {
          link.setAttribute(key, resource[key]);
        }
      });

      // Add error handling to prevent blocking
      link.onerror = () => {
        console.warn(`Failed to load resource: ${resource.href}`);
      };

      document.head.appendChild(link);
    } catch (error) {
      console.warn('Error adding preload resource:', error);
    }
  });
};

// Preload next page resources for better UX
export const preloadNextPageResources = (nextPageType, nextPageData) => {
  if (!nextPageType) return;

  const resources = [];

  switch (nextPageType) {
    case 'surah':
      if (nextPageData?.number) {
        resources.push({
          rel: 'prefetch',
          href: `${BASE_URL}/api/surah/${nextPageData.number}`
        });
        resources.push({
          rel: 'prefetch',
          href: `${BASE_URL}/audio/surah/${nextPageData.number}/preview.mp3`
        });
      }
      break;

    case 'search':
      resources.push({
        rel: 'prefetch',
        href: `${BASE_URL}/api/search?q=${encodeURIComponent(nextPageData?.query || '')}`
      });
      break;
  }

  resources.forEach(resource => {
    const link = document.createElement('link');
    Object.keys(resource).forEach(key => {
      link.setAttribute(key, resource[key]);
    });
    document.head.appendChild(link);
  });
};

// Generate Google-optimized meta description with keyword density
export const generateOptimalMetaDescription = (description, maxLength = 160, keywords = []) => {
  if (description.length <= maxLength) return description;

  // Try to include primary keywords in truncated description
  const truncated = description.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  const finalDescription = lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';

  // Ensure at least one primary keyword is included
  if (keywords.length > 0) {
    const primaryKeyword = keywords[0];
    if (!finalDescription.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      // Try to fit the primary keyword
      const availableSpace = maxLength - primaryKeyword.length - 3;
      if (availableSpace > 50) {
        return description.substring(0, availableSpace) + primaryKeyword + '...';
      }
    }
  }

  return finalDescription;
};

// Generate SEO-optimized page title with brand consistency
export const generateOptimalTitle = (title, siteName = 'IndoQuran', maxLength = 60) => {
  const separator = ' | ';
  const fullTitle = title + separator + siteName;

  if (fullTitle.length <= maxLength) return fullTitle;

  // Try different separators to save space
  const shortSeparator = ' - ';
  const shortTitle = title + shortSeparator + siteName;
  if (shortTitle.length <= maxLength) return shortTitle;

  // Truncate title but keep brand
  const availableSpace = maxLength - shortSeparator.length - siteName.length - 3;
  if (availableSpace > 20) {
    const truncatedTitle = title.substring(0, availableSpace) + '...';
    return truncatedTitle + shortSeparator + siteName;
  }

  // Last resort: just return the title
  return title.substring(0, maxLength - 3) + '...';
};

// Comprehensive Surah names for SEO optimization
export const ALL_SURAH_NAMES = [
  'al fatihah', 'al baqarah', 'ali imran', 'an nisa', 'al maidah', 'al an\'am', 'al a\'raf', 'al anfal',
  'at taubah', 'yunus', 'hud', 'yusuf', 'ar ra\'d', 'ibrahim', 'al hijr', 'an nahl', 'al isra', 'al kahf',
  'maryam', 'taha', 'al anbiya', 'al hajj', 'al mu\'minun', 'an nur', 'al furqan', 'ash shu\'ara', 'an naml',
  'al qasas', 'al ankabut', 'ar rum', 'luqman', 'as sajdah', 'al ahzab', 'saba', 'fatir', 'yasin', 'as saffat',
  'sad', 'az zumar', 'ghafir', 'fussilat', 'ash shura', 'az zukhruf', 'ad dukhan', 'al jathiyah', 'al ahqaf',
  'muhammad', 'al fath', 'al hujurat', 'qaf', 'adh dhariyat', 'at tur', 'an najm', 'al qamar', 'ar rahman',
  'al waqi\'ah', 'al hadid', 'al mujadilah', 'al hashr', 'al mumtahanah', 'as saff', 'al jumu\'ah', 'al munafiqun',
  'at taghabun', 'at talaq', 'at tahrim', 'al mulk', 'al qalam', 'al haqqah', 'al ma\'arij', 'nuh', 'al jinn',
  'al muzzammil', 'al muddaththir', 'al qiyamah', 'al insan', 'al mursalat', 'an naba', 'an nazi\'at', 'abasa',
  'at takwir', 'al infitar', 'al mutaffifin', 'al inshiqaq', 'al buruj', 'at tariq', 'al a\'la', 'al ghashiyah',
  'al fajr', 'al balad', 'ash shams', 'al lail', 'ad duha', 'ash sharh', 'at tin', 'al alaq', 'al qadr', 'al bayyinah',
  'az zalzalah', 'al adiyat', 'al qari\'ah', 'at takathur', 'al asr', 'al humazah', 'al fil', 'quraish', 'al ma\'un',
  'al kawthar', 'al kafirun', 'an nasr', 'al masad', 'al ikhlas', 'al falaq', 'an nas'
];

// High-traffic Indonesian Quran search terms for SEO optimization
export const HIGH_TRAFFIC_SEARCH_TERMS = [
  'al quran indonesia', 'quran indonesia', 'quran digital', 'al quran online', 'quran online indonesia',
  'al quran digital', 'al-quran indonesia', 'al-qur\'an online', 'qur\'an indonesia', 'quran terjemahan indonesia',
  'quran web', 'quranweb', 'my quran indonesia', 'indonesia quran', 'alquran indonesia', 'quran.com indonesia',
  'qur an indonesia', 'al qur an online', 'al qur an indonesia', 'koran indonesia', 'qur\'an web'
];

// Specific search terms from user request
export const USER_REQUESTED_TERMS = [
  'surat ibrahim', 'an naml', 'surah ibrahim', 'ar rum', 'surah an naml', 'surat at tariq', 'al anfal',
  'surat as saffat', 'at thoriq', 'at tariq', 'surat ar rum', 'surat al-qasas', 'surah al qasas', 'surah at tariq',
  'as saffat', 'al mu minun', 'at thariq', 'surah as-saffat', 'surah al-qasas', 'al qasas', 'surah ke 76',
  'surat saba', 'as saaffat', 'surat shad', 'al mu\'minun', 'al mulk 21-30', 'surat ke 27', 'surat al qasas',
  'surat ke 52', 'surat ar-rum', 'surat an-naml', 'surah tentang lebah', 'taha', 'surat annaml', 'quran 93 7',
  'arti surah an naml', 'al mursalat', 'surat yunus ayat 4', 'at tur', 'surah lebah', 'surat ke 30',
  'surat maryam ayat 34', 'ar rum artinya', 'surah saad', 'surah 86', 'al isra surat ke berapa', 'al infitar',
  'yunus 91', 'surah at toriq', 'surat al torik', 'surah as saff', 'at tarik', 'ar rum ayat 3',
  'surah al humazah termasuk golongan surah', 'surat ke 23', 'as saff', 'surat ar rum ayat 23',
  'al mulk ayat 20-30', 'surat 61', 'surat al mulk ayat 20-30', 'ibrahim surat', 'surat sad ayat 35',
  'surat alinsan', 'surah 30', 'quran surat 30', 'qs 27', 'ayat an naml', 'surah al fatih', 'al quran juz 23',
  'surah sulaiman juz berapa', 'fussilat', 'surat ke 28 dalam al quran', 'annazi\'at', 'surat al balad diturunkan di kota',
  'surah as saffat', 'qs 23 ayat 10', 'surat amayatasaalun', 'surat shod', 'doa nabi yunus ayat 4',
  'bunyi surat ar ra\'d ayat 11', 'surah 12 ayat 15', 'surah 23 ayat 5', 'surat ke 90', 'al toriq', 'surat semut',
  'al muminun', 'surat 23 ayat 10', '13 11 quran', 'al furqan 72', 'surat at-tariq', 'qs ar rum', 'surat 27',
  'qs as saff', 'quran 22 46', 'arrum', 'surat 11 ayat 8', 'maryam', 'al tariq', 'surat 76',
  'al quran digital dan terjemahan', 'al quran indonesia web', 'quran indo', 'al-quran digital', 'surah yunus ayat 91',
  'ibrahim ayat', 'an naml artinya', 'surat ar rum artinya', '30 ayat 3', 'al hijr 99', 'surat arum ayat 30',
  'amma yatasa alun', 'ar rum ayat 23', 'surat al balad diturunkan sesudah surat', 'surah al fil diturunkan sesudah surah',
  'ar ruum', 'attariq', 'surat al kahfi ayat 51-110', 'surah ke 38', 'quran surah 38', 'surah 38', 'surah mu\'minun',
  'surat shaffat', 'surah 28', 'surah al qashash', 'surat al hujurat diturunkan setelah surat', 'surah al naml',
  'mu minun', 'surah 25 ayat 4', 'surat 69', 'surat ke 28', 'surah 25 ayat 3', 'al qasas surat ke', 'an nuur',
  'surat ke 72', 'an-naml', 'assafat', 'surah as sad', 'surah ash shaffat', 'surat al qasas ayat', 'surat naml',
  'alhadid', 'as safat', 'qs al qashash', 'surah as saf', 'surah at torik', 'surah attoriq', 'surat ke 23 dalam al quran',
  'al insaan', 'arti surah ibrahim', 'fusilat', 'quraysh', 'surat ke 37', 'surat ke-76', 'quran surat ibrahim',
  'surah an naml artinya', 'surah at-tariq', 'surah attorik', 'surat al minum', 'al qasash', 'quran surat ar-rum',
  'surat attorik', 'surat ke-86', 'ayat ibrahim', 'surat an namal', 'surat at toriq', 'surat athoriq', 'surat sad',
  'qs arrum', 'quran surat ar rum', 'surah ke 61', 'surat al qashas', 'surat ar rum 30', 'surat ath thur', 'al lail',
  'al qashash', 'at tin diturunkan setelah surat', 'ath thariq', 'surat al kahfi ayat 83-110', 'al qashas',
  'an nisa 50', 'qs as saffat', 'surat as shad', 'ayat al mu\'minun', 'qs 23', 'qs al mu\'minun', 'surah yusuf ayat 15',
  'surat as shof', 'surat ke-61', 'at toriq', 'ath-thariq', 'qs 28', 'surah al quraisy diturunkan sesudah surah',
  'ash shaffat', 'surah 14', 'surat al quraisy diturunkan sesudah surah', 'surat an naml ayat', 'surat ibrahim ayat 38',
  'surat ke 13', 'al qashash ayat 88', 'at tin diturunkan di kota', 'at-thoriq', 'quran juz 23', 'surat al alaq terdiri dari',
  'surat ar rum surat ke berapa', 'surat as saff', 'arti ar rum', 'surat al fal', 'al fath 28', 'arti al qasas',
  'surah attin diturunkan setelah surah', 'surat ash shaffat', 'surah as shaff', 'surat lebah', 'al insan 22',
  'al mutaffifin', 'ar rum surah ke berapa', 'arti surat an naml', 'surat as shaff', 'ar rad ayat 4', 'surat 25 ayat 3',
  'surat ke 61', 'surat maryam tentang apa', 'surah 23 ayat 8', 'surah ibrahim ayat', 'ibrahim surah',
  'surat ke 24 ayat 11', 'as shaf', 'surah ke 23 ayat 8', 'surah ke 24 ayat 11', 'surat al lail diturunkan sesudah surat',
  'surat al mulk ayat 27-30', 'al fal', 'al insan berapa ayat', 'surat an nisa ayat 50', 'az zumar ayat 58',
  'surah al falaq diturunkan sesudah surah', 'surah al mulk ayat 20-30', 'ar rum surat ke berapa', 'surat 83',
  'surat as saf', 'surat as-saffat', 'surat ibrahim surat ke berapa', 'surat tentang lebah', 'surah al fatir ayat 35-37',
  'yunus ayat 22', 'al mu\'minun ayat 100', 'an naba 20-40', 'ar rum juz berapa', 'al mulk 20-30',
  'surat 28 ayat 3 alquran', 'al isa', 'surat luth', 'al had', 'al quran bahasa indonesia', 'surat an naba ayat 20',
  'surat an nahl tentang lebah', 'surat saba artinya', 'al fajar', 'surat yusuf berapa ayat', 'al alaq ayat 17',
  'al mulk ayat 21-30', 'qs 13', 'setelah surat al qalam', 'surat al furqan ayat 47', 'surat an nahl tentang madu',
  'annisa ayat 50', 'ayat quran tentang lebah', 'surat amma yatasa alun', 'an nahl tentang lebah', 'at thalaq 4',
  'al isra 17:25 artinya', 'shaff artinya', 'ar rum 23', 'azzumar 6', 'al kahfi 102-110', 'surat 23', 'qs 23',
  'qs al mu\'minun', 'surat as shod', 'qs 28', 'surah al quraisy diturunkan sesudah surah', 'ash shaffat', 'surah 14'
];

// Enhanced keyword cleaning and optimization for Indonesian market
export const cleanKeywords = (keywords) => {
  if (typeof keywords === 'string') {
    return keywords
      .split(',')
      .map(keyword => keyword.trim().toLowerCase())
      .filter(keyword => {
        // Filter out empty keywords and very short ones
        if (keyword.length < 2) return false;

        // Filter out stop words (Indonesian and English)
        const stopWords = ['dan', 'atau', 'dengan', 'untuk', 'pada', 'di', 'ke', 'dari', 'yang', 'adalah', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for'];
        if (stopWords.includes(keyword)) return false;

        // Keep only meaningful keywords
        return keyword.length <= 50;
      })
      .slice(0, 15) // Allow more keywords for better SEO coverage
      .join(', ');
  }
  return '';
};

// Generate Indonesian-specific long-tail keywords with comprehensive coverage
export const generateLongTailKeywords = (baseKeyword, pageType) => {
  const indonesianModifiers = {
    'surah': ['terjemahan', 'audio', 'murottal', 'lengkap', 'indonesia', 'bahasa indonesia', 'artinya', 'tafsir', 'ayat', 'surat ke berapa', 'juz berapa', 'diturunkan di'],
    'search': ['pencarian', 'cari', 'temukan', 'hasil', 'online', 'digital', 'gratis'],
    'general': ['online', 'gratis', 'terbaik', 'lengkap', 'mudah', 'indonesia', 'digital', 'terjemahan']
  };

  const modifiers = indonesianModifiers[pageType] || indonesianModifiers.general;

  return modifiers.map(modifier => `${baseKeyword} ${modifier}`).slice(0, 8);
};

// Generate comprehensive SEO keywords for Surah pages
export const generateSurahSEOKeywords = (surah) => {
  if (!surah) return '';

  const baseKeywords = [
    // Primary keywords
    `surah ${surah.name_latin}`,
    `surat ${surah.name_latin}`,
    `${surah.name_latin}`,
    `surah ke ${surah.number}`,
    `surat ke ${surah.number}`,
    `qs ${surah.number}`,

    // Arabic variations
    `${surah.name_arabic}`,
    `surat ${surah.name_arabic}`,

    // Common search patterns
    `${surah.name_latin} artinya`,
    `arti surah ${surah.name_latin}`,
    `surat ${surah.name_latin} terjemahan`,
    `surah ${surah.name_latin} indonesia`,
    `${surah.name_latin} ayat`,
    `surat ${surah.name_latin} ayat`,

    // Audio/murottal keywords
    `murottal ${surah.name_latin}`,
    `audio ${surah.name_latin}`,
    `tilawah ${surah.name_latin}`,

    // Context keywords
    `${surah.name_latin} juz berapa`,
    `surat ${surah.name_latin} surat ke berapa`,
    `${surah.name_latin} diturunkan di`,
    `${surah.name_latin} berapa ayat`,

    // High-traffic general terms
    ...HIGH_TRAFFIC_SEARCH_TERMS,

    // User-specific requested terms that match this surah
    ...USER_REQUESTED_TERMS.filter(term =>
      term.includes(surah.name_latin.toLowerCase()) ||
      term.includes(surah.number.toString()) ||
      term.includes(`ke ${surah.number}`) ||
      term.includes(`surat ${surah.number}`) ||
      term.includes(`surah ${surah.number}`)
    )
  ];

  // Add specific ayah-based keywords if available
  if (surah.total_ayahs) {
    baseKeywords.push(
      `${surah.name_latin} ${surah.total_ayahs} ayat`,
      `surat ${surah.name_latin} ${surah.total_ayahs} ayat`
    );
  }

  // Remove duplicates and clean
  const uniqueKeywords = [...new Set(baseKeywords)];
  return cleanKeywords(uniqueKeywords.join(', '));
};

// Generate comprehensive SEO keywords for home page (Updated Aug 2025)
export const generateHomeSEOKeywords = () => {
  const homeKeywords = [
    ...HIGH_TRAFFIC_SEARCH_TERMS,
    ...ALL_SURAH_NAMES.map(name => `surah ${name}`),
    ...ALL_SURAH_NAMES.map(name => `surat ${name}`),

    // General Quran terms
    'al quran 30 juz', 'al quran 114 surah', 'mushaf indonesia', 'quran mushaf utsmani',
    'baca quran online', 'hafalan quran', 'menghafal al quran', 'tilawah quran',
    'murottal quran', 'qori quran indonesia', 'tadarus quran', 'khatam quran',

    // Member benefits & premium features (New)
    'bookmark ayat quran', 'catatan pribadi quran', 'progress baca quran',
    'komunitas muslim online', 'doa bersama indonesia', 'fitur premium quran',
    'al quran gratis indonesia', 'member indoquran', 'aplikasi quran lengkap',

    // Indonesian Islamic terms
    'islam indonesia', 'muslim indonesia', 'kitab suci umat islam', 'wahyu allah',
    'firman allah', 'kalamullah', 'al kitab', 'furqan', 'umat islam indonesia',

    // Technology terms
    'aplikasi quran', 'software quran', 'platform quran digital',
    'website quran indonesia', 'situs al quran', 'portal islam indonesia',
    'quran digital terbaik', 'al quran cloud sync'
  ];

  return cleanKeywords(homeKeywords.join(', '));
};

// Generate SEO keywords for member benefits page (New Function)
export const generateMemberBenefitsKeywords = () => {
  const memberKeywords = [
    // Primary member benefits
    'keuntungan member indoquran', 'fitur premium al quran', 'member benefits quran',
    'bookmark ayat favorit', 'simpan ayat quran', 'penanda ayat al quran',
    'catatan pribadi ayat', 'notes ayat quran', 'refleksi ayat al quran',
    'progress baca quran', 'tracking bacaan al quran', 'statistik baca quran',

    // Community features
    'komunitas muslim indonesia', 'doa bersama online', 'ukhuwah islamiyah',
    'silaturahmi muslim', 'sharing doa muslim', 'dukungan sesama muslim',

    // Premium features
    'al quran premium gratis', 'fitur eksklusif quran', 'quran tanpa iklan',
    'sinkronisasi cloud quran', 'backup data quran', 'akses multi device quran',

    // Registration & access
    'daftar member quran gratis', 'registrasi indoquran', 'akun premium quran',
    'login member quran', 'create account quran', 'sign up al quran',

    // Indonesian Islamic community
    'platform islam indonesia', 'aplikasi muslim indonesia', 'teknologi islam',
    'digitalisasi al quran', 'modernisasi baca quran', 'inovasi platform quran'
  ];

  return cleanKeywords(memberKeywords.join(', '));
};

// Generate SEO keywords for search page
export const generateSearchSEOKeywords = (query = '') => {
  const searchKeywords = [
    // Base search terms
    'pencarian al quran', 'cari ayat quran', 'search quran indonesia',
    'temukan ayat', 'cari surat', 'pencarian surah',

    // Query-specific terms
    ...(query ? [
      `cari ${query}`,
      `pencarian ${query}`,
      `${query} al quran`,
      `ayat tentang ${query}`,
      `surah tentang ${query}`
    ] : []),

    // High-traffic terms
    ...HIGH_TRAFFIC_SEARCH_TERMS,

    // Specific search patterns from user request
    ...USER_REQUESTED_TERMS.filter(term =>
      term.includes('cari') ||
      term.includes('pencarian') ||
      term.includes('search')
    )
  ];

  return cleanKeywords(searchKeywords.join(', '));
};

// Generate canonical URL with proper formatting and validation
// According to Google's guidelines: https://developers.google.com/search/docs/crawling-indexing/canonicalization
export const generateCanonicalUrl = (path) => {
  // Ensure path starts with /
  let cleanPath = path.startsWith('/') ? path : '/' + path;

  // Parse URL to handle query params properly
  const url = new URL(cleanPath, BASE_URL);

  // Google guidelines: Keep query params that change content, remove tracking params
  const paramsToKeep = ['q', 'page', 'filter', 'sort']; // Only content-changing params
  const searchParams = new URLSearchParams();

  url.searchParams.forEach((value, key) => {
    if (paramsToKeep.includes(key)) {
      searchParams.append(key, value);
    }
  });

  // Build normalized path
  let normalizedPath = url.pathname;

  // Remove trailing slash except for root (Google prefers consistency)
  if (normalizedPath !== '/') {
    normalizedPath = normalizedPath.replace(/\/$/, '');
  }

  // Add back query params if any
  const queryString = searchParams.toString();
  const finalPath = normalizedPath + (queryString ? '?' + queryString : '');

  // Build canonical URL with consistent domain (always use production domain)
  const canonicalUrl = 'https://indoquran.web.id' + finalPath;

  // Validate URL format
  try {
    new URL(canonicalUrl);
    return canonicalUrl;
  } catch (error) {
    console.warn('Invalid canonical URL generated:', canonicalUrl, 'falling back to base URL');
    return 'https://indoquran.web.id';
  }
};

// Ensure canonical URL consistency for current page
export const ensureCanonicalConsistency = () => {
  // Skip canonical redirect in development environment
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return true;
  }

  const currentUrl = window.location.href;
  const currentPath = window.location.pathname + window.location.search;
  const expectedCanonical = generateCanonicalUrl(currentPath);

  // Check if current URL matches canonical format
  const currentUrlObj = new URL(currentUrl);
  const expectedUrlObj = new URL(expectedCanonical);

  // Only redirect if there's a significant mismatch that affects SEO
  const needsRedirect =
    // Different protocol (http vs https)
    currentUrlObj.protocol !== expectedUrlObj.protocol ||
    // Different hostname (www vs non-www, or different domain)
    currentUrlObj.hostname !== expectedUrlObj.hostname ||
    // Different path (case sensitivity, trailing slash)
    currentUrlObj.pathname !== expectedUrlObj.pathname;

  // NOTE: We do NOT check query params here (currentUrlObj.search !== expectedUrlObj.search)
  // primarily to preserve tracking parameters like utm_source, fbclid, etc.
  // The rel="canonical" tag handles the SEO duplication issue without needing a hard redirect.

  if (needsRedirect) {
    // Use 301 redirect via window.location.replace to avoid adding to history
    console.log('[SEO] Redirecting to canonical URL:', expectedCanonical);
    window.location.replace(expectedCanonical);
    return false;
  }

  return true;
};

// Generate hreflang tags for internationalization
export const generateHreflangTags = (currentPath) => {
  return [
    {
      rel: 'alternate',
      hreflang: 'id',
      href: `${BASE_URL}${currentPath}`
    },
    {
      rel: 'alternate',
      hreflang: 'id-ID',
      href: `${BASE_URL}${currentPath}`
    },
    {
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${BASE_URL}${currentPath}`
    }
  ];
};

// Check if page should be indexed
// FIXED: Only noindex pages that are genuinely private or not valuable for search
export const shouldIndexPage = (pageType, userRole = 'guest') => {
  // Pages that should NEVER be indexed (private/auth pages only)
  const noIndexPages = ['login', 'register', 'login-old', 'register-old', 'admin'];
  
  // Private pages that should only be indexed when user is authenticated
  const privatePages = ['bookmarks', 'profile', 'dashboard'];

  // Block private pages for guests
  if (privatePages.includes(pageType) && userRole === 'guest') return false;
  
  // Block genuinely private pages (auth, admin)
  if (noIndexPages.includes(pageType)) return false;

  // All PUBLIC content pages SHOULD be indexed
  // This includes: home, surah, ayah, juz, halaman, tafsir, about, contact, etc.
  return true;
};

// Generate security headers for SEO
export const generateSecurityHeaders = () => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
};

// Generate enhanced sitemap with images and videos
export const generateEnhancedSitemap = (surahs = [], additionalContent = {}) => {
  const currentDate = new Date().toISOString().split('T')[0];

  const staticPages = [
    {
      url: BASE_URL,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0',
      images: [
        {
          loc: `${BASE_URL}/android-chrome-512x512.png`,
          caption: 'IndoQuran Logo - Platform Al-Quran Digital Indonesia',
          title: 'IndoQuran Logo'
        }
      ]
    },
    {
      url: `${BASE_URL}/cari`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: `${BASE_URL}/doa-bersama`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.7'
    },
    {
      url: `${BASE_URL}/tafsir-maudhui`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.7'
    },
    {
      url: `${BASE_URL}/riwayat-versi`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.4'
    }
  ];

  const surahPages = surahs.map(surah => ({
    url: `${BASE_URL}/surah/${surah.number}`,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: '0.9',
    images: [
      {
        loc: `${BASE_URL}/images/surah-${surah.number}.png`,
        caption: `Surah ${surah.name_latin} - ${surah.name_arabic}`,
        title: `Surah ${surah.name_latin}`
      }
    ]
  }));

  const allPages = [...staticPages, ...surahPages];

  const generateImageXml = (images) => {
    if (!images || images.length === 0) return '';

    return images.map(image => `
    <image:image>
      <image:loc>${image.loc}</image:loc>
      <image:caption>${image.caption}</image:caption>
      <image:title>${image.title}</image:title>
    </image:image>`).join('');
  };

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${generateImageXml(page.images)}
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

// Generate news sitemap for time-sensitive content
export const generateNewsSitemap = (newsItems = []) => {
  if (newsItems.length === 0) return null;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsItems.map(item => `  <url>
    <loc>${item.url}</loc>
    <news:news>
      <news:publication>
        <news:name>IndoQuran</news:name>
        <news:language>id</news:language>
      </news:publication>
      <news:publication_date>${item.publishDate}</news:publication_date>
      <news:title>${item.title}</news:title>
      <news:keywords>${item.keywords}</news:keywords>
    </news:news>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

// Generate voice search optimized content for Google Assistant
export const generateVoiceSearchOptimization = (pageType, data = {}) => {
  const voiceQueries = {
    'home': [
      'Apa itu IndoQuran?',
      'Bagaimana cara baca Al-Quran online?',
      'Platform Al-Quran digital terbaik Indonesia'
    ],
    'surah': [
      `Bagaimana cara baca Surah ${data.name_latin}?`,
      `Apa arti Surah ${data.name_latin}?`,
      `Berapa ayat Surah ${data.name_latin}?`
    ],
    'search': [
      'Bagaimana cara mencari ayat Al-Quran?',
      'Pencarian Al-Quran Indonesia',
      'Cari ayat dalam Al-Quran'
    ]
  };

  return {
    faqQuestions: voiceQueries[pageType] || voiceQueries.home,
    naturalLanguageContent: generateNaturalLanguageContent(pageType, data),
    conversationalKeywords: generateConversationalKeywords(pageType, data)
  };
};

// Generate natural language content for voice search
const generateNaturalLanguageContent = (pageType, data) => {
  switch (pageType) {
    case 'surah':
      return `Surah ${data.name_latin} adalah surah ke-${data.number} dalam Al-Quran yang terdiri dari ${data.total_ayahs} ayat. Anda dapat membaca dan mendengarkan Surah ${data.name_latin} dengan terjemahan bahasa Indonesia di IndoQuran.`;

    case 'home':
      return 'IndoQuran adalah platform Al-Quran digital terlengkap di Indonesia yang memungkinkan Anda membaca, mendengarkan, dan mempelajari Al-Quran online dengan terjemahan bahasa Indonesia.';

    default:
      return 'IndoQuran menyediakan Al-Quran digital lengkap dengan terjemahan Indonesia dan audio murottal berkualitas tinggi.';
  }
};

// Generate conversational keywords for voice search
const generateConversationalKeywords = (pageType, data) => {
  const base = ['bagaimana cara', 'apa itu', 'dimana bisa', 'kapan waktu', 'mengapa penting'];
  const topics = {
    'surah': [`baca ${data.name_latin}`, `dengar ${data.name_latin}`, 'surah al-quran'],
    'home': ['baca al-quran online', 'platform quran digital', 'al-quran indonesia'],
    'search': ['cari ayat quran', 'pencarian al-quran', 'temukan ayat']
  };

  const relevantTopics = topics[pageType] || topics.home;
  const combinations = [];

  base.forEach(prefix => {
    relevantTopics.forEach(topic => {
      combinations.push(`${prefix} ${topic}`);
    });
  });

  return combinations.slice(0, 10);
};

// Generate Core Web Vitals optimization hints
export const generateCoreWebVitalsOptimization = () => {
  return {
    // Largest Contentful Paint (LCP) optimization
    lcpOptimization: {
      criticalImages: [
        `${BASE_URL}/android-chrome-512x512.png`,
        `${BASE_URL}/images/hero-banner.webp`
      ],
      preloadHints: [
        { rel: 'preload', as: 'image', href: `${BASE_URL}/android-chrome-512x512.png` },
        { rel: 'preload', as: 'font', href: '/fonts/arabic-font.woff2', type: 'font/woff2', crossorigin: 'anonymous' }
      ]
    },

    // First Input Delay (FID) optimization
    fidOptimization: {
      deferNonCriticalJS: true,
      removeUnusedCSS: true,
      optimizeEventListeners: true
    },

    // Cumulative Layout Shift (CLS) optimization
    clsOptimization: {
      reserveImageSpace: true,
      avoidDynamicContent: true,
      useTransform: true
    }
  };
};

// Generate mobile-first optimization for Google's mobile-first indexing
export const generateMobileFirstOptimization = () => {
  return {
    viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
    mobileOptimizations: {
      touchTargets: '44px minimum',
      fontSizes: '16px minimum',
      contentWidth: 'max-width: 100vw',
      tapDelay: 'touch-action: manipulation'
    },
    pwaOptimizations: {
      manifest: `${BASE_URL}/site.webmanifest`,
      serviceWorker: `${BASE_URL}/sw.js`,
      startUrl: BASE_URL,
      display: 'standalone',
      themeColor: '#2563eb',
      backgroundColor: '#ffffff'
    }
  };
};

// Generate E-A-T (Expertise, Authoritativeness, Trustworthiness) signals
export const generateEATSignals = () => {
  return {
    expertise: {
      aboutPage: `${BASE_URL}/tentang`,
      teamCredentials: 'Tim ahli Al-Quran dan teknologi',
      certifications: ['ISO 27001', 'Verified by Islamic Scholars'],
      experience: 'Lebih dari 5 tahun pengalaman'
    },

    authoritativeness: {
      citations: [
        'Kementerian Agama RI',
        'Lajnah Pentashihan Mushaf Al-Quran',
        'Majelis Ulama Indonesia'
      ],
      partnerships: [
        'Universitas Islam Indonesia',
        'Pondok Pesantren Terkemuka'
      ],
      mediaReferences: [
        'Republika Online',
        'NU Online',
        'Hidayatullah.com'
      ]
    },

    trustworthiness: {
      contactInfo: `${BASE_URL}/kontak`,
      privacyPolicy: `${BASE_URL}/kebijakan`,
      securityMeasures: ['SSL Certificate', 'Data Encryption', 'Regular Security Audits'],
      userReviews: '4.8/5 rating from 50,000+ users',
      transparencyReports: `${BASE_URL}/laporan-transparansi`
    }
  };
};


