import React, { useEffect } from 'react';

/**
 * Google AdSense Horizontal Ad Component
 * 
 * Komponen untuk menampilkan iklan Google AdSense horizontal (auto)
 * Format iklan: auto (responsive)
 * 
 * @param {string} adSlot - Ad slot ID dari Google AdSense
 * @param {string} className - Additional CSS classes
 */
const AdSenseHorizontal = ({ 
    adSlot = "1519827772",
    className = ""
}) => {
    useEffect(() => {
        try {
            // Load AdSense script only once
            if (!window.adsbygoogle) {
                const script = document.createElement('script');
                script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9994842285785390";
                script.async = true;
                script.crossOrigin = "anonymous";
                document.head.appendChild(script);
            }

            // Push ad to AdSense queue after a short delay
            const timer = setTimeout(() => {
                if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
                    window.adsbygoogle.push({});
                } else {
                    // If adsbygoogle not ready, try again after delay
                    setTimeout(() => {
                        if (window.adsbygoogle) {
                            window.adsbygoogle.push({});
                        }
                    }, 1000);
                }
            }, 100);

            return () => clearTimeout(timer);
        } catch (error) {
            console.error('Error loading AdSense:', error);
        }
    }, []);

    return (
        <ins 
            className={`adsbygoogle ${className}`}
            style={{ display: 'block' }}
            data-ad-client="ca-pub-9994842285785390"
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
        />
    );
};

export default AdSenseHorizontal;
