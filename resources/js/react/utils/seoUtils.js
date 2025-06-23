/**
 * Comprehensive SEO Utility Functions for IndoQuran
 * Domain: my.indoquran.web.id
 * 
 * Features:
 * - Sitemap generation (regular, enhanced with images, news)
 * - Robots.txt generation
 * - Open Graph and Twitter Card meta tags
 * - Structured data (JSON-LD) for rich snippets
 * - SEO-optimized titles and descriptions
 * - Breadcrumb and FAQ structured data
 * - Hreflang tags for internationalization
 * - Security headers for SEO
 * - Critical resource preloading
 * 
 * Updated: 2025-06-23
 */

const BASE_URL = 'https://my.indoquran.web.id';

// Generate sitemap XML for all pages
export const generateSitemap = (surahs = []) => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  const staticPages = [
    {
      url: BASE_URL,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      url: `${BASE_URL}/cari`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: `${BASE_URL}/surah`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: `${BASE_URL}/juz`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.7'
    },
    {
      url: `${BASE_URL}/halaman`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.7'
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
      url: `${BASE_URL}/tentang`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.5'
    },
    {
      url: `${BASE_URL}/kontak`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.5'
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
      priority: '0.3'
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
    priority: '0.9'
  }));

  const allPages = [...staticPages, ...surahPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

// Generate robots.txt content
export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /

# Disallow private pages
Disallow: /masuk
Disallow: /daftar
Disallow: /profil
Disallow: /penanda
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /login
Disallow: /register

# Allow important pages
Allow: /cari
Allow: /surah/
Allow: /juz/
Allow: /halaman/
Allow: /doa-bersama
Allow: /tafsir-maudhui
Allow: /tentang
Allow: /kontak
Allow: /donasi
Allow: /kebijakan
Allow: /riwayat-versi

# Crawl delay (optional)
Crawl-delay: 1

# Sitemap location
Sitemap: ${BASE_URL}/sitemap.xml

# Additional guidelines for search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /`;
};

// Generate Open Graph meta tags for social media
export const generateOpenGraphTags = (page) => {
  const defaultOG = {
    'og:site_name': 'IndoQuran',
    'og:locale': 'id_ID',
    'og:type': 'website',
    'og:image': `${BASE_URL}/android-chrome-512x512.png`,
    'og:image:width': '512',
    'og:image:height': '512',
    'og:image:type': 'image/png'
  };

  switch (page.type) {
    case 'home':
      return {
        ...defaultOG,
        'og:title': 'IndoQuran - Al-Quran Digital Indonesia',
        'og:description': 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia.',
        'og:url': BASE_URL
      };

    case 'surah':
      return {
        ...defaultOG,
        'og:type': 'article',
        'og:title': `Surah ${page.data.name_latin} - IndoQuran`,
        'og:description': `Baca dan dengarkan Surah ${page.data.name_latin} lengkap dengan terjemahan bahasa Indonesia. ${page.data.total_ayahs} ayat.`,
        'og:url': `${BASE_URL}/surah/${page.data.number}`,
        'article:author': 'IndoQuran',
        'article:section': 'Al-Quran'
      };

    case 'search':
      return {
        ...defaultOG,
        'og:title': `Hasil Pencarian "${page.data.query}" - IndoQuran`,
        'og:description': `Temukan ayat Al-Quran yang Anda cari di IndoQuran. Pencarian: "${page.data.query}"`,
        'og:url': `${BASE_URL}/cari?q=${encodeURIComponent(page.data.query)}`
      };

    case 'doa-bersama':
      return {
        ...defaultOG,
        'og:title': 'Doa Bersama - IndoQuran',
        'og:description': 'Bergabunglah dalam doa bersama dengan umat Islam di seluruh Indonesia. Fitur doa bersama real-time di IndoQuran.',
        'og:url': `${BASE_URL}/doa-bersama`
      };

    case 'tafsir-maudhui':
      return {
        ...defaultOG,
        'og:title': 'Tafsir Maudhu\'i - IndoQuran',
        'og:description': 'Tafsir Al-Quran berdasarkan tema-tema tertentu. Pelajari Al-Quran secara tematik dan mendalam.',
        'og:url': `${BASE_URL}/tafsir-maudhui`
      };

    case 'contact':
      return {
        ...defaultOG,
        'og:title': 'Hubungi Kami - IndoQuran',
        'og:description': 'Hubungi tim IndoQuran untuk pertanyaan, saran, atau dukungan teknis. Kami siap membantu Anda.',
        'og:url': `${BASE_URL}/kontak`
      };

    case 'about':
      return {
        ...defaultOG,
        'og:title': 'Tentang IndoQuran - Platform Al-Quran Digital Indonesia',
        'og:description': 'Pelajari lebih lanjut tentang IndoQuran, platform Al-Quran digital terdepan di Indonesia untuk membaca dan mempelajari Al-Quran.',
        'og:url': `${BASE_URL}/tentang`
      };

    case 'donation':
      return {
        ...defaultOG,
        'og:title': 'Donasi - IndoQuran',
        'og:description': 'Dukung pengembangan IndoQuran dengan berdonasi. Kontribusi Anda membantu kami menyediakan platform Al-Quran yang lebih baik.',
        'og:url': `${BASE_URL}/donasi`
      };

    case 'privacy':
      return {
        ...defaultOG,
        'og:title': 'Kebijakan Privasi - IndoQuran',
        'og:description': 'Baca kebijakan privasi IndoQuran. Kami berkomitmen melindungi data pribadi pengguna dan menjaga keamanan informasi Anda.',
        'og:url': `${BASE_URL}/kebijakan`
      };

    default:
      return defaultOG;
  }
};

