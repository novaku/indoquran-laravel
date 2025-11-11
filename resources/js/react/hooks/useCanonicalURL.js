import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { generateCanonicalUrl, ensureCanonicalConsistency } from '../utils/seoUtils';

/**
 * Hook to ensure canonical URL consistency according to Google's guidelines
 * Reference: https://developers.google.com/search/docs/crawling-indexing/canonicalization
 * Prevents "Google chose different canonical than user" issues
 */
export const useCanonicalURL = (manualCanonicalUrl = null) => {
  const location = useLocation();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const currentPath = location.pathname + location.search;
    const canonicalUrl = manualCanonicalUrl || generateCanonicalUrl(currentPath);
    
    // Find existing canonical link or create new one
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      // Insert after charset meta tag for proper positioning
      const charsetMeta = document.querySelector('meta[charset]');
      if (charsetMeta && charsetMeta.nextSibling) {
        document.head.insertBefore(canonicalLink, charsetMeta.nextSibling);
      } else {
        document.head.insertBefore(canonicalLink, document.head.firstChild);
      }
    }
    
    // Only update if canonical URL has changed to avoid unnecessary DOM manipulation
    if (canonicalLink.href !== canonicalUrl) {
      canonicalLink.href = canonicalUrl;
    }

    // Ensure URL consistency (only in production to avoid dev disruptions)
    if (process.env.NODE_ENV === 'production') {
      ensureCanonicalConsistency();
    }

    // Update Open Graph URL
    let ogUrlMeta = document.querySelector('meta[property="og:url"]');
    if (!ogUrlMeta) {
      ogUrlMeta = document.createElement('meta');
      ogUrlMeta.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrlMeta);
    }
    if (ogUrlMeta.content !== canonicalUrl) {
      ogUrlMeta.content = canonicalUrl;
    }

    // Update Twitter URL
    let twitterUrlMeta = document.querySelector('meta[name="twitter:url"]');
    if (!twitterUrlMeta) {
      twitterUrlMeta = document.createElement('meta');
      twitterUrlMeta.name = 'twitter:url';
      document.head.appendChild(twitterUrlMeta);
    }
    if (twitterUrlMeta.content !== canonicalUrl) {
      twitterUrlMeta.content = canonicalUrl;
    }

  }, [location.pathname, location.search, manualCanonicalUrl]);

  return {
    canonicalUrl: manualCanonicalUrl || generateCanonicalUrl(location.pathname + location.search)
  };
};

export default useCanonicalURL;
