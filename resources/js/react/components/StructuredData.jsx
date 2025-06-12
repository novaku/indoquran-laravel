import { useEffect } from 'react';

/**
 * StructuredData component for managing JSON-LD structured data
 * Optimized for IndoQuran website with domain my.indoquran.web.id
 */
function StructuredData({ type, data, pageType }) {
  const baseUrl = 'https://my.indoquran.web.id';
  
  useEffect(() => {
    const generateStructuredData = () => {
      switch (type) {
        case 'website':
          return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "IndoQuran",
            "alternateName": "Al-Quran Digital Indonesia",
            "url": baseUrl,
            "description": "Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online dengan terjemahan bahasa Indonesia.",
            "inLanguage": "id",
            "publisher": {
              "@type": "Organization",
              "name": "IndoQuran",
              "url": baseUrl,
              "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/android-chrome-512x512.png`,
                "width": 512,
                "height": 512
              }
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${baseUrl}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            },
            ...data
          };
          
        case 'surah':
        case 'Surah':
          return {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": data.title || `Surah ${data.name_latin || data.name}`,
            "description": data.description || `Baca dan dengarkan Surah ${data.name_latin || data.name} lengkap dengan terjemahan bahasa Indonesia di IndoQuran.`,
            "url": `${baseUrl}/surah/${data.number}`,
            "datePublished": "2024-01-01T00:00:00Z",
            "dateModified": new Date().toISOString(),
            "author": {
              "@type": "Organization",
              "name": "IndoQuran"
            },
            "publisher": {
              "@type": "Organization",
              "name": "IndoQuran",
              "url": baseUrl,
              "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/android-chrome-512x512.png`,
                "width": 512,
                "height": 512
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${baseUrl}/surah/${data.number}`
            },
            "inLanguage": "id",
            "about": {
              "@type": "Thing",
              "name": "Al-Quran",
              "description": "Kitab suci umat Islam"
            },
            "keywords": `Surah ${data.name_latin || data.name}, Al-Quran, terjemahan, audio, murottal, quran indonesia`,
            "articleSection": "Surah",
            "wordCount": data.total_ayahs || 0,
            ...data
          };
          
        case 'SearchResults':
          return {
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            "url": `${baseUrl}/search?q=${encodeURIComponent(data.query || '')}`,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": data.results?.length || 0,
              "itemListElement": data.results?.map((result, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `${baseUrl}/surah/${result.surah_number}/${result.number_in_surah}`,
                "name": `Surah ${result.surah_name_latin} Ayat ${result.number_in_surah}`,
                "description": result.translation_id
              })) || []
            },
            "about": {
              "@type": "Thing",
              "name": `Hasil Pencarian: ${data.query}`,
              "description": `Hasil pencarian untuk "${data.query}" dalam Al-Quran dengan terjemahan bahasa Indonesia.`
            },
            ...data
          };
          
        case 'WebSite':
          return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "IndoQuran - Al-Quran Digital Indonesia",
            "url": baseUrl,
            "description": "Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran secara online dengan terjemahan bahasa Indonesia.",
            "inLanguage": "id",
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${baseUrl}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            },
            ...data
          };
          
        case 'BreadcrumbList':
          return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": data?.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.name,
              "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
            })) || []
          };
          
        case 'organization':
          return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "IndoQuran",
            "alternateName": "Al-Quran Digital Indonesia",
            "url": baseUrl,
            "logo": `${baseUrl}/android-chrome-512x512.png`,
            "description": "Platform Al-Quran Digital terlengkap di Indonesia untuk membaca, mendengar, dan mempelajari Al-Quran secara online.",
            "foundingDate": "2024",
            "areaServed": "Indonesia",
            "serviceType": "Educational Technology",
            "keywords": "al quran digital, quran online, terjemahan quran, murottal, pendidikan islam",
            "sameAs": [
              "https://www.facebook.com/indoquran",
              "https://www.twitter.com/indoquran",
              "https://www.instagram.com/indoquran"
            ],
            ...data
          };
          
        default:
          return {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "url": window.location.href,
            "name": data?.title || document.title,
            "description": data?.description || "IndoQuran - Platform Al-Quran Digital Indonesia",
            "inLanguage": "id",
            "isPartOf": {
              "@type": "WebSite",
              "name": "IndoQuran",
              "url": baseUrl
            },
            ...data
          };
      }
    };

    const structuredData = generateStructuredData();
    
    // Remove existing structured data for this type
    const existingScript = document.querySelector(`script[type="application/ld+json"][data-structured-type="${type}"]`);
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-type', type);
    script.textContent = JSON.stringify(structuredData, null, 2);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector(`script[type="application/ld+json"][data-structured-type="${type}"]`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data, pageType, baseUrl]);

  // This component doesn't render anything
  return null;
}

// Helper function to generate structured data for different page types
export const generatePageStructuredData = (pageType, pageData = {}) => {
  const baseUrl = 'https://my.indoquran.web.id';
  
  const commonData = {
    publisher: {
      "@type": "Organization",
      "name": "IndoQuran",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/android-chrome-512x512.png`,
        "width": 512,
        "height": 512
      }
    },
    inLanguage: "id",
    dateModified: new Date().toISOString()
  };

  switch (pageType) {
    case 'home':
      return {
        type: 'website',
        data: {
          ...commonData,
          mainEntity: {
            "@type": "WebApplication",
            "name": "IndoQuran",
            "applicationCategory": "Educational",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "IDR"
            }
          }
        }
      };
      
    case 'surah-list':
      return {
        type: 'website',
        data: {
          ...commonData,
          mainEntity: {
            "@type": "ItemList",
            "name": "Daftar Surah Al-Quran",
            "description": "Daftar lengkap 114 surah dalam Al-Quran",
            "numberOfItems": 114
          }
        }
      };
      
    default:
      return {
        type: 'website',
        data: commonData
      };
  }
};

export default StructuredData;
