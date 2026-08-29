import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Google AdSense Horizontal Ad Component
 * 
 * Komponen untuk menampilkan iklan Google AdSense horizontal (auto/responsive)
 * Format iklan: auto (responsive)
 * 
 * @param {string} adSlot - Ad slot ID dari Google AdSense
 * @param {string} adClient - Ad client ID dari Google AdSense
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles
 */
const AdSenseHorizontal = ({ 
    adSlot = '1519827772',
    adClient = 'ca-pub-9994842285785390',
    className = '',
    style = {}
}) => {
    const adRef = useRef(null);
    const isPushedRef = useRef(false);

    useEffect(() => {
        if (!isPushedRef.current && adRef.current) {
            const status = adRef.current.getAttribute('data-adsbygoogle-status');
            if (!status) {
                try {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                    isPushedRef.current = true;
                } catch (error) {
                    // Suppress harmless duplicate push errors during fast route switches
                }
            }
        }

        return () => {
            isPushedRef.current = false;
        };
    }, []);

    return (
        <div 
            className={`adsense-container ${className}`}
            style={{
                minHeight: '90px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0.5rem',
                ...style
            }}
        >
            <ins 
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={adClient}
                data-ad-slot={adSlot}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    );
};

AdSenseHorizontal.propTypes = {
    adSlot: PropTypes.string,
    adClient: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object
};

export default AdSenseHorizontal;
