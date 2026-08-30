import React from 'react';
import PropTypes from 'prop-types';
import AdSenseHorizontal from './AdSenseHorizontal';

/**
 * AdSense Inline Component (Sisipan Artikel Ala Detik.com)
 * 
 * Komponen untuk menampilkan iklan inline di sela-sela paragraf artikel atau alur konten.
 * Dilengkapi pembatas halus, label 'IKLAN', dan responsif untuk mobile maupun desktop.
 * 
 * @param {string} adSlot - Ad slot ID dari Google AdSense
 * @param {string} className - Additional CSS classes
 * @param {string} labelText - Label teks di atas iklan (default: 'IKLAN')
 * @param {string} minHeight - Min height container (default: '120px')
 */
const AdSenseInline = ({ 
    adSlot = '1519827772', 
    className = '',
    labelText = 'IKLAN',
    minHeight = '120px'
}) => {
    return (
        <div className={`my-8 w-full max-w-4xl mx-auto ${className}`}>
            <div className="w-full bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 shadow-2xs overflow-hidden transition-colors">
                <div className="flex items-center justify-center gap-2 py-1.5 px-4 bg-gray-100/70 dark:bg-gray-800/80 border-b border-gray-200/60 dark:border-gray-700/60">
                    <span className="h-px w-8 bg-gray-300 dark:bg-gray-600"></span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-400 select-none">
                        {labelText}
                    </span>
                    <span className="h-px w-8 bg-gray-300 dark:bg-gray-600"></span>
                </div>
                <div 
                    className="flex justify-center items-center p-2 sm:p-4 w-full"
                    style={{ minHeight }}
                >
                    <AdSenseHorizontal
                        adSlot={adSlot}
                        className="w-full"
                        showLabel={false}
                        minHeight="90px"
                    />
                </div>
            </div>
        </div>
    );
};

AdSenseInline.propTypes = {
    adSlot: PropTypes.string,
    className: PropTypes.string,
    labelText: PropTypes.string,
    minHeight: PropTypes.string
};

export default AdSenseInline;