// Generate Twitter Card meta tags
export const generateTwitterCardTags = (page) => {
  const defaultTwitter = {
    'twitter:card': 'summary_large_image',
    'twitter:site': '@indoquran',
    'twitter:creator': '@indoquran',
    'twitter:image': `${BASE_URL}/android-chrome-512x512.png`
  };

  const ogTags = generateOpenGraphTags(page);
  
  return {
    ...defaultTwitter,
    'twitter:title': ogTags['og:title'],
    'twitter:description': ogTags['og:description'],
    'twitter:url': ogTags['og:url']
  };
};

// SEO utility to get page-specific meta data
export const getPageSEOData = (pageType, data = {}) => {
  const seoData = {
    title: '',
    description: '',
    keywords: '',
    canonicalUrl: '',
    openGraph: {},
    twitter: {},
    structuredData: null
  };

  switch (pageType) {
    case 'home':
      seoData.title = 'IndoQuran - Al-Quran Digital Indonesia';
      seoData.description = 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia, fitur bookmark, pencarian ayat, dan audio murottal berkualitas tinggi.';
      seoData.keywords = 'al quran indonesia, quran online, al quran digital, baca quran, terjemahan quran, murottal, quran indonesia, ayat al quran, surah quran, indoquran';
      seoData.canonicalUrl = BASE_URL;
      break;

    case 'surah':
      seoData.title = `Surah ${data.name_latin} (${data.name_arabic}) - IndoQuran`;
      seoData.description = `Baca dan dengarkan Surah ${data.name_latin} lengkap dengan terjemahan bahasa Indonesia. Surah ke-${data.number} dalam Al-Quran yang terdiri dari ${data.total_ayahs} ayat.`;
      seoData.keywords = `Surah ${data.name_latin}, ${data.name_arabic}, al quran surah ${data.number}, terjemahan surah ${data.name_latin}, murottal ${data.name_latin}`;
      seoData.canonicalUrl = `${BASE_URL}/surah/${data.number}`;
      break;

    case 'search':
      seoData.title = `Hasil Pencarian "${data.query}" - IndoQuran`;
      seoData.description = `Hasil pencarian Al-Quran untuk "${data.query}". Temukan ayat dan surah yang sesuai dengan pencarian Anda di IndoQuran.`;
      seoData.keywords = `pencarian quran, cari ayat, ${data.query}, al quran indonesia`;
      seoData.canonicalUrl = `${BASE_URL}/cari?q=${encodeURIComponent(data.query)}`;
      break;

    case 'about':
      seoData.title = 'Tentang IndoQuran - Platform Al-Quran Digital Indonesia';
      seoData.description = 'Pelajari lebih lanjut tentang IndoQuran, platform Al-Quran digital terdepan di Indonesia. Misi kami adalah memudahkan umat Islam dalam membaca dan mempelajari Al-Quran.';
      seoData.keywords = 'tentang indoquran, al quran digital indonesia, platform quran, teknologi islam';
      seoData.canonicalUrl = `${BASE_URL}/tentang`;
      break;

    case 'contact':
      seoData.title = 'Hubungi Kami - IndoQuran';
      seoData.description = 'Hubungi tim IndoQuran untuk pertanyaan, saran, atau dukungan teknis. Kami siap membantu Anda dalam menggunakan platform Al-Quran digital.';
      seoData.keywords = 'kontak indoquran, hubungi kami, dukungan teknis, customer service';
      seoData.canonicalUrl = `${BASE_URL}/kontak`;
      break;

    case 'doa-bersama':
      seoData.title = 'Doa Bersama - IndoQuran';
      seoData.description = 'Bergabunglah dalam doa bersama dengan umat Islam di seluruh Indonesia. Fitur doa bersama real-time untuk memperkuat ukhuwah islamiyah.';
      seoData.keywords = 'doa bersama, doa islam, ukhuwah islamiyah, doa online';
      seoData.canonicalUrl = `${BASE_URL}/doa-bersama`;
      break;

    case 'tafsir-maudhui':
      seoData.title = 'Tafsir Maudhu\'i - IndoQuran';
      seoData.description = 'Tafsir Al-Quran berdasarkan tema-tema tertentu. Pelajari Al-Quran secara tematik dan pahami pesan-pesan Al-Quran dengan lebih mendalam.';
      seoData.keywords = 'tafsir maudhui, tafsir tematik, tema al quran, tafsir indonesia';
      seoData.canonicalUrl = `${BASE_URL}/tafsir-maudhui`;
      break;

    case 'donation':
      seoData.title = 'Donasi - IndoQuran';
      seoData.description = 'Dukung pengembangan IndoQuran dengan berdonasi. Kontribusi Anda membantu kami menyediakan platform Al-Quran digital yang lebih baik untuk umat Islam.';
      seoData.keywords = 'donasi indoquran, donasi platform islam, dukung pengembangan, kontribusi';
      seoData.canonicalUrl = `${BASE_URL}/donasi`;
      break;

    case 'bookmarks':
      seoData.title = 'Bookmark Ayat - IndoQuran';
      seoData.description = 'Simpan dan kelola ayat-ayat Al-Quran favorit Anda. Akses mudah ke ayat yang telah Anda bookmark untuk dibaca kembali.';
      seoData.keywords = 'bookmark quran, simpan ayat, penanda ayat, favorit quran';
      seoData.canonicalUrl = `${BASE_URL}/penanda`;
      break;

    case 'privacy':
      seoData.title = 'Kebijakan Privasi - IndoQuran';
      seoData.description = 'Baca kebijakan privasi IndoQuran. Kami berkomitmen melindungi data pribadi pengguna dan menjaga keamanan informasi Anda.';
      seoData.keywords = 'kebijakan privasi, privacy policy, keamanan data, perlindungan data';
      seoData.canonicalUrl = `${BASE_URL}/kebijakan`;
      break;

    default:
      seoData.title = 'IndoQuran - Al-Quran Digital Indonesia';
      seoData.description = 'Platform Al-Quran Digital terlengkap di Indonesia';
      seoData.keywords = 'al quran indonesia, quran online, indoquran';
      seoData.canonicalUrl = BASE_URL;
  }

  // Generate Open Graph and Twitter tags
  seoData.openGraph = generateOpenGraphTags({ type: pageType, data });
  seoData.twitter = generateTwitterCardTags({ type: pageType, data });
  
  // Generate structured data
  seoData.structuredData = generateStructuredData(pageType, data);

  return seoData;
};

