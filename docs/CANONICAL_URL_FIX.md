# Canonical URL Fix - November 2025

## Problem: Google Chose Different Canonical Than User

**Issue**: Google Search Console mendeteksi bahwa Google memilih canonical URL yang berbeda dari yang kita tentukan. Ini terjadi karena:

### Root Causes Identified:
1. **Duplikasi Canonical Tag** - Ada 2 canonical tags:
   - Server-side di `react.blade.php` menggunakan `{{ url()->current() }}`
   - Client-side di React via `useCanonicalURL` hook
   - Ini menyebabkan race condition dan inconsistency

2. **URL Normalization Tidak Konsisten**:
   - Trailing slash handling tidak konsisten
   - Query parameters tidak difilter dengan benar
   - Domain switching antara localhost dan production

3. **SEOHead Component Duplikasi**:
   - Component ini juga menambahkan canonical tag
   - Konflik dengan useCanonicalURL hook

## Solution Implementation

### 1. Remove Server-Side Canonical Duplication
**File**: `resources/views/react.blade.php`

**Changed**:
```blade
<!-- OLD -->
<link rel="canonical" href="{{ $canonicalUrl ?? url()->current() }}">

<!-- NEW -->
<!-- Canonical URL managed by React client-side for consistency -->
<!-- This prevents duplicate canonical tags and ensures Google sees one consistent canonical URL -->
```

**Reason**: Let React handle canonical URL exclusively untuk prevent race conditions

### 2. Enhanced URL Normalization
**File**: `resources/js/react/utils/seoUtils.js`

**New `generateCanonicalUrl()` function**:
```javascript
export const generateCanonicalUrl = (path) => {
  // Parse URL to handle query params properly
  const url = new URL(cleanPath, BASE_URL);
  
  // Google guidelines: Keep query params that change content, remove tracking params
  const paramsToKeep = ['q', 'page', 'filter', 'sort'];
  const searchParams = new URLSearchParams();
  
  url.searchParams.forEach((value, key) => {
    if (paramsToKeep.includes(key)) {
      searchParams.append(key, value);
    }
  });
  
  // Remove trailing slash except for root
  // Add back only content-changing query params
  // Always use production domain (https://indoquran.web.id)
}
```

**Benefits**:
- ✅ Consistent trailing slash handling
- ✅ Smart query parameter filtering
- ✅ Always uses production domain
- ✅ Follows Google's canonicalization guidelines

### 3. Improved Canonical Consistency Check
**File**: `resources/js/react/utils/seoUtils.js`

**Updated `ensureCanonicalConsistency()`**:
```javascript
export const ensureCanonicalConsistency = () => {
  // Check protocol, hostname, pathname, AND query params
  const needsRedirect = 
    currentUrlObj.protocol !== expectedUrlObj.protocol ||
    currentUrlObj.hostname !== expectedUrlObj.hostname ||
    currentUrlObj.pathname !== expectedUrlObj.pathname ||
    currentUrlObj.search !== expectedUrlObj.search;
  
  if (needsRedirect) {
    // 301 redirect using window.location.replace
    window.location.replace(expectedCanonical);
  }
}
```

**Benefits**:
- ✅ Comprehensive URL comparison
- ✅ Automatic 301 redirect to canonical version
- ✅ Skips in development to avoid disruption

### 4. Optimized useCanonicalURL Hook
**File**: `resources/js/react/hooks/useCanonicalURL.js`

**Improvements**:
```javascript
// Find existing canonical link or create new one
let canonicalLink = document.querySelector('link[rel="canonical"]');
if (!canonicalLink) {
  // Insert after charset meta tag for proper positioning
  const charsetMeta = document.querySelector('meta[charset]');
  if (charsetMeta && charsetMeta.nextSibling) {
    document.head.insertBefore(canonicalLink, charsetMeta.nextSibling);
  }
}

// Only update if canonical URL has changed
if (canonicalLink.href !== canonicalUrl) {
  canonicalLink.href = canonicalUrl;
}
```

**Benefits**:
- ✅ Proper canonical tag positioning in `<head>`
- ✅ Avoids unnecessary DOM manipulation
- ✅ Single source of truth for canonical URL

### 5. SEOHead Component Update
**File**: `resources/js/react/components/SEOHead.jsx`

**Changed**:
```jsx
// OLD
metaTags.push(<link key="canonical" rel="canonical" href={seoDefaults.canonicalUrl} />);

// NEW
// Canonical URL is managed by useCanonicalURL hook to prevent duplication
// Do NOT add canonical tag here - it's handled centrally in App.jsx
```

**Reason**: Centralize canonical management in App.jsx only

## Google Canonicalization Best Practices Applied

Based on: https://developers.google.com/search/docs/crawling-indexing/canonicalization

