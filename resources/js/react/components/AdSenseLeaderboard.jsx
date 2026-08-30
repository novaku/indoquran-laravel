import React from 'react';
import PropTypes from 'prop-types';
import AdSenseHorizontal from './AdSenseHorizontal';

/**
 * AdSense Leaderboard Component (Top Billboard Banner Ala Detik.com)
 * 
 * Komponen billboard/leaderboard untuk bagian atas halaman di bawah navbar atau sebelum konten utama.
 * Membantu monetisasi dengan viewability tinggi dan layout shift 0 (Zero CLS).
 * 
 * @param {string} adSlot - Ad slot ID dari Google AdSense
 * @param {string} className - Additional CSS classes
 * @param {string} maxWidth - Max width container (default: 'max-w-7xl')
 * @param {string} labelText - Teks label iklan (default: 'IKLAN')
 */
const AdSenseLeaderboard = ({ 
    adSlot = '1519827772',
    className = '',
    maxWidth = 'max-w-7xl',
    labelText = 'IKLAN'
}) => {
    return (
        <div className={`w-full ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-3 my-2 ${className}`}>
            <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs overflow-hidden transition-all">
                <div className="text-[10px] uppercase tracking-widest text-center text-gray-400 dark:text-gray-500 py-1 font-semibold bg-gray-50/70 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 select-none">
                    {labelText}
                </div>
                <div className="flex justify-center items-center p-2 sm:p-3 w-full" style={{ minHeight: '90px' }}>
                    <AdSenseHorizontal
                        adSlot={adSlot}
                        className="w-full"
                        showLabel={false}
                    />
                </div>
            </div>
        </div>
    );
};

AdSenseLeaderboard.propTypes = {
    adSlot: PropTypes.string,
    className: PropTypes.string,
    maxWidth: PropTypes.string,
    labelText: PropTypes.string
};

export default AdSenseLeaderboard;
