import React from 'react';

/**
 * Component to add structured data (JSON-LD) for SEO
 * 
 * @param {Object} props
 * @param {string} props.type - The type of structured data (e.g., 'Surah', 'Article', 'FAQPage')
 * @param {Object} props.data - The data to include in the structured data
 */
function StructuredData({ type, data }) {
    let jsonLD = {};
    
    // Set up JSON-LD based on the type
    switch (type) {
        case 'Surah':
            jsonLD = {
                "@context": "https://schema.org",
                "@type": "Book",
                "name": `Surah ${data.name_latin} (${data.name_arabic})`,
                "author": {
                    "@type": "Organization",
                    "name": "Al-Quran"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "IndoQuran",
                    "url": "https://my.indoquran.web.id"
                },
                "description": data.description_short ? 
                    data.description_short.replace(/<[^>]*>/g, '') : 
                    `Surah ${data.name_latin} adalah surah ke-${data.number} dalam Al-Quran yang terdiri dari ${data.total_ayahs} ayat.`,
                "inLanguage": "id",
                "numberOfPages": data.total_ayahs,
                "url": `https://my.indoquran.web.id/surah/${data.number}`,
                "position": data.number
            };
            break;
        
        case 'SearchResults':
            jsonLD = {
                "@context": "https://schema.org",
                "@type": "SearchResultsPage",
                "mainEntity": {
                    "@type": "ItemList",
                    "itemListElement": data.results.map((result, index) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "url": `https://my.indoquran.web.id/surah/${result.surah_number}/${result.number_in_surah}`,
                        "item": {
                            "@type": "CreativeWork",
                            "name": `Surah ${result.surah_name_latin} Ayat ${result.number_in_surah}`,
                            "description": result.translation_id
                        }
                    }))
                },
                "about": {
                    "@type": "Thing",
                    "name": `Hasil Pencarian: ${data.query}`,
                    "description": `Hasil pencarian untuk "${data.query}" dalam Al-Quran dengan terjemahan bahasa Indonesia.`
                }
            };
            break;
            
        case 'WebSite':
            jsonLD = {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "IndoQuran - Al-Quran Digital Indonesia",
                "url": "https://my.indoquran.web.id/",
                "description": "Baca, dengar, dan pelajari Al-Quran secara online dengan terjemahan bahasa Indonesia",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": "https://my.indoquran.web.id/search?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                }
            };
            break;
            
        case 'BreadcrumbList':
            jsonLD = {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": data.map((item, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": item.name,
                    "item": item.url
                }))
            };
            break;
            
        default:
            return null;
    }
    
    return (
        <script 
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
        />
    );
}

export default StructuredData;
