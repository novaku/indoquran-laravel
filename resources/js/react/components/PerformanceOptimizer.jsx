import { useEffect } from 'react';

/**
 * Component to optimize Core Web Vitals, specifically targeting CLS reduction
 */
const PerformanceOptimizer = () => {
    useEffect(() => {
        // Optimize Cumulative Layout Shift (CLS)
        const optimizeCLS = () => {
            // 1. Reserve space for images and iframes
            const optimizeImages = () => {
                const images = document.querySelectorAll('img:not([width]):not([height])');
                images.forEach(img => {
                    if (!img.dataset.optimized) {
                        // Add default dimensions to prevent layout shift
                        img.style.minHeight = '200px';
                        img.style.backgroundColor = '#f3f4f6';
                        img.dataset.optimized = 'true';
                        
                        img.onload = () => {
                            img.style.minHeight = '';
                            img.style.backgroundColor = '';
                        };
                    }
                });
            };

            // 2. Optimize font loading to prevent FOIT/FOUT
            const optimizeFonts = () => {
                if (document.fonts && document.fonts.ready) {
                    document.fonts.ready.then(() => {
                        document.documentElement.classList.add('fonts-loaded');
                    });
                }
            };

            // 3. Minimize DOM changes during initial load
            const optimizeInitialRender = () => {
                // Batch DOM updates
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => {
                        optimizeImages();
                        optimizeFonts();
                    });
                } else {
                    setTimeout(() => {
                        optimizeImages();
                        optimizeFonts();
                    }, 100);
                }
            };

            optimizeInitialRender();
        };

        // Optimize First Contentful Paint (FCP)
        const optimizeFCP = () => {
            // 1. Preconnect to external domains
            const preconnectDomains = [
                'https://fonts.googleapis.com',
                'https://fonts.gstatic.com'
            ];

            preconnectDomains.forEach(domain => {
                const link = document.createElement('link');
                link.rel = 'preconnect';
                link.href = domain;
                link.crossOrigin = 'anonymous';
                if (!document.querySelector(`link[href="${domain}"]`)) {
                    document.head.appendChild(link);
                }
            });

            // 2. Critical CSS inlining flag
            document.documentElement.classList.add('critical-css-loaded');
        };

        // Optimize Largest Contentful Paint (LCP)
        const optimizeLCP = () => {
            // 1. Preload critical images
            const criticalImages = document.querySelectorAll('img[data-critical="true"]');
            criticalImages.forEach(img => {
                if (img.src) {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.as = 'image';
                    link.href = img.src;
                    document.head.appendChild(link);
                }
            });

            // 2. Optimize viewport images
            const viewportImages = document.querySelectorAll('img');
            viewportImages.forEach(img => {
                if (img.getBoundingClientRect().top < window.innerHeight) {
                    img.loading = 'eager';
                    img.fetchPriority = 'high';
                }
            });
        };

        // Execute optimizations
        optimizeCLS();
        optimizeFCP();
        
        // Delay LCP optimization to avoid blocking critical path
        setTimeout(optimizeLCP, 100);

        // Monitor and report Core Web Vitals (development only)
        if (process.env.NODE_ENV === 'development') {
            import('web-vitals').then(({ getCLS, getFCP, getLCP, getFID, getTTFB }) => {
                getCLS(console.log);
                getFCP(console.log);
                getLCP(console.log);
                getFID(console.log);
                getTTFB(console.log);
            }).catch(() => {
                // Fallback if web-vitals is not available
                console.log('Web Vitals monitoring not available');
            });
        }

        // Cleanup function
        return () => {
            // Remove event listeners if any were added
        };
    }, []);

    return null; // This component doesn't render anything
};

export default PerformanceOptimizer;
