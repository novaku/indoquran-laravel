import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { generateCanonicalUrl, ensureCanonicalConsistency } from '../utils/seoUtils';

/**
 * Hook to ensure canonical URL consistency according to Google's guidelines
 * Reference: https://developers.google.com/search/docs/crawling-indexing/canonicalization
 * Prevents "Google chose different canonical than user" issues
 * 
 * UPDATED: Now only updates existing server-side canonical tag, doesn't create new ones
 * This prevents duplication with server-side canonical tags in Blade template
 */
export const useCanonicalURL = (manualCanonicalUrl = null) => {
  const location = useLocation();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const currentPath = location.pathname + location.search;
    const canonicalUrl = manualCanonicalUrl || generateCanonicalUrl(currentPath);
    
    // CRITICAL: Only UPDATE existing canonical link, don't create new one
    // Server-side Blade template already renders the initial canonical tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      // Only update if canonical URL has changed to avoid unnecessary DOM manipulation
      if (canonicalLink.href !== canonicalUrl) {
        canonicalLink.href = canonicalUrl;
      }
    } else {
      // If for some reason server-side canonical is missing, log warning but don't create
      console.warn('[SEO] Server-side canonical tag missing - should be in Blade template');
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
