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
 */
function MetaTags({ 
  title, 
  description, 
  keywords, 
  canonicalUrl, 
  ogImage = '/android-chrome-512x512.png',
  ogType = 'website'
}) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }
    
    // Update meta description
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
      
      // Update OG description
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', description);
      }
      
      // Update Twitter description
      const twitterDescription = document.querySelector('meta[property="twitter:description"]');
      if (twitterDescription) {
        twitterDescription.setAttribute('content', description);
      }
    }
    
    // Update meta keywords
    if (keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      }
    }
    
    // Update OG title
    if (title) {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', title);
      }
      
      // Update Twitter title
      const twitterTitle = document.querySelector('meta[property="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', title);
      }
    }
    
    // Update canonical URL
    if (canonicalUrl) {
      let canonicalElement = document.querySelector('link[rel="canonical"]');
      if (canonicalElement) {
        canonicalElement.setAttribute('href', canonicalUrl);
      }
      
      // Update OG URL
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) {
        ogUrl.setAttribute('content', canonicalUrl);
      }
      
      // Update Twitter URL
      const twitterUrl = document.querySelector('meta[property="twitter:url"]');
      if (twitterUrl) {
        twitterUrl.setAttribute('content', canonicalUrl);
      }
    }
    
    // Update OG image
    if (ogImage) {
      const ogImageElement = document.querySelector('meta[property="og:image"]');
      if (ogImageElement) {
        ogImageElement.setAttribute('content', ogImage);
      }
      
      // Update Twitter image
      const twitterImage = document.querySelector('meta[property="twitter:image"]');
      if (twitterImage) {
        twitterImage.setAttribute('content', ogImage);
      }
    }
    
    // Update OG type
    if (ogType) {
      const ogTypeElement = document.querySelector('meta[property="og:type"]');
      if (ogTypeElement) {
        ogTypeElement.setAttribute('content', ogType);
      }
    }
  }, [title, description, keywords, canonicalUrl, ogImage, ogType]);

  // This component doesn't render anything
  return null;
}

export default MetaTags;
