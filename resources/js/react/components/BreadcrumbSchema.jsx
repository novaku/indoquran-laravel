import React from 'react';

/**
 * BreadcrumbSchema Component
 * Implements both visual breadcrumb navigation and schema.org BreadcrumbList markup
 * Helps Google understand site structure and may show breadcrumbs in search results
 */
const BreadcrumbSchema = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  // Generate schema.org BreadcrumbList
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      // Only include item URL if it's not the last item (current page)
      ...(item.url && index < items.length - 1 ? {
        "item": item.url.startsWith('http') 
          ? item.url 
          : `https://indoquran.web.id${item.url}`
      } : {})
    }))
  };

  return (
    <>
      {/* Visual Breadcrumb Navigation */}
      <nav 
        aria-label="breadcrumb" 
        className="breadcrumb-nav mb-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
        itemScope 
        itemType="https://schema.org/BreadcrumbList"
      >
        <ol className="flex flex-wrap items-center space-x-2 text-sm">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {/* Separator */}
              {index > 0 && (
                <li className="text-gray-400 dark:text-gray-600" aria-hidden="true">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
              )}
              
              {/* Breadcrumb Item */}
              <li
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {item.url && index < items.length - 1 ? (
                  // Link for non-current pages
                  <a 
                    href={item.url}
                    itemProp="item"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors"
                  >
                    <span itemProp="name">{item.name}</span>
                  </a>
                ) : (
                  // Text for current page
                  <span 
                    className="text-gray-700 dark:text-gray-300 font-medium"
                    itemProp="name"
                  >
                    {item.name}
                  </span>
                )}
                <meta itemProp="position" content={String(index + 1)} />
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>
      
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
};

/**
 * Helper function to generate breadcrumb items for common pages
 */
export const generateBreadcrumbs = (pageType, data = {}) => {
  const breadcrumbs = [
    { name: 'Beranda', url: '/' }
  ];

  switch (pageType) {
    case 'surah':
      breadcrumbs.push(
        { name: 'Daftar Surah', url: '/surah' },
        { name: `Surat ${data.surahName || data.name || ''}`, url: null }
      );
      break;

    case 'surah-list':
      breadcrumbs.push(
        { name: 'Daftar Surah', url: null }
      );
      break;

    case 'juz':
      if (data.juzNumber) {
        breadcrumbs.push(
          { name: 'Daftar Juz', url: '/juz' },
          { name: `Juz ${data.juzNumber}`, url: null }
        );
      } else {
        breadcrumbs.push(
          { name: 'Daftar Juz', url: null }
        );
      }
      break;

    case 'search':
      breadcrumbs.push(
        { name: 'Pencarian', url: null }
      );
      break;

    case 'asmaul-husna':
      if (data.nameId) {
        breadcrumbs.push(
          { name: '99 Asmaul Husna', url: '/asmaul-husna' },
          { name: data.nameLatin || 'Detail', url: null }
        );
      } else {
        breadcrumbs.push(
          { name: '99 Asmaul Husna', url: null }
        );
      }
      break;

    case 'doa-bersama':
      breadcrumbs.push(
        { name: 'Doa Bersama', url: null }
      );
      break;

    case 'member':
      breadcrumbs.push(
        { name: 'Keuntungan Member', url: null }
      );
      break;

    case 'about':
      breadcrumbs.push(
        { name: 'Tentang Kami', url: null }
      );
      break;

    case 'contact':
      breadcrumbs.push(
        { name: 'Kontak', url: null }
      );
      break;

    case 'privacy':
      breadcrumbs.push(
        { name: 'Kebijakan Privasi', url: null }
      );
      break;

    default:
      // For unknown pages, just return home
      break;
  }

  return breadcrumbs;
};

export default BreadcrumbSchema;