// Generate structured data (JSON-LD) for better SEO
export const generateStructuredData = (pageType, data = {}) => {
  const baseOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "IndoQuran",
    "description": "Platform Al-Quran Digital terlengkap di Indonesia",
    "url": BASE_URL,
    "logo": `${BASE_URL}/android-chrome-512x512.png`,
    "sameAs": [
      "https://facebook.com/indoquran",
      "https://twitter.com/indoquran",
      "https://instagram.com/indoquran"
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
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${BASE_URL}/cari?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      };

    case 'surah':
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": `Surah ${data.name_latin} - IndoQuran`,
        "description": `Baca dan dengarkan Surah ${data.name_latin} lengkap dengan terjemahan bahasa Indonesia.`,
        "image": `${BASE_URL}/android-chrome-512x512.png`,
        "author": {
          "@type": "Organization",
          "name": "IndoQuran"
        },
        "publisher": baseOrganization,
        "datePublished": new Date().toISOString(),
        "dateModified": new Date().toISOString(),
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${BASE_URL}/surah/${data.number}`
        },
        "articleSection": "Al-Quran",
        "keywords": [`Surah ${data.name_latin}`, data.name_arabic, "Al-Quran", "Quran Indonesia"]
      };

    case 'search':
      return {
        "@context": "https://schema.org",
        "@type": "SearchResultsPage",
        "name": `Hasil Pencarian "${data.query}" - IndoQuran`,
        "description": `Hasil pencarian Al-Quran untuk "${data.query}"`,
        "url": `${BASE_URL}/cari?q=${encodeURIComponent(data.query)}`,
        "publisher": baseOrganization
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

// Function to preload critical resources (only actually used ones)
export const preloadCriticalResources = () => {
  const resources = [
    // Only preload resources that are actually used immediately
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { rel: 'dns-prefetch', href: 'https://api.quran.com' }
  ];

  // Add preconnect for production domain if in development
  if (process.env.NODE_ENV === 'development') {
    resources.push({ rel: 'preconnect', href: 'https://my.indoquran.web.id' });
    
    // Also add a preload for the proxy endpoint
    resources.push({ rel: 'preconnect', href: window.location.origin + '/proxy-assets' });
  }

  resources.forEach(resource => {
    const link = document.createElement('link');
    Object.keys(resource).forEach(key => {
      if (key === 'crossorigin' && resource[key]) {
        link.setAttribute(key, resource[key]);
      } else if (key !== 'crossorigin') {
        link.setAttribute(key, resource[key]);
      }
    });
    
    // Avoid duplicate preload resources
    const existingLink = document.querySelector(`link[href="${resource.href}"][rel="${resource.rel}"]`);
    if (!existingLink) {
      document.head.appendChild(link);
    }
  });
};

// Generate meta description with optimal length
export const generateOptimalMetaDescription = (description, maxLength = 160) => {
  if (description.length <= maxLength) return description;
  
  const truncated = description.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
};

// Generate page title with optimal length
export const generateOptimalTitle = (title, siteName = 'IndoQuran', maxLength = 60) => {
  const separator = ' - ';
  const fullTitle = title + separator + siteName;
  
  if (fullTitle.length <= maxLength) return fullTitle;
  
  const availableSpace = maxLength - separator.length - siteName.length;
  const truncatedTitle = title.substring(0, availableSpace - 3) + '...';
  
  return truncatedTitle + separator + siteName;
};

// Validate and clean keywords
export const cleanKeywords = (keywords) => {
  if (typeof keywords === 'string') {
    return keywords
      .split(',')
      .map(keyword => keyword.trim().toLowerCase())
      .filter(keyword => keyword.length > 0 && keyword.length <= 50)
      .slice(0, 10) // Limit to 10 keywords
      .join(', ');
  }
  return '';
};

// Generate canonical URL with proper formatting
export const generateCanonicalUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return BASE_URL + cleanPath;
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
export const shouldIndexPage = (pageType, userRole = 'guest') => {
  const noIndexPages = ['login', 'register', 'profile', 'dashboard', 'admin'];
  const privatePages = ['bookmarks', 'profile', 'dashboard'];
  
  if (noIndexPages.includes(pageType)) return false;
  if (privatePages.includes(pageType) && userRole === 'guest') return false;
  
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

export default {
  generateSitemap,
  generateRobotsTxt,
  generateOpenGraphTags,
  generateTwitterCardTags,
  getPageSEOData,
  preloadCriticalResources,
  BASE_URL,
  generateStructuredData,
  generateBreadcrumbStructuredData,
  generateFAQStructuredData,
  generateOptimalMetaDescription,
  generateOptimalTitle,
  cleanKeywords,
  generateCanonicalUrl,
  generateHreflangTags,
  shouldIndexPage,
  generateSecurityHeaders,
  generateEnhancedSitemap,
  generateNewsSitemap
};
