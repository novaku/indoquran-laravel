// Core Web Vitals monitoring for PageSpeed optimization
(function() {
  'use strict';
  
  // Performance metrics collection
  const metrics = {
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    navigationTiming: null
  };
  
  // Measure Time to First Byte (TTFB)
  function measureTTFB() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      metrics.ttfb = navigation.responseStart - navigation.requestStart;
      metrics.navigationTiming = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        redirect: navigation.redirectEnd - navigation.redirectStart,
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        connect: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart
      };
    }
  }
  
  // Measure First Contentful Paint (FCP)
  function measureFCP() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;
          observer.disconnect();
          break;
        }
      }
    });
    observer.observe({ entryTypes: ['paint'] });
  }
  
  // Measure Largest Contentful Paint (LCP)
  function measureLCP() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        metrics.lcp = entry.startTime;
      }
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Stop observing after page load
    window.addEventListener('load', () => {
      setTimeout(() => observer.disconnect(), 2000);
    });
  }
  
  // Measure First Input Delay (FID)
  function measureFID() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.processingStart > entry.startTime) {
          metrics.fid = entry.processingStart - entry.startTime;
          observer.disconnect();
          break;
        }
      }
    });
    observer.observe({ entryTypes: ['first-input'] });
  }
  
  // Measure Cumulative Layout Shift (CLS)
  function measureCLS() {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      metrics.cls = clsValue;
    });
    observer.observe({ entryTypes: ['layout-shift'] });
  }
  
  // Get device and network info
  function getDeviceInfo() {
    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1
      },
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      } : null,
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null
    };
  }
  
  // Send metrics to backend or service worker
  function sendMetrics() {
    const deviceInfo = getDeviceInfo();
    const perfData = {
      ...metrics,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      pageLoadTime: performance.now(),
      ...deviceInfo
    };
    
    // Send to service worker if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PERFORMANCE_DATA',
        payload: perfData
      });
    }
    
    // Also try to send directly to backend
    if (navigator.sendBeacon) {
      const data = JSON.stringify(perfData);
      navigator.sendBeacon('/api/performance-metrics', data);
    } else {
      fetch('/api/performance-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(perfData),
        keepalive: true
      }).catch(() => {
        // Silent fail for performance metrics
      });
    }
  }
  
  // Initialize all measurements
  function init() {
    measureTTFB();
    measureFCP();
    measureLCP();
    measureFID();
    measureCLS();
    
    // Send metrics after page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(sendMetrics, 3000);
    });
    
    // Send metrics when leaving the page
    window.addEventListener('beforeunload', sendMetrics);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        sendMetrics();
      }
    });
    
    // Expose metrics for debugging
    if (window.location.search.includes('debug=performance')) {
      window.indoquranMetrics = metrics;
      console.log('Performance metrics:', metrics);
    }
  }
  
  // Start monitoring when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
