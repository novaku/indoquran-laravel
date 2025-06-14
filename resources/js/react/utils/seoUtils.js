/**
 * Sitemap utility functions for IndoQuran
 * Domain: my.indoquran.web.id
 */

import { getCorsSafeUrl } from './corsUtils';

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
      url: `${BASE_URL}/search`,
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
      url: `${BASE_URL}/about`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.5'
    },
    {
      url: `${BASE_URL}/contact`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.5'
    },
    {
      url: `${BASE_URL}/privacy`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: '0.3'
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
Disallow: /auth/
Disallow: /profile
Disallow: /bookmarks
Disallow: /api/

# Allow important pages
Allow: /search
Allow: /surah/
Allow: /doa-bersama
Allow: /about
Allow: /contact
Allow: /privacy

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
        'og:url': `${BASE_URL}/search?q=${encodeURIComponent(page.data.query)}`
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
      seoData.canonicalUrl = `${BASE_URL}/search?q=${encodeURIComponent(data.query)}`;
      break;

    case 'about':
      seoData.title = 'Tentang IndoQuran - Platform Al-Quran Digital Indonesia';
      seoData.description = 'Pelajari lebih lanjut tentang IndoQuran, platform Al-Quran digital terdepan di Indonesia. Misi kami adalah memudahkan umat Islam dalam membaca dan mempelajari Al-Quran.';
      seoData.keywords = 'tentang indoquran, al quran digital indonesia, platform quran, teknologi islam';
      seoData.canonicalUrl = `${BASE_URL}/about`;
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

  return seoData;
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
        // Use CORS-safe URL for href attributes
        if (key === 'href') {
          link.setAttribute(key, getCorsSafeUrl(resource[key]));
        } else {
          link.setAttribute(key, resource[key]);
        }
      }
    });
    document.head.appendChild(link);
  });
};

export default {
  generateSitemap,
  generateRobotsTxt,
  generateOpenGraphTags,
  generateTwitterCardTags,
  getPageSEOData,
  preloadCriticalResources,
  BASE_URL
};
