import { useEffect } from 'react';
import { useMobilePerformance, useWebVitals } from '../hooks/useMobilePerformance';

/**
 * Performance Analytics component for monitoring mobile performance
 * Tracks Core Web Vitals and sends data to analytics
 */
const PerformanceAnalytics = () => {
    const { isSlowConnection, isLowEndDevice, saveData } = useMobilePerformance();
    const vitals = useWebVitals();

    useEffect(() => {
        // Track page load performance
        const trackPagePerformance = () => {
            if (typeof window.performance === 'undefined') return;

            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');

            const metrics = {
                // Navigation timing
                dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
                tcp_connection: navigation.connectEnd - navigation.connectStart,
                server_response: navigation.responseStart - navigation.requestStart,
                dom_processing: navigation.domComplete - navigation.responseEnd,
                page_load: navigation.loadEventEnd - navigation.navigationStart,
                
                // Paint timing
                first_paint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                
                // Device and network info
                is_slow_connection: isSlowConnection,
                is_low_end_device: isLowEndDevice,
                save_data_enabled: saveData,
                
                // Viewport info
                viewport_width: window.innerWidth,
                viewport_height: window.innerHeight,
                device_pixel_ratio: window.devicePixelRatio || 1,
                
                // Memory info (if available)
                memory_used: performance.memory?.usedJSHeapSize || 0,
                memory_total: performance.memory?.totalJSHeapSize || 0,
                memory_limit: performance.memory?.jsHeapSizeLimit || 0,
                
                // Timestamp
                timestamp: Date.now(),
                page_url: window.location.pathname
            };

            // Send to analytics service
            sendPerformanceData('page_load', metrics);
        };

        // Track Core Web Vitals when available
        if (vitals.lcp !== null) {
            sendPerformanceData('core_web_vitals', {
                lcp: vitals.lcp,
                fid: vitals.fid,
                cls: vitals.cls,
                fcp: vitals.fcp,
                ttfb: vitals.ttfb,
                is_slow_connection: isSlowConnection,
                is_low_end_device: isLowEndDevice,
                timestamp: Date.now(),
                page_url: window.location.pathname
            });
        }

        // Track resource loading performance
        const trackResourcePerformance = () => {
            const resources = performance.getEntriesByType('resource');
            const slowResources = resources.filter(resource => resource.duration > 1000);
            
            if (slowResources.length > 0) {
                sendPerformanceData('slow_resources', {
                    count: slowResources.length,
                    resources: slowResources.map(r => ({
                        name: r.name,
                        duration: r.duration,
                        size: r.transferSize || 0,
                        type: r.initiatorType
                    })),
                    timestamp: Date.now()
                });
            }
        };

        // Delay tracking to ensure page is fully loaded
        const timeoutId = setTimeout(() => {
            trackPagePerformance();
            trackResourcePerformance();
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [isSlowConnection, isLowEndDevice, saveData, vitals]);

    // Track user interactions that might affect performance
    useEffect(() => {
        const trackUserInteraction = (event) => {
            // Track clicks on slow connections to understand UX impact
            if (isSlowConnection) {
                sendPerformanceData('user_interaction', {
                    type: event.type,
                    target: event.target.tagName,
                    timestamp: Date.now(),
                    is_slow_connection: true
                });
            }
        };

        const events = ['click', 'scroll', 'keydown'];
        events.forEach(event => {
            document.addEventListener(event, trackUserInteraction, { passive: true });
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, trackUserInteraction);
            });
        };
    }, [isSlowConnection]);

    // Track errors that might affect performance
    useEffect(() => {
        const trackError = (event) => {
            sendPerformanceData('javascript_error', {
                message: event.error?.message || 'Unknown error',
                filename: event.filename || 'Unknown',
                line: event.lineno || 0,
                column: event.colno || 0,
                timestamp: Date.now(),
                user_agent: navigator.userAgent,
                is_mobile: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)
            });
        };

        const trackUnhandledRejection = (event) => {
            sendPerformanceData('promise_rejection', {
                reason: event.reason?.toString() || 'Unknown rejection',
                timestamp: Date.now()
            });
        };

        window.addEventListener('error', trackError);
        window.addEventListener('unhandledrejection', trackUnhandledRejection);

        return () => {
            window.removeEventListener('error', trackError);
            window.removeEventListener('unhandledrejection', trackUnhandledRejection);
        };
    }, []);

    return null; // This component doesn't render anything
};

/**
 * Send performance data to analytics
 */
const sendPerformanceData = (event, data) => {
    try {
        // Send to Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', event, {
                event_category: 'performance',
                custom_map: data,
                non_interaction: true
            });
        }

        // Send to internal analytics endpoint
        if (navigator.sendBeacon) {
            const payload = JSON.stringify({
                event,
                data,
                timestamp: Date.now(),
                page: window.location.pathname
            });

            navigator.sendBeacon('/api/analytics/performance', payload);
        } else {
            // Fallback for browsers without sendBeacon
            fetch('/api/analytics/performance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event,
                    data,
                    timestamp: Date.now(),
                    page: window.location.pathname
                }),
                keepalive: true
            }).catch(error => {
                // Silently fail for analytics to not affect user experience
                console.debug('Analytics failed:', error);
            });
        }
    } catch (error) {
        // Silently fail for analytics
        console.debug('Performance tracking failed:', error);
    }
};

export default PerformanceAnalytics;
