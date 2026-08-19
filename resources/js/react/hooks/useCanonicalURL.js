import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { generateCanonicalUrl } from '../utils/seoUtils';

/**
 * Hook to ensure canonical URL consistency according to Google's guidelines
 * Reference: https://developers.google.com/search/docs/crawling-indexing/canonicalization
 * 
 * FIXED to prevent:
 * 1. Duplicate content issues (removes trailing slashes, normalizes query params)
 * 2. "Google chose different canonical than user" errors
 * 3. Multiple canonical tags
 * 4. Canonical URL mismatches with Open Graph
 */
export const useCanonicalURL = (manualCanonicalUrl = null) => {
  const location = useLocation();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const currentPath = location.pathname + location.search;
    
    // Normalize path: remove trailing slashes and sort query parameters
    let normalizedPath = location.pathname;
    if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
      normalizedPath = normalizedPath.slice(0, -1);
    }
    
    // Normalize query parameters (sort for consistency)
    // Use encodeURIComponent (%20) instead of URLSearchParams.toString() (+) for space encoding
    // This ensures canonical URLs match crawled URLs (prevents 'Alternate page' GSC issue)
    let normalizedSearch = '';
    if (location.search) {
      const params = new URLSearchParams(location.search);
      const sortedEntries = [...params.entries()].sort();
      const encodedQuery = sortedEntries
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      if (encodedQuery) {
        normalizedSearch = '?' + encodedQuery;
      }
    }
    
    const normalizedUrl = normalizedPath + normalizedSearch;
    const canonicalUrl = manualCanonicalUrl || generateCanonicalUrl(normalizedUrl);
    
    // Remove all existing canonical links first to prevent duplicates
    const existingCanonicals = document.querySelectorAll('link[rel="canonical"]');
    existingCanonicals.forEach(el => {
      if (!el.dataset.managed) {
        el.remove();
      }
    });
    
    // Find or create canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"][data-managed="true"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.setAttribute('data-managed', 'true');
      // Insert at the beginning of head for proper parsing
      document.head.insertBefore(canonicalLink, document.head.firstChild);
    }
    
    // Only update if canonical URL has changed to avoid unnecessary DOM manipulation
    if (canonicalLink.href !== canonicalUrl) {
      canonicalLink.href = canonicalUrl;
    }

    // Canonical URL is updated in the DOM head without forcing hard browser redirects

    // Update Open Graph URL to match canonical
    let ogUrlMeta = document.querySelector('meta[property="og:url"]');
    if (!ogUrlMeta) {
      ogUrlMeta = document.createElement('meta');
      ogUrlMeta.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrlMeta);
    }
    if (ogUrlMeta.content !== canonicalUrl) {
      ogUrlMeta.content = canonicalUrl;
    }

    // Update Twitter URL to match canonical
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
