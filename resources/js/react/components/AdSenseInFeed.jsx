import React from 'react';
import PropTypes from 'prop-types';
import AdSenseHorizontal from './AdSenseHorizontal';

/**
 * AdSense In-Feed Component (Iklan Sisipan Grid / Feed Ala Detik.com)
 * 
 * Komponen iklan yang didesain khusus untuk menyatu dengan grid kartu konten
 * (seperti di Daftar Surah, Daftar Artikel, Doa Bersama, Asmaul Husna, Hasil Pencarian).
 * 
 * @param {string} adSlot - Ad slot ID dari Google AdSense
 * @param {string} className - Additional CSS classes
 * @param {string} labelText - Teks label iklan (default: 'IKLAN REKOMENDASI')
 */
const AdSenseInFeed = ({ 
    adSlot = '1519827772',
    className = '',
    labelText = 'IKLAN REKOMENDASI'
}) => {
    return (
        <div className={`w-full ${className}`}>
            <div className="h-full min-h-[220px] bg-white dark:bg-gray-900 rounded-xl border border-gray-200/90 dark:border-gray-800 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 select-none">
                        {labelText}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200/60 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                        Ad
                    </span>
                </div>
                <div className="flex-1 flex justify-center items-center p-3 w-full min-h-[160px]">
                    <AdSenseHorizontal
                        adSlot={adSlot}
                        className="w-full"
                        showLabel={false}
                        minHeight="100px"
                    />
                </div>
                <div className="py-1 px-3 bg-gray-50/40 dark:bg-gray-800/30 text-center border-t border-gray-100 dark:border-gray-800/60">
                    <span className="text-[9px] text-gray-400 dark:text-gray-500">
                        Iklan oleh Google AdSense
                    </span>
                </div>
            </div>
        </div>
    );
};

AdSenseInFeed.propTypes = {
    adSlot: PropTypes.string,
    className: PropTypes.string,
    labelText: PropTypes.string
};

export default AdSenseInFeed;
