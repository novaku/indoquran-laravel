import { useEffect } from 'react';

/**
 * A component that manages and updates document meta tags for SEO.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.description - Meta description
 * @param {string} props.keywords - Meta keywords
 * @param {string} props.canonicalUrl - Canonical URL
 * @param {string} props.ogImage - Open Graph image URL
 * @param {string} props.ogType - Open Graph type (default: 'website')
 * @param {string} props.author - Page author
 * @param {Object} props.structuredData - JSON-LD structured data
 */
function MetaTags({ 
  title, 
  description, 
  keywords, 
  canonicalUrl, 
  ogImage = 'https://my.indoquran.web.id/android-chrome-512x512.png',
  ogType = 'website',
  author = 'IndoQuran',
  structuredData
}) {
  useEffect(() => {
    const baseUrl = 'https://my.indoquran.web.id';
    
    // Update document title
    if (title) {
      document.title = title;
    }
    
    // Update meta description
    if (description) {
      updateMetaTag('meta[name="description"]', 'content', description);
      updateMetaTag('meta[property="og:description"]', 'content', description);
      updateMetaTag('meta[property="twitter:description"]', 'content', description);
    }
    
    // Update meta keywords
    if (keywords) {
      updateMetaTag('meta[name="keywords"]', 'content', keywords);
    }
    
    // Update author
    if (author) {
      updateMetaTag('meta[name="author"]', 'content', author);
    }
    
    // Update OG title
    if (title) {
      updateMetaTag('meta[property="og:title"]', 'content', title);
      updateMetaTag('meta[property="twitter:title"]', 'content', title);
    }
    
    // Update canonical URL
    if (canonicalUrl) {
      const fullCanonicalUrl = canonicalUrl.startsWith('http') ? canonicalUrl : `${baseUrl}${canonicalUrl}`;
      
      updateLinkTag('link[rel="canonical"]', 'href', fullCanonicalUrl);
      updateMetaTag('meta[property="og:url"]', 'content', fullCanonicalUrl);
      updateMetaTag('meta[property="twitter:url"]', 'content', fullCanonicalUrl);
    }
    
    // Update OG image
    if (ogImage) {
      const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;
      updateMetaTag('meta[property="og:image"]', 'content', fullImageUrl);
      updateMetaTag('meta[property="twitter:image"]', 'content', fullImageUrl);
      updateMetaTag('meta[property="og:image:width"]', 'content', '1200');
      updateMetaTag('meta[property="og:image:height"]', 'content', '630');
      updateMetaTag('meta[property="og:image:type"]', 'content', 'image/png');
    }
    
    // Update Twitter card type for better display
    updateMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
    
    // Update OG type
    if (ogType) {
      updateMetaTag('meta[property="og:type"]', 'content', ogType);
    }
    
    // Update structured data
    if (structuredData) {
      updateStructuredData(structuredData);
    }
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, author, structuredData]);

  // Helper function to update meta tags
  const updateMetaTag = (selector, attribute, value) => {
    const element = document.querySelector(selector);
    if (element) {
      element.setAttribute(attribute, value);
    }
  };

  // Helper function to update link tags
  const updateLinkTag = (selector, attribute, value) => {
    const element = document.querySelector(selector);
    if (element) {
      element.setAttribute(attribute, value);
    }
  };

  // Helper function to update structured data
  const updateStructuredData = (data) => {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"][data-react-meta]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-react-meta', 'true');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  };

  // This component doesn't render anything
  return null;
}

export default MetaTags;
