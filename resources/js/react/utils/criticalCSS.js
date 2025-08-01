/**
 * Critical CSS extraction and optimization utilities
 * For PageSpeed Insights optimization
 */

// Critical CSS for above-the-fold content
export const CRITICAL_CSS = `
/* Critical layout styles - inline for FCP optimization */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-display: swap;
  line-height: 1.6;
  scroll-behavior: smooth;
}

/* Critical loading state */
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Critical header styles */
.header-container {
  position: sticky;
  top: 0;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  contain: layout style paint;
}

/* Critical navigation styles */
.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Critical content area */
.main-content {
  min-height: calc(100vh - 64px);
  padding-top: 1rem;
  contain: layout;
}

/* Critical responsive breakpoints */
@media (max-width: 768px) {
  .nav-container {
    height: 56px;
    padding: 0 0.75rem;
  }
  
  .main-content {
    min-height: calc(100vh - 56px);
    padding-top: 0.5rem;
  }
  
  .loading-spinner {
    width: 32px;
    height: 32px;
    border-width: 2px;
  }
}

/* Performance optimizations */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

.animate-optimized {
  will-change: transform, opacity;
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Prevent layout shift for images */
.img-responsive {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Font loading optimization */
@font-face {
  font-family: 'system-ui';
  font-style: normal;
  font-weight: 300 800;
  font-display: swap;
  src: local('system-ui');
}
`;

// Non-critical CSS to be loaded asynchronously
export const NON_CRITICAL_CSS_URLS = [
  '/build/assets/app.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

/**
 * Inject critical CSS into document head
 */
export const injectCriticalCSS = () => {
  if (typeof document === 'undefined') return;
  
  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-critical', 'true');
  styleElement.textContent = CRITICAL_CSS;
  
  // Insert at the beginning of head for highest priority
  const head = document.head || document.getElementsByTagName('head')[0];
  head.insertBefore(styleElement, head.firstChild);
};

/**
 * Load non-critical CSS asynchronously
 */
export const loadNonCriticalCSS = () => {
  if (typeof document === 'undefined') return;
  
  NON_CRITICAL_CSS_URLS.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = function() {
      this.onload = null;
      this.rel = 'stylesheet';
    };
    
    // Fallback for browsers that don't support preload
    const fallback = setTimeout(() => {
      link.rel = 'stylesheet';
    }, 3000);
    
    link.onload = () => {
      clearTimeout(fallback);
      link.rel = 'stylesheet';
    };
    
    document.head.appendChild(link);
  });
};

/**
 * Check if critical CSS is already injected
 */
export const isCriticalCSSInjected = () => {
  if (typeof document === 'undefined') return false;
  return document.querySelector('style[data-critical="true"]') !== null;
};

/**
 * Optimize CSS delivery with media queries
 */
export const optimizeCSSDelivery = () => {
  if (typeof document === 'undefined') return;
  
  // Load print CSS only when needed
  const printLink = document.createElement('link');
  printLink.rel = 'stylesheet';
  printLink.href = '/build/assets/print.css';
  printLink.media = 'print';
  
  // Load high-resolution display CSS only for appropriate screens
  if (window.devicePixelRatio > 1) {
    const retinaLink = document.createElement('link');
    retinaLink.rel = 'stylesheet';
    retinaLink.href = '/build/assets/retina.css';
    retinaLink.media = 'screen and (min-resolution: 2dppx)';
    document.head.appendChild(retinaLink);
  }
  
  document.head.appendChild(printLink);
};

/**
 * Remove unused CSS classes (simple version)
 */
export const removeUnusedCSS = () => {
  if (typeof document === 'undefined' || process.env.NODE_ENV !== 'production') return;
  
  // Mark commonly unused utility classes for removal
  const unusedSelectors = [
    '.hidden',
    '.invisible',
    '.opacity-0'
  ];
  
  unusedSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (getComputedStyle(el).display === 'none') {
        el.remove();
      }
    });
  });
};

/**
 * Initialize CSS optimizations
 */
export const initializeCSSOptimizations = () => {
  // Inject critical CSS immediately
  if (!isCriticalCSSInjected()) {
    injectCriticalCSS();
  }
  
  // Load non-critical CSS after critical rendering
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      requestIdleCallback(() => {
        loadNonCriticalCSS();
        optimizeCSSDelivery();
      }, { timeout: 2000 });
    });
  } else {
    requestIdleCallback(() => {
      loadNonCriticalCSS();
      optimizeCSSDelivery();
    }, { timeout: 1000 });
  }
  
  // Clean up unused CSS after page load
  window.addEventListener('load', () => {
    setTimeout(removeUnusedCSS, 5000);
  });
};

export default {
  CRITICAL_CSS,
  NON_CRITICAL_CSS_URLS,
  injectCriticalCSS,
  loadNonCriticalCSS,
  isCriticalCSSInjected,
  optimizeCSSDelivery,
  removeUnusedCSS,
  initializeCSSOptimizations
};
