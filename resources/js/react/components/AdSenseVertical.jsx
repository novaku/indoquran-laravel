import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Google AdSense Vertical Ad Component
 * 
 * Komponen untuk menampilkan iklan Google AdSense vertikal / sidebar (skyscrapers / medium rectangle)
 * Mengadopsi format sidebar detik.com dengan label "IKLAN", border halus, dan dukungan dark mode.
 * 
 * @param {string} adSlot - Ad slot ID dari Google AdSense (default: 9021708920)
 * @param {string} adClient - Ad client ID dari Google AdSense
 * @param {string} adFormat - Format iklan (default: 'auto')
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles
 * @param {boolean} showLabel - Menampilkan label 'IKLAN' (default: true)
 * @param {string} labelText - Teks label iklan (default: 'IKLAN')
 * @param {boolean} isSticky - Apakah menempel saat scroll di desktop (default: false)
 * @param {string} minHeight - Min height container (default: '250px')
 */
const AdSenseVertical = ({ 
    adSlot = '9021708920',
    adClient = 'ca-pub-9994842285785390',
    adFormat = 'auto',
    style = {},
    className = '',
    showLabel = true,
    labelText = 'IKLAN',
    isSticky = false,
    minHeight = '250px'
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

    const adElement = (
        <ins 
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minWidth: '200px' }}
            data-ad-format={adFormat}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-full-width-responsive="true"
        />
    );

    const containerStyle = {
        minHeight,
        ...style
    };

    return (
        <div className={`w-full ${isSticky ? 'sticky top-24' : ''} ${className}`}>
            <div 
                className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs overflow-hidden transition-all duration-200"
                style={containerStyle}
            >
                {showLabel && (
                    <div className="text-[10px] uppercase tracking-widest text-center text-gray-400 dark:text-gray-500 py-1 font-semibold bg-gray-50/70 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800/80 select-none">
                        {labelText}
                    </div>
                )}
                <div 
                    className="adsense-container w-full overflow-hidden flex justify-center items-center p-3 sm:p-4"
                    style={{ minHeight: showLabel ? `calc(${minHeight} - 24px)` : minHeight }}
                >
                    {adElement}
                </div>
            </div>
        </div>
    );
};

AdSenseVertical.propTypes = {
    adSlot: PropTypes.string,
    adClient: PropTypes.string,
    adFormat: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    showLabel: PropTypes.bool,
    labelText: PropTypes.string,
    isSticky: PropTypes.bool,
    minHeight: PropTypes.string
};

export default AdSenseVertical;
