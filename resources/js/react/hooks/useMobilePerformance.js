import { useState, useEffect } from 'react';

/**
 * Custom hook for mobile performance optimization
 * Detects network conditions, device capabilities, and user preferences
 */
export const useMobilePerformance = () => {
    const [networkInfo, setNetworkInfo] = useState({
        effectiveType: '4g',
        downlink: 10,
        saveData: false,
        isSlowConnection: false
    });

    const [deviceInfo, setDeviceInfo] = useState({
        isLowEndDevice: false,
        deviceMemory: 4,
        hardwareConcurrency: 4,
        isMobile: false
    });

    const [performanceSettings, setPerformanceSettings] = useState({
        enableAnimations: true,
        enablePreloading: true,
        enableServiceWorker: true,
        imageQuality: 85,
        maxCacheSize: 50 * 1024 * 1024 // 50MB
    });

    useEffect(() => {
        // Check network conditions
        const updateNetworkInfo = () => {
            const connection = navigator.connection || 
                            navigator.mozConnection || 
                            navigator.webkitConnection;

            if (connection) {
                const isSlowConnection = 
                    connection.effectiveType === 'slow-2g' ||
                    connection.effectiveType === '2g' ||
                    connection.effectiveType === '3g' ||
                    connection.downlink < 1.5;

                setNetworkInfo({
                    effectiveType: connection.effectiveType || '4g',
                    downlink: connection.downlink || 10,
                    saveData: connection.saveData || false,
                    isSlowConnection
                });
            }
        };

        // Check device capabilities
        const updateDeviceInfo = () => {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
                .test(navigator.userAgent);
            
            const deviceMemory = navigator.deviceMemory || 4;
            const hardwareConcurrency = navigator.hardwareConcurrency || 4;
            
            // Consider device low-end if:
            // - Less than 4GB RAM
            // - Less than 4 CPU cores
            // - Mobile device with limited resources
            const isLowEndDevice = deviceMemory < 4 || 
                                 hardwareConcurrency < 4 ||
                                 (isMobile && deviceMemory < 6);

            setDeviceInfo({
                isLowEndDevice,
                deviceMemory,
                hardwareConcurrency,
                isMobile
            });
        };

        // Update performance settings based on conditions
        const updatePerformanceSettings = () => {
            const connection = navigator.connection;
            const isSlowConnection = networkInfo.isSlowConnection;
            const saveData = connection?.saveData || false;
            const isLowEnd = deviceInfo.isLowEndDevice;

            setPerformanceSettings({
                enableAnimations: !isLowEnd && !saveData,
                enablePreloading: !isSlowConnection && !saveData,
                enableServiceWorker: 'serviceWorker' in navigator,
                imageQuality: isSlowConnection || saveData ? 60 : 85,
                maxCacheSize: isLowEnd ? 25 * 1024 * 1024 : 50 * 1024 * 1024
            });
        };

        updateNetworkInfo();
        updateDeviceInfo();
        updatePerformanceSettings();

        // Listen for network changes
        if ('connection' in navigator) {
            const connection = navigator.connection;
            connection.addEventListener('change', updateNetworkInfo);
            
            return () => {
                connection.removeEventListener('change', updateNetworkInfo);
            };
        }
    }, [networkInfo.isSlowConnection, deviceInfo.isLowEndDevice]);

    // Utility functions for performance optimization
    const shouldPreloadResource = (size = 0) => {
        if (!performanceSettings.enablePreloading) return false;
        if (networkInfo.saveData) return false;
        if (networkInfo.isSlowConnection && size > 100 * 1024) return false; // 100KB limit on slow connections
        return true;
    };

    const getOptimalImageQuality = () => {
        if (networkInfo.saveData) return 50;
        if (networkInfo.isSlowConnection) return 60;
        return performanceSettings.imageQuality;
    };

    const shouldUseAnimations = () => {
        return performanceSettings.enableAnimations && 
               !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    const getOptimalCacheStrategy = () => {
        if (networkInfo.isSlowConnection) return 'cache-first';
        if (deviceInfo.isLowEndDevice) return 'network-first';
        return 'stale-while-revalidate';
    };

    // Throttle expensive operations on low-end devices
    const throttleOperation = (callback, delay = 100) => {
        if (!deviceInfo.isLowEndDevice) {
            return callback;
        }
        
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => callback.apply(null, args), delay);
        };
    };

    return {
        networkInfo,
        deviceInfo,
        performanceSettings,
        shouldPreloadResource,
        getOptimalImageQuality,
        shouldUseAnimations,
        getOptimalCacheStrategy,
        throttleOperation,
        
        // Computed values for easy access
        isSlowConnection: networkInfo.isSlowConnection,
        isLowEndDevice: deviceInfo.isLowEndDevice,
        isMobile: deviceInfo.isMobile,
        saveData: networkInfo.saveData
    };
};

/**
 * Hook for monitoring Core Web Vitals
 */
export const useWebVitals = () => {
    const [vitals, setVitals] = useState({
        lcp: null,
        fid: null,
        cls: null,
        fcp: null,
        ttfb: null
    });

    useEffect(() => {
        // Dynamically import web-vitals only when needed
        import('web-vitals').then(({ onLCP, onFID, onCLS, onFCP, onTTFB }) => {
            onLCP((metric) => {
                setVitals(prev => ({ ...prev, lcp: metric.value }));
                
                // Send to analytics if needed
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'web_vitals', {
                        event_category: 'performance',
                        event_label: 'LCP',
                        value: Math.round(metric.value)
                    });
                }
            });

            onFID((metric) => {
                setVitals(prev => ({ ...prev, fid: metric.value }));
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'web_vitals', {
                        event_category: 'performance',
                        event_label: 'FID',
                        value: Math.round(metric.value)
                    });
                }
            });

            onCLS((metric) => {
                setVitals(prev => ({ ...prev, cls: metric.value }));
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'web_vitals', {
                        event_category: 'performance',
                        event_label: 'CLS',
                        value: Math.round(metric.value * 1000)
                    });
                }
            });

            onFCP((metric) => {
                setVitals(prev => ({ ...prev, fcp: metric.value }));
            });

            onTTFB((metric) => {
                setVitals(prev => ({ ...prev, ttfb: metric.value }));
            });
        }).catch(error => {
            console.warn('Failed to load web-vitals:', error);
        });
    }, []);

    return vitals;
};

export default useMobilePerformance;