### ✅ Implemented:
1. **Single Canonical Tag** - Only one `<link rel="canonical">` per page
2. **Absolute URLs** - Always use full URL with protocol and domain
3. **HTTPS Preferred** - Always use `https://indoquran.web.id`
4. **Consistent Domain** - No www vs non-www confusion
5. **Trailing Slash Normalization** - Remove except for root `/`
6. **Query Parameter Filtering** - Keep only content-changing params
7. **Self-Referencing Canonical** - Each page points to itself in canonical form
8. **og:url and twitter:url Sync** - All URL meta tags use same canonical URL

### 🚫 Removed:
1. **Duplicate Canonical Tags** - Removed server-side duplicate
2. **Dynamic url()->current()** - This includes unwanted query params
3. **Inconsistent URL Formats** - Now normalized consistently

## Testing

### Run Test Script:
```bash
./test-canonical-url.sh
```

This tests:
- ✅ Canonical tag presence
- ✅ No duplicate canonical tags
- ✅ Correct canonical URL format
- ✅ Trailing slash normalization
- ✅ Query parameter handling
- ✅ Production domain usage

### Manual Testing Checklist:
1. **Homepage**: `curl -s https://indoquran.web.id | grep canonical`
   - Should show: `<link rel="canonical" href="https://indoquran.web.id">`

2. **Surah Page**: `curl -s https://indoquran.web.id/surah/1 | grep canonical`
   - Should show: `<link rel="canonical" href="https://indoquran.web.id/surah/1">`

3. **Search Page**: `curl -s https://indoquran.web.id/cari?q=allah | grep canonical`
   - Should show: `<link rel="canonical" href="https://indoquran.web.id/cari?q=allah">`

4. **With Tracking Params**: Visit `https://indoquran.web.id?utm_source=test`
   - Canonical should be: `https://indoquran.web.id` (no tracking params)

5. **With Trailing Slash**: Visit `https://indoquran.web.id/surah/1/`
   - Should redirect to: `https://indoquran.web.id/surah/1` (no trailing slash)

### Google Search Console Verification:
1. Wait 24-48 hours after deployment
2. Check **Coverage** report for canonical issues
3. Check **URL Inspection** tool for specific URLs
4. Verify no more "Google chose different canonical than user" errors

## Expected Results

### Before Fix:
```html
<!-- Server rendered -->
<link rel="canonical" href="https://indoquran.web.id/surah/1?utm_source=facebook">

<!-- React updated (race condition) -->
<link rel="canonical" href="https://indoquran.web.id/surah/1">

<!-- OR duplicate tags -->
<link rel="canonical" href="https://indoquran.web.id/surah/1?utm_source=facebook">
<link rel="canonical" href="https://indoquran.web.id/surah/1">
```

### After Fix:
```html
<!-- Single canonical tag, managed by React -->
<link rel="canonical" href="https://indoquran.web.id/surah/1">

<!-- OG and Twitter URLs synced -->
<meta property="og:url" content="https://indoquran.web.id/surah/1">
<meta name="twitter:url" content="https://indoquran.web.id/surah/1">
```

## Deployment Steps

1. **Build Production**:
   ```bash
   ./build-production.sh
   ```

2. **Test Locally**:
   ```bash
   npm run preview
   ./test-canonical-url.sh
   ```

3. **Deploy to Production**:
   ```bash
   ./deploy-production.sh
   ```

4. **Verify in Browser**:
   - Open DevTools → Elements
   - Search for "canonical"
   - Should see exactly ONE canonical tag
   - URL should be normalized (no trailing slash, no tracking params)

5. **Request Google Reindex**:
   - Go to Google Search Console
   - Use URL Inspection tool
   - Request indexing for key pages
   - Monitor Coverage report for improvements

## Monitoring

### Week 1-2:
- Monitor Google Search Console for canonical errors
- Check if "Google chose different canonical" errors decrease
- Verify no new indexing issues appear

### Month 1:
- Should see significant reduction in canonical errors
- Better crawl efficiency (Google not crawling duplicate URLs)
- Improved search rankings (consolidated link equity)

## References
- [Google Canonicalization Guide](https://developers.google.com/search/docs/crawling-indexing/canonicalization)
- [Google Duplicate Content Guide](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Canonical Link Element Specification](https://datatracker.ietf.org/doc/html/rfc6596)

## Related Files
- `resources/views/react.blade.php` - Server-side HTML template
- `resources/js/react/hooks/useCanonicalURL.js` - Canonical URL hook
- `resources/js/react/utils/seoUtils.js` - SEO utility functions
- `resources/js/react/components/SEOHead.jsx` - SEO meta tags component
- `test-canonical-url.sh` - Automated testing script

## Changelog
- **2025-11-07**: Fixed canonical URL duplication and normalization issues
- **2025-11-07**: Added comprehensive testing script
- **2025-11-07**: Updated documentation with Google best practices
