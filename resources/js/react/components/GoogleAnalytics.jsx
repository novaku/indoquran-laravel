import React, { useEffect } from 'react';

/**
 * Google Analytics and SEO Tracking Component
 * Implements Google SEO Starter Guide recommendations for tracking and analytics
 */
function GoogleAnalytics({ 
  measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',
  debug = process.env.NODE_ENV === 'development'
}) {
  
  useEffect(() => {
    // Only load in production or when measurement ID is provided
    if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
      if (debug) {
        console.log('Google Analytics: Measurement ID not configured');
      }
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize Google Analytics
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    
    // Make gtag globally available
    window.gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', measurementId, {
      // Enhanced SEO tracking configuration
      page_title: document.title,
      page_location: window.location.href,
      // Enhanced ecommerce for potential future use
      send_page_view: true,
      // Core Web Vitals tracking
      custom_map: {
        'custom_parameter_1': 'core_web_vitals_lcp',
        'custom_parameter_2': 'core_web_vitals_fid', 
        'custom_parameter_3': 'core_web_vitals_cls'
      },
      // SEO-specific configurations
      anonymize_ip: true, // Privacy compliance
      allow_google_signals: true, // For better audience insights
      allow_ad_personalization_signals: false // Privacy-focused
    });

    // Track Core Web Vitals for SEO insights
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(metric => {
          gtag('event', 'core_web_vitals', {
            'metric_name': 'CLS',
            'metric_value': metric.value,
            'metric_rating': metric.rating
          });
        });

        getFID(metric => {
          gtag('event', 'core_web_vitals', {
            'metric_name': 'FID',
            'metric_value': metric.value,
            'metric_rating': metric.rating
          });
        });

        getFCP(metric => {
          gtag('event', 'core_web_vitals', {
            'metric_name': 'FCP',
            'metric_value': metric.value,
            'metric_rating': metric.rating
          });
        });

        getLCP(metric => {
          gtag('event', 'core_web_vitals', {
            'metric_name': 'LCP',
            'metric_value': metric.value,
            'metric_rating': metric.rating
          });
        });

        getTTFB(metric => {
          gtag('event', 'core_web_vitals', {
            'metric_name': 'TTFB',
            'metric_value': metric.value,
            'metric_rating': metric.rating
          });
        });
      }).catch(error => {
        if (debug) {
          console.log('Web Vitals library not available:', error);
        }
      });
    }

    // Track SEO-relevant user interactions
    const trackSEOEvents = () => {
      // Track search queries
      const searchForms = document.querySelectorAll('form[role="search"], .search-form');
      searchForms.forEach(form => {
        form.addEventListener('submit', (e) => {
          const query = form.querySelector('input[type="search"], input[name="q"]')?.value;
          if (query) {
            gtag('event', 'search', {
              'search_term': query,
              'event_category': 'SEO',
              'event_label': 'Internal Search'
            });
          }
        });
      });

      // Track external link clicks
      const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="indoquran.web.id"])');
      externalLinks.forEach(link => {
        link.addEventListener('click', () => {
          gtag('event', 'click', {
            'event_category': 'External Link',
            'event_label': link.href,
            'transport_type': 'beacon'
          });
        });
      });

      // Track social sharing
      const shareButtons = document.querySelectorAll('[data-share], .share-button');
      shareButtons.forEach(button => {
        button.addEventListener('click', () => {
          const platform = button.dataset.platform || 'unknown';
          gtag('event', 'share', {
            'method': platform,
            'content_type': 'quran_verse',
            'event_category': 'Social'
          });
        });
      });

      // Track audio plays (murottal)
      const audioElements = document.querySelectorAll('audio, [data-audio]');
      audioElements.forEach(audio => {
        audio.addEventListener('play', () => {
          gtag('event', 'play', {
            'event_category': 'Audio',
            'event_label': 'Murottal',
            'value': 1
          });
        });
      });

      // Track bookmarks
      const bookmarkButtons = document.querySelectorAll('[data-bookmark], .bookmark-button');
      bookmarkButtons.forEach(button => {
        button.addEventListener('click', () => {
          gtag('event', 'bookmark', {
            'event_category': 'User Engagement',
            'event_label': 'Ayah Bookmark',
            'value': 1
          });
        });
      });
    };

    // Set up event tracking after DOM is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', trackSEOEvents);
    } else {
      trackSEOEvents();
    }

    // Track page engagement time for SEO insights
    let startTime = Date.now();
    const trackEngagement = () => {
      const engagementTime = Date.now() - startTime;
      if (engagementTime > 10000) { // Only track if user spent more than 10 seconds
        gtag('event', 'page_engagement', {
          'engagement_time_msec': engagementTime,
          'event_category': 'SEO',
          'event_label': window.location.pathname
        });
      }
    };

    window.addEventListener('beforeunload', trackEngagement);
    
    // Also track on visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        trackEngagement();
        startTime = Date.now(); // Reset timer
      }
    });

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', trackEngagement);
      document.removeEventListener('visibilitychange', trackEngagement);
      
      // Remove script if needed
      const existingScript = document.querySelector(`script[src*="${measurementId}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [measurementId, debug]);

  // This component doesn't render anything visible
  return null;
}

export default GoogleAnalytics;

// Helper functions for manual event tracking
export const trackEvent = (eventName, parameters = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackPageView = (url, title) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX', {
      page_path: url,
      page_title: title,
    });
  }
};

export const trackSearch = (query, results = null) => {
  trackEvent('search', {
    'search_term': query,
    'event_category': 'SEO',
    'event_label': 'Internal Search',
    'custom_parameter_1': results ? results.length : 0
  });
};

export const trackSurahRead = (surahName, surahNumber) => {
  trackEvent('surah_read', {
    'event_category': 'Content',
    'event_label': surahName,
    'value': surahNumber
  });
};

export const trackAudioPlay = (surahName, ayahNumber) => {
  trackEvent('audio_play', {
    'event_category': 'Audio',
    'event_label': `${surahName} - Ayat ${ayahNumber}`,
    'value': 1
  });
};
