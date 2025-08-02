import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { generateCanonicalUrl, ensureCanonicalConsistency } from '../utils/seoUtils';

/**
 * Hook to ensure canonical URL consistency according to Google's guidelines
 * Prevents "Google chose different canonical than user" issues
 */
export const useCanonicalURL = (manualCanonicalUrl = null) => {
  const location = useLocation();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const currentPath = location.pathname + location.search;
    const canonicalUrl = manualCanonicalUrl || generateCanonicalUrl(currentPath);
    
    // Update canonical link tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

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
    ogUrlMeta.content = canonicalUrl;

    // Update Twitter URL
    let twitterUrlMeta = document.querySelector('meta[name="twitter:url"]');
    if (!twitterUrlMeta) {
      twitterUrlMeta = document.createElement('meta');
      twitterUrlMeta.name = 'twitter:url';
      document.head.appendChild(twitterUrlMeta);
    }
    twitterUrlMeta.content = canonicalUrl;

  }, [location.pathname, location.search, manualCanonicalUrl]);

  return {
    canonicalUrl: manualCanonicalUrl || generateCanonicalUrl(location.pathname + location.search)
  };
};

export default useCanonicalURL;
