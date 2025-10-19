import { useEffect, useCallback, useRef } from 'react';

/**
 * Enhanced Performance Monitoring Hook
 * Tracks detailed performance metrics and provides optimization suggestions
 */
export const useAdvancedPerformanceMonitor = (config = {}) => {
  const {
    trackLCP = true,
    trackINP = true, // INP replaces FID as of March 2024
    trackCLS = true,
    trackTTFB = true,
    trackCustomMetrics = true,
    logToConsole = process.env.NODE_ENV === 'development',
    onMetric = null
  } = config;

  const metricsRef = useRef({});

  // Log metric utility
  const logMetric = useCallback((name, value, rating = 'good') => {
    const metric = {
      name,
      value,
      rating,
      timestamp: Date.now(),
      url: window.location.href
    };

    metricsRef.current[name] = metric;

    if (logToConsole) {
      const color = rating === 'good' ? 'green' : rating === 'needs-improvement' ? 'orange' : 'red';
      console.log(`%c${name}: ${value}ms (${rating})`, `color: ${color}; font-weight: bold`);
    }

    if (onMetric) {
      onMetric(metric);
    }

    // Send to analytics (could be Google Analytics, custom endpoint, etc.)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        metric_name: name,
        metric_value: value,
        metric_rating: rating
      });
    }
  }, [logToConsole, onMetric]);

  // Get rating based on Google's Core Web Vitals thresholds
  // https://support.google.com/webmasters/answer/9205520
  const getRating = useCallback((value, goodThreshold, needsImprovementThreshold) => {
    if (value <= goodThreshold) return 'good';
    if (value <= needsImprovementThreshold) return 'needs-improvement';
    return 'poor';
  }, []);

  // Track Largest Contentful Paint (LCP)
  useEffect(() => {
    if (!trackLCP || !('PerformanceObserver' in window)) return;

    let lcpValue = 0;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          lcpValue = entry.startTime;
          const rating = getRating(lcpValue, 2500, 4000);
          logMetric('LCP', Math.round(lcpValue), rating);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observation not supported');
    }

    return () => observer.disconnect();
  }, [trackLCP, logMetric, getRating]);

  // Track Interaction to Next Paint (INP) - Replaces FID
  // INP measures responsiveness by observing all interactions during page visit
  useEffect(() => {
    if (!trackINP || !('PerformanceObserver' in window)) return;

    let worstInp = 0;
    const interactions = [];

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        // INP tracks all interactions (click, tap, keyboard)
        if (entry.entryType === 'event' || entry.entryType === 'first-input') {
          const interactionTime = entry.processingStart 
            ? entry.processingStart - entry.startTime 
            : entry.duration;
          
          interactions.push(interactionTime);
          
          // INP reports the longest interaction (excluding outliers)
          // Sort and get 75th percentile (or highest value)
          const sortedInteractions = [...interactions].sort((a, b) => b - a);
          const p75Index = Math.max(0, Math.ceil(sortedInteractions.length * 0.75) - 1);
          worstInp = sortedInteractions[p75Index] || worstInp;
          
          // Google thresholds for INP: <=200ms (good), <=500ms (needs improvement), >500ms (poor)
          const rating = getRating(worstInp, 200, 500);
          logMetric('INP', Math.round(worstInp), rating);
        }
      });
    });

    try {
      // Observe all interaction events
      observer.observe({ 
        entryTypes: ['event', 'first-input'],
        buffered: true 
      });
    } catch (e) {
      // Fallback to first-input for older browsers
      try {
        observer.observe({ entryTypes: ['first-input'], buffered: true });
      } catch (err) {
        console.warn('INP/FID observation not supported');
      }
    }

    return () => observer.disconnect();
  }, [trackINP, logMetric, getRating]);

  // Track Cumulative Layout Shift (CLS)
  useEffect(() => {
    if (!trackCLS || !('PerformanceObserver' in window)) return;

    let clsValue = 0;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observation not supported');
    }

    // Report CLS on page visibility change
    const reportCLS = () => {
      const rating = getRating(clsValue, 0.1, 0.25);
      logMetric('CLS', Math.round(clsValue * 1000) / 1000, rating);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        reportCLS();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, [trackCLS, logMetric, getRating]);

  // Track Time to First Byte (TTFB)
  useEffect(() => {
    if (!trackTTFB || !('performance' in window)) return;

    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry) {
      const ttfbValue = navigationEntry.responseStart - navigationEntry.requestStart;
      const rating = getRating(ttfbValue, 600, 1500);
      logMetric('TTFB', Math.round(ttfbValue), rating);
    }
  }, [trackTTFB, logMetric, getRating]);

  // Track custom performance metrics
  useEffect(() => {
    if (!trackCustomMetrics || !('performance' in window)) return;

    // Track resource loading performance
    const trackResourceMetrics = () => {
      const resources = performance.getEntriesByType('resource');
      
      // Group resources by type
      const resourceTypes = {
        scripts: resources.filter(r => r.name.includes('.js')),
        styles: resources.filter(r => r.name.includes('.css')),
        images: resources.filter(r => /\.(jpg|jpeg|png|gif|webp|svg)/.test(r.name)),
        fonts: resources.filter(r => /\.(woff|woff2|ttf|otf)/.test(r.name))
      };

      // Calculate metrics for each type
      Object.entries(resourceTypes).forEach(([type, typeResources]) => {
        if (typeResources.length > 0) {
          const totalSize = typeResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
          const avgLoadTime = typeResources.reduce((sum, r) => sum + r.duration, 0) / typeResources.length;
          
          if (logToConsole) {
            console.log(`${type.toUpperCase()} - Count: ${typeResources.length}, Size: ${Math.round(totalSize/1024)}KB, Avg Load: ${Math.round(avgLoadTime)}ms`);
          }
        }
      });

      // Track DOM metrics
      const domMetrics = {
        domElements: document.querySelectorAll('*').length,
        domDepth: getDOMDepth(),
        scriptsCount: document.querySelectorAll('script').length,
        stylesheetsCount: document.querySelectorAll('link[rel="stylesheet"]').length
      };

      if (logToConsole) {
        console.log('DOM Metrics:', domMetrics);
      }

      // Track memory usage if available
      if ('memory' in performance) {
        const memoryInfo = {
          usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
          totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
          jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
        };

        if (logToConsole) {
          console.log('Memory Usage:', memoryInfo);
        }
      }
    };

    // Delay tracking to ensure all resources are loaded
    const timer = setTimeout(trackResourceMetrics, 3000);
    return () => clearTimeout(timer);
  }, [trackCustomMetrics, logToConsole]);

  // Get current metrics
  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  // Get performance suggestions
  const getOptimizationSuggestions = useCallback(() => {
    const metrics = getMetrics();
    const suggestions = [];

    if (metrics.LCP?.rating !== 'good') {
      suggestions.push({
        metric: 'LCP',
        suggestion: 'Optimize largest contentful paint by compressing images, using proper image formats (WebP), and implementing lazy loading.'
      });
    }

    if (metrics.INP?.rating !== 'good') {
      suggestions.push({
        metric: 'INP',
        suggestion: 'Improve interaction responsiveness by optimizing JavaScript execution, reducing main thread blocking, using code splitting, and deferring non-critical scripts. Target: <=200ms for good rating.'
      });
    }

    if (metrics.CLS?.rating !== 'good') {
      suggestions.push({
        metric: 'CLS',
        suggestion: 'Reduce cumulative layout shift by setting explicit dimensions for images and videos, avoiding dynamic content insertion.'
      });
    }

    if (metrics.TTFB?.rating !== 'good') {
      suggestions.push({
        metric: 'TTFB',
        suggestion: 'Improve time to first byte by optimizing server response times, using CDN, and implementing proper caching strategies.'
      });
    }

    return suggestions;
  }, [getMetrics]);

  return {
    getMetrics,
    getOptimizationSuggestions,
    logMetric
  };
};

// Helper function to calculate DOM depth
function getDOMDepth(element = document.body, depth = 0) {
  let maxDepth = depth;
  
  for (const child of element.children) {
    const childDepth = getDOMDepth(child, depth + 1);
    maxDepth = Math.max(maxDepth, childDepth);
  }
  
  return maxDepth;
}

export default useAdvancedPerformanceMonitor;
