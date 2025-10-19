/**
 * Core Web Vitals Reporter for Google Analytics 4
 * Mengikuti standar Google Search Console
 * Reference: https://support.google.com/webmasters/answer/9205520
 * 
 * Core Web Vitals yang dilaporkan:
 * - LCP (Largest Contentful Paint): <=2.5s (good), <=4s (needs improvement), >4s (poor)
 * - INP (Interaction to Next Paint): <=200ms (good), <=500ms (needs improvement), >500ms (poor)
 * - CLS (Cumulative Layout Shift): <=0.1 (good), <=0.25 (needs improvement), >0.25 (poor)
 */

/**
 * Get rating based on Google's Core Web Vitals thresholds
 */
function getRating(metricName, value) {
  const thresholds = {
    LCP: { good: 2500, needsImprovement: 4000 },
    INP: { good: 200, needsImprovement: 500 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FCP: { good: 1800, needsImprovement: 3000 },
    TTFB: { good: 800, needsImprovement: 1800 }
  };

  const threshold = thresholds[metricName];
  if (!threshold) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Send Core Web Vitals to Google Analytics 4
 * @param {Object} metric - Web Vitals metric object
 */
export function sendToGoogleAnalytics(metric) {
  const { name, value, rating, delta, id } = metric;

  // Check if gtag is available (Google Analytics 4)
  if (typeof gtag === 'function') {
    // Send to GA4 as recommended by Google
    gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      metric_id: id,
      metric_value: value,
      metric_delta: delta,
      metric_rating: rating || getRating(name, value),
      non_interaction: true,
    });
  }

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Core Web Vitals] ${name}:`, {
      value: Math.round(name === 'CLS' ? value * 1000 : value) / (name === 'CLS' ? 1000 : 1),
      rating: rating || getRating(name, value),
      id
    });
  }
}

/**
 * Send Core Web Vitals to custom endpoint
 * Useful for storing metrics in your own database
 * @param {Object} metric - Web Vitals metric object
 */
export function sendToCustomEndpoint(metric) {
  const { name, value, rating, delta, id, navigationType } = metric;

  const body = JSON.stringify({
    metric_name: name,
    metric_value: value,
    metric_rating: rating || getRating(name, value),
    metric_delta: delta,
    metric_id: id,
    navigation_type: navigationType,
    url: window.location.href,
    user_agent: navigator.userAgent,
    timestamp: Date.now(),
    // Add device info for better analysis
    device_info: {
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      device_pixel_ratio: window.devicePixelRatio || 1,
      connection: navigator.connection ? {
        effective_type: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    }
  });

  // Send to your backend API
  // Using sendBeacon for reliability (works even when page is unloading)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/web-vitals', body);
  } else {
    // Fallback for older browsers
    fetch('/api/web-vitals', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true
    }).catch(console.error);
  }
}

/**
 * Calculate 75th percentile value
 * Google reports values at the 75th percentile of page visits
 * @param {Array} values - Array of metric values
 * @returns {Number} - 75th percentile value
 */
export function calculate75thPercentile(values) {
  if (!values || values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * 0.75) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Store metrics locally for 75th percentile calculation
 * @param {String} metricName - Name of the metric (LCP, INP, CLS)
 * @param {Number} value - Metric value
 */
export function storeMetricLocally(metricName, value) {
  try {
    const storageKey = `cwv_${metricName.toLowerCase()}`;
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Keep only last 100 values to prevent storage bloat
    const updated = [...existing, { value, timestamp: Date.now() }].slice(-100);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    
    // Calculate and log 75th percentile
    const values = updated.map(item => item.value);
    const p75 = calculate75thPercentile(values);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${metricName}] 75th percentile:`, p75);
    }
    
    return p75;
  } catch (error) {
    console.warn('Failed to store metric locally:', error);
    return value;
  }
}

/**
 * Initialize Core Web Vitals reporting
 * Call this function once when your app starts
 */
export function initCoreWebVitalsReporting(options = {}) {
  const {
    sendToGA = true,
    sendToCustom = false,
    reportAllChanges = false
  } = options;

  // Dynamically import web-vitals library
  import('web-vitals').then(({ onLCP, onINP, onCLS, onFCP, onTTFB }) => {
    const handleMetric = (metric) => {
      // Store locally for 75th percentile calculation
      const p75 = storeMetricLocally(metric.name, metric.value);
      
      // Add 75th percentile to metric object
      const enhancedMetric = {
        ...metric,
        p75Value: p75,
        rating: metric.rating || getRating(metric.name, metric.value)
      };

      // Send to Google Analytics
      if (sendToGA) {
        sendToGoogleAnalytics(enhancedMetric);
      }

      // Send to custom endpoint
      if (sendToCustom) {
        sendToCustomEndpoint(enhancedMetric);
      }
    };

    // Track Core Web Vitals (required by Google)
    onLCP(handleMetric, { reportAllChanges });
    onINP(handleMetric, { reportAllChanges });
    onCLS(handleMetric, { reportAllChanges });

    // Track supporting metrics (optional but recommended)
    onFCP(handleMetric, { reportAllChanges });
    onTTFB(handleMetric, { reportAllChanges });

  }).catch((error) => {
    console.warn('Failed to initialize Core Web Vitals reporting:', error);
    console.warn('Make sure to install: npm install web-vitals@4');
  });
}

/**
 * Get current Core Web Vitals summary
 * Useful for debugging and monitoring
 */
export function getCoreWebVitalsSummary() {
  try {
    const metrics = ['lcp', 'inp', 'cls', 'fcp', 'ttfb'];
    const summary = {};

    metrics.forEach(metric => {
      const storageKey = `cwv_${metric}`;
      const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const values = data.map(item => item.value);
      
      if (values.length > 0) {
        const p75 = calculate75thPercentile(values);
        summary[metric.toUpperCase()] = {
          current: values[values.length - 1],
          p75,
          rating: getRating(metric.toUpperCase(), p75),
          sampleSize: values.length
        };
      }
    });

    return summary;
  } catch (error) {
    console.warn('Failed to get Core Web Vitals summary:', error);
    return {};
  }
}

// Export for use in console debugging
if (typeof window !== 'undefined') {
  window.getCoreWebVitalsSummary = getCoreWebVitalsSummary;
}
