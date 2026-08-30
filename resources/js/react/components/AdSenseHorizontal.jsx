import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Google AdSense Horizontal Ad Component
 * 
 * Komponen untuk menampilkan iklan Google AdSense horizontal (auto/responsive)
 * Kompatibel dengan semua ukuran layar (mobile, tablet, desktop)
 * Mengadopsi styling portal berita modern (detik.com) dengan label minimalis & zero-CLS.
 * 
 * @param {string} adSlot - Ad slot ID dari Google AdSense
 * @param {string} adClient - Ad client ID dari Google AdSense
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles
 * @param {boolean} showLabel - Menampilkan label 'IKLAN'
 * @param {string} labelText - Teks label iklan (default: 'IKLAN')
 * @param {string} minHeight - Min height container (default: '90px')
 */
const AdSenseHorizontal = ({ 
    adSlot = '1519827772',
    adClient = 'ca-pub-9994842285785390',
    className = '',
    style = {},
    showLabel = false,
    labelText = 'IKLAN',
    minHeight = '90px'
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

    const content = (
        <ins 
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minWidth: '250px' }}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
        />
    );

    if (showLabel) {
        return (
            <div className={`w-full ${className}`}>
                <div 
                    className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-2xs overflow-hidden transition-colors"
                    style={style}
                >
                    <div className="text-[10px] uppercase tracking-widest text-center text-gray-400 dark:text-gray-500 py-1 font-semibold bg-gray-50/70 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800/80 select-none">
                        {labelText}
                    </div>
                    <div 
                        className="adsense-container w-full overflow-hidden flex justify-center items-center p-2 sm:p-3"
                        style={{ minHeight }}
                    >
                        {content}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`adsense-container w-full overflow-hidden ${className}`}
            style={{
                minHeight,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0.25rem',
                ...style
            }}
        >
            {content}
        </div>
    );
};

AdSenseHorizontal.propTypes = {
    adSlot: PropTypes.string,
    adClient: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    showLabel: PropTypes.bool,
    labelText: PropTypes.string,
    minHeight: PropTypes.string
};

export default AdSenseHorizontal;
