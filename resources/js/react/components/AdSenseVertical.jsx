import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Google AdSense Vertical Ad Component
 * 
 * Komponen untuk menampilkan iklan Google AdSense vertikal
 * Mengikuti best practices dari Google AdSense
 * 
 * @see https://support.google.com/adsense/answer/9274230
 */
const AdSenseVertical = ({ 
    adSlot = '9427110099',
    adClient = 'ca-pub-9994842285785390',
    adFormat = 'autorelaxed',
    fullWidth = true,
    style = {},
    className = ''
}) => {
    const adRef = useRef(null);
    const hasAdLoaded = useRef(false);

    useEffect(() => {
        // Load AdSense script only once
        if (!hasAdLoaded.current && adRef.current) {
            try {
                // Push ad to AdSense queue
                if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
                    window.adsbygoogle.push({});
                    hasAdLoaded.current = true;
                } else {
                    // If adsbygoogle not ready, try again after delay
                    setTimeout(() => {
                        if (window.adsbygoogle) {
                            window.adsbygoogle.push({});
                            hasAdLoaded.current = true;
                        }
                    }, 500);
                }
            } catch (error) {
                console.error('AdSense loading error:', error);
            }
        }

        // Cleanup on unmount
        return () => {
            hasAdLoaded.current = false;
        };
    }, []);

    return (
        <div 
            className={`adsense-container ${className}`}
            style={{
                minHeight: '320px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem',
                ...style
            }}
        >
            <ins 
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={adClient}
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive={fullWidth.toString()}
            />
        </div>
    );
};

AdSenseVertical.propTypes = {
    adSlot: PropTypes.string,
    adClient: PropTypes.string,
    adFormat: PropTypes.string,
    fullWidth: PropTypes.bool,
    style: PropTypes.object,
    className: PropTypes.string
};

export default AdSenseVertical;
