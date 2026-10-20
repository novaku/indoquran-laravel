/**
 * Utility functions for text processing, HTML entity decoding, and excerpt formatting.
 */

const NAMED_ENTITY_MAP = {
  '&lsquo;': '‘',
  '&rsquo;': '’',
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&sbquo;': '‚',
  '&bdquo;': '„',
  '&laquo;': '«',
  '&raquo;': '»',
  '&quot;': '"',
  '&#039;': "'",
  '&#39;': "'",
  '&apos;': "'",
  '&ndash;': '–',
  '&mdash;': '—',
  '&hellip;': '…',
  '&bull;': '•',
  '&trade;': '™',
  '&copy;': '©',
  '&reg;': '®',
  '&nbsp;': ' ',
  '&amp;': '&',
};

/**
 * Decode HTML entities in a string (e.g., &lsquo; -> ‘, &rsquo; -> ’, &amp; -> &).
 * Handles double-encoded entities (e.g., &amp;lsquo;) and numeric entities.
 */
export const decodeHtmlEntities = (text) => {
  if (!text || typeof text !== 'string') return '';

  let str = text;

  // Browser environment: use textarea for native decoding
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = str;
      str = textarea.value;

      // Handle double-encoded entities if still present (e.g. &amp;lsquo; -> &lsquo; -> ‘)
      if (str.includes('&') && /&[a-zA-Z0-9#]+;/.test(str)) {
        textarea.innerHTML = str;
        str = textarea.value;
      }
    } catch (e) {
      // Fallback to manual replacement if DOM operation fails
    }
  }

  // Fallback regex replacement for common named entities
  str = str.replace(
    /&(?:lsquo|rsquo|ldquo|rdquo|sbquo|bdquo|laquo|raquo|quot|#039|#39|apos|ndash|mdash|hellip|bull|trade|copy|reg|nbsp|amp);/g,
    (match) => NAMED_ENTITY_MAP[match] || match
  );

  return str;
};

/**
 * Strip HTML tags from a string and decode HTML entities,
 * returning clean plain text suitable for meta tags, captions, and tooltips.
 */
export const stripHtml = (text) => {
  if (!text || typeof text !== 'string') return '';
  const withoutTags = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  return decodeHtmlEntities(withoutTags);
};

/**
 * Format article excerpt for HTML display:
 * 1. Decodes HTML entities (e.g. &lsquo; and &rsquo; become ‘ and ’)
 * 2. Preserves safe HTML formatting if present, or returns decoded text
 */
export const formatExcerptHtml = (excerpt) => {
  if (!excerpt) return '';
  const trimmed = String(excerpt).trim();
  return decodeHtmlEntities(trimmed);
};
