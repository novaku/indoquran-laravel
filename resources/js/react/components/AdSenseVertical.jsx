import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Google AdSense Vertical Ad Component
 * 
 * Komponen untuk menampilkan iklan Google AdSense vertikal
 * Mengikuti best practices dari Google AdSense
 */
const AdSenseVertical = ({ 
    adSlot = '9427110099',
    adClient = 'ca-pub-9994842285785390',
    adFormat = 'auto',
    style = {},
    className = ''
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
                    // Suppress harmless duplicate push errors
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
                minHeight: '280px',
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
                data-ad-format={adFormat}
                data-ad-client={adClient}
                data-ad-slot={adSlot}
                data-full-width-responsive="true"
            />
        </div>
    );
};

AdSenseVertical.propTypes = {
    adSlot: PropTypes.string,
    adClient: PropTypes.string,
    adFormat: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string
};

export default AdSenseVertical;
